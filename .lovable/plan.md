
# Comprehensive Database Schema Plan

## Overview

This plan creates an enterprise-grade database schema for the financial advisor CRM system, connecting all front-end components that currently use mock data to a properly normalized, indexed, and secured database structure.

## Current State Analysis

**Existing Tables:**
- `profiles` - User profile data
- `clients` - Comprehensive client information (already well-designed)

**Front-end Components Using Mock Data:**
1. Tasks page (`src/pages/Tasks.tsx`) - Task management
2. Email page (`src/pages/Email.tsx`) - Email inbox
3. Documents tab (`ClientDocumentsTab.tsx`) - Document storage
4. Products tab (`ClientProductsTab.tsx`) - Financial products
5. Notes tab (`ClientNotesTab.tsx`) - Client notes/interactions
6. Communication tab (`ClientCommunicationTab.tsx`) - Communication history
7. Compliance tab (`ClientComplianceTab.tsx`) - FAIS control & workflows
8. Workflows tab (`ClientWorkflowsTab.tsx`) - Client workflows
9. Family tab (`ClientFamilyTab.tsx`) - Family relationships
10. Businesses tab (`ClientBusinessesTab.tsx`) - Business relationships
11. Contacts tab (`ClientContactsTab.tsx`) - Professional contacts
12. Command Center nudges - Commission tracking, CPD compliance, portfolios

---

## Database Design Principles Applied

| Principle | Implementation |
|-----------|----------------|
| **3NF Normalization** | Separate tables for products, providers, portfolios with junction tables |
| **UUID Primary Keys** | All tables use `gen_random_uuid()` for distributed scalability |
| **Audit Trail** | `created_at`, `updated_at`, `created_by`, `updated_by` on all tables |
| **Soft Deletes** | `is_deleted` flag and `deleted_at` timestamp |
| **Enum Types** | Database enums for status fields ensuring data consistency |
| **Strategic Indexing** | Foreign keys, frequently queried fields, composite indexes |
| **RLS Security** | Row-level security scoped to authenticated advisor's `user_id` |

---

## New Tables to Create

### 1. Reference Tables (Lookup Data)

**`product_providers`** - Insurance/investment providers
```text
Fields: id, name, code, provider_type, is_active, contact_email, contact_phone
```

**`product_categories`** - Product type classifications
```text
Fields: id, name, code, description, is_active
```

**`document_types`** - Document classification
```text
Fields: id, name, code, category (FICA/Client/Product), retention_days, is_active
```

### 2. Core Business Tables

**`products`** - Financial products catalog
```text
Fields: id, provider_id (FK), category_id (FK), product_code, name, description,
        premium_type, frequency_options, min_premium, max_premium, is_active,
        created_at, updated_at, created_by, is_deleted, deleted_at
```

**`client_products`** - Products linked to clients
```text
Fields: id, client_id (FK), product_id (FK), policy_number, role (Owner/Beneficiary),
        premium_amount, frequency, current_value, value_updated_at, status,
        start_date, end_date, adviser_id (FK), is_linked, notes,
        created_at, updated_at, created_by, updated_by, is_deleted, deleted_at
```

**`portfolios`** - Client investment portfolios
```text
Fields: id, client_id (FK), name, portfolio_type, target_risk_score, current_risk_score,
        total_value, last_valuation_date, benchmark, status,
        created_at, updated_at, created_by, is_deleted, deleted_at
```

**`portfolio_holdings`** - Individual holdings within portfolios
```text
Fields: id, portfolio_id (FK), product_id (FK), fund_name, units, unit_price,
        current_value, percentage_allocation, performance_12m, fee_percentage,
        created_at, updated_at
```

### 3. Task Management

**`tasks`** - Task management system
```text
Fields: id, user_id, client_id (FK nullable), title, description, task_type,
        priority, status, due_date, assigned_to_user_id, created_by,
        notes (JSONB array), is_practice_task,
        created_at, updated_at, completed_at, is_deleted, deleted_at
```

### 4. Document Management

**`documents`** - Document storage metadata (URLs only, no binary)
```text
Fields: id, user_id, client_id (FK nullable), product_id (FK nullable),
        document_type_id (FK), name, file_path (storage URL), file_size, mime_type,
        version, status, workflow_id (FK nullable), expiry_date,
        uploaded_by, approved_by, approval_date,
        created_at, updated_at, is_deleted, deleted_at
```

### 5. Communication & Notes

**`client_notes`** - Interaction notes/journal
```text
Fields: id, user_id, client_id (FK), interaction_type, subject, content,
        priority, is_complete, completed_at, responsible_user_id, owner_user_id,
        is_visible_portal, attachment_count,
        created_at, updated_at, is_deleted, deleted_at
```

**`emails`** - Email tracking
```text
Fields: id, user_id, client_id (FK nullable), folder, direction,
        from_address, to_addresses (JSONB), cc_addresses (JSONB),
        subject, body_preview, body_html, has_attachments,
        sent_at, received_at, is_read, status,
        external_id (for email provider sync),
        created_at, updated_at, is_deleted, deleted_at
```

**`communications`** - Unified communication log
```text
Fields: id, user_id, client_id (FK), channel, direction,
        from_identifier, to_identifier, subject, content,
        sent_at, status,
        created_at, is_deleted, deleted_at
```

### 6. Commission Tracking

**`commissions`** - Commission payments tracking
```text
Fields: id, user_id, client_product_id (FK), provider_id (FK),
        policy_reference, expected_amount, received_amount, variance_percentage,
        status, payment_date, period_start, period_end,
        discrepancy_notes, reconciled_at, reconciled_by,
        created_at, updated_at, is_deleted, deleted_at
```

### 7. Compliance & CPD

**`cpd_cycles`** - CPD compliance tracking cycles
```text
Fields: id, user_id, cycle_start, cycle_end, total_hours_required,
        ethics_required, regulatory_required, professional_required, product_required,
        status,
        created_at, updated_at
```

**`cpd_records`** - Individual CPD records
```text
Fields: id, user_id, cpd_cycle_id (FK), category, hours, course_name,
        provider, certificate_url, completion_date, verified,
        created_at, updated_at
```

**`fais_controls`** - FAIS compliance tracking
```text
Fields: id, user_id, client_id (FK), name, products (JSONB array),
        current_step, date, status,
        created_at, updated_at, is_deleted, deleted_at
```

### 8. Workflows

**`workflow_templates`** - Reusable workflow definitions
```text
Fields: id, user_id, name, service_area, description, steps (JSONB),
        is_active, created_at, updated_at
```

**`workflows`** - Active workflow instances
```text
Fields: id, user_id, client_id (FK nullable), template_id (FK nullable),
        name, service_area, current_step, status, adviser_id,
        start_date, end_date,
        created_at, updated_at, is_deleted, deleted_at
```

**`advice_workflows`** - Financial advice workflows
```text
Fields: id, user_id, client_id (FK), name, current_step, status,
        adviser_id, date,
        created_at, updated_at, is_deleted, deleted_at
```

### 9. Relationships

**`client_relationships`** - Family members and connected parties
```text
Fields: id, user_id, client_id (FK), related_client_id (FK nullable),
        name, entity_type, identification, id_type, product_viewing_level,
        relationship_type, family_name, share_percentage,
        created_at, updated_at, is_deleted, deleted_at
```

**`client_contacts`** - Professional contacts (attorneys, accountants)
```text
Fields: id, user_id, client_id (FK), name, job_title, company,
        email, phone, notes,
        created_at, updated_at, is_deleted, deleted_at
```

---

## Database Enums

```text
task_type: Client Complaint, Follow-up, Annual Review, Portfolio Review,
           Compliance, Onboarding, Document Request

task_status: Not Started, In Progress, Pending Client, Completed, Cancelled

task_priority: Low, Medium, High, Urgent

document_status: Pending, Complete, Cancelled, Expired

email_folder: Task Pool, Inbox, Draft, Sent, Queue, Failed, Archived

communication_channel: Email, SMS, Phone, WhatsApp, Push, Webinar, Office Event

commission_status: Matched, Pending, Disputed, Excessive, Reconciled

workflow_status: Active, Complete, Inactive, Cancelled

cpd_category: Ethics, Regulatory, Professional, Product Knowledge

relationship_type: Spouse, Child, Parent, Sibling, Business Partner, Trustee

entity_type: Individual, Trust, Company, Close Corporation
```

---

## Indexing Strategy

**Foreign Key Indexes:**
- All `_id` columns referencing other tables
- `user_id` on every table for RLS performance

**Query Optimization Indexes:**
- `client_id` + `status` composite on products, documents, tasks
- `due_date` on tasks for date range queries
- `expiry_date` on documents for compliance monitoring
- `payment_date` on commissions for period queries
- `surname`, `email` on clients for search

**Partial Indexes:**
- Non-deleted records: `WHERE is_deleted = false`
- Active records: `WHERE status = 'Active'`

---

## Row-Level Security

All tables will have RLS policies ensuring:
- Users can only SELECT/INSERT/UPDATE/DELETE their own records
- Scoped via `auth.uid() = user_id`
- No cross-user data leakage

---

## Migration Execution Order

Due to foreign key dependencies:

1. **Enum types** (no dependencies)
2. **Reference tables** (providers, categories, document types)
3. **Products table** (depends on reference tables)
4. **Client-related tables** (products, portfolios, documents, notes)
5. **Task and workflow tables**
6. **Commission and compliance tables**
7. **Relationship tables**
8. **Indexes and triggers**

---

## Front-end Integration Points

After schema creation, these files need database connection:

| Component | Table(s) |
|-----------|----------|
| `Tasks.tsx` | `tasks` |
| `Email.tsx` | `emails` |
| `ClientDocumentsTab.tsx` | `documents`, `document_types` |
| `ClientProductsTab.tsx` | `client_products`, `products`, `providers` |
| `ClientNotesTab.tsx` | `client_notes` |
| `ClientCommunicationTab.tsx` | `communications` |
| `ClientComplianceTab.tsx` | `fais_controls`, `workflows` |
| `ClientWorkflowsTab.tsx` | `workflows`, `advice_workflows` |
| `ClientFamilyTab.tsx` | `client_relationships` (type=family) |
| `ClientBusinessesTab.tsx` | `client_relationships` (type=business) |
| `ClientContactsTab.tsx` | `client_contacts` |
| `CommissionNudge.tsx` | `commissions` |
| `ComplianceNudge.tsx` | `cpd_cycles`, `cpd_records` |
| `PortfolioDriftNudge.tsx` | `portfolios`, `portfolio_holdings` |
| `DocumentExpiryNudge.tsx` | `documents` |

---

## Technical Details

### Storage Considerations
- Document files stored in Lovable Cloud Storage (blob), only URLs in database
- No binary data or base64 in database columns
- JSONB for flexible data (addresses, email recipients, workflow steps)

### Performance Optimizations
- Partial indexes on `is_deleted = false` for all soft-delete tables
- Composite indexes for common query patterns
- Connection pooling handled by Lovable Cloud

### Data Integrity
- Foreign key constraints with appropriate CASCADE/RESTRICT rules
- Check constraints on enum-like text columns via DB enums
- Trigger-based `updated_at` timestamp management

---

## Implementation Summary

**Total New Tables:** 20
**Total New Enums:** 8
**Estimated Migration Size:** ~400-500 lines of SQL

This schema provides a solid foundation for the financial advisor CRM, with proper normalization, security, and scalability for thousands of clients and their associated data.
