

## Add Click-to-Navigate on Family Tree Member Nodes

### What Changes

Clicking a household member node in the Family Tree widget will navigate to that member's client detail page -- but only if the member is linked to an existing client record (has a `relatedClientId`).

### File: `src/components/client-detail/FamilyTreeWidget.tsx`

1. Import `useNavigate` from `react-router-dom`
2. Add `relatedClientId` to the `allMembers` mapping (sourced from `f.relatedClientId` / `b.relatedClientId`)
3. Extend `TreeNode` props with optional `onClick` and `clickable` boolean
4. When `clickable` is true, add `cursor-pointer` styling and a hover ring effect to the avatar circle
5. Wrap the node in a clickable container that calls `navigate(`/clients/${relatedClientId}`)` on click
6. Members without a `relatedClientId` remain non-clickable (no hover effect, default cursor)
7. The main client node is never clickable (user is already on that page)

### Visual Behavior
- Clickable nodes get `cursor-pointer`, `hover:ring-2 hover:ring-primary/40` on the avatar, and `hover:text-primary` on the name
- Non-clickable nodes (no linked client) remain as-is with no interaction cues
