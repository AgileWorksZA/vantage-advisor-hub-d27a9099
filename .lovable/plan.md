

# Prevent Viewing Client When Advisor Not Selected

## Overview
Add access control to the Client Detail page that prevents viewing a client when their assigned advisor is not currently selected in the Advisor Filter. This ensures data consistency with the filtering system.

## User Experience
When a user tries to access a client page (either by direct URL or navigation) and that client's advisor is not in the current advisor selection:
- The page will display an "Access Restricted" message instead of the client details
- A clear explanation will tell the user why they cannot view this client
- A button will navigate them back to the Clients list

## Technical Changes

### File: `src/pages/ClientDetail.tsx`

**1. Import `selectedAdvisors` from RegionContext**

Add `selectedAdvisors` to the existing `useRegion()` destructuring.

**2. Compute the client's advisor initials**

After fetching the client, determine if their advisor is in the current selection:
- Map `client.advisor` (full name) to initials using `regionalData.advisors`
- Check if those initials exist in `selectedAdvisors`

**3. Add access check after loading completes**

Insert a new conditional rendering block that checks:
- Client has loaded successfully
- Client has an assigned advisor
- That advisor's initials are NOT in `selectedAdvisors`

When these conditions are met, render an "Access Restricted" view instead of the normal content.

**4. Access Restricted UI**

Display a centered card with:
- A lock or user icon for visual context
- "Access Restricted" heading
- Explanation: "This client is assigned to [Advisor Name], who is not currently selected in your advisor filter."
- Suggestion: "To view this client, add the advisor to your selection or navigate to a different client."
- "Back to Clients" button

### Code Logic

```tsx
// After client loads, check advisor access
const clientAdvisorInitials = client?.advisor
  ? regionalData.advisors.find((a) => a.name === client.advisor)?.initials
  : null;

const isAdvisorSelected = clientAdvisorInitials
  ? selectedAdvisors.includes(clientAdvisorInitials)
  : true; // If no advisor assigned, allow access

// In render, add check after error/loading states:
if (client && !isAdvisorSelected) {
  return (
    // Access Restricted UI
  );
}
```

## Edge Cases Handled

| Scenario | Behavior |
|----------|----------|
| Client has no advisor assigned | Allow access (no restriction) |
| Client's advisor matches a selected advisor | Normal page display |
| Client's advisor is deselected | Show "Access Restricted" view |
| User changes advisor filter while on page | Page re-renders and shows restriction immediately |

## Result
Users will only be able to view clients whose advisors are currently selected in their filter, maintaining consistency between the filtered client list and individual client access.

