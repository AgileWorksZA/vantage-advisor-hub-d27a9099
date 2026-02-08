

# Add "Coming Soon" to Microsoft Sign-In Button

## Change

**File: `src/pages/Auth.tsx`**

Update the "Continue with Microsoft" button to:
- Append "Coming Soon" text in a muted badge/label next to the button text
- Disable the button permanently (not just during loading)
- Apply a reduced opacity style to visually indicate it's unavailable

**Before:**
```tsx
<Button
  variant="outline"
  className="w-full flex items-center justify-center gap-3"
  onClick={handleMicrosoftLogin}
  disabled={loading}
>
  ...
  {loading ? "Signing in..." : "Continue with Microsoft"}
</Button>
```

**After:**
```tsx
<Button
  variant="outline"
  className="w-full flex items-center justify-center gap-3 opacity-60 cursor-not-allowed"
  disabled={true}
>
  <svg ...Microsoft icon... />
  Continue with Microsoft
  <span className="ml-1 text-[10px] uppercase tracking-wide text-muted-foreground font-semibold bg-muted px-1.5 py-0.5 rounded">Coming Soon</span>
</Button>
```

Key details:
- `disabled={true}` replaces `disabled={loading}` so the button is always unclickable
- `onClick` handler is removed since the button is permanently disabled
- `opacity-60` and `cursor-not-allowed` provide clear visual indication
- A small "Coming Soon" badge sits inline after the text, styled with muted background and small uppercase text

