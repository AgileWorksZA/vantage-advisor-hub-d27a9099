

## Remove "Clients by Age Group" Widget

Since the widget sizing cannot be resolved satisfactorily, we will remove it entirely from the dashboard.

### Changes in `src/pages/Dashboard.tsx`

1. **Remove from default layout array** -- delete the `{ i: 'age-groups', ... }` entry from `defaultDashboardLayout`
2. **Remove from widget config array** -- delete the `{ id: 'age-groups', label: 'Clients by Age Group' }` entry from `DASHBOARD_WIDGETS`
3. **Remove the ageGroups state** -- delete `const [ageGroups, setAgeGroups] = useState(...)` 
4. **Remove the useEffect that fetches age group data** -- delete the entire `fetchAgeGroups` effect block (~lines 232-275)
5. **Remove the widget JSX** -- delete the entire "Clients by Age Group" render block (~lines 632-672)

No other files are affected. The widget settings dialog will automatically stop listing it since it reads from `DASHBOARD_WIDGETS`. Saved user layouts referencing this widget will be harmlessly ignored.
