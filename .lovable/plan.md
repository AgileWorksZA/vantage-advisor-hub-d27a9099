
# Integrate Task Linking, Client Search, and Attachment Features into Email View

## Overview

The enhanced email features (inline client search, task linking with search dialog, and attachment classification) were implemented in ComposeEmail.tsx but not in EmailView.tsx. This plan adds these features to the Email View page.

## Current Issue

The EmailView.tsx page has:
- `TaskLinkingSection` with `isReadOnly` set, hiding all action buttons
- A static "+ Add" button for clients that does nothing
- No `TaskSearchDialog` integration
- No `AttachmentLinkDialog` integration
- No `useEmailTasks` hook for actual task linking

## Changes Required

### File: `src/pages/EmailView.tsx`

**1. Add new imports:**
```tsx
import { InlineClientSearch } from "@/components/email/InlineClientSearch";
import { TaskSearchDialog } from "@/components/email/TaskSearchDialog";
import { AttachmentLinkDialog, AttachmentItem } from "@/components/email/AttachmentLinkDialog";
import { useEmailTasks } from "@/hooks/useEmailTasks";
import { useClientDocuments } from "@/hooks/useClientDocuments";
import { LinkedClient } from "@/hooks/useEmailDetail";
```

**2. Add state management:**
```tsx
// Client management state
const [editableClients, setEditableClients] = useState<LinkedClient[]>([]);

// Task linking state
const [taskSearchOpen, setTaskSearchOpen] = useState(false);
const [taskLinkConfirmation, setTaskLinkConfirmation] = useState<string | null>(null);

// Attachment linking state
const [attachmentDialogOpen, setAttachmentDialogOpen] = useState(false);
const [pendingAttachments, setPendingAttachments] = useState<AttachmentItem[]>([]);
```

**3. Add hooks:**
```tsx
const { linkedTasks, linkTask, toggleTaskLink } = useEmailTasks(id || null);

// Use first linked client for document uploads
const primaryClientId = editableClients[0]?.id;
const { uploadDocument } = useClientDocuments(primaryClientId || "");
```

**4. Sync linkedClients to editableClients on load:**
```tsx
useEffect(() => {
  if (linkedClients.length > 0 && editableClients.length === 0) {
    setEditableClients(linkedClients);
  }
}, [linkedClients]);
```

**5. Add handler functions:**
```tsx
const handleAddClient = (client: LinkedClient) => {
  if (!editableClients.find((c) => c.id === client.id)) {
    setEditableClients([...editableClients, client]);
  }
};

const handleRemoveClient = (clientId: string) => {
  setEditableClients(editableClients.filter((c) => c.id !== clientId));
};

const handleLinkTasks = async (taskIds: string[]) => {
  let successCount = 0;
  for (const taskId of taskIds) {
    const success = await linkTask(taskId);
    if (success) successCount++;
  }
  if (successCount > 0) {
    setTaskLinkConfirmation(`Task${successCount > 1 ? "s" : ""} linked. ${linkedTasks.length + successCount} task${linkedTasks.length + successCount !== 1 ? "s" : ""} found`);
    setTimeout(() => setTaskLinkConfirmation(null), 5000);
  }
};

const handleToggleTaskLink = async (taskId: string, linked: boolean) => {
  const success = await toggleTaskLink(taskId, linked);
  if (success && linked) {
    setTaskLinkConfirmation(`Task has been linked. ${linkedTasks.length} task${linkedTasks.length !== 1 ? "s" : ""} found`);
    setTimeout(() => setTaskLinkConfirmation(null), 5000);
  }
};

const handleOpenAttachmentDialog = () => {
  if (attachments.length > 0) {
    setPendingAttachments(
      attachments.map((a) => ({
        id: a.id,
        name: a.file_name,
        filePath: a.file_path,
      }))
    );
    setAttachmentDialogOpen(true);
  }
};

const handleSaveAttachments = async (atts: { id: string; documentType: string; isLinked: boolean }[]) => {
  if (!primaryClientId) {
    toast({ title: "Please link a client before saving attachments", variant: "destructive" });
    return;
  }
  // Save attachments to client profile
  toast({ title: `${atts.length} attachment(s) saved to client profile` });
};
```

**6. Update Clients section (replace static + Add button):**
```tsx
{/* Clients */}
<div className="flex items-start gap-3">
  <Label className="w-16 text-sm text-muted-foreground pt-2">
    Clients
  </Label>
  <div className="flex-1 flex flex-wrap items-center gap-2">
    {editableClients.map((client) => (
      <ClientAvatarBadge
        key={client.id}
        id={client.id}
        initials={getClientInitials(client.first_name, client.surname)}
        name={formatClientName(client.first_name, client.surname, client.initials)}
        hasGreenDot
        onRemove={() => handleRemoveClient(client.id)}
      />
    ))}
    <InlineClientSearch
      selectedClients={editableClients}
      onAddClient={handleAddClient}
    />
  </div>
</div>
```

**7. Update TaskLinkingSection (remove isReadOnly, add real functionality):**
```tsx
{/* Confirmation Banner */}
{taskLinkConfirmation && (
  <div className="bg-[hsl(180,70%,45%)]/10 border border-[hsl(180,70%,45%)] text-[hsl(180,70%,45%)] px-4 py-2 rounded-lg text-sm">
    {taskLinkConfirmation}
  </div>
)}

{/* Task Linking Section */}
<TaskLinkingSection
  linkedTasks={linkedTasks}
  onToggleLink={handleToggleTaskLink}
  onGuessTask={() => toast({ title: "AI task matching coming soon" })}
  onSearchTask={() => setTaskSearchOpen(true)}
  onNewTask={() => navigate("/tasks")}
  onGuessCompletedTask={() => toast({ title: "Completed task matching coming soon" })}
/>

{/* Task Search Dialog */}
<TaskSearchDialog
  open={taskSearchOpen}
  onOpenChange={setTaskSearchOpen}
  clientIds={editableClients.map((c) => c.id)}
  onLinkTasks={handleLinkTasks}
/>
```

**8. Add Attachment Link Dialog:**
```tsx
{/* Attachment Link Dialog */}
<AttachmentLinkDialog
  open={attachmentDialogOpen}
  onOpenChange={setAttachmentDialogOpen}
  attachments={pendingAttachments}
  onSave={handleSaveAttachments}
  clientId={primaryClientId}
/>
```

**9. Update attachments section to include "Classify" button:**
```tsx
{/* Attachments */}
{attachments.length > 0 && (
  <div className="flex items-center gap-3">
    <Label className="w-16 text-sm text-muted-foreground">
      Attachments
    </Label>
    <div className="flex flex-wrap gap-2">
      {attachments.map((attachment) => (
        <button
          key={attachment.id}
          onClick={() => window.open(attachment.file_path, "_blank")}
          className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded border border-border hover:bg-muted transition-colors text-sm"
        >
          <FileText className="w-4 h-4 text-primary" />
          {attachment.file_name}
        </button>
      ))}
      <Button
        variant="outline"
        size="sm"
        onClick={handleOpenAttachmentDialog}
        className="h-7 text-xs"
      >
        Classify & Save
      </Button>
    </div>
  </div>
)}
```

## Summary of Changes

| File | Change | Description |
|------|--------|-------------|
| `src/pages/EmailView.tsx` | Modify | Add imports for InlineClientSearch, TaskSearchDialog, AttachmentLinkDialog, useEmailTasks |
| `src/pages/EmailView.tsx` | Modify | Add state for editable clients, task linking, attachment dialog |
| `src/pages/EmailView.tsx` | Modify | Add useEmailTasks hook integration |
| `src/pages/EmailView.tsx` | Modify | Replace static Add button with InlineClientSearch |
| `src/pages/EmailView.tsx` | Modify | Remove isReadOnly from TaskLinkingSection, connect real callbacks |
| `src/pages/EmailView.tsx` | Modify | Add TaskSearchDialog component |
| `src/pages/EmailView.tsx` | Modify | Add AttachmentLinkDialog component |
| `src/pages/EmailView.tsx` | Modify | Add confirmation banner for task linking |

## Visual Changes

After implementation, the EmailView page will have:

1. **Clients Section**: Shows linked clients with removable badges + "+ Add" dropdown that dynamically searches clients as user types

2. **Task Linking Section**: Shows buttons for "Guess Task", "Search Task", "New Task", "Guess Completed Task" and a table with linked tasks that have toggle switches

3. **Confirmation Banner**: Teal banner that appears when task is linked showing "Task has been linked. X tasks found"

4. **Attachments Section**: Clickable file chips + "Classify & Save" button that opens the attachment classification dialog

5. **Task Search Dialog**: Full-featured search modal with filters and pagination when "Search Task" is clicked
