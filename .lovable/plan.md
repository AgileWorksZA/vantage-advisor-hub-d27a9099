

## Hide Frequency Tags on Zero Values and Add Hover Tooltips

### 1. Update FrequencyTag component

**File:** `src/components/client-detail/FrequencyTag.tsx`

- Add a `value` prop (string) representing the associated currency amount
- If the value represents zero (e.g., "R 0.00", "$0.00", "0", etc.), return null -- skip rendering the tag
- Wrap the Badge in a Tooltip that explains the frequency code:
  - 1M = Monthly
  - 3M = Quarterly
  - 6M = Semi-annually
  - 1Y = Annually

### 2. Pass the associated value to each FrequencyTag usage

**File:** `src/components/client-detail/Client360ViewTab.tsx`

Pass the corresponding amount string as a `value` prop to each FrequencyTag:
- On-Platform: `value={product.income}` and `value={product.contribution}`
- External: same pattern
- Short Term: `value={product.totalPremium}`
- Risk Products: `value={product.paymentAmount}`

### Technical details

**FrequencyTag.tsx** will:
- Accept `value?: string` prop
- Parse the value to check if it's zero by stripping non-numeric characters and checking if the result equals "0" or "0.00"
- Use `Tooltip` / `TooltipTrigger` / `TooltipContent` from the existing UI components
- Map frequency codes to full labels: `{ "1M": "Monthly", "3M": "Quarterly", "6M": "Semi-annually", "1Y": "Annually" }`

**Client360ViewTab.tsx** will add `value` prop at 6 FrequencyTag usage sites (lines ~212, 215, 332, 335, 495, 554).
