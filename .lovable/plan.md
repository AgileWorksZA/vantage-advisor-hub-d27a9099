

## Add "Accounts Affected" Column Back to Corporate Actions Widget

### Problem
The "Affected accounts" column was removed during the condensation. It needs to be added back without increasing the widget width (`w: 3`, 350px).

### Solution

#### `src/pages/Dashboard.tsx`
- Add a 4th column header "Accts" (short label to save space) between "Event" and "Ex date"
- Add the corresponding `<td>` displaying `ca.affectedAccounts`
- Tighten existing column max-widths slightly to make room:
  - Code: `max-w-[70px]` (was 80px)
  - Event: `max-w-[80px]` (was 100px)
  - Accts: right-aligned, no truncation needed (small numbers)
  - Ex date: remains as-is

### Files Changed
- `src/pages/Dashboard.tsx` (1 file)

