

## Add Recurring Withdrawal and Financial Adviser Steps

### Overview
Add two new steps to the Quote Wizard (steps 2 and 3) that the user navigates to by clicking "Next". The progress sidebar will update accordingly.

### Changes (single file: `src/components/client-detail/QuoteWizardDialog.tsx`)

#### 1. Update `handleNext` to support all steps
Currently only advances from step 0 to 1. Update to advance through steps 0 -> 1 -> 2 -> 3 (and eventually beyond).

#### 2. Add Step 2: Recurring Withdrawal (currentStep === 2)
Based on the reference image, this step contains a single collapsible section:

- **Recurring withdrawal** (collapsible, open by default):
  - Delete icon button (trash) at the top
  - Amount input (default "0.00")
  - Start date input (dd/mm/yyyy) with date picker
  - Frequency dropdown (required, marked with asterisk)
  - Escalate % input (required, default "0")
  - "Withdraw proportionally" link aligned right
  - Fund allocation table with columns: Type And Name (dropdown), Percentage, Amount
  - Total row showing 0.00% and R 0.00
  - Add fund (+) button

#### 3. Add Step 3: Financial Adviser (currentStep === 3)
Based on the reference image, this step has three collapsible sections:

- **Financial adviser** (collapsible, open by default):
  - Read-only display fields: Adviser code (e.g., "INT004"), Adviser name (e.g., "Emile Wegner"), FSP name, FSP code, Agency code

- **Advisory fees** (collapsible):
  - Lump sum (initial) fee % excl.VAT input (default "0.00")
  - Additional contribution fee % excl.VAT input (default "0.00")
  - Recurring contribution fee % excl.VAT input (default "0.00")
  - Ongoing financial advisory fee % excl.VAT input (default "0.00")
  - Fund-specific fees table: Fund name (dropdown) + Ongoing financial advisory fee % (excl.VAT) input
  - Add/delete row buttons

- **Preferred fee fund** (collapsible, collapsed by default):
  - Placeholder content for fee fund selection

#### 4. State additions
- Withdrawal step: `withdrawalAmount`, `withdrawalStartDate`, `withdrawalFrequency`, `withdrawalEscalation`, `withdrawalFunds`, `isWithdrawalOpen`, `withdrawProportionally`
- Financial adviser step: `lumpSumFee`, `additionalContributionFee`, `recurringContributionFee`, `ongoingAdvisoryFee`, `fundSpecificFees` array, `isAdviserOpen`, `isFeesOpen`, `isPreferredFundOpen`

#### 5. Navigation logic
- Step 0 (Select product) -> Next -> Step 1 (How to invest) -> Next -> Step 2 (Recurring withdrawal) -> Next -> Step 3 (Financial adviser)
- The "Next" button is always enabled on steps 1, 2, and 3; only disabled on step 0 without a product selected

### Progress Sidebar Behavior
The sidebar already correctly handles steps 0-3 with the existing `getStepIcon` and `getStepTextClass` logic. No sidebar changes needed -- the green check, amber current, and grey future indicators will work automatically as `currentStep` advances.

### Technical Summary

| Area | Detail |
|------|--------|
| File | `src/components/client-detail/QuoteWizardDialog.tsx` |
| New state vars | ~10 new state variables for withdrawal and adviser form fields |
| `handleNext` | Change from single condition to `if (currentStep < 3) setCurrentStep(currentStep + 1)` with step 0 requiring product selection |
| `renderStepContent` | Add `currentStep === 2` and `currentStep === 3` branches |
| Reuse | Reuse existing `renderFundAllocation` helper for the withdrawal fund table; create a simpler fund-fee table for adviser fees |

