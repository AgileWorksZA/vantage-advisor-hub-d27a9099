

## Show Opportunity Tags on Communications with Editable Popup

### Overview
Display color-coded opportunity type tags (aligned with the client Opportunities tab types: Growth, Cross-sell, Platform, Tax Loss, etc.) on each email row and chat conversation item. Clicking a tag opens a pre-populated dialog where the user can edit and save the opportunity.

### Approach

**1. Detect opportunity types from message content**

Create a utility function `detectOpportunityTypes(text: string): string[]` that scans message body/subject for keyword patterns and returns matching opportunity types from the existing `typeConfig` in `OpportunitiesTab.tsx`:
- "rebalance|allocation|drift|equity exposure" → "Portfolio Review"  
- "tax|capital gains|harvesting|CGT" → "Tax Loss"
- "cross-sell|insurance|risk cover|life cover" → "Cross-sell"
- "contribution|top-up|debit order|RA" → "Upsell"
- "consolidat|platform|provider|switch fund" → "Platform"
- "beneficiary|estate|will|trust" → "New Business"
- "bank scrape|bank feed|balance" → "Bank Scrape"
- "idle cash|money market|call account" → "Idle Cash"

Place this in a new file `src/lib/opportunity-detection.ts`.

**2. Add opportunity tags to email list rows (`Email.tsx`)**

- Extend `EmailListItem` in `useEmails.ts` with `detectedOpportunities: string[]` — populated during the transform step by running `detectOpportunityTypes` on `body_preview + subject`.
- In the email table, add a column or inline tags after the subject showing small colored badges using the same `typeConfig` colors from `OpportunitiesTab.tsx`.

**3. Add opportunity tags to chat conversation items (`ConversationList.tsx`)**

- Run `detectOpportunityTypes` on `conversation.last_message` and render small badges below the message preview.

**4. Create `OpportunityEditDialog` component**

New file: `src/components/email/OpportunityEditDialog.tsx`
- A dialog pre-populated with: Type (select from existing types), Description (from detected context), Suggested Action (editable), Priority (from `getOpportunityPriority`), Opportunity Size (editable number).
- Uses the same type config colors/icons from `OpportunitiesTab.tsx`.
- "Save" button stores to a lightweight approach — either creates a task or shows a toast confirming the opportunity was noted.
- Clicking any opportunity tag badge opens this dialog.

**5. Shared type config**

Extract the `typeConfig` map (labels, colors, icons) from `OpportunitiesTab.tsx` into `src/lib/opportunity-detection.ts` so both the client detail page and the communication pages can share it.

### Files

| File | Action |
|------|--------|
| `src/lib/opportunity-detection.ts` | **New** — keyword detection + shared typeConfig |
| `src/components/email/OpportunityEditDialog.tsx` | **New** — editable popup for opportunity |
| `src/hooks/useEmails.ts` | Add `detectedOpportunities` to `EmailListItem`, populate during transform |
| `src/pages/Email.tsx` | Render opportunity tags in email table rows, wire click to dialog |
| `src/components/email/ConversationList.tsx` | Render opportunity tags on conversation items, wire click to dialog |
| `src/components/client-detail/next-best-action/OpportunitiesTab.tsx` | Import shared typeConfig instead of defining locally |

