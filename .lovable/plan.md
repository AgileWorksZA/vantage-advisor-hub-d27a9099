

## Add Digital Consent Declaration Dialog

When clicking "View and accept digital consent" in the Adviser Consent section, show a dialog popup with the full consent declaration text.

### Behavior
- If adviser consent is **not yet completed**: show "Accept" and "Cancel" buttons at the bottom
- If adviser consent is **already completed** (current demo state): show only the X close button, no action buttons

### Changes

**File: `src/components/client-detail/AstuteRequestView.tsx`**

1. Add `Dialog` imports from `@/components/ui/dialog`
2. Add state: `const [showConsentDialog, setShowConsentDialog] = useState(false)`
3. Add a prop or state to track adviser consent status (currently hardcoded as "Completed" in demo data, so we can use a state variable `adviserConsentCompleted` defaulting to `true`)
4. Wire the "View and accept digital consent" button (line 204) to open the dialog
5. Add the Dialog component with:
   - Title: "Astute Digital Consent Declaration"
   - Body: The full legal declaration text (from the reference image), including paragraphs about:
     - Authorised user declaration
     - Information warranty
     - Long-Term Insurance Act purposes
     - Indemnification clause
     - FSCA verification authorization
   - Footer: Conditionally render "Accept" + "Cancel" buttons only when `adviserConsentCompleted` is `false`; otherwise just the X close button suffices

### Scope
- 1 file modified: `AstuteRequestView.tsx`
- No database or backend changes

