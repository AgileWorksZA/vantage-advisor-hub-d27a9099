

## Rename Column Heading in On-Platform Investment Products

### Change
In `src/components/client-detail/Client360ViewTab.tsx`, rename the "Investment house" column header in the On-Platform Investment Products table to "Provider".

### Technical Detail
- Update the `<TableHead>` text from `Investment house` to `Provider` (single line change)
- No other references or data fields need updating -- this is a display-only label change

