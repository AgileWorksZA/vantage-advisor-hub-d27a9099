

## Add Frequency Tags to Amount Fields

Add small frequency indicator badges (1M, 3M, 6M, 1Y) next to the Income, Recurring Contribution, Total Premium, and Payment Amount values in the 360 view tables.

### Approach

Create a reusable `FrequencyTag` component that renders a small styled badge, then add frequency data to the data interfaces and demo data, and display the tags inline with the relevant amount values.

### Changes

#### 1. New Component: `src/components/client-detail/FrequencyTag.tsx`
- A small inline badge component that accepts a frequency string (e.g., "1M", "3M", "6M", "1Y")
- Styled as a muted, compact tag beside the amount value

#### 2. Data Model Updates: `src/data/regional360ViewData.ts`
Add optional frequency fields to these interfaces:
- `OnPlatformProduct`: add `incomeFrequency?` and `contributionFrequency?`
- `ExternalProduct`: add `incomeFrequency?` and `contributionFrequency?`
- `ShortTermProduct`: add `premiumFrequency?`
- `RiskProduct`: add `paymentFrequency?`

Update the demo data generator to populate these fields with random frequency values ("1M", "3M", "6M", "1Y").

#### 3. Display Updates: `src/components/client-detail/Client360ViewTab.tsx`
Render `FrequencyTag` inline next to the relevant table cell values:
- On-Platform table: Income and Recurring Contribution cells
- External Products table: Income and Contribution cells
- Short Term table: Total Premium cell
- Risk Products table: Payment Amount cell

### Files

| File | Action |
|------|--------|
| `src/components/client-detail/FrequencyTag.tsx` | Create -- small badge component |
| `src/data/regional360ViewData.ts` | Edit -- add frequency fields to interfaces and demo data |
| `src/components/client-detail/Client360ViewTab.tsx` | Edit -- render FrequencyTag in table cells |

