

## Remove Navigation Link from Command Center Button

### Change

**`src/pages/Dashboard.tsx` (line 256–264)**

Replace the `<Button>` element with a plain `<div>`, removing the `onClick={() => navigate("/command-center")}` handler and button interactivity. Keep the icon and styling intact.

```tsx
// Before
<Button variant="ghost" size="icon" className="w-10 h-10 text-white/80 hover:bg-white/10 mb-4"
  onClick={() => navigate("/command-center")} title="Practice Overview">
  <img src={commandCenterIcon} alt="Command Center" className="w-5 h-5" />
</Button>

// After
<div className="w-10 h-10 flex items-center justify-center text-white/80 mb-4" title="Practice Overview">
  <img src={commandCenterIcon} alt="Command Center" className="w-5 h-5" />
</div>
```

### Build Errors (pre-existing)

The 5 `Cannot find namespace 'NodeJS'` errors are unrelated to this change — they need `/// <reference types="node" />` added or `NodeJS.Timeout` replaced with `ReturnType<typeof setTimeout>` in each affected file. I'll fix those in the same pass.

