

## Space Out Dashboard Widgets & Use Available Whitespace

### Goal
Make the client dashboard feel more spacious and interactive by increasing widget heights, adding breathing room, and better utilizing the available screen real estate.

### Changes

#### 1. Increase widget heights strategically

**File: `src/components/client-detail/ClientDashboardTab.tsx`**

Update `defaultClientDashboardLayout` to give widgets more vertical space. Key widgets that benefit from extra height (charts, trees, tables) get `h: 4`, while simpler info cards stay at `h: 3`:

```
Row 0: portfolio-overview (h:4), valuation-change (h:4), geo-diversification (h:4)
Row 1: family-tree (h:4, y:4), top-opportunities (h:4, y:4), opp-breakdown (h:4, y:4)
Row 2: opp-value-summary (h:3, y:8), action-priority (h:3, y:8), key-dates (h:3, y:8)
Row 3: advisor-accounts (h:3, y:11), outstanding-docs (h:3, y:11), client-portfolio (h:3, y:11)
Row 4: household-overview (h:3, y:14), onboarding-kyc (h:3, y:14)
```

This gives the top two rows (charts, opportunities, family tree) more breathing room while keeping simpler info widgets compact.

#### 2. Increase grid row height

**File: `src/components/client-detail/ClientDashboardTab.tsx`**

Pass a larger `rowHeight` prop to `DraggableWidgetGrid`:
- Change from the default `120` to `130` to add vertical breathing room between rows.

#### 3. Increase grid margin

**File: `src/components/widgets/DraggableWidgetGrid.tsx`**

Increase `GRID_MARGIN` from `16` to `20` to add more horizontal and vertical gaps between widgets, making the layout feel less cramped.

#### 4. Add hover interaction to widget cards

**File: `src/components/client-detail/ClientDashboardTab.tsx`**

Add a subtle hover effect to widget Card components by updating their className to include:
- `transition-shadow hover:shadow-md` -- gives a lift effect on hover
- This makes widgets feel interactive and clickable

### Summary of visual impact
- Top-row chart widgets (Portfolio, Valuation, Geo Map) become taller and more prominent
- Family Tree and Opportunities get extra height for better readability
- Wider gaps between all widgets create a cleaner, more modern feel
- Hover shadows add interactivity cues

### Files to Edit
- `src/components/client-detail/ClientDashboardTab.tsx` -- layout heights, rowHeight prop, hover classes
- `src/components/widgets/DraggableWidgetGrid.tsx` -- grid margin increase

