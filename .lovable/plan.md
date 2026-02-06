

# Fix: "Failed to load relationships" Error on Client Opportunity Click

## Root Cause

The `ClientOpportunityList` component navigates to `/clients/{id}` using demo client IDs like `"c1"`, `"c2"`, etc. from `sampleNewOpportunities.ts`. When the `ClientDetail` page loads, `useClientDetail` and `useClientRelationships` hooks query the database using this ID as a UUID, but `"c1"` is not a valid UUID, causing a PostgreSQL error (`22P02: invalid input syntax for type uuid`).

## Solution

Add a UUID validation check in `ClientOpportunityList.tsx` before navigating. If the client ID is not a valid UUID (i.e., it's demo data), show an informational toast instead of navigating to a broken page.

## Changes

### File: `src/components/ai-assistant/ClientOpportunityList.tsx`

- Import `toast` from `sonner`
- Add a UUID validation helper function
- Update `handleClientClick` to validate the ID before navigating
- If the ID is a valid UUID, navigate as normal
- If not (demo data), show a toast: "This is a demo client. Link to a real client record to view details."

### Code Change

```tsx
import { toast } from "sonner";

// UUID validation helper
const isValidUUID = (id: string): boolean => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
};

const handleClientClick = (clientId: string) => {
  if (!isValidUUID(clientId)) {
    toast.info("This is a demo client. Link to a real client record to view details.");
    return;
  }
  navigate(`/clients/${clientId}?from=ai-assistant`);
};
```

## Summary

| File | Change | Description |
|------|--------|-------------|
| `src/components/ai-assistant/ClientOpportunityList.tsx` | Modify | Add UUID validation before navigation to prevent database errors on demo data |

This is a minimal, targeted fix that prevents the invalid database query while preserving full navigation for real client records.

