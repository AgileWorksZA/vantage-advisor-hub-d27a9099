

## Limit Widget Rows and Add "Show More" Link

### Overview

Update the Birthdays and Top 5 Accounts widgets to consistently display a maximum of 7 rows, with a "show more" link appearing when additional entries are available. This prevents content from overflowing the widget borders.

---

## Implementation

### File: `src/pages/Dashboard.tsx`

#### 1. Add State for Expanded Widgets

Add state to track which widgets are expanded (for future modal/expanded view):

```typescript
const [showAllBirthdays, setShowAllBirthdays] = useState(false);
const [showAllAccounts, setShowAllAccounts] = useState(false);
```

#### 2. Update Top 5 Accounts Widget (lines 224-230)

**Current code:**
```typescript
{filteredRegionalData.topAccounts.map(account => <tr key={account.investor} className="border-t border-border">
    <td className="py-2">{account.investor}</td>
    <td className="py-2 text-right text-muted-foreground">{account.bookPercent}</td>
    <td className="py-2 text-right">{account.value}</td>
  </tr>)}
```

**New code:**
```typescript
{filteredRegionalData.topAccounts.slice(0, 7).map(account => <tr key={account.investor} className="border-t border-border">
    <td className="py-2">{account.investor}</td>
    <td className="py-2 text-right text-muted-foreground">{account.bookPercent}</td>
    <td className="py-2 text-right">{account.value}</td>
  </tr>)}
</tbody>
</table>
{filteredRegionalData.topAccounts.length > 7 && (
  <button 
    className="w-full text-center text-xs text-primary hover:underline mt-2"
    onClick={() => setShowAllAccounts(true)}
  >
    Show more ({filteredRegionalData.topAccounts.length - 7} more)
  </button>
)}
```

#### 3. Update Birthdays Widget (lines 316-322)

**Current code:**
```typescript
{filteredRegionalData.birthdays.slice(0, 6).map(person => <tr key={person.name} className="border-t border-border">
    <td className="py-1.5">{person.name}</td>
    <td className="py-1.5 text-right text-muted-foreground">{person.nextBirthday}</td>
    <td className="py-1.5 text-right">{person.age}</td>
  </tr>)}
```

**New code:**
```typescript
{filteredRegionalData.birthdays.slice(0, 7).map(person => <tr key={person.name} className="border-t border-border">
    <td className="py-1.5">{person.name}</td>
    <td className="py-1.5 text-right text-muted-foreground">{person.nextBirthday}</td>
    <td className="py-1.5 text-right">{person.age}</td>
  </tr>)}
</tbody>
</table>
{filteredRegionalData.birthdays.length > 7 && (
  <button 
    className="w-full text-center text-xs text-primary hover:underline mt-2"
    onClick={() => setShowAllBirthdays(true)}
  >
    Show more ({filteredRegionalData.birthdays.length - 7} more)
  </button>
)}
```

---

## Summary of Changes

| Location | Change |
|----------|--------|
| Line 56-58 | Add `showAllBirthdays` and `showAllAccounts` state variables |
| Lines 224-231 | Add `.slice(0, 7)` to topAccounts mapping and add "Show more" link |
| Lines 316-323 | Change `.slice(0, 6)` to `.slice(0, 7)` and add "Show more" link |

---

## Visual Result

**Before:**
- Top Accounts: Shows all entries (can overflow)
- Birthdays: Shows 6 entries (inconsistent with request)

**After:**
- Both widgets consistently show max 7 rows
- "Show more (X more)" link appears at bottom when there are additional entries
- Link is styled as primary color text with hover underline
- Clicking the link can trigger an expanded view (state prepared for future modal implementation)

---

## Technical Notes

- The row limit of 7 ensures consistent widget height across all advisor filter selections
- The "show more" text dynamically shows the count of hidden entries
- State variables are prepared for potential modal/dialog implementation to show full lists

