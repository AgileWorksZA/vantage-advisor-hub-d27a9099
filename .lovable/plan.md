

## Fix: Bump Post Cache Version to v3

### Root Cause
The localStorage key was bumped to `v2`, but the user's browser likely already wrote posts under the `v2` key *before* the engagement/comment seeding was added to `getDefaultPosts()`. So the cached `v2` data still has empty engagements and comments.

### Fix
A single one-line change in `src/components/mobile/MobileAdvisorProfile.tsx`:

Change the version constant from `"v2"` to `"v3"` to force all browsers to discard the stale cache and reload from `getDefaultPosts()` which now includes full engagement and comment data.

```
const POSTS_DATA_VERSION = "v3";
```

### Technical Details

| File | Change |
|------|--------|
| `src/components/mobile/MobileAdvisorProfile.tsx` | Update `POSTS_DATA_VERSION` from `"v2"` to `"v3"` (line 36) |

This is the only change needed. The `getDefaultPosts()` function already returns posts with 5-8 client engagements and 2-4 comments each.
