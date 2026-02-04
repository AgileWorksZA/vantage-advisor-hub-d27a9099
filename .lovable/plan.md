
# Combine Family, Businesses, and Contacts into Unified Relationships Tab

## Overview

This plan consolidates three separate tabs (Family, Businesses, Contacts) into a single **"Relationships"** tab with three distinct sections. The key enhancement is that Family members and Businesses will be stored as actual clients in the `clients` table, with linking via `client_relationships`. Professional Contacts will remain in the `client_contacts` table with an enhanced schema.

## Current State Analysis

**Existing Structure:**
- `ClientFamilyTab.tsx` - Uses `client_relationships` table with family types (Spouse, Child, Parent, Sibling)
- `ClientBusinessesTab.tsx` - Uses `client_relationships` table with business types (Business Partner, Trustee)
- `ClientContactsTab.tsx` - Uses `client_contacts` table for professional contacts

**Key Tables:**
- `clients` - Main client database
- `client_relationships` - Links clients to family/business relationships via `related_client_id`
- `client_contacts` - Stores professional contacts (not clients themselves)

## Proposed Architecture

### Data Model Changes

1. **Enhance `client_contacts` table** - Add `contact_type` column for professional relationship type
2. **Expand `relationship_type` enum** - Add more business relationship types

### Visual Layout

```text
RELATIONSHIPS TAB
+------------------------------------------------------------------+
| FAMILY MEMBERS                                     [+ Add Family] |
+------------------------------------------------------------------+
| Name | Relationship | ID Number | Contact | Product Viewing | ... |
| John Smith | Spouse | 8501...| 082... | Full View | [Edit][Del] |
+------------------------------------------------------------------+

+------------------------------------------------------------------+
| BUSINESSES                                        [+ Add Business]|
+------------------------------------------------------------------+
| Name | Link Type | Reg Number | Entity Type | Share % | ...      |
| Smith Trust | Beneficiary | IT2345... | Trust | 50% | [Edit][Del]|
+------------------------------------------------------------------+

+------------------------------------------------------------------+
| PROFESSIONAL CONTACTS                             [+ Add Contact] |
+------------------------------------------------------------------+
| Name | Link Type | Company | Email | Phone | [Edit][Del]         |
| Jane Doe | Attorney | ABC Law | j@abc... | 011... | [Edit][Del]   |
+------------------------------------------------------------------+
```

### Manage Related Entity Dropdown

The "Manage related entity" dropdown in the header will be populated with:
- All Family members and Businesses that have a `related_client_id`
- Clicking navigates to `/clients/{related_client_id}`

## Implementation Plan

### Phase 1: Database Migration

Add `contact_type` column to `client_contacts`:
```sql
ALTER TABLE client_contacts 
ADD COLUMN contact_type TEXT DEFAULT 'Other';
```

Add more relationship types for businesses:
```sql
ALTER TYPE relationship_type ADD VALUE 'Beneficiary';
ALTER TYPE relationship_type ADD VALUE 'Director';
ALTER TYPE relationship_type ADD VALUE 'Shareholder';
ALTER TYPE relationship_type ADD VALUE 'Member';
```

### Phase 2: Create New Component - ClientRelationshipsTab

**New File: `src/components/client-detail/ClientRelationshipsTab.tsx`**

A unified component with three collapsible sections:
1. **Family Members Section** - Add/Edit/Delete family relationships
2. **Businesses Section** - Add/Edit/Delete business relationships  
3. **Professional Contacts Section** - Add/Edit/Delete professional contacts

Each section includes:
- Header with count and Add button
- Data table with appropriate columns
- Edit/Delete actions

### Phase 3: Create Add Dialogs

**3.1 AddFamilyMemberDialog.tsx**

Two-step process:
1. Search existing clients OR create new client
2. Specify relationship details (relationship type dropdown)

Fields (similar to AddClientDialog):
- Title, First Name, Surname, Initials
- ID Number, Date of Birth, Gender
- Cell Number, Email
- **Relationship Type dropdown**: Spouse, Child, Parent, Sibling

When saving:
1. Creates new client in `clients` table (if not existing)
2. Creates `client_relationships` record with `related_client_id` pointing to new/existing client

**3.2 AddBusinessDialog.tsx**

Two-step process:
1. Search existing clients/entities OR create new business entity
2. Specify link details

Fields:
- Business Name (as `first_name` + `surname` = business name)
- Entity Type: Trust, Company, Close Corporation
- Registration Number (as `id_number`)
- **Link Type dropdown**: Beneficiary, Owner, Director, Shareholder, Trustee, Member
- Share Percentage

When saving:
1. Creates new client in `clients` table with `client_type = 'business'`
2. Creates `client_relationships` record linking to parent client

**3.3 AddContactDialog.tsx**

Based on the reference image provided:

Fields (matching the screenshot):
- Title (dropdown)
- Initials
- First Names
- Surname
- Preferred Name
- Job Title (dropdown)
- **Contact Type dropdown**: Accountant, Attorney, Auditor, Financial Adviser, Insurance Broker, Estate Agent, Other
- Work Number, Cell Number, Fax Number, Email
- OTP Contact (Yes/No)
- Residential Address section
- Postal Address section

Saves to `client_contacts` table only (contacts are NOT clients).

### Phase 4: Update ClientDetail.tsx

1. Remove separate tabs: "family", "businesses", "contacts"
2. Add single "relationships" tab
3. Import new `ClientRelationshipsTab` component
4. Wire up "Manage related entity" dropdown

### Phase 5: Update useClientRelationships Hook

Enhance to:
1. Return `related_client_id` data for navigation
2. Support new relationship types for businesses
3. Include method to fetch linked client details

### Phase 6: Enhance useClientContacts Hook

Add:
- `contact_type` field support
- Update CRUD operations for new field

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/components/client-detail/ClientRelationshipsTab.tsx` | **Create** | Unified relationships tab with 3 sections |
| `src/components/client-detail/AddFamilyMemberDialog.tsx` | **Create** | Dialog to add family member as client |
| `src/components/client-detail/AddBusinessDialog.tsx` | **Create** | Dialog to add business as client entity |
| `src/components/client-detail/AddContactDialog.tsx` | **Create** | Dialog to add professional contact (per reference image) |
| `src/pages/ClientDetail.tsx` | **Modify** | Replace 3 tabs with single Relationships tab, update dropdown |
| `src/hooks/useClientRelationships.ts` | **Modify** | Add related client data fetching, new types |
| `src/hooks/useClientContacts.ts` | **Modify** | Add contact_type field support |
| Database migration | **Create** | Add contact_type column, extend relationship_type enum |

## Relationship Types

### Family Relationship Types (existing)
- Spouse
- Child
- Parent
- Sibling

### Business Link Types (expanded)
- Beneficiary
- Owner
- Director
- Shareholder
- Trustee
- Member
- Business Partner

### Professional Contact Types (new)
- Accountant
- Attorney / Lawyer
- Auditor
- Financial Adviser
- Insurance Broker
- Estate Agent
- Doctor
- Tax Consultant
- Other

## "Manage Related Entity" Dropdown Logic

```typescript
// Fetch all relationships with related_client_id
const relatedEntities = relationships.filter(r => r.related_client_id);

// Map to dropdown items
const dropdownItems = relatedEntities.map(r => ({
  label: r.name,
  type: r.relationship_type,
  clientId: r.related_client_id,
  onClick: () => navigate(`/clients/${r.related_client_id}`)
}));
```

## UI Component Details

### Section Headers
Each section uses consistent styling:
```text
┌──────────────────────────────────────────────────────────┐
│ [Chevron] FAMILY MEMBERS (3)              [+ Add Family] │
├──────────────────────────────────────────────────────────┤
│ (Collapsible table content)                              │
└──────────────────────────────────────────────────────────┘
```

### Add Dialog Forms

Following the pattern of existing `AddClientDialog.tsx`:
- Multi-tab dialog with form validation using react-hook-form + zod
- Consistent styling with existing UI components
- Toast notifications for success/error states

## Technical Notes

1. **Client as Related Entity**: When adding Family/Business, they become full clients in the database, allowing them to have their own products, documents, workflows, etc.

2. **Soft Delete**: All delete operations use `is_deleted` flag pattern (existing architecture)

3. **RLS Policies**: New records inherit existing RLS (user_id scoped access)

4. **Navigation**: "Manage related entity" dropdown provides quick access to related client profiles

5. **Bidirectional Linking**: Consider adding reciprocal relationship record (e.g., if A is Parent of B, B is Child of A) - optional enhancement

