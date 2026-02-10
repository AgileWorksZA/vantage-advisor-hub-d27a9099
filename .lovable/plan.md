

## Add "Main Member" Badge to "Manage Related Entity" Dropdown

### Overview

Display the amber "Main Member" badge next to the name of any related entity whose name contains a word from the household group, matching the logic already used in the ribbon and relationships table.

### Changes

**File: `src/components/client-detail/ClientRibbon.tsx`**

In the "Manage related entity" dropdown (around line 144), update the entity name rendering to include the Main Member badge:

```tsx
<div className="flex flex-col">
  <span className="font-medium">
    {entity.name}
    {client.household_group && entity.name.split(" ").some(word => word.length > 1 && client.household_group!.includes(word)) && (
      <Badge variant="outline" className="border-amber-500 text-amber-600 bg-transparent dark:text-amber-400 dark:border-amber-400 text-[10px] px-1.5 py-0 ml-2">
        Main Member
      </Badge>
    )}
  </span>
  <span className="text-xs text-muted-foreground">{entity.type}</span>
</div>
```

No other files need changes. The `Badge` import and `client` prop are already available in this component.

