
# Fix Document Loading Error, Seed Documents, and Link to Emails and Tasks

## Root Cause

The "Failed to load documents" error occurs because the `useClientDocuments` hook tries to join `documents` with `workflows` using a foreign key hint `documents_workflow_id_fkey`, but **no such foreign key constraint exists** on the `documents` table. The `documents.workflow_id` column exists but has no FK to `workflows`.

Additionally:
- The `documents` table is **completely empty** (0 rows)
- The `document_types` table is **completely empty** (0 rows)
- The `task_documents` junction table is **empty** (0 rows)
- The `email_attachments` table has 100 rows but no link back to the `documents` table

## Changes Required

### 1. Database Migration -- Add Missing FK and Link Column

**Add the missing foreign key** from `documents.workflow_id` to `workflows.id`:

```text
ALTER TABLE documents
  ADD CONSTRAINT documents_workflow_id_fkey
  FOREIGN KEY (workflow_id) REFERENCES workflows(id)
  ON DELETE SET NULL;
```

**Add `document_id` column to `email_attachments`** so attachments can be linked to client documents:

```text
ALTER TABLE email_attachments
  ADD COLUMN document_id UUID REFERENCES documents(id) ON DELETE SET NULL;
```

### 2. Seed Function Overhaul (`supabase/functions/seed-demo-communications/index.ts`)

Extend the existing seed function to also populate:

**a) `document_types` table** -- Seed ~20 commonly-used document types from the existing `DOCUMENT_TYPES` list, organized into three categories:

| Category | Example Types |
|----------|--------------|
| Client | Record of advice, Client pack, Planning document, Application form, Letter of authority, Will |
| FICA | Proof of ID, Proof of address, Proof of bank, Source of Funds, Self certification, Sanction list |
| Product | Policy form, Fee form, Beneficiary change, Fund switch or rebalance, Tax certificate, Quote |

**b) `documents` table** -- For each client across all jurisdictions, seed 4-8 documents:
- 2-3 Client documents (e.g., Record of advice, Client pack)
- 2-3 FICA documents (e.g., Proof of ID, Proof of address)
- 1-2 Product documents linked to a product name

Each document will have:
- Appropriate `status` (Complete, Pending, Expired -- weighted distribution)
- `created_at` spread over the past 12 months
- `expiry_date` for FICA documents (some already expired to show "Expired" status)
- Jurisdiction-appropriate naming
- `file_path` pointing to placeholder paths (no actual files stored in DB)

**c) Link `email_attachments` to `documents`** -- For emails that have attachments, create a corresponding `documents` row for the client and set the `document_id` on the email attachment. This enables the "Classify & Save" workflow from the Email View to store attachments as proper client documents.

**d) Seed `task_documents`** -- For a subset of tasks that have a `client_id`, link 1-2 relevant documents from that client's document set via the `task_documents` junction table. This populates the task-document relationship.

### 3. No Hook Changes Needed

The `useClientDocuments.ts` hook's query will work correctly once the FK constraint is in place:

```text
documents -> document_types (via documents_document_type_id_fkey) -- already exists
documents -> products (via documents_product_id_fkey) -- already exists
documents -> workflows (via documents_workflow_id_fkey) -- ADDING this FK
```

The `ClientDocumentsTab.tsx` UI code is already correct -- it groups documents by Client, FICA, and Product categories and renders them in accordions.

### 4. Expected Data Volume

| Table | Current | After Seed |
|-------|---------|------------|
| document_types | 0 | ~20 |
| documents | 0 | ~2,500-3,500 (5-7 per client x 553 clients) |
| task_documents | 0 | ~200-300 (subset of 500 tasks) |
| email_attachments | 100 | 100 (updated with document_id links) |

## Files Summary

| File | Action |
|------|--------|
| Database migration | Add FK `documents_workflow_id_fkey`, add `document_id` column to `email_attachments` |
| `supabase/functions/seed-demo-communications/index.ts` | Add document_types seeding, documents seeding per client, task_documents linking, email_attachment document linking |

## Deployment Steps

1. Run the database migration (add FK + column)
2. Update and deploy the seed function
3. Invoke the seed function to populate documents, document_types, and task_documents
4. Verify the Client Documents tab loads without errors and shows categorized documents
