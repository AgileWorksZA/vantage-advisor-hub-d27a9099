

# Smart Advisor Warning -- Only Warn When Relevant

## Problem

Currently, deselecting **any** advisor while on a client detail page (or any sub-page) triggers a "Leave this page?" warning popup. This is incorrect -- the warning should only appear when the advisor being deselected is actually **linked to the entity being viewed**.

For example, viewing client "Nguyen, David" (advisor: James Mitchell / JM) and deselecting Sarah Thompson (ST) should NOT trigger the warning, because David is not Sarah's client.

## Solution

Create a lightweight **Page Context** that sub-pages populate with the advisor linked to the currently viewed entity. The `AdvisorFilter` reads from this context and only shows the warning when:

1. The user is on a sub-page (not a landing page), **AND**
2. The advisor being deselected matches the entity's advisor, **OR**
3. "Toggle All" off is used (deselecting everyone, including the entity's advisor)

When neither condition is met, the advisor change applies silently without navigation.

---

## Changes

### 1. New Context: `PageContext` (`src/contexts/PageContext.tsx`)

A simple context that stores metadata about the currently viewed entity:

```text
interface PageContextType {
  currentAdvisorInitials: string | null;   // e.g., "JM"
  setCurrentAdvisorInitials: (initials: string | null) => void;
}
```

- Wrap the app in this provider (in `App.tsx`, inside `RegionProvider`)
- Sub-pages set the advisor initials when their data loads
- Landing pages or pages without a specific advisor leave it as `null`

### 2. Client Detail Page Sets Context (`src/pages/ClientDetail.tsx`)

When the client data loads, resolve the client's `advisor` name (e.g., "James Mitchell") to their initials (e.g., "JM") using the regional advisor list, and call `setCurrentAdvisorInitials("JM")`.

Clean up on unmount by setting it back to `null`.

### 3. Email View Page Sets Context (`src/pages/EmailView.tsx`)

When the email's linked client loads, resolve that client's advisor to initials and set the context. If no client is linked, leave as `null` (no warning needed).

### 4. Compose Email Page Sets Context (`src/pages/ComposeEmail.tsx`)

Same pattern -- if a client is linked, resolve their advisor. Otherwise, `null`.

### 5. AdvisorFilter Uses Context (`src/components/dashboard/AdvisorFilter.tsx`)

Update the `applyOrWarn` logic:

**Before** (current -- always warns on sub-pages):
```text
if (isLandingPage) {
  setSelectedAdvisors(newAdvisors);
} else {
  showWarning();
}
```

**After** (only warns when the entity's advisor is affected):
```text
if (isLandingPage) {
  // On a landing page: always safe
  setSelectedAdvisors(newAdvisors);
} else if (currentAdvisorInitials && !newAdvisors.includes(currentAdvisorInitials)) {
  // On a sub-page AND the entity's advisor is being removed: warn
  showWarning();
} else {
  // On a sub-page but entity's advisor is NOT affected: safe
  setSelectedAdvisors(newAdvisors);
}
```

For `toggleAll` off: the warning fires because the empty array excludes the entity's advisor.
For `toggleAll` on: always safe (selecting more, never removing).

### 6. Advisor Name-to-Initials Resolution

The `RegionContext` already provides `regionalData.advisors`, which is an array of `{ initials, name, ... }`. Each sub-page will:
1. Read `client.advisor` (full name like "James Mitchell")
2. Find the matching entry in `regionalData.advisors` by name
3. Use its `initials` value

---

## Files Summary

| File | Action |
|------|--------|
| `src/contexts/PageContext.tsx` | **New** -- simple context for current entity advisor |
| `src/App.tsx` | Wrap with `PageContextProvider` |
| `src/pages/ClientDetail.tsx` | Set `currentAdvisorInitials` from `client.advisor` |
| `src/pages/EmailView.tsx` | Set `currentAdvisorInitials` from linked client's advisor |
| `src/pages/ComposeEmail.tsx` | Set `currentAdvisorInitials` from linked client's advisor |
| `src/components/dashboard/AdvisorFilter.tsx` | Read `currentAdvisorInitials`; only warn when that specific advisor is being deselected |

No database changes needed. No new dependencies.

