

# Add Widget Visibility Settings Gear to Dashboard

## Overview
Add a gear icon to the right of the "Advisor Dashboard" heading that opens a popup dialog. The dialog lets users toggle widget visibility using switches. Preferences are persisted per user in the database and restored on return.

## Technical Approach

### 1. Database Migration
Add a `hidden_widgets` JSONB column to the existing `user_widget_layouts` table to store an array of hidden widget IDs per page. Default value: `'[]'::jsonb`.

```sql
ALTER TABLE public.user_widget_layouts 
ADD COLUMN hidden_widgets JSONB NOT NULL DEFAULT '[]'::jsonb;
```

### 2. New Component: `WidgetSettingsDialog`
Create `src/components/widgets/WidgetSettingsDialog.tsx`:
- Receives the list of all widget IDs with display labels
- Shows a Dialog/Popover with a Switch for each widget
- On toggle, calls a callback to update hidden state
- Widget labels map:
  - `provider-view` -> "Provider View"
  - `aum-product` -> "AUM by Product"
  - `top-accounts` -> "Top 5 Accounts"
  - `birthdays` -> "Birthdays"
  - `clients-value` -> "Clients by Value"
  - `corporate-actions` -> "Upcoming Corporate Actions"

### 3. Update `useWidgetLayout` Hook
Extend `src/hooks/useWidgetLayout.ts`:
- Add `hiddenWidgets: string[]` state
- Load `hidden_widgets` from database alongside `layout`
- Add `setHiddenWidgets(widgetIds: string[])` function that updates state and persists to database
- Return `{ layout, onLayoutChange, hiddenWidgets, setHiddenWidgets, loading }`

### 4. Update Dashboard Page (`src/pages/Dashboard.tsx`)
- Import `Settings` icon from lucide-react and the new `WidgetSettingsDialog`
- Add gear icon button aligned far-right in the heading row (use `flex justify-between items-center`)
- Wrap heading + AI badge in a `div` and place gear on the opposite side
- Filter widget children passed to `DraggableWidgetGrid`: only render widgets whose key is NOT in `hiddenWidgets`
- Also filter the `layout` array to exclude hidden widgets so grid compacts properly

### 5. Layout Structure
```text
+-- flex row, justify-between, items-center --+
| "Advisor Dashboard" [AI badge]    [gear icon]|
+----------------------------------------------+
```

### Files Changed
- `supabase/migrations/new_migration.sql` -- add `hidden_widgets` column
- `src/components/widgets/WidgetSettingsDialog.tsx` -- new component
- `src/hooks/useWidgetLayout.ts` -- extend with hidden widgets state
- `src/pages/Dashboard.tsx` -- add gear icon, filter hidden widgets

