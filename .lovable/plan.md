

## Rename "Tasks" to "Workflows" in Sidebar Navigation Across All Pages

The sidebar navigation label is duplicated in 13 files. Each one still says "Tasks" instead of "Workflows". This is a simple find-and-replace of the label string in each file's sidebar items array.

### Files to Update

| File | Line | Change |
|------|------|--------|
| `src/pages/Practice.tsx` | 44 | `"Tasks"` -> `"Workflows"` |
| `src/pages/Insights.tsx` | 142 | `"Tasks"` -> `"Workflows"` |
| `src/pages/AccountSettings.tsx` | 55 | `"Tasks"` -> `"Workflows"` |
| `src/pages/EmailView.tsx` | 53 | `"Tasks"` -> `"Workflows"` |
| `src/pages/Clients.tsx` | 67 | `"Tasks"` -> `"Workflows"` |
| `src/pages/Email.tsx` | 69 | `"Tasks"` -> `"Workflows"` |
| `src/pages/Calendar.tsx` | 102 | `"Tasks"` -> `"Workflows"` |
| `src/pages/Dashboard.tsx` | 44 | `"Tasks"` -> `"Workflows"` |
| `src/pages/Administration.tsx` | 33 | `"Tasks"` -> `"Workflows"` |
| `src/pages/ComposeEmail.tsx` | 59 | `"Tasks"` -> `"Workflows"` |
| `src/pages/Portfolio.tsx` | 32 | `"Tasks"` -> `"Workflows"` |
| `src/pages/ClientDetail.tsx` | 51 | `"Tasks"` -> `"Workflows"` |
| `src/components/mobile/MobileApp.tsx` | 23 | `"Tasks"` -> `"Workflows"` |

`src/pages/Tasks.tsx` and `src/components/layout/AppLayout.tsx` were already updated in the previous change and are not included.

### Scope
- Only the sidebar `label` string changes -- no route, icon, or internal logic changes.
- 13 files, one line each.
