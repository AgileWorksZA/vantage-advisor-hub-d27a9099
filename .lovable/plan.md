

## Click Tax Loss Opportunity to Open TLH Dashboard

### Overview
Make "Tax Loss" opportunity rows in the Next Best Action clickable. Clicking opens the existing TLH Dashboard dialog, pre-populated with the current client's name, ID, and investment values from the 360 View data.

### Changes

#### 1. `src/components/client-detail/next-best-action/OpportunitiesTab.tsx`

- Add an `onTaxLossClick` callback prop to `OpportunitiesTabProps` with signature `(gap: GapOpportunity) => void`
- On gap rows where `gap.type` includes "Tax Loss", add a `cursor-pointer` class and an `onClick` handler that calls `onTaxLossClick(gap)`
- Same for `PrepOpportunity` items where `opportunityType` includes "Tax Loss"

#### 2. `src/components/client-detail/ClientSummaryTab.tsx`

- Import `TLHDashboard` from `@/components/tax-loss-harvesting/TLHDashboard`
- Add state: `const [tlhDashboardOpen, setTlhDashboardOpen] = useState(false)`
- Pass `onTaxLossClick={() => setTlhDashboardOpen(true)}` to `OpportunitiesTab`
- Render `<TLHDashboard>` at the bottom of the component with:
  - `open={tlhDashboardOpen}`
  - `onOpenChange={setTlhDashboardOpen}`
  - `clientName={displayName}` (the current client's display name)
  - `clientId={clientId}` (the current client's UUID)
- The TLH Dashboard already accepts `clientName` and `clientId` props and uses `getClientTLHMetrics(clientName)` to generate per-client metrics, so it will display client-specific values automatically

### Technical Details

| File | Change |
|------|--------|
| `OpportunitiesTab.tsx` | Add `onTaxLossClick` prop; make Tax Loss rows clickable |
| `ClientSummaryTab.tsx` | Import TLHDashboard; add open state; wire callback; render dialog |

### How Values Are Populated

The `TLHDashboard` component already has logic to:
1. Accept `clientName` and `clientId` props
2. Use `getClientTLHMetrics(clientName, selectedRegion)` to generate deterministic per-client metrics (account balance, harvested amounts, tax savings)
3. Look up product count from the database via `clientId`

This means passing the client's name and ID from the Next Best Action context is sufficient to populate the dashboard with client-specific data.

