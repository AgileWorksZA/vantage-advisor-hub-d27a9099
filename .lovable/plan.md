
# Administrative Module Implementation Plan

## Overview

This plan creates a comprehensive Administrative module accessible from the Practice Settings page. The module serves as a centralized configuration hub for managing lookup data, integrations, and system settings that power the platform's dropdowns and selections.

## Module Structure

The Administrative module will be organized into 11 main sections based on the requirements:

| Section | Sub-sections | Purpose |
|---------|--------------|---------|
| **General Lists** | Advisor codes, Banks, Currencies, Campaigns, Corporate, CRM Details, iBase, Locations, Service, Sanction Lists, Alternate Providers, Sub agents, Portfolio Categories, New Acquisition, Sources, Source of Wealth, Source of Funds | Manage reference data used in dropdowns |
| **Data Integrations** | Activity, Queue, Alerts, Imports, Checks, Provider notifications, Provider contacts, Log backups, Astute, FICA | Data import/export configuration |
| **Planning Tool Configuration** | Bucket settings, Goal categories, Risk profiles | Financial planning parameters |
| **Campaign Management** | Campaign templates, Automation rules | Marketing campaign configuration |
| **Communication** | Email settings, WhatsApp, SMS, Push notifications | Communication channel configuration |
| **Documents** | Document types, Templates, Signatures, Public upload settings | Document management configuration |
| **Products** | Products list, Product classification, Product benefits (mapped/unmapped), Providers | Product catalog management |
| **Funds & Instruments** | Instruments, Exchanges, Sectors, Industries, Unlisted | Fund/instrument reference data |
| **Transactions** | Transaction types, Processing rules | Transaction configuration |
| **Notes & Task Configuration** | Note subjects, Task types, Priorities | Note/Task configuration |
| **Events** | Events list, Notifications, Triggers | Event-driven automation rules |
| **System Settings** | General settings, Audit, Permissions | Platform-wide settings |

---

## Database Schema Design

### New Administrative Lookup Tables

Each lookup table follows the enterprise architecture standards with UUID PKs, soft deletes, and RLS.

#### 1. `admin_general_lists` (Master table for simple lookups)

```sql
CREATE TABLE admin_general_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  list_type TEXT NOT NULL, -- 'banks', 'currencies', 'locations', etc.
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  name_secondary TEXT, -- e.g., Afrikaans name
  description TEXT,
  metadata JSONB DEFAULT '{}',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  UNIQUE(user_id, list_type, code)
);
```

**Supported list_types:**
- `advisor_codes`, `banks`, `currencies`, `campaigns`, `corporate_types`, `crm_details`, `locations`, `service_types`, `sanction_list_sources`, `portfolio_categories`, `acquisition_sources`, `wealth_sources`, `fund_sources`, `industries`, `sectors`, `exchanges`

#### 2. `admin_data_imports` (Import job tracking)

```sql
CREATE TABLE admin_data_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  import_type TEXT NOT NULL, -- 'bookreport', 'commission', 'crs', etc.
  import_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending', -- 'Pending', 'In Progress', 'Paused', 'Completed', 'Failed', 'Cancelled'
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  duration_seconds INTEGER,
  total_lines INTEGER DEFAULT 0,
  processed_items INTEGER DEFAULT 0,
  total_items INTEGER DEFAULT 0,
  progress_percentage NUMERIC DEFAULT 0,
  remaining_time_seconds INTEGER,
  changed_by TEXT,
  error_message TEXT,
  source_reference TEXT, -- e.g., provider name
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ
);
```

#### 3. `admin_document_templates` (Document template configuration)

```sql
CREATE TABLE admin_document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  name_secondary TEXT, -- Afrikaans name
  category TEXT NOT NULL,
  has_content BOOLEAN DEFAULT false,
  can_public_upload BOOLEAN DEFAULT false,
  requires_workflow_signature BOOLEAN DEFAULT false,
  content_template TEXT, -- HTML template
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  UNIQUE(user_id, code)
);
```

#### 4. `admin_product_benefits` (Product benefit mappings)

```sql
CREATE TABLE admin_product_benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  field_mapping TEXT, -- Maps to specific product field
  is_mapped BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ
);
```

#### 5. `admin_funds` (Fund/instrument management)

```sql
CREATE TABLE admin_funds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  code TEXT,
  isin TEXT,
  fund_manager TEXT,
  fund_fact_sheet_url TEXT,
  source TEXT, -- 'Bookreport', 'myPractice', 'Transactions', etc.
  asset_classes INTEGER DEFAULT 0,
  is_allocation_approved BOOLEAN DEFAULT false,
  cat1_status TEXT, -- 'Core', 'Non-Core'
  cat2_status TEXT,
  domicile TEXT,
  fund_type TEXT,
  location TEXT,
  industry TEXT,
  sector TEXT,
  exchange TEXT,
  morningstar_id TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ
);
```

#### 6. `admin_note_subjects` (Note subject configuration)

```sql
CREATE TABLE admin_note_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  item_count INTEGER DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ
);
```

#### 7. `admin_events` (Event-driven automation)

```sql
CREATE TABLE admin_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  module TEXT NOT NULL, -- 'Documents', 'Compliance', 'Notes', etc.
  trigger_type TEXT NOT NULL, -- 'Outstanding', 'Import failure', 'Risk Rating Changed', etc.
  trigger_conditions JSONB DEFAULT '{}', -- Condition configuration
  actions JSONB DEFAULT '[]', -- Actions to take (e.g., send email)
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ
);
```

#### 8. `admin_communication_settings` (Channel configuration)

```sql
CREATE TABLE admin_communication_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  channel TEXT NOT NULL, -- 'email', 'sms', 'whatsapp', 'push'
  provider TEXT, -- Integration provider name
  settings JSONB NOT NULL DEFAULT '{}', -- Provider-specific settings
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### 9. `admin_system_settings` (Platform settings)

```sql
CREATE TABLE admin_system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  setting_key TEXT NOT NULL,
  setting_value JSONB NOT NULL,
  category TEXT NOT NULL, -- 'general', 'security', 'display', etc.
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, setting_key)
);
```

---

## UI Implementation

### File Structure

```text
src/
├── pages/
│   └── Administration.tsx          # Main admin page with section navigation
├── components/
│   └── administration/
│       ├── AdminLayout.tsx         # Shared layout with sidebar navigation
│       ├── AdminSectionHeader.tsx  # Reusable section header with search/add
│       ├── AdminDataTable.tsx      # Generic CRUD data table component
│       ├── general-lists/
│       │   ├── GeneralListsSection.tsx
│       │   ├── BanksTab.tsx
│       │   ├── CurrenciesTab.tsx
│       │   ├── SanctionListsTab.tsx
│       │   └── ... (other list tabs)
│       ├── data-integrations/
│       │   ├── DataIntegrationsSection.tsx
│       │   ├── ActivityTab.tsx
│       │   ├── ImportsTab.tsx
│       │   └── ... (other integration tabs)
│       ├── documents/
│       │   └── DocumentsSection.tsx
│       ├── products/
│       │   ├── ProductsSection.tsx
│       │   ├── ProductBenefitsTab.tsx
│       │   └── ProductClassificationTab.tsx
│       ├── funds/
│       │   └── FundsSection.tsx
│       ├── notes-tasks/
│       │   └── NotesTasksSection.tsx
│       ├── events/
│       │   └── EventsSection.tsx
│       └── system/
│           └── SystemSettingsSection.tsx
└── hooks/
    └── useAdminData.ts             # Generic hook for admin CRUD operations
```

### Navigation Design

**Button Placement**: Next to "Add Team Member" button on Practice page

```typescript
// In Practice.tsx PersonnelList component
<div className="flex gap-2">
  <Button className="bg-[hsl(180,70%,45%)]">
    <Plus className="w-4 h-4 mr-2" />
    Add Team Member
  </Button>
  <Button 
    variant="outline"
    onClick={() => navigate("/administration")}
  >
    <Settings className="w-4 h-4 mr-2" />
    Administration
  </Button>
</div>
```

### Main Administration Page Layout

Following the pattern from the screenshots with a left sidebar and content area:

```text
+---------------------------+----------------------------------------+
| Administration            |  [Section Title]                       |
+---------------------------+----------------------------------------+
| General Lists        >    |  [Tab navigation if applicable]        |
| Data Integrations    >    |                                        |
| Planning Tools       >    |  [Search] [+ Add new] [Reset] [⚙]    |
| Campaign Management  >    |                                        |
| Communication        >    |  +------------------------------------+ |
| Documents            >    |  | # | Name ↑ | Status | Actions     | |
| Products             >    |  +------------------------------------+ |
| Funds & Instruments  >    |  | 1 | Item 1  | Active | ✏️ ❌       | |
| Transactions         >    |  | 2 | Item 2  | Active | ✏️ ❌       | |
| Notes & Tasks        >    |  | ...                                | |
| Events               >    |  +------------------------------------+ |
| System Settings      >    |                                        |
+---------------------------+----------------------------------------+
```

### Generic Admin Data Table Component

```typescript
interface AdminDataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  onAdd: () => void;
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
  searchPlaceholder?: string;
  showPagination?: boolean;
  itemsPerPage?: number;
}
```

Features:
- Search/filter functionality
- Pagination with item count
- Inline edit and delete actions
- Add new button
- Column sorting
- Settings gear icon for column visibility

---

## Route Configuration

Add new route in App.tsx:

```typescript
<Route path="/administration" element={<Administration />} />
<Route path="/administration/:section" element={<Administration />} />
<Route path="/administration/:section/:tab" element={<Administration />} />
```

---

## Implementation Phases

### Phase 1: Foundation (Core infrastructure)
1. Create database migration for all new tables
2. Create `Administration.tsx` page with sidebar navigation
3. Create `AdminLayout.tsx` shared layout component
4. Create `AdminDataTable.tsx` generic table component
5. Create `useAdminData.ts` hook for CRUD operations
6. Add "Administration" button to Practice page

### Phase 2: General Lists
1. Implement GeneralListsSection with sub-navigation
2. Create tabs for each list type (Banks, Currencies, etc.)
3. Implement Sanction Lists with multiple source tabs (Blacklisted, BoE, EU, PIP, SDN, TFS, UN1267 AQ)

### Phase 3: Data Integrations
1. Implement import activity tracking
2. Create queue management view
3. Add import log visualization with progress bars

### Phase 4: Products & Funds
1. Enhance existing products table UI
2. Add product benefits mapping (using existing product_categories)
3. Implement funds management with fact sheet links

### Phase 5: Documents & Events
1. Enhance document_types management
2. Implement event configuration with trigger/action setup

### Phase 6: Communication & System Settings
1. Add communication channel configuration
2. Implement system settings management

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| Database migration | **Create** | All new admin tables with RLS policies |
| `src/pages/Administration.tsx` | **Create** | Main administration page |
| `src/components/administration/AdminLayout.tsx` | **Create** | Shared layout with navigation |
| `src/components/administration/AdminSectionHeader.tsx` | **Create** | Reusable header component |
| `src/components/administration/AdminDataTable.tsx` | **Create** | Generic CRUD table |
| `src/components/administration/general-lists/GeneralListsSection.tsx` | **Create** | General lists container |
| `src/components/administration/data-integrations/DataIntegrationsSection.tsx` | **Create** | Data imports container |
| `src/components/administration/products/ProductsSection.tsx` | **Create** | Products management |
| `src/components/administration/funds/FundsSection.tsx` | **Create** | Funds management |
| `src/components/administration/documents/DocumentsSection.tsx` | **Create** | Document config |
| `src/components/administration/notes-tasks/NotesTasksSection.tsx` | **Create** | Notes/tasks config |
| `src/components/administration/events/EventsSection.tsx` | **Create** | Events automation |
| `src/components/administration/system/SystemSettingsSection.tsx` | **Create** | System settings |
| `src/hooks/useAdminData.ts` | **Create** | Generic admin CRUD hook |
| `src/pages/Practice.tsx` | **Modify** | Add Administration button |
| `src/App.tsx` | **Modify** | Add /administration routes |

---

## Database Design Rationale

1. **Single `admin_general_lists` table**: Rather than creating dozens of small lookup tables, a single table with `list_type` column provides flexibility to add new list types without schema changes.

2. **JSONB for extensibility**: Using `metadata` and `settings` JSONB columns allows storing type-specific data without schema modifications.

3. **Consistent audit fields**: All tables include `created_at`, `updated_at`, `is_deleted`, `deleted_at` following enterprise standards.

4. **User-scoped data**: Each table is scoped by `user_id` with RLS policies, allowing multi-tenant isolation.

5. **Existing table reuse**: Leverages existing `product_categories`, `product_providers`, `document_types`, and `products` tables where appropriate.

---

## Sample UI Components

### AdminSectionHeader
```typescript
<AdminSectionHeader
  title="Sanction Lists"
  itemCount={245}
  onAdd={() => setShowAddDialog(true)}
  onReset={() => refetch()}
  searchValue={search}
  onSearchChange={setSearch}
  pagination={{
    currentPage: 1,
    totalPages: 13,
    onPageChange: setPage
  }}
/>
```

### AdminDataTable
```typescript
<AdminDataTable
  data={banks}
  columns={[
    { header: "#", accessor: "index" },
    { header: "Name", accessor: "name", sortable: true },
    { header: "Code", accessor: "code" },
    { header: "Status", accessor: "is_active", render: StatusBadge }
  ]}
  onEdit={(bank) => openEditDialog(bank)}
  onDelete={(bank) => confirmDelete(bank)}
/>
```

---

## Expected Behavior

| User Action | Result |
|-------------|--------|
| Click "Administration" button on Practice | Navigate to /administration |
| Select "General Lists" | Show left sub-menu with Banks, Currencies, etc. |
| Click "Banks" | Display banks table with search, add, edit, delete |
| Click "+ Add new" | Open add dialog with form fields |
| Edit inline | Click pencil icon, inline edit mode |
| Delete item | Confirmation dialog, soft delete |
| Search | Real-time filter on visible data |
| Pagination | Navigate through large datasets |
