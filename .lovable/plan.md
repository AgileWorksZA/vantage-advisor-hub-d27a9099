

## Add Conditional Column for Birthday/Value on Clients Page

### Overview

When users click "Show more" on the **Birthdays** or **Top 5 Accounts** widgets from the Dashboard, the Clients page will display an additional context-specific column:
- **From Birthdays widget**: Show a "Birthday" column with the next birthday date
- **From Top Accounts widget**: Show a "Value" column with the account value

This requires passing the additional data (birthday dates or values) from the Dashboard to the Clients page via URL parameters, and conditionally rendering the extra column.

---

## Current State

**Dashboard.tsx** (lines 236-242, 339-345):
- Birthdays "Show more": Passes `filter=birthdays&names=...` 
- Top Accounts "Show more": Passes `filter=accounts&names=...`
- Only names are passed, not the birthday dates or values

**Clients.tsx**:
- Reads `filter` and `names` from URL params
- Displays a filter indicator showing the source
- No conditional columns based on filter source

---

## Implementation

### File 1: `src/pages/Dashboard.tsx`

#### Update Birthdays "Show more" button (around line 339)

Pass birthday data as additional URL parameters:

```typescript
onClick={() => {
  // Pass both names and their birthday data
  const birthdayData = filteredRegionalData.birthdays.map(b => ({
    name: b.name,
    birthday: b.nextBirthday,
    age: b.age
  }));
  navigate(`/clients?filter=birthdays&data=${encodeURIComponent(JSON.stringify(birthdayData))}`);
}}
```

#### Update Top Accounts "Show more" button (around line 236)

Pass account value data as additional URL parameters:

```typescript
onClick={() => {
  // Pass both names and their value data
  const accountData = filteredRegionalData.topAccounts.map(a => ({
    name: a.investor,
    value: a.value,
    bookPercent: a.bookPercent
  }));
  navigate(`/clients?filter=accounts&data=${encodeURIComponent(JSON.stringify(accountData))}`);
}}
```

---

### File 2: `src/pages/Clients.tsx`

#### 1. Update State Variables (around line 88-90)

Add state for the widget data:

```typescript
// Dashboard widget filter state
const [filterSource, setFilterSource] = useState<string | null>(null);
const [filteredNames, setFilteredNames] = useState<string[]>([]);
const [widgetData, setWidgetData] = useState<Record<string, { birthday?: string; age?: number; value?: string; bookPercent?: string }>>({});
```

#### 2. Update URL Parameter Reading (useEffect around line 95)

Parse the JSON data from URL params:

```typescript
useEffect(() => {
  const filter = searchParams.get('filter');
  const dataParam = searchParams.get('data');
  
  if (filter && dataParam) {
    try {
      const parsedData = JSON.parse(decodeURIComponent(dataParam));
      setFilterSource(filter === 'birthdays' ? 'Upcoming Birthdays' : 'Top Accounts');
      
      // Build lookup map by name
      const dataMap: Record<string, any> = {};
      parsedData.forEach((item: any) => {
        const name = item.name.toLowerCase();
        if (filter === 'birthdays') {
          dataMap[name] = { birthday: item.birthday, age: item.age };
        } else {
          dataMap[name] = { value: item.value, bookPercent: item.bookPercent };
        }
      });
      setWidgetData(dataMap);
      
      // Extract names for filtering
      const nameList = parsedData.map((item: any) => item.name);
      setFilteredNames(nameList);
      setActiveFilter("");
    } catch (e) {
      console.error('Failed to parse widget data:', e);
    }
  } else {
    setFilterSource(null);
    setFilteredNames([]);
    setWidgetData({});
  }
}, [searchParams]);
```

#### 3. Add Helper Function to Get Widget Data for Client

```typescript
const getWidgetDataForClient = (clientName: string) => {
  // Try to match client name with widget data
  const clientLower = clientName.toLowerCase();
  
  for (const [widgetName, data] of Object.entries(widgetData)) {
    const nameParts = widgetName.split(' ');
    const surname = nameParts[nameParts.length - 1];
    const firstName = nameParts[0];
    
    if (clientLower.includes(surname) || clientLower.includes(firstName)) {
      return data;
    }
  }
  return null;
};
```

#### 4. Update Table Header (around line 404-418)

Add conditional column header:

```typescript
<TableHeader>
  <TableRow className="hover:bg-transparent">
    <TableHead className="text-xs font-normal text-muted-foreground">Profile state</TableHead>
    <TableHead className="text-xs font-normal text-muted-foreground">Profile Type</TableHead>
    <TableHead className="text-xs font-normal text-muted-foreground">Client</TableHead>
    <TableHead className="text-xs font-normal text-muted-foreground">Title</TableHead>
    <TableHead className="text-xs font-normal text-muted-foreground">Identification</TableHead>
    <TableHead className="text-xs font-normal text-muted-foreground">Age</TableHead>
    
    {/* Conditional column based on filter source */}
    {filterSource === 'Upcoming Birthdays' && (
      <TableHead className="text-xs font-normal text-muted-foreground">Birthday</TableHead>
    )}
    {filterSource === 'Top Accounts' && (
      <TableHead className="text-xs font-normal text-muted-foreground">Account Value</TableHead>
    )}
    
    <TableHead className="text-xs font-normal text-muted-foreground">Contact Details</TableHead>
    <TableHead className="text-xs font-normal text-muted-foreground">Advisor</TableHead>
    <TableHead className="text-xs font-normal text-muted-foreground">Wealth Manager</TableHead>
    <TableHead className="text-xs font-normal text-muted-foreground">Language</TableHead>
    <TableHead className="text-xs font-normal text-muted-foreground">Date Created</TableHead>
    <TableHead className="w-20"></TableHead>
  </TableRow>
</TableHeader>
```

#### 5. Update Table Body (around line 421-463)

Add conditional column data in each row:

```typescript
<TableRow 
  key={client.id} 
  className="hover:bg-muted/50 cursor-pointer"
  onClick={() => navigate(`/clients/${client.id}`)}
>
  <TableCell className="text-sm">{client.profileState}</TableCell>
  <TableCell className="text-sm">{client.profileType}</TableCell>
  <TableCell className="text-sm">
    <div className="flex items-center gap-2">
      {getClientIcon(client.clientType)}
      <span>{client.client}</span>
    </div>
  </TableCell>
  <TableCell className="text-sm">{client.title}</TableCell>
  <TableCell className="text-sm">{client.identification}</TableCell>
  <TableCell className="text-sm">{client.age || ""}</TableCell>
  
  {/* Conditional column data */}
  {filterSource === 'Upcoming Birthdays' && (
    <TableCell className="text-sm font-medium text-primary">
      {getWidgetDataForClient(client.client)?.birthday || "—"}
    </TableCell>
  )}
  {filterSource === 'Top Accounts' && (
    <TableCell className="text-sm font-medium text-emerald-600">
      {getWidgetDataForClient(client.client)?.value || "—"}
    </TableCell>
  )}
  
  <TableCell className="text-sm">
    <div className="flex flex-col">
      <span>{client.phone}</span>
      <span className="text-muted-foreground text-xs">{client.email}</span>
    </div>
  </TableCell>
  {/* ... rest of columns ... */}
</TableRow>
```

#### 6. Update Clear Filter Function (around line 179)

Reset widget data when clearing:

```typescript
const clearDashboardFilter = () => {
  setSearchParams({});
  setFilteredNames([]);
  setFilterSource(null);
  setWidgetData({});
  setActiveFilter("Client");
};
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Dashboard.tsx` | Update "Show more" buttons to pass JSON data with birthday/value info |
| `src/pages/Clients.tsx` | Add widgetData state, parse JSON from URL, add conditional column header and cell |

---

## Visual Result

**Coming from Birthdays widget:**
```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│ Showing clients from: Upcoming Birthdays  [✕ Clear Filter]                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│ State │ Type   │ Client              │ Title │ ID    │ Age │ Birthday │ Contact │
├───────┼────────┼─────────────────────┼───────┼───────┼─────┼──────────┼─────────┤
│Active │ Client │ Coetzer, A (Andre)  │ Mr    │ 80... │ 42  │ 28 Jan   │ ...     │
│Active │ Client │ Nieman, E (Esther)  │ Mrs   │ 72... │ 74  │ 28 Jan   │ ...     │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Coming from Top Accounts widget:**
```text
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ Showing clients from: Top Accounts  [✕ Clear Filter]                                  │
├───────────────────────────────────────────────────────────────────────────────────────┤
│ State │ Type   │ Client                │ Title │ ID    │ Age │ Account Value │ Contact │
├───────┼────────┼───────────────────────┼───────┼───────┼─────┼───────────────┼─────────┤
│Active │ Client │ Van Niekerk, M (...)  │ Mr    │ 85... │ 55  │ R 26,500,000  │ ...     │
│Active │ Client │ Venter, I (Isabella)  │ Mrs   │ 79... │ 48  │ R 24,800,000  │ ...     │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Technical Notes

- Data is passed via URL as JSON (encoded) for persistence on page refresh
- Name matching uses fuzzy logic (surname/first name) since Dashboard and Clients use different name formats
- Birthday column styled with primary color for visibility
- Value column styled with emerald/green for financial context
- Column only appears when coming from the respective Dashboard widget
- Data lookup returns "—" if no match found (edge case handling)

