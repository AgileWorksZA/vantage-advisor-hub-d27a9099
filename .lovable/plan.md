

## Move "Main Member" Tag and Display in Household Members Table

### Overview

Two changes:
1. In the client ribbon, move the "Main Member" badge from next to the client name to immediately after the household group badge.
2. In the Household Members table on the Relationships tab, show a "Main Member" badge next to the name of any member whose surname appears in the household group name.

### Changes

**File: `src/components/client-detail/ClientRibbon.tsx`**

- Remove the "Main Member" badge from inside the name `div` (lines 188-195).
- Add it immediately after the household group badge (after line 223), keeping the same condition (`client.household_group?.includes(client.surname)`).

**File: `src/components/client-detail/ClientRelationshipsTab.tsx`**

- Accept the client's `household_group` and `surname` as props (or fetch via `useClientDetail`).
- In the Household Members table Name column (line 99), check if the member's name includes the client's surname (for the current client row) or use a similar heuristic. Since the current client is the "owner" being viewed, the main member indicator applies to family members whose `relatedClientId` links to a client whose surname is in the household group. The simplest approach: pass `householdGroup` as a prop and check if a member's name contains a word from the household group to identify the main member. However, the most accurate approach is to check if the member's `familyType` is "Spouse" (they wouldn't be main member) vs the client themselves.

  Actually, the simplest correct approach: the "Main Member" concept is about the current client being viewed (the owner). So in the household members table, we need to know which row (if any) represents a linked client who is the main member. Since `relatedClientId` exists, we can fetch that client's surname and compare to `householdGroup`. But this requires extra queries.

  **Simpler approach**: Pass `householdGroup` as a prop to `ClientRelationshipsTab`. For each family member row, if the member has a `relatedClientId`, we already have their `name`. Check if `householdGroup` includes the member's surname (last word of name). Display the amber "Main Member" badge next to matching names.

**File: `src/pages/ClientDetail.tsx`**

- Pass `client` (or just `householdGroup`) as a prop to `<ClientRelationshipsTab />`.

### Technical Details

**ClientRibbon.tsx ribbon badge reorder:**
- Remove lines 188-195 (Main Member badge next to name)
- After the household badge closing tag (~line 224), add the Main Member badge with the same styling

**ClientRelationshipsTab.tsx props and table update:**
- Add prop: `householdGroup?: string | null`
- In the Name TableCell (line 99), add logic:
  ```tsx
  <TableCell className="text-sm font-medium">
    {member.name}
    {householdGroup && member.name.split(" ").some(word => householdGroup.includes(word)) && (
      <Badge variant="outline" className="border-amber-500 text-amber-600 ... ml-2 text-[10px]">
        Main Member
      </Badge>
    )}
  </TableCell>
  ```

**ClientDetail.tsx:**
- Change `<ClientRelationshipsTab />` to `<ClientRelationshipsTab householdGroup={client.household_group} />`
