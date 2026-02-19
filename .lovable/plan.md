

## Improve Outstanding Documents Widget with Jurisdiction-Localised Document Types

### Current State
The widget shows only 3 hardcoded rows with "Document" and "Workflow" columns -- no status, no dates, no jurisdiction awareness.

### Changes

#### 1. Localised Outstanding Documents Data (`src/data/documentTypes.ts`)

Add a new `REGIONAL_OUTSTANDING_DOCS` map keyed by jurisdiction (ZA, AU, CA, GB, US), each containing 8-12 outstanding document entries with:
- `document`: jurisdiction-specific name (e.g. ZA: "FICA - Proof of Address", US: "W-9 Tax Form", GB: "KYC - Proof of Address", AU: "AML/CTF Identity Verification", CA: "KYC - SIN Verification")
- `workflow`: related workflow name
- `status`: "Overdue" | "Pending" | "Due Soon"
- `daysOverdue`: number (negative = days until due)
- `priority`: "High" | "Medium" | "Low"

Include jurisdiction-specific document types:
- **ZA**: FICA documents, FAIS Record of Advice, Tax Directive, SARS Tax Certificate, BEE Certificate, Trust Deed, CIPC documents
- **AU**: AML/CTF Identity Verification, ASIC Compliance Declaration, Superannuation Statement, Medicare Card Copy, ABN Registration
- **GB**: KYC documents, FCA Suitability Report, HMRC Self-Assessment, National Insurance letter, Companies House Certificate
- **US**: W-9/W-8BEN, SEC Form ADV, IRS 1099 Statement, Social Security verification, FinCEN SAR
- **CA**: KYC/AML documents, CRA Tax Assessment, SIN Verification, FINTRAC Compliance, Provincial Business License

Also add a `getOutstandingDocsForRegion(region: string, clientId: string)` helper that uses seeded random to deterministically select 4-7 documents from the regional pool for a given client.

#### 2. Enhanced Widget UI (`src/components/client-detail/ClientDashboardTab.tsx`)

Replace the current basic table with a richer layout:

- Remove the hardcoded `outstandingDocs` array (lines 83-87)
- Import `getOutstandingDocsForRegion` and use it with `selectedRegion` and `clientId`
- Add a summary row at top: count of overdue (red badge) + pending (amber badge)
- Replace the plain table with styled rows showing:
  - Status dot (red for Overdue, amber for Due Soon, blue for Pending)
  - Document name (bold)
  - Workflow name (muted, smaller)
  - Days indicator: "3 days overdue" in red or "Due in 5 days" in muted
  - Priority badge (small, outline style)
- Add a "Request All" button in the card header (small, outline variant)

### Files to Edit
- `src/data/documentTypes.ts` -- add regional outstanding docs data and helper
- `src/components/client-detail/ClientDashboardTab.tsx` -- replace widget with enhanced version

### Visual Layout
```
[Outstanding Documents]  [3 Overdue] [2 Pending]  [Request All]
--------------------------------------------------------------
 * FICA - Proof of Address          3 days overdue    [High]
   FICA - Individual
 * Risk Profile Questionnaire       Due in 5 days     [Medium]
   Advice Cycle
 * Tax Directive                    7 days overdue    [High]
   Annual Review
 ...
```
