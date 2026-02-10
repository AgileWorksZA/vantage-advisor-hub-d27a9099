import { useState, useMemo } from "react";
import { useCalendarEvents, CalendarEvent } from "@/hooks/useCalendarEvents";
import { useTasks, TaskListItem } from "@/hooks/useTasks";
import { useClients } from "@/hooks/useClients";
import { useRegion } from "@/contexts/RegionContext";
import { Clock, CheckSquare, AlertTriangle, Calendar as CalendarIcon, Filter } from "lucide-react";
import { format, isSameDay, isBefore, startOfDay, isToday } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import MobileMeetingScreen from "./MobileMeetingScreen";
import MobileTaskDetailView from "./MobileTaskDetailView";

type TaskStatusFilter = "open" | "all" | "completed" | "in-progress" | "not-started" | "pending-client";

const statusFilterLabels: Record<TaskStatusFilter, string> = {
  open: "Open",
  all: "All",
  completed: "Completed",
  "in-progress": "In Progress",
  "not-started": "Not Started",
  "pending-client": "Pending Client",
};

const MobileTodayTab = () => {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskListItem | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [taskStatusFilter, setTaskStatusFilter] = useState<TaskStatusFilter>("open");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const today = useMemo(() => new Date(), []);
  const { events, loading: eventsLoading } = useCalendarEvents(selectedDate, "day");
  const { tasks, loading: tasksLoading, updateTask } = useTasks();
  const { clients, loading: clientsLoading } = useClients();
  const { selectedAdvisors, regionalData } = useRegion();

  const selectedAdvisorNames = useMemo(
    () => regionalData.advisors.filter((a) => selectedAdvisors.includes(a.initials)).map((a) => a.name),
    [regionalData.advisors, selectedAdvisors]
  );

  const advisorClientNames = useMemo(() => {
    const names = new Set<string>();
    clients.filter((c) => selectedAdvisorNames.includes(c.advisor)).forEach((c) => names.add(c.client));
    return names;
  }, [clients, selectedAdvisorNames]);

  const dateEvents = useMemo(
    () =>
      events
        .filter((e) => isSameDay(e.startTime, selectedDate))
        .filter((e) => !e.clientId || selectedAdvisorNames.includes(e.clientAdvisor || ""))
        .sort((a, b) => a.startTime.getTime() - b.startTime.getTime()),
    [events, selectedAdvisorNames, selectedDate]
  );

  const filteredTasks = useMemo(() => {
    const advisorTasks = tasks.filter((t) => t.isPracticeTask || advisorClientNames.has(t.clientName));
    switch (taskStatusFilter) {
      case "open":
        return advisorTasks.filter((t) => t.status !== "Completed" && t.status !== "Cancelled");
      case "all":
        return advisorTasks;
      case "completed":
        return advisorTasks.filter((t) => t.status === "Completed");
      case "in-progress":
        return advisorTasks.filter((t) => t.status === "In Progress");
      case "not-started":
        return advisorTasks.filter((t) => t.status === "Not Started");
      case "pending-client":
        return advisorTasks.filter((t) => t.status === "Pending Client");
      default:
        return advisorTasks;
    }
  }, [tasks, advisorClientNames, taskStatusFilter]);

  const taskStats = useMemo(() => {
    const allAdvisorTasks = tasks.filter((t) => t.isPracticeTask || advisorClientNames.has(t.clientName));
    const openTasks = allAdvisorTasks.filter((t) => t.status !== "Completed" && t.status !== "Cancelled");
    const dueToday = openTasks.filter((t) => isToday(t.dueDate));
    const overdue = openTasks.filter((t) => isBefore(t.dueDate, startOfDay(today)) && !isToday(t.dueDate));
    return { open: openTasks.length, dueToday: dueToday.length, overdue: overdue.length };
  }, [tasks, advisorClientNames, today]);

  const isLoading = eventsLoading || tasksLoading || clientsLoading;
  const isDateToday = isToday(selectedDate);

  const handleToggleComplete = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === "Completed" ? "Not Started" : "Completed";
    await updateTask(taskId, { status: newStatus } as any);
    setSelectedTask(null);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setCalendarOpen(false);
    }
  };

  if (selectedEvent) {
    return <MobileMeetingScreen event={selectedEvent} onBack={() => setSelectedEvent(null)} />;
  }

  if (selectedTask) {
    return (
      <MobileTaskDetailView
        task={selectedTask}
        onBack={() => setSelectedTask(null)}
        onToggleComplete={handleToggleComplete}
      />
    );
  }

  return (
    <div className="p-4 space-y-5">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">{format(selectedDate, "EEEE")}</h1>
        <p className="text-sm text-muted-foreground">{format(selectedDate, "d MMMM yyyy")}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={<CheckSquare className="h-4 w-4 text-[hsl(180,70%,45%)]" />} label="Due Today" value={taskStats.dueToday} loading={isLoading} />
        <StatCard icon={<AlertTriangle className="h-4 w-4 text-destructive" />} label="Overdue" value={taskStats.overdue} loading={isLoading} highlight={taskStats.overdue > 0} />
        <StatCard icon={<CalendarIcon className="h-4 w-4 text-[hsl(var(--brand-blue))]" />} label="Meetings" value={dateEvents.length} loading={isLoading} />
      </div>

      {/* Schedule Section */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            {isDateToday ? "Today's Schedule" : `Schedule · ${format(selectedDate, "d MMM yyyy")}`}
          </h2>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <button className="p-1.5 rounded-md hover:bg-accent/50 transition-colors">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : dateEvents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No meetings scheduled{isDateToday ? " for today" : ` for ${format(selectedDate, "d MMM")}`}
          </div>
        ) : (
          <div className="space-y-2">
            {dateEvents.map((event) => (
              <button
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                className="w-full flex items-start gap-3 p-3 rounded-lg bg-card border border-border text-left hover:bg-accent/50 transition-colors"
              >
                <div className="w-1 self-stretch rounded-full shrink-0" style={{ backgroundColor: event.color || "hsl(180, 70%, 45%)" }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{event.title}</p>
                  {event.clientName && <p className="text-xs text-muted-foreground truncate">{event.clientName}</p>}
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{format(event.startTime, "HH:mm")} – {format(event.endTime, "HH:mm")}</span>
                  </div>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground shrink-0">{event.eventType}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Tasks Section */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            {statusFilterLabels[taskStatusFilter]} Tasks ({filteredTasks.length})
          </h2>
          <Popover open={filterOpen} onOpenChange={setFilterOpen}>
            <PopoverTrigger asChild>
              <button className="p-1.5 rounded-md hover:bg-accent/50 transition-colors relative">
                <Filter className="h-4 w-4 text-muted-foreground" />
                {taskStatusFilter !== "open" && (
                  <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-[hsl(180,70%,45%)]" />
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-44 p-1" align="end">
              {(Object.entries(statusFilterLabels) as [TaskStatusFilter, string][]).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => { setTaskStatusFilter(key); setFilterOpen(false); }}
                  className={`w-full text-left text-sm px-3 py-2 rounded-md transition-colors ${
                    taskStatusFilter === key
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-foreground hover:bg-accent/50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </PopoverContent>
          </Popover>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-sm">No tasks found</div>
        ) : (
          <div className="space-y-2">
            {filteredTasks.slice(0, 10).map((task) => (
              <button
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-card border border-border text-left hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{task.clientName}</p>
                </div>
                <PriorityBadge priority={task.priority} />
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

function StatCard({ icon, label, value, loading, highlight }: { icon: React.ReactNode; label: string; value: number; loading: boolean; highlight?: boolean }) {
  return (
    <div className={`rounded-lg border p-3 text-center ${highlight ? "border-destructive/30 bg-destructive/5" : "border-border bg-card"}`}>
      <div className="flex justify-center mb-1">{icon}</div>
      {loading ? <div className="h-6 w-8 mx-auto rounded bg-muted animate-pulse" /> : <p className="text-xl font-bold text-foreground">{value}</p>}
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
    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${colors[priority] || colors.Low}`}>{priority}</span>
  );
}

export default MobileTodayTab;
