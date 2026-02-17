
## Match "AI" Badge on Opportunities Tab to Optimize Button

### What Changes
Update the AI badge next to the "Opportunities" tab label to use the same size and padding as the AI badge on the "Optimize" button, so they look identical.

### File

| File | Change |
|------|--------|
| `src/pages/ClientDetail.tsx` (line 279) | Change badge classes from `px-1.5 py-0 text-[10px]` to `px-2 py-0.5 text-xs` to match the Optimize button's AI badge |

The gradient, color, and shape (`bg-gradient-to-r from-violet-500 to-cyan-500 text-white rounded-full`) stay the same -- only the sizing is adjusted to match.
