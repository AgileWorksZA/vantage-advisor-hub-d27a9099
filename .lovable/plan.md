

## Revert "Clients by Age Group" Widget to Standard Size

### Change

**File: `src/pages/Dashboard.tsx`**

Revert the `age-groups` widget height from `h: 4` back to `h: 3` so it matches all other dashboard widgets (350px x 360px).

```
// Before
{ i: 'age-groups', x: 3, y: 6, w: 3, h: 4 }

// After
{ i: 'age-groups', x: 3, y: 6, w: 3, h: 3 }
```

The content will scroll within the card if it overflows, consistent with how other widgets handle overflow (e.g., Birthdays). The auto-heal logic in `useWidgetLayout.ts` will automatically migrate any saved layouts to the new height.

