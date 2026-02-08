
# Client Autocomplete Search -- Header and Email Compose

## Overview

Add a client autocomplete dropdown to two areas:
1. **Header search bar** -- When typing in the global search bar, show a dropdown of matching clients (with avatar, name, and ID number) that navigates to the client detail page on selection.
2. **Email Compose To/CC/BCC fields** -- Replace the current free-text email input with a client-only autocomplete that restricts recipients to clients in the system.

Both dropdowns will match the reference design: avatar with initials and green status dot, client name in "Surname, IN (PreferredName)" format, and identification number below.

---

## 1. Create a Reusable Client Autocomplete Component

**New File: `src/components/clients/ClientAutocompleteDropdown.tsx`**

A standalone dropdown component that:
- Accepts a search query string
- Fetches/filters clients from the `useClients` hook
- Renders a positioned dropdown list matching the reference design:
  - Colored avatar circle with initials + green status dot
  - Client name: "Surname, IN (PreferredName)"
  - ID number or "No identification number has been found"
- Fires an `onSelect` callback with the selected client
- Supports keyboard navigation (arrow keys + Enter)
- Has proper z-index and solid background (no transparency)
- Shows "No clients found" when search yields no results
- Only displays when the search query is 2+ characters

---

## 2. Upgrade the AppHeader Search Bar

**File: `src/components/layout/AppHeader.tsx`**

- Import `useClients` hook and the new `ClientAutocompleteDropdown`
- Add internal state for `searchQuery` and `isDropdownOpen`
- When the user types 2+ characters, show the autocomplete dropdown below the search input
- On client selection, navigate to `/clients/{clientId}` (the client detail page)
- On blur/Escape, close the dropdown
- Wrap the search input in a `relative` container for dropdown positioning
- Keep the existing `searchValue`/`onSearchChange` props working for pages that use them (like Clients page), but also layer the autocomplete on top

**New props added to AppHeader:**
- `enableClientSearch?: boolean` (default `true`) -- allows pages to opt out if needed

---

## 3. Redesign the ComposeEmail To/CC/BCC Fields

**File: `src/pages/ComposeEmail.tsx`**

Replace the free-text `<input type="email">` fields for To, CC, and BCC with client autocomplete inputs:

- When the user types in the To/CC/BCC input, show the `ClientAutocompleteDropdown` with matching clients
- On selection, add the client as a recipient badge showing their name and email
- Remove the ability to type arbitrary email addresses (only clients from the system)
- The `handleAddRecipient` function will change to accept a client object instead of a raw email string
- Update the `RecipientBadge` interface to include `clientId` and `name` alongside `email`
- For reply mode, map the original sender's email to a matching client if possible

**Key behavioral changes:**
- Typing triggers client search (minimum 2 characters)
- Pressing Enter or clicking a result adds the client as a recipient
- The recipient badge shows the client's name with their email
- If a client has no email on file, show a warning toast and don't add them

---

## 4. Update ComposeToField for Client-Only Selection

**File: `src/components/email/ComposeToField.tsx`**

Update the existing `ComposeToField` component to use the new autocomplete pattern when used in the `ComposeMessageDialog`:
- Replace the simple `Popover`-based client picker with inline autocomplete
- The "Add" button becomes an inline text input with autocomplete
- Same client display format: avatar + name + ID

---

## Files Summary

| File | Action |
|------|--------|
| `src/components/clients/ClientAutocompleteDropdown.tsx` | **New** -- Reusable client autocomplete dropdown |
| `src/components/layout/AppHeader.tsx` | Add client autocomplete to global search bar |
| `src/pages/ComposeEmail.tsx` | Replace free-text To/CC/BCC with client autocomplete |
| `src/components/email/ComposeToField.tsx` | Update client picker to use autocomplete pattern |

---

## Technical Details

### ClientAutocompleteDropdown Props

```text
interface ClientAutocompleteDropdownProps {
  query: string;                          // Current search text
  onSelect: (client: ClientListItem) => void;  // Selection callback
  excludeIds?: string[];                  // IDs to exclude from results
  className?: string;                     // Additional positioning classes
  maxResults?: number;                    // Limit results (default 10)
}
```

### Dropdown Styling (matching reference image)

- Solid white background (`bg-background`) with `border border-border`
- `rounded-lg shadow-lg` for depth
- `z-50` to ensure it sits above other content
- Each row: `px-3 py-2.5 hover:bg-muted/50`
- Avatar: 36px circle, colored based on name hash, white initials text
- Green dot: 12px, positioned bottom-right of avatar
- Client name: `text-sm font-medium text-foreground`
- ID number: `text-xs text-muted-foreground`
- "No identification number has been found" for clients without ID

### Client Search Logic

Matches against:
- First name
- Surname
- Full formatted name ("Surname, I (FirstName)")
- Identification number
- Email address

Minimum 2 characters before showing results. Results limited to 10 (with a "Refine your search" hint if more exist).

### Header Navigation on Select

When a client is selected from the header search:
```text
navigate(`/clients/${client.id}`)
```
The search input clears and the dropdown closes.

### Compose Email Recipient Restriction

The To/CC/BCC fields will only allow selecting clients from the database. The input field serves as a search/filter field:
- Type to search clients
- Select from dropdown to add as recipient
- The recipient's email from their client record is used
- If a client has no email, show a toast: "This client has no email address on file"
- Pressing Enter without a selection does nothing (no free-text emails)
- The "Add filter" button and filter-based recipient selection in `ComposeToField` remain available as an alternative selection method
