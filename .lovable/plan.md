

## Simplify Top 5 Accounts Widget

### Overview

The Top 5 Accounts widget will be simplified to show only the 5 largest client accounts for each combination of advisor selection, sorted from largest to smallest value. The "Show more" button will be removed and the name format will be changed from "Surname, FirstName" to "FirstName Surname" to match the birthday widget.

---

## Changes Required

### 1. Dashboard Widget (src/pages/Dashboard.tsx)

**Current behavior (lines 204-250):**
- Shows 7 accounts with `.slice(0, 7)`
- Has "Show more" button when more than 7 accounts exist
- Displays names as-is from the data

**New behavior:**
- Show exactly 5 accounts with `.slice(0, 5)`
- Remove the "Show more" button completely
- Sort accounts by value (largest first) before slicing
- Display names with helper function to convert format

**Code changes:**

1. Add a helper function to convert "Surname, FirstName" to "FirstName Surname":
```typescript
const formatInvestorName = (investor: string): string => {
  // Handle organization names (no comma)
  if (!investor.includes(',')) return investor;
  // Convert "Surname, FirstName" to "FirstName Surname"
  const parts = investor.split(',').map(p => p.trim());
  return `${parts[1]} ${parts[0]}`;
};
```

2. Add a helper function to parse currency values for sorting:
```typescript
const parseValueToNumber = (value: string): number => {
  return parseFloat(value.replace(/[^0-9.-]/g, ''));
};
```

3. Update the Top 5 Accounts table body:
```typescript
{[...filteredRegionalData.topAccounts]
  .sort((a, b) => parseValueToNumber(b.value) - parseValueToNumber(a.value))
  .slice(0, 5)
  .map(account => (
    <tr key={account.investor} className="border-t border-border">
      <td className="py-2 max-w-[120px] truncate" title={account.investor}>
        {formatInvestorName(account.investor)}
      </td>
      <td className="py-2 text-right text-muted-foreground whitespace-nowrap">
        {account.bookPercent}
      </td>
      <td className="py-2 text-right whitespace-nowrap">{account.value}</td>
    </tr>
  ))
}
```

4. Remove the "Show more" button and its conditional wrapper (lines 233-247)

---

### 2. Regional Data (src/data/regionalData.ts)

**Current format:** 
```typescript
{ investor: "Van Niekerk, Marthinus", ... }
{ investor: "Thompson, Richard", ... }
```

**New format:**
```typescript
{ investor: "Marthinus Van Niekerk", ... }
{ investor: "Richard Thompson", ... }
```

**Regions to update:**
- South Africa (ZA) - lines 95-111
- Australia (AU) - lines 221-237
- Canada (CA) - lines 353-369
- United Kingdom (GB) - lines 469-485
- United States (US) - lines 589-609

**Name conversion examples:**

| Current | New |
|---------|-----|
| Van Niekerk, Marthinus | Marthinus Van Niekerk |
| Venter, Isabella | Isabella Venter |
| De Villiers, Jean | Jean De Villiers |
| Thompson, Richard | Richard Thompson |
| Papadopoulos, Konstantinos | Konstantinos Papadopoulos |
| NG Kerk Sinode Oos-Kaapland | NG Kerk Sinode Oos-Kaapland (no change - org) |
| Melbourne Grammar School Foundation | Melbourne Grammar School Foundation (no change - org) |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Dashboard.tsx` | Add format helper, sort by value, slice to 5, remove "Show more" |
| `src/data/regionalData.ts` | Convert all topAccounts investor names to "FirstName Surname" format for ZA, AU, CA, GB, US |

---

## Result

- Widget will always show exactly 5 accounts
- Accounts sorted by value (largest at top)
- Names displayed as "FirstName Surname" matching birthday widget format
- No "Show more" button (cleaner UI)
- Works correctly with all advisor filter combinations

