

## Fix Widget Heights and Birthday Overflow

### Problem Summary

1. **Birthday widget overflow**: The widget displays 10 birthday entries, but the widget height (`h: 3` × 120px = 360px) isn't enough space. Text is overflowing the bottom border.

2. **Insights widgets too tall**: Insights widgets use `h: 4` (480px) while Dashboard widgets use `h: 3` (360px). The user wants them to match.

---

## Solution

### 1. Birthday Widget - Show Fewer Rows

Instead of displaying all 10 birthdays (which overflow), display only the first 6 birthdays. This fits within the widget height without overflow.

**File**: `src/pages/Dashboard.tsx`

**Change**: Add `.slice(0, 6)` to the birthday data mapping:

```tsx
// Before
{regionalData.birthdays.map(person => (
  <tr key={person.name}>...</tr>
))}

// After
{regionalData.birthdays.slice(0, 6).map(person => (
  <tr key={person.name}>...</tr>
))}
```

This displays only the first 6 upcoming birthdays, preventing overflow while still providing useful information.

---

### 2. Insights Widgets - Match Dashboard Height

Update the Insights layout from `h: 4` to `h: 3` for all standard widgets to match the Dashboard.

**File**: `src/pages/Insights.tsx`

**Change**: Update `defaultInsightsLayout`:

| Widget | Current Height | New Height |
|--------|---------------|------------|
| commission-type | h: 4 | h: 3 |
| commission-earned | h: 4 | h: 3 |
| monthly-commission | h: 4 | h: 3 |
| commission-snapshot | h: 4 | h: 3 |
| commission-summary | h: 4 | h: 3 |
| leaderboard | h: 4 | h: 3 |

```tsx
const defaultInsightsLayout: WidgetLayout[] = [
  { i: 'commission-type', x: 0, y: 0, w: 3, h: 3 },
  { i: 'commission-earned', x: 3, y: 0, w: 3, h: 3 },
  { i: 'monthly-commission', x: 6, y: 0, w: 3, h: 3 },
  { i: 'commission-snapshot', x: 9, y: 0, w: 3, h: 3 },
  { i: 'commission-summary', x: 0, y: 3, w: 6, h: 3 },
  { i: 'leaderboard', x: 6, y: 3, w: 3, h: 3 },
];
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Dashboard.tsx` | Limit birthday display to 6 rows using `.slice(0, 6)` |
| `src/pages/Insights.tsx` | Change all widget heights from `h: 4` to `h: 3` |

---

## Result

- Birthday widget displays 6 entries that fit within the widget bounds
- No text overflow at the bottom of the widget border
- Insights widgets match Dashboard widget height (360px)
- Consistent visual appearance across both pages

