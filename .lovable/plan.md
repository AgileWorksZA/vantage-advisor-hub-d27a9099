
## Rename "Mobile" to "Adviser App" and Add a New "Client App"

### Overview

The current Web/Mobile toggle will become a three-way selector: **Web**, **Adviser App**, and **Client App**. The existing mobile experience becomes the "Adviser App" (unchanged functionality, just renamed). A brand-new "Client App" will be created with its own splash screen, bottom tab navigation, and client-facing content derived from the client dashboard widgets.

### What the Client App will include

The Client App ("ClientFirst") is a mobile-frame experience similar to AdvisorFirst but designed from the client's perspective. It will feature:

**Bottom tabs:**
1. **Home** -- Portfolio summary (total AUM, asset allocation donut, valuation change sparkline), upcoming meetings with adviser, and key dates/milestones
2. **Portfolio** -- Holdings breakdown, geographic diversification map, performance chart (reusing data generators from `ClientDashboardTab`)
3. **Messages** -- Simplified chat interface to communicate with their adviser (mock WhatsApp-style thread)
4. **Documents** -- List of outstanding documents and uploaded docs (from `getOutstandingDocsForRegion` and client document types)
5. **More** -- Profile info, adviser contact card, settings

**Header:** "ClientFirst" branding (similar gradient style to "AdvisorFirst"), client avatar, notification bell

**Splash screen:** "ClientFirst" with tagline "Your Wealth Companion" and Vantage branding

**Client selection:** Since this is a demo, a client picker will appear on first load letting the user choose which client to impersonate (from the clients table).

### Technical Details

**File: `src/contexts/AppModeContext.tsx`**
1. Change `AppMode` type from `"web" | "mobile"` to `"web" | "adviser" | "client"`
2. Update storage key handling: `"mobile"` stored value maps to `"adviser"` for backward compat
3. Show splash for both `"adviser"` and `"client"` modes

**File: `src/components/dashboard/UserMenu.tsx`**
1. Replace the two-button Web/Mobile toggle with a three-button toggle: Web | Adviser App | Client App
2. Update `setMode("mobile")` calls to `setMode("adviser")`
3. Add `setMode("client")` for the Client App button
4. Use `Smartphone` icon for Adviser App, `User` icon for Client App

**File: `src/components/mobile/MobileSettingsMenu.tsx`**
1. Update Web/Mobile toggle to three-way: Web | Adviser | Client
2. Replace label "Mobile" with "Adviser"

**File: `src/App.tsx`**
1. Import new `ClientApp` and `ClientSplashScreen` components
2. Update the mode check: `mode === "adviser"` renders MobileApp (renamed from `mobile`), `mode === "client"` renders ClientApp
3. Keep the phone-frame wrapper for both adviser and client modes

**New file: `src/components/client-app/ClientSplashScreen.tsx`**
- Similar to `MobileSplashScreen` but branded "ClientFirst" with tagline "Your Wealth Companion"
- Same gradient background and loading bar animation

**New file: `src/components/client-app/ClientApp.tsx`**
- Main client app shell with header ("ClientFirst" branding), bottom tab bar, and content area
- Tabs: Home, Portfolio, Messages, Documents, More
- On first load, shows a client picker dialog (fetches from `clients` table) so user can choose which client to impersonate
- Stores selected client ID in localStorage (`vantage-client-app-selected-client`)
- Passes client data down to all tab components

**New file: `src/components/client-app/ClientHomeTab.tsx`**
- Portfolio summary card (total AUM, asset allocation pie chart using ECharts)
- Valuation change with sparkline (reusing `generateClient360Data`)
- Upcoming meetings section (mock data: next adviser meeting date/time)
- Key dates widget (birthday, policy renewals, review dates)
- Quick action buttons: "Message Adviser", "Upload Document", "Request Meeting"

**New file: `src/components/client-app/ClientPortfolioTab.tsx`**
- Holdings breakdown table with fund names, values, allocation percentages
- Asset allocation donut chart (ECharts)
- Geographic diversification mini-map (reusing `WorldMapSVG`)
- Performance sparkline for selected period (6m/1y/3y/5y toggle)

**New file: `src/components/client-app/ClientMessagesTab.tsx`**
- Simple chat thread with mock conversation between client and adviser
- Message input at bottom (non-functional, demo only)
- Shows adviser name/avatar at top
- Recent messages with timestamps, read receipts

**New file: `src/components/client-app/ClientDocumentsTab.tsx`**
- Outstanding documents section (using `getOutstandingDocsForRegion`)
- Uploaded documents list with status badges (Pending, Approved, Expired)
- Upload button (non-functional demo)

**New file: `src/components/client-app/ClientMoreTab.tsx`**
- Client profile summary (name, contact details, ID number)
- Adviser contact card with call/email actions
- Dark mode toggle
- Switch back to Web/Adviser mode
- Sign out

**New file: `src/components/client-app/ClientPickerDialog.tsx`**
- Modal dialog shown on first launch of client app
- Fetches clients from database, displays as searchable list
- User selects a client to "impersonate" for the demo
- Stores selection in localStorage

### Files to Create
- `src/components/client-app/ClientSplashScreen.tsx`
- `src/components/client-app/ClientApp.tsx`
- `src/components/client-app/ClientHomeTab.tsx`
- `src/components/client-app/ClientPortfolioTab.tsx`
- `src/components/client-app/ClientMessagesTab.tsx`
- `src/components/client-app/ClientDocumentsTab.tsx`
- `src/components/client-app/ClientMoreTab.tsx`
- `src/components/client-app/ClientPickerDialog.tsx`

### Files to Edit
- `src/contexts/AppModeContext.tsx`
- `src/App.tsx`
- `src/components/dashboard/UserMenu.tsx`
- `src/components/mobile/MobileSettingsMenu.tsx`
- `src/components/mobile/MobileApp.tsx` (update "AdvisorFirst" header text reference to match rename, update mode references from `"mobile"` to `"adviser"`)
