import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Download, Users, ListTodo, CalendarIcon, ChevronRight, Filter } from "lucide-react";
import { EnhancedTask, TaskFilters } from "@/hooks/useTasksEnhanced";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { useRegion } from "@/contexts/RegionContext";
import { MultiSelect } from "@/components/ui/multi-select";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfDay,
  endOfDay,
  addDays,
  subWeeks,
  subMonths,
  isWithinInterval,
  isBefore,
  isToday,
  isTomorrow,
  isWeekend,
  eachDayOfInterval,
  format,
  differenceInDays,
} from "date-fns";

interface TaskAnalyticsTabProps {
  tasks: EnhancedTask[];
  onDrillDown: (filters: TaskFilters) => void;
}

interface AnalyticsRow {
  label: string;
  filterKey: string;
  teamName?: string;
  dueItems: number;
  overdue: number;
  dueToday: number;
  dueTomorrow: number;
  dueThisWeek: number;
  dueNextWeek: number;
  completedInPeriod: number;
  completedPriorPeriod: number;
  utilisationPct: number | null;
  slaPct: number | null;
}

type DatePreset = "this_week" | "last_week" | "this_month" | "last_month" | "custom";

const getWorkingDays = (start: Date, end: Date): number => {
  const days = eachDayOfInterval({ start, end });
  return days.filter((d) => !isWeekend(d)).length;
};

const getDateRange = (preset: DatePreset, customFrom?: Date, customTo?: Date): { start: Date; end: Date } => {
  const now = new Date();
  switch (preset) {
    case "this_week":
      return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
    case "last_week": {
      const lastWeekStart = subWeeks(startOfWeek(now, { weekStartsOn: 1 }), 1);
      return { start: lastWeekStart, end: endOfWeek(lastWeekStart, { weekStartsOn: 1 }) };
    }
    case "this_month":
      return { start: startOfMonth(now), end: endOfMonth(now) };
    case "last_month": {
      const lastMonth = subMonths(now, 1);
      return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
    }
    case "custom":
      return { start: customFrom || startOfWeek(now, { weekStartsOn: 1 }), end: customTo || endOfWeek(now, { weekStartsOn: 1 }) };
    default:
      return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
  }
};

const computeRows = (
  tasks: EnhancedTask[],
  groupBy: "assigned_to_name" | "task_type",
  periodStart: Date,
  periodEnd: Date,
  priorStart: Date,
  priorEnd: Date,
  workingDays: number
): AnalyticsRow[] => {
  const now = new Date();
  const today = startOfDay(now);
  const tomorrow = addDays(today, 1);
  const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
  const thisWeekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const nextWeekStart = addDays(thisWeekEnd, 1);
  const nextWeekEnd = endOfWeek(nextWeekStart, { weekStartsOn: 1 });

  const groups: Record<string, EnhancedTask[]> = {};
  tasks.forEach((t) => {
    const key =
      groupBy === "assigned_to_name"
        ? t.assigned_to_name || "Unassigned"
        : t.task_type || "Unknown";
    if (!groups[key]) groups[key] = [];
    groups[key].push(t);
  });

  return Object.entries(groups)
    .map(([label, groupTasks]) => {
      const open = groupTasks.filter(
        (t) => !["Completed", "Cancelled"].includes(t.status)
      );
      const overdue = open.filter(
        (t) => t.due_date && isBefore(new Date(t.due_date), today)
      ).length;
      const dueToday = open.filter(
        (t) => t.due_date && isToday(new Date(t.due_date))
      ).length;
      const dueTomorrow = open.filter(
        (t) => t.due_date && isTomorrow(new Date(t.due_date))
      ).length;
      const dueThisWeek = open.filter(
        (t) =>
          t.due_date &&
          isWithinInterval(new Date(t.due_date), { start: thisWeekStart, end: thisWeekEnd })
      ).length;
      const dueNextWeek = open.filter(
        (t) =>
          t.due_date &&
          isWithinInterval(new Date(t.due_date), { start: nextWeekStart, end: nextWeekEnd })
      ).length;

      const completedInPeriod = groupTasks.filter(
        (t) =>
          t.status === "Completed" &&
          t.completed_at &&
          isWithinInterval(new Date(t.completed_at), { start: periodStart, end: endOfDay(periodEnd) })
      );
      const completedPriorPeriod = groupTasks.filter(
        (t) =>
          t.status === "Completed" &&
          t.completed_at &&
          isWithinInterval(new Date(t.completed_at), { start: priorStart, end: endOfDay(priorEnd) })
      );

      const totalExecMins = completedInPeriod.reduce(
        (sum, t) => sum + ((t as any).standard_execution_minutes || 0),
        0
      );
      const maxMins = 7.5 * workingDays * 60;
      const utilisationPct =
        maxMins > 0 && totalExecMins > 0
          ? Math.round((totalExecMins / maxMins) * 100)
          : null;

      const allCompleted = [...completedInPeriod, ...completedPriorPeriod];
      const withSla = allCompleted.filter((t) => t.sla_deadline);
      const withinSla = withSla.filter(
        (t) =>
          t.completed_at &&
          t.sla_deadline &&
          new Date(t.completed_at) <= new Date(t.sla_deadline)
      );
      const slaPct =
        withSla.length > 0
          ? Math.round((withinSla.length / withSla.length) * 100)
          : null;

      return {
        label,
        filterKey: label,
        dueItems: open.length,
        overdue,
        dueToday,
        dueTomorrow,
        dueThisWeek,
        dueNextWeek,
        completedInPeriod: completedInPeriod.length,
        completedPriorPeriod: completedPriorPeriod.length,
        utilisationPct,
        slaPct,
      };
    })
    .sort((a, b) => b.dueItems - a.dueItems);
};

const aggregateRows = (rows: AnalyticsRow[]): Omit<AnalyticsRow, "label" | "filterKey" | "teamName"> => {
  const t = {
    dueItems: 0, overdue: 0, dueToday: 0, dueTomorrow: 0,
    dueThisWeek: 0, dueNextWeek: 0, completedInPeriod: 0,
    completedPriorPeriod: 0, utilisationPct: null as number | null, slaPct: null as number | null,
  };
  rows.forEach((r) => {
    t.dueItems += r.dueItems;
    t.overdue += r.overdue;
    t.dueToday += r.dueToday;
    t.dueTomorrow += r.dueTomorrow;
    t.dueThisWeek += r.dueThisWeek;
    t.dueNextWeek += r.dueNextWeek;
    t.completedInPeriod += r.completedInPeriod;
    t.completedPriorPeriod += r.completedPriorPeriod;
  });
  return t;
};

const exportToCsv = (rows: AnalyticsRow[], viewLabel: string) => {
  const headers = [
    viewLabel, "Due Items", "Overdue", "Due Today", "Due Tomorrow",
    "Due This Week", "Due Next Week", "Completed in Period",
    "Completed Prior Period", "Utilisation %", "SLA Adherence %",
  ];
  const csvRows = [
    headers.join(","),
    ...rows.map((r) =>
      [
        `"${r.label}"`, r.dueItems, r.overdue, r.dueToday, r.dueTomorrow,
        r.dueThisWeek, r.dueNextWeek, r.completedInPeriod,
        r.completedPriorPeriod, r.utilisationPct ?? "-", r.slaPct ?? "-",
      ].join(",")
    ),
  ];
  const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `task-analytics-${viewLabel.toLowerCase().replace(/\s/g, "-")}-${format(new Date(), "yyyy-MM-dd")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

function AnalyticsDataRow({ row, index, onClick }: { row: AnalyticsRow; index: number; onClick: () => void }) {
  return (
    <TableRow
      className={`cursor-pointer hover:bg-muted/60 ${index % 2 === 1 ? "bg-muted/20" : ""}`}
      onClick={onClick}
    >
      <TableCell className="font-medium">{row.teamName ? <span className="pl-4">{row.label}</span> : row.label}</TableCell>
      <TableCell className="text-center">{row.dueItems || "-"}</TableCell>
      <TableCell className="text-center">
        {row.overdue > 0 ? <Badge variant="destructive" className="text-xs">{row.overdue}</Badge> : "-"}
      </TableCell>
      <TableCell className="text-center">
        {row.dueToday > 0 ? <Badge className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/30 text-xs">{row.dueToday}</Badge> : "-"}
      </TableCell>
      <TableCell className="text-center">{row.dueTomorrow || "-"}</TableCell>
      <TableCell className="text-center">{row.dueThisWeek || "-"}</TableCell>
      <TableCell className="text-center">{row.dueNextWeek || "-"}</TableCell>
      <TableCell className="text-center">
        {row.completedInPeriod > 0 ? <Badge className="bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30 text-xs">{row.completedInPeriod}</Badge> : "-"}
      </TableCell>
      <TableCell className="text-center">{row.completedPriorPeriod || "-"}</TableCell>
      <TableCell className="text-center">{row.utilisationPct !== null ? `${row.utilisationPct}%` : "-"}</TableCell>
      <TableCell className="text-center">
        {row.slaPct !== null ? (
          <span className={row.slaPct >= 80 ? "text-green-600" : row.slaPct >= 50 ? "text-yellow-600" : "text-red-600"}>
            {row.slaPct}%
          </span>
        ) : "-"}
      </TableCell>
    </TableRow>
  );
}

function TotalsRow({ totals }: { totals: ReturnType<typeof aggregateRows> }) {
  return (
    <TableRow className="bg-muted/40 font-semibold border-t-2">
      <TableCell>Total</TableCell>
      <TableCell className="text-center">{totals.dueItems}</TableCell>
      <TableCell className="text-center">{totals.overdue || "-"}</TableCell>
      <TableCell className="text-center">{totals.dueToday || "-"}</TableCell>
      <TableCell className="text-center">{totals.dueTomorrow || "-"}</TableCell>
      <TableCell className="text-center">{totals.dueThisWeek || "-"}</TableCell>
      <TableCell className="text-center">{totals.dueNextWeek || "-"}</TableCell>
      <TableCell className="text-center">{totals.completedInPeriod || "-"}</TableCell>
      <TableCell className="text-center">{totals.completedPriorPeriod || "-"}</TableCell>
      <TableCell className="text-center">-</TableCell>
      <TableCell className="text-center">-</TableCell>
    </TableRow>
  );
}

function TeamGroupRow({ teamName, totals, children }: { teamName: string; totals: ReturnType<typeof aggregateRows>; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <TableRow className="bg-muted/30 cursor-pointer hover:bg-muted/50 font-semibold">
          <TableCell>
            <div className="flex items-center gap-1">
              <ChevronRight className={`h-4 w-4 transition-transform ${open ? "rotate-90" : ""}`} />
              {teamName}
            </div>
          </TableCell>
          <TableCell className="text-center">{totals.dueItems || "-"}</TableCell>
          <TableCell className="text-center">{totals.overdue ? <Badge variant="destructive" className="text-xs">{totals.overdue}</Badge> : "-"}</TableCell>
          <TableCell className="text-center">{totals.dueToday || "-"}</TableCell>
          <TableCell className="text-center">{totals.dueTomorrow || "-"}</TableCell>
          <TableCell className="text-center">{totals.dueThisWeek || "-"}</TableCell>
          <TableCell className="text-center">{totals.dueNextWeek || "-"}</TableCell>
          <TableCell className="text-center">{totals.completedInPeriod || "-"}</TableCell>
          <TableCell className="text-center">{totals.completedPriorPeriod || "-"}</TableCell>
          <TableCell className="text-center">-</TableCell>
          <TableCell className="text-center">-</TableCell>
        </TableRow>
      </CollapsibleTrigger>
      <CollapsibleContent asChild>
        <>{children}</>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function TaskAnalyticsTab({ tasks, onDrillDown }: TaskAnalyticsTabProps) {
  const [subView, setSubView] = useState<"user" | "type">("user");
  const [datePreset, setDatePreset] = useState<DatePreset>("this_week");
  const [customFrom, setCustomFrom] = useState<Date | undefined>();
  const [customTo, setCustomTo] = useState<Date | undefined>();
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);

  const { teamMembers } = useTeamMembers();
  const { selectedRegion } = useRegion();

  // Filter team members by current jurisdiction
  const jurisdictionMembers = useMemo(
    () => teamMembers.filter((m) => m.jurisdiction === selectedRegion),
    [teamMembers, selectedRegion]
  );

  // Unique team names for filter
  const teamOptions = useMemo(() => {
    const names = new Set(jurisdictionMembers.map((m) => m.team_name).filter(Boolean) as string[]);
    return Array.from(names).sort().map((n) => ({ label: n, value: n }));
  }, [jurisdictionMembers]);

  // Map member names to teams
  const memberTeamMap = useMemo(() => {
    const map: Record<string, string> = {};
    jurisdictionMembers.forEach((m) => {
      if (m.team_name) map[m.name] = m.team_name;
    });
    return map;
  }, [jurisdictionMembers]);

  // Date range calculations
  const { periodStart, periodEnd, priorStart, priorEnd, workingDays } = useMemo(() => {
    const { start, end } = getDateRange(datePreset, customFrom, customTo);
    const periodDays = differenceInDays(end, start) + 1;
    const prior = {
      start: addDays(start, -periodDays),
      end: addDays(start, -1),
    };
    return {
      periodStart: start,
      periodEnd: end,
      priorStart: prior.start,
      priorEnd: prior.end,
      workingDays: getWorkingDays(start, end),
    };
  }, [datePreset, customFrom, customTo]);

  // Filter tasks by selected teams (user view only)
  const filteredTasks = useMemo(() => {
    if (subView !== "user" || selectedTeams.length === 0) return tasks;
    const validNames = new Set(
      jurisdictionMembers
        .filter((m) => m.team_name && selectedTeams.includes(m.team_name))
        .map((m) => m.name)
    );
    return tasks.filter((t) => t.assigned_to_name && validNames.has(t.assigned_to_name));
  }, [tasks, subView, selectedTeams, jurisdictionMembers]);

  const rows = useMemo(
    () =>
      computeRows(
        filteredTasks,
        subView === "user" ? "assigned_to_name" : "task_type",
        periodStart, periodEnd, priorStart, priorEnd, workingDays
      ),
    [filteredTasks, subView, periodStart, periodEnd, priorStart, priorEnd, workingDays]
  );

  // Group rows by team for user view
  const groupedRows = useMemo(() => {
    if (subView !== "user") return null;
    const groups: Record<string, AnalyticsRow[]> = {};
    const ungrouped: AnalyticsRow[] = [];
    rows.forEach((row) => {
      const team = memberTeamMap[row.label];
      if (team) {
        row.teamName = team;
        if (!groups[team]) groups[team] = [];
        groups[team].push(row);
      } else {
        ungrouped.push(row);
      }
    });
    return { groups, ungrouped };
  }, [rows, subView, memberTeamMap]);

  const totals = useMemo(() => aggregateRows(rows), [rows]);

  const handleRowClick = (row: AnalyticsRow) => {
    const filters: TaskFilters = {};
    if (subView === "type") {
      filters.taskType = [row.filterKey];
    }
    onDrillDown(filters);
  };

  const groupLabel = subView === "user" ? "Assigned To" : "Task Type";
  const presetLabels: Record<DatePreset, string> = {
    this_week: "This Week",
    last_week: "Last Week",
    this_month: "This Month",
    last_month: "Last Month",
    custom: "Custom Range",
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Tabs value={subView} onValueChange={(v) => setSubView(v as "user" | "type")}>
            <TabsList>
              <TabsTrigger value="user" className="gap-2">
                <Users className="h-4 w-4" />By User
              </TabsTrigger>
              <TabsTrigger value="type" className="gap-2">
                <ListTodo className="h-4 w-4" />By Task Type
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Select value={datePreset} onValueChange={(v) => setDatePreset(v as DatePreset)}>
            <SelectTrigger className="w-[160px] h-9">
              <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(presetLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {datePreset === "custom" && (
            <div className="flex items-center gap-1">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 text-xs">
                    {customFrom ? format(customFrom, "dd MMM") : "From"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={customFrom} onSelect={setCustomFrom} />
                </PopoverContent>
              </Popover>
              <span className="text-muted-foreground text-xs">—</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 text-xs">
                    {customTo ? format(customTo, "dd MMM") : "To"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={customTo} onSelect={setCustomTo} />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {subView === "user" && teamOptions.length > 0 && (
            <MultiSelect
              options={teamOptions}
              onChange={setSelectedTeams}
              selected={selectedTeams}
              placeholder="Filter by team..."
              className="w-[220px]"
            />
          )}
        </div>

        <Button variant="outline" size="sm" className="gap-2" onClick={() => exportToCsv(rows, groupLabel)}>
          <Download className="h-4 w-4" />Export Report
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center justify-between">
            <span>Task Analytics — {subView === "user" ? "By User" : "By Task Type"}</span>
            <span className="text-xs font-normal text-muted-foreground">
              {format(periodStart, "dd MMM yyyy")} – {format(periodEnd, "dd MMM yyyy")}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold min-w-[160px]">{groupLabel}</TableHead>
                  <TableHead className="text-center font-semibold min-w-[80px]">No. due items</TableHead>
                  <TableHead className="text-center font-semibold min-w-[80px] bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-300">Overdue</TableHead>
                  <TableHead className="text-center font-semibold min-w-[80px] bg-yellow-100 dark:bg-yellow-950/30 text-yellow-800 dark:text-yellow-300">Due today</TableHead>
                  <TableHead className="text-center font-semibold min-w-[90px]">Due tomorrow</TableHead>
                  <TableHead className="text-center font-semibold min-w-[95px]">Due this week</TableHead>
                  <TableHead className="text-center font-semibold min-w-[95px]">Due next week</TableHead>
                  <TableHead className="text-center font-semibold min-w-[110px] bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-300">Completed in period</TableHead>
                  <TableHead className="text-center font-semibold min-w-[110px]">Completed prior period</TableHead>
                  <TableHead className="text-center font-semibold min-w-[95px]">% Utilisation</TableHead>
                  <TableHead className="text-center font-semibold min-w-[100px]">% SLA adherence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                      No task data available
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {subView === "user" && groupedRows ? (
                      <>
                        {Object.entries(groupedRows.groups)
                          .sort(([a], [b]) => a.localeCompare(b))
                          .map(([teamName, teamRows]) => {
                            const teamTotals = aggregateRows(teamRows);
                            return (
                              <TeamGroupRow key={teamName} teamName={teamName} totals={teamTotals}>
                                {teamRows.map((row, i) => (
                                  <AnalyticsDataRow key={row.label} row={row} index={i} onClick={() => handleRowClick(row)} />
                                ))}
                              </TeamGroupRow>
                            );
                          })}
                        {groupedRows.ungrouped.map((row, i) => (
                          <AnalyticsDataRow key={row.label} row={row} index={i} onClick={() => handleRowClick(row)} />
                        ))}
                      </>
                    ) : (
                      rows.map((row, i) => (
                        <AnalyticsDataRow key={row.label} row={row} index={i} onClick={() => handleRowClick(row)} />
                      ))
                    )}
                    <TotalsRow totals={totals} />
                  </>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
