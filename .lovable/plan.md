

## Increase Height of New Widgets

The three new widgets (Client Portfolio, Household, Onboarding) and the enhanced Outstanding Documents widget contain significantly more content than simpler widgets but are currently sized at `h: 3` (same as basic widgets). This causes content to overflow or require excessive scrolling.

### Change

**File: `src/components/client-detail/ClientDashboardTab.tsx`**

Update the `defaultClientDashboardLayout` array to increase the height of these 4 widgets from `h: 3` to `h: 4`:

```
Before:
  { i: 'outstanding-docs', x: 3, y: 9, w: 3, h: 3 },
  { i: 'client-portfolio', x: 6, y: 9, w: 3, h: 3 },
  { i: 'household-overview', x: 0, y: 12, w: 3, h: 3 },
  { i: 'onboarding-kyc', x: 3, y: 12, w: 3, h: 3 },

After:
  { i: 'outstanding-docs', x: 3, y: 9, w: 3, h: 4 },
  { i: 'client-portfolio', x: 6, y: 9, w: 3, h: 4 },
  { i: 'household-overview', x: 0, y: 13, w: 3, h: 4 },
  { i: 'onboarding-kyc', x: 3, y: 13, w: 3, h: 4 },
```

The y-coordinates of the bottom row shift from 12 to 13 to account for the taller row above. The reflow algorithm will handle final placement automatically, but correct y-values ensure proper initial ordering.

This is a single-line-range edit in the layout configuration array -- no other files or logic changes needed.
