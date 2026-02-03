

# 6-Step Financial Planning Workflow Implementation Plan

## Overview

This plan outlines the implementation of a comprehensive 6-step financial planning workflow that launches when clicking "Add new product" on the Client Products tab. The workflow follows South African financial planning legislation and includes a modular database schema for balance sheet/income statement functionality that can be reused across the client portal.

---

## Phase 1: Database Schema Design

### New Tables Required

The following normalized tables will be created with proper RLS policies and audit fields following the existing architecture patterns:

#### 1. Financial Planning Workflow Tables

**`financial_planning_workflows`** - Master workflow record
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Unique identifier |
| user_id | uuid (NOT NULL) | Owner for RLS |
| client_id | uuid (FK) | Link to clients table |
| workflow_name | text | Custom name for the workflow |
| current_step | integer | Current step (1-6) |
| status | workflow_status | Active/Complete/Inactive/Cancelled |
| adviser_id | uuid | Assigned adviser |
| started_at | timestamptz | When workflow began |
| completed_at | timestamptz | When completed |
| step_data | jsonb | Stores completion status per step |
| last_auto_save | timestamptz | Last auto-save timestamp |
| created_at, updated_at, is_deleted, deleted_at | Standard audit fields |

**`fp_workflow_documents`** - Document pack tracking
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Unique identifier |
| workflow_id | uuid (FK) | Link to workflow |
| document_type | text | Document category/type |
| document_name | text | Display name |
| is_selected | boolean | Selected for pack |
| display_order | integer | Custom ordering |
| delivery_status | text | Pending/Sent/Delivered/Opened/Signed |
| sent_at, delivered_at, signed_at | timestamptz | Tracking dates |

#### 2. Balance Sheet Module (Reusable for Client Portal)

**`client_assets`** - Assets register
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Unique identifier |
| user_id | uuid (NOT NULL) | Owner for RLS |
| client_id | uuid (FK) | Link to clients table |
| asset_type | text | Property/Vehicle/Savings/Investment/Other |
| name | text | Asset description |
| current_value | numeric | Current market value |
| purchase_value | numeric | Original purchase price |
| purchase_date | date | When acquired |
| growth_rate | numeric | Expected annual growth % |
| linked_income_id | uuid (FK) | Link to income source |
| linked_liability_id | uuid (FK) | Link to associated liability |
| notes | text | Additional information |
| is_portal_visible | boolean | Show on client portal |
| created_at, updated_at, is_deleted | Standard audit fields |

**`client_liabilities`** - Liabilities register
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Unique identifier |
| user_id | uuid (NOT NULL) | Owner for RLS |
| client_id | uuid (FK) | Link to clients table |
| liability_type | text | Bond/Loan/Credit Card/Overdraft/Other |
| name | text | Liability description |
| original_amount | numeric | Initial loan amount |
| current_balance | numeric | Outstanding balance |
| interest_rate | numeric | Annual interest rate % |
| monthly_payment | numeric | Monthly repayment |
| term_months | integer | Loan term in months |
| start_date | date | Loan start date |
| end_date | date | Expected payoff date |
| linked_asset_id | uuid (FK) | Link to secured asset |
| creditor_name | text | Lender/creditor |
| is_portal_visible | boolean | Show on client portal |
| created_at, updated_at, is_deleted | Standard audit fields |

**`client_income`** - Income sources
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Unique identifier |
| user_id | uuid (NOT NULL) | Owner for RLS |
| client_id | uuid (FK) | Link to clients table |
| income_type | text | Salary/Rental/Investment/Pension/Business/Other |
| source_name | text | Income source description |
| gross_amount | numeric | Gross monthly amount |
| net_amount | numeric | Net after deductions |
| frequency | text | Monthly/Weekly/Annual |
| is_taxable | boolean | Subject to income tax |
| linked_asset_id | uuid (FK) | Link to income-generating asset |
| start_date | date | When income started |
| end_date | date | When income ends (if known) |
| is_portal_visible | boolean | Show on client portal |
| created_at, updated_at, is_deleted | Standard audit fields |

**`client_expenses`** - Expenses tracking
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Unique identifier |
| user_id | uuid (NOT NULL) | Owner for RLS |
| client_id | uuid (FK) | Link to clients table |
| expense_category | text | Housing/Transport/Insurance/Food/Entertainment/Other |
| expense_type | text | Fixed/Variable |
| name | text | Expense description |
| amount | numeric | Monthly amount |
| frequency | text | Monthly/Weekly/Annual |
| linked_liability_id | uuid (FK) | Link to liability (e.g., bond payment) |
| is_essential | boolean | Essential vs discretionary |
| is_portal_visible | boolean | Show on client portal |
| created_at, updated_at, is_deleted | Standard audit fields |

#### 3. Goals & Planning Tables

**`client_goals`** - Financial goals
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Unique identifier |
| user_id | uuid (NOT NULL) | Owner for RLS |
| client_id | uuid (FK) | Link to clients table |
| workflow_id | uuid (FK) | Link to planning workflow |
| goal_name | text | Goal title |
| description | text | Detailed description |
| goal_category | text | Retirement/Education/Wealth/Protection/Estate/Other |
| priority | text | Critical/Important/Aspirational |
| target_amount | numeric | Financial target |
| target_date | date | Target achievement date |
| current_funding | numeric | Current amount allocated |
| funding_status | text | On Track/Behind/Ahead |
| is_active | boolean | Currently active goal |
| created_at, updated_at, is_deleted | Standard audit fields |

**`goal_product_links`** - Links goals to products
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Unique identifier |
| goal_id | uuid (FK) | Link to goal |
| client_product_id | uuid (FK) | Link to client product |
| allocation_percentage | numeric | % of product allocated |
| link_type | text | Existing/Proposed |

**`bucket_allocations`** - Three-bucket strategy
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Unique identifier |
| workflow_id | uuid (FK) | Link to workflow |
| bucket_type | text | Income/Preservation/Wealth |
| recommended_amount | numeric | Calculated recommendation |
| current_allocation | numeric | Current amount |
| proposed_allocation | numeric | Proposed changes |
| notes | text | Strategy notes |

**`product_implementations`** - Step 5 tracking
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Unique identifier |
| workflow_id | uuid (FK) | Link to workflow |
| client_product_id | uuid (FK) | Link to product |
| implementation_status | text | Pending/In Progress/Submitted/Approved/Rejected |
| implementation_type | text | STP/Manual |
| submitted_at | timestamptz | When submitted |
| approved_at | timestamptz | When approved |
| outstanding_requirements | jsonb | Required actions list |

**`sla_commitments`** - Step 6 SLA management
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Unique identifier |
| workflow_id | uuid (FK) | Link to workflow |
| annual_meetings_target | integer | Meetings per year |
| annual_meetings_completed | integer | Completed count |
| portfolio_review_frequency | text | Monthly/Quarterly/Annual |
| next_review_date | date | Scheduled review |
| last_contact_date | date | Last client contact |
| communication_preference | text | Email/Call/In-person |
| reports_to_provide | jsonb | Checklist of reports |

---

## Phase 2: Component Architecture

### Main Workflow Container

```text
src/
  components/
    financial-planning-workflow/
      FinancialPlanningWizard.tsx      -- Main wizard container with dialog
      WorkflowProgressIndicator.tsx    -- Step indicator with navigation
      WorkflowNavigation.tsx           -- Prev/Next/Save buttons
      
      steps/
        Step1ClientIntroduction.tsx    -- Welcome pack & client details
        Step2GatherInformation.tsx     -- Products, assets, goals
        Step3AnalysePosition.tsx       -- FNA & bucket allocation
        Step4PresentRecommendation.tsx -- Document pack customizer
        Step5ImplementAgreements.tsx   -- Product implementation
        Step6CompleteReview.tsx        -- SLA management
      
      components/
        WelcomePackGenerator.tsx       -- Document generator
        AssetsLiabilitiesManager.tsx   -- Balance sheet component
        IncomeExpensesManager.tsx      -- Income statement component
        GoalsManager.tsx               -- Goals CRUD with timeline
        BucketAllocationChart.tsx      -- Three-bucket visualizer
        DocumentPackCustomizer.tsx     -- Drag-drop document ordering
        ProductImplementationTable.tsx -- Implementation tracking
        SLADashboard.tsx               -- Service commitments
        CashflowProjection.tsx         -- Interactive cashflow chart
      
  hooks/
    useFinancialPlanningWorkflow.ts    -- Main workflow state/CRUD
    useClientAssets.ts                 -- Assets CRUD hook
    useClientLiabilities.ts            -- Liabilities CRUD hook
    useClientIncome.ts                 -- Income CRUD hook
    useClientExpenses.ts               -- Expenses CRUD hook
    useClientGoals.ts                  -- Goals CRUD hook
    useBucketAllocations.ts            -- Bucket strategy hook
    useProductImplementation.ts        -- Implementation tracking
    useSLACommitments.ts               -- SLA management hook
    useWorkflowAutoSave.ts             -- Auto-save functionality
```

### UI Flow Diagram

```text
+-------------------------------------------------------------------+
|                    Financial Planning Wizard                        |
|  [1]-----[2]-----[3]-----[4]-----[5]-----[6]                       |
|  Intro  Gather  Analyse  Present  Implement  Review                |
+-------------------------------------------------------------------+
|                                                                     |
|  +-----------------------------------------------------------+     |
|  |                     Step Content Area                      |     |
|  |                                                            |     |
|  |  Collapsible sections with primary focus area             |     |
|  |                                                            |     |
|  +-----------------------------------------------------------+     |
|                                                                     |
|  [Previous]              Auto-saved 2 min ago         [Save & Exit] |
|                                                       [Next Step]   |
+-------------------------------------------------------------------+
```

---

## Phase 3: Step-by-Step Implementation Details

### Step 1: Client Introduction

**Layout:**
- Client Details Section (collapsible) - Read from existing `clients` table
- Family Members Section (collapsible) - Uses existing `client_relationships` table
- Welcome Pack Generator (primary focus) - New component

**Features:**
- Checklist of introduction documents with select all/deselect options
- Preview pane for welcome letter
- Generate PDF pack
- Send via Email/WhatsApp/Portal buttons
- Delivery status tracking

### Step 2: Gather Information & Goals

**Layout:**
- External Data Integration (collapsible) - Placeholder for future integrations
- Client Products (collapsible) - Uses existing `client_products` with quick add
- Assets & Liabilities (collapsible) - New `AssetsLiabilitiesManager` component
- Income & Expenses (collapsible) - New `IncomeExpensesManager` component
- Goals Management (primary focus) - Full CRUD with linking

**Features:**
- Asset-liability linking (e.g., property linked to bond)
- Income-asset linking (e.g., rental income from property)
- Net worth calculation display
- Cash flow summary
- Goal timeline visualization
- Link products to goals

### Step 3: Analyse Position

**Layout:**
- Financial Needs Analysis (primary focus) - FNA calculator interface
- Cashflow Projection (expandable) - Interactive chart
- Investment Bucket Allocation (primary focus) - Three-bucket strategy

**Features:**
- Auto-populate FNA from gathered data
- Risk profile assessment
- Insurance needs calculation
- Three-bucket visual interface:
  - Bucket 1: Income/Liquidity (1-3 years)
  - Bucket 2: Preservation (4-6 years)
  - Bucket 3: Wealth Creation (7+ years)
- Drag-and-drop product allocation
- Pie chart and bar graph visualizations

### Step 4: Present Recommendation

**Layout:**
- Document Pack Customizer (full screen focus)

**Features:**
- Hierarchical checklist matching SA regulatory requirements
- Categories: Introduction Pack, Additional Documents, Product Appendices
- Select all/deselect by category
- Document preview pane
- Drag-to-reorder functionality
- Template selection
- Branding options
- Delivery options (PDF download, email, WhatsApp, portal)
- Schedule delivery
- Track document opens

### Step 5: Implement Agreements

**Layout:**
- Product Implementation Table (primary focus)
- Implementation Progress indicator

**Features:**
- Multi-select products table with columns:
  - Checkbox, Product name, Provider, Type, Linked goals, Premium, Status, Actions
- Filter by: All/Selected/Pending/Completed
- Sort by any column
- "Straight Through Implementation" button
- Manual implementation option
- Track application status per product
- Upload signed documents
- Outstanding requirements checklist

### Step 6: Complete & Review

**Layout:**
- Document Signing Monitor (top section)
- SLA Management (bottom section)
- Completion Checklist

**Features:**
- Document signing status table
- E-signature integration status
- Reminder functionality for unsigned docs
- Annual service commitments configuration
- Monitoring dashboard:
  - Next review date
  - Days since last contact
  - Outstanding items counter
  - Compliance status
- Review calendar with reminders
- Mark workflow as complete
- Set next review date
- Archive option

---

## Phase 4: Integration Points

### 1. Add New Product Button
Modify `src/components/client-detail/ClientProductsTab.tsx`:
- Add state for wizard dialog
- Wire "Add new product" button to open wizard
- Pass clientId to wizard

### 2. Balance Sheet/Income Statement Views
Update existing placeholders in `ClientProductsTab.tsx`:
- Balance Sheet tab - Use `AssetsLiabilitiesManager` component
- Income Statement tab - Use `IncomeExpensesManager` component

### 3. Client Portal Readiness
All balance sheet and income components:
- Include `is_portal_visible` flags
- Design components to work standalone
- Use same hooks for data access

---

## Phase 5: Technical Requirements Implementation

### Auto-Save
- `useWorkflowAutoSave` hook with 2-minute interval
- Debounced save on form changes
- Visual indicator showing last save time
- Persist form state on navigation

### Progress Tracking
- Step completion stored in `step_data` jsonb column
- Visual indicators for complete vs pending steps
- Ability to jump to completed steps

### Responsive Design
- Grid layouts that collapse on tablet/mobile
- Collapsible sections for space efficiency
- Touch-friendly drag-and-drop

### Validation
- Required field validation per step
- Tooltips explaining regulatory requirements
- Warning indicators for incomplete items

### Export
- PDF export for workflow summary
- Integration points marked for CRM systems

---

## Phase 6: Implementation Sequence

### Batch 1: Database Schema (Migration)
1. Create all new tables with RLS policies
2. Create necessary enums
3. Add foreign key relationships

### Batch 2: Core Hooks
1. `useFinancialPlanningWorkflow` - Main workflow CRUD
2. `useClientAssets` - Assets management
3. `useClientLiabilities` - Liabilities management
4. `useClientIncome` - Income management
5. `useClientExpenses` - Expenses management
6. `useWorkflowAutoSave` - Auto-save functionality

### Batch 3: Base Components
1. `FinancialPlanningWizard` - Main container with dialog
2. `WorkflowProgressIndicator` - Step navigation
3. `WorkflowNavigation` - Action buttons

### Batch 4: Step 1 & 2 Components
1. `Step1ClientIntroduction` - Basic structure
2. `WelcomePackGenerator` - Document generation
3. `Step2GatherInformation` - Basic structure
4. `AssetsLiabilitiesManager` - Full CRUD with linking
5. `IncomeExpensesManager` - Full CRUD
6. `GoalsManager` - Goals with product linking

### Batch 5: Step 3 & 4 Components
1. `Step3AnalysePosition` - Basic structure
2. `BucketAllocationChart` - Three-bucket visualizer
3. `CashflowProjection` - Interactive chart
4. `Step4PresentRecommendation` - Basic structure
5. `DocumentPackCustomizer` - Drag-drop interface

### Batch 6: Step 5 & 6 Components
1. `Step5ImplementAgreements` - Basic structure
2. `ProductImplementationTable` - Implementation tracking
3. `Step6CompleteReview` - Basic structure
4. `SLADashboard` - Service commitments

### Batch 7: Integration & Polish
1. Wire up wizard to Products tab
2. Implement Balance Sheet view
3. Implement Income Statement view
4. Add PDF export functionality
5. Accessibility improvements

---

## Technical Notes

### Database Design Principles Applied
- UUID primary keys for scalability
- Soft deletes with `is_deleted` flag and `deleted_at` timestamp
- Audit fields: `created_at`, `updated_at`
- RLS policies scoped to `auth.uid() = user_id`
- Foreign keys for referential integrity
- JSONB for flexible data (step_data, requirements lists)

### Component Patterns
- Follow existing shadcn/ui component usage
- Use existing hooks pattern (useState, useCallback, supabase client)
- Toast notifications for success/error feedback
- Loading states with Loader2 spinner
- Consistent styling with existing teal accent color `hsl(180,70%,45%)`

### Accessibility
- WCAG 2.1 compliance
- Keyboard navigation for wizard steps
- ARIA labels for interactive elements
- Focus management on step changes
- Screen reader announcements for step transitions

---

## Files to Create/Modify Summary

### New Files (40+)
- 1 database migration file
- 10 custom hooks
- 6 step components
- 10+ shared components
- Component index files

### Modified Files
- `src/components/client-detail/ClientProductsTab.tsx` - Add wizard trigger

