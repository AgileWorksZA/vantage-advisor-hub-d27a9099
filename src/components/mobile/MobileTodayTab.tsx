import { useMemo } from "react";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { useTasks } from "@/hooks/useTasks";
import { useClients } from "@/hooks/useClients";
import { useRegion } from "@/contexts/RegionContext";
import { Clock, CheckSquare, AlertTriangle, Calendar } from "lucide-react";
import { format, isToday, isBefore, startOfDay } from "date-fns";

const MobileTodayTab = () => {
  const today = useMemo(() => new Date(), []);
  const { events, loading: eventsLoading } = useCalendarEvents(today, "day");
  const { tasks, loading: tasksLoading } = useTasks();
  const { clients, loading: clientsLoading } = useClients();
  const { selectedAdvisors, regionalData } = useRegion();

  const selectedAdvisorNames = useMemo(() =>
    regionalData.advisors
      .filter(a => selectedAdvisors.includes(a.initials))
      .map(a => a.name),
    [regionalData.advisors, selectedAdvisors]
  );

  const advisorClientNames = useMemo(() => {
    const names = new Set<string>();
    clients.filter(c => selectedAdvisorNames.includes(c.advisor)).forEach(c => names.add(c.client));
    return names;
  }, [clients, selectedAdvisorNames]);

  const todayEvents = useMemo(
    () => events
      .filter((e) => isToday(e.startTime))
      .filter((e) => !e.clientId || selectedAdvisorNames.includes(e.clientAdvisor || ""))
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime()),
    [events, selectedAdvisorNames]
  );

  const filteredTasks = useMemo(() =>
    tasks.filter((t) => t.isPracticeTask || advisorClientNames.has(t.clientName)),
    [tasks, advisorClientNames]
  );

  const taskStats = useMemo(() => {
    const openTasks = filteredTasks.filter((t) => t.status !== "Completed" && t.status !== "Cancelled");
    const dueToday = openTasks.filter((t) => isToday(t.dueDate));
    const overdue = openTasks.filter((t) => isBefore(t.dueDate, startOfDay(today)) && !isToday(t.dueDate));
    return { open: openTasks.length, dueToday: dueToday.length, overdue: overdue.length };
  }, [filteredTasks, today]);

  const isLoading = eventsLoading || tasksLoading || clientsLoading;

  return (
    <div className="p-4 space-y-5">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {format(today, "EEEE")}
        </h1>
        <p className="text-sm text-muted-foreground">{format(today, "d MMMM yyyy")}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          icon={<CheckSquare className="h-4 w-4 text-[hsl(180,70%,45%)]" />}
          label="Due Today"
          value={taskStats.dueToday}
          loading={isLoading}
        />
        <StatCard
          icon={<AlertTriangle className="h-4 w-4 text-destructive" />}
          label="Overdue"
          value={taskStats.overdue}
          loading={isLoading}
          highlight={taskStats.overdue > 0}
        />
        <StatCard
          icon={<Calendar className="h-4 w-4 text-[hsl(var(--brand-blue))]" />}
          label="Meetings"
          value={todayEvents.length}
          loading={isLoading}
        />
      </div>

      {/* Today's Schedule */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Today's Schedule
        </h2>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : todayEvents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No meetings scheduled for today
          </div>
        ) : (
          <div className="space-y-2">
            {todayEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border"
              >
                <div
                  className="w-1 self-stretch rounded-full shrink-0"
                  style={{ backgroundColor: event.color || "hsl(180, 70%, 45%)" }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{event.title}</p>
                  {event.clientName && (
                    <p className="text-xs text-muted-foreground truncate">{event.clientName}</p>
                  )}
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>
                      {format(event.startTime, "HH:mm")} – {format(event.endTime, "HH:mm")}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground shrink-0">
                  {event.eventType}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Open Tasks */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Open Tasks ({taskStats.open})
        </h2>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTasks
              .filter((t) => t.status !== "Completed" && t.status !== "Cancelled")
              .slice(0, 5)
              .map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{task.clientName}</p>
                  </div>
                  <PriorityBadge priority={task.priority} />
                </div>
              ))}
          </div>
        )}
      </section>
    </div>
  );
};

function StatCard({
  icon,
  label,
  value,
  loading,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  loading: boolean;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-lg border p-3 text-center ${highlight ? "border-destructive/30 bg-destructive/5" : "border-border bg-card"}`}>
      <div className="flex justify-center mb-1">{icon}</div>
      {loading ? (
        <div className="h-6 w-8 mx-auto rounded bg-muted animate-pulse" />
      ) : (
        <p className="text-xl font-bold text-foreground">{value}</p>
      )}
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    High: "bg-destructive/10 text-destructive",
    Urgent: "bg-destructive/10 text-destructive",
    Medium: "bg-[hsl(var(--brand-orange))]/10 text-[hsl(var(--brand-orange))]",
    Low: "bg-muted text-muted-foreground",
  };
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${colors[priority] || colors.Low}`}>
      {priority}
    </span>
  );
}

export default MobileTodayTab;
