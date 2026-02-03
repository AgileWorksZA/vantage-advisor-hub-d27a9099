

# AI Advisor Assistant - Growth & De-risking Hub

## Overview

Transform the current AI Advisor Assistant page into a comprehensive opportunities management and project tracking system. The hub will help advisors identify, organize, and track growth opportunities and de-risking initiatives through intelligent project-based workflows.

---

## New Architecture

The expanded screen will consist of three main sections:

1. **Hero Metrics Dashboard** - High-level impact and opportunity summary
2. **Opportunity Categories** - Enhanced insight cards with new project creation capability
3. **Projects Tracker** - Project-based opportunity and task management with progress visualization

---

## Database Schema

### New Tables Required

| Table | Purpose |
|-------|---------|
| `opportunity_projects` | Main project container for grouping opportunities |
| `project_opportunities` | Junction table linking clients/opportunities to projects |
| `project_tasks` | Tasks within projects with SLA tracking |

#### `opportunity_projects` table

```sql
CREATE TABLE opportunity_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,
  project_type TEXT NOT NULL DEFAULT 'growth', -- 'growth', 'derisking', 'migration', 'consolidation'
  status TEXT NOT NULL DEFAULT 'Active', -- 'Active', 'On Hold', 'Completed', 'Cancelled'
  target_revenue NUMERIC DEFAULT 0,
  realized_revenue NUMERIC DEFAULT 0,
  target_date DATE,
  sla_days INTEGER DEFAULT 30,
  region_code TEXT NOT NULL DEFAULT 'ZA', -- ZA, AU, CA, GB, US
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ
);
```

#### `project_opportunities` table

```sql
CREATE TABLE project_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  project_id UUID NOT NULL REFERENCES opportunity_projects(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id),
  opportunity_type TEXT NOT NULL, -- 'upsell', 'cross-sell', 'migration', 'platform', 'at-risk'
  client_name TEXT NOT NULL,
  current_value NUMERIC DEFAULT 0,
  potential_revenue NUMERIC DEFAULT 0,
  confidence INTEGER DEFAULT 50,
  reasoning TEXT,
  suggested_action TEXT,
  status TEXT NOT NULL DEFAULT 'Identified', -- 'Identified', 'In Progress', 'Actioned', 'Won', 'Lost'
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `project_tasks` table

```sql
CREATE TABLE project_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  project_id UUID NOT NULL REFERENCES opportunity_projects(id) ON DELETE CASCADE,
  opportunity_id UUID REFERENCES project_opportunities(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id),
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT NOT NULL DEFAULT 'Action', -- 'Action', 'Follow-up', 'Meeting', 'Document', 'Review'
  priority TEXT NOT NULL DEFAULT 'Medium', -- 'Low', 'Medium', 'High', 'Urgent'
  status TEXT NOT NULL DEFAULT 'Not Started', -- 'Not Started', 'In Progress', 'Completed', 'Cancelled'
  due_date DATE,
  sla_deadline DATE,
  completed_at TIMESTAMPTZ,
  assigned_to TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  is_deleted BOOLEAN DEFAULT false
);
```

---

## File Structure

### New Files to Create

```text
src/
├── components/
│   └── ai-assistant/
│       ├── OpportunityMetrics.tsx       # Hero metrics dashboard
│       ├── ProjectCard.tsx              # Individual project card
│       ├── ProjectsList.tsx             # Projects list with filters
│       ├── ProjectDetailPanel.tsx       # Slide-over project detail view
│       ├── ProjectTaskRow.tsx           # Task row within projects
│       ├── CreateProjectDialog.tsx      # Modal to create new projects
│       ├── AddOpportunityDialog.tsx     # Add opportunity to project
│       ├── OpportunityProgressBar.tsx   # Visual progress indicator
│       └── SLAIndicator.tsx             # SLA status badge
├── hooks/
│   ├── useOpportunityProjects.ts        # CRUD for projects
│   ├── useProjectOpportunities.ts       # Opportunities within projects
│   └── useProjectTasks.ts               # Tasks within projects
```

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/AIAssistant.tsx` | Major expansion with new layout and components |
| `src/components/ai-assistant/InsightOrbit.tsx` | Add "Create Project" action to cards |
| `src/components/ai-assistant/OpportunityCard.tsx` | Add "Add to Project" button |
| `src/data/regionalData.ts` | Add region-specific project templates and SLA defaults |
| `src/contexts/RegionContext.tsx` | Add regional project terminology |

---

## UI Layout Design

### Hero Metrics Section (Top)

Four key metric cards displayed horizontally:

| Metric | Description | Visual |
|--------|-------------|--------|
| **Total Opportunity Value** | Sum of all potential revenue | Currency + trend arrow |
| **Active Projects** | Count of projects in progress | Number + status breakdown |
| **Pipeline Progress** | Opportunities actioned vs identified | Progress ring |
| **SLA Health** | Tasks on-track vs at-risk | Traffic light indicator |

### Categories Section (Middle)

Enhanced InsightOrbit cards with:
- Click to filter project list by category
- "New Project" quick action on hover
- Badge showing opportunities not yet in projects

### Projects Section (Bottom)

Collapsible project cards showing:
- Project name and type badge
- Target vs realized revenue with progress bar
- Client/opportunity count
- Task completion status
- SLA countdown
- Timeline indicator
- Expand to show tasks and opportunities

---

## Regional Localization

### Terminology by Region

| Concept | ZA | AU | CA | GB | US |
|---------|----|----|----|----|-----|
| SLA Default | 30 days | 21 days | 30 days | 28 days | 30 days |
| Revenue Term | Revenue | Revenue | Revenue | Income | Revenue |
| Tax Product Upsell | RA Top-up | Super Contribution | RRSP Catch-up | ISA Maximization | 401(k) Max |
| Migration Term | House View Migration | Platform Transfer | Advisor Transfer | SIPP Transfer | IRA Rollover |

### Regional Project Templates

Pre-built project templates per region:

**ZA Templates:**
- Q1 Tax Season Prep
- Living Annuity Reviews
- Offshore Diversification
- Sanlam Platform Migration

**AU Templates:**
- EOFY Super Top-up
- Pension Drawdown Review
- Self-Managed Super Setup
- Platform Consolidation

---

## Component Details

### OpportunityMetrics.tsx

```typescript
interface MetricCard {
  title: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon: LucideIcon;
  color: 'emerald' | 'cyan' | 'violet' | 'orange';
}
```

Displays four glass-morphism metric cards with animated counters and trend indicators.

### ProjectCard.tsx

```typescript
interface ProjectCardProps {
  project: OpportunityProject;
  opportunities: ProjectOpportunity[];
  tasks: ProjectTask[];
  onExpand: () => void;
  onEdit: () => void;
  formatCurrency: (value: number) => string;
}
```

Expandable card showing:
- Header: Name, type badge, menu
- Body: Revenue progress, client count, task stats
- Expanded: Task list, opportunity list, timeline

### CreateProjectDialog.tsx

Dialog with:
- Project name input
- Type selector (Growth/De-risking/Migration/Consolidation)
- Target date picker
- Target revenue input
- SLA days slider
- Pre-select opportunities from current category filter

### SLAIndicator.tsx

Visual badge showing:
- Green: >7 days remaining
- Yellow: 3-7 days remaining
- Red: <3 days or overdue
- Tooltip with exact deadline

---

## Hook Implementations

### useOpportunityProjects.ts

```typescript
export const useOpportunityProjects = (regionCode: string) => {
  // Fetch all projects for region
  // Create/update/delete operations
  // Calculate aggregate metrics
  // Return projects with computed stats
}
```

### useProjectTasks.ts

```typescript
export const useProjectTasks = (projectId: string) => {
  // Fetch tasks for project
  // Create/update/delete
  // Calculate SLA status
  // Track completion rates
}
```

---

## Implementation Phases

### Phase 1: Database Setup
1. Create three new tables with RLS policies
2. Add indexes for performance
3. Run migrations

### Phase 2: Hooks and Data Layer
1. Implement `useOpportunityProjects`
2. Implement `useProjectOpportunities`
3. Implement `useProjectTasks`
4. Add regional localization to context

### Phase 3: UI Components
1. Build `OpportunityMetrics` hero section
2. Enhance `InsightOrbit` with project actions
3. Create `ProjectCard` component
4. Build `ProjectsList` with filters
5. Create `CreateProjectDialog`
6. Build `ProjectDetailPanel` slide-over

### Phase 4: Page Integration
1. Refactor `AIAssistant.tsx` with new layout
2. Wire up all components
3. Add real-time updates
4. Implement task tracking

### Phase 5: Polish
1. Add animations and transitions
2. Implement keyboard shortcuts
3. Add empty states
4. Test all regions

---

## Technical Notes

### RLS Policies

All three new tables will have RLS enabled with policies:

```sql
-- Projects: user can only see their own
CREATE POLICY "Users can manage their own projects"
  ON opportunity_projects FOR ALL
  USING (auth.uid() = user_id);

-- Similar policies for project_opportunities and project_tasks
```

### Performance Considerations

- Use React Query for caching project data
- Implement optimistic updates for task status changes
- Lazy load expanded project details
- Use virtual scrolling for large project lists

### Accessibility

- All interactive elements have proper ARIA labels
- Color indicators have text alternatives
- Keyboard navigation for project list
- Screen reader announcements for status changes

