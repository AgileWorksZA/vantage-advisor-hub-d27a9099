

## Add "How Would You Like to Invest" Step to Quote Wizard

### Overview
When the user clicks "Next" on the product selection step (with a product selected), the wizard advances to step 2 ("How would you like to invest") with a scrollable content area matching the reference screenshots.

### Changes

**`src/components/client-detail/QuoteWizardDialog.tsx`** (single file)

#### 1. Make `currentStep` stateful
Replace `const [currentStep] = useState(0)` with `const [currentStep, setCurrentStep] = useState(0)` so we can advance through steps.

#### 2. Wire the "Next" button
On click, increment `currentStep` (only when a product is selected and on step 0).

#### 3. Update sidebar progress indicator
- Steps before `currentStep` show a green check icon (completed)
- The current step shows an orange/amber half-circle indicator (in-progress)
- Future steps remain grey circles
- Step labels for completed steps use `text-[hsl(180,70%,45%)]` color (teal/cyan)

#### 4. Add Step 2 content: "How Would You Like to Invest"
Based on the reference images, this scrollable panel includes:

**Lump-sum and phase-in investments** (collapsible, open by default):
- Lump-sum amount input (default 0.00)
- Phase in: Yes/No radio toggle (default No)
- Allocation of funds section with "Use template" link
  - Filter dropdown (default "All")
  - Type and Name fund selector dropdown
  - Percentage input + Amount input
  - Delete row icon button
  - Total row showing 0.00% and R 0.00
  - Add row (+) button
- "Save as a Template" button

**Recurring contribution** (collapsible):
- Amount input (0.00)
- Start date input (dd/mm/yyyy) with calendar icon
- Frequency dropdown
- Escalate % input
- Allocation of funds (same structure as above, with "Same as lump sum" button)

**Other Investments** (collapsible):
- Efficient On-Platform Investments input with info tooltip
- External Investments input with info tooltip

#### 5. Wrap left panel content in ScrollArea
The left panel content area uses `<ScrollArea>` to allow vertical scrolling for the longer step 2 form.

#### 6. Conditional rendering
- Step 0: Show current product selection UI
- Step 1: Show "How would you like to invest" UI

### Sidebar Progress States
| Step Index | When currentStep = 0 | When currentStep = 1 |
|------------|----------------------|----------------------|
| 0 (Select product) | Current (teal check) | Completed (green check, teal text) |
| 1 (How to invest) | Future (grey circle) | Current (amber circle, teal text) |
| 2 (Recurring withdrawal) | Future (grey) | Future (grey) |
| 3 (Financial adviser) | Future (grey) | Future (grey) |

### Technical Details

| Area | Detail |
|------|--------|
| File | `src/components/client-detail/QuoteWizardDialog.tsx` |
| New imports | `ScrollArea` from ui/scroll-area, `Input` from ui/input, `Select` components, `Info`, `Trash2`, `Plus`, `Calendar` from lucide-react |
| State additions | `currentStep` becomes mutable, add `lumpSumAmount`, `phaseIn`, fund allocation rows state |
| Layout | Left panel wrapped in `ScrollArea` for step 2 overflow |

