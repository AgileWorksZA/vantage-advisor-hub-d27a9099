

## Reduce Font Size in Allocation % Fields

### Change

**File: `src/components/client-detail/ClientPerformanceTab.tsx`** (line 640)

Reduce the input font size from `text-[11px]` to `text-[10px]` and widen slightly from `w-16` to `w-[4.5rem]` so the one-decimal values (e.g. `33.3`) display comfortably without clipping.

```
Before: className="w-16 h-6 text-[11px] text-right"
After:  className="w-[4.5rem] h-6 text-[10px] text-right"
```

Single line change, no other files affected.

