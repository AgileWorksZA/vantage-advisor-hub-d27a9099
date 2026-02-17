

## Add Risk Products, Short Term, and Will Product Forms

Create three new product form components following the same pattern as the existing `AddMedicalAidForm`, each matching their respective reference screenshots. Wire them to the corresponding "+" buttons in the Products tab.

### 1. Risk Product Form (`AddRiskProductForm.tsx`)

**Header badge**: "Risk Product Details" (teal)

**Two-column form fields**:
| Field | Type | Required | Default |
|-------|------|----------|---------|
| Product Provider | Text input | Yes | - |
| Product Name | Text input | Yes | - |
| Total Premium | Number input | No | 0.00 |
| Premium Frequency | Select dropdown | No | - |
| Policy number | Text input | Yes | - |
| Payment due date | Date picker | No | - |
| Effective date | Date picker | Yes | - |
| Termination date | Date picker | No | - |
| Data date | Date picker | No | - |
| Policy Active | Radio (Yes/No) | No | No |

**Notes** textarea, **Documents** table with upload zone, **Save/Cancel** buttons, **Product History** collapsible section.

### 2. Short Term Product Form (`AddShortTermForm.tsx`)

**Header badge**: "Short Term Product Details" (teal)

**Two-column form fields**:
| Field | Type | Required | Default |
|-------|------|----------|---------|
| Product Provider | Text input | Yes | - |
| Product Name | Text input | Yes | - |
| Policy number | Text input | Yes | - |
| Policy Type | Select dropdown | No | - |
| Total premium (ZAR) | Number input | No | 0.00 |
| Status | Select dropdown | No | Active |
| Review date | Date picker | No | - |
| Policy Owner | Text input | Yes | - |
| Broker | Text input | No | - |
| Start date | Date picker | No | - |
| Data date | Date picker | No | - |
| Payment Method | Select dropdown | No | - |

**Notes** textarea, **Documents** table with upload zone, **Save/Cancel** buttons, **Product History** collapsible section.

### 3. Will Form (`AddWillForm.tsx`)

**Header badge**: "Will Details" (teal)

**Two-column form fields**:
| Field | Type | Required | Default |
|-------|------|----------|---------|
| Client has will | Radio (Yes/No) | No | No |
| EFW receipt number | Text input | No | - |
| Place kept | Text input | Yes | - |
| Executors | Text input | No | - |
| Date of will | Date picker | Yes | - |
| Last review date | Date picker | No | - |

**Notes** textarea, **Documents** table with upload zone, **Save/Cancel** buttons, **Product History** collapsible section.

### 4. Wire buttons in `Client360ViewTab.tsx`

- Add three new state variables: `showRiskProductForm`, `showShortTermForm`, `showWillForm`
- Add conditional rendering blocks (same pattern as `showMedicalAidForm`)
- Wire onClick handlers on the `+ Risk Products`, `+ Short Term`, and `+ Will` buttons

### Files Changed
| File | Action |
|------|--------|
| `src/components/client-detail/AddRiskProductForm.tsx` | Create |
| `src/components/client-detail/AddShortTermForm.tsx` | Create |
| `src/components/client-detail/AddWillForm.tsx` | Create |
| `src/components/client-detail/Client360ViewTab.tsx` | Edit - add state + wiring for all 3 forms |

### Technical Notes
- All three forms follow the identical structure as `AddMedicalAidForm.tsx` (react-hook-form + zod validation, Collapsible sections, document table, product history)
- Select dropdowns use the existing Shadcn Select component
- Date pickers use the existing Popover + Calendar pattern with `pointer-events-auto`
- UI-only (local state/demo data), no database changes required

