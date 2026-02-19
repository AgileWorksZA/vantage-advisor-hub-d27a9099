

## Auto-Select, Grouped Contracts, Status Dots, and Family Tree Widget Fix

### 1. Auto-Select All Persons on Page Load (and Show Filter Tags)
Currently, the `useEffect` auto-selects ALL filters (members + contracts) only when `selectedFilters` is empty. Change this to always auto-select all persons on mount, regardless of contract selection. The filter tags already render for selected members -- no change needed there.

**File: `src/components/client-detail/ClientDashboardTab.tsx`**
- Update the `useEffect` (line 380-385) to always set all member values on initial load, plus all contracts

### 2. Group Contracts Per Household Member in Dropdown
Instead of a flat "Contracts" group, nest contracts under each household member. The main client gets their contracts, and each family member/business gets a sub-group. Since we don't have real per-member contract mapping, assign all contracts to the main client and show "(No contracts)" for other members.

**File: `src/components/client-detail/ClientDashboardTab.tsx`**
- Restructure `filterGroups` to create one group per person: "John Smith (Main)" with their contracts nested as sub-options, then "Jane Smith (Spouse)" with their contracts, etc.
- The main client gets all current contracts as sub-items
- Each member group header shows the person with a User icon

### 3. Add Status Dot Next to Each Member in the Dropdown
Add a colored status indicator (green dot for active, amber for attention) next to each household member option in the multi-select dropdown.

**File: `src/components/client-detail/ClientDashboardTab.tsx`**
- Update the member options' `icon` prop to include a status dot (a small colored circle span) alongside the User icon
- Use the same logic as FamilyTreeWidget: every 3rd member gets "attention" status

### 4. Fix Family Tree Widget Sizing
The widget's SVG connecting lines and node layout don't scale well within the grid. Fix overflow and sizing issues.

**File: `src/components/client-detail/FamilyTreeWidget.tsx`**
- Add `overflow-hidden` to the Card
- Constrain the SVG viewBox and make it responsive with `overflow-visible` removed
- Reduce node spacing from `gap-4` to `gap-3` for tighter fit
- Add `min-h-0` and `overflow-auto` to CardContent so content scrolls if it overflows the widget bounds
- Reduce main avatar from 48px to 44px and member avatars from 40px to 36px for better fit in smaller widget cells

### Technical Details

**Grouped filter structure (per member with their contracts):**
```typescript
const filterGroups = [
  {
    label: "John Smith (Main)",
    options: [
      { value: "member:main", label: "John Smith", icon: <UserWithDot status="active" /> },
      { value: "contract:on-0", label: "Allan Gray Equity", icon: <Briefcase />, subtitle: "R 850,000" },
      { value: "contract:ext-0", label: "External Fund", icon: <Briefcase />, subtitle: "R 200,000" },
    ]
  },
  {
    label: "Jane Smith (Spouse)",
    options: [
      { value: "member:abc123", label: "Jane Smith", icon: <UserWithDot status="active" /> },
    ]
  },
]
```

**Status dot in dropdown icon:**
```tsx
icon: (
  <span className="relative">
    <User className="w-3.5 h-3.5 text-muted-foreground" />
    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-background" />
  </span>
)
```

**Files to edit:**
- `src/components/client-detail/ClientDashboardTab.tsx` -- restructure filterGroups, auto-select, status dots
- `src/components/client-detail/FamilyTreeWidget.tsx` -- fix sizing/overflow
