

# Sticky Client Ribbon with Condensed Spacing

## Overview

Make the client ribbon (back button row + info bar + tab navigation) a fixed/sticky section that stays pinned at the top while tab content scrolls beneath it. Condense the ribbon's vertical spacing so its bottom edge aligns with the bottom of the "Clients" nav item in the left sidebar.

## Current Layout

```text
+--------+----------------------------------------------------------+
| Sidebar| AppHeader (h-14, fixed)                                   |
|        +----------------------------------------------------------+
|        | <main> (scrollable)                                       |
| Dash   |   ClientRibbon (row1 + row2)  <-- scrolls away            |
| Clients|   TabsList                    <-- scrolls away            |
|        |   TabsContent                                             |
|        |                                                           |
+--------+----------------------------------------------------------+
```

## Proposed Layout

```text
+--------+----------------------------------------------------------+
| Sidebar| AppHeader (h-14, fixed)                                   |
|        +----------------------------------------------------------+
|        | ClientRibbon (row1 + row2) -- STICKY, shrink-0            |
| Dash   | TabsList                   -- STICKY, shrink-0            |
| Clients+----------------------------------------------------------+
|        | <main> (scrollable)                                       |
|        |   TabsContent only                                        |
|        |                                                           |
+--------+----------------------------------------------------------+
```

The ribbon bottom (including tab bar) aligns with the bottom of "Clients" in the left nav.

## Changes

### 1. Condense ClientRibbon vertical spacing

**File: `src/components/client-detail/ClientRibbon.tsx`**

- Outer wrapper: change `mb-6` to `mb-0` (no bottom margin, the parent handles spacing)
- Row 1 (back + title): change `mb-3` to `mb-1.5` (tighter gap between rows)
- Row 1 padding: add `px-6 pt-3` for horizontal padding (moved from parent `<main>`)
- Info bar: change `py-4 px-5` to `py-2.5 px-5` (reduce vertical padding)
- Avatar: reduce from `w-14 h-14` to `w-10 h-10` and text from `text-lg` to `text-sm` (more compact)
- Status dot: scale proportionally smaller
- Info gap: reduce `gap-5` to `gap-3` between avatar and info text
- Line spacing: reduce `gap-1.5` to `gap-0.5` between the two info lines
- Info bar border-radius: keep `rounded-lg` but apply `mx-6` for horizontal inset

### 2. Restructure ClientDetail.tsx layout

**File: `src/pages/ClientDetail.tsx`**

Move the `Tabs` component to wrap a wider area. The `ClientRibbon` and `TabsList` sit in a non-scrolling `shrink-0` section between the AppHeader and the scrollable main. Only the `TabsContent` goes inside the scrollable `<main>`.

Current structure (simplified):
```tsx
<main className="flex-1 p-6 overflow-auto">
  <ClientRibbon ... />
  <Tabs ...>
    <TabsList ... />
    <TabsContent ... />
  </Tabs>
</main>
```

New structure:
```tsx
<Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
  {/* Sticky ribbon + tabs header */}
  <div className="shrink-0 bg-background border-b border-border">
    <ClientRibbon ... />
    <TabsList className="... px-6" />
  </div>

  {/* Scrollable tab content */}
  <main className="flex-1 p-6 overflow-auto">
    <TabsContent ... />
  </main>
</Tabs>
```

This keeps the `Tabs` context wrapper around both `TabsList` and `TabsContent` while placing them in separate scroll regions.

### 3. Spacing calculations for sidebar alignment

The left sidebar "Clients" button bottom edge is approximately:
- Sidebar top padding: 16px
- Command Center button + margin: 40px + 16px = 56px
- "Dash" button: ~44px
- "Clients" button: ~44px
- Total from viewport top: ~160px

The ribbon section needs to fit within:
- AppHeader height: 56px (h-14)
- Remaining budget for ribbon: ~104px

Approximate breakdown of condensed ribbon:
- Row 1 (back + title): ~36px (py-1.5 + text)  
- Gap between rows: 6px (mb-1.5)
- Info bar: ~44px (py-2.5 + compact avatar)  
- Gap to tabs: 0
- Tab strip: ~40px
- Total: ~126px

This brings the tab strip bottom close to the sidebar "Clients" bottom. Fine-tuning via padding values will achieve exact alignment.

## Files Summary

| File | Action |
|------|--------|
| `src/components/client-detail/ClientRibbon.tsx` | Modify -- condense spacing, reduce avatar size, remove outer margin |
| `src/pages/ClientDetail.tsx` | Modify -- restructure layout so ribbon + tab strip are sticky, only tab content scrolls |

