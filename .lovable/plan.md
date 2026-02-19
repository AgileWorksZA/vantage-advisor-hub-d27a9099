

## Add 3 New Client Dashboard Widgets

Three new widgets inspired by the reference images: **Client Portfolio**, **Household**, and **Onboarding (KYC/AML)**.

### Widget 1: Client Portfolio
A compact portfolio summary showing:
- Donut chart of asset allocation (top-left) with a trend icon
- "Total Value" heading + large formatted value + monthly change percentage
- "Performance (12 months)" label with an inline SVG sparkline and current value
- Product breakdown list: colored dots, product names, values, and growth percentages

Data sourced from existing `clientData` (onPlatformProducts, assetAllocation, valuationData).

### Widget 2: Household
A household wealth overview showing:
- Donut chart of member value proportions + "Combined Value" heading + YTD growth
- List of household members (main client + family), each with: colored dot, name, role (Primary/Spouse/Child), inline sparkline, value, and growth percentage
- "Add Member, Company or Trust" button at the bottom (opens existing AddFamilyMemberDialog)

Data sourced from existing `householdMembers`, `allContracts`, and seeded random for per-member values.

### Widget 3: Onboarding (KYC/AML)
A compliance status card showing:
- "Onboarding" title with a shield icon
- "KYC/AML Verification" subtitle
- Personal Details card: Full Name, ID Number (masked), Email (truncated), Phone (masked)
- Verification checklist: ID Number Verification (FICA Compliant), Address Verification (Proof of Residence), Bank Account Verification (Account Confirmed) -- each with a green check icon
- Status banner: "Successfully Onboarded / All KYC/AML checks passed"

Data sourced from `client` object fields; statuses are deterministic based on clientId.

### Technical Details

**File: `src/components/client-detail/ClientDashboardTab.tsx`**

1. Add 3 new entries to `defaultClientDashboardLayout`:
   - `{ i: 'client-portfolio', x: 6, y: 9, w: 3, h: 3 }`
   - `{ i: 'household-overview', x: 0, y: 12, w: 3, h: 3 }`
   - `{ i: 'onboarding-kyc', x: 3, y: 12, w: 3, h: 3 }`

2. Add 3 new entries to `CLIENT_DASHBOARD_WIDGETS`:
   - `{ id: 'client-portfolio', label: 'Client Portfolio' }`
   - `{ id: 'household-overview', label: 'Household' }`
   - `{ id: 'onboarding-kyc', label: 'Onboarding' }`

3. Import `Shield`, `MapPin`, `Phone`, `Mail`, `CircleCheckBig` from lucide-react

4. Add `useMemo` blocks for:
   - `portfolioProducts`: top products with deterministic growth percentages and colors
   - `householdValues`: per-member values distributed from total, with sparkline data and growth percentages
   - `onboardingStatus`: masked ID/phone/email, verification steps with statuses

5. Add 3 new widget render blocks inside the `DraggableWidgetGrid`:

   **Client Portfolio widget**: ECharts donut (small, inline) + total value + sparkline SVG + product list rows

   **Household widget**: ECharts donut (member proportions) + combined value + member rows with dot/name/role/sparkline/value/growth + "Add Member" button

   **Onboarding widget**: Card with personal details grid (2x2), 3 verification rows with green check badges, status banner at bottom

All widgets follow the existing pattern: Card with drag handle header (GripVertical + title + X close button), CardContent body, `h-full` on Card.

