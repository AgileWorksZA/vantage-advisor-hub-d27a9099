import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useCalendarEvents, CalendarEvent } from "@/hooks/useCalendarEvents";
import { useTasks, TaskListItem } from "@/hooks/useTasks";
import { useClients } from "@/hooks/useClients";
import { useRegion } from "@/contexts/RegionContext";
import { useUserSettings } from "@/hooks/useUserSettings";
import { getActiveTimezone, convertToTimezone } from "@/lib/timezone-utils";
import { getRegionalOpportunities, RegionalOpportunity } from "@/data/regionalData";
import { cn } from "@/lib/utils";
import { Clock, Filter, Calendar as CalendarIcon, TrendingUp } from "lucide-react";
import { format, isSameDay, isToday } from "date-fns";
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

const oppTypeBadge: Record<string, { label: string; className: string }> = {
  upsell: { label: "Upsell", className: "bg-[hsl(180,70%,45%)]/15 text-[hsl(180,70%,45%)]" },
  "cross-sell": { label: "Cross-sell", className: "bg-[hsl(var(--brand-orange))]/15 text-[hsl(var(--brand-orange))]" },
  migration: { label: "Migration", className: "bg-[hsl(var(--brand-blue))]/15 text-[hsl(var(--brand-blue))]" },
  platform: { label: "Platform", className: "bg-purple-500/15 text-purple-400" },
};

const MobileTodayTab = () => {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskListItem | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [taskStatusFilter, setTaskStatusFilter] = useState<TaskStatusFilter>("open");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const eventRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const scrolledRef = useRef(false);

  const { events, loading: eventsLoading } = useCalendarEvents(selectedDate, "day");
  const { tasks, loading: tasksLoading, updateTask } = useTasks();
  const { clients, loading: clientsLoading } = useClients();
  const { selectedAdvisors, regionalData, selectedRegion } = useRegion();
  const { settings } = useUserSettings();

  const activeTimezone = useMemo(
    () => getActiveTimezone(settings?.timezone, selectedRegion),
    [settings?.timezone, selectedRegion]
  );

  const getEventTimeStatus = useCallback((event: CalendarEvent): "in-progress" | "past" | "upcoming" => {
    const now = convertToTimezone(new Date(), activeTimezone);
    const start = convertToTimezone(event.startTime, activeTimezone);
    const end = convertToTimezone(event.endTime, activeTimezone);
    if (now >= start && now <= end) return "in-progress";
    if (now > end) return "past";
    return "upcoming";
  }, [activeTimezone]);

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

  // Growth opportunities matched to today's meetings
  const meetingOpportunities = useMemo(() => {
    const opportunities = getRegionalOpportunities(selectedRegion);
    const meetingClientNames = new Set(dateEvents.map((e) => e.clientName).filter(Boolean));
    return opportunities.filter((opp) => meetingClientNames.has(opp.clientName));
  }, [dateEvents, selectedRegion]);

  // Auto-scroll to current/next meeting
  useEffect(() => {
    if (eventsLoading || dateEvents.length === 0 || scrolledRef.current) return;
    const inProgress = dateEvents.find((e) => getEventTimeStatus(e) === "in-progress");
    const upcoming = dateEvents.find((e) => getEventTimeStatus(e) === "upcoming");
    const target = inProgress || upcoming;
    if (target && eventRefs.current[target.id]) {
      setTimeout(() => {
        eventRefs.current[target.id]?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
      scrolledRef.current = true;
    }
  }, [eventsLoading, dateEvents, getEventTimeStatus]);

  // Reset scroll flag when date changes
  useEffect(() => {
    scrolledRef.current = false;
  }, [selectedDate]);

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
    <div className="flex flex-col h-full">
      {/* Static Header */}
      <div className="px-4 pt-4 pb-2 shrink-0">
        <h1 className="text-2xl font-bold text-foreground">{format(selectedDate, "EEEE")}</h1>
        <p className="text-sm text-muted-foreground">{format(selectedDate, "d MMMM yyyy")}</p>

        <div className="flex items-center justify-between mt-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            {isDateToday ? "Today's Schedule" : `Schedule · ${format(selectedDate, "d MMM yyyy")}`}
          </h2>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <button type="button" className="p-1.5 rounded-md hover:bg-accent/50 transition-colors cursor-pointer relative z-10">
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
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-5">
        {/* Growth Opportunities */}
        {meetingOpportunities.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
            {meetingOpportunities.map((opp) => (
              <GrowthOpportunityCard key={opp.clientId} opportunity={opp} />
            ))}
          </div>
        )}

        {/* Schedule */}
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
            {dateEvents.map((event) => {
              const status = getEventTimeStatus(event);
              return (
                <button
                  key={event.id}
                  ref={(el) => { eventRefs.current[event.id] = el; }}
                  onClick={() => setSelectedEvent(event)}
                  className={cn(
                    "w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors",
                    status === "in-progress" && "bg-[hsl(180,70%,45%)]/5 border border-[hsl(180,70%,45%)]/30 ring-1 ring-[hsl(180,70%,45%)]/20",
                    status === "past" && "bg-card/60 border border-border opacity-60",
                    status === "upcoming" && "bg-card border border-border hover:bg-accent/50"
                  )}
                >
                  <div
                    className={cn("self-stretch rounded-full shrink-0", status === "in-progress" ? "w-1.5" : "w-1")}
                    style={{ backgroundColor: status === "past" ? "hsl(var(--muted-foreground))" : (event.color || "hsl(180, 70%, 45%)") }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm text-foreground truncate",
                      status === "in-progress" ? "font-semibold" : "font-medium",
                      status === "past" && "text-muted-foreground"
                    )}>{event.title}</p>
                    {event.clientName && <p className="text-xs text-muted-foreground truncate">{event.clientName}</p>}
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{format(event.startTime, "HH:mm")} – {format(event.endTime, "HH:mm")}</span>
                    </div>
                  </div>
                  {status === "in-progress" ? (
                    <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-[hsl(180,70%,45%)]/10 text-[hsl(180,70%,45%)] font-medium shrink-0">
                      <span className="h-1.5 w-1.5 rounded-full bg-[hsl(180,70%,45%)] animate-pulse" />
                      Live
                    </span>
                  ) : (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground shrink-0">{event.eventType}</span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Tasks Section */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {statusFilterLabels[taskStatusFilter]} Tasks ({filteredTasks.length})
            </h2>
            <Popover open={filterOpen} onOpenChange={setFilterOpen}>
              <PopoverTrigger asChild>
                <button type="button" className="p-1.5 rounded-md hover:bg-accent/50 transition-colors cursor-pointer relative z-10">
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
    </div>
  );
};

function GrowthOpportunityCard({ opportunity }: { opportunity: RegionalOpportunity }) {
  const badge = oppTypeBadge[opportunity.opportunityType] || oppTypeBadge.upsell;
  const currency = opportunity.currentValue > 100000 ? "R" : "$";
  const revenueStr = opportunity.potentialRevenue >= 1000
    ? `${currency}${(opportunity.potentialRevenue / 1000).toFixed(0)}k`
    : `${currency}${opportunity.potentialRevenue}`;

  return (
    <div className="min-w-[140px] max-w-[160px] shrink-0 rounded-lg border border-border bg-card p-2.5 space-y-1.5">
      <div className="flex items-center gap-1.5">
        <TrendingUp className="h-3 w-3 text-muted-foreground shrink-0" />
        <p className="text-xs font-medium text-foreground truncate">{opportunity.clientName}</p>
      </div>
      <span className={cn("inline-block text-[9px] px-1.5 py-0.5 rounded-full font-medium", badge.className)}>
        {badge.label}
      </span>
      <p className="text-sm font-bold text-foreground">{revenueStr}</p>
      <p className="text-[10px] text-muted-foreground leading-tight line-clamp-2">{opportunity.suggestedAction}</p>
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
