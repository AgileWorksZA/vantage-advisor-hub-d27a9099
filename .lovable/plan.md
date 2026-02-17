

## Remove Tasks Tab from Client Detail

A straightforward removal of the "Tasks" tab from the client detail view. Three changes in one file:

### File: `src/pages/ClientDetail.tsx`

| Change | Detail |
|--------|--------|
| Remove tab trigger | Delete the `{ value: "tasks", label: "Tasks" }` entry from the tabs array (~line 264) |
| Remove TabsContent | Delete the `<TabsContent value="tasks">` block (~line 299) |
| Remove import | Delete the `import ClientTasksTab` line (~line 42) |

No other files reference or depend on this tab being present in the client detail view.

