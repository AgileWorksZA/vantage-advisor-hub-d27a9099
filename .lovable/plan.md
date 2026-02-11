

## Quote Wizard Layout and Progress Panel Refinements

### Overview
Three changes: reduce top spacing, make the right panel a sticky floating card, and restructure the progress tracker to visually separate main workflow phases from sub-steps.

### Changes (single file: `src/components/client-detail/QuoteWizardDialog.tsx`)

#### 1. Reduce space above quote heading
- Change the left panel header padding from `p-8 pb-0` to `p-6 pb-0`
- Reduce the teal divider bottom margin from `mb-6` to `mb-4`

#### 2. Right panel becomes a sticky floating card
- Replace the current full-height `w-64 bg-muted/30 border-l` sidebar with a `sticky top-4` positioned card
- Add `rounded-lg border shadow-sm` styling to make it appear as a floating box
- Set a compact height (auto-sized, not full-height) so it fits within less than half the scrollable area
- Move the outer layout from `flex` to a relative layout: left panel scrolls normally, right panel is `sticky` within a flex container
- Remove `flex-1` from the sidebar's inner content so it doesn't stretch

#### 3. Differentiate main steps from sub-steps

**Main workflow phases** (Capture, Review and Sign, Submitted):
- Render as bold section headers WITHOUT status circles
- Highlight the active phase with teal text color; inactive phases use muted text
- "Capture" is active when `currentStep` is 0-3
- "Review and Sign" is active at step 4
- "Submitted" is active at step 5

**Sub-steps** (Select product, How would you like to invest, etc.):
- Remain indented under their parent phase with status circles (green check, amber current, grey future)
- Only shown under the "Capture" phase

### Layout Structure (after changes)

```text
+------------------------------------------+
| QUOTE - Product (Number)        |  +------------------+ |
| ================================|  | QUOTE - ...      | |
|                                 |  |                  | |
| [Scrollable step content]       |  | CAPTURE          | |
|                                 |  |   o Select prod  | |
|                                 |  |   o How to invest| |
|                                 |  |   o Recurring    | |
|                                 |  |   o Fin adviser  | |
|                                 |  |                  | |
|                                 |  | REVIEW AND SIGN  | |
|                                 |  | SUBMITTED        | |
|                                 |  |                  | |
|                                 |  | [Cancel] [Save]  | |
|                                 |  | [    Next      ] | |
|                                 |  +------------------+ |
+------------------------------------------+
```

### Technical Details

| Area | Current | Updated |
|------|---------|---------|
| Header padding | `p-8 pb-0`, `mb-6` | `p-6 pb-0`, `mb-4` |
| Right panel wrapper | `w-64 bg-muted/30 border-l flex flex-col` (full height) | `w-64 self-start sticky top-4 m-4 rounded-lg border shadow-sm bg-background` |
| Outer container | `flex h-full` | `flex h-full overflow-auto` (ensure scroll context for sticky) |
| "Capture" header | Has no special styling, uses `h4` with sub-items having circles | Bold label, highlighted teal when active, no circle |
| "Review and Sign" | Has a `Circle` icon | No circle, bold label, teal when active phase |
| "Submitted" | Has a `Circle` icon | No circle, bold label, teal when active phase |
| Sub-steps | Same level as headers | Indented `ml-3` under Capture, keep circle indicators |

