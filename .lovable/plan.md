

## Remove Meeting Header Section

**`src/components/client-detail/ClientMeetingsTab.tsx`** — Lines 163-174

Remove the title/date/badge block above the progress bar, keeping the progress bar and outer container intact.

```tsx
// Before (lines 163-174)
<div className="px-4 pt-4 pb-0 border-b border-border">
  <div className="flex items-center justify-between mb-2">
    <div>
      <h2>...</h2>
      <p>...</p>
    </div>
    <Badge>...</Badge>
  </div>
  <WebMeetingProgressBar ... />
</div>

// After
<div className="px-4 pt-2 pb-0 border-b border-border">
  <WebMeetingProgressBar ... />
</div>
```

Remove lines 164-174 (the title/date/badge div), adjust top padding from `pt-4` to `pt-2` since there's less content.

