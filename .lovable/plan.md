

## Calendar: Event Search, Client Search Fix, and Month/Year Navigator

### 1. Top bar search - always client search

The AppHeader already performs client search by default. The Calendar page just passes a misleading placeholder "Search events...". Change it to "Search clients..." (or simply remove the prop so it uses the default).

**File**: `src/pages/Calendar.tsx` (line 425)
- Remove `searchPlaceholder="Search events..."` from the AppHeader props

### 2. Event search box in left sidebar

Add a search input below the "Create Event" button in the left sidebar (lines 436-455). As the user types, show a dropdown of matching events with:
- Color-coded left border accent matching event type
- Event title on first line
- Client name on second line (if linked)
- Click navigates to that event's detail sheet

**File**: `src/pages/Calendar.tsx`
- Add state: `eventSearchQuery` and `eventSearchOpen`
- Add a ref for the search container
- Below the Create Event button, add a `div` with a `Search` icon input
- Below the input, render a dropdown (absolute positioned, bg-popover, shadow, z-50) that filters `convertedEvents` by title/client name match
- Each result shows the color accent dot, event title, and client name on a second line
- Clicking a result calls `handleEventClick(event)` and clears the search
- Close dropdown on outside click and Escape key

### 3. Month/Year selector when clicking "Month" heading

When viewing the month, the heading shows e.g. "February 2026". Clicking it should open a popover with a month and year picker to quickly jump to any month.

**File**: `src/pages/Calendar.tsx` (lines 576-582)
- Wrap the month heading text in a `Popover` trigger (only in month view mode)
- The `PopoverContent` contains:
  - A year row with left/right arrows and the current year displayed
  - A 4x3 grid of month buttons (Jan-Dec)
  - Clicking a month sets `viewDate` to that month+year and closes the popover
- The heading gets a hover style (cursor-pointer, underline) to indicate it's clickable

### Technical Details

**Event search dropdown styling** (consistent with ClientAutocompleteDropdown):
- Container: `absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg z-50 max-h-[300px] overflow-auto`
- Each item: colored dot + title on line 1, client name in muted text on line 2
- Filter logic: case-insensitive match on `event.title` or `event.clientName`

**Month/Year popover**:
- State: `monthPickerOpen`, `pickerYear` (initialized from viewDate's year)
- Year navigation: ChevronLeft/ChevronRight to decrement/increment `pickerYear`
- Month grid: 12 buttons in a `grid grid-cols-4` layout
- Current month highlighted with teal accent
- On month click: `setViewDate(new Date(pickerYear, monthIndex, 1))`, close popover

**Files changed**:
- `src/pages/Calendar.tsx`
