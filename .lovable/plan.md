

## Remove "Request Astute" Links for Non-ZA Jurisdictions

### Overview
Hide the "Request Astute" link buttons in the Risk Products and Medical Aid sections for all jurisdictions except South Africa (ZA).

### Changes

**File: `src/components/client-detail/Client360ViewTab.tsx`**

#### Risk Products section (around lines 405-408)
Wrap the separator and "Request Astute" button in a conditional that checks `jurisdiction === "ZA"`:
```tsx
<Button variant="link" ...>+ Risk Products</Button>
{jurisdiction === "ZA" && (
  <>
    <span className="text-muted-foreground">|</span>
    <Button variant="link" ...>Request Astute</Button>
  </>
)}
```

#### Medical Aid section (around lines 460-462)
Same conditional wrapping for the Medical Aid "Request Astute" button:
```tsx
<Button variant="link" ...>+ Medical Aid</Button>
{jurisdiction === "ZA" && (
  <>
    <span className="text-muted-foreground">|</span>
    <Button variant="link" ...>Request Astute</Button>
  </>
)}
```

### Files Changed
| File | Change |
|------|--------|
| `src/components/client-detail/Client360ViewTab.tsx` | Conditionally render "Request Astute" links only when `jurisdiction === "ZA"` |

