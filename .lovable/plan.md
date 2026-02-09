

## Condense Corporate Actions Widget to Standard Size

### Problem
The corporate actions widget is currently `w: 6` (double width). It needs to match the other widgets at `w: 3` (350px), with content condensed to fit.

### Solution

#### 1. `src/pages/Dashboard.tsx` -- Layout
- Change `corporate-actions` back to `w: 3` and reposition to `{ x: 6, y: 3 }` (third column, second row)

#### 2. `src/pages/Dashboard.tsx` -- Widget Content
Condense the table to fit in 350px:
- Reduce to 3 visible columns: **Code** (investment code), **Event**, and **Ex date**
- Drop the CAID, Affected accounts, and menu icon columns from the table
- Use smaller text (`text-xs`) throughout the table body
- Shrink the Select trigger width from `w-[130px]` to `w-[110px]`
- Truncate long investment codes and event types with `max-w` and `truncate`

The result will be a compact table that fits the standard 350px widget width while still showing the essential information.

### Files Changed
- `src/pages/Dashboard.tsx` (1 file)
