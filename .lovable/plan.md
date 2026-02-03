

## Enable All Button Toggle for Advisor Selection

### Overview

Currently, the "All" button in the AdvisorFilter component only selects all advisors when clicked. This change will make it function as a toggle - clicking it when all advisors are selected will unselect all, and clicking when some/none are selected will select all.

---

## Implementation

### File: `src/components/dashboard/AdvisorFilter.tsx`

**Current behavior (line 34-36):**
```typescript
const selectAll = () => {
  setSelectedAdvisors(advisors.map((a) => a.initials));
};
```

**New behavior - rename to `toggleAll` and add toggle logic:**
```typescript
const toggleAll = () => {
  if (isAllSelected) {
    setSelectedAdvisors([]);
  } else {
    setSelectedAdvisors(advisors.map((a) => a.initials));
  }
};
```

**Update the button onClick (line 77):**
```typescript
// Change from:
onClick={selectAll}

// To:
onClick={toggleAll}
```

---

## Summary of Changes

| Location | Change |
|----------|--------|
| Line 34-36 | Rename `selectAll` to `toggleAll` and add conditional logic to toggle between selecting all and unselecting all |
| Line 77 | Update `onClick` handler to use `toggleAll` |

---

## Result

- Clicking "All" when all advisors are selected → Unselects all advisors
- Clicking "All" when some or no advisors are selected → Selects all advisors
- Visual feedback (checkmark) continues to show when all are selected

