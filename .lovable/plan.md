

# Increase TLH Dashboard Viewport Coverage to 88%

## Change

Update the dialog sizing from 80% to 88% viewport coverage in **`src/components/tax-loss-harvesting/TLHDashboard.tsx`** (line 204-205).

Two class updates:
- `max-w-[80vw]` becomes `max-w-[88vw]`
- `max-h-[80vh]` becomes `max-h-[88vh]` (on both the `DialogContent` and the inner scrollable `div`)

