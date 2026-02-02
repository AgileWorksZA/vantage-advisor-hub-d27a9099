

# Plan: Add New Employee Detail Sections to Practice Management

## Overview
This plan adds 4 new sections to the employee settings menu in Practice Management, plus updates the existing Activity Log tab with enhanced data. These sections will appear in the left sidebar when viewing an employee's record.

---

## Current State
The Practice page (`src/pages/Practice.tsx`) currently has these tabs in the employee detail view:
- Profile
- Preferences  
- Communication
- Integrations
- VoIP
- Referrals
- Mailbox
- Activity Log

---

## Proposed Changes

### 1. Add "Roles" Tab
Based on the screenshot provided, this tab will:
- Display a numbered table of assigned roles for the employee
- Include a dropdown to add new roles from a predefined list
- Show 14 available role types: Accountant, Administrator, Assistant, Campaign Support, Client, Compliance, Compliance PSL, Financial Adviser, Financial Planning Support, Guest, Head Office Support, Marketing, Provider, Regional Officer
- Allow removal of roles via an "X" button per row
- Include a settings gear icon for role configuration

### 2. Add "Teams" Tab  
Based on the "myPractice Teams" screenshot, this tab will:
- Show teams the employee belongs to in a table format
- Columns: #, Name, Office, Role, Leader, Is Primary, ID
- Include toolbar with: "Add new" button, "Reset" button, search field, settings gear
- Show item count (e.g., "6 items")
- Allow edit (pencil icon) and delete (X) actions per row
- Mark primary team membership with a checkmark indicator

### 3. Add "Broker Codes" Tab
Based on the screenshot provided, this tab will:
- Display broker/provider codes linked to the employee
- Columns: #, Provider, Code, House code, Umbrella provider, Is primary, For finance use only, Income split %, Asset split %, ID
- Show info message: "Broker codes may only be added from iBase. If you would like to add one, please contact the iBase support staff."
- Include toolbar with: item count, Reset button, search field, settings gear, "Inactive" toggle
- Show checkmarks (green) and X marks (red) for boolean fields
- Display percentage values for split columns

### 4. Enhance "Communication" Tab
Update the existing Communication tab to add:
- **Notification Activation Section**: Grouped toggles for various notification types the user wants to receive
- **Email Signature Section**: 
  - Rich text or textarea for default mail signature
  - Preview of the signature
  - Save/reset functionality

### 5. Enhance "Activity Log" Tab (Event Log)
Based on the screenshot provided, update the table with:
- Additional columns: Client (clickable), Note, Active person
- Full column set: #, Date, Type, Subtype, Client, Entity name, Note, Active person, ID
- Pagination controls: first, previous, page number input, next, last
- Page indicator (e.g., "Page 1 of 1244")
- Sample data from the screenshot including:
  - Add product, iComply created, Consent created, Last review date updated, Note added, Person updated, Banking details viewed, Advice process: document download events
- Export button functionality

---

## Technical Details

### File Changes

#### `src/pages/Practice.tsx`
1. **Update `settingsTabs` array** (line ~39):
   ```typescript
   const settingsTabs = [
     { id: "profile", label: "Profile", icon: UserIcon },
     { id: "roles", label: "Roles", icon: ShieldCheck },        // NEW
     { id: "teams", label: "Teams", icon: Users2 },             // NEW
     { id: "broker-codes", label: "Broker Codes", icon: Building }, // NEW
     { id: "preferences", label: "Preferences", icon: Settings },
     { id: "communication", label: "Communication", icon: MessageSquare },
     { id: "integrations", label: "Integrations", icon: CreditCard },
     { id: "voip", label: "VoIP", icon: Phone },
     { id: "referrals", label: "Referrals", icon: Shield },
     { id: "mailbox", label: "Mailbox", icon: Mail },
     { id: "activity", label: "Activity Log", icon: Activity },
   ];
   ```

2. **Add new icon imports** from `lucide-react`:
   - `ShieldCheck` for Roles
   - `Users2` for Teams  
   - `Building` for Broker Codes
   - `ChevronLeft`, `ChevronRight`, `ChevronsLeft`, `ChevronsRight` for pagination

3. **Add sample data constants** for roles, teams, broker codes, and activity log entries

4. **Create `RolesTab` component**:
   - Role assignment table with edit/delete capability
   - "Add new role" dropdown selector
   - Role list from predefined options

5. **Create `TeamsTab` component**:
   - Teams table with columns matching screenshot
   - Add/Edit/Delete functionality
   - Search and filter controls

6. **Create `BrokerCodesTab` component**:
   - Provider codes table
   - Read-only indication with info message
   - Inactive filter toggle

7. **Update `CommunicationTab` component**:
   - Add email signature textarea with preview
   - Add notification preference toggles

8. **Update `ActivityLogTab` component**:
   - Add Client column (between Subtype and Entity name)
   - Add Note column
   - Rename "Active person" column appropriately
   - Add ID column
   - Add pagination component with page controls
   - Populate with sample data from the screenshot

9. **Update `PersonnelSettings` render section** to include new tabs

---

## Sample Data to Add

### Roles Data
```typescript
const availableRoles = [
  "Accountant", "Administrator", "Assistant", "Campaign Support", 
  "Client", "Compliance", "Compliance PSL", "Financial Adviser",
  "Financial Planning Support", "Guest", "Head Office Support", 
  "Marketing", "Provider", "Regional Officer"
];
```

### Teams Data
```typescript
const teamsData = [
  { id: 1, name: "Danie Jordaan Financial Planning LTD", office: "Tygerwaterfront The Edge", role: "Financial planner", leader: "Jordaan, Danie", isPrimary: true, dbId: 629 },
  { id: 2, name: "Danie Jordaan Financial Planning LTD", office: "Tygerwaterfront The Edge", role: "Assistant", leader: "Jordaan, Danie", isPrimary: true, dbId: 629 },
  // ...more entries
];
```

### Broker Codes Data  
```typescript
const brokerCodesData = [
  { id: 1, provider: "PSG Asset Management Administration Services Ltd", code: "DDDD", houseCode: "PSG Asset Management", umbrellaProvider: "", isPrimary: true, forFinanceOnly: false, incomeSplit: 100, assetSplit: 100, dbId: 194696 },
  // ...more entries from screenshot
];
```

### Activity Log Data
```typescript
const activityLogData = [
  { id: 1, date: "2026-01-19 15:17:33", type: "Add product", subtype: "", client: "Botha, Karel", entityName: "PSG Securities Ltd Local - Share portfolio (Local)", note: "", activePerson: "Jordaan, Danie", dbId: 47159690 },
  { id: 2, date: "2026-01-14 12:10:10", type: "iComply created", subtype: "Two step", client: "Botha, Karel", entityName: "FAIS Control for Karel Botha on 2026-01-14", note: "", activePerson: "Jordaan, Danie", dbId: 47105064 },
  // ...20 entries from screenshot
];
```

---

## UI Components Needed

All components will use existing UI primitives:
- `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` from `@/components/ui/table`
- `Button`, `Input`, `Select`, `Switch`, `Checkbox` from existing UI
- `Textarea` for email signature
- Custom pagination controls using Button components

---

## Visual Styling
- Maintain teal accent color: `hsl(180, 70%, 45%)` for active states
- Green checkmark: `text-green-500` 
- Red X mark: `text-red-500`
- Clickable links in teal color for client names and provider names
- Gray background for table headers: `bg-muted/50`

