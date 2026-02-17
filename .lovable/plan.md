

## Risk Product Detail View

When clicking on a risk product row in the Products tab, open the existing `AddRiskProductForm` pre-populated with that product's data -- same pattern used for Medical Aid.

### Changes

**File: `src/components/client-detail/Client360ViewTab.tsx`**

1. Add state: `const [selectedRiskProduct, setSelectedRiskProduct] = useState<RiskProduct | null>(null)`
2. Import `RiskProduct` type from `regional360ViewData`
3. Add conditional render: when `selectedRiskProduct` is set, render `AddRiskProductForm` with `initialData` prop
4. Make risk product holding name clickable (line 527) with `onClick` to set `selectedRiskProduct` and `scrollToTop()`

**File: `src/components/client-detail/AddRiskProductForm.tsx`**

1. Update props to accept optional `initialData` of type `RiskProduct`
2. When `initialData` is provided, pre-populate form defaults:
   - `productProvider` from `holdingName`
   - `policyNumber` from `policyNumber`
   - `effectiveDate` parsed from `effectiveDate`
   - `terminationDate` parsed from `terminationDate`
   - `totalPremium` from `paymentAmount`
   - `paymentDueDate` parsed from `paymentDueDate`
   - `notes` from `notes`
   - `policyActive` set to "No" (matching demo data)
   - `dataDate` set to current date
3. When `initialData` is provided, show "Astute" badge below the header
4. Add expandable **Plan details** section (matching reference image):
   - Plan name, Cover amount, Premium amount, Termination date, Life cover status, Effective date fields
   - **Participants** table header (Role, Full name, ID number, Gender, Date of birth, Participant percentage, Smoking status, Marital status, Occupation)
   - **Related Parties** table with demo rows (Planholder, Beneficiary, Insured) matching the screenshot data
5. When `initialData` is provided, pre-populate Product History with "Data retrieved from Astute" entry (same pattern as Medical Aid form)

### Files Changed
| File | Action |
|------|--------|
| `src/components/client-detail/Client360ViewTab.tsx` | Edit - add click handler + state |
| `src/components/client-detail/AddRiskProductForm.tsx` | Edit - accept `initialData`, add plan/participants sections |

No new files, no database changes. Demo data only.

