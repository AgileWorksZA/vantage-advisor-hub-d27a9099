

## Add Family Group Badge to Client Ribbon

### Overview

Display a "Family Group" badge in the client ribbon's info bar, next to the existing "Client" and "Active" badges, whenever the client has a `family_group` value set.

### Changes

**File: `src/components/client-detail/ClientRibbon.tsx`**

- Import `Users` icon from `lucide-react` for the family group badge
- After the two existing `<Badge>` elements (profile type and profile state) on ~line 163-172, add a conditional badge:

```tsx
{client.family_group && (
  <Badge
    variant="outline"
    className="border-purple-500 text-purple-600 bg-transparent dark:text-purple-400 dark:border-purple-400"
  >
    <Users className="w-3 h-3 mr-1" />
    {client.family_group}
  </Badge>
)}
```

This renders only when `client.family_group` is a non-empty string. The purple color differentiates it from the teal (profile type) and green (profile state) badges.

### Technical Summary

| Item | Detail |
|------|--------|
| Files modified | `src/components/client-detail/ClientRibbon.tsx` |
| Condition | Only shown when `client.family_group` is truthy |
| Styling | Purple outline badge with Users icon, consistent with existing badge pattern |
| No DB changes | Uses existing `family_group` column |

