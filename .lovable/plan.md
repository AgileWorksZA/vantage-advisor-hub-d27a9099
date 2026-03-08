

## Remove Teal Color from Unread Email Rows

The "From" and "Subject" columns apply `text-[hsl(180,70%,45%)]` (teal) to unread emails. Remove that conditional color so they use the default text color. The `font-medium` bold styling on unread rows is sufficient to distinguish them.

### Change in `src/pages/Email.tsx`
- **Line 429**: Change `cn("py-1.5 px-3", !email.isRead && "text-[hsl(180,70%,45%)]")` → `"py-1.5 px-3"`
- **Line 432**: Same change for the Subject column

