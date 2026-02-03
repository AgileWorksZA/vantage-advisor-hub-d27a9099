

## Enable Client Navigation from Dashboard Widgets

### Overview

Allow users to click on client names in the **Birthdays** and **Top 5 Accounts** widgets to navigate directly to that client's detail page. When clicking the "Back" button on the client detail page, the user should return to the **Dashboard** (not the Clients list).

---

## Current State

**Dashboard.tsx:**
- Widget rows display client names but are not clickable
- No navigation to client detail when clicking a name

**ClientDetail.tsx:**
- Back button always navigates to `/clients` (line 185)
- Does not track where the user came from

---

## Implementation

### Approach

1. **Dashboard widgets**: Make each client row clickable
   - Query the database for a matching client by name (first_name + surname)
   - If found, navigate to `/clients/{id}?from=dashboard`
   - If not found, show a toast notification

2. **ClientDetail page**: Check for `from` URL parameter
   - If `from=dashboard`, back button navigates to `/dashboard`
   - Otherwise, back button navigates to `/clients` (default behavior)

---

### File 1: `src/pages/Dashboard.tsx`

#### 1. Add a helper function to find client by name

```typescript
const findClientByName = async (fullName: string): Promise<string | null> => {
  // Parse name parts - format is "FirstName MiddleName... Surname"
  const nameParts = fullName.trim().split(' ');
  if (nameParts.length < 2) return null;
  
  const firstName = nameParts[0];
  const surname = nameParts[nameParts.length - 1];
  
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('id')
      .ilike('first_name', `%${firstName}%`)
      .ilike('surname', `%${surname}%`)
      .limit(1)
      .single();
    
    if (error || !data) return null;
    return data.id;
  } catch {
    return null;
  }
};
```

#### 2. Add a click handler function

```typescript
const handleClientClick = async (clientName: string) => {
  const clientId = await findClientByName(clientName);
  if (clientId) {
    navigate(`/clients/${clientId}?from=dashboard`);
  } else {
    toast.error(`Client "${clientName}" not found in database`);
  }
};
```

#### 3. Update Birthdays widget table rows (~line 326-330)

Make rows clickable with cursor styling:

```typescript
{filteredRegionalData.birthdays.slice(0, 7).map(person => (
  <tr 
    key={person.name} 
    className="border-t border-border hover:bg-muted/50 cursor-pointer"
    onClick={() => handleClientClick(person.name)}
  >
    <td className="py-1.5">{person.name}</td>
    <td className="py-1.5 text-right text-muted-foreground">{person.nextBirthday}</td>
    <td className="py-1.5 text-right">{person.age}</td>
  </tr>
))}
```

#### 4. Update Top 5 Accounts widget table rows (~line 232-238)

Make rows clickable with cursor styling:

```typescript
{[...filteredRegionalData.topAccounts]
  .sort((a, b) => {
    const parseValue = (v: string) => parseFloat(v.replace(/[^0-9.-]/g, ''));
    return parseValue(b.value) - parseValue(a.value);
  })
  .slice(0, 5)
  .map(account => (
    <tr 
      key={account.investor} 
      className="border-t border-border hover:bg-muted/50 cursor-pointer"
      onClick={() => handleClientClick(account.investor)}
    >
      <td className="py-2 max-w-[120px] truncate" title={account.investor}>
        {account.investor}
      </td>
      <td className="py-2 text-right text-muted-foreground whitespace-nowrap">
        {account.bookPercent}
      </td>
      <td className="py-2 text-right whitespace-nowrap">{account.value}</td>
    </tr>
  ))
}
```

#### 5. Add required imports

```typescript
import { toast } from "sonner";
```

---

### File 2: `src/pages/ClientDetail.tsx`

#### 1. Add useSearchParams import

```typescript
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
```

#### 2. Get search params in component

```typescript
const [searchParams] = useSearchParams();
```

#### 3. Update back button click handler (~line 185)

Check the `from` parameter to determine navigation destination:

```typescript
<Button 
  variant="outline" 
  size="sm"
  onClick={() => {
    const from = searchParams.get('from');
    if (from === 'dashboard') {
      navigate("/dashboard");
    } else {
      navigate("/clients");
    }
  }}
  className="gap-2"
>
  <ArrowLeft className="w-4 h-4" />
  Back
</Button>
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Dashboard.tsx` | Add `findClientByName` helper, `handleClientClick` handler, make widget rows clickable |
| `src/pages/ClientDetail.tsx` | Import `useSearchParams`, check `from` param, conditionally navigate to dashboard |

---

## Visual Result

**Dashboard (before):**
```text
┌─────────────────────────────────────────┐
│ Birthdays                               │
├─────────────────────────────────────────┤
│ Andre Thomas Coetzer      28 Jan    42  │  ← Static row
│ Esther Amanda Nieman      28 Jan    74  │
└─────────────────────────────────────────┘
```

**Dashboard (after):**
```text
┌─────────────────────────────────────────┐
│ Birthdays                               │
├─────────────────────────────────────────┤
│ Andre Thomas Coetzer ↗    28 Jan    42  │  ← Clickable, hover highlight
│ Esther Amanda Nieman ↗    28 Jan    74  │
└─────────────────────────────────────────┘
```

**Client Detail (from Dashboard):**
```text
┌─────────────────────────────────────────────────────────────┐
│ [← Back]  Manage individual (Owner) - Andre Thomas Coetzer  │
├─────────────────────────────────────────────────────────────┤
│ ...                                                         │
└─────────────────────────────────────────────────────────────┘
      ↓ Click "Back"
      → Navigates to /dashboard (not /clients)
```

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Client name not found in DB | Toast error: "Client 'Name' not found in database" |
| Organization name (e.g., "NG Kerk Sinode...") | May not match - shows toast error |
| User navigates directly to `/clients/{id}` | Back goes to `/clients` (no `from` param) |
| User refreshes client detail page | `from=dashboard` preserved in URL, back still works |

---

## Technical Notes

- Uses `ilike` for case-insensitive partial matching on first_name and surname
- Widget data uses "FirstName MiddleName Surname" format - we extract first and last words
- URL parameter approach (`?from=dashboard`) ensures state persists on page refresh
- No changes needed to routing configuration - just URL parameters

