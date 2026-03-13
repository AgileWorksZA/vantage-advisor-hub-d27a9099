

## Fix Scrollbar Spacing

The vertical scrollbar (`w-2.5` = 10px) is too wide and creates visual crowding in the meeting list panel. The content also has `pr-2` padding to accommodate it, adding unnecessary spacing.

### Changes

**`src/components/client-detail/ClientMeetingsTab.tsx`**
- Remove `pr-2` from the inner content div (line 109) — the scrollbar overlay will handle spacing naturally
- Change to `pr-3` to give just enough room for the narrower scrollbar

**`src/components/ui/scroll-area.tsx`**
- Reduce vertical scrollbar width from `w-2.5` to `w-1.5` (6px → thinner, more modern look)
- Remove `border-l border-l-transparent` which adds extra invisible spacing

