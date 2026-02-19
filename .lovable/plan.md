

## Combined Dropdown, Family Tree Widget, and Layout Changes

### 1. Combine Dropdowns into a Single Multi-Select
Merge the "Contracts" and "Household Members" dropdowns into one unified multi-select with grouped options (using section headers inside the dropdown).

**File:** `src/components/client-detail/ClientDashboardTab.tsx`
- Remove the two separate `MultiSelect` components and their individual state (`selectedContracts`, `selectedMembers`)
- Replace with a single `MultiSelect` that combines both option sets, prefixed with group labels
- Combine into a single state array (e.g., `selectedFilters`) with prefixed values like `contract:on-0` and `member:id`
- Update the `MultiSelect` component or use grouped `CommandGroup` sections inside the dropdown to visually separate "Household Members" from "Contracts"

**File:** `src/components/ui/multi-select.tsx`
- Extend to support grouped options: accept `groups: { label: string; options: { value: string; label: string }[] }[]` as an alternative prop
- Render each group with a `CommandGroup` heading inside the dropdown

### 2. New Family Tree Widget
Add a new draggable widget showing selected household members and their relationships.

**File:** `src/components/client-detail/ClientDashboardTab.tsx`
- Add `family-tree` to `CLIENT_DASHBOARD_WIDGETS` and `defaultClientDashboardLayout`
- Create the widget content inline or as a sub-component featuring:
  - The main client at the center/top with initials avatar, name, and total asset value
  - Connected household members displayed with:
    - Circular initials icon with a colored dot indicator (green = active, amber = needs attention)
    - Name label beneath
    - Relationship type (e.g., "Spouse", "Child")
    - Asset value summary
  - Connecting lines between related members
- Data sourced from `familyMembers` and `businesses` from `useClientRelationships`
- Asset values derived from `allContracts` data (using the main client's total for the primary node; simulated proportional values for related members)

### 3. Move "Add Member" Button
Reposition the "Add Member" button to sit just to the left of the gear icon on the far right.

**File:** `src/components/client-detail/ClientDashboardTab.tsx`
- Move the `Button` inside the `ml-auto` wrapper, placing it before `WidgetSettingsDialog`
- The layout becomes: Combined Dropdown | (spacer via ml-auto) | Add Member | Gear

### Technical Details

**MultiSelect grouped options structure:**
```tsx
interface MultiSelectGroup {
  label: string;
  options: { value: string; label: string }[];
}

interface MultiSelectProps {
  options?: { value: string; label: string }[];
  groups?: MultiSelectGroup[];
  // ... rest unchanged
}
```

**Family Tree widget rendering approach:**
- Pure CSS/SVG layout with flexbox positioning
- Main client node centered at top
- Related members in a row below, connected by SVG lines
- Each node: circular avatar with initials (bg color derived from name), small status dot, name, relationship label, and formatted asset value beneath

**Files to edit:**
- `src/components/ui/multi-select.tsx` -- add grouped options support
- `src/components/client-detail/ClientDashboardTab.tsx` -- combine dropdowns, add family tree widget, reposition Add Member button

