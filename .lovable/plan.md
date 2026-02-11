

## Move Optimize Button and Remove AI Badge

### Overview
Two changes to the "Next Best Action" card header area in the client summary tab.

### Changes

#### 1. `src/components/client-detail/ClientSummaryTab.tsx`

- **Remove AI badge**: Delete the `<span>` with the gradient AI pill (line 175) from the `CardTitle`.
- **Add Optimize button to header**: Move the Optimize button into the `CardHeader`, aligned right next to the Household toggle (or as the rightmost element). Pass `onOptimise`, `isScanning`, and `hasScanned` state to render the button inline.
- The button should use the same styling as the current one in OpportunitiesTab (teal border, AI pill prefix).

The header layout becomes:
```
Next Best Action          [Household toggle] [Optimize button]
```

#### 2. `src/components/client-detail/next-best-action/OpportunitiesTab.tsx`

- **Remove the Optimize button** from inside the empty-state render (the `onOptimise` button block around lines 72-82).
- Keep accepting `onOptimise`/`isScanning`/`hasScanned` props for now (no breaking change), or simply stop rendering the button -- the parent now owns it.

### Technical Summary

| File | Change |
|------|--------|
| `ClientSummaryTab.tsx` | Remove AI gradient badge from title; add Optimize button aligned right in the `CardHeader` row |
| `OpportunitiesTab.tsx` | Remove the inline Optimize button from the empty-state view |

