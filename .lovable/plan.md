

# Add 4-Type Client Filter with Tags and Seed Trust Clients

## Overview
Expand the client type system from 3 to 4 types by adding "Trust" as a new client category. Replace the placeholder "Select" dropdown with a multi-select filter showing 4 client types (Individual, Entity, Trust, Family), display selected types as removable tags below the filter, and seed trust client records across all jurisdictions.

## Changes

### 1. Database Migration: Add "trust" to the client_type check constraint

The `clients` table currently has a check constraint allowing only `individual`, `family`, and `business`. We need to add `trust`:

```sql
ALTER TABLE public.clients DROP CONSTRAINT clients_client_type_check;
ALTER TABLE public.clients ADD CONSTRAINT clients_client_type_check 
  CHECK (client_type = ANY (ARRAY['individual', 'family', 'business', 'trust']));
```

### 2. Update Seed Function: Generate trust clients

**File: `supabase/functions/seed-demo-clients/index.ts`**

Add static trust clients to the demo data -- one per jurisdiction leader advisor, similar to how business clients are defined. Trust clients represent family trusts and testamentary trusts with names like:

- ZA: "Van Niekerk Family Trust" (Johan Botha)
- AU: "Papadopoulos Family Trust" (James Mitchell)
- CA: "Lavoie Family Trust" (Pierre Tremblay)
- GB: "Anderson Family Trust" (William Smith)
- US: "Johnson Family Trust" (Michael Johnson)

Each trust record will have:
- `client_type: 'trust'`
- `age: null`, `gender: null` (not a natural person)
- Appropriate title (empty), occupation ("Trust"), industry ("Estate Planning")
- Unique ID numbers generated via the existing jurisdiction ID generators
- One trust per jurisdiction for the lead advisor (5 total static trusts)

Additionally, in the `generateAdditionalClients` function, add logic to generate 1-2 trust clients per advisor (similar to how business/family entries work) by randomly assigning `client_type: 'trust'` to a small portion of generated clients. This will create approximately 25-50 trust records spread across all advisors.

### 3. Update Clients Page: Multi-select with 4 options and removable tags

**File: `src/pages/Clients.tsx`**

**a) Add state and options:**
```typescript
const clientTypeOptions = [
  { value: "individual", label: "Individual" },
  { value: "business", label: "Entity" },
  { value: "trust", label: "Trust" },
  { value: "family", label: "Family" },
];

const [selectedClientTypes, setSelectedClientTypes] = useState<string[]>(
  ["individual", "business", "trust", "family"]
);
```

**b) Replace placeholder Select with MultiSelect:**
Replace the existing `Select`/`SelectTrigger`/`SelectContent` block (next to "Reports" button) with the `MultiSelect` component:
```typescript
<MultiSelect
  options={clientTypeOptions}
  selected={selectedClientTypes}
  onChange={setSelectedClientTypes}
  placeholder="Person type"
  className="w-48"
/>
```

**c) Add filter tags below the multi-select area:**
Below the "YOUR CLIENTS" header row and above the search input, display removable tags showing which client types are currently selected (only when not all are selected):
```typescript
{selectedClientTypes.length < 4 && selectedClientTypes.length > 0 && (
  <div className="flex items-center gap-2 mb-3 flex-wrap">
    <span className="text-xs text-muted-foreground">Filtered by:</span>
    {selectedClientTypes.map(type => (
      <Badge key={type} variant="secondary" className="text-xs gap-1">
        {clientTypeOptions.find(o => o.value === type)?.label}
        <X
          className="h-3 w-3 cursor-pointer"
          onClick={() => setSelectedClientTypes(prev => prev.filter(t => t !== type))}
        />
      </Badge>
    ))}
  </div>
)}
```

**d) Add client type filtering logic to the filteredClients chain:**
```typescript
// Filter by client type (person type)
if (selectedClientTypes.length < 4) {
  if (!selectedClientTypes.includes(client.clientType)) return false;
}
```

**e) Update Reset Filters handler:**
```typescript
onClick={() => {
  clearDashboardFilter();
  setSearchQuery("");
  setIncludeInactive(false);
  setSelectedClientTypes(["individual", "business", "trust", "family"]);
}}
```

**f) Update imports:**
- Add: `import { MultiSelect } from "@/components/ui/multi-select"`
- Add: `import { Badge } from "@/components/ui/badge"`
- Remove: `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue` imports (no longer used)

### 4. Update Table Icon Logic

Add a trust icon to the `getClientIcon` function:
```typescript
const getClientIcon = (type: string) => {
  switch (type) {
    case "family":
      return <Users2 className="w-4 h-4 text-muted-foreground" />;
    case "business":
      return <Building className="w-4 h-4 text-muted-foreground" />;
    case "trust":
      return <Briefcase className="w-4 h-4 text-muted-foreground" />;
    default:
      return <Users className="w-4 h-4 text-muted-foreground" />;
  }
};
```

### 5. Deploy and Seed

- Deploy the updated edge function
- Run the seed function against Test to populate trust clients
- Verify the multi-select filter and tags work correctly across all jurisdictions

## Expected Outcome

- 4 client types in the database: individual, business, trust, family
- Multi-select dropdown with all 4 options, defaulting to all selected
- Removable tags displayed when a subset is selected, each tag clickable to remove that type from the filter
- Trust clients seeded across all jurisdictions (approximately 25-50 new trust records)
- Filter updates the table in real-time as tags are added/removed
