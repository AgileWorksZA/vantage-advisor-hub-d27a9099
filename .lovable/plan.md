

# Quote and New Business Wizards on the 360 View Tab

## Overview

Split the combined "+ Quote + New business" link on the On-Platform Investment Products header into two separate inline links ("+ Quote" and "+ New business"), and create full-screen wizard dialogs for each that present jurisdiction-specific product selections matching the provided reference images.

## Changes

### 1. Add jurisdiction-specific Quote/New Business product lists to regional data

**File: `src/data/regional360ViewData.ts`**

Add a new exported map of quote/new-business products per jurisdiction. The ZA products match the reference images exactly. Other jurisdictions use locale-appropriate product types:

| Jurisdiction | Products |
|---|---|
| ZA | Tax Free Plan, Pension Preservation Fund, Living Annuity, Provident Preservation Fund, Investment Plan, Retirement Annuity Fund |
| AU | Superannuation Fund, Self-Managed Super Fund (SMSF), Retirement Income Stream, Investment Account, Insurance Bond |
| CA | RRSP, TFSA, RRIF, Non-Registered Account, RESP, Locked-In Retirement Account |
| GB | SIPP, Stocks and Shares ISA, General Investment Account, Junior ISA, Lifetime ISA, Offshore Bond |
| US | 401(k) Rollover, Traditional IRA, Roth IRA, Brokerage Account, 529 Education Plan, SEP IRA |

Export a helper: `getQuoteProducts(jurisdiction: string): string[]`

### 2. Create the Quote Wizard Dialog

**New file: `src/components/client-detail/QuoteWizardDialog.tsx`**

A full-width dialog (max-w-6xl) with a two-panel layout:

**Left panel (approx 75% width):**
- Header: "QUOTE" in bold, followed by a teal top border accent
- Subheader: "SELECT YOUR DESIRED PRODUCTS"
- Collapsible "Product Selection" accordion (default open) containing radio buttons for each jurisdiction-specific product

**Right sidebar (approx 25% width):**
- Header: "QUOTE" centered
- Wizard step tracker with three sections:
  - **Capture** (with steps: Select product, How would you like to invest, Recurring withdrawal, Financial adviser)
  - **Review and Sign**
  - **Submitted**
- Current step highlighted with a teal checkmark icon; other steps shown as empty circles
- Bottom action buttons: "Cancel" (teal outline), "Save and close" (teal fill), and "Next" (teal fill, full width)

**Props:** `open`, `onOpenChange`, `jurisdiction` (string)

The dialog is UI-only for now -- no backend persistence. Clicking "Cancel" or "Save and close" closes the dialog.

### 3. Create the New Business Wizard Dialog

**New file: `src/components/client-detail/NewBusinessWizardDialog.tsx`**

Nearly identical to the Quote wizard but with these differences:

- Header: "NEW BUSINESS -" instead of "QUOTE"
- Sidebar header: "NEW BUSINESS"
- **Capture** section has additional steps: Product Selection, Create your investor profile, How would you like to invest, Recurring withdrawal, How would you like to pay, Financial adviser (6 steps vs 4)
- Bottom buttons: "Cancel", "Save and Exit" (instead of "Save and close"), "Next"

**Props:** `open`, `onOpenChange`, `jurisdiction` (string)

Same product radio list from the jurisdiction config, same UI-only behavior.

### 4. Update the 360 View Tab header

**File: `src/components/client-detail/Client360ViewTab.tsx`**

**Current (line 78-80):**
```
<Button variant="link">+ Quote + New business</Button>
```

**New:**
```
<div className="flex items-center gap-2">
  <Button variant="link" onClick={() => setShowQuoteWizard(true)}>+ Quote</Button>
  <span className="text-muted-foreground">|</span>
  <Button variant="link" onClick={() => setShowNewBusinessWizard(true)}>+ New business</Button>
</div>
```

Add state variables `showQuoteWizard` and `showNewBusinessWizard`, and render both dialog components at the bottom of the component, passing the client's jurisdiction derived from `mapNationalityToJurisdiction(client?.nationality)`.

## Visual Design (matching reference images)

The wizard dialogs follow the exact layout from the uploaded screenshots:

```text
+------------------------------------------------------------------+----------+
| QUOTE (or NEW BUSINESS -)                                        | QUOTE    |
| ─────────────────────────────── (teal border)                    |          |
| SELECT YOUR DESIRED PRODUCTS                                     | Capture  |
|                                                                  |  * Step1 |
| +-------------------------------------------------------------+ |  o Step2 |
| | Product Selection                                   [chevron]| |  o Step3 |
| |-------------------------------------------------------------| |  o Step4 |
| |  o Tax Free Plan                                             | |          |
| |  o Pension Preservation Fund                                 | | Review.. |
| |  o Living Annuity                                            | | Submit.. |
| |  o Provident Preservation Fund                               | |          |
| |  o Investment Plan                                           | | [Cancel] |
| |  o Retirement Annuity Fund                                   | | [Save]   |
| +-------------------------------------------------------------+ | [Next]   |
+------------------------------------------------------------------+----------+
```

- Teal accent color: `hsl(180, 70%, 45%)` (consistent with existing app theme)
- Radio buttons use standard Radix RadioGroup
- Collapsible section uses the existing Collapsible component
- Buttons match the teal gradient style from the screenshots

## Files Summary

| File | Action |
|------|--------|
| `src/data/regional360ViewData.ts` | Modify -- add `getQuoteProducts()` helper with jurisdiction product maps |
| `src/components/client-detail/QuoteWizardDialog.tsx` | Create -- Quote wizard dialog component |
| `src/components/client-detail/NewBusinessWizardDialog.tsx` | Create -- New Business wizard dialog component |
| `src/components/client-detail/Client360ViewTab.tsx` | Modify -- split link into two buttons, add dialog state and rendering |

