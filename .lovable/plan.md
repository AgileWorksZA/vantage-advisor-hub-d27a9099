

## Auto-Populate Fund Allocations to 100%

### Current Behavior
When funds are added to the comparison portfolio, they start with 0% allocation. The user must click "Auto Balance" to distribute evenly.

### New Behavior
1. First fund added: automatically gets 100%
2. Second fund added: both get 50%
3. Third fund added: all get 33.3% (last fund gets remainder to total exactly 100%)
4. When a fund is removed: remaining funds re-split evenly
5. Once the user manually edits any allocation value, auto-splitting stops entirely
6. The "Auto Balance" button remains available to re-trigger even splitting at any time

### Technical Changes

**File: `src/components/client-detail/ClientPerformanceTab.tsx`**

1. Add a `userHasEditedAllocation` ref (using `useRef<boolean>(false)`) to track whether the user has manually changed any allocation value. A ref is used instead of state to avoid triggering re-renders.

2. Modify `addFund` (line 167): After adding the new fund, if `userHasEditedAllocation` is `false`, auto-balance all funds evenly (same logic as `autoBalance`).

3. Modify `removeFund` (line 177): After removing the fund, if `userHasEditedAllocation` is `false` and there are remaining funds, auto-balance them evenly.

4. Modify `updateAllocation` (line 181): Set `userHasEditedAllocation.current = true` so future add/remove operations no longer auto-balance.

5. Modify `autoBalance` (line 187): Reset `userHasEditedAllocation.current = false` since the user is explicitly requesting even distribution -- subsequent adds/removes should continue auto-balancing.

6. When all comparison funds are cleared (length becomes 0), reset `userHasEditedAllocation.current = false` so a fresh start auto-balances again.

### Implementation Detail

```typescript
const userHasEditedAllocation = useRef(false);

const evenSplit = (funds: ComparisonFund[]): ComparisonFund[] => {
  const count = funds.length;
  if (count === 0) return funds;
  const each = +(100 / count).toFixed(1);
  return funds.map((f, i) => ({
    ...f,
    allocation: i === count - 1 ? +(100 - each * (count - 1)).toFixed(1) : each,
  }));
};

const addFund = (fund: AdminFund) => {
  if (comparisonFunds.find((c) => c.fundId === fund.id)) return;
  setComparisonFunds((prev) => {
    const next = [...prev, { fundId: fund.id, name: fund.name, code: fund.code || "", allocation: 0 }];
    return userHasEditedAllocation.current ? next : evenSplit(next);
  });
  setFundSearch("");
  setShowFundDropdown(false);
};

const removeFund = (fundId: string) => {
  setComparisonFunds((prev) => {
    const next = prev.filter((f) => f.fundId !== fundId);
    if (next.length === 0) userHasEditedAllocation.current = false;
    return userHasEditedAllocation.current ? next : evenSplit(next);
  });
};

const updateAllocation = (fundId: string, value: number) => {
  userHasEditedAllocation.current = true;
  setComparisonFunds((prev) =>
    prev.map((f) => (f.fundId === fundId ? { ...f, allocation: value } : f))
  );
};

const autoBalance = () => {
  // ... existing even-split logic ...
  userHasEditedAllocation.current = false;
};
```

No database changes needed. Single file modification.

