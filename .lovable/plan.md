

## Align Edit Button Colors to Page Theme

### Problem
The edit (pencil) button in the On-Platform Products table uses the teal brand color (`text-[hsl(180,70%,45%)]`), but the edit buttons in the other 5 product tables use `text-muted-foreground` (grey), creating visual inconsistency.

### Solution

**File:** `src/components/client-detail/Client360ViewTab.tsx`

Update the Pencil icon color from `text-muted-foreground` to `text-[hsl(180,70%,45%)]` in 5 locations:

| Table | Line |
|-------|------|
| External Products | 344 |
| Platform Cash | 399 |
| Short Term | 445 |
| Risk Products | 555 |
| Medical Aid | 610 |

Each change is identical -- replacing `text-muted-foreground` with `text-[hsl(180,70%,45%)]` on the Pencil icon className.

