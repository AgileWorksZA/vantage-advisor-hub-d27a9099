

## Remove Account Settings Menu Item

### Change

**File: `src/components/dashboard/UserMenu.tsx`**

Remove the "Account Settings" button block (the `<button>` with the Settings icon and "Account Settings" label) from the menu items section.

Also clean up the related props and handlers:
- Remove `onAccountSettings` from the `UserMenuProps` interface
- Remove the `handleAccountSettings` function
- Remove `onAccountSettings` from the destructured props

This will also simplify all parent components that pass `onAccountSettings` -- they can stop passing it, but since it becomes an unused prop, removing it from the interface is sufficient (TypeScript will flag any remaining references).

| File | Action |
|------|--------|
| `src/components/dashboard/UserMenu.tsx` | Remove Account Settings button, prop, and handler |

