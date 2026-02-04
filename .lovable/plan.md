
# Bi-directional Family Links and Edit Relationship Dialog Implementation

## Overview

This implementation adds three key enhancements based on the approved plan:
1. **Bi-directional family links**: When adding a family member, automatically create the reciprocal relationship
2. **Remove "View Client" icon**: Clean up the action buttons to only show Edit and Delete
3. **Edit Relationship Dialog**: Comprehensive form matching the reference image with all relationship, identification, contact, and address fields

## Files to Create/Modify

### 1. Modify: `src/components/client-detail/AddFamilyMemberDialog.tsx`

**Changes:**
- Add helper function `getReciprocalRelationship()` to map relationship types:
  - Spouse ↔ Spouse
  - Child ↔ Parent
  - Parent ↔ Child
  - Sibling ↔ Sibling
- Fetch original client data before creating relationships
- After creating primary relationship, create reciprocal relationship on the new family member's record

**Key Code Addition (after line 72):**
```typescript
const getReciprocalRelationship = (type: string): "Spouse" | "Child" | "Parent" | "Sibling" => {
  switch (type) {
    case "Spouse": return "Spouse";
    case "Child": return "Parent";
    case "Parent": return "Child";
    case "Sibling": return "Sibling";
    default: return "Spouse";
  }
};
```

**In onSubmit function:**
- Fetch original client's first_name, surname, id_number
- After creating primary relationship, insert reciprocal:
```typescript
await supabase.from("client_relationships").insert({
  user_id: user.id,
  client_id: newClient.id,        // The new family member
  related_client_id: clientId,     // The original client
  name: `${originalClient.first_name} ${originalClient.surname}`,
  entity_type: "Individual",
  relationship_type: getReciprocalRelationship(data.relationship_type),
  identification: originalClient.id_number,
  id_type: "SA ID",
  product_viewing_level: data.product_viewing_level || "Full",
});
```

### 2. Modify: `src/components/client-detail/ClientRelationshipsTab.tsx`

**Changes:**
- Remove the `ExternalLink` button from Family Members section (lines 103-105)
- Remove the `ExternalLink` button from Businesses section (lines 176-178)
- Add state for editing: `const [editingFamilyMember, setEditingFamilyMember] = useState<FamilyMemberListItem | null>(null);`
- Add onClick handler to Pencil button: `onClick={() => setEditingFamilyMember(member)}`
- Import and render `EditFamilyMemberDialog`

**Removal - Family Members section (around line 103):**
```diff
- <Button variant="ghost" size="icon" className="h-8 w-8" title="View Client">
-   <ExternalLink className="w-4 h-4" />
- </Button>
```

**Removal - Businesses section (around line 176):**
```diff
- <Button variant="ghost" size="icon" className="h-8 w-8" title="View Entity">
-   <ExternalLink className="w-4 h-4" />
- </Button>
```

**Addition - Edit dialog wiring:**
```typescript
// Add state
const [editingFamilyMember, setEditingFamilyMember] = useState<FamilyMemberListItem | null>(null);

// Update Pencil button
<Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingFamilyMember(member)}>
  <Pencil className="w-4 h-4" />
</Button>

// Add dialog at end
<EditFamilyMemberDialog
  open={!!editingFamilyMember}
  onOpenChange={(open) => !open && setEditingFamilyMember(null)}
  clientId={clientId || ""}
  familyMember={editingFamilyMember}
  onSuccess={refetchRelationships}
/>
```

### 3. Create: `src/components/client-detail/EditFamilyMemberDialog.tsx`

**New comprehensive dialog with tabs matching reference image:**

**Tab Structure:**
1. **Relationship Tab**
   - Relationship Details: type, family type, birthday list checkbox, send birthday SMS checkbox
   - Communication Options: CC on PFRs checkbox, CC on email communications checkbox
   - Viewing Access: Product viewing dropdown (Full/Limited/None)

2. **Identification Tab**
   - Person type, ID number, Country of issue
   - Gender, Title, Initials, Birthday
   - First names, Surname, Preferred name

3. **Contact Tab**
   - Phone numbers: Home, Work, Extension, Cell, Fax
   - Email: Personal, Work
   - Website
   - Social: Twitter, Skype, YouTube

4. **Address Tab**
   - Residential Address: Type, Unit/Floor/Building/Farm, Street details, City/Suburb/Code, Province/Country, GPS coordinates
   - Postal Address: Type, Attention, P.O. Box, City/Suburb/Code

**Data Flow:**
1. On open: Fetch relationship data from `client_relationships` table
2. If `relatedClientId` exists: Fetch full client data from `clients` table
3. Parse JSONB address fields into form values
4. On save: Update both `client_relationships` and `clients` tables

### 4. Modify: `src/hooks/useClientRelationships.ts`

**Update deleteRelationship to also delete reciprocal:**

```typescript
const deleteRelationship = async (relId: string) => {
  try {
    // First get the relationship to find the reciprocal
    const { data: relData } = await supabase
      .from("client_relationships")
      .select("client_id, related_client_id")
      .eq("id", relId)
      .single();

    // Soft-delete the primary relationship
    const { error } = await supabase
      .from("client_relationships")
      .update({ is_deleted: true, deleted_at: new Date().toISOString() })
      .eq("id", relId);

    if (error) throw error;

    // Find and soft-delete the reciprocal relationship
    if (relData?.related_client_id) {
      await supabase
        .from("client_relationships")
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq("client_id", relData.related_client_id)
        .eq("related_client_id", relData.client_id)
        .eq("is_deleted", false);
    }

    setFamilyMembers((prev) => prev.filter((f) => f.id !== relId));
    setBusinesses((prev) => prev.filter((b) => b.id !== relId));
    toast.success("Relationship removed successfully");
    return true;
  } catch (err: any) {
    console.error("Error deleting relationship:", err);
    toast.error(err.message || "Failed to remove relationship");
    return false;
  }
};
```

## Form Schema for EditFamilyMemberDialog

```typescript
const editFamilyMemberSchema = z.object({
  // Relationship Details
  relationship_type: z.enum(["Spouse", "Child", "Parent", "Sibling"]),
  family_type: z.string().optional(),
  show_on_birthday_list: z.boolean().optional(),
  send_birthday_sms: z.boolean().optional(),
  
  // Communication Options
  cc_pfrs: z.boolean().optional(),
  cc_email_communications: z.boolean().optional(),
  
  // Viewing Access
  product_viewing_level: z.string().optional(),
  
  // Identification Details (stored in clients table)
  person_type: z.string().optional(),
  id_number: z.string().optional(),
  country_of_issue: z.string().optional(),
  gender: z.string().optional(),
  title: z.string().optional(),
  initials: z.string().optional(),
  first_name: z.string().min(1, "First name is required"),
  surname: z.string().min(1, "Surname is required"),
  preferred_name: z.string().optional(),
  date_of_birth: z.string().optional(),
  
  // Contact Details (stored in clients table)
  home_number: z.string().optional(),
  work_number: z.string().optional(),
  work_extension: z.string().optional(),
  cell_number: z.string().optional(),
  fax_number: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  work_email: z.string().email().optional().or(z.literal("")),
  website: z.string().optional(),
  twitter: z.string().optional(),
  skype: z.string().optional(),
  youtube: z.string().optional(),
  
  // Residential Address (stored as JSONB in clients.residential_address)
  res_address_type: z.string().optional(),
  res_unit_nr: z.string().optional(),
  res_floor: z.string().optional(),
  res_building: z.string().optional(),
  res_farm: z.string().optional(),
  res_street_nr: z.string().optional(),
  res_street: z.string().optional(),
  res_development: z.string().optional(),
  res_city: z.string().optional(),
  res_suburb: z.string().optional(),
  res_code: z.string().optional(),
  res_province: z.string().optional(),
  res_country: z.string().optional(),
  res_gps_lat: z.string().optional(),
  res_gps_long: z.string().optional(),
  
  // Postal Address (stored as JSONB in clients.postal_address)
  postal_address_type: z.string().optional(),
  postal_attention: z.string().optional(),
  postal_po_box: z.string().optional(),
  postal_city: z.string().optional(),
  postal_suburb: z.string().optional(),
  postal_code: z.string().optional(),
});
```

## Expected Behavior After Implementation

| Scenario | Expected Result |
|----------|----------------|
| Add "Kayla" as Child of "Caren" | Caren's record shows Kayla as Child; Kayla's record shows Caren as Parent |
| Add spouse relationship | Both clients show each other as Spouse |
| Delete family relationship | Both primary and reciprocal relationships are soft-deleted |
| Click Edit (pencil) button | Opens comprehensive dialog with 4 tabs |
| Save edits | Updates both client_relationships and clients tables |
| No "View Client" button | Button removed; users navigate via "Manage related entity" dropdown |

## Data Storage

All data is stored in the database:
- **client_relationships table**: relationship_type, family_name, product_viewing_level, identification
- **clients table**: All client fields including residential_address (JSONB), postal_address (JSONB)

No data is hardcoded - form values are dynamically populated from database queries.
