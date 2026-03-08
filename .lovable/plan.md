

## Fix Sticky Header Z-Index

The `<thead>` element on line 386 has `sticky top-0` but no z-index, so scrolling table rows render on top of/behind the header.

### Change
In `src/pages/Email.tsx` line 386, add `z-10` to the `<thead>` class:
```
bg-muted/30 sticky top-0  →  bg-muted/30 sticky top-0 z-10
```

Single line change, one file.

