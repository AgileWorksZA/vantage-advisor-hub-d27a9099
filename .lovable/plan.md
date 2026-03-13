

## Fix Scrollbar Wrapping & Add Detail Popups to Prep Step

### Issues Identified

1. **Scrollbar wrapping**: The left meeting list's `ScrollArea` has content that wraps improperly — the meeting cards need `overflow-hidden` on the outer container and the `ScrollArea` needs proper height constraints.

2. **No detail popups**: The web `WebPrepStep` renders `ContextRow` as plain divs, unlike the mobile `PrepStep` which has clickable rows with `onTagClick` callbacks that open `MobileContextDetailView`. The web version needs equivalent popups using `Dialog` components.

### Changes

**`src/components/client-detail/ClientMeetingsTab.tsx`**
- Add `overflow-hidden` to the left panel container (`w-72 shrink-0` → `w-72 shrink-0 overflow-hidden`)
- Ensure the `ScrollArea` properly constrains its height

**`src/components/client-detail/meeting-steps/WebPrepStep.tsx`** — Major enhancement
1. Add a `DetailDialog` component using Radix `Dialog` that shows detail views for notes, communications, tasks, documents, products, and opportunities (same content as `MobileContextDetailView` but in a dialog)
2. Convert all `ContextRow` elements from static divs to clickable buttons (matching mobile `PrepStep` pattern)
3. Add local state for `selectedDetail: DetailView | null` to control which dialog is open
4. Import `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle` from UI components
5. Import `Badge`, `Progress` for task detail rendering
6. Each detail type shows:
   - **Note**: Subject, date, priority, interaction type
   - **Communication**: Subject, channel, date
   - **Task**: Title, type, priority, status, due date, progress bar, overdue badge
   - **Document**: Name, status, category, expiry date
   - **Product**: Product name, category, current value, status
   - **Opportunity**: Type, potential revenue, confidence, status, suggested action, reasoning

### File Summary

| File | Change |
|------|--------|
| `ClientMeetingsTab.tsx` | Add `overflow-hidden` to left panel to fix scroll wrapping |
| `WebPrepStep.tsx` | Add clickable rows + `Dialog`-based detail popups for all engagement/action types |

