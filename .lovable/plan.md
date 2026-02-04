
# Seed 500 Tasks Across Clients

## Overview

This implementation creates an Edge Function to seed 500 realistic tasks distributed across existing clients in the database. Tasks will be varied across task types, priorities, statuses, and due dates to simulate a realistic ticketing system workload.

## Current Data Analysis

| Data Type | Available Values |
|-----------|------------------|
| **Clients** | 210 clients in database |
| **Task Types** | Product change, Client complaint, Review / Renewal |
| **Priorities** | Critical, High, Medium, Low |
| **Statuses** | Not started, In Progress, Escalated, Closed |

## Distribution Strategy

### Task Distribution by Status

| Status | Percentage | Count |
|--------|------------|-------|
| Not started | 30% | 150 tasks |
| In Progress | 35% | 175 tasks |
| Escalated | 10% | 50 tasks |
| Closed | 25% | 125 tasks |

### Task Distribution by Priority

| Priority | Percentage | Count |
|----------|------------|-------|
| Critical | 10% | 50 tasks |
| High | 25% | 125 tasks |
| Medium | 45% | 225 tasks |
| Low | 20% | 100 tasks |

### Task Distribution by Type

| Type | Percentage | Count |
|------|------------|-------|
| Product change | 40% | 200 tasks |
| Client complaint | 25% | 125 tasks |
| Review / Renewal | 35% | 175 tasks |

### Due Date Distribution

| Period | Percentage | Count |
|--------|------------|-------|
| Overdue (past 30 days) | 15% | 75 tasks |
| Due today | 5% | 25 tasks |
| Due this week | 20% | 100 tasks |
| Due next week | 25% | 125 tasks |
| Due next month | 25% | 125 tasks |
| No due date | 10% | 50 tasks |

## Edge Function: `seed-demo-tasks`

### Implementation Details

```text
supabase/functions/seed-demo-tasks/index.ts
├── CORS headers (standard pattern)
├── Task templates array (50 realistic task titles/descriptions)
├── Distribution arrays for types, priorities, statuses
├── Date generation utilities
├── Main seeding logic
│   ├── Authenticate user
│   ├── Fetch all client IDs for user
│   ├── Generate 500 tasks distributed across clients
│   ├── Batch insert tasks (100 per batch)
│   ├── Create task_clients junction entries for multi-client linking
│   └── Return summary
└── Error handling
```

### Task Title Templates (50 variations)

Sample titles by type:

**Product Change:**
- Review and update investment portfolio allocation
- Process pension contribution adjustment request
- Update beneficiary details on life insurance policy
- Review asset rebalancing requirements
- Process fund switch request
- Update premium payment frequency
- Review annuity payout options
- Process policy surrender request
- Update risk profile assessment
- Review retirement funding strategy

**Client Complaint:**
- Address billing discrepancy concern
- Resolve statement delivery issue
- Investigate missed payment dispute
- Handle service response time complaint
- Address communication preference issue
- Resolve incorrect tax certificate
- Handle failed debit order complaint
- Address policy document error
- Investigate premium increase query
- Handle claims processing delay

**Review / Renewal:**
- Annual portfolio performance review
- Quarterly investment review meeting
- Life cover adequacy assessment
- Retirement planning annual review
- Short-term insurance renewal
- Medical aid benefit review
- Gap cover policy renewal
- Income protection review
- Disability cover assessment
- Estate planning document review

### Data Fields Population

| Field | Generation Method |
|-------|-------------------|
| `title` | Random selection from 50 templates |
| `description` | Detailed description based on title |
| `task_type` | Weighted random (40/25/35 split) |
| `priority` | Weighted random (10/25/45/20 split) |
| `status` | Weighted random (30/35/10/25 split) |
| `due_date` | Random within defined date ranges |
| `follow_up_date` | 3-7 days after due_date (if applicable) |
| `sla_deadline` | 1-2 days before due_date (if applicable) |
| `client_id` | Round-robin across all clients |
| `is_pinned` | 5% chance of being pinned |
| `source` | Random: Manual (60%), Email (20%), System (20%) |
| `tags` | Random selection from tag pool |
| `notes` | 50% chance of having 1-3 notes |
| `estimated_hours` | Random 0.5-8 hours |

### Multi-Client Linking

For 10% of tasks (50 tasks), create additional `task_clients` entries to demonstrate multi-client linking. These will link 2-3 clients per task.

## Files to Create

| File | Purpose |
|------|---------|
| `supabase/functions/seed-demo-tasks/index.ts` | Edge function to seed 500 tasks |

## Batch Processing

To avoid timeout issues:
- Tasks inserted in batches of 100
- Junction table entries inserted after main tasks
- Total of 5 batch operations

## Sample Generated Task

```json
{
  "title": "Annual portfolio performance review",
  "description": "Schedule and conduct annual portfolio performance review with client. Discuss investment returns, asset allocation, and rebalancing recommendations.",
  "task_type": "Review \\ Renewal",
  "priority": "Medium",
  "status": "Not started",
  "due_date": "2026-02-10",
  "follow_up_date": "2026-02-14",
  "sla_deadline": "2026-02-08",
  "client_id": "uuid-of-client",
  "is_pinned": false,
  "source": "Manual",
  "tags": ["annual-review", "portfolio"],
  "notes": [
    {
      "id": "uuid",
      "content": "Client prefers afternoon meetings",
      "created_at": "2026-01-15T10:30:00Z",
      "created_by": "user-uuid",
      "is_internal": false
    }
  ],
  "estimated_hours": 2.5
}
```

## Expected Result

After running the seed function:

| Metric | Value |
|--------|-------|
| Total Tasks | 500 |
| Tasks per Client (avg) | ~2.4 (500 / 210 clients) |
| Multi-client Tasks | ~50 |
| Pinned Tasks | ~25 |
| Overdue Tasks | ~75 |
| Due Today | ~25 |

## How to Trigger

The function will be callable from the Administration section or via direct API call:

```typescript
const response = await supabase.functions.invoke('seed-demo-tasks');
```

## Technical Notes

1. **Idempotent Design**: Function can be run multiple times; new tasks are always appended
2. **User-Scoped**: Tasks created for authenticated user only
3. **RLS Compliant**: All records include proper `user_id` for RLS policies
4. **Realistic Dates**: Uses current date as reference for date calculations
5. **Linked Clients**: Properly creates `task_clients` junction entries

## Implementation Order

1. Create Edge Function with task templates
2. Implement distribution logic
3. Add batch insert functionality
4. Create task_clients entries for multi-client linking
5. Deploy and test
6. Verify data appears correctly in Tasks page
