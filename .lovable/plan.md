

# Movable Dashboard Widgets with Persistent Layout Storage

## Overview
Implement drag-and-drop functionality for widgets on both the Dashboard and Insights pages, with user-specific layout persistence in the database. Additionally, update the responsive layout so widgets maintain fixed widths and wrap to new rows on smaller screens rather than shrinking.

---

## Architecture

```text
┌─────────────────────────────────────────────────────────────────────┐
│                         User Interacts                              │
│                    (drag widget to new position)                    │
└─────────────────────────┬───────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    react-grid-layout                                │
│    - Handles drag/drop mechanics                                    │
│    - Supports responsive breakpoints                                │
│    - Fires onLayoutChange callback                                  │
└─────────────────────────┬───────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   useWidgetLayout Hook                              │
│    - Manages layout state                                           │
│    - Debounces save operations                                      │
│    - Syncs with Supabase                                            │
└─────────────────────────┬───────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│              user_widget_layouts (Supabase Table)                   │
│    - user_id (UUID, FK to auth.users)                               │
│    - page_id (TEXT: 'dashboard' | 'insights')                       │
│    - layout (JSONB: widget positions/sizes)                         │
│    - created_at, updated_at                                         │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### New Table: `user_widget_layouts`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | References auth.users, NOT NULL |
| `page_id` | TEXT | 'dashboard' or 'insights', NOT NULL |
| `layout` | JSONB | Widget layout configuration |
| `created_at` | TIMESTAMPTZ | Auto-set on create |
| `updated_at` | TIMESTAMPTZ | Auto-updated on changes |

**Constraints:**
- Unique constraint on `(user_id, page_id)` - one layout per page per user
- RLS policy: Users can only read/write their own layouts

### SQL Migration

```sql
CREATE TABLE public.user_widget_layouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  page_id TEXT NOT NULL CHECK (page_id IN ('dashboard', 'insights')),
  layout JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, page_id)
);

-- Enable RLS
ALTER TABLE public.user_widget_layouts ENABLE ROW LEVEL SECURITY;

-- Users can only access their own layouts
CREATE POLICY "Users can manage own layouts" ON public.user_widget_layouts
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Auto-update timestamp trigger
CREATE TRIGGER update_user_widget_layouts_updated_at
  BEFORE UPDATE ON public.user_widget_layouts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
```

---

## New Dependencies

Install `react-grid-layout` which provides:
- Drag-and-drop grid layout
- Responsive breakpoints
- Resize handles (optional)
- Layout change callbacks

```bash
npm install react-grid-layout
npm install @types/react-grid-layout --save-dev
```

---

## New Files

### 1. `src/hooks/useWidgetLayout.ts`

Custom hook to manage widget layouts with database persistence.

```typescript
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from 'react-grid-layout';
import { debounce } from '@/lib/utils';

interface UseWidgetLayoutProps {
  pageId: 'dashboard' | 'insights';
  defaultLayout: Layout[];
  userId: string | undefined;
}

export const useWidgetLayout = ({ pageId, defaultLayout, userId }: UseWidgetLayoutProps) => {
  const [layout, setLayout] = useState<Layout[]>(defaultLayout);
  const [loading, setLoading] = useState(true);

  // Load layout from database on mount
  useEffect(() => {
    if (!userId) return;
    
    const fetchLayout = async () => {
      const { data, error } = await supabase
        .from('user_widget_layouts')
        .select('layout')
        .eq('user_id', userId)
        .eq('page_id', pageId)
        .single();

      if (data?.layout) {
        setLayout(data.layout as Layout[]);
      }
      setLoading(false);
    };

    fetchLayout();
  }, [userId, pageId]);

  // Debounced save function
  const saveLayout = useCallback(
    debounce(async (newLayout: Layout[]) => {
      if (!userId) return;
      
      await supabase
        .from('user_widget_layouts')
        .upsert({
          user_id: userId,
          page_id: pageId,
          layout: newLayout,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,page_id'
        });
    }, 1000),
    [userId, pageId]
  );

  const onLayoutChange = useCallback((newLayout: Layout[]) => {
    setLayout(newLayout);
    saveLayout(newLayout);
  }, [saveLayout]);

  return { layout, onLayoutChange, loading };
};
```

### 2. `src/components/widgets/DraggableWidgetGrid.tsx`

Wrapper component for react-grid-layout with consistent styling.

```typescript
import { ReactNode } from 'react';
import GridLayout, { WidthProvider, Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';

const ResponsiveGridLayout = WidthProvider(GridLayout);

interface DraggableWidgetGridProps {
  layout: Layout[];
  onLayoutChange: (layout: Layout[]) => void;
  children: ReactNode;
  cols?: number;
  rowHeight?: number;
}

export const DraggableWidgetGrid = ({
  layout,
  onLayoutChange,
  children,
  cols = 12,
  rowHeight = 100,
}: DraggableWidgetGridProps) => {
  return (
    <ResponsiveGridLayout
      className="layout"
      layout={layout}
      cols={cols}
      rowHeight={rowHeight}
      onLayoutChange={onLayoutChange}
      draggableHandle=".widget-drag-handle"
      margin={[16, 16]}
      containerPadding={[0, 0]}
      isResizable={false}
      compactType="vertical"
    >
      {children}
    </ResponsiveGridLayout>
  );
};
```

---

## Widget Configuration

### Dashboard Widgets (Default Layout)

| Widget ID | Default Position | Size |
|-----------|------------------|------|
| `provider-view` | x:0, y:0 | w:3, h:3 |
| `top-accounts` | x:3, y:0 | w:3, h:3 |
| `aum-product` | x:6, y:0 | w:3, h:3 |
| `birthdays` | x:9, y:0 | w:3, h:3 |
| `clients-value` | x:0, y:3 | w:3, h:3 |

### Insights Widgets (Default Layout)

| Widget ID | Default Position | Size |
|-----------|------------------|------|
| `commission-type` | x:0, y:0 | w:3, h:4 |
| `commission-earned` | x:3, y:0 | w:3, h:4 |
| `monthly-commission` | x:6, y:0 | w:3, h:4 |
| `commission-snapshot` | x:9, y:0 | w:3, h:4 |
| `commission-summary` | x:0, y:4 | w:6, h:4 |
| `leaderboard` | x:6, y:4 | w:3, h:4 |

---

## Responsive Behavior

### Current (Grid with shrinking columns)
```css
grid-cols-12 gap-4
/* Widgets shrink as screen gets smaller */
```

### New (Fixed-width widgets with wrapping)
```text
- Each widget has a fixed minimum width (~280-300px)
- Widgets wrap to next row when viewport shrinks
- Horizontal scroll is prevented
- Vertical scroll is enabled
- react-grid-layout handles the responsive wrapping automatically
```

The grid will use a breakpoint system:
- **Large (>1200px)**: 12 columns - 4 widgets per row
- **Medium (992-1200px)**: 9 columns - 3 widgets per row
- **Small (768-992px)**: 6 columns - 2 widgets per row
- **Mobile (<768px)**: 3 columns - 1 widget per row

---

## Files to Modify

### 1. `src/pages/Dashboard.tsx`

**Changes:**
1. Import `DraggableWidgetGrid` and `useWidgetLayout`
2. Add default layout configuration array
3. Wrap widget grid with `DraggableWidgetGrid`
4. Add drag handle to each Card header
5. Add unique `key` and `data-grid` props to each widget

**Key Code Changes:**

```tsx
// Add import
import { DraggableWidgetGrid } from '@/components/widgets/DraggableWidgetGrid';
import { useWidgetLayout } from '@/hooks/useWidgetLayout';

// Define default layout
const defaultDashboardLayout = [
  { i: 'provider-view', x: 0, y: 0, w: 3, h: 3 },
  { i: 'top-accounts', x: 3, y: 0, w: 3, h: 3 },
  { i: 'aum-product', x: 6, y: 0, w: 3, h: 3 },
  { i: 'birthdays', x: 9, y: 0, w: 3, h: 3 },
  { i: 'clients-value', x: 0, y: 3, w: 3, h: 3 },
];

// In component
const { layout, onLayoutChange, loading } = useWidgetLayout({
  pageId: 'dashboard',
  defaultLayout: defaultDashboardLayout,
  userId: user?.id,
});

// Replace grid-cols-12 div with DraggableWidgetGrid
<DraggableWidgetGrid layout={layout} onLayoutChange={onLayoutChange}>
  <div key="provider-view">
    <Card className="h-full">
      <CardHeader className="widget-drag-handle cursor-move ...">
        ...
      </CardHeader>
      ...
    </Card>
  </div>
  {/* ... other widgets */}
</DraggableWidgetGrid>
```

### 2. `src/pages/Insights.tsx`

Same pattern as Dashboard with Insights-specific widgets.

### 3. `src/lib/utils.ts`

Add debounce utility function if not already present:

```typescript
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
```

---

## CSS Additions

Add to `src/index.css`:

```css
/* Drag handle cursor */
.widget-drag-handle {
  cursor: move;
}

/* Dragging state styling */
.react-grid-item.react-draggable-dragging {
  transition: none;
  z-index: 100;
  cursor: grabbing;
  opacity: 0.9;
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
}

/* Placeholder styling during drag */
.react-grid-placeholder {
  background: hsl(180, 70%, 45%);
  opacity: 0.2;
  border-radius: 8px;
}
```

---

## User Experience

### Drag Behavior
1. User hovers over widget header - cursor changes to "move"
2. User clicks and drags the header - widget follows cursor
3. Other widgets shift to make room (compact vertically)
4. User releases - widget snaps to new position
5. Layout is saved to database (debounced 1 second)

### Login Persistence
1. User logs in
2. Hook fetches saved layout from `user_widget_layouts`
3. If layout exists, widgets render in saved positions
4. If no saved layout, default layout is used

### Responsive Wrapping
1. User resizes browser window
2. Widgets maintain minimum width
3. When insufficient horizontal space, widgets wrap to next row
4. User scrolls vertically to see all widgets

---

## Implementation Order

1. Create database table and RLS policies
2. Add `react-grid-layout` dependency
3. Create `useWidgetLayout` hook
4. Create `DraggableWidgetGrid` component
5. Add debounce utility to `utils.ts`
6. Add CSS styles for drag states
7. Update Dashboard page to use draggable grid
8. Update Insights page to use draggable grid
9. Test persistence across login sessions
10. Test responsive wrapping behavior

---

## Technical Considerations

- **Debouncing**: Saves are debounced by 1 second to prevent excessive database writes during drag operations
- **Optimistic Updates**: UI updates immediately, database syncs in background
- **Default Fallback**: If database fetch fails, default layout is used
- **Widget Sizing**: Commission Summary widget uses `w: 6` to span two columns
- **No Resize**: Widgets are draggable but not resizable to maintain consistent sizing

