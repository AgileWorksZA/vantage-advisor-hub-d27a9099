
## Rename "360 View" Tab to "Products"

A single-line change in `src/pages/ClientDetail.tsx` to update the tab label from "360 View" to "Products". The tab's internal `value` key (`360-view`) stays the same so no routing or navigation logic is affected.

### File

| File | Change |
|------|--------|
| `src/pages/ClientDetail.tsx` | Change `label: "360 View"` to `label: "Products"` (line 260) |

No other files display this label to users, so this single edit covers all jurisdictions.
