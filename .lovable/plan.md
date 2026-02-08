

# Populate Contact Data for All Clients Across All Jurisdictions

## Overview

93 clients across all jurisdictions (ZA, AU, CA, GB, US) are missing contact information (cell_number, email, work_number, occupation, tax_number, initials, etc.). These clients were originally inserted before the seed function was enriched with contact details. The UI (ribbon and expanded section) already correctly displays these fields when data exists -- the only gap is the data itself.

## Root Cause

The `seed-demo-clients` edge function's update logic (line 356) currently only checks for clients where `!ec.email`. This condition was not broad enough to catch all clients missing data, particularly when some had partial data or the update hadn't been triggered.

## Changes

### 1. Update the seed function's update condition

**File: `supabase/functions/seed-demo-clients/index.ts`**

Change the update filter from:
```ts
const clientsToUpdate = (existingClients || []).filter(ec => !ec.email)
```
to:
```ts
const clientsToUpdate = (existingClients || []).filter(ec => !ec.email || !ec.cell_number)
```

This ensures any client missing either email or cell_number will be matched against the demo data array and updated with the full set of contact fields.

### 2. Deploy and run the seed function

After updating the code, deploy the edge function and invoke it. This will:
- Match all 93 clients missing data against the `demoClients` array by name
- Update each matched client with: email, cell_number, work_number, home_number, preferred_contact, gender, title, initials, id_number, occupation, employer, industry, tax_number, country_of_issue, and tax_resident_country

### 3. No UI changes needed

The existing components already handle all the data correctly:

- **ClientRibbon.tsx** (collapsed view) -- shows ID number, phone, and email inline with icons
- **ClientRibbonExpandedDetails.tsx** (expanded view) -- shows Physical Address, Cellphone (with copy), Work number (with copy), Email (with copy), Category, and Tax Number

Both components gracefully handle null values by hiding the field or showing a dash.

## Files Summary

| File | Action |
|------|--------|
| `supabase/functions/seed-demo-clients/index.ts` | Modify -- broaden update condition from `!ec.email` to `!ec.email or !ec.cell_number` |
| Edge function deployment | Deploy and invoke `seed-demo-clients` to populate missing data |

## Expected Result

After running the updated seed function, all 211 clients will have populated contact details visible in both the collapsed ribbon (ID, phone, email) and the expanded section (address, cellphone, work number, email, category, tax number).

