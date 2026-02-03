
Goal
- Make Insights widgets behave like Dashboard: keep the “original” widget width (12-col proportions), and when the viewport narrows, wrap widgets onto new rows instead of continuing to shrink.
- Prevent the Insights layout from getting “corrupted” again by automatic responsive reflows being saved to the database.

What I found (why Dashboard “works” but Insights doesn’t)
1) Insights currently has a saved layout in the backend that was produced during the earlier “dynamic columns” iterations.
   - The saved Insights layout contains widths that should never exist in this app (e.g. `commission-summary` saved as `w: 4` even though resizing is disabled and its default is `w: 6`).
   - Because that broken layout is loaded on Insights, it can render oddly and behave differently than Dashboard.
2) The grid currently only reduces column count (wrap trigger) once each column becomes smaller than `MIN_COL_WIDTH` (currently 80px).
   - If the user resizes only “somewhat” smaller, columns can shrink (widgets get narrower) without crossing that threshold, so wrapping won’t happen yet.
   - This is especially noticeable on Insights due to chart readability.

Fix strategy (high level)
A) Make wrapping trigger earlier on Insights (use a larger “minimum column width”) so widgets don’t get squeezed.
B) Stop persisting layout changes that are caused by responsive reflow/compaction (resize-driven), so the database layout remains a stable “canonical” layout.
C) Detect and automatically reset/migrate legacy/invalid saved layouts for Insights so it loads correctly immediately.

Planned code changes

1) DraggableWidgetGrid: make wrap threshold configurable per page
File: src/components/widgets/DraggableWidgetGrid.tsx

- Add an optional prop, e.g.:
  - `minColWidth?: number` (or `wrapColMinWidthPx?: number`)
  - Default remains whatever keeps Dashboard unchanged (likely keep 80 as default to avoid regressions).
- Use this prop instead of the hard-coded `MIN_COL_WIDTH`.

Why
- Dashboard can keep the current behavior.
- Insights can request earlier wrapping (e.g. 100–110px per column) to preserve the “original” widget readability.

Implementation detail
- Replace the constant:
  - from: `const MIN_COL_WIDTH = 80;`
  - to: `const DEFAULT_MIN_COL_WIDTH = 80;` and inside component: `const minColWidth = props.minColWidth ?? DEFAULT_MIN_COL_WIDTH;`
- Update:
  - `effectiveColWidth < MIN_COL_WIDTH` → `effectiveColWidth < minColWidth`

2) DraggableWidgetGrid: prevent resize-driven layout saving (stop “layout corruption”)
File: src/components/widgets/DraggableWidgetGrid.tsx

Problem
- `Responsive` fires `onLayoutChange` for many reasons, including:
  - initial compaction
  - breakpoint/cols changes
  - width changes (responsive)
- Today we forward that directly to `useWidgetLayout.onLayoutChange`, which then upserts to the backend. That means simply resizing can permanently rewrite the stored layout into a “mobile-wrapped” shape.

Change
- Do not call the parent’s persistence callback from `onLayoutChange`.
- Instead:
  - Use `onDragStop` (and optionally `onDragStart`) to persist only after a user action.
  - Keep `onLayoutChange` either unused or only for internal bookkeeping (but not persistence).

Concrete approach
- Remove (or neutralize) the current:
  - `onLayoutChange={(currentLayout) => onLayoutChange(currentLayout as WidgetLayout[])}`
- Add:
  - `onDragStop={(currentLayout) => onLayoutChange(currentLayout as WidgetLayout[])}`
- Outcome:
  - Responsive reflow still happens visually.
  - Only explicit drag operations update and persist the canonical layout.

Optional stability improvement (if needed)
- Add `key={visibleCols}` to the `Responsive` component to guarantee a clean recalculation when column count changes. This can help if the Insights page is “sticking” to a prior cols computation.

3) Insights: pass a higher minColWidth to trigger wrapping earlier
File: src/pages/Insights.tsx

- Change:
  - `<DraggableWidgetGrid layout={layout} onLayoutChange={onLayoutChange}>`
  - to:
    `<DraggableWidgetGrid layout={layout} onLayoutChange={onLayoutChange} minColWidth={100}>` (exact value can be adjusted; 100 is aligned with “~100px per column” original intent)

Expected behavior
- As you shrink the viewport, once the grid would otherwise squeeze below ~100px columns, it will reduce visible columns and wrap (instead of shrinking further).

4) useWidgetLayout: auto-heal legacy/invalid Insights layouts on load
File: src/hooks/useWidgetLayout.ts

Why this is needed now
- The Insights record currently stored in the backend appears to be legacy/corrupted (e.g. contains widths that don’t match defaults, even though resizing is disabled).
- Even after we fix wrapping/persistence, that bad saved layout would still be loaded and keep causing problems until manually reset.

How we’ll detect “invalid”
- Build a lookup from `defaultLayout` by widget id (`i`).
- If any saved layout item has a `w` that differs from its default `w` (for that widget id), treat the saved layout as legacy/invalid.
  - This is safe because widgets are not resizable, so `w` should not drift from defaults in a healthy canonical layout.

What we’ll do when invalid
- Fall back to `defaultLayout` for that page.
- Immediately overwrite/upsert the corrected layout back to the backend so subsequent loads are stable.

This keeps user experience simple
- Users don’t have to “reset layout” manually.
- Insights will start loading correctly again right away.

Testing plan (end-to-end)
1) Insights page load
- Hard refresh on /insights
- Confirm widgets render with expected default widths (e.g. `w:3` cards look like the original 4-per-row layout on wide screens).
2) Responsive wrapping on Insights
- Gradually resize the window narrower
- Confirm: widgets wrap into fewer columns/rows rather than continuing to shrink below the original readable width.
3) Persistence safety
- Resize the window and refresh
- Confirm: the layout does not get “rewritten” into a narrow/mobile arrangement just because you resized.
4) Drag persistence still works
- Drag a widget to a new position on Insights
- Refresh
- Confirm: the new arrangement persists.

Files that will be modified
- src/components/widgets/DraggableWidgetGrid.tsx
  - Add configurable minColWidth
  - Persist layout only on drag stop (not on resize-driven layout changes)
  - (Optional) force recalculation on visibleCols change via key
- src/pages/Insights.tsx
  - Pass minColWidth (e.g. 100) to preserve original width and wrap earlier
- src/hooks/useWidgetLayout.ts
  - Validate loaded layout widths vs defaults
  - Auto-reset/upsert default layout if legacy/invalid is detected

Notes / trade-offs
- If a user drags widgets while on a narrow layout (reduced visible cols), the saved x/y may reflect that narrower grid. If this becomes undesirable, we can further refine persistence so it only saves “desktop” (12-col) drags, or we can map positions back to 12-col space. For now, the critical fix is: stop saving purely responsive reflow changes and heal the existing broken Insights layout.
