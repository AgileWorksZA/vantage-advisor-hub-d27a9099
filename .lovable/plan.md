

# Condense Advisor Table and Rename Rating Column

## Overview
Apply the same reduced whitespace treatment to the "Current Advisor and Accounts" table as was done for the Outstanding Documents table, and rename "Rating" to "Risk Rating".

## Changes (single file: `src/components/client-detail/ClientSummaryTab.tsx`)

### 1. Table header padding (lines 210-213)
- Add `h-8 px-3` to each `TableHead` to match the condensed style used in Outstanding Documents
- Rename "Rating" to "Risk Rating"

### 2. Table cell padding (lines 219-227)
- Add `py-1.5 px-3` to each `TableCell` to reduce row height

### 3. Demo data label (line 38)
- Update the `advisorData` array: change the property name display from `"Rating"` header to show `"Risk Rating"` -- the header change handles this, no data change needed

### Summary of specific edits
- `TableHead` elements: add `className="text-xs h-8 px-3"` (from `"text-xs"`)
- `TableHead` for Rating: text changed from `"Rating"` to `"Risk Rating"`
- `TableCell` elements: add `py-1.5 px-3` to existing className (from `"text-sm"` to `"text-sm py-1.5 px-3"`)

