

## Hide "Request Astute" for Non-South African Jurisdictions

### Change

**File: `src/components/client-detail/Client360ViewTab.tsx`**

The `jurisdiction` variable is already available (line 27). Wrap the separator and "Request Astute" button in both the Risk Products section (lines 406-407) and Medical Aid section (lines 461-462) with a `jurisdiction === "ZA"` conditional so they only render for South African clients.

**Risk Products (lines 405-407):**
```tsx
// Before
<Button variant="link" ...>+ Risk Products</Button>
<span className="text-muted-foreground">|</span>
<Button variant="link" ...>Request Astute</Button>

// After
<Button variant="link" ...>+ Risk Products</Button>
{jurisdiction === "ZA" && (
  <>
    <span className="text-muted-foreground">|</span>
    <Button variant="link" ...>Request Astute</Button>
  </>
)}
```

**Medical Aid (lines 459-462):** Same conditional wrapping.

Two small edits in one file. No database changes.
