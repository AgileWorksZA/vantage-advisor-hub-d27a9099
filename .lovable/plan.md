

## Make Household Badge Clickable, Tag Main Member, and Rename "Family" to "Household"

### Overview

Three changes: (1) clicking the household group badge in the ribbon navigates to the Relationships tab, (2) a "Main Member" tag appears after the primary member's name in the ribbon, and (3) all user-facing instances of "family" are renamed to "household" across the UI, hooks, seed function, and database column.

---

### 1. Clickable Household Badge -> Relationships Tab

**File: `src/components/client-detail/ClientRibbon.tsx`**

- Add an `onTabChange` callback prop to `ClientRibbonProps`
- Wrap the household group badge in a clickable `<button>` or apply `onClick={() => onTabChange("relationships")}` with `cursor-pointer`

**File: `src/pages/ClientDetail.tsx`**

- Pass `onTabChange={setActiveTab}` to the `<ClientRibbon>` component

---

### 2. "Main Member" Tag on Primary Household Member

The household group name follows the pattern "The {Surname} Household". The main member is the client whose `surname` appears in the group name.

**File: `src/components/client-detail/ClientRibbon.tsx`**

- After the `formatRibbonName(client)` span, add a conditional badge:

```
if client.family_group includes client.surname -> show "Main Member" tag
```

- Styled as a small, subtle badge (e.g., amber/gold outline) to differentiate from other badges

---

### 3. Rename "Family" to "Household" (All User-Facing Text)

This is a broad rename across UI labels, button text, dialog titles, section headers, toast messages, empty-state messages, and the database column. Internal variable names in hooks/components remain unchanged to avoid unnecessary refactoring risk.

**Database Migration:**

```sql
-- Rename column
ALTER TABLE public.clients RENAME COLUMN family_group TO household_group;

-- Update existing data: "The X Family" -> "The X Household"
UPDATE public.clients
SET household_group = REPLACE(household_group, ' Family', ' Household')
WHERE household_group IS NOT NULL;

-- Update family_name in client_relationships
UPDATE public.client_relationships
SET family_name = REPLACE(family_name, ' Family', ' Household')
WHERE family_name IS NOT NULL AND family_name LIKE '%Family%';
```

**Files to update (user-facing text only):**

| File | Changes |
|------|---------|
| `src/pages/Clients.tsx` | Table header "Family Group" -> "Household", filter label "Family" -> "Household" |
| `src/components/client-detail/ClientRibbon.tsx` | Badge text comes from data (auto-updated by migration) |
| `src/components/client-detail/ClientRelationshipsTab.tsx` | Section header "FAMILY MEMBERS" -> "HOUSEHOLD MEMBERS", button "Add Family" -> "Add Member", empty state text |
| `src/components/client-detail/AddFamilyMemberDialog.tsx` | Dialog title "Add Family Member" -> "Add Household Member", button text, toast messages, empty state messages |
| `src/components/client-detail/EditFamilyMemberDialog.tsx` | Dialog title "Edit Family Member" -> "Edit Household Member", "Family Type" label -> "Household Type", toast messages |
| `src/hooks/useClientRelationships.ts` | No user-facing text changes needed (internal variable names stay) |
| `src/hooks/useClients.ts` | Update field mapping from `family_group` to `household_group` |
| `src/pages/ClientDetail.tsx` | Update `familyType` -> keep as-is (internal), but update any display text referencing "family" |
| `supabase/functions/seed-demo-relationships/index.ts` | Change `"The ${surname} Family"` to `"The ${surname} Household"`, update column name `family_group` -> `household_group` |
| `src/components/HeroPortfolioCard.tsx` | "Family Grouping" -> "Household", "Smith Family Group" -> "Smith Household" |

**Note:** The `family_name` column in `client_relationships` table stores the group label (e.g., "The Smith Household"). Its column name stays as `family_name` in the DB to avoid a larger migration, but its stored values get updated.

---

### Technical Summary

| Item | Detail |
|------|--------|
| DB migration | Rename `family_group` to `household_group`, update stored text values |
| New prop | `onTabChange` added to `ClientRibbonProps` |
| Modified files | ~10 files (see table above) |
| Edge function | Updated seed function for new naming |
| Main member detection | `client.household_group?.includes(client.surname)` |

