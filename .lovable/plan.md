

## Enhanced Filter Dropdown with Auto-Select, Rich Items, and Filter Tags

### Changes

#### 1. Auto-Select All Household Members on Mount
In `ClientDashboardTab.tsx`, initialize `selectedFilters` with all member and contract values instead of an empty array. Use a `useEffect` that sets the selection to all options when `filterGroups` changes (i.e., when data loads).

#### 2. Enhanced Dropdown Display
Update the `MultiSelect` trigger button to show counts broken down by type:
- "3 Persons, 5 Contracts" instead of "Filter (8)"
- When all selected: "All (3 Persons, 5 Contracts)"

This requires passing additional metadata or computing counts in the parent. The simplest approach: extend `MultiSelectProps` with an optional `renderLabel` callback, or compute the label in `ClientDashboardTab` and pass it as a custom display.

#### 3. Rich Dropdown Items with Icons and Asset Info
Extend the `MultiSelect` option type to support extra metadata (`icon`, `subtitle`). For household members, show a User icon + name + total assets + contract count. For contracts, show a Briefcase icon + name + value.

Update `MultiSelectGroup` option type:
```typescript
interface EnrichedOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  subtitle?: string;
}
```

Render each item with the icon on the left, label as primary text, and subtitle (asset value / contract count) on the right.

#### 4. Filter Tags Next to Dropdown
After the `MultiSelect`, render a row of removable `Badge` tags for each selected person (members only, not contracts -- to keep it clean). Each tag shows the member name with an X button to deselect.

### Technical Details

**Files to edit:**

**`src/components/ui/multi-select.tsx`**
- Extend option type to `{ value, label, icon?, subtitle? }` 
- Render icon + label + subtitle in each `CommandItem`
- Accept optional `renderTriggerLabel?: (selected: string[], allOptions: EnrichedOption[]) => React.ReactNode` prop for custom trigger text

**`src/components/client-detail/ClientDashboardTab.tsx`**
- Initialize `selectedFilters` via `useEffect` to auto-select all options when data loads
- Build `filterGroups` with enriched options: User icon for members (with total assets as subtitle), Briefcase icon for contracts (with value as subtitle)
- Compute custom trigger label: count members vs contracts separately from `selectedFilters` prefixes
- Add filter tags row after the MultiSelect showing selected members as removable badges
- Clicking X on a tag removes that member from `selectedFilters`

**Layout in toolbar:**
```
[Filter Dropdown: "3 Persons, 5 Contracts"] [Tag: John S.] [Tag: Jane S.] ... (ml-auto) [Add Member] [Gear]
```

**Dropdown item layout:**
```
[Check] [UserIcon] John Smith (Spouse)          R 1,250,000 | 3 contracts
[Check] [UserIcon] Jane Smith (Child)           R 450,000 | 1 contract
--- Contracts ---
[Check] [BriefcaseIcon] Allan Gray Equity (on-0)    R 850,000
```
