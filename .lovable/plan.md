

## Add Cross-Channel Filter for Messages with Tasks/Opportunities

### What
Add toggle filter buttons in the header bar (next to Date/Filter/Settings/Refresh) that filter messages across all channels (Email, WhatsApp, SMS, Push) to show only those with linked tasks or identified opportunities.

### Approach

**1. Add filter state to `src/pages/Email.tsx`**
- Add `contentFilter` state: `"all" | "has-tasks" | "has-opportunities"`
- Add two toggle buttons in the header bar (between channel tabs and the right-side actions): "Has Tasks" (ListTodo icon) and "Has Opportunities" (Lightbulb icon), styled as active/inactive toggles
- Pass `contentFilter` down to both the email list and the ChatInterface

**2. Filter emails by linked tasks (`src/hooks/useEmails.ts`)**
- Accept optional `contentFilter` param
- When `"has-tasks"`: after fetching emails, query `email_tasks` to get email IDs that have linked tasks, then filter the list to only those
- When `"has-opportunities"`: scan email body content for opportunity keywords (or check if AI insights were previously identified — since opportunities aren't persisted, use body content heuristics: keywords like "opportunity", "recommend", "rebalance", "top-up", "review", "contribution", "switch", "beneficiary")
- Return filtered list

**3. Filter chat conversations (`src/components/email/ChatInterface.tsx`)**
- Accept `contentFilter` prop
- When `"has-tasks"` or `"has-opportunities"`: filter `conversations` list to those whose last message or message history contains task-related or opportunity-related content keywords
- Pass filtered conversations to ConversationList

**4. UI Design**
- Two small pill/toggle buttons in the header: `🔗 Tasks` and `💡 Opportunities`
- Active state uses teal highlight consistent with existing design
- Both can be active simultaneously (AND filter) or independently
- Show count badge on each when active

### Files to Edit
| File | Change |
|------|--------|
| `src/pages/Email.tsx` | Add filter state, toggle buttons in header, pass to children |
| `src/hooks/useEmails.ts` | Add `contentFilter` param, query `email_tasks` junction for task filter, keyword scan for opportunities |
| `src/components/email/ChatInterface.tsx` | Accept and apply `contentFilter` to conversation filtering |

