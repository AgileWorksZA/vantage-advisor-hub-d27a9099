
# Remove "Recent Activity" from Tab Menu

## Overview

Remove the "Recent Activity" tab from the visible tab navigation menu on the client detail page, while keeping the TabsContent so users can still access it via the "Show more" link on the Summary tab.

---

## File to Modify

| File | Change |
|------|--------|
| `src/pages/ClientDetail.tsx` | Remove "recent-activity" from the tabs array |

---

## Change Details

Remove this line from the tabs array (around line 252):

```typescript
// Remove this line:
{ value: "recent-activity", label: "Recent Activity" },
```

The TabsContent for "recent-activity" will remain in place, so the "Show more" link on the Summary tab will continue to work correctly - it just won't appear as a visible tab in the navigation bar.

---

## Result

- The "Recent Activity" tab will no longer appear in the top menu after "Documents"
- The Recent Activity content remains accessible via the "Show more" link on the Summary tab
- All 13 remaining tabs will display: Summary, Details, CRM, Meetings, Family, Businesses, Contacts, Workflows, Compliance, Products, Notes, Communication, Documents
