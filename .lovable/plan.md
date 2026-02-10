

## Replace Jurisdiction & Advisor Lists with Dropdown Selects

### What Changes

Replace the long scrollable lists for jurisdiction and advisor selection with compact single-select dropdown boxes. This keeps the settings screen clean and prevents excessive scrolling.

- **Jurisdiction**: A single `<Select>` dropdown showing the current country with its flag. Selecting a different country switches the region.
- **Advisor**: A single `<Select>` dropdown listing all advisors for the current jurisdiction. Selecting an advisor sets only that advisor as the active filter (single-select replaces multi-select).

### Design

Both dropdowns will use the existing Shadcn `Select` component (`@/components/ui/select`) and sit in a compact row layout with labels and icons, replacing the current full-height list blocks.

### Technical Details

**File: `src/components/mobile/MobileSettingsMenu.tsx`**

1. Import `Select, SelectTrigger, SelectContent, SelectItem, SelectValue` from `@/components/ui/select`.
2. Remove unused `Check` icon import.
3. Replace the **Jurisdiction Selector** block (lines 133-166) with a labeled row containing a `<Select>` dropdown:
   - `value={selectedRegion}`, `onValueChange={setSelectedRegion}`
   - Each `<SelectItem>` shows the flag image + country name
   - Disabled when `isJurisdictionRestricted`
4. Replace the **Advisor Filter** block (lines 168-215) with a labeled row containing a `<Select>` dropdown:
   - `value={selectedAdvisors[0] || ""}`, `onValueChange={(val) => setSelectedAdvisors([val])}`
   - Each `<SelectItem>` shows the advisor initials badge + full name
   - Single-select only (one advisor at a time)
5. Remove "Select All / Deselect All" toggle (no longer needed for single-select).

| File | Action |
|------|--------|
| `src/components/mobile/MobileSettingsMenu.tsx` | Replace list selectors with `<Select>` dropdowns |

