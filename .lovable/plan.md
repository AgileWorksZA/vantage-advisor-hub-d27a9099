
# Replace Products Box with Recent Activity Widget

## Overview

Replace the "Products" card on the Client Summary tab with a "Recent Activity" widget styled like the reference image. Add a "Show more" link that opens a new "Recent Activity" tab with a detailed audit log.

---

## Changes Required

### 1. Create Client Recent Activity Tab Component

**File:** `src/components/client-detail/ClientRecentActivityTab.tsx` (new)

A full-page audit log for the client, similar to `ActivityLogTabEnhanced.tsx` but scoped to the specific client:

| Feature | Description |
|---------|-------------|
| Header | "Event log" title with teal color |
| Filters | Date range filters (Start/End) |
| Pagination | Full pagination with page navigation |
| Table | Detailed audit log table with columns: #, Date, Type, Subtype, Entity name, Note, Active person, ID |
| Export | Export button for CSV download |

### 2. Modify Client Summary Tab

**File:** `src/components/client-detail/ClientSummaryTab.tsx`

Replace the "Products" card (lines 165-225) with a "Recent Activity" card:

| Element | Design |
|---------|--------|
| Card Title | "RECENT ACTIVITY" (uppercase, small text) with kebab menu icon |
| Activity Items | 5 most recent activities with icon, title, description, and relative timestamp |
| Icons | Color-coded icons based on activity type (sale, product, message, upload) |
| Show More Link | "Show more" link at bottom that triggers tab change |

**Activity Item Structure:**
```text
[Icon] Title (bold, colored)
       Description text
       X minutes/hours ago (muted)
```

### 3. Update Client Detail Page

**File:** `src/pages/ClientDetail.tsx`

| Change | Location |
|--------|----------|
| Add tab | Add "Recent Activity" to tabs array after "Documents" (line 253) |
| Add content | Add TabsContent for "recent-activity" |
| Pass callback | Pass `setActiveTab` to ClientSummaryTab for navigation |
| Import | Import new ClientRecentActivityTab component |

---

## Implementation Details

### Recent Activity Card Design (Summary Tab)

Based on the reference image, each activity item will have:

```tsx
<div className="flex gap-3 py-3 border-b last:border-0">
  <div className="shrink-0">
    <ActivityIcon /> {/* Colored icon based on type */}
  </div>
  <div className="flex-1 min-w-0">
    <p className="font-medium text-blue-600">Activity Title</p>
    <p className="text-sm text-muted-foreground">
      Description with <span className="font-medium">highlighted text</span>
    </p>
    <p className="text-xs text-muted-foreground mt-1">5 minutes ago</p>
  </div>
</div>
```

**Activity Types & Icons:**

| Type | Icon | Color |
|------|------|-------|
| Product added/sold | DollarSign | Yellow/Amber |
| Document uploaded | Image | Purple |
| Message/Note | MessageSquare | Blue |
| Profile updated | User | Green |
| Compliance created | FileCheck | Teal |

### Demo Activity Data

For now, use static demo data similar to the Practice Activity Log but scoped to client context:

```typescript
const recentActivities = [
  {
    id: 1,
    type: "product_sold",
    title: "Product purchased",
    description: 'Client added "Discovery Life Plan"',
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
  },
  {
    id: 2,
    type: "document_uploaded",
    title: "Document uploaded",
    description: 'Uploaded "ID Document.pdf"',
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
  },
  // ... more activities
];
```

### Tab Navigation

Update tabs array in ClientDetail.tsx:

```tsx
{[
  // ... existing tabs
  { value: "documents", label: "Documents" },
  { value: "recent-activity", label: "Recent Activity" }, // New tab
].map((tab) => (
  // ...
))}
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/components/client-detail/ClientRecentActivityTab.tsx` | **Create** - Full audit log component |
| `src/components/client-detail/ClientSummaryTab.tsx` | **Modify** - Replace Products card with Recent Activity widget |
| `src/pages/ClientDetail.tsx` | **Modify** - Add Recent Activity tab and pass setActiveTab prop |

---

## Component Props Update

The ClientSummaryTab will need an `onShowMoreActivity` callback:

```tsx
interface ClientSummaryTabProps {
  client: Client;
  clientId: string;
  onShowMoreActivity?: () => void; // New prop
}
```

Called when user clicks "Show more" to switch to the Recent Activity tab.

---

## Visual Design Notes

The Recent Activity card will follow the reference image design:
- Clean, minimal layout
- Icons with distinct colors for visual scanning
- Relative timestamps (X minutes ago, X hours ago)
- Title links styled in blue/teal
- Subtle borders between items
- "Show more" link at bottom in primary color
