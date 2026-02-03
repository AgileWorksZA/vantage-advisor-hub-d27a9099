
# Condense Recent Activity to 7-8 Items

## Overview

Modify the Recent Activity widget to display 7-8 activities in a more compact layout, fitting within the same visual space as the current 5-item display.

---

## File to Modify

| File | Changes |
|------|---------|
| `src/components/client-detail/ClientSummaryTab.tsx` | Add 3 more activities, reduce padding/spacing |

---

## Change Details

### 1. Add 3 more activity items to the demo data (after line 77)

Add these entries to reach 8 total activities:

```typescript
{
  id: 6,
  type: "product_sold",
  title: "Premium adjusted",
  description: 'Updated premium on "Sanlam Investment"',
  timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000), // 3 days ago
},
{
  id: 7,
  type: "note_added",
  title: "Call logged",
  description: 'Follow-up call regarding policy renewal',
  timestamp: new Date(Date.now() - 96 * 60 * 60 * 1000), // 4 days ago
},
{
  id: 8,
  type: "document_uploaded",
  title: "Document signed",
  description: 'Signed "Beneficiary Nomination Form"',
  timestamp: new Date(Date.now() - 120 * 60 * 60 * 1000), // 5 days ago
},
```

### 2. Reduce icon size (lines 81-94)

Change icon classes from `w-5 h-5` to `w-4 h-4` for a more compact look.

### 3. Condense activity row layout (lines 229-247)

Current layout uses:
- `py-3` padding on each row
- `gap-3` between icon and text
- Separate lines for title, description, and timestamp

Change to a more compact single-line layout:
- Reduce to `py-1.5` padding
- Reduce to `gap-2` between icon and text
- Combine title and timestamp on one line
- Keep description on second line with smaller text

```tsx
<div 
  key={activity.id} 
  className="flex gap-2 py-1.5 border-b border-border/50 last:border-0"
>
  <div className="shrink-0 mt-0.5">
    {getActivityIcon(activity.type)}
  </div>
  <div className="flex-1 min-w-0">
    <div className="flex items-center justify-between gap-2">
      <p className={`font-medium text-xs ${getTitleColor(activity.type)}`}>
        {activity.title}
      </p>
      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
        {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
      </span>
    </div>
    <p className="text-xs text-muted-foreground truncate">
      {activity.description}
    </p>
  </div>
</div>
```

### 4. Reduce "Show more" section padding (lines 251-260)

Change from `pt-4 mt-4` to `pt-2 mt-2` for tighter spacing.

---

## Result

- 8 recent activities displayed in a compact two-line format per item
- Title and timestamp on the same row
- Truncated description on the second row
- Smaller icons (4x4 instead of 5x5)
- Reduced vertical padding between items
- Same overall card size as before
