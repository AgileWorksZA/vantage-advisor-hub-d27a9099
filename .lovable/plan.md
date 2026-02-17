
## Scroll to Top When Opening Product Forms

When any of the "+" product buttons are clicked, the page stays at its current scroll position, which can leave the user looking at the bottom of the form. The fix is to add `window.scrollTo(0, 0)` when each form state is set to `true`.

### Change

**File: `src/components/client-detail/Client360ViewTab.tsx`**

Update the four button `onClick` handlers to also scroll to the top:

- `+ Medical Aid` button (~line 534): `onClick={() => { setShowMedicalAidForm(true); window.scrollTo(0, 0); }}`
- `+ Risk Products` button (~line 475): `onClick={() => { setShowRiskProductForm(true); window.scrollTo(0, 0); }}`
- `+ Short Term` button (~line 425): `onClick={() => { setShowShortTermForm(true); window.scrollTo(0, 0); }}`
- `+ Will` button (~line 375): `onClick={() => { setShowWillForm(true); window.scrollTo(0, 0); }}`

### Scope
- 1 file, 4 lines changed
