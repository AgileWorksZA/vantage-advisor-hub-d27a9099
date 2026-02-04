

# Swap Portfolio/Insights Icons and Rename Email to Message

## Summary

This plan updates all sidebar navigation definitions across the application to:
1. **Swap icons**: Portfolio will use `LineChart`, Insights will use `Briefcase`
2. **Rename label**: Change "Email" to "Message" in Dashboard.tsx (the only file still using "Email")

## Current State Analysis

| Page | Portfolio Icon | Insights Icon | Email Label |
|------|---------------|---------------|-------------|
| Dashboard.tsx | Briefcase | LineChart | "Email" ⚠️ |
| Clients.tsx | Briefcase | LineChart | "Message" ✓ |
| ClientDetail.tsx | Briefcase | LineChart | "Message" ✓ |
| Portfolio.tsx | Briefcase | LineChart | "Message" ✓ |
| Email.tsx | Briefcase | LineChart | "Message" ✓ |
| ComposeEmail.tsx | Briefcase | LineChart | "Message" ✓ |
| Calendar.tsx | Briefcase | LineChart | "Message" ✓ |
| Tasks.tsx | Briefcase | LineChart | "Message" ✓ |
| Insights.tsx | Briefcase | LineChart | "Message" ✓ |
| Practice.tsx | Briefcase | LineChart | "Message" ✓ |
| AppLayout.tsx | Briefcase | LineChart | "Message" ✓ |

## Changes Required

### Files to Modify (11 files)

All files with `sidebarItems` need the icon swap:

1. **src/pages/Dashboard.tsx** (lines 26-28, 42-44, 30-32)
   - Change Portfolio icon: `Briefcase` → `LineChart`
   - Change Insights icon: `LineChart` → `Briefcase`
   - Change Email label: `"Email"` → `"Message"`

2. **src/pages/Clients.tsx** (lines 70, 74)
   - Change Portfolio icon: `Briefcase` → `LineChart`
   - Change Insights icon: `LineChart` → `Briefcase`

3. **src/pages/ClientDetail.tsx** (lines 56, 60)
   - Change Portfolio icon: `Briefcase` → `LineChart`
   - Change Insights icon: `LineChart` → `Briefcase`

4. **src/pages/Portfolio.tsx** (lines 28, 32)
   - Change Portfolio icon: `Briefcase` → `LineChart`
   - Change Insights icon: `LineChart` → `Briefcase`

5. **src/pages/Email.tsx** (lines 56, 60)
   - Change Portfolio icon: `Briefcase` → `LineChart`
   - Change Insights icon: `LineChart` → `Briefcase`

6. **src/pages/ComposeEmail.tsx** (lines 40, 44)
   - Change Portfolio icon: `Briefcase` → `LineChart`
   - Change Insights icon: `LineChart` → `Briefcase`

7. **src/pages/Calendar.tsx** (lines 85, 89)
   - Change Portfolio icon: `Briefcase` → `LineChart`
   - Change Insights icon: `LineChart` → `Briefcase`

8. **src/pages/Tasks.tsx** (lines 72, 76)
   - Change Portfolio icon: `Briefcase` → `LineChart`
   - Change Insights icon: `LineChart` → `Briefcase`

9. **src/pages/Insights.tsx** (lines 133, 137)
   - Change Portfolio icon: `Briefcase` → `LineChart`
   - Change Insights icon: `LineChart` → `Briefcase`

10. **src/pages/Practice.tsx** (lines 40, 44)
    - Change Portfolio icon: `Briefcase` → `LineChart`
    - Change Insights icon: `LineChart` → `Briefcase`

11. **src/components/layout/AppLayout.tsx** (lines 22, 26)
    - Change Portfolio icon: `Briefcase` → `LineChart`
    - Change Insights icon: `LineChart` → `Briefcase`

## After Changes

| Item | Before | After |
|------|--------|-------|
| Portfolio icon | Briefcase (💼) | LineChart (📈) |
| Insights icon | LineChart (📈) | Briefcase (💼) |
| Message tab label | "Email" in Dashboard | "Message" everywhere |

## Technical Notes

- No import changes needed since both `Briefcase` and `LineChart` are already imported in all files
- The icon swap is a simple reference swap in the `sidebarItems` array
- This is a cosmetic change with no functional impact

