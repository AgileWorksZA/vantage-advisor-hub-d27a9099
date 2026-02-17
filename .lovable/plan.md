

## Request Astute Screen

Create an "Astute Request" full-screen view that replaces the Products tab content (same pattern as Quote Wizard), with a scrollable left panel and a sticky progress tracker on the right.

### Layout (mirrors QuoteWizardDialog.tsx)

```text
+--------------------------------------------------+------------------+
|  ASTUTE                                          |  ASTUTE          |
|  ============================================    |  Astute request  |
|                                                  |    v Adviser...  |
|  1  Adviser Consent              (Completed)     |    v Client...   |
|     View and accept digital...   Accepted on:... |    v Astute data |
|                                                  |      - Risk ben  |
|  2  Client Consent               (Completed)     |      - Medical   |
|     ID / Cell / Email fields                     |                  |
|     Checkbox + Request consent + Update Astute   |  [Back]  [Save]  |
|     Consent received / Valid until               |                  |
|                                                  +------------------+
|  3  Astute Data Request          (Complete)      |
|     (+) Risk Benefits      [Import all] Recv     |
|     (+) Medical Aid        [Import all] Recv     |
+--------------------------------------------------+
```

### New File: `src/components/client-detail/AstuteRequestView.tsx`

**Props**: `onClose: () => void`

**Sections**:

1. **Top Progress Bar** - Horizontal step indicators: Adviser Consent, Client Consent, Astute Data Request, Risk Benefits, Medical Aid (each with status badges like "Accepted", "Complete", "Received")

2. **Section 1: Adviser Consent** - "Completed" badge, link "View and accept digital consent", accepted date/time

3. **Section 2: Client Consent** - "Completed" badge, read-only fields (Identification, Cell number, E-mail), "Update client details" link, checkbox "I agree the above details are correct and I have read the disclaimer", "Request consent" outlined button, info banner about SMS, "Update Astute" teal button, consent received/valid until dates

4. **Section 3: Astute Data Request** - "Complete" badge, two expandable sub-sections:

   **Risk Benefits** (expandable with + icon):
   - Header row: "Import all" button + "Received 13/13" status
   - When expanded: info banner about replacing data, then provider cards:
     - Each card: provider name (teal link) + "Data Received" date + "Latest Request ID"
     - Expandable chevron per card
     - When card expanded: table with columns: Plan name, Policy number, Payment amount, Payment due date, Paid to date, Termination date + View/Import buttons
     - Some rows show "Imported" badge, others show "Import" button
     - Error cards show amber warning with error message

   **Medical Aid** (expandable with + icon):
   - Header row: "Import all" button + "Received 1/1" status
   - When expanded: provider card with scheme details table (Medical scheme name, Plan name, Membership number, Indicative premium, Date data received, Policy active) + Import status
   - "Medical Aid Members" sub-table: Member type description, Identification number, Initials, Full name, Surname, Date of birth, Member effective from, Contribution

5. **Right Sticky Panel** (same pattern as QuoteWizard):
   - Title: "ASTUTE" with "Complete" badge
   - Checklist: Astute request with green checkmarks for each step
     - Adviser consent
     - Client consent
     - Astute data request (with indented sub-items: Risk benefits, Medical aid)
   - "Back" button (teal outlined) + "Save and Exit" button (teal filled)

**Demo Data**: Hardcoded sample providers (ABSA Life, Sanlam Namibia, Assupol, etc.) with sample plan rows and a Discovery Health medical aid entry with member data.

### Edit: `src/components/client-detail/Client360ViewTab.tsx`

- Add state: `const [showAstuteRequest, setShowAstuteRequest] = useState(false);`
- Add import for `AstuteRequestView`
- Add conditional render block (same pattern as other forms):
  ```
  if (showAstuteRequest) {
    return <AstuteRequestView onClose={() => setShowAstuteRequest(false)} />;
  }
  ```
- Wire both "Request Astute" buttons (line 486 in Risk Products, line 545 in Medical Aid) to `{ setShowAstuteRequest(true); scrollToTop(); }`

### Files Changed
| File | Action |
|------|--------|
| `src/components/client-detail/AstuteRequestView.tsx` | Create |
| `src/components/client-detail/Client360ViewTab.tsx` | Edit - add state + wiring |

### Technical Notes
- Layout uses `flex` with sticky right panel (identical to QuoteWizardDialog lines 702-778)
- Expandable sections use existing Collapsible component
- All demo/hardcoded data, no database changes
- Only visible for ZA jurisdiction (already gated by existing button visibility)

