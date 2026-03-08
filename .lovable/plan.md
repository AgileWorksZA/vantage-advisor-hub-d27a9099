

## Enhance Email Content & AI Task Identification

This plan covers four areas: (1) richer financial-adviser email content, (2) AI-powered task/opportunity identification from email body, (3) functional "Guess Task" feature, and (4) seeding open tasks across all jurisdictions.

---

### 1. Enhance Email Body Templates (seed-demo-communications)

**File: `supabase/functions/seed-demo-communications/index.ts`**

Replace the generic 4-5 email body templates with ~15 category-specific templates that align with real financial adviser workflows. Each template will contain actionable content that the AI can later parse:

- **Compliance**: "Your FICA documents expire on [date]. Please provide updated proof of address and ID copy."
- **Portfolio Review**: "Your portfolio has drifted 4.2% from target allocation. I recommend rebalancing your equity exposure from 68% to 60%."
- **Tax**: "Your estimated capital gains for this tax year are R45,000. We should consider tax-loss harvesting on the underperforming funds."
- **Claims**: "Your disability claim #CL-7892 requires additional medical documentation. Please submit a GP report by [date]."
- **Investment**: "With your RA contribution room of R120,000 remaining, I recommend a top-up before 28 February to maximize your tax deduction."
- **Review meeting follow-up**: "Following our meeting, the agreed action items are: 1) Switch Fund A to Fund B, 2) Update beneficiary to spouse, 3) Increase life cover by R500k, 4) Submit updated FICA documents."
- **Inbound client requests**: "I'd like to increase my monthly debit order from R5,000 to R8,000. Can you also check if my beneficiary nominations are up to date?"

These templates directly map to task types (Follow-up, Compliance, Document Request, Portfolio Review, Annual Review) making AI matching realistic.

---

### 2. AI Task & Opportunity Identification from Email Content

**New Edge Function: `supabase/functions/guess-email-tasks/index.ts`**

An edge function that uses Lovable AI to analyze email content and match it to existing open tasks for the linked client(s).

- **Input**: `{ emailId, clientIds[] }`
- **Process**:
  1. Fetch the email body from the `emails` table
  2. Fetch open tasks for the given client IDs from the `tasks` table
  3. Send both to Lovable AI with a structured tool-call prompt asking it to:
     - Match email content to existing tasks (return task IDs + confidence)
     - Identify new opportunities/action items from the email (return type + description)
  4. Return matched tasks and identified opportunities
- **Output**: `{ matchedTasks: [{taskId, confidence, reason}], identifiedOpportunities: [{type, description, suggestedPriority}] }`

**Config update: `supabase/config.toml`**
```toml
[functions.guess-email-tasks]
verify_jwt = false
```

---

### 3. Wire "Guess Task" Button in UI

**Files: `src/pages/EmailView.tsx`, `src/pages/ComposeEmail.tsx`**

- Replace the placeholder `toast({ title: "AI task matching coming soon" })` with actual logic:
  1. Call the `guess-email-tasks` edge function with the email ID and linked client IDs
  2. Show a loading state on the button (spinner)
  3. On success, auto-link matched tasks (high confidence) and show results in the TaskLinkingSection
  4. Display identified opportunities as a toast or inline card below the task linking section
- For "Guess Completed Task", same flow but pass a flag to include completed tasks in the search

**New component: `src/components/email/AIInsightsPanel.tsx`**

A small collapsible panel below TaskLinkingSection showing AI-identified opportunities from the email:
- Each item shows type icon, description, suggested priority badge
- "Create Task" button to quickly create a task from an identified opportunity

---

### 4. Seed Open Tasks Across All Jurisdictions

**File: `supabase/functions/seed-open-tasks/index.ts`**

The existing seed function already creates 3-5 tasks per advisor. Enhance it to:

- Increase to **8-12 tasks per advisor** (200-300 total across 25 advisors)
- Add jurisdiction-specific task templates:
  - **ZA**: "FICA compliance verification", "RA top-up follow-up", "Section 11F certificate request"
  - **AU**: "Superannuation review", "SMSF compliance check", "TFN declaration update"
  - **CA**: "RRSP contribution reminder", "TFSA rebalance review", "T4 slip follow-up"
  - **GB**: "ISA allowance review", "SIPP drawdown review", "NI number verification"
  - **US**: "401(k) rebalancing review", "RMD calculation follow-up", "W-2 document request"
- Add more task types to templates: expand from 13 to ~25 templates
- Include a mix of statuses with more "In Progress" tasks to make matching realistic
- Ensure task titles reference specific financial products/actions that match seeded email content

---

### Summary of Changes

| File | Action |
|------|--------|
| `supabase/functions/seed-demo-communications/index.ts` | Enhance email body templates with actionable financial content |
| `supabase/functions/guess-email-tasks/index.ts` | **New** - AI edge function for task matching & opportunity identification |
| `supabase/config.toml` | Add `guess-email-tasks` function config |
| `src/pages/EmailView.tsx` | Wire Guess Task button to edge function |
| `src/pages/ComposeEmail.tsx` | Wire Guess Task button to edge function |
| `src/components/email/AIInsightsPanel.tsx` | **New** - Display AI-identified opportunities |
| `supabase/functions/seed-open-tasks/index.ts` | Expand with jurisdiction-specific templates, more tasks per advisor |

