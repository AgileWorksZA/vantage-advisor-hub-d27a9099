
# Populate Administrative Reference Data

## Overview

This implementation populates three administrative lookup tables with comprehensive world reference data:
- **Currencies**: 180+ world currencies with ISO 4217 codes
- **Banks**: 150+ major banks globally (focus on international and South African banks)
- **Locations**: 250 countries/territories with ISO 3166 codes

## Architecture Approach

Since the `admin_general_lists` table requires a `user_id` (data is user-scoped with RLS), I'll create a **Supabase Edge Function** that seeds this reference data for the authenticated user. This approach:

1. Respects the existing RLS policies
2. Seeds data on-demand for each user
3. Avoids duplicate entries (uses upsert with ON CONFLICT)
4. Can be called from a "Seed Reference Data" button in the UI

## Implementation Details

### 1. Edge Function: `seed-admin-reference-data`

**File:** `supabase/functions/seed-admin-reference-data/index.ts`

This function will:
- Authenticate the user
- Insert reference data for currencies, banks, and locations
- Use ON CONFLICT to avoid duplicates
- Return success/failure status

**Data to Insert:**

#### Currencies (180+ entries)
| Code | Name | Description |
|------|------|-------------|
| USD | United States Dollar | US Dollar |
| EUR | Euro | European Union |
| GBP | British Pound Sterling | United Kingdom |
| ZAR | South African Rand | South Africa |
| JPY | Japanese Yen | Japan |
| CHF | Swiss Franc | Switzerland |
| AUD | Australian Dollar | Australia |
| CAD | Canadian Dollar | Canada |
| ... | ... | ... |

#### Banks (150+ entries)
| Code | Name | Description |
|------|------|-------------|
| ABSA | ABSA Bank | South Africa |
| FNB | First National Bank | South Africa |
| STD | Standard Bank | South Africa |
| NED | Nedbank | South Africa |
| CAP | Capitec Bank | South Africa |
| HSBC | HSBC Holdings | United Kingdom |
| JPM | JPMorgan Chase | United States |
| BOA | Bank of America | United States |
| CITI | Citibank | United States |
| BARC | Barclays | United Kingdom |
| ... | ... | ... |

#### Locations/Countries (250 entries)
| Code | Name | Description |
|------|------|-------------|
| ZA | South Africa | Republic of South Africa |
| US | United States | United States of America |
| GB | United Kingdom | United Kingdom of Great Britain |
| DE | Germany | Federal Republic of Germany |
| FR | France | French Republic |
| JP | Japan | Japan |
| CN | China | People's Republic of China |
| AU | Australia | Commonwealth of Australia |
| ... | ... | ... |

### 2. Frontend Integration

**Modify:** `src/components/administration/general-lists/GeneralListsSection.tsx`

Add a "Seed Reference Data" button in the header that:
- Calls the edge function
- Shows a loading state
- Displays success/error toast
- Refreshes the data table

### 3. Database Migration

**New Migration:** Create a database function that can be called to seed data for a specific user. This provides an alternative seeding method and can be used by the edge function.

```sql
-- Function to seed reference data for a user
CREATE OR REPLACE FUNCTION seed_admin_reference_data(p_user_id UUID)
RETURNS void AS $$
BEGIN
  -- Insert currencies
  INSERT INTO admin_general_lists (user_id, list_type, code, name, description, display_order, is_active)
  VALUES 
    (p_user_id, 'currencies', 'USD', 'United States Dollar', 'US Dollar', 1, true),
    (p_user_id, 'currencies', 'EUR', 'Euro', 'European Union', 2, true),
    -- ... more currencies
  ON CONFLICT (user_id, list_type, code) DO NOTHING;
  
  -- Insert banks
  INSERT INTO admin_general_lists (user_id, list_type, code, name, description, display_order, is_active)
  VALUES 
    (p_user_id, 'banks', 'ABSA', 'ABSA Bank', 'South Africa', 1, true),
    -- ... more banks
  ON CONFLICT (user_id, list_type, code) DO NOTHING;
  
  -- Insert locations
  INSERT INTO admin_general_lists (user_id, list_type, code, name, description, display_order, is_active)
  VALUES 
    (p_user_id, 'locations', 'ZA', 'South Africa', 'Republic of South Africa', 1, true),
    -- ... more countries
  ON CONFLICT (user_id, list_type, code) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Files to Create

| File | Purpose |
|------|---------|
| `supabase/functions/seed-admin-reference-data/index.ts` | Edge function to seed reference data |

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/administration/general-lists/GeneralListsSection.tsx` | Add "Seed Reference Data" button |
| Database migration | Create seeding function with all reference data |

## Reference Data Sources

### Currencies
- ISO 4217 standard currency codes
- Includes major trading currencies and all sovereign currencies
- 180+ currencies total

### Banks
- Major international banks (top 50 by assets)
- All South African commercial banks
- Regional banks from major economies
- 150+ banks total

### Countries/Locations
- ISO 3166-1 alpha-2 country codes
- All UN member states
- Major territories and regions
- 250 entries total

## Expected Behavior

| Action | Result |
|--------|--------|
| Navigate to Currencies tab | Shows empty table (no data yet) |
| Click "Seed Reference Data" | Calls edge function, inserts 180+ currencies |
| Navigate to Banks tab | Shows 150+ major world banks |
| Navigate to Locations tab | Shows 250 countries/territories |
| Click seed again | No duplicates created (ON CONFLICT DO NOTHING) |

## Sample Data Preview

### Currencies (partial list)
```text
USD - United States Dollar
EUR - Euro  
GBP - British Pound Sterling
ZAR - South African Rand
JPY - Japanese Yen
CNY - Chinese Yuan
AUD - Australian Dollar
CAD - Canadian Dollar
CHF - Swiss Franc
INR - Indian Rupee
... (180+ total)
```

### Banks (partial list)
```text
ABSA - ABSA Bank (South Africa)
FNB - First National Bank (South Africa)
STD - Standard Bank (South Africa)
NED - Nedbank (South Africa)
CAP - Capitec Bank (South Africa)
HSBC - HSBC Holdings (UK)
JPM - JPMorgan Chase (US)
BOA - Bank of America (US)
BARC - Barclays (UK)
DB - Deutsche Bank (Germany)
... (150+ total)
```

### Locations (partial list)
```text
ZA - South Africa
US - United States
GB - United Kingdom
DE - Germany
FR - France
JP - Japan
CN - China
AU - Australia
CA - Canada
BR - Brazil
... (250 total)
```

## Implementation Notes

1. **Edge Function Approach**: Using an edge function allows seeding to happen on-demand with proper authentication, respecting RLS policies.

2. **Idempotent Seeding**: Using `ON CONFLICT DO NOTHING` ensures the seed operation can be run multiple times without creating duplicates.

3. **Display Order**: Countries/currencies are ordered alphabetically by code for consistency, with commonly-used items (like ZAR, USD, EUR) given lower display_order values to appear first.

4. **User-Scoped Data**: Each user gets their own copy of reference data, allowing customization (adding/removing items) without affecting other users.
