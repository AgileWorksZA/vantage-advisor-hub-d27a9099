

## Combine CRM and Details into a Single "Details" Tab

### Problem
The client detail page has two separate tabs -- "Details" and "CRM" -- that serve similar purposes (editing client profile data). The **Nationality** field is duplicated across both. Having two tabs adds unnecessary navigation and a confusing split of related information.

### Duplicate Field
- **Nationality**: exists in Details (Identification section) and CRM (Demographics section). The merged tab will keep it only in the Identification section.

### Solution
Merge all CRM content into the Details tab, remove the duplicate Nationality field from the CRM section, and combine both save handlers into a single unified save.

### New Layout (Single "Details" Tab)

```text
[Save changes] [Download contact]

Left Column:                          Right Column:
+---------------------------+         +---------------------------+
| Identification details    |         | Contact details           |
| (person type, ID, pass-   |         | (phone numbers, email,    |
|  port, country, gender,   |         |  social media)            |
|  title, names, DOB, age,  |         +---------------------------+
|  nationality)             |         | Client preferences        |
+---------------------------+         | (preferred contact/phone/ |
| Demographics              |         |  email, OTP, doc password)|
| (language, race, religion,|         +---------------------------+
|  smoker, professional,    |         | Newsletter subscriptions  |
|  profession, occupation,  |         +---------------------------+
|  industry, disability,    |         | Alternative adviser       |
|  hybrid client)           |         +---------------------------+
+---------------------------+         | Team Related details      |
| Sport interests           |         | (employer, wealth mgr)    |
| (checkbox grid)           |         +---------------------------+
+---------------------------+         | Advisor Related details   |
                                      +---------------------------+
```

### Changes

**1. `src/components/client-detail/ClientDetailsTab.tsx`** -- Merge CRM content in

- Expand `formData` state to include all CRM fields (language, race, religion, is_smoker, is_professional, is_hybrid_client, profession, occupation, industry, disability_type, preferred_contact, preferred_phone, preferred_email, otp_delivery_method, sports_interests)
- Remove the duplicate Nationality from the CRM section (keep it in Identification)
- Add the CRM sections after the existing cards:
  - Demographics card (left column, after Identification)
  - Client preferences card (right column, after Contact details)
  - Newsletter subscriptions card
  - Alternative adviser card
  - Team Related details card
  - Advisor Related details card
  - Sport interests card (full width, at bottom)
- Merge save logic: the single `handleSave` sends all fields (both Details + CRM) in one update call
- Add Checkbox import for smoker/professional/hybrid/sports toggles
- Update `handleChange` to support `string | boolean | string[]` values (from CRM's handler)

**2. `src/pages/ClientDetail.tsx`** -- Remove CRM tab

- Remove the `ClientCRMTab` import
- Remove `{ value: "crm", label: "CRM" }` from the tabs array
- Remove the `<TabsContent value="crm">` block
- The "Details" tab now covers everything

**3. `src/components/client-detail/ClientCRMTab.tsx`** -- No longer needed

- This file becomes unused after the merge. It can be deleted.

### Technical Notes

- The `handleChange` function in Details currently only accepts `string`. It needs to be updated to accept `string | boolean | string[]` to handle checkboxes and the sports array.
- The CRM save logic with DB constraint validation (preferred_contact must be Email/Phone/SMS/Post, etc.) will be folded into the Details save handler.
- The `useEffect` that syncs form data from the `client` prop will also include the CRM fields.
- Three files touched: `ClientDetailsTab.tsx` (major edit), `ClientDetail.tsx` (minor edit), `ClientCRMTab.tsx` (delete).

