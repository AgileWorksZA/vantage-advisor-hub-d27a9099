// Demo projects data for prepopulating the Growth Hub
export interface DemoProject {
  id: string;
  name: string;
  description: string;
  project_type: string;
  status: string;
  target_revenue: number;
  realized_revenue: number;
  target_date: string;
  sla_days: number;
  created_at: string;
}

export interface DemoTask {
  id: string;
  project_id: string;
  title: string;
  description: string;
  task_type: string;
  status: string;
  priority: string;
  due_date: string;
  sla_deadline: string;
}

export const getDemoProjects = (regionCode: string): DemoProject[] => {
  const now = new Date();
  const in2Weeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();
  const in1Month = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const in3Months = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString();

  const regionSpecificProjects: Record<string, DemoProject[]> = {
    ZA: [
      {
        id: "demo-za-1",
        name: "Tax Season RA Top-ups",
        description: "Maximize client retirement contributions before tax year end",
        project_type: "growth",
        status: "Active",
        target_revenue: 450000,
        realized_revenue: 125000,
        target_date: in1Month,
        sla_days: 21,
        created_at: now.toISOString(),
      },
      {
        id: "demo-za-2",
        name: "Portfolio Migration Q1",
        description: "Move clients from legacy funds to house view portfolios",
        project_type: "migration",
        status: "Active",
        target_revenue: 280000,
        realized_revenue: 85000,
        target_date: in3Months,
        sla_days: 30,
        created_at: now.toISOString(),
      },
      {
        id: "demo-za-3",
        name: "Protection Gap Analysis",
        description: "Identify and close life cover gaps for HNW clients",
        project_type: "growth",
        status: "Active",
        target_revenue: 180000,
        realized_revenue: 45000,
        target_date: in2Weeks,
        sla_days: 14,
        created_at: now.toISOString(),
      },
    ],
    AU: [
      {
        id: "demo-au-1",
        name: "EOFY Super Top-ups",
        description: "Maximize superannuation contributions before end of financial year",
        project_type: "growth",
        status: "Active",
        target_revenue: 520000,
        realized_revenue: 180000,
        target_date: in1Month,
        sla_days: 21,
        created_at: now.toISOString(),
      },
      {
        id: "demo-au-2",
        name: "SMSF Consolidation",
        description: "Consolidate fragmented super accounts into SMSFs",
        project_type: "consolidation",
        status: "Active",
        target_revenue: 380000,
        realized_revenue: 95000,
        target_date: in3Months,
        sla_days: 30,
        created_at: now.toISOString(),
      },
    ],
    GB: [
      {
        id: "demo-gb-1",
        name: "ISA Maximization Campaign",
        description: "Ensure clients utilize full ISA allowances",
        project_type: "growth",
        status: "Active",
        target_revenue: 320000,
        realized_revenue: 110000,
        target_date: in1Month,
        sla_days: 21,
        created_at: now.toISOString(),
      },
      {
        id: "demo-gb-2",
        name: "Pension Consolidation",
        description: "Consolidate legacy workplace pensions into SIPPs",
        project_type: "consolidation",
        status: "Active",
        target_revenue: 450000,
        realized_revenue: 125000,
        target_date: in3Months,
        sla_days: 30,
        created_at: now.toISOString(),
      },
    ],
    CA: [
      {
        id: "demo-ca-1",
        name: "RRSP Season Campaign",
        description: "Maximize RRSP contributions before deadline",
        project_type: "growth",
        status: "Active",
        target_revenue: 480000,
        realized_revenue: 165000,
        target_date: in1Month,
        sla_days: 21,
        created_at: now.toISOString(),
      },
      {
        id: "demo-ca-2",
        name: "TFSA Top-up Initiative",
        description: "Ensure clients maximize tax-free savings room",
        project_type: "growth",
        status: "Active",
        target_revenue: 220000,
        realized_revenue: 75000,
        target_date: in2Weeks,
        sla_days: 14,
        created_at: now.toISOString(),
      },
    ],
    US: [
      {
        id: "demo-us-1",
        name: "401(k) Rollover Campaign",
        description: "Capture rollover opportunities from job changers",
        project_type: "consolidation",
        status: "Active",
        target_revenue: 650000,
        realized_revenue: 220000,
        target_date: in3Months,
        sla_days: 30,
        created_at: now.toISOString(),
      },
      {
        id: "demo-us-2",
        name: "Roth Conversion Strategy",
        description: "Identify clients for strategic Roth conversions",
        project_type: "growth",
        status: "Active",
        target_revenue: 380000,
        realized_revenue: 95000,
        target_date: in1Month,
        sla_days: 21,
        created_at: now.toISOString(),
      },
    ],
  };

  return regionSpecificProjects[regionCode] || regionSpecificProjects.ZA;
};

export const getDemoTasks = (projects: DemoProject[]): DemoTask[] => {
  const now = new Date();
  const tasks: DemoTask[] = [];

  projects.forEach((project, pIndex) => {
    const tasksForProject: DemoTask[] = [
      {
        id: `task-${project.id}-1`,
        project_id: project.id,
        title: "Client outreach calls",
        description: "Initial contact with identified clients",
        task_type: "Call",
        status: pIndex === 0 ? "In Progress" : "Pending",
        priority: "High",
        due_date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        sla_deadline: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: `task-${project.id}-2`,
        project_id: project.id,
        title: "Prepare proposals",
        description: "Generate personalized recommendations",
        task_type: "Document",
        status: "Pending",
        priority: "Medium",
        due_date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        sla_deadline: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: `task-${project.id}-3`,
        project_id: project.id,
        title: "Follow-up meetings",
        description: "Schedule and conduct review meetings",
        task_type: "Meeting",
        status: "Pending",
        priority: "Medium",
        due_date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        sla_deadline: new Date(now.getTime() + 18 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
    tasks.push(...tasksForProject);
  });

  return tasks;
};
