

# Implement Regional 360 Views for All Clients

## Overview

This plan creates dynamic, region-specific 360 view data for each client in the database, replacing the current hardcoded demo data with regionalized product information based on the client's nationality and the regional provider data already defined in the application.

## Summary of Changes

1. **On-Platform Investment Products**: Use "Vantage" as the investment house for all jurisdictions
2. **External Investment Products**: Show 2-4 products per client using platform names from regional provider data
3. **Rename "Corporate Cash Manager"** to "Platform Cash" across all jurisdictions
4. **Rename "Local CCM Account"** to popular banks per jurisdiction
5. **Short-Term Risk Products**: Use popular short-term insurance providers per jurisdiction
6. **Risk Products**: Use popular life insurance providers per jurisdiction
7. **Medical Aid**: Use popular health insurance/medical providers per jurisdiction
8. **Wills**: Randomized data with jurisdiction-specific "Board of Executors" names

## Regional Configuration

### Jurisdiction-Specific Data

| Jurisdiction | Currency | Platform Cash Bank | Board of Executors | Risk Provider | Short-Term Provider | Medical Provider |
|--------------|----------|-------------------|-------------------|---------------|---------------------|------------------|
| **ZA** | R | Investec | VantageBOE | Hollard Life, Old Mutual, Liberty | Santam, Outsurance | Discovery, PPS, Momentum |
| **AU** | A$ | Macquarie | Vantage Trust Co | TAL, AIA, Zurich | NRMA, AAMI, Allianz | Medibank, Bupa, HCF |
| **CA** | C$ | RBC | Vantage Estate | Manulife, Sun Life, Canada Life | Intact, Aviva, RSA | Sun Life, Manulife, Great-West |
| **GB** | £ | Barclays | Vantage Executors | Aviva, Legal & General, Zurich | Aviva, Direct Line, Admiral | Bupa, AXA, Vitality |
| **US** | $ | JPMorgan Chase | Vantage Trust | MetLife, Prudential, Northwestern | State Farm, Geico, Progressive | UnitedHealthcare, Aetna, Cigna |

### External Provider Platforms (from regionalData.ts)

| Jurisdiction | External Platforms |
|--------------|-------------------|
| **ZA** | Ninety One, Old Mutual International, Allan Gray, Sanlam Glacier |
| **AU** | Macquarie Wrap, AMP North, BT Wrap, Colonial First State, Hub24 |
| **CA** | RBC Dominion, TD Wealth Private, CIBC Wood Gundy, BMO Nesbitt Burns |
| **GB** | Hargreaves Lansdown, AJ Bell, Interactive Investor, Fidelity |
| **US** | Fidelity Investments, Charles Schwab, Vanguard, TD Ameritrade |

## Technical Implementation

### 1. Create Regional 360 View Configuration File

**New file: `src/data/regional360ViewData.ts`**

This file will contain:
- Type definitions for 360 view products
- Regional configuration for providers, banks, executors
- Helper functions to generate client-specific 360 view data
- Product generation logic with seeded randomization based on client ID

```text
Structure:
├── RegionalConfig interface
├── jurisdictionConfigs: Record<string, RegionalConfig>
├── generateClient360Data(clientId, nationality) → Client360Data
├── External product generation (2-4 per client)
├── Will data with randomized dates and executor names
├── Risk product generation with regional providers
├── Medical aid with regional schemes
```

### 2. Update Client360ViewTab Component

**Modify: `src/components/client-detail/Client360ViewTab.tsx`**

Changes:
- Import region context and client detail hook
- Map client nationality to jurisdiction (ZA, AU, CA, GB, US)
- Replace hardcoded demo data with calls to `generateClient360Data()`
- Rename "Corporate Cash Manager" section to "Platform Cash"
- Use dynamic currency formatting from region context

```text
Key updates:
Line 17-68: Replace static data with dynamic generation
Line 107-109: Change "On-Platform" to use "Vantage" as investment house
Line 270-278: Rename "Corporate Cash Manager" to "Platform Cash"
Line 287-288: Update column header from "Corporate Cash Manager" to "Account Name"
```

### 3. Nationality-to-Jurisdiction Mapping

The component will map client nationality values to jurisdiction codes:

| Nationality Pattern | Jurisdiction |
|--------------------|--------------|
| "South African" | ZA |
| "Australian" | AU |
| "Canadian" | CA |
| "British", "English", "Scottish", "Welsh" | GB |
| "American", "US Citizen" | US |
| Default/Unknown | ZA |

## Data Generation Logic

### On-Platform Products (Vantage)
- 1-3 products per client
- Product types vary by jurisdiction:
  - ZA: Investment Plan, Retirement Annuity Fund, Living Annuity
  - AU: Superannuation, SMSF, Pension Phase
  - CA: RRSP, TFSA, RRIF
  - GB: SIPP, Stocks & Shares ISA, General Investment Account
  - US: 401(k), Traditional IRA, Roth IRA

### External Products
- 2-4 products randomly selected from regional providers
- Randomization seeded by client ID for consistency
- Amount range: 50,000-500,000 in local currency

### Platform Cash (renamed from CCM)
- Bank name reflects popular local bank
- Single account per client
- Amount range: 10,000-100,000 in local currency

### Wills
- "Has Will": Randomized Yes/No (70% Yes)
- "Place Kept": Jurisdiction-specific Board of Executors name
- Executor names abbreviated to avoid table cramping:
  - ZA: "VantageBOE"
  - AU: "Vantage Trust"
  - CA: "Vantage Est."
  - GB: "Vantage Exec"
  - US: "Vantage Trust"
- Randomized dates within past 3 years

### Risk Products
- 1-2 products per client
- Provider names from regional insurance companies
- Premium amounts randomized

### Medical Aid/Health Insurance
- Scheme names and plan names per jurisdiction
- Premium amounts realistic for each region

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/data/regional360ViewData.ts` | **Create** | Regional 360 view configuration and data generation |
| `src/components/client-detail/Client360ViewTab.tsx` | **Modify** | Use dynamic regional data, rename CCM to Platform Cash |

## Currency Formatting

Each section will use the appropriate currency symbol and formatting:
- ZA: `R 1,234,567.89`
- AU: `A$ 1,234,567.89`
- CA: `C$ 1,234,567.89`
- GB: `£ 1,234,567.89`
- US: `$ 1,234,567.89`

## Sample Generated Data (ZA Client)

```text
On-Platform Investment Products | R 1,395,159.05
┌─────────────────┬────────────────────────┬────────────────────┐
│ Investment House│ Investment Product     │ Investment Amount  │
├─────────────────┼────────────────────────┼────────────────────┤
│ Vantage         │ Retirement Annuity Fund│ R 1,393,995.66     │
│ Vantage         │ Investment Plan        │ R 1,163.39         │
└─────────────────┴────────────────────────┴────────────────────┘

External Investment Products | R 843,956.45
┌─────────────────┬──────────────────┬─────────────────┐
│ Provider        │ Product          │ Amount          │
├─────────────────┼──────────────────┼─────────────────┤
│ Ninety One      │ Investment Plan  │ R 543,956.45    │
│ Allan Gray      │ Balanced Fund    │ R 300,000.00    │
└─────────────────┴──────────────────┴─────────────────┘

Platform Cash | R 55,083.00
┌─────────────────┬───────────────────┬─────────────────┐
│ Account Name    │ Account Number    │ Investment Amount│
├─────────────────┼───────────────────┼─────────────────┤
│ Investec Account│ 293000011         │ R 55,083.00     │
└─────────────────┴───────────────────┴─────────────────┘

Will
┌─────────┬──────────────┬────────────┬────────────────┐
│ Will    │ Date Of Will │ Place Kept │ Executors      │
├─────────┼──────────────┼────────────┼────────────────┤
│ Yes     │ 31/12/2023   │ VantageBOE │ VantageBOE     │
└─────────┴──────────────┴────────────┴────────────────┘

Risk Products
┌───────────────┬────────────────┬─────────────────┐
│ Holding Name  │ Policy Number  │ Payment Amount  │
├───────────────┼────────────────┼─────────────────┤
│ Hollard Life  │ HL429050603    │ R 5,494.75      │
└───────────────┴────────────────┴─────────────────┘

Medical Aid
┌─────────────────┬─────────────────┬─────────────────┐
│ Scheme Name     │ Plan Name       │ Indicative Premium│
├─────────────────┼─────────────────┼─────────────────┤
│ Discovery Health│ Coastal Core    │ R 4,855.00      │
└─────────────────┴─────────────────┴─────────────────┘
```

## Sample Generated Data (AU Client)

```text
On-Platform Investment Products | A$ 2,145,000.00
┌─────────────────┬────────────────────────┬────────────────────┐
│ Investment House│ Investment Product     │ Investment Amount  │
├─────────────────┼────────────────────────┼────────────────────┤
│ Vantage         │ Superannuation         │ A$ 1,500,000.00    │
│ Vantage         │ Pension Phase          │ A$ 645,000.00      │
└─────────────────┴────────────────────────┴────────────────────┘

External Investment Products | A$ 876,500.00
┌─────────────────┬──────────────────┬─────────────────┐
│ Provider        │ Product          │ Amount          │
├─────────────────┼──────────────────┼─────────────────┤
│ Macquarie Wrap  │ Investment Account│ A$ 450,000.00  │
│ AMP North       │ Super Fund       │ A$ 250,000.00   │
│ BT Wrap         │ Managed Fund     │ A$ 176,500.00   │
└─────────────────┴──────────────────┴─────────────────┘

Platform Cash | A$ 85,000.00
┌─────────────────┬───────────────────┬─────────────────┐
│ Account Name    │ Account Number    │ Investment Amount│
├─────────────────┼───────────────────┼─────────────────┤
│ Macquarie Cash  │ MAC123456789      │ A$ 85,000.00    │
└─────────────────┴───────────────────┴─────────────────┘

Will
┌─────────┬──────────────┬────────────────┬────────────────┐
│ Will    │ Date Of Will │ Place Kept     │ Executors      │
├─────────┼──────────────┼────────────────┼────────────────┤
│ Yes     │ 15/06/2024   │ Vantage Trust  │ Vantage Trust  │
└─────────┴──────────────┴────────────────┴────────────────┘

Risk Products
┌───────────────┬────────────────┬─────────────────┐
│ Holding Name  │ Policy Number  │ Payment Amount  │
├───────────────┼────────────────┼─────────────────┤
│ TAL Insurance │ TAL789012345   │ A$ 425.50       │
└───────────────┴────────────────┴─────────────────┘

Medical Aid
┌─────────────────┬─────────────────┬─────────────────┐
│ Scheme Name     │ Plan Name       │ Indicative Premium│
├─────────────────┼─────────────────┼─────────────────┤
│ Medibank Private│ Hospital Cover  │ A$ 385.00       │
└─────────────────┴─────────────────┴─────────────────┘
```

## Randomization Strategy

To ensure consistent but varied data per client:
1. Use client ID as seed for random number generation
2. Hash client ID to generate deterministic "random" selections
3. Product counts, amounts, and provider selections vary by client
4. Dates for wills randomized within sensible ranges

This approach ensures:
- Same client always shows same data on refresh
- Different clients have different products and amounts
- Regional providers are correctly applied

