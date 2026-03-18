import { useMemo } from "react";
import { useTasks } from "@/hooks/useTasks";
import { useClients } from "@/hooks/useClients";
import { useRegion } from "@/contexts/RegionContext";
import { Users, CheckSquare, AlertTriangle, TrendingUp, PieChart, Shield } from "lucide-react";
import { isBefore, startOfDay } from "date-fns";

const MobileInsightsTab = () => {
  const { tasks, loading: tasksLoading } = useTasks();
  const { clients, loading: clientsLoading } = useClients();
  const { selectedAdvisors, regionalData } = useRegion();

  const today = useMemo(() => new Date(), []);

  const selectedAdvisorNames = useMemo(() =>
    regionalData.advisors
      .filter(a => selectedAdvisors.includes(a.initials))
      .map(a => a.name),
    [regionalData.advisors, selectedAdvisors]
  );

  const filteredClients = useMemo(() =>
    clients.filter(c => selectedAdvisorNames.includes(c.advisor)),
    [clients, selectedAdvisorNames]
  );

  const advisorClientNames = useMemo(() => {
    const names = new Set<string>();
    filteredClients.forEach(c => names.add(c.client));
    return names;
  }, [filteredClients]);

  const filteredTasks = useMemo(() =>
    tasks.filter((t) => t.isPracticeTask || advisorClientNames.has(t.clientName)),
    [tasks, advisorClientNames]
  );

  const metrics = useMemo(() => {
    const openTasks = filteredTasks.filter((t) => t.status !== "Completed" && t.status !== "Cancelled");
    const overdue = openTasks.filter((t) => isBefore(t.dueDate, startOfDay(today)));
    const completedTasks = filteredTasks.filter((t) => t.status === "Completed");
    const completionRate = filteredTasks.length > 0 ? Math.round((completedTasks.length / filteredTasks.length) * 100) : 0;

    return {
      totalClients: filteredClients.length,
      openTasks: openTasks.length,
      overdueTasks: overdue.length,
      completionRate,
      complianceAlerts: overdue.filter((t) => t.taskType === "Compliance" || t.taskType === "Annual Review").length,
    };
  }, [filteredTasks, filteredClients, today]);

  const loading = tasksLoading || clientsLoading;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold text-foreground">Practice Insights</h1>

      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          icon={<Users className="h-5 w-5 text-[hsl(180,70%,45%)]" />}
          label="Total Clients"
          value={metrics.totalClients}
          loading={loading}
        />
        <MetricCard
          icon={<CheckSquare className="h-5 w-5 text-[hsl(var(--brand-blue))]" />}
          label="Open Tasks"
          value={metrics.openTasks}
          loading={loading}
        />
        <MetricCard
          icon={<AlertTriangle className="h-5 w-5 text-destructive" />}
          label="Overdue Tasks"
          value={metrics.overdueTasks}
          loading={loading}
          highlight={metrics.overdueTasks > 0}
        />
        <MetricCard
          icon={<TrendingUp className="h-5 w-5 text-[hsl(142,76%,36%)]" />}
          label="Completion Rate"
          value={`${metrics.completionRate}%`}
          loading={loading}
        />
      </div>

      {/* Compliance alerts card */}
      <div className="rounded-lg bg-card border border-border p-4">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-5 w-5 text-[hsl(var(--brand-orange))]" />
          <h2 className="text-sm font-semibold text-foreground">Compliance Alerts</h2>
        </div>
        {loading ? (
          <div className="h-12 bg-muted animate-pulse rounded" />
        ) : metrics.complianceAlerts > 0 ? (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <span className="text-lg font-bold text-destructive">{metrics.complianceAlerts}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Overdue compliance and review tasks requiring attention
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">All compliance tasks are up to date ✓</p>
        )}
      </div>

      {/* Task Distribution */}
      <div className="rounded-lg bg-card border border-border p-4">
        <div className="flex items-center gap-2 mb-3">
          <PieChart className="h-5 w-5 text-[hsl(var(--brand-blue))]" />
          <h2 className="text-sm font-semibold text-foreground">Task Distribution</h2>
        </div>
        {loading ? (
          <div className="h-24 bg-muted animate-pulse rounded" />
        ) : (
          <TaskDistribution tasks={filteredTasks} />
        )}
      </div>
    </div>
  );
};

function MetricCard({
  icon,
  label,
  value,
  loading,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  loading: boolean;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-lg border p-4 ${highlight ? "border-destructive/30 bg-destructive/5" : "border-border bg-card"}`}>
      <div className="flex items-center gap-2 mb-2">{icon}</div>
      {loading ? (
        <div className="h-7 w-12 bg-muted animate-pulse rounded" />
      ) : (
        <p className="text-2xl font-bold text-foreground">{value}</p>
      )}
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

function TaskDistribution({ tasks }: { tasks: any[] }) {
  const types = useMemo(() => {
    const counts: Record<string, number> = {};
    tasks.forEach((t) => {
      counts[t.taskType] = (counts[t.taskType] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [tasks]);

  const total = tasks.length || 1;

  return (
    <div className="space-y-2">
      {types.map(([type, count]) => (
        <div key={type}>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">{type}</span>
            <span className="text-foreground font-medium">{count}</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-[hsl(180,70%,45%)]"
              style={{ width: `${(count / total) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default MobileInsightsTab;
