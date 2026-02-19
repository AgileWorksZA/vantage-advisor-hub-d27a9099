

## Revert Widget Heights on Advisor Dashboard

### What will change

Restore the top-row widgets (`provider-view`, `aum-product`, `top-accounts`) back to their original height of `h: 3` (from `h: 4`), and adjust the `y` offsets for subsequent rows accordingly. Also revert `rowHeight` from `130` back to the default `120`.

### Technical details

**File: `src/pages/Dashboard.tsx`**

1. Update `defaultDashboardLayout` (lines 58-68):
   - Row 0: `h: 4` -> `h: 3` for all three top widgets
   - Row 1: `y: 4` -> `y: 3` for birthdays, clients-value, corporate-actions
   - Row 2: `y: 7` -> `y: 6` for onboarding-progress, client-opportunity-status, portfolio-analysis

2. Revert `rowHeight` (line 325):
   - Change `rowHeight={130}` back to `rowHeight={120}`

Note: The hover effects (`transition-shadow hover:shadow-md`) and grid margin (20px) will remain as they enhance interactivity without affecting widget sizing.

