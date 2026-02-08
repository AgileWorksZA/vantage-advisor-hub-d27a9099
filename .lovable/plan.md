

# Reduce Whitespace in Outstanding Documents Table

## Overview
The "Outstanding documents" card's table rows still use the default table cell padding (`p-4` / `h-12`), which is noticeably more spacious than the tightened rows in the other cards. This change will reduce that padding to match the condensed style applied elsewhere on the page.

## Change (single file: `src/components/client-detail/ClientSummaryTab.tsx`)

### Table header and cell padding
- `TableHead`: Add `className="text-xs h-8 px-3"` to reduce header height from the default `h-12` and tighten horizontal padding
- `TableCell`: Add `className="text-sm py-1.5 px-3"` to reduce vertical padding from the default `p-4` to `py-1.5` and horizontal to `px-3`

These changes apply only to the Outstanding Documents table (the bottom card in the right column). The Advisor table already has its own sizing and is unaffected.

