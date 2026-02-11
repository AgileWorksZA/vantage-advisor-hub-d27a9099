

## Resize Email Compose to Fit Mobile Frame

### Overview
The `/email/compose` page (`ComposeEmail.tsx`) is currently desktop-only with a fixed sidebar, wide padding, and large form elements that overflow the mobile phone frame (393x852px). This plan makes the page responsive so it fits within the mobile viewport.

### Changes

#### `src/pages/ComposeEmail.tsx`

1. **Hide sidebar on mobile**: Add `hidden md:flex` to the sidebar `<aside>` so it disappears on small screens
2. **Responsive padding**: Change `p-6` to `p-3 md:p-6` on the form container
3. **Responsive max-width**: Change `max-w-4xl` to `w-full max-w-4xl` so it fills available space on mobile
4. **Stack action bar buttons**: Make the action bar buttons wrap on small screens with `flex-wrap`
5. **Responsive form labels**: Hide the fixed-width labels (`w-16`) on mobile and stack fields vertically instead of side-by-side using `flex-col md:flex-row`
6. **Reduce min-width on recipient inputs**: Change `min-w-[150px]` to `min-w-[100px]` so they fit on narrow screens
7. **Responsive metadata section padding**: Change `p-4` to `p-3 md:p-4` on the metadata card

### Technical Details

| Element | Current | Mobile |
|---------|---------|--------|
| Sidebar | Always visible (`w-16`) | Hidden (`hidden md:flex`) |
| Form padding | `p-6` | `p-3 md:p-6` |
| Field layout | Horizontal (`flex items-center gap-3`) | Vertical on mobile (`flex flex-col md:flex-row md:items-center gap-2 md:gap-3`) |
| Label width | Fixed `w-16` | Full width on mobile (`w-full md:w-16`) |
| Action bar | Single row | Wrapping (`flex-wrap`) |
| Recipient input min-width | `min-w-[150px]` | `min-w-[100px]` |

### Result
The compose page will stack vertically on mobile screens, hiding the sidebar and using full-width form fields, while maintaining the current desktop layout unchanged.

