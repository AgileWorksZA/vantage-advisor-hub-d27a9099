

## Remove General Details from NBA, Add Main Member Table, Wire Up Edit from Ribbon

### Overview
Three changes:
1. Remove the "General details" card from the Next Best Action tab -- make it a full-width NBA panel
2. Add a "Main Member" read-only details table at the top of the Relationships tab (showing the current client's key info)
3. Expand the client ribbon's collapsed details to show all the General Details info plus an Edit button that navigates to the Details tab

### Changes

**1. `src/components/client-detail/ClientSummaryTab.tsx` -- Remove General Details card**

- Remove the entire left column (`<div className="space-y-4">` containing the General Details `<Card>`)
- Change the outer layout from `grid grid-cols-1 lg:grid-cols-2 gap-4` to a single-column layout
- The Next Best Action card becomes full-width, removing the 2-column split
- Remove unused imports: `Pencil`, `calculateAge`, `formatBirthday`, `getInitials`, `getDisplayName` (keep only what NBA panel needs)

**2. `src/components/client-detail/ClientRelationshipsTab.tsx` -- Add Main Member table**

- Accept new props: `client: Client` and `onTabChange?: (tab: string) => void`
- Add a new collapsible section at the top titled "MAIN MEMBER (1)" above the existing Household Members section
- Display a read-only table with key client fields: Name, Title, ID Number, Gender, Age, Birthday, Language, Tax Number, Country of Issue
- Include an Edit (pencil) button in the header that calls `onTabChange?.("details")` to open the edit form
- Import `Client`, `getDisplayName`, `calculateAge`, `formatBirthday` from `@/types/client` and `Pencil` from lucide

**3. `src/pages/ClientDetail.tsx` -- Pass client + onTabChange to RelationshipsTab**

- Update the `<ClientRelationshipsTab>` usage to pass `client={client}` and `onTabChange={setActiveTab}`

**4. `src/components/client-detail/ClientRibbonExpandedDetails.tsx` -- Show all General Details + Edit button**

- Add all fields that were in the General Details card: Name, Title, Initials, Person type, ID Number, Country of issue, Gender, Age, Birthday, Language, Tax number
- Replace the current 3-column sparse layout with a dense key-value grid (similar to the General Details card style)
- Keep the existing copyable fields (address, phone, email) as additional rows
- Accept new prop `onEdit?: () => void` and render an Edit (pencil) button in the top-right corner

**5. `src/components/client-detail/ClientRibbon.tsx` -- Pass onEdit to expanded details**

- Pass `onEdit={() => onTabChange?.("details")}` to `<ClientRibbonExpandedDetails>`

### What stays the same
- The Next Best Action panel content (Opportunities, Outstanding, Recent Activity) is unchanged
- All existing Relationship tab sections (Household Members, Businesses, Professional Contacts) remain
- The hidden "details" tab with `ClientDetailsTab` still works as the edit form
- The Dashboard tab and its widgets are untouched

### Files

| File | Change |
|------|--------|
| `src/components/client-detail/ClientSummaryTab.tsx` | Remove General Details card; make NBA full-width |
| `src/components/client-detail/ClientRelationshipsTab.tsx` | Add Main Member read-only table at top with Edit button |
| `src/pages/ClientDetail.tsx` | Pass `client` and `onTabChange` props to RelationshipsTab |
| `src/components/client-detail/ClientRibbonExpandedDetails.tsx` | Show all client details + Edit button |
| `src/components/client-detail/ClientRibbon.tsx` | Pass `onEdit` callback to expanded details |

