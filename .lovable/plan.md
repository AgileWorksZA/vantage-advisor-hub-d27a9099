

## Increase "Clients by Age Group" Widget Height

### Change

**File: `src/pages/Dashboard.tsx`**

Update the `age-groups` entry in the `defaultDashboardLayout` array from `h: 3` to `h: 4`, giving it 480px of vertical space (4 rows at 120px each) instead of the current 360px. This provides enough room for the header, column headings, and up to 8 age group rows without clipping.

```
// Before
{ i: 'age-groups', x: 3, y: 6, w: 3, h: 3 }

// After
{ i: 'age-groups', x: 3, y: 6, w: 3, h: 4 }
```

**Note:** Since users may already have a saved layout with the old height, the existing auto-heal logic in `useWidgetLayout.ts` will detect the height mismatch and automatically migrate the saved layout to use the new default height on next load.
