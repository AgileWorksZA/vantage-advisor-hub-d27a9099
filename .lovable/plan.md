

## Enhanced Meeting Detail Sheet: Client Prep, Outstanding Actions, Opportunities, and Smart Recording

### Overview

When clicking on a meeting/event in the calendar, the event detail sheet will be enhanced with three new sections (shown when the event has a linked client), plus an improved recording flow that tags AI-generated outcomes against the outstanding actions and opportunities.

---

### 1. New Component: MeetingPrepPanel

**File: `src/components/calendar/MeetingPrepPanel.tsx`** (new)

A self-contained component that accepts a `clientId` and renders three collapsible accordion sections:

#### Section 1: Client Summary
Fetches and displays a consolidated snapshot of recent client activity:
- **Recent Notes** (last 5 from `useClientNotes`): subject, date, priority
- **Recent Emails/Comms** (last 5 from `useClientCommunications`): subject, channel, date
- **Recent Transactions** (from `useClientProducts`): product name, value, status
- **Client Profile Quick Facts**: name, occupation, advisor, rating, household group

#### Section 2: Outstanding Actions
Fetches open tasks for the client from the `tasks` table (status != Completed/Cancelled) and categorizes them:
- **Compliance**: tasks with `task_type = "Compliance"`
- **Reviews**: tasks with `task_type` in ("Annual Review", "Portfolio Review")
- **Document Outstanding**: documents with status "Pending" or "Expired" from `useClientDocuments`

Each item shows title, due date, priority badge, and overdue indicator.

#### Section 3: Revenue Opportunities
Fetches from `project_opportunities` table where `client_id` matches, showing:
- **Opportunity name** and **confidence level**
- **Opportunity size** (potential_revenue formatted as currency)
- **Action required**: derived from the opportunity type (e.g., "Drive additional assets", "Deploy into TAMP", "Banking solution", "Custodian migration")
- **Status** badge (New, In Progress, Won)

Falls back to a static opportunities assessment using client product data when no DB opportunities exist:
- Gap analysis: client has investments but no insurance -> "Cross-sell insurance"
- Platform consolidation: multiple providers -> "Consolidate to preferred platform"
- AUM growth: contribution room -> "Drive additional contributions"

---

### 2. Integration into Calendar Event Sheet

**File: `src/pages/Calendar.tsx`**

- Import `MeetingPrepPanel`
- In the event detail sheet (non-edit mode), insert `<MeetingPrepPanel clientId={selectedEvent.clientId} />` between the event metadata (time/location/client) and the Meeting Recorder section
- Only rendered when `selectedEvent.clientId` exists

---

### 3. Enhanced AI Processing (process-meeting edge function)

**File: `supabase/functions/process-meeting/index.ts`**

Update the analysis prompt to also receive:
- Outstanding tasks for the client (fetched from DB in the edge function)
- Opportunity data for the client

The AI response JSON structure gets two new fields:

```text
"tagged_actions": [
  {
    "task_id": "uuid-of-existing-task",
    "task_title": "Annual Review",
    "outcome": "Discussed and agreed to proceed",
    "status_suggestion": "Completed" | "In Progress"
  }
],
"tagged_opportunities": [
  {
    "opportunity_id": "uuid or null",
    "opportunity_name": "TAMP Migration",
    "outcome": "Client interested, needs proposal",
    "suggested_task": {
      "title": "Prepare TAMP migration proposal",
      "priority": "High",
      "due_date": "YYYY-MM-DD"
    }
  }
]
```

---

### 4. Enhanced ActionItemsList for Tagged Outcomes

**File: `src/components/calendar/ActionItemsList.tsx`**

Add two new sub-sections after the existing "Suggested Actions":

- **Tagged Outstanding Actions**: shows which existing tasks were discussed in the meeting, with the AI's outcome note and a button to update the task status
- **Tagged Opportunities**: shows which opportunities were discussed, the outcome, and a "Create Task" button for each suggested follow-up

---

### 5. Data Fetching

**New hook: `src/hooks/useClientMeetingPrep.ts`**

A lightweight hook that fetches all three data sets in parallel for a given `clientId`:
- Open tasks (from `tasks` table, filtered by client_id, status not Completed/Cancelled)
- Outstanding documents (from `client_documents` table, status Pending/Expired)
- Opportunities (from `project_opportunities` table, filtered by client_id)
- Recent communications (from `client_communications`, last 5)
- Recent notes (from `client_notes`, last 5)

Returns structured data for the MeetingPrepPanel.

---

### Technical Summary

| Item | Detail |
|------|--------|
| New files | `MeetingPrepPanel.tsx`, `useClientMeetingPrep.ts` |
| Modified files | `Calendar.tsx` (insert prep panel), `process-meeting/index.ts` (enhanced prompt + fetch tasks/opportunities), `ActionItemsList.tsx` (tagged outcomes sections) |
| DB changes | None - all data already exists in current tables |
| Edge function changes | `process-meeting` fetches client tasks and opportunities before calling AI, adds tagged_actions and tagged_opportunities to response |
| New UI patterns | Accordion sections for prep data, outcome tagging cards with status update buttons |

