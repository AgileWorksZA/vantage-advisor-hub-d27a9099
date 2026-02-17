

## Medical Aid Product Detail View

When clicking on a medical aid row in the Products (360 View) tab, open a full-screen detail view pre-populated with that item's data, matching the reference screenshots.

### Layout

The view follows the same pattern as `AddMedicalAidForm` but opens pre-populated with the clicked row's data:

- **Header**: "Medical Aid Details" teal badge
- **"Astute" badge** in top-left of form card
- **Two-column form** with fields: Medical scheme name, Medical scheme plan name, Membership number, Total contribution, Date data received, Policy active (Yes/No radio), Hospital Plan (Yes/No), Hospital Plan with Day to Day (Yes/No)
- **Notes** textarea
- **Medical Members** collapsible section with "+ New Medical members" button and table
- **Documents** section with upload area
- **Product History** collapsible section
- **Save** and **Cancel** buttons at bottom

### Changes

**File: `src/components/client-detail/Client360ViewTab.tsx`**

1. Add state: `const [selectedMedicalAid, setSelectedMedicalAid] = useState<MedicalAid | null>(null)`
2. Add conditional render: when `selectedMedicalAid` is set, render `AddMedicalAidForm` in "view/edit" mode passing the medical aid data
3. Make medical aid row names clickable (the scheme name cell already has teal text styling) -- add `onClick` to open the detail view with that row's data, plus `scrollToTop()`
4. Import `MedicalAid` type from `regional360ViewData`

**File: `src/components/client-detail/AddMedicalAidForm.tsx`**

1. Update props interface to accept optional `initialData` of type `MedicalAid` for pre-populating the form
2. When `initialData` is provided, set form default values from the medical aid data:
   - `schemeName` from `initialData.schemeName`
   - `planName` from `initialData.planName`
   - `membershipNumber` from `initialData.membershipNumber`
   - `totalContribution` from `initialData.premium` (strip currency symbol)
   - `policyActive` from `initialData.policyActive`
   - `dateDataReceived` parsed from `initialData.dateReceived`
3. When `initialData` is provided, pre-populate the Medical Members table with a demo "Principal Member" row (matching the reference: member type, ID number, initials, full name, surname, DOB, effective from, indicative member covered, contribution)
4. When `initialData` is provided, pre-populate Product History with a "Data retrieved from Astute" entry

### Technical Details

| File | Action |
|------|--------|
| `src/components/client-detail/Client360ViewTab.tsx` | Edit - add click handler on medical aid rows |
| `src/components/client-detail/AddMedicalAidForm.tsx` | Edit - accept optional `initialData` prop for pre-population |

- No new files needed -- reuses existing `AddMedicalAidForm`
- No database changes
- Demo data only (hardcoded member row when viewing existing medical aid)

