

# Link Advice Process Workflow to Add Client Button

## Summary

This plan modifies the "Add Profile" button on the Clients page to present users with a choice dialog:
1. **Just load the client** - Creates client record and stays on Clients page (current behavior)
2. **Start with Advice Process** - Creates client record and immediately launches the Financial Planning Wizard

The Financial Planning Wizard (6-step advice process) already exists and is currently used by the "Add new product" button in `ClientProductsTab.tsx`. This plan reuses that same workflow component.

## Current Architecture

| Component | Purpose |
|-----------|---------|
| `Clients.tsx` | Main clients page with "Add Profile" button |
| `AddClientDialog.tsx` | Form dialog for creating new clients |
| `FinancialPlanningWizard.tsx` | 6-step advice process wizard (already built) |
| `useFinancialPlanningWorkflow.ts` | Hook for managing workflow state in database |

The Financial Planning Wizard includes these steps:
1. Client Introduction
2. Gather Information  
3. Analyse Position
4. Present Recommendation
5. Implement Agreements
6. Complete and Review

## Implementation Approach

### Phase 1: Create Choice Dialog Component

**New file: `src/components/clients/AddClientChoiceDialog.tsx`**

A simple dialog that appears when "Add Profile" is clicked, offering two options:

```text
+--------------------------------------------------+
|  Add New Client                                   |
+--------------------------------------------------+
|                                                  |
|  How would you like to proceed?                  |
|                                                  |
|  ┌────────────────────────────────────────────┐  |
|  │  📋 Load Client Only                       │  |
|  │  Create the client profile and return      │  |
|  │  to the clients list                       │  |
|  └────────────────────────────────────────────┘  |
|                                                  |
|  ┌────────────────────────────────────────────┐  |
|  │  📊 Start Advice Process                   │  |
|  │  Create the client and begin the           │  |
|  │  financial planning workflow               │  |
|  └────────────────────────────────────────────┘  |
|                                                  |
+--------------------------------------------------+
```

### Phase 2: Modify AddClientDialog to Return Client ID

Currently `AddClientDialog` creates a client but doesn't return the new client's ID. We need to:

1. Modify the insert query to use `.select().single()` to get the created record
2. Add an optional `onClientCreated` callback prop that receives the new client ID and name
3. Keep backward compatibility with existing `onClientAdded` callback

**Changes to AddClientDialog.tsx:**

```typescript
interface AddClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClientAdded: () => void;
  onClientCreated?: (client: { id: string; name: string }) => void; // NEW
}

// In onSubmit:
const { data: newClient, error } = await supabase.from("clients").insert({
  // ... existing fields
}).select().single();

if (error) throw error;

toast.success("Client added successfully");
form.reset();
onOpenChange(false);
onClientAdded();

// Call new callback if provided
if (onClientCreated && newClient) {
  onClientCreated({
    id: newClient.id,
    name: `${newClient.first_name} ${newClient.surname}`
  });
}
```

### Phase 3: Update Clients.tsx

Modify the Clients page to orchestrate the new flow:

1. Import the choice dialog and Financial Planning Wizard
2. Add state for managing dialog visibility and new client data
3. Wire up the flow: Choice → Create Client → (optionally) Launch Wizard

**New state in Clients.tsx:**

```typescript
const [choiceDialogOpen, setChoiceDialogOpen] = useState(false);
const [addDialogMode, setAddDialogMode] = useState<"simple" | "advice">("simple");
const [newClientForWizard, setNewClientForWizard] = useState<{id: string; name: string} | null>(null);
const [showWizard, setShowWizard] = useState(false);
```

**Flow logic:**

```text
User clicks "+ Add Profile"
        ↓
Show AddClientChoiceDialog
        ↓
    ┌───────────────────────────────────┐
    ↓                                   ↓
"Load Client Only"              "Start Advice Process"
    ↓                                   ↓
setAddDialogMode("simple")      setAddDialogMode("advice")
    ↓                                   ↓
Open AddClientDialog            Open AddClientDialog
    ↓                                   ↓
On client created:              On client created:
- Close dialog                  - Store client {id, name}
- Refresh list                  - Close dialog
- Done                          - Open FinancialPlanningWizard
                                - Done
```

### Phase 4: Reuse FinancialPlanningWizard

The existing `FinancialPlanningWizard` component is already fully functional. It:
- Creates a workflow record in `financial_planning_workflows` table
- Manages 6-step progress
- Auto-saves every 2 minutes
- Stores all data in the database

We simply need to render it in `Clients.tsx` when the advice flow is selected.

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/components/clients/AddClientChoiceDialog.tsx` | **Create** | New dialog for choosing between simple add or advice process |
| `src/components/clients/AddClientDialog.tsx` | **Modify** | Add `onClientCreated` callback prop to return new client ID and name |
| `src/pages/Clients.tsx` | **Modify** | Orchestrate choice dialog, add dialog, and wizard flow |

## AddClientChoiceDialog Component Design

```typescript
interface AddClientChoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChoiceSelected: (choice: "simple" | "advice") => void;
}

export const AddClientChoiceDialog = ({ 
  open, 
  onOpenChange, 
  onChoiceSelected 
}: AddClientChoiceDialogProps) => {
  const handleChoice = (choice: "simple" | "advice") => {
    onOpenChange(false);
    onChoiceSelected(choice);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
          <DialogDescription>
            How would you like to proceed?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <Button
            variant="outline"
            className="w-full h-auto p-4 flex flex-col items-start"
            onClick={() => handleChoice("simple")}
          >
            <span className="font-medium">Load Client Only</span>
            <span className="text-sm text-muted-foreground">
              Create the client profile and return to the clients list
            </span>
          </Button>

          <Button
            variant="outline"
            className="w-full h-auto p-4 flex flex-col items-start"
            onClick={() => handleChoice("advice")}
          >
            <span className="font-medium">Start Advice Process</span>
            <span className="text-sm text-muted-foreground">
              Create the client and begin the financial planning workflow
            </span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
```

## Updated Flow in Clients.tsx

```typescript
// State
const [choiceDialogOpen, setChoiceDialogOpen] = useState(false);
const [addDialogOpen, setAddDialogOpen] = useState(false);
const [selectedMode, setSelectedMode] = useState<"simple" | "advice">("simple");
const [newClientForWizard, setNewClientForWizard] = useState<{id: string; name: string} | null>(null);
const [showWizard, setShowWizard] = useState(false);

// Handler for choice selection
const handleChoiceSelected = (choice: "simple" | "advice") => {
  setSelectedMode(choice);
  setAddDialogOpen(true);
};

// Handler when client is created
const handleClientCreated = (client: { id: string; name: string }) => {
  if (selectedMode === "advice") {
    setNewClientForWizard(client);
    setShowWizard(true);
  }
  refetch();
};

// Button click opens choice dialog
<Button onClick={() => setChoiceDialogOpen(true)}>
  + Add Profile
</Button>

// Render dialogs
<AddClientChoiceDialog
  open={choiceDialogOpen}
  onOpenChange={setChoiceDialogOpen}
  onChoiceSelected={handleChoiceSelected}
/>

<AddClientDialog
  open={addDialogOpen}
  onOpenChange={setAddDialogOpen}
  onClientAdded={refetch}
  onClientCreated={handleClientCreated}
/>

{newClientForWizard && (
  <FinancialPlanningWizard
    open={showWizard}
    onOpenChange={(open) => {
      setShowWizard(open);
      if (!open) setNewClientForWizard(null);
    }}
    clientId={newClientForWizard.id}
    clientName={newClientForWizard.name}
  />
)}
```

## Expected Behavior After Implementation

| Scenario | Result |
|----------|--------|
| Click "+ Add Profile" | Choice dialog appears with two options |
| Select "Load Client Only" | AddClientDialog opens, client created, list refreshes |
| Select "Start Advice Process" | AddClientDialog opens, client created, wizard launches immediately |
| Complete or exit wizard | Wizard closes, client list already refreshed |
| Cancel at choice dialog | Dialog closes, no action taken |

## Technical Notes

1. **Client record always created first**: Both paths create the client record before any workflow. The Financial Planning Wizard requires a valid `clientId` to function.

2. **Workflow linked to client**: The `financial_planning_workflows` table has a `client_id` foreign key, so the workflow is properly associated with the new client.

3. **No duplicate workflows**: Each time "Start Advice Process" is selected, a new workflow is created. Existing workflows for the same client (if any) are not affected.

4. **Backward compatibility**: The existing `onClientAdded` callback continues to work. The new `onClientCreated` callback is optional.

5. **All data stored in database**: The Financial Planning Wizard already stores all step data in the `financial_planning_workflows.step_data` JSONB column.

