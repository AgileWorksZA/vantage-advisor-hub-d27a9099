

# Enhance Inline Client Search to Match First Name and Surname Directly

## Overview

The `InlineClientSearch` component already opens a search dropdown inline with the "+ Add" button and shows results below as the user types. However, the current search matches against the formatted combined name (e.g., "Surname, I (FirstName)"), identification, and email.

This plan enhances the search to more intuitively match on first name and surname by parsing the formatted name into its components.

## Current Behavior

The component:
- Opens a popover when "+ Add" is clicked
- Shows a search input field
- Displays filtered results with avatars, green status dots, and ID numbers
- Filters by `client.client` (formatted name), `identification`, and `email`

## Enhancement

Update the filtering logic to parse and match against first name and surname components separately, making searches like "John" or "Smith" work more naturally.

## Changes Required

### File: `src/components/email/InlineClientSearch.tsx`

**1. Add helper function to parse client name:**
```tsx
// Parse client name "Surname, I (FirstName)" into components
const parseClientName = (clientName: string): { firstName: string; surname: string } => {
  const nameParts = clientName.match(/^([^,]+),\s*\w\s*\((.+)\)$/);
  return {
    surname: nameParts?.[1] || clientName,
    firstName: nameParts?.[2] || "",
  };
};
```

**2. Update filtering logic to match first name or surname:**
```tsx
const filteredClients = useMemo(() => {
  const excludeIds = new Set([
    ...selectedClients.map((c) => c.id),
    ...excludeClientIds,
  ]);

  return clients.filter((client) => {
    if (excludeIds.has(client.id)) return false;

    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    const { firstName, surname } = parseClientName(client.client);
    
    return (
      firstName.toLowerCase().includes(query) ||
      surname.toLowerCase().includes(query) ||
      client.client.toLowerCase().includes(query) ||
      client.identification?.toLowerCase().includes(query) ||
      client.email?.toLowerCase().includes(query)
    );
  });
}, [clients, selectedClients, excludeClientIds, searchQuery]);
```

**3. Update placeholder text for clarity:**
```tsx
placeholder="Search by first name, surname, ID, or email..."
```

## Summary of Changes

| File | Change | Description |
|------|--------|-------------|
| `src/components/email/InlineClientSearch.tsx` | Modify | Add `parseClientName` helper function |
| `src/components/email/InlineClientSearch.tsx` | Modify | Update filter logic to match first name and surname separately |
| `src/components/email/InlineClientSearch.tsx` | Modify | Update placeholder text for clarity |

## Visual Behavior (Unchanged)

The component will continue to:
1. Show "+ Add" button inline with client badges
2. Open a popover with search input when clicked
3. Display matching results below with avatars, green status dots, and ID numbers
4. Close and add the selected client when clicked

The enhancement makes the search more intuitive by allowing users to type just "John" to find "John Smith" or just "Smith" to find all clients with that surname.

