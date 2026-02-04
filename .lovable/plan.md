
# Populate Providers & Create Provider Configuration Screen

## Overview

This implementation will:
1. Extend the `product_providers` table with comprehensive configuration fields based on the screenshot
2. Create a detailed provider configuration screen with multiple sections
3. Add a product linking interface to associate products with providers
4. Seed 100 financial services providers (20 per country: South Africa, US, UK, Australia, Canada)
5. Store all data in the database (no hardcoded data)

## Database Schema Changes

### Extend `product_providers` Table

New columns to add based on the screenshot:

| Column | Type | Description |
|--------|------|-------------|
| `country` | text | Provider's country (ZA, US, UK, AU, CA) |
| `astute_code` | text | Astute integration code |
| `tel_number` | text | Primary phone number |
| `tel_number_legal` | text | Legal department phone |
| `fax_number_legal` | text | Legal department fax |
| `email_legal` | text | Legal department email |
| `portal_url` | text | Provider portal URL |
| `residential_address` | jsonb | Physical address |
| `postal_address` | jsonb | Mailing address |
| `services` | jsonb | Array of service types offered |
| `umbrella_provider_id` | uuid | Reference to parent provider |
| `contract_padding` | integer | Contract padding days |
| `exclude_from_aging` | boolean | Exclude from aging reports |
| `is_hidden` | boolean | Hide from selection lists |
| `auto_notify_changes` | boolean | Auto-notify on client detail changes |
| `disable_manual_contract_update` | boolean | Disable manual contract number updating |
| `is_approved` | boolean | Approval status |
| `is_umbrella_provider` | boolean | Is this an umbrella provider |
| `cc_static_update` | text | CC static update email |
| `is_deleted` | boolean | Soft delete flag |
| `deleted_at` | timestamptz | Soft delete timestamp |

### Service Types (stored in JSONB)

Services will be stored as an array of strings:
- Fiduciary Services
- Investments
- Life and Risk
- Medical
- Short Term Insurance (Commercial)
- Short Term Insurance (Personal)
- Stockbroking

## New Edge Function: `seed-providers-data`

**File:** `supabase/functions/seed-providers-data/index.ts`

Seeds 100 financial services providers:

### South Africa (20 providers)
| Code | Name | Type |
|------|------|------|
| ABSA | ABSA Life | Insurance |
| SNLM | Sanlam | Insurance |
| OLMU | Old Mutual | Insurance |
| DSCV | Discovery | Insurance |
| ALXF | Alexander Forbes | Insurance |
| LIBT | Liberty | Insurance |
| MOMN | Momentum Metropolitan | Insurance |
| PSGW | PSG Wealth | Investment |
| NINP | Ninety One | Asset Management |
| CORO | Coronation | Asset Management |
| ALLP | Allan Gray | Asset Management |
| INVS | Investec | Banking/Investment |
| STDL | Standard Bank Life | Insurance |
| FNBL | FNB Life | Insurance |
| CAPL | Capitec | Banking |
| AFLI | African Life | Insurance |
| ASST | Assupol | Insurance |
| BRTY | Brightrock | Insurance |
| HOLL | Hollard | Insurance |
| OUDS | Outsurance | Insurance |

### United States (20 providers)
| Code | Name | Type |
|------|------|------|
| MLFN | MetLife | Insurance |
| PRUD | Prudential Financial | Insurance |
| NWMU | Northwestern Mutual | Insurance |
| NYFL | New York Life | Insurance |
| LINF | Lincoln Financial | Insurance |
| PRNA | Principal Financial | Insurance |
| AFLC | Aflac | Insurance |
| VANG | Vanguard | Asset Management |
| BLCK | BlackRock | Asset Management |
| FIDL | Fidelity | Asset Management |
| SCHW | Charles Schwab | Brokerage |
| EDWJ | Edward Jones | Brokerage |
| MORN | Morgan Stanley | Banking/Investment |
| JPMW | JPMorgan Wealth | Banking/Investment |
| GSAM | Goldman Sachs AM | Asset Management |
| AMFA | Ameriprise Financial | Insurance |
| TRPR | Transamerica | Insurance |
| MAFC | Massachusetts Mutual | Insurance |
| UNUM | Unum Group | Insurance |
| ALLZ | Allianz US | Insurance |

### United Kingdom (20 providers)
| Code | Name | Type |
|------|------|------|
| AVVA | Aviva | Insurance |
| LGLG | Legal & General | Insurance |
| PHNX | Phoenix Group | Insurance |
| STJS | St. James's Place | Investment |
| STDL | Standard Life | Insurance |
| ROYL | Royal London | Insurance |
| SLII | Scottish Widows | Insurance |
| AEGN | Aegon UK | Insurance |
| ZURC | Zurich UK | Insurance |
| BAIF | Baillie Gifford | Asset Management |
| ABRD | Abrdn | Asset Management |
| LGIM | L&G Investment | Asset Management |
| SCHR | Schroders | Asset Management |
| JPHM | Jupiter | Asset Management |
| M&GI | M&G Investments | Asset Management |
| HRGS | Hargreaves Lansdown | Brokerage |
| AJBL | AJ Bell | Brokerage |
| INTC | Interactive Investor | Brokerage |
| VRIT | Vitality | Insurance |
| PRTC | Prudential UK | Insurance |

### Australia (20 providers)
| Code | Name | Type |
|------|------|------|
| CMMW | Commonwealth Bank Wealth | Banking/Investment |
| AMPW | AMP | Insurance |
| MQGW | Macquarie Group | Banking/Investment |
| SUNC | Suncorp | Insurance |
| IAGN | IAG | Insurance |
| QBEI | QBE Insurance | Insurance |
| MLCW | MLC Wealth | Insurance |
| COLO | Colonial First State | Asset Management |
| BTFG | BT Financial | Investment |
| WSTW | Westpac Wealth | Banking/Investment |
| ANZW | ANZ Wealth | Banking/Investment |
| NATW | NAB Wealth | Banking/Investment |
| MFGE | Magellan Financial | Asset Management |
| PPTL | Perpetual | Asset Management |
| CHLL | Challenger | Insurance |
| RESM | Resolution Life | Insurance |
| ZUAU | Zurich Australia | Insurance |
| TALN | TAL | Insurance |
| ONEP | OnePath | Insurance |
| AFFA | AustralianSuper | Superannuation |

### Canada (20 providers)
| Code | Name | Type |
|------|------|------|
| MNLF | Manulife | Insurance |
| SUNL | Sun Life | Insurance |
| GTWL | Great-West Lifeco | Insurance |
| CNLF | Canada Life | Insurance |
| DSJD | Desjardins | Insurance |
| INDL | Industrial Alliance | Insurance |
| BMOW | BMO Wealth | Banking/Investment |
| RBCW | RBC Wealth | Banking/Investment |
| TDWM | TD Wealth | Banking/Investment |
| CISW | CIBC Wealth | Banking/Investment |
| SCOW | Scotiabank Wealth | Banking/Investment |
| POWC | Power Corporation | Investment |
| AGFM | AGF Management | Asset Management |
| CIXW | CI Financial | Asset Management |
| IGMF | IGM Financial | Asset Management |
| FIRL | Fairfax Financial | Insurance |
| INTC | Intact Financial | Insurance |
| EQTB | Equitable Bank | Banking |
| BNCI | Beneva | Insurance |
| WAWF | Wawanesa | Insurance |

## Frontend Implementation

### 1. Update ProductsSection.tsx

Transform the Providers tab from a simple list to:
- Show providers in a table with key columns (Name, Code, Type, Country, Status)
- Click on a provider row opens the configuration screen
- Add "Seed Providers Data" button

### 2. New Component: ProviderDetailDialog.tsx

A comprehensive dialog/sheet with two main tabs:

#### Tab 1: Configuration
Sections matching the screenshot:

**Control Options**
- Contract padding (number input)
- Exclude from aging (Yes/No select)
- Is hidden (Yes/No select)
- Automatically notify of client detail changes (Yes/No select with helper text)
- Disable manual contract nr updating (Yes/No select)

**General Details**
- Name (text input)
- Is approved (Yes/No select)
- Is umbrella provider (Yes/No select)
- Astute code (text input)
- Tel number (text input)
- Tel number (legal) (text input)
- Fax number (legal) (text input)
- Email (legal) (text input)
- Email (text input)
- CC static update (text input)
- Portal URL (text input)
- Residential address (address component)
- Postal address (address component)
- Services (multi-select checkboxes)
- Umbrella provider (select from other providers)

#### Tab 2: Products
- Table showing products linked to this provider
- "Link Product" button to add products
- Product selection from the `products` table
- Ability to unlink products

### 3. New Hook: useProductProviders.ts

Custom hook for managing product providers with:
- CRUD operations on `product_providers` table
- Fetch products linked to a provider
- Link/unlink products

## Files to Create

| File | Purpose |
|------|---------|
| `supabase/functions/seed-providers-data/index.ts` | Edge function to seed 100 providers |
| `src/components/administration/products/ProviderDetailDialog.tsx` | Provider configuration dialog |
| `src/hooks/useProductProviders.ts` | Hook for provider CRUD operations |

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/administration/products/ProductsSection.tsx` | Update Providers tab with new functionality |
| Database migration | Extend `product_providers` table with new columns |

## Database Migration

```sql
-- Extend product_providers table
ALTER TABLE product_providers
ADD COLUMN IF NOT EXISTS country text DEFAULT 'ZA',
ADD COLUMN IF NOT EXISTS astute_code text,
ADD COLUMN IF NOT EXISTS tel_number text,
ADD COLUMN IF NOT EXISTS tel_number_legal text,
ADD COLUMN IF NOT EXISTS fax_number_legal text,
ADD COLUMN IF NOT EXISTS email_legal text,
ADD COLUMN IF NOT EXISTS portal_url text,
ADD COLUMN IF NOT EXISTS residential_address jsonb,
ADD COLUMN IF NOT EXISTS postal_address jsonb,
ADD COLUMN IF NOT EXISTS services jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS umbrella_provider_id uuid REFERENCES product_providers(id),
ADD COLUMN IF NOT EXISTS contract_padding integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS exclude_from_aging boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_hidden boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS auto_notify_changes boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS disable_manual_contract_update boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_approved boolean,
ADD COLUMN IF NOT EXISTS is_umbrella_provider boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS cc_static_update text,
ADD COLUMN IF NOT EXISTS is_deleted boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- Add unique constraint for upsert
ALTER TABLE product_providers
ADD CONSTRAINT product_providers_user_code_unique UNIQUE (user_id, code);
```

## UI Flow

```text
Providers Tab
    |
    +-- [Table View] ---> Click Row ---> Provider Detail Dialog
    |       |                                    |
    |       +-- Name                             +-- Tab: Configuration
    |       +-- Code                             |       +-- Control Options
    |       +-- Type                             |       +-- General Details
    |       +-- Country                          |       +-- Services
    |       +-- Status                           |       +-- Addresses
    |                                            |
    +-- [Seed Providers Data] Button             +-- Tab: Products
                                                         +-- Linked Products Table
                                                         +-- Link Product Button
```

## Expected Behavior

| Action | Result |
|--------|--------|
| Navigate to Providers tab | Shows empty table |
| Click "Seed Providers Data" | Calls edge function, seeds 100 providers |
| Refresh | Shows 100 providers from 5 countries |
| Click on a provider | Opens configuration dialog |
| Edit configuration | Saves to database |
| Go to Products tab | Shows linked products |
| Click "Link Product" | Shows product selection dialog |
| Select product | Links product to provider |

## Service Types (Checkbox Options)

The Services field will display these options as checkboxes:
- Fiduciary Services
- Investments  
- Life and Risk
- Medical
- Short Term Insurance (Commercial)
- Short Term Insurance (Personal)
- Stockbroking

Selected services are stored as a JSONB array: `["Investments", "Life and Risk"]`

## Sample Provider Record

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "code": "SNLM",
  "name": "Sanlam",
  "provider_type": "Insurance",
  "country": "ZA",
  "is_active": true,
  "astute_code": "SANLAM",
  "tel_number": "+27 21 947 9111",
  "tel_number_legal": "+27 21 947 9200",
  "email_legal": "legal@sanlam.co.za",
  "contact_email": "info@sanlam.co.za",
  "portal_url": "https://www.sanlam.co.za",
  "services": ["Investments", "Life and Risk", "Fiduciary Services"],
  "is_umbrella_provider": true,
  "is_approved": true,
  "contract_padding": 5,
  "exclude_from_aging": false,
  "is_hidden": false,
  "auto_notify_changes": true
}
```

## Technical Notes

1. **Provider Types**: Insurance, Asset Management, Banking/Investment, Brokerage, Superannuation
2. **Countries**: ZA (South Africa), US (United States), UK (United Kingdom), AU (Australia), CA (Canada)
3. **Product Linking**: Uses existing `products.provider_id` foreign key to `product_providers.id`
4. **Upsert Pattern**: Uses `ON CONFLICT (user_id, code) DO UPDATE` for idempotent seeding
5. **RLS**: All operations respect existing user-scoped RLS policies
