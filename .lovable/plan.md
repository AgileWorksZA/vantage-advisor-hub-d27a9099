

## Refresh Stale Post Data with Engagements and Comments

### Problem
The `getDefaultPosts()` function already seeds all 3 demo posts with client engagements and comments. However, users who previously visited the advisor profile have older post data cached in localStorage -- without the `engagements` and `commentsList` fields. Since the app loads from localStorage first, these users never see the new enriched data.

### Solution
Add a localStorage version key so that when the seeded data structure changes, stale caches are automatically cleared and replaced with the updated defaults.

### Changes

**`src/components/mobile/MobileAdvisorProfile.tsx`**

1. Add a version constant at the top of the file:
```text
const POSTS_DATA_VERSION = "v2";
```

2. Update the `getPostsKey` function to include the version:
```text
function getPostsKey(region: string) {
  return `vantage-advisor-posts-${region}-${POSTS_DATA_VERSION}`;
}
```

This ensures that any previously cached posts (stored under the old key without a version suffix) are ignored, and the new defaults -- complete with 5-8 client engagements and 2-4 comments per post -- are loaded instead.

### No other files are affected
The `MobilePostDetailView.tsx` component and all data interfaces are already fully implemented and correctly render engagements and comments.

| File | Action |
|------|--------|
| `src/components/mobile/MobileAdvisorProfile.tsx` | Update -- add version suffix to localStorage key to bust stale caches |

