
# Administrative Module - Complete Section Implementation

## Overview

This implementation creates all remaining administrative section components with full CRUD functionality. Each section uses the existing database tables, `useAdminData` hook, and reusable UI components to ensure all data is stored in the database (not in code).

## Database Tables Already Created

The migration created these tables which will be used:

| Table | Purpose |
|-------|---------|
| `admin_general_lists` | Master lookup table (banks, currencies, locations, etc.) |
| `admin_data_imports` | Import job tracking with progress |
| `admin_document_templates` | Document template configuration |
| `admin_product_benefits` | Product benefit mappings |
| `admin_funds` | Fund/instrument management |
| `admin_note_subjects` | Note subject configuration |
| `admin_events` | Event-driven automation |
| `admin_communication_settings` | Channel configuration |
| `admin_system_settings` | Platform settings |

## Files to Create

### 1. Data Integrations Section
**File:** `src/components/administration/data-integrations/DataIntegrationsSection.tsx`

- Uses `admin_data_imports` table
- Shows import jobs with status, progress, duration
- Columns: Import Name, Type, Status (badge), Start Time, Duration, Lines, Processed, Changed By
- Tabs: Activity, Queue, Alerts, Imports, Checks, Provider Notifications, Provider Contacts, Log Backups, Astute, FICA
- Add/Edit dialog with import_type, import_name, status, source_reference fields
- Progress bar component for in-progress imports
- Status badges: Completed (green), In Progress (blue), Paused (yellow), Failed (red)

### 2. Planning Tools Section  
**File:** `src/components/administration/planning-tools/PlanningToolsSection.tsx`

- Uses `admin_general_lists` with list_type filter
- Tabs: Bucket Settings, Goal Categories, Risk Profiles
- Maps tabs to list_types: `bucket_settings`, `goal_categories`, `risk_profiles`
- Standard add/edit/delete for configuration items

### 3. Campaign Management Section
**File:** `src/components/administration/campaign-management/CampaignManagementSection.tsx`

- Uses `admin_general_lists` with list_type filter
- Tabs: Templates, Automation Rules
- Maps to list_types: `campaign_templates`, `automation_rules`
- Standard CRUD operations

### 4. Communication Section
**File:** `src/components/administration/communication/CommunicationSection.tsx`

- Uses `admin_communication_settings` table
- Columns: Channel, Provider, Settings (formatted), Status
- Tabs: Email Settings, WhatsApp, SMS, Push Notifications
- Filter by channel field: `email`, `whatsapp`, `sms`, `push`
- Add/Edit dialog with channel, provider, settings (JSON), is_active fields

### 5. Documents Section
**File:** `src/components/administration/documents/DocumentsSection.tsx`

- Uses `admin_document_templates` table
- Columns: Code, Name, Secondary Name, Category, Has Content (check), Public Upload (check), Workflow Signature (check), Status
- Tabs: Document Types, Templates, Signatures, Public Upload
- Boolean indicator components for checkmarks
- Filter by category or specialized view per tab
- Add/Edit dialog with all template fields

### 6. Products Section
**File:** `src/components/administration/products/ProductsSection.tsx`

- Uses `admin_product_benefits` table for Benefits tab
- Uses `admin_general_lists` for Classification tab (list_type: `product_classification`)
- Tabs: Products List, Classification, Benefits, Providers
- Benefits columns: Name, Field Mapping, Is Mapped (check), Display Order, Status
- Add/Edit dialog for each tab type

### 7. Funds & Instruments Section
**File:** `src/components/administration/funds/FundsSection.tsx`

- Uses `admin_funds` table
- Columns: Name, Code, ISIN, Fund Manager, Fact Sheet (link), Source, Asset Classes, Approved (check), Cat I, Cat II, Domicile, Location
- Tabs: Instruments, Exchanges, Sectors, Industries, Unlisted
- Exchanges/Sectors/Industries use `admin_general_lists` with respective list_types
- External link icon for fact sheet URL
- Add/Edit dialog with comprehensive fund fields

### 8. Transactions Section
**File:** `src/components/administration/transactions/TransactionsSection.tsx`

- Uses `admin_general_lists` with list_type filter
- Tabs: Transaction Types, Processing Rules
- Maps to list_types: `transaction_types`, `processing_rules`
- Standard CRUD operations

### 9. Notes & Tasks Section
**File:** `src/components/administration/notes-tasks/NotesTasksSection.tsx`

- Uses `admin_note_subjects` table for Note Subjects tab
- Uses `admin_general_lists` for Task Types (list_type: `task_types`) and Priorities (list_type: `priorities`)
- Columns for Note Subjects: Name, Item Count, Display Order, Status
- Add/Edit dialog for each tab

### 10. Events Section
**File:** `src/components/administration/events/EventsSection.tsx`

- Uses `admin_events` table
- Columns: Name, Module, Trigger Type, Trigger Conditions (summary), Actions (summary), Status
- Tabs: Events List, Notifications, Triggers
- JSONB fields rendered as summaries
- Add/Edit dialog with module dropdown, trigger_type, conditions builder, actions config

### 11. System Settings Section
**File:** `src/components/administration/system/SystemSettingsSection.tsx`

- Uses `admin_system_settings` table
- Columns: Setting Key, Value (formatted), Category, Description
- Tabs: General, Audit, Permissions
- Filter by category field
- Add/Edit dialog with key, value (JSON editor), category, description

## Files to Modify

### `src/pages/Administration.tsx`
- Import all new section components
- Update `renderSectionContent()` switch statement to render correct component for each section

### `src/components/administration/AdminDataTable.tsx`
- Add helper components:
  - `ImportStatusBadge` - colored status badges for imports
  - `BooleanIndicator` - checkmark/X icons for boolean fields
  - `ProgressBar` - mini progress indicator
  - `ExternalLink` - clickable link icon

### `src/hooks/useAdminData.ts`
- Already supports all required tables
- No changes needed

## Component Pattern

Each section follows this consistent pattern:

```typescript
export function SectionNameSection() {
  const { tab } = useParams();
  const navigate = useNavigate();
  const activeTab = tab || "default-tab";
  
  // Determine table/filter based on activeTab
  const { data, isLoading, searchTerm, setSearchTerm, create, update, delete: deleteItem, refetch } = useAdminData({
    table: "table_name",
    filters: { /* tab-specific filters */ },
    orderBy: { column: "created_at", ascending: false },
  });

  const [showDialog, setShowDialog] = useState(false);
  const [editItem, setEditItem] = useState<ItemType | null>(null);
  const [formData, setFormData] = useState({ /* initial form state */ });

  // Column definitions
  const columns: ColumnDef<ItemType>[] = [ /* ... */ ];

  // Handlers
  const handleAdd = () => { /* reset form, open dialog */ };
  const handleEdit = (item) => { /* populate form, open dialog */ };
  const handleSave = () => { /* create or update, close dialog */ };
  const handleDelete = (item) => { /* call deleteItem */ };

  return (
    <div className="p-6 space-y-6">
      <Tabs value={activeTab} onValueChange={(v) => navigate(`/administration/section-id/${v}`)}>
        <TabsList> {/* Tab triggers */} </TabsList>
        <div className="mt-6">
          <AdminSectionHeader
            title={/* current tab label */}
            itemCount={data.length}
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            onAdd={handleAdd}
            onReset={() => refetch()}
          />
          <div className="mt-4">
            <AdminDataTable
              data={data}
              columns={columns}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isLoading={isLoading}
            />
          </div>
        </div>
      </Tabs>
      
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        {/* Form fields specific to section */}
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
          <Button onClick={handleSave}>{editItem ? "Save Changes" : "Create"}</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
```

## Helper Components to Add

```typescript
// Import status badge with colors
export function ImportStatusBadge({ status }: { status: string }) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    "Completed": "default",
    "In Progress": "outline", 
    "Paused": "secondary",
    "Failed": "destructive",
    "Pending": "secondary",
    "Cancelled": "secondary",
  };
  return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
}

// Boolean checkmark indicator
export function BooleanIndicator({ value }: { value: boolean }) {
  return value ? (
    <Check className="h-4 w-4 text-green-600" />
  ) : (
    <X className="h-4 w-4 text-muted-foreground" />
  );
}

// Duration formatter
export function formatDuration(seconds: number | null): string {
  if (!seconds) return "—";
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) return `${hrs}h ${mins}m`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}
```

## Key Implementation Details

### All Data in Database
- No hardcoded dropdown options - all use `admin_general_lists` with appropriate list_type
- Tab-specific data filtered from database using filters parameter
- New items created with proper user_id from auth context
- Soft delete using is_deleted flag and deleted_at timestamp

### Add/Delete Button Functionality
- "Add new" button opens dialog with empty form
- Form validation before save
- Create calls `create()` mutation from useAdminData
- Delete confirmation dialog before calling `delete()` mutation
- Toast notifications on success/error (already in hook)

### Tab Navigation
- Each tab maps to either a different table or a filter on the same table
- URL updates on tab change: `/administration/section-id/tab-id`
- Active tab determined from URL params

## Expected Behavior

| Action | Result |
|--------|--------|
| Navigate to Data Integrations | Shows Activity tab with import logs |
| Click "Add new" | Opens dialog with import form fields |
| Fill form and click "Create" | Inserts record to database, refreshes list |
| Click pencil icon on row | Opens dialog pre-filled with item data |
| Click trash icon | Shows confirmation, soft-deletes on confirm |
| Search in search box | Filters visible data in real-time |
| Change tabs | Updates URL, loads appropriate filtered data |

## Summary

This implementation creates 11 section components with full CRUD functionality, all storing data in the Supabase database tables. Each section follows the established pattern from `GeneralListsSection.tsx` with appropriate customizations for the data type.
