
## Add AI Badge to Meetings Tab

A one-line addition to show the same gradient "AI" badge next to the Meetings tab label, matching the existing one on Opportunities.

### Change

**File: `src/pages/ClientDetail.tsx` (line ~280)**

After the existing AI badge for `summary`, add a matching condition for `meetings`:

```
{tab.value === "summary" && (
  <span className="...">AI</span>
)}
{tab.value === "meetings" && (
  <span className="...">AI</span>
)}
```

This uses the exact same gradient badge styling (`bg-gradient-to-r from-violet-500 to-cyan-500 text-white rounded-full`).

### Scope
- 1 file changed, ~3 lines added
- No other files affected
