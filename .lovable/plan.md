
# Required: ID Number as Required Field with Duplicate Detection

## Overview

This plan implements three key requirements:
1. **Make ID Number a required field** - All new clients must have an ID number
2. **Add duplicate detection** - When entering an ID that already exists, show a popup allowing the user to cancel or navigate to the existing client
3. **Assign random ID numbers to existing clients** - Update the ~137 clients currently without ID numbers

## Current State Analysis

**Database Status:**
- 210 total clients in the database
- 73 clients have ID numbers
- 137 clients are missing ID numbers
- 1 duplicate ID number exists (`7905245013085` appears twice)

**Files that create clients:**
1. `AddClientDialog.tsx` - Main client creation dialog
2. `AddFamilyMemberDialog.tsx` - Creates family member as client
3. `AddBusinessDialog.tsx` - Creates business entity as client

**Current schema:** `id_number` is nullable (`is_nullable: YES`)

## Implementation Plan

### Phase 1: Database Changes

**1.1 Assign Random ID Numbers to Existing Clients**

Create an edge function or use a migration to generate unique 13-digit South African ID numbers for clients without them:

```sql
-- Generate random SA-format ID numbers for existing clients without one
UPDATE clients
SET id_number = (
  -- Format: YYMMDD + 4 random digits + citizenship (0=SA) + checksum
  LPAD(FLOOR(RANDOM() * 99)::TEXT, 2, '0') ||
  LPAD(FLOOR(RANDOM() * 12 + 1)::TEXT, 2, '0') ||
  LPAD(FLOOR(RANDOM() * 28 + 1)::TEXT, 2, '0') ||
  LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0') ||
  '0' ||
  LPAD(FLOOR(RANDOM() * 10)::TEXT, 1, '0') ||
  LPAD(FLOOR(RANDOM() * 10)::TEXT, 1, '0')
)
WHERE id_number IS NULL OR id_number = '';
```

**1.2 Add Unique Constraint**

After all clients have ID numbers, add a unique constraint:

```sql
-- Add unique constraint on id_number (case-insensitive)
CREATE UNIQUE INDEX idx_clients_id_number_unique 
ON clients (LOWER(id_number)) 
WHERE id_number IS NOT NULL AND id_number != '';
```

### Phase 2: Create Duplicate Detection Dialog

**2.1 New Component: `DuplicateClientDialog.tsx`**

A dialog that appears when a duplicate ID number is detected, offering two options:
- **Cancel** - Close the dialog and return to editing the form
- **Go to Existing Client** - Navigate to the existing client's detail page

```typescript
// Props
interface DuplicateClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingClient: {
    id: string;
    name: string;
    idNumber: string;
  } | null;
  onCancel: () => void;
  onNavigate: () => void;
}
```

### Phase 3: Update AddClientDialog.tsx

**3.1 Make id_number required in schema**

```typescript
// Change from optional to required
id_number: z.string().min(1, "Identification number is required"),
```

**3.2 Add duplicate check before submission**

Before inserting the client, check if the ID number already exists:

```typescript
const checkDuplicateIdNumber = async (idNumber: string) => {
  const { data, error } = await supabase
    .from("clients")
    .select("id, first_name, surname, id_number")
    .eq("id_number", idNumber)
    .limit(1);
  
  if (data && data.length > 0) {
    return data[0]; // Return existing client
  }
  return null;
};
```

**3.3 Add state for duplicate dialog**

```typescript
const [duplicateClient, setDuplicateClient] = useState<{
  id: string;
  name: string;
  idNumber: string;
} | null>(null);
const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
```

**3.4 Update form label**

```typescript
<FormLabel>ID Number *</FormLabel>  // Add asterisk to indicate required
```

### Phase 4: Update AddFamilyMemberDialog.tsx

**4.1 Make id_number required**

```typescript
id_number: z.string().min(1, "Identification number is required"),
```

**4.2 Add duplicate detection**

Same pattern as AddClientDialog - check before insert, show dialog if duplicate found.

### Phase 5: Update AddBusinessDialog.tsx

**5.1 Make registration_number required for businesses**

For business entities, the registration number serves as the identifier:

```typescript
registration_number: z.string().min(1, "Registration number is required"),
```

**5.2 Add duplicate detection for registration numbers**

Check against `id_number` field in clients table (where registration numbers are stored for businesses).

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| Database migration | **Create** | Assign random IDs to existing clients, add unique constraint |
| `src/components/clients/DuplicateClientDialog.tsx` | **Create** | Dialog component for duplicate detection |
| `src/components/clients/AddClientDialog.tsx` | **Modify** | Make id_number required, add duplicate check |
| `src/components/client-detail/AddFamilyMemberDialog.tsx` | **Modify** | Make id_number required, add duplicate check |
| `src/components/client-detail/AddBusinessDialog.tsx` | **Modify** | Make registration_number required, add duplicate check |

## DuplicateClientDialog UI Design

```text
+--------------------------------------------------+
|  ⚠️ Duplicate Identification Number Found         |
+--------------------------------------------------+
|                                                  |
|  A client with this identification number        |
|  already exists in the system.                   |
|                                                  |
|  Existing Client: Van Niekerk, M (Marthinus)     |
|  ID Number: 6908155012081                        |
|                                                  |
+--------------------------------------------------+
|  [Cancel]           [Go to Existing Client]      |
+--------------------------------------------------+
```

## Flow Diagram

```text
User enters ID Number in Add Client form
                    ↓
            User clicks "Add Client"
                    ↓
         Check if ID exists in database
                    ↓
    ┌───────────────┴───────────────┐
    ↓                               ↓
No duplicate                   Duplicate found
    ↓                               ↓
Create new client          Show DuplicateClientDialog
    ↓                               ↓
Success toast              ┌───────┴───────┐
                           ↓               ↓
                        [Cancel]    [Go to Client]
                           ↓               ↓
                    Close dialog    Navigate to
                    User can edit   /clients/{id}
```

## Random ID Number Generation Format

South African ID numbers follow this format:
- Positions 1-6: Date of birth (YYMMDD)
- Positions 7-10: Gender and sequence (SSSS - 0000-4999 for female, 5000-9999 for male)
- Position 11: Citizenship (0 = SA citizen, 1 = permanent resident)
- Position 12: Usually 8 (historical)
- Position 13: Checksum digit

For random generation, we'll use a simplified format that looks realistic but uses random values to ensure uniqueness.

## Technical Notes

1. **Case-insensitive uniqueness**: The unique index uses `LOWER(id_number)` to prevent duplicates that differ only in case

2. **Empty string handling**: The constraint only applies to non-null, non-empty values to handle edge cases

3. **Existing duplicate cleanup**: The one existing duplicate (`7905245013085`) will need to be resolved before adding the unique constraint - one record will get a new random ID

4. **Business entities**: Registration numbers are stored in the `id_number` field for business clients, so the same constraint applies

5. **Navigation after detection**: When user clicks "Go to Existing Client", they navigate to `/clients/{existingClientId}` which loads the full client detail page
