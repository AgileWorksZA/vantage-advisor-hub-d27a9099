

## Post Detail View with Client Engagement and Comments

### Overview
Add the ability to tap on any post in the advisor feed to open a full-screen detail view showing:
- The full post content
- A list of clients who have read and/or liked the post (with avatars and status indicators)
- A comments thread with the ability to reply

All data is demo/localStorage-based, consistent with the existing profile implementation.

### Data Model Changes

**Extend `AdvisorPost` interface** to include engagement and comment data:

```typescript
interface PostEngagement {
  clientName: string;
  clientInitials: string;
  read: boolean;
  liked: boolean;
  readAt?: string;
}

interface PostComment {
  id: string;
  authorName: string;
  authorInitials: string;
  authorType: "client" | "advisor";
  content: string;
  timestamp: string;
}
```

Add `engagements` and `commentsList` arrays to each `AdvisorPost`. Default demo posts will be pre-seeded with sample engagement data from fictional client names (e.g., "James van der Berg", "Sarah Mitchell") and sample comments.

### New Component

**`src/components/mobile/MobilePostDetailView.tsx`**

A full-screen overlay (same pattern as `MobileAdvisorProfile`) with:

**Header:**
- Back arrow to return to profile
- Post type badge

**Post content section:**
- Advisor avatar, name, timestamp
- Full post text
- Like button (functional)

**Client engagement section ("Who saw this"):**
- Scrollable list of client rows
- Each row: initials avatar, client name, status icons
  - Eye icon = read (with timestamp)
  - Heart icon (filled) = liked
- Summary line: "12 of 45 clients read -- 8 liked"

**Comments section:**
- Thread of comments, each showing: initials avatar, name, timestamp, content
- Client comments show a "Client" badge, advisor comments show "Advisor" badge
- Reply input at the bottom (textarea + Send button)
- New replies are added to the post and persisted in localStorage

### Changes to Existing File

**`src/components/mobile/MobileAdvisorProfile.tsx`**

- Add `selectedPost` state to track which post is tapped
- Make each post card clickable (wrap in a button/div with onClick)
- When a post is selected, render `MobilePostDetailView` as a full-screen overlay
- Pass back handler to return to profile feed

### Files Summary

| File | Action |
|------|--------|
| `src/components/mobile/MobilePostDetailView.tsx` | New -- full-screen post detail with engagement list and comments thread |
| `src/components/mobile/MobileAdvisorProfile.tsx` | Update -- add click handler on posts, selectedPost state, render detail overlay |

### Demo Data Seeding

Each of the 3 default posts will include:
- 5-8 client engagements (mix of read-only and read+liked)
- 2-4 comments (mix of client and advisor replies)

Client names will be drawn from the existing demo client pool where possible for consistency.

