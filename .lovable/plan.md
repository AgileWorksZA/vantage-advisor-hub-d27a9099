

## Link Dashboard "Show More" to Clients Page with Filters

### Overview

When users click "Show more" on the **Birthdays** or **Top 5 Accounts** widgets on the Dashboard, they should be navigated to the Clients page with the relevant client names pre-populated as search filters. Since the Dashboard uses regional mock data (not database records), we'll pass the client names as URL query parameters that the Clients page will use to filter the displayed list.

---

## Current Behavior

- **Birthdays widget**: Shows 7 birthday entries, then "Show more (X more)" button that sets `showAllBirthdays(true)` (unused state)
- **Top 5 Accounts widget**: Shows 7 accounts, then "Show more" button that sets `showAllAccounts(true)` (unused state)
- Both buttons currently do nothing visible

## Proposed Behavior

- **Show more on Birthdays**: Navigate to `/clients?filter=birthdays` with names extracted from birthday data
- **Show more on Top Accounts**: Navigate to `/clients?filter=accounts` with names extracted from top accounts data
- Clients page reads URL params and filters the table accordingly

---

## Implementation

### File 1: `src/pages/Dashboard.tsx`

**Changes:**
1. Remove unused `showAllBirthdays` and `showAllAccounts` state variables
2. Update "Show more" buttons to navigate to Clients page with query parameters

**Birthdays "Show more" button:**
```typescript
onClick={() => {
  // Extract client names from birthdays (format: "Andre Thomas Coetzer")
  const names = filteredRegionalData.birthdays.map(b => b.name).join(',');
  navigate(`/clients?filter=birthdays&names=${encodeURIComponent(names)}`);
}}
```

**Top Accounts "Show more" button:**
```typescript
onClick={() => {
  // Extract investor names from top accounts (format: "Van Niekerk, Marthinus")
  const names = filteredRegionalData.topAccounts.map(a => a.investor).join(',');
  navigate(`/clients?filter=accounts&names=${encodeURIComponent(names)}`);
}}
```

---

### File 2: `src/pages/Clients.tsx`

**Changes:**
1. Import `useSearchParams` from `react-router-dom`
2. Read `filter` and `names` query parameters on mount
3. Initialize search with the names when coming from Dashboard widgets
4. Show visual indicator that a filter is active
5. Add "Clear filter" option to return to normal view

**Read URL parameters:**
```typescript
import { useNavigate, useSearchParams } from "react-router-dom";

const [searchParams, setSearchParams] = useSearchParams();

useEffect(() => {
  const filter = searchParams.get('filter');
  const names = searchParams.get('names');
  
  if (filter && names) {
    // Set active filter header based on source
    setFilterSource(filter === 'birthdays' ? 'Upcoming Birthdays' : 'Top Accounts');
    
    // Parse names and set as filter
    const nameList = decodeURIComponent(names).split(',');
    setFilteredNames(nameList);
  }
}, [searchParams]);
```

**Filter clients against name list:**
```typescript
const filteredClients = clients.filter((client) => {
  // ... existing filters ...
  
  // If coming from Dashboard widget, filter by name list
  if (filteredNames.length > 0) {
    const clientFullName = client.client; // "Surname, I (FirstName)"
    // Check if any widget name matches the client
    return filteredNames.some(name => {
      const normalizedName = name.toLowerCase();
      const normalizedClient = clientFullName.toLowerCase();
      // Match partial names (surname or first name)
      return normalizedClient.includes(normalizedName.split(' ')[0]) ||
             normalizedName.includes(normalizedClient.split(',')[0]);
    });
  }
  
  return true;
});
```

**Add filter indicator:**
```typescript
{filterSource && (
  <div className="flex items-center gap-2 mb-4 p-3 bg-[hsl(180,70%,45%)]/10 rounded-lg border border-[hsl(180,70%,45%)]/30">
    <span className="text-sm">
      Showing clients from: <strong>{filterSource}</strong>
    </span>
    <Button 
      variant="ghost" 
      size="sm"
      onClick={() => {
        setSearchParams({});
        setFilteredNames([]);
        setFilterSource(null);
      }}
    >
      <X className="w-4 h-4 mr-1" />
      Clear Filter
    </Button>
  </div>
)}
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Dashboard.tsx` | Remove unused state, update "Show more" buttons to navigate with query params |
| `src/pages/Clients.tsx` | Add `useSearchParams`, read filter params, implement name-based filtering, add filter indicator |

---

## User Experience

```text
Dashboard (Birthdays Widget)
┌─────────────────────────────────┐
│ Birthdays                       │
│ ─────────────────────────────── │
│ Andre Thomas Coetzer   28 Jan 42│
│ Esther Amanda Nieman   28 Jan 74│
│ ... (5 more rows)               │
│ ─────────────────────────────── │
│ [Show more (13 more)]  ← Click  │
└─────────────────────────────────┘
          │
          ▼
Clients Page (Filtered)
┌─────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────┐ │
│ │ Showing clients from: Upcoming Birthdays  [✕]  │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ [Lead] [Prospect] [Client] ...                      │
│                                                     │
│ │ Client           │ Age │ Contact Details │ ...   │
│ ├──────────────────┼─────┼─────────────────┼───    │
│ │ Coetzer, A (Andre)│ 42 │ ...             │       │
│ │ Nieman, E (Esther)│ 74 │ ...             │       │
│ │ ... matching clients from birthdays ...   │       │
└─────────────────────────────────────────────────────┘
```

---

## Technical Notes

- URL parameters ensure the filter persists on page refresh
- The "Clear Filter" button removes URL params and returns to normal view
- Name matching uses fuzzy logic since Dashboard uses full names while Clients table uses "Surname, I (Name)" format
- Filter combines with existing profile type filters (Lead/Prospect/Client)
- If no database clients match the widget names (since they're mock data), the filtered list will be empty - this is expected behavior until real clients are added

