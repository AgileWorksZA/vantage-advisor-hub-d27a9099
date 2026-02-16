

## Add Edit Button to General Details and Remove Details Tab from Ribbon

### What Changes

1. **General Details card** on the Summary tab gets an "Edit" pencil/button next to the title
2. Clicking it switches to the Details tab (which stays functional but is hidden from the tab ribbon)
3. The "Details" tab entry is removed from the visible tab ribbon
4. The `tax_number` field (shown in General details but missing from the edit form) is added to the Details tab

### Layout After

**Summary tab - General Details card header:**
```text
General details                              [Edit pencil icon]
```

**Tab ribbon (Details removed):**
```text
Summary | 360 View | Performance | Meetings | Relationships | Workflows | ...
```

Clicking "Edit" sets the active tab to "details", which still renders but is no longer in the ribbon. The only way to reach it is via the edit button.

### Technical Changes

**1. `src/components/client-detail/ClientSummaryTab.tsx`**
- Import `Pencil` icon from lucide-react
- Add a small ghost button with pencil icon in the General Details `CardHeader`, next to the title
- On click, call `onTabChange?.("details")`

**2. `src/pages/ClientDetail.tsx`**
- Remove `{ value: "details", label: "Details" }` from the tabs array in the ribbon
- Keep the `<TabsContent value="details">` so it still renders when programmatically activated

**3. `src/components/client-detail/ClientDetailsTab.tsx`**
- Add `tax_number` to `formData` initial state
- Add `tax_number` to the `useEffect` sync block
- Add `tax_number` to `handleSave` updates
- Add a "Tax number" input field in the Identification details card (after nationality)

Four small edits across three files.
