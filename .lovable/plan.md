

## Change "Book%" to "Book %" on Dashboard Widgets

### Overview

Add a space between "Book" and "%" in the dashboard table headers.

### Changes

**File: `src/pages/Dashboard.tsx`**

- Line 323: `Book%` → `Book %`
- Line 355: `Book%` → `Book %`

Both occurrences are table column headers in the Provider View and Top Accounts widgets.

