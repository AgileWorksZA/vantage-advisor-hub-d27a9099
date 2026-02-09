

# Add "Upcoming Corporate Actions" Widget to Dashboard

## Overview
Add a new dashboard widget matching the reference screenshot that displays upcoming corporate actions (dividends, rights issues, stock splits, etc.) localized per jurisdiction with real exchange-traded investment codes. The widget includes a "Mandatory CAs" / "Voluntary CAs" dropdown filter and a table with CAID, Investment code, Event type, Affected accounts, and Ex date columns.

## Data Design

Add a new `CorporateActionData` interface and corporate actions array to `RegionalData` in `src/data/regionalData.ts`. Each jurisdiction gets realistic, localized data:

| Jurisdiction | Exchange | Example Codes |
|---|---|---|
| ZA | JSE | NPN.XJSE, SBK.XJSE, SOL.XJSE |
| AU | ASX | CBA.XASX, BHP.XASX, CSL.XASX |
| CA | TSX | RY.XTSE, TD.XTSE, ENB.XTSE |
| GB | LSE | SHEL.XLON, AZN.XLON, HSBA.XLON |
| US | NYSE/NASDAQ | AAPL.XNAS, MSFT.XNAS, JPM.XNYS |

Each action has: `id` (CAID number), `investmentCode`, `eventType` (Dividend, Rights Issue, Stock Split, Merger, Spin-off), `affectedAccounts` (number), `exDate`, and `type` ("mandatory" or "voluntary").

## Technical Changes

### 1. `src/data/regionalData.ts`
- Add `CorporateActionData` interface
- Add `corporateActions` field to `RegionalData` interface
- Add 6-8 corporate actions per jurisdiction (mix of mandatory and voluntary)

### 2. `src/pages/Dashboard.tsx`
- Add `corporate-actions` to `defaultDashboardLayout` array (position: `{ i: 'corporate-actions', x: 6, y: 3, w: 3, h: 3 }`)
- Add a new widget card with:
  - Drag handle header with "Upcoming corporate actions" title
  - A `Select` dropdown to filter between "Mandatory CAs" and "Voluntary CAs" (default: Mandatory)
  - Table columns: CAID, Investment code, Event type, Affected accounts, Ex date
  - Three-dot menu icon on each row (visual only, matching reference)
- Data sourced from `filteredRegionalData.corporateActions`, filtered by the local mandatory/voluntary state

### 3. Files using `RegionalData` type
No other files need changes -- the corporate actions data is only consumed on the Dashboard page. The `getFilteredRegionalData` function in `regionalData.ts` will pass through the `corporateActions` array unchanged (it's not advisor-specific).

## Widget Layout
The new widget slots into position `(6, 3)` in the default grid -- bottom-right, next to the existing "Clients by Value" widget. Existing users' saved layouts won't include it, so it will appear once they reset their layout or on first load for new users.

