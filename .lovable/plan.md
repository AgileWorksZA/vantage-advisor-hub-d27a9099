
# Change "Email" to "Message" in Navigation

## Overview

Update the sidebar navigation label from "Email" to "Message" across all pages in the application.

---

## Files to Modify

The sidebar navigation is duplicated across 10 files. Each file contains a `sidebarItems` array with the navigation item that needs updating.

| File | Line | Change |
|------|------|--------|
| `src/components/layout/AppLayout.tsx` | 23 | `label: "Email"` → `label: "Message"` |
| `src/pages/Portfolio.tsx` | 29 | `label: "Email"` → `label: "Message"` |
| `src/pages/Tasks.tsx` | 73 | `label: "Email"` → `label: "Message"` |
| `src/pages/Clients.tsx` | 70 | `label: "Email"` → `label: "Message"` |
| `src/pages/Email.tsx` | 57 | `label: "Email"` → `label: "Message"` |
| `src/pages/Insights.tsx` | 134 | `label: "Email"` → `label: "Message"` |
| `src/pages/ComposeEmail.tsx` | 41 | `label: "Email"` → `label: "Message"` |
| `src/pages/Calendar.tsx` | 86 | `label: "Email"` → `label: "Message"` |
| `src/pages/ClientDetail.tsx` | 58 | `label: "Email"` → `label: "Message"` |
| `src/pages/Practice.tsx` | 41 | `label: "Email"` → `label: "Message"` |

---

## Change Details

In each file, update the sidebar item from:
```typescript
{ icon: Mail, label: "Email", path: "/email" },
```

To:
```typescript
{ icon: Mail, label: "Message", path: "/email" },
```

Note: The icon (`Mail`) and path (`/email`) remain unchanged - only the display label changes to "Message".

---

## Summary

This is a straightforward text replacement across 10 files, changing the navigation label from "Email" to "Message" while keeping the same icon and route path.
