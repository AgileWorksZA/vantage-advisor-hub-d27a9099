
## Enhance Family Tree Widget with Hover Cards, Age, and Better Spacing

### Changes

#### 1. Add hover popover on each node showing underlying accounts with AUM

When hovering over a family member or main client node, a popover (using the existing HoverCard component) will appear showing a small table of mock accounts with AUM values. Each member will have 2-3 generated accounts (e.g., "Retirement Annuity", "Unit Trust", "Tax-Free Savings") with AUM breakdowns that sum to the displayed total value.

#### 2. Display age under each person's name

- For the main client node: use `calculateAge(client.date_of_birth)` from `src/types/client.ts`
- For family members: generate a plausible age based on relationship type (Spouse: similar age, Child: younger, Parent: older) since related members don't have DOB data in the relationship record

#### 3. Space out nodes to fill the widget width

- Change the member nodes container from `gap-3` to `justify-around` with wider spacing so nodes spread across the full widget width
- Increase the `max-w` on node name labels for better readability

### Technical Details

**File: `src/components/client-detail/FamilyTreeWidget.tsx`**

1. Import `HoverCard`, `HoverCardTrigger`, `HoverCardContent` from `@/components/ui/hover-card`
2. Import `calculateAge` from `@/types/client`
3. Add a helper function `generateMockAccounts(name, totalValue, currencySymbol)` that returns 2-3 mock accounts (e.g., Retirement Annuity, Unit Trust, Tax-Free Savings) with values that sum to the member's total
4. Add a helper `estimateAge(relationship, clientAge)` that returns a plausible age based on relationship type
5. Update `TreeNode` to:
   - Accept an `age` prop and display it as "(age XX)" next to or below the name
   - Wrap the avatar in a `HoverCardTrigger`, with a `HoverCardContent` showing the accounts table
6. Update the member nodes container:
   - Change from `flex flex-wrap justify-center gap-3` to `flex flex-wrap justify-around gap-4 w-full` to spread nodes across the full width
7. Pass `client.date_of_birth` through to compute the main client's age, and derive ages for members

### Files to Edit
- `src/components/client-detail/FamilyTreeWidget.tsx` -- all changes concentrated here
