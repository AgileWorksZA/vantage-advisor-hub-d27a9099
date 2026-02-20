

## Interactive Widget Home Screen for Client App

### Overview

Replace the static quick-action buttons (Message Adviser, Upload Document, Request Meeting) on the Client App home screen with rich, interactive widget cards. The widgets will mirror the adviser dashboard experience (Portfolio Overview, Valuation, Geographic Diversification, Family, Client Portfolio, Household, Onboarding) but rendered as vertically-stacked mobile cards. Clients can customize which widgets appear and their order via a settings gear in the section header.

### Widget Catalogue

The following widgets will be available (all data sourced from existing `generateClient360Data` and seeded helpers already used in `ClientDashboardTab`):

1. **Portfolio Summary** (default: visible) - Gradient hero card with total AUM, monthly change %, retained from current design
2. **Client Portfolio** - Donut chart, total value, 12-month performance sparkline, top products with growth %
3. **Change in Valuation** - Period selector (6M/1Y/3Y/5Y), Starting Value, Deposits/Withdrawals, Investment Returns, Ending Value with sparklines
4. **Geographic Diversification** - World map SVG with region dots and percentage legend
5. **Family and Relationships** - Circular avatars with relationship labels, names, ages, and AUM per member
6. **Household** - Combined value with YTD growth, list of members with sparklines and growth %
7. **Onboarding** - KYC/AML verification status with masked personal details and check statuses
8. **Holdings** (default: visible) - Existing product listing, retained
9. **Upcoming Meeting** (default: visible) - Existing meeting card, retained

### Customization

- A "Customise" button (sliders icon) will appear in the home tab header area
- Tapping it opens a bottom sheet / overlay listing all available widgets with toggle switches
- Widget visibility preferences are stored in `localStorage` (keyed per client) so no backend changes needed
- Widgets render in a fixed vertical stack order (mobile-friendly, no drag-and-drop needed on small screens)

### Technical Details

**Edit: `src/components/client-app/ClientHomeTab.tsx`**

Major rewrite of this component:
- Import data generation helpers from `regional360ViewData` and seeded random utilities (same pattern as `ClientDashboardTab`)
- Add `useState` for `visibleWidgets` (string array of widget IDs), initialized from `localStorage`
- Add `showCustomise` state for the widget picker overlay
- Replace the quick-actions grid with a vertical stack of widget cards
- Each widget is a self-contained card component rendered conditionally based on `visibleWidgets`
- Widget rendering logic extracted from `ClientDashboardTab` patterns but simplified for mobile (single-column, compact sizing)

**New: `src/components/client-app/ClientHomeWidgetPicker.tsx`**

A simple overlay/sheet component:
- Header with "Customise Home" title and close button
- List of all widget IDs with labels and toggle switches
- Changes immediately update the parent's `visibleWidgets` state and persist to `localStorage`

**Widget implementation details (all inside ClientHomeTab):**

- **Client Portfolio**: Small donut chart (inline SVG, no ECharts needed for mobile perf), total value, monthly change, top 3 products with mini sparklines
- **Change in Valuation**: Period tabs (6M/1Y/3Y/5Y), 4-row breakdown with sparklines and percentage badges, same data logic as `ClientDashboardTab`
- **Geographic Diversification**: Reuse `WorldMapSVG` component, region dots with percentage legend below
- **Family and Relationships**: Horizontal scroll of circular avatar nodes with initials, relationship label, age, and AUM value
- **Household**: Combined value header with YTD growth, vertical list of members with sparklines
- **Onboarding**: Masked personal details grid, 3 verification checks with status icons, success banner

### Files to Create
- `src/components/client-app/ClientHomeWidgetPicker.tsx`

### Files to Edit
- `src/components/client-app/ClientHomeTab.tsx` (major rewrite with widget system)

### No Backend Changes Required
All data comes from existing deterministic generators. Widget preferences stored in localStorage.

