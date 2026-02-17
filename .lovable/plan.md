

## Add Dynamic Status Dot to Client List Table

Add a colored status indicator dot to the left of the "Profile State" text in each row of the clients table, using the same urgency logic already used in the client detail ribbon.

### What It Does

Each client row in the table will show a small colored dot before "Active" (or whatever their profile state is):
- **Red dot**: Client has urgent opportunities (Tax Loss, Cross-sell gaps)
- **Orange dot**: Client has important opportunities (Platform, Idle Cash, New Business gaps)
- **Green dot**: No urgent or important items

### Changes

**File: `src/pages/Clients.tsx`**

1. Import `generateClient360Data` from `regional360ViewData`
2. Import `getOpportunityPriority` from `opportunity-priority`
3. Import `buildGapOpportunities` from `OpportunitiesTab`
4. Create a helper function `getClientStatusDotColor(clientId, nationality, countryOfIssue)` that:
   - Calls `generateClient360Data` to get the client's product data
   - Builds the product list and runs `buildGapOpportunities`
   - Returns "red", "orange", or "green" based on highest urgency (same logic as `ClientDetail.tsx` lines 100-115)
5. In the table body, update the Profile State cell (line 522) from:
   ```
   <TableCell>{client.profileState}</TableCell>
   ```
   to:
   ```
   <TableCell>
     <div className="flex items-center gap-1.5">
       <div className="w-2.5 h-2.5 rounded-full {color class}" />
       <span>{client.profileState}</span>
     </div>
   </TableCell>
   ```

Since the `useClients` hook already returns client data but not nationality/countryOfIssue, the helper will need to use the client ID with a default jurisdiction. To get full data, we will also need to fetch the raw client record's nationality and country_of_issue fields.

**File: `src/hooks/useClients.ts`**

Add `nationality` and `countryOfIssue` fields to the `ClientListItem` interface and populate them in `transformClientToListItem` so the Clients page has the data needed for the status dot computation.

### Technical Details

| File | Action |
|------|--------|
| `src/hooks/useClients.ts` | Edit - add `nationality` and `countryOfIssue` to `ClientListItem` |
| `src/pages/Clients.tsx` | Edit - add status dot to Profile State column using urgency logic |

No database or backend changes. Uses existing demo data and shared priority utilities.
