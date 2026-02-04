

# Enhanced Email Compose with Client Search, Task Linking, and Attachment Classification

## Overview

This plan implements a comprehensive enhancement to the Email compose functionality with:
1. Auto-populating the "From" field with the email address from email settings (stored in database)
2. Inline dynamic client search dropdown with avatar/initials display
3. Task linking section with search, link, and confirmation messages
4. Email attachment popup with searchable document type classification
5. Document storage linked to client profiles

---

## Database Changes

### New Junction Table: `email_tasks`
Links emails to tasks for the task linking functionality.

```sql
CREATE TABLE email_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  email_id UUID NOT NULL REFERENCES emails(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  is_linked BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(email_id, task_id)
);

ALTER TABLE email_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own email_tasks"
  ON email_tasks FOR ALL USING (auth.uid() = user_id);
```

### Seed Document Types
Populate `document_types` table with the provided list if not already present (using `admin_document_templates` or inserting directly).

---

## Technical Implementation

### 1. From Field Auto-Population

**File:** `src/pages/ComposeEmail.tsx`

- Import and use `useEmailSettings` hook
- Replace the hardcoded `userEmail` in the From field with `emailSettings?.email_address || userEmail`
- Display the configured email or fallback to user's auth email

```tsx
// Add import
import { useEmailSettings } from "@/hooks/useEmailSettings";

// In component
const { settings: emailSettings } = useEmailSettings();
const fromEmail = emailSettings?.email_address || userEmail;

// In JSX - From field
<Input value={fromEmail} readOnly className="flex-1 bg-background" />
```

---

### 2. Inline Client Search Dropdown

**New Component:** `src/components/email/InlineClientSearch.tsx`

Features:
- Search input with magnifying glass icon
- "+ Add" button visible beside search
- Dropdown shows matching clients as user types
- Each client row displays:
  - Avatar with initials (colored background)
  - Green status dot
  - Client name in format "Surname, I (PreferredName)"
  - ID number or "No identification number found"
- Clicking a client adds them to the linked clients list

**Props Interface:**
```tsx
interface InlineClientSearchProps {
  selectedClients: LinkedClient[];
  onAddClient: (client: LinkedClient) => void;
  onRemoveClient: (clientId: string) => void;
}
```

**Implementation Pattern:**
- Use `useClients` hook to fetch all clients
- Filter clients based on search input (name, surname, ID number)
- Use Popover for the dropdown with ScrollArea
- Debounce search input for performance

---

### 3. Enhanced Task Linking Section

**Update:** `src/components/email/TaskLinkingSection.tsx`

Changes:
- Add confirmation message display (teal banner like screenshot 4)
- Add `onToggleLink` callback that shows confirmation toast
- Implement task search dialog

**New Component:** `src/components/email/TaskSearchDialog.tsx`

Features based on screenshot 3:
- Filter chips: "In Progress", "Assign to me", "Assign to my team", "High Priority", "Reviews"
- "Reset Filters" button and "Show Closed and Completed Cases" toggle
- Search input placeholder: "Description, Task Number, Task Type, Client, Advisor, Assignee or O"
- Date filter radio buttons: All Dates, Today Going Forward, Search a Specific Date, etc.
- Task Type and Status dropdown filters
- Results table with columns: Client, Task Type, Due date, Followup date, Status, Last Comment, Advisor, Task Number, Assignee, Menu
- Pagination: "1 to 5 of 939"
- Footer buttons: Cancel, Link Task(s)

**Data Fetching:**
- New hook `useTaskSearch` to fetch tasks with filters
- Filter by linked client IDs when clients are selected
- Support search across task_number, title, description, client name

---

### 4. Attachment Popup with Document Type Selection

**New Component:** `src/components/email/AttachmentLinkDialog.tsx`

Features based on screenshot 5:
- Title: "Attachment link confirmation popup"
- Info banner: "Any attachments that you wish to link to the task have to have a document type selected..."
- Table columns: Document name (with icon), Edit pencil, DocumentType (searchable dropdown), View (download icon), Linked (checkmark)
- Pagination footer
- Cancel and Save buttons

**Document Types List (searchable dropdown):**
```typescript
const DOCUMENT_TYPES = [
  "Addition", "Additional Contribution", "Annuity review", "Application form",
  "Beneficiary change", "Beneficiary risk rating and sanction list", "Client pack",
  "Client review", "Company documents(CIPC)", "Confirmation letter", "Death certificate",
  "Disclosure / Incorporation Certificate", "Disclosure/Incorporation Certificate",
  "Dividends Tax Declaration Form", "Email", "Fee form", "Fund switch or rebalance",
  "Guardian consent form", "Income change", "Instruction form", "Intermediary appointment",
  "Letter of authority", "Letter Of Authority", "Letter of Consent", "Letter of Introduction",
  "Mandate", "Marriage certification", "Migrated Compliance Document", "Minutes",
  "New Business", "Online authorisation form", "Other", "Ownership and Control Structure",
  "Partnership Agreement", "Planning document", "Policy form", "Proof of address",
  "Proof of Address (Operating)", "Proof of Address (Registered)", "Proof of bank",
  "Proof of ID", "Proof of payment", "Quote", "Rebalance", "Record of advice",
  "Reduced Tax Declaration Form", "Required actions form", "Resolution",
  "Resolution of authority", "Risk assessment form", "Sanction list", "Self certification",
  "Source of Funds", "Static detail change", "Switch", "Tax certificate", "Trust Deed",
  "Trust Resolution", "Unabridged Birth Certificate", "Will", "Withdrawal"
];
```

**New Component:** `src/components/email/DocumentTypeSelect.tsx`
- Searchable dropdown using Command/Combobox pattern
- Filter document types as user types
- Clear button (X) to reset selection

---

### 5. Document Storage to Client Profile

**Hook Update:** `src/hooks/useClientDocuments.ts`

Add method to upload documents from email attachments:
```typescript
const uploadFromEmailAttachment = async (
  clientId: string,
  attachmentId: string,
  documentTypeId: string,
  fileName: string,
  filePath: string
) => {
  // Create document record linked to client
  // Copy file from email attachments bucket to client documents if needed
};
```

**Integration:**
- When user saves attachment linking with document type selected
- Create entry in `documents` table with `client_id` and `document_type_id`
- Document appears in client's Documents tab

---

## New Hooks

### `useTaskSearch`
```typescript
interface TaskSearchFilters {
  clientIds?: string[];
  search?: string;
  status?: string[];
  taskType?: string[];
  priority?: string[];
  dateFilter?: 'all' | 'today_forward' | 'due_today' | 'overdue' | ...;
  assignee?: 'me' | 'my_team' | 'all';
  showCompleted?: boolean;
}

const useTaskSearch = (filters: TaskSearchFilters) => {
  // Fetch tasks matching filters
  // Return paginated results
};
```

### `useEmailTasks`
```typescript
const useEmailTasks = (emailId: string | null) => {
  // Fetch linked tasks for an email
  // Methods: linkTask, unlinkTask
  // Returns: linkedTasks, loading, error
};
```

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/pages/ComposeEmail.tsx` | Modify | Integrate email settings for From field, add InlineClientSearch, enhance TaskLinkingSection |
| `src/components/email/InlineClientSearch.tsx` | Create | Dynamic client search dropdown component |
| `src/components/email/TaskLinkingSection.tsx` | Modify | Add confirmation message, connect to real data |
| `src/components/email/TaskSearchDialog.tsx` | Create | Full-featured task search modal |
| `src/components/email/AttachmentLinkDialog.tsx` | Create | Attachment classification popup |
| `src/components/email/DocumentTypeSelect.tsx` | Create | Searchable document type dropdown |
| `src/hooks/useTaskSearch.ts` | Create | Task search with filters |
| `src/hooks/useEmailTasks.ts` | Create | Email-task linking operations |
| `src/data/documentTypes.ts` | Create | Document types constant list |
| Database migration | Create | `email_tasks` junction table |

---

## UI Flow

### Client Search Flow
1. User clicks "+ Add" button in Clients section
2. Popover opens with search input
3. User types letters (e.g., "wes")
4. Dropdown dynamically filters clients matching search
5. User clicks a client row
6. Client badge appears in the Clients section

### Task Linking Flow
1. User clicks "Search Task" button
2. TaskSearchDialog opens with filters
3. User searches/filters for relevant task
4. User selects task(s) and clicks "Link Task(s)"
5. Teal confirmation banner shows: "Task has been linked. 5 tasks found"
6. Task appears in the linked tasks table with toggle switch

### Attachment Flow
1. User clicks "Attach File" button
2. If email has attachments, AttachmentLinkDialog opens
3. User selects document type from searchable dropdown
4. User clicks Save
5. Document is saved to linked client's profile with selected type

---

## Confirmation Messages

When toggling task link switch:
- Success: Teal banner "Task has been linked. X tasks found"
- Unlink: Toast notification "Task unlinked"

---

## Document Types Usage Consistency

The same document types list will be used in:
- AttachmentLinkDialog (email compose)
- ClientDocumentsTab (client profile)
- TaskDetailSheet (task documents)

Centralized in `src/data/documentTypes.ts` for consistency.

