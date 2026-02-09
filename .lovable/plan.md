

## Decouple Global Header Search from In-Page Client Search

### Problem
On the Clients page, the AppHeader's search bar and the in-page "Search clients..." input share the same `searchQuery` state. Typing in either one updates both, and the header search filters the table instead of navigating to a client profile.

### Solution
Stop passing `searchValue` and `onSearchChange` to AppHeader on the Clients page. This lets AppHeader use its own internal search state with the `ClientAutocompleteDropdown`, which navigates directly to client profiles — the same behavior it has on every other page.

### Changes (single file)

**`src/pages/Clients.tsx`**
- Remove the `searchValue={searchQuery}` and `onSearchChange={setSearchQuery}` props from the `<AppHeader>` component (around lines 366-367)
- The in-page search input (line 389-394) continues to use `searchQuery` state independently for table filtering
- The header search bar will now operate independently with its own internal state and autocomplete dropdown, navigating to client profiles on selection

### Result
- **Header search bar**: Always shows the client autocomplete dropdown and navigates to the selected client's profile — consistent across all pages
- **In-page search**: Continues to filter the clients table as before
- No other files need changes
