
## Household Opportunities with Per-Member Tagging

### Overview
When the household slider is on, generate 360 View products for **every** household member (not just the current client), build gap opportunities **per member**, and tag each opportunity with the member's name.

### Changes

#### 1. `src/hooks/useHouseholdMeetingPrep.ts`

- Expand the `clients` select query to also fetch `nationality` and `country_of_issue` (needed to generate 360 View products per member)
- Export the household clients list as part of the returned data so `ClientSummaryTab` can generate 360 products for each member

Add to `HouseholdPrepData`:
```
householdClients: { id: string; firstName: string; surname: string; nationality: string | null; countryOfIssue: string | null }[];
```

Update the query:
```sql
.select("id, first_name, surname, nationality, country_of_issue")
```

Return the household clients list alongside the existing data.

#### 2. `src/components/client-detail/ClientSummaryTab.tsx`

- When `householdView` is on, use `householdData.householdClients` to generate 360 View products for **each** household member (not just the current client)
- Tag each product with the member's `clientName` so the gap analysis can attribute them
- Replace the single `view360Products` merge with a per-member loop:

```
householdData.householdClients.forEach(member => {
  const memberData = generateClient360Data(member.id, member.nationality, member.countryOfIssue);
  // map products with clientName tag
});
```

#### 3. `src/components/client-detail/next-best-action/OpportunitiesTab.tsx`

- Update `buildGapOpportunities` to accept a `householdView` flag
- When `householdView` is true, group products by `clientName` and run gap analysis **per member**, tagging each `GapOpportunity` with `clientName`
- When `householdView` is false, keep current behavior (no tags)
- Show `ClientNameTag` on all gap opportunities when in household view (already partially wired up, just needs the `clientName` to be populated)

Updated signature:
```
function buildGapOpportunities(products: PrepProduct[], householdView?: boolean): GapOpportunity[]
```

Per-member logic when `householdView` is true:
- Group products by `clientName` (or `(product as any).clientName`)
- For each member, run the existing gap rules against their products only
- Prefix gap IDs with member name for uniqueness (e.g., `gap-tlh-JohnS`)
- Set `clientName` on each gap
- Deduplicate: if same gap type exists for multiple members, keep all (each tagged)

Update `getOpportunitiesCount` to also pass `householdView`.

### Result
- Toggling household slider shows opportunities from all household members
- Each opportunity row displays a name tag (e.g., "John S.") identifying which member it belongs to
- The opportunity count in the tab header reflects the combined household total

### Technical Summary

| File | Change |
|------|--------|
| `useHouseholdMeetingPrep.ts` | Add `nationality`, `country_of_issue` to query; export `householdClients` list |
| `ClientSummaryTab.tsx` | Generate 360 products per household member; merge all into `activeProducts` with `clientName` tags |
| `OpportunitiesTab.tsx` | Group products by member and build gaps per member with `clientName` tags when `householdView` is on |
