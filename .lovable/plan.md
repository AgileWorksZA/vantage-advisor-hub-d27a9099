

## Replace Animated Gradient Border with Thin Circling Border

### Changes

**File: `src/components/dashboard/ClientOpportunityStatusWidget.tsx`**

- Move the "View All Opportunities" button inside the `!loading` branch so it only renders after data loads
- Replace `animated-gradient-border` wrapper with `animated-border-button animate rounded-full` to match the home screen card button style
- Update button text styling from teal to `text-muted-foreground hover:text-foreground` to match the reference image's neutral style

The existing `animated-border-button` CSS class (already in `index.css`) uses a thin `conic-gradient` border that sweeps around the edge -- exactly matching the reference image. No CSS changes needed.

### Before / After

| Aspect | Before | After |
|--------|--------|-------|
| Border style | Thick rotating gradient fill | Thin sweeping border line |
| Visibility during loading | Always visible | Hidden until loaded |
| CSS class | `animated-gradient-border` | `animated-border-button animate rounded-full` |
| Text color | Teal | Muted foreground |

### Files

| File | Action |
|------|--------|
| `src/components/dashboard/ClientOpportunityStatusWidget.tsx` | Edit - move button inside loaded block, swap border class |

