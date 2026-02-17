

## Add AI Badge to Communication Tab

Add the same gradient AI badge to the Communication tab, matching Opportunities and Meetings.

### Change

**File: `src/pages/ClientDetail.tsx`**

Update the condition on the AI badge span (around line 278) from:

```
(tab.value === "summary" || tab.value === "meetings")
```

to:

```
(tab.value === "summary" || tab.value === "meetings" || tab.value === "communication")
```

### Scope
- 1 file, 1 line changed

