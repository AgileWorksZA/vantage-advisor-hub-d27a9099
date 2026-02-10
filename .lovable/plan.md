

## Auto-Scroll: Position Current Meeting at Top of Visible Area

### Change

In `src/components/mobile/MobileTodayTab.tsx`, update the `scrollIntoView` call (around line 96) from `block: "nearest"` to `block: "start"` so the current/upcoming meeting scrolls to the top of the scrollable area rather than just into view.

### File

| File | Action |
|------|--------|
| `src/components/mobile/MobileTodayTab.tsx` | Update `scrollIntoView` block parameter from `"nearest"` to `"start"` |

### Detail

Single-line change inside the `useEffect` auto-scroll logic:

```text
- scrollIntoView({ behavior: "smooth", block: "nearest" })
+ scrollIntoView({ behavior: "smooth", block: "start" })
```

This ensures the target meeting card aligns to the top of the scrollable container when the Today tab opens.

