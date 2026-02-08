

# Web/Mobile Mode Toggle with Mobile App Experience

## Overview
Add a Web/Mobile toggle to the User Menu (below the email display), which switches between the current desktop web CRM and a dedicated mobile advisor companion app experience. When "Mobile" is selected, a branded loading screen appears for 3 seconds, then transitions to a mobile-optimized interface with key advisor tools.

## What You Will See

### 1. User Menu Toggle
- A segmented "Web | Mobile" toggle appears below `demo@vantage.co.za` in the user menu popover
- "Web" is selected by default, showing the current CRM interface
- Tapping "Mobile" triggers the transition

### 2. Loading Screen (3 seconds)
- Full-screen branded splash with a gradient background (teal-to-dark-blue, matching Vantage brand)
- **"AdvisorFirst"** displayed as a styled logo -- bold, modern typography with an accent gradient on "First" to echo the Vantage visual identity
- Tagline: **"Your Advice Companion (TM)"** in lighter text below
- **"powered by Vantage"** in smaller text at the bottom with the Vantage logo
- An animated loading indicator (pulsing ring or progress bar)

### 3. Mobile App Interface
A phone-style layout rendered within the browser, featuring:

- **Bottom Tab Navigation** with 5 tabs: Today, Clients, Tasks, Insights, AI
- **Today Tab (Home)**: Shows today's appointments from the calendar, quick stats (tasks due, upcoming meetings), and recent activity
- **Clients Tab**: Scrollable list of clients with search, tap to view a mobile-friendly client profile card
- **Tasks Tab**: Task list with priority badges, status indicators, tap to view/update
- **Insights Tab**: Key practice metrics in card format (AUM, open tasks, compliance alerts)
- **AI Tab**: Full-screen chat interface reusing the existing GlobalAIChat logic
- **Top header bar** with AdvisorFirst branding, notification bell, and a "back to web" button

All data comes from the same hooks (useCalendarEvents, useTasks, useClients, etc.) so everything syncs with the web CRM.

## Technical Details

### New Files to Create

| File | Purpose |
|------|---------|
| `src/contexts/AppModeContext.tsx` | Context provider storing "web" or "mobile" mode, persisted in localStorage |
| `src/components/mobile/MobileSplashScreen.tsx` | 3-second branded loading screen with AdvisorFirst logo and animation |
| `src/components/mobile/MobileApp.tsx` | Main mobile shell with bottom tab navigation and header |
| `src/components/mobile/MobileTodayTab.tsx` | Today's appointments, quick stats, and activity feed |
| `src/components/mobile/MobileClientsTab.tsx` | Searchable client list with mobile profile cards |
| `src/components/mobile/MobileTasksTab.tsx` | Task list with tap-to-update functionality |
| `src/components/mobile/MobileInsightsTab.tsx` | Key metrics cards (AUM, tasks, compliance) |
| `src/components/mobile/MobileAITab.tsx` | Full-screen AI chat interface |
| `src/components/mobile/MobileClientProfile.tsx` | Individual client detail card for mobile |

### Files to Modify

| File | Change |
|------|--------|
| `src/components/dashboard/UserMenu.tsx` | Add Web/Mobile segmented toggle below email |
| `src/App.tsx` | Wrap routes with AppModeContext; conditionally render MobileApp or web routes |

### Architecture

The AppModeContext will provide:
- `mode`: "web" or "mobile"
- `setMode(mode)`: switches mode and persists to localStorage
- `showSplash`: boolean to control splash screen visibility

When mode switches to "mobile":
1. `showSplash` is set to `true`
2. MobileSplashScreen renders for 3 seconds
3. After timeout, `showSplash` becomes `false`, MobileApp renders
4. MobileApp uses the same data hooks as the web CRM

When mode switches back to "web":
1. Normal web routes render immediately (no splash needed)

### Mobile UI Specifications

**Bottom Navigation Bar:**
- 5 tabs: Calendar (today icon), Users (clients), CheckSquare (tasks), BarChart (insights), Sparkles (AI)
- Active tab highlighted with teal accent color
- Fixed at bottom, 56px height

**Mobile Header:**
- "AdvisorFirst" text logo on the left
- Notification bell and "Web" switch button on the right
- 48px height, sticky top

**Cards and Lists:**
- Full-width cards with rounded corners and subtle shadows
- Pull-to-refresh pattern on list views
- Tap interactions instead of hover states

### Data Sync
All mobile views use the existing hooks:
- `useCalendarEvents` for appointments
- `useTasks` / `useTasksEnhanced` for task management
- `useClients` for client profiles
- `useRegion` for regional data and insights
- The AI chat reuses the same `GlobalAIChat` message handling

Any changes made in mobile mode (task updates, notes) will appear in the web CRM on the next view, and vice versa.

