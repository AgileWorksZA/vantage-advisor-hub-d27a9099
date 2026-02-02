

# Calendar Page Implementation Plan

## Overview

This plan adds a new Calendar page to the advisor portal with full Outlook-like calendar functionality. The Calendar link will be placed in the left navigation bar immediately after Email, maintaining visual consistency with the existing portal design.

## What Will Be Built

The Calendar page will provide advisors with a comprehensive scheduling and event management interface similar to Microsoft Outlook, including:

- **Monthly/Weekly/Daily views** with navigation controls
- **Event creation and management** (client meetings, reviews, reminders)
- **Client meeting integration** linking calendar events to clients
- **Mini calendar sidebar** for quick date navigation
- **Upcoming events list** showing scheduled items

---

## Visual Structure

```text
+--------------------------------------------------+
| [+] |  Search...                  [Advisors] [🔔] |
|-----|-----------------------------------------------|
| Dash|  [My Calendars]     |  Calendar Grid View   |
|Clients| ☑ My Calendar    |  Mon  Tue  Wed ...    |
| Email|  ☑ Client Meetings|  [Events displayed    |
|Calendr|  ☑ Team Events   |   in time slots]      |
| Tasks|                    |                       |
|Insight| [Mini Calendar]  |                       |
|Practice| [Upcoming]      |                       |
+--------------------------------------------------+
```

---

## Implementation Steps

### Step 1: Update Navigation Sidebar

Add Calendar to the `sidebarItems` array in all portal pages:

**Files to update:**
- `src/pages/Dashboard.tsx`
- `src/pages/Clients.tsx`
- `src/pages/Email.tsx`
- `src/pages/Tasks.tsx`
- `src/pages/Insights.tsx`
- `src/pages/Practice.tsx`
- `src/pages/ClientDetail.tsx`

The sidebar will become:
1. Dashboard
2. Clients
3. Email
4. **Calendar (NEW)**
5. Tasks
6. Insights
7. Practice

### Step 2: Create Database Schema for Calendar Events

Create a new `calendar_events` table following enterprise DBA principles:

**Table: `calendar_events`**
- `id` (UUID, primary key)
- `user_id` (UUID, foreign key to auth.users)
- `client_id` (UUID, nullable, foreign key to clients)
- `title` (text, required)
- `description` (text, nullable)
- `event_type` (enum: Meeting, Review, Reminder, Personal, Team Event)
- `start_time` (timestamptz, required)
- `end_time` (timestamptz, required)
- `all_day` (boolean, default false)
- `location` (text, nullable)
- `is_recurring` (boolean, default false)
- `recurrence_rule` (text, nullable - for iCal RRULE format)
- `reminder_minutes` (integer, nullable)
- `status` (enum: Scheduled, Completed, Cancelled)
- `color` (text, nullable - for event color coding)
- `attendees` (JSONB, nullable - array of attendee info)
- Audit fields: `created_at`, `updated_at`, `created_by`, `is_deleted`, `deleted_at`

**Indexes:**
- `user_id` for RLS performance
- `start_time`, `end_time` for date range queries
- `client_id` for client event lookups
- Composite: `user_id, start_time, end_time` for calendar view queries

**RLS Policies:**
- Users can only access their own calendar events

### Step 3: Create Calendar Hook

**File: `src/hooks/useCalendarEvents.ts`**

Provides:
- Fetching events by date range
- Creating new events
- Updating events (drag-and-drop support)
- Deleting/cancelling events
- Client meeting integration

### Step 4: Create Calendar Page

**File: `src/pages/Calendar.tsx`**

Features:
- Same layout pattern as Email page (sidebar + content area)
- View toggle: Month / Week / Day / Agenda
- Navigation: Previous/Next/Today buttons
- Event creation via clicking time slots
- Event details panel (Sheet component)
- Mini calendar for quick date jumping
- Calendar list sidebar (My Calendar, Client Meetings, Team Events)
- Upcoming events panel

### Step 5: Add Route to App

**File: `src/App.tsx`**

Add the calendar route after email:
```typescript
<Route path="/calendar" element={<Calendar />} />
```

---

## Technical Details

### Event Type Enum
```text
event_type: Meeting, Annual Review, Portfolio Review, Compliance Review, 
            Reminder, Personal, Team Event, Client Call
```

### Color Coding Strategy
- Client Meetings: Teal (brand color)
- Annual Reviews: Purple
- Compliance: Amber
- Personal: Blue
- Team Events: Green

### Calendar View Implementation
Using `date-fns` (already installed) for date manipulation:
- Month view: 6-week grid showing current month
- Week view: 7-day horizontal layout with time slots
- Day view: Single day with hourly time slots
- Agenda view: List of upcoming events

### Event Dialog Features
- Title, description, location fields
- Date/time pickers (using existing Calendar component)
- Client selector dropdown (optional link to client)
- Event type selector
- Color picker
- Reminder settings
- Recurrence options (daily, weekly, monthly)

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/pages/Calendar.tsx` | Main calendar page component |
| `src/hooks/useCalendarEvents.ts` | Data hook for calendar CRUD |

## Files to Modify

| File | Change |
|------|--------|
| `src/App.tsx` | Add `/calendar` route |
| `src/pages/Dashboard.tsx` | Add Calendar to sidebar |
| `src/pages/Clients.tsx` | Add Calendar to sidebar |
| `src/pages/Email.tsx` | Add Calendar to sidebar |
| `src/pages/Tasks.tsx` | Add Calendar to sidebar |
| `src/pages/Insights.tsx` | Add Calendar to sidebar |
| `src/pages/Practice.tsx` | Add Calendar to sidebar |
| `src/pages/ClientDetail.tsx` | Add Calendar to sidebar |

## Database Migration

One migration will create:
- `event_type_enum` - Event type enum
- `event_status_enum` - Event status enum
- `calendar_events` table with all fields
- Indexes for performance
- RLS policies for security
- Trigger for `updated_at`

---

## UI Components Used

All existing components will be leveraged:
- `Card`, `Button`, `Input` from shadcn/ui
- `Sheet` for event details panel
- `Dialog` for event creation/editing
- `Select` for dropdowns
- `Calendar` component for mini calendar
- `Popover` for date pickers
- `Checkbox` for calendar toggles

---

## Summary

This implementation adds a full-featured calendar to the advisor portal, seamlessly integrated with the existing navigation and client management system. The calendar will support event scheduling, client meeting tracking, and team coordination - providing Outlook-like functionality within the portal.

