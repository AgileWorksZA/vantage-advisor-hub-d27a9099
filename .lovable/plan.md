

# Condensed Top Row and Expandable Info Bar

## Overview

Two changes to the client ribbon:
1. **Halve the vertical height** of the top row (back button + title + action buttons) by reducing padding and font size
2. **Make the info bar (middle section) expandable** -- collapsed shows the current avatar/name/badges/ID row; expanded reveals additional details (Physical Address, Cellphone, Email, Category, Tax Number) matching the third reference image

## Changes

### File: `src/components/client-detail/ClientRibbon.tsx`

**1. Condense Row 1 (top section)**

Current Row 1 uses `mb-1.5 px-6 pt-2.5` and `text-xl`. Changes:
- Reduce `pt-2.5` to `pt-1`
- Reduce `mb-1.5` to `mb-1`
- Shrink title from `text-xl` to `text-base`
- Use `size="sm"` on all action buttons (Select, dropdown triggers) for a tighter fit

This halves the vertical footprint of Row 1 from roughly 48px to approximately 24-28px.

**2. Make Row 2 (info bar) expandable with a chevron toggle**

Add state `isExpanded` (default false). Wrap the info bar in a `Collapsible` from Radix. Add a small chevron button to the right edge of the bar that toggles expansion.

**Collapsed state** (current appearance):
- Avatar + name + advisor + badges on line 1
- ID number + phone + email on line 2
- Small chevron icon on the far right, pointing down

**Expanded state** (adds a new section below):
- A thin divider line
- Two-column grid showing:
  - **Left column**: "Physical Address" label + full address (parsed from `client.residential_address` JSON: street_nr, street, suburb, city, code, province, country)
  - **Right column**: "Cellphone" label + `client.cell_number` and `client.work_number` (with copy icons), "Email" label + `client.email` (with copy icon)
  - **Bottom row**: "Category" label + `client.client_type`, "Tax Number" label + `client.tax_number`
- Chevron rotates to point up

**Data mapping for expanded section:**

| Field | Source | Notes |
|---|---|---|
| Physical Address | `client.residential_address` (JSON) | Parse street_nr, street, suburb, city, code, province, country. Show "No address on file" if null |
| Cellphone | `client.cell_number` | Show with copy button. Also show `client.work_number` below if available |
| Email | `client.email` or `client.work_email` | Show with copy button |
| Category | `client.client_type` | e.g. "individual", "family" |
| Tax Number | `client.tax_number` | Show as-is, or "-" if null |

**New imports needed:**
- `useState` from React
- `ChevronUp` from lucide-react (already have `ChevronDown`)
- `Copy` from lucide-react (for copy-to-clipboard buttons)
- `Collapsible`, `CollapsibleContent`, `CollapsibleTrigger` from `@/components/ui/collapsible`

**Copy button behavior:** Each copy icon copies the adjacent value to clipboard using `navigator.clipboard.writeText()` and shows a brief toast notification.

## Visual Layout

**Collapsed (default):**
```text
[<- Back]  Manage individual (Owner) - Name         [Report v] [Entity v] [...]
+--------------------------------------------------------------------------+
| (MJ) Person Surname, I (Name) | A: Advisor | [Client] [Active]       [v]|
|      # 1234567890  Phone +2712345  Mail email@co.za                      |
+--------------------------------------------------------------------------+
```

**Expanded:**
```text
[<- Back]  Manage individual (Owner) - Name         [Report v] [Entity v] [...]
+--------------------------------------------------------------------------+
| (MJ) Person Surname, I (Name) | A: Advisor | [Client] [Active]       [^]|
|      # 1234567890  Phone +2712345  Mail email@co.za                      |
|--------------------------------------------------------------------------|
| Physical Address                        Cellphone                        |
| 123 Main St                             +27744581082  [copy]             |
| Suburb City Province                    +27744581080  [copy]             |
| Country                                                                  |
|                                         Email                            |
| Category          Tax Number            trishar@efgroup.co.za  [copy]    |
| individual        9876543210                                             |
+--------------------------------------------------------------------------+
```

## Files Summary

| File | Action |
|------|--------|
| `src/components/client-detail/ClientRibbon.tsx` | Modify -- condense Row 1 spacing, add expandable section to Row 2 with address/contact/tax details |

No new files needed. All changes are within the existing ClientRibbon component.

