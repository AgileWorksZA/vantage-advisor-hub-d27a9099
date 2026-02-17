

## Add Medical Aid Form Screen

When clicking the "+ Medical Aid" link in the Products (360 View) tab, open a full-page form matching the reference design. This is a UI-only form initially (saving to local state / demo data).

### Form Layout (matching the screenshot)

**Section 1: "Medical Aid Details" header badge (teal)**

Two-column form with:
- Left column: Medical scheme name (required), Membership number (required), Total contribution (default 0.00), Date data received (date picker)
- Right column: Medical scheme plan name (required), Policy active (Yes/No radio, default Yes), Hospital Plan (Yes/No radio, default No), Hospital Plan with Day to Day (Yes/No radio, default No)

**Notes** - full-width textarea below the form fields

**Section 2: "Medical Members" collapsible accordion** (empty by default)

**Section 3: Documents table** with columns: Document Name, Document Title, Document Category, Upload date, Archived, Manage upload. Includes a dashed "Upload" drop zone.

**Section 4: Save and Cancel buttons** (teal Save, outline Cancel)

**Section 5: "Product History" collapsible section** with text filter and action icons, showing "No items found"

### Technical Approach

1. **New component**: `src/components/client-detail/AddMedicalAidDialog.tsx`
   - Full-screen dialog (similar to existing wizard patterns)
   - Uses react-hook-form with zod validation for required fields
   - Radio groups for Yes/No toggles
   - Accordion for Medical Members and Product History sections
   - Cancel returns to the 360 View tab

2. **Update**: `src/components/client-detail/Client360ViewTab.tsx`
   - Add state for `showMedicalAidForm`
   - Wire the "+ Medical Aid" button onClick to toggle the form
   - When form is open, render the AddMedicalAidDialog component
   - On save, add to the local medicalAid array and show toast

### Files Changed
| File | Action |
|------|--------|
| `src/components/client-detail/AddMedicalAidDialog.tsx` | Create - new full-page form component |
| `src/components/client-detail/Client360ViewTab.tsx` | Edit - wire "+ Medical Aid" button to open the form |

### Form Fields Mapping

| Field | Type | Required | Default |
|-------|------|----------|---------|
| Medical scheme name | Text input | Yes | - |
| Medical scheme plan name | Text input | Yes | - |
| Membership number | Text input | Yes | - |
| Total contribution | Number input | No | 0.00 |
| Date data received | Date input | No | - |
| Policy active | Radio (Yes/No) | No | Yes |
| Hospital Plan | Radio (Yes/No) | No | No |
| Hospital Plan with Day to Day | Radio (Yes/No) | No | No |
| Notes | Textarea | No | - |

