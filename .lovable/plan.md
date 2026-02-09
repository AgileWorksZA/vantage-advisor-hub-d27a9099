

# Create Restricted User with US-Only Jurisdiction Access

## Overview
Create a new user `nico@advizorstack.com` who is locked to the US jurisdiction only. The jurisdiction selector (flag icon) will be visible but non-interactive for this user, always showing the US flag. All US advisors and clients will be accessible.

## Changes

### 1. Database Migration: Create `user_jurisdictions` table

A new table to store which jurisdictions each user is allowed to access. When a user has rows in this table, they are restricted to only those jurisdictions. Users with no rows have unrestricted access (backwards compatible with all existing users).

```sql
CREATE TABLE public.user_jurisdictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  jurisdiction_code text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, jurisdiction_code)
);

ALTER TABLE public.user_jurisdictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own jurisdictions"
  ON public.user_jurisdictions FOR SELECT
  USING (auth.uid() = user_id);
```

No INSERT/UPDATE/DELETE policies for regular users -- jurisdictions are managed by admins only (via service role or direct SQL).

### 2. Edge Function: `create-restricted-user`

A one-time-use edge function that:
- Creates the user `nico@advizorstack.com` with the specified password using the Supabase Admin API (service role)
- Auto-confirms the email so the user can log in immediately
- Creates a profile row (first_name: "Nico", surname: "Admin")
- Inserts a row into `user_jurisdictions` restricting them to "US"

This function uses the service role key to bypass RLS and create the user programmatically.

### 3. New Hook: `src/hooks/useUserJurisdictions.ts`

A hook that:
- Fetches the current user's allowed jurisdictions from `user_jurisdictions`
- Returns `{ allowedJurisdictions, isRestricted, loading }`
- `isRestricted` is `true` when the user has one or more rows (restricting them)
- `allowedJurisdictions` is the array of jurisdiction codes (e.g. `["US"]`)
- Returns `isRestricted: false` when no rows exist (unrestricted -- all existing users)

### 4. Update `RegionContext.tsx`

- Import and use the `useUserJurisdictions` hook
- On load, if the user is restricted:
  - Force `selectedRegion` to the first (or only) allowed jurisdiction
  - Override `setSelectedRegion` to no-op for restricted users (prevents code from changing it)
- Expose `isJurisdictionRestricted` and `allowedJurisdictions` via context so components can read them

### 5. Update `RegionSelector.tsx`

- Read `isJurisdictionRestricted` from the region context
- When `isJurisdictionRestricted` is `true`:
  - Render the flag icon as a static element (no Popover, no click handler)
  - Apply `cursor-default` styling instead of `cursor-pointer`
  - Optionally show a tooltip: "Your account is restricted to [jurisdiction name]"

### 6. Update `AdvisorFilter.tsx` (no functional change needed)

The advisor filter already works per-jurisdiction. Since the US jurisdiction is force-selected and locked, the advisor filter will naturally show only US advisors. No changes needed here.

## Technical Details

### Edge Function Implementation (`supabase/functions/create-restricted-user/index.ts`)

```typescript
// Uses supabaseAdmin.auth.admin.createUser() with:
// - email: "nico@advizorstack.com"
// - password: the specified password
// - email_confirm: true (auto-confirm)
// Then inserts into profiles and user_jurisdictions
```

The function should be idempotent -- if the user already exists, it should skip creation gracefully.

### RegionContext Changes

```typescript
// New fields in context type:
isJurisdictionRestricted: boolean;
allowedJurisdictions: string[];

// On init, if restricted:
const initialRegion = isRestricted 
  ? allowedJurisdictions[0] 
  : localStorage.getItem(STORAGE_KEY) || "ZA";
```

### RegionSelector Changes

```typescript
// If restricted to a single jurisdiction, render static flag:
if (isJurisdictionRestricted) {
  return (
    <div className="h-9 w-9 rounded-full flex items-center justify-center" 
         title={currentRegion.name}>
      <FlagIcon code={currentRegion.flagCode} height={18} />
    </div>
  );
}
```

### Backwards Compatibility

- All existing users have zero rows in `user_jurisdictions`, so `isRestricted` will be `false`
- Their experience is completely unchanged -- full jurisdiction switching remains available
- Only users with explicit rows in the table are restricted

### Security Notes

- The `user_jurisdictions` table only has a SELECT policy for users (read own rows)
- No INSERT/UPDATE/DELETE policies for regular users -- only admins can set restrictions
- The edge function uses the service role key to create users and set jurisdictions
- Password is only used in the edge function call and never stored in code

