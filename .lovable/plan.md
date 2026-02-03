
## Fix Top 5 Accounts Widget Name Matching

### Problem

The "Show more" navigation from the **Top 5 Accounts** widget correctly navigates to the Clients page with the data, but the name matching logic fails to properly match client names because:

1. **Top Accounts names use "Surname, FirstName" format** (e.g., "Chen, Wei", "Johnson, Robert")
2. **The `getWidgetDataForClient` function splits names by space**, which doesn't handle the comma format properly
3. When splitting "Chen, Wei" by space → `["Chen,", "Wei"]` → surname = "Wei", firstName = "Chen," (with trailing comma)

The Birthday widget works because birthday names use "FirstName MiddleName Surname" format (e.g., "Andre Thomas Coetzer").

---

### Solution

Update the `getWidgetDataForClient` function in `src/pages/Clients.tsx` to handle both name formats:

1. **Check if name contains a comma** (Top Accounts format: "Surname, FirstName")
2. **If comma present**: Split by comma, treat first part as surname, second as firstName
3. **If no comma**: Use current space-split logic (Birthday format)

---

### File to Modify

**`src/pages/Clients.tsx`** - Update the `getWidgetDataForClient` function (around lines 211-224)

**Current Code:**
```typescript
const getWidgetDataForClient = (clientName: string) => {
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

**Fixed Code:**
```typescript
const getWidgetDataForClient = (clientName: string) => {
  const clientLower = clientName.toLowerCase();
  
  for (const [widgetName, data] of Object.entries(widgetData)) {
    let surname: string;
    let firstName: string;
    
    // Handle "Surname, FirstName" format (Top Accounts) vs "FirstName ... Surname" format (Birthdays)
    if (widgetName.includes(',')) {
      // Top Accounts format: "Chen, Wei" or "Johnson, Robert"
      const commaParts = widgetName.split(',').map(p => p.trim());
      surname = commaParts[0]; // "Chen"
      firstName = commaParts[1] || ''; // "Wei"
    } else {
      // Birthday format: "Andre Thomas Coetzer"
      const spaceParts = widgetName.split(' ');
      surname = spaceParts[spaceParts.length - 1]; // Last word
      firstName = spaceParts[0]; // First word
    }
    
    // Check if client name contains surname or firstName
    if (clientLower.includes(surname.toLowerCase()) || 
        (firstName && clientLower.includes(firstName.toLowerCase()))) {
      return data;
    }
  }
  return null;
};
```

---

### How It Works

| Widget Source | Name Format | Split Logic | Surname | FirstName |
|---------------|-------------|-------------|---------|-----------|
| Top Accounts | "Chen, Wei" | Split by comma | "Chen" | "Wei" |
| Top Accounts | "Johnson, Robert" | Split by comma | "Johnson" | "Robert" |
| Top Accounts | "St. Mary's Hospital Foundation" | Split by space (no comma) | "Foundation" | "St." |
| Birthdays | "Andre Thomas Coetzer" | Split by space | "Coetzer" | "Andre" |

The fix handles both formats and should correctly match database clients like:
- "Chen, W (Wei)" matches "Chen, Wei"
- "Johnson, R (Robert)" matches "Johnson, Robert"

---

### Summary

| File | Change |
|------|--------|
| `src/pages/Clients.tsx` | Update `getWidgetDataForClient` to handle comma-separated "Surname, FirstName" format |
