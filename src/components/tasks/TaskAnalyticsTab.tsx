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

import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, Users, ListTodo, CalendarIcon, ChevronRight, X, Save, BookmarkCheck, Trash2, ChevronsUpDown, ChevronsDownUp, Settings2 } from "lucide-react";

import { EnhancedTask, TaskFilters } from "@/hooks/useTasksEnhanced";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { useRegion } from "@/contexts/RegionContext";
import { useSavedTaskFilters } from "@/hooks/useSavedTaskFilters";
import { useTaskTypeStandards } from "@/hooks/useTaskTypeStandards";
import { toast } from "sonner";
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
  const utilVals = rows.filter((r) => r.utilisationPct !== null).map((r) => r.utilisationPct!);
  t.utilisationPct = utilVals.length > 0 ? Math.round(utilVals.reduce((a, b) => a + b, 0) / utilVals.length) : null;
  const slaVals = rows.filter((r) => r.slaPct !== null).map((r) => r.slaPct!);
  t.slaPct = slaVals.length > 0 ? Math.round(slaVals.reduce((a, b) => a + b, 0) / slaVals.length) : null;
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

function AnalyticsDataRow({ row, index, onCellClick, indented }: { row: AnalyticsRow; index: number; onCellClick: (column: string) => void; indented?: boolean }) {
  return (
    <TableRow
      className={`cursor-pointer hover:bg-muted/60 border-l-4 border-l-transparent text-sm ${index % 2 === 1 ? "bg-muted/10" : ""}`}
    >
      <TableCell className="font-normal" onClick={() => onCellClick("all")}>{indented ? <span className="pl-8">{row.label}</span> : row.label}</TableCell>
      <TableCell className="text-center cursor-pointer hover:underline" onClick={() => onCellClick("dueItems")}>{row.dueItems || "-"}</TableCell>
      <TableCell className="text-center cursor-pointer hover:underline" onClick={() => onCellClick("overdue")}>
        {row.overdue > 0 ? <Badge variant="destructive" className="text-xs">{row.overdue}</Badge> : "-"}
      </TableCell>
      <TableCell className="text-center cursor-pointer hover:underline" onClick={() => onCellClick("dueToday")}>
        {row.dueToday > 0 ? <Badge className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/30 text-xs">{row.dueToday}</Badge> : "-"}
      </TableCell>
      <TableCell className="text-center cursor-pointer hover:underline" onClick={() => onCellClick("dueTomorrow")}>{row.dueTomorrow || "-"}</TableCell>
      <TableCell className="text-center cursor-pointer hover:underline" onClick={() => onCellClick("dueThisWeek")}>{row.dueThisWeek || "-"}</TableCell>
      <TableCell className="text-center cursor-pointer hover:underline" onClick={() => onCellClick("dueNextWeek")}>{row.dueNextWeek || "-"}</TableCell>
      <TableCell className="text-center cursor-pointer hover:underline" onClick={() => onCellClick("completedInPeriod")}>
        {row.completedInPeriod > 0 ? <Badge className="bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30 text-xs">{row.completedInPeriod}</Badge> : "-"}
      </TableCell>
      <TableCell className="text-center cursor-pointer hover:underline" onClick={() => onCellClick("completedPriorPeriod")}>{row.completedPriorPeriod || "-"}</TableCell>
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
      <TableCell className="text-center">{totals.utilisationPct !== null ? `${totals.utilisationPct}%` : "-"}</TableCell>
      <TableCell className="text-center">
        {totals.slaPct !== null ? (
          <span className={totals.slaPct >= 80 ? "text-green-600" : totals.slaPct >= 50 ? "text-yellow-600" : "text-red-600"}>
            {totals.slaPct}%
          </span>
        ) : "-"}
      </TableCell>
    </TableRow>
  );
}

function AdviserGroupRow({ adviserName, totals, children, open, onToggle, onCellClick }: { adviserName: string; totals: ReturnType<typeof aggregateRows>; children: React.ReactNode; open: boolean; onToggle: () => void; onCellClick: (column: string) => void }) {
  return (
    <>
      <TableRow className="bg-primary/10 dark:bg-primary/20 cursor-pointer hover:bg-primary/15 dark:hover:bg-primary/25 font-semibold border-l-4 border-l-primary">
        <TableCell onClick={onToggle}>
          <div className="flex items-center gap-2">
            <ChevronRight className={`h-4 w-4 transition-transform ${open ? "rotate-90" : ""}`} />
            <span
              className="tracking-wide text-sm hover:underline"
              onClick={(e) => { e.stopPropagation(); onCellClick("all"); }}
            >
              {adviserName}
            </span>
          </div>
        </TableCell>
        <TableCell className="text-center cursor-pointer hover:underline" onClick={() => onCellClick("dueItems")}>{totals.dueItems || "-"}</TableCell>
        <TableCell className="text-center cursor-pointer hover:underline" onClick={() => onCellClick("overdue")}>{totals.overdue ? <Badge variant="destructive" className="text-xs">{totals.overdue}</Badge> : "-"}</TableCell>
        <TableCell className="text-center cursor-pointer hover:underline" onClick={() => onCellClick("dueToday")}>{totals.dueToday || "-"}</TableCell>
        <TableCell className="text-center cursor-pointer hover:underline" onClick={() => onCellClick("dueTomorrow")}>{totals.dueTomorrow || "-"}</TableCell>
        <TableCell className="text-center cursor-pointer hover:underline" onClick={() => onCellClick("dueThisWeek")}>{totals.dueThisWeek || "-"}</TableCell>
        <TableCell className="text-center cursor-pointer hover:underline" onClick={() => onCellClick("dueNextWeek")}>{totals.dueNextWeek || "-"}</TableCell>
        <TableCell className="text-center cursor-pointer hover:underline" onClick={() => onCellClick("completedInPeriod")}>{totals.completedInPeriod || "-"}</TableCell>
        <TableCell className="text-center cursor-pointer hover:underline" onClick={() => onCellClick("completedPriorPeriod")}>{totals.completedPriorPeriod || "-"}</TableCell>
        <TableCell className="text-center">-</TableCell>
        <TableCell className="text-center">-</TableCell>
      </TableRow>
      {open && children}
    </>
  );
}

export function TaskAnalyticsTab({ tasks, onDrillDown }: TaskAnalyticsTabProps) {
  const [subView, setSubView] = useState<"user" | "type">("user");
  const [datePreset, setDatePreset] = useState<DatePreset>("this_week");
  const [customFrom, setCustomFrom] = useState<Date | undefined>();
  const [customTo, setCustomTo] = useState<Date | undefined>();
  const [expandedAdvisors, setExpandedAdvisors] = useState<Set<string>>(new Set());
  const [expandedInitialized, setExpandedInitialized] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [savedViewsSearch, setSavedViewsSearch] = useState("");

  const { teamMembers } = useTeamMembers();
  const { selectedRegion, selectedAdvisors, regionalData } = useRegion();
  const { savedFilters, saveFilter, deleteFilter } = useSavedTaskFilters();
  const { standards, upsertStandard } = useTaskTypeStandards();
  const [showStandards, setShowStandards] = useState(false);
  const [editingStandards, setEditingStandards] = useState<Record<string, { mins: number; sla: number }>>({});
  const analyticsSavedFilters = useMemo(
    () => savedFilters.filter((f) => (f.filters as any)?.type === "analytics"),
    [savedFilters]
  );

  const filteredSavedViews = useMemo(
    () => analyticsSavedFilters.filter((f) => f.name.toLowerCase().includes(savedViewsSearch.toLowerCase())),
    [analyticsSavedFilters, savedViewsSearch]
  );

  // Filter team members by current jurisdiction and selected advisors
  const jurisdictionMembers = useMemo(
    () => teamMembers.filter((m) => m.jurisdiction === selectedRegion && m.advisor_initials && selectedAdvisors.includes(m.advisor_initials)),
    [teamMembers, selectedRegion, selectedAdvisors]
  );

  // Build adviser groups: key = advisor_initials, value = { adviserName, assistants[] }
  const adviserGroups = useMemo(() => {
    const groups: Record<string, { adviserName: string; primaryMemberName: string; assistantNames: string[] }> = {};
    
    // Build a map from advisor_initials to adviser display name
    const advisorNameMap: Record<string, string> = {};
    regionalData.advisors.forEach((a) => {
      advisorNameMap[a.initials] = a.name;
    });

    jurisdictionMembers.forEach((m) => {
      const initials = m.advisor_initials;
      if (!initials) return;
      
      if (!groups[initials]) {
        groups[initials] = {
          adviserName: advisorNameMap[initials] || initials,
          primaryMemberName: "",
          assistantNames: [],
        };
      }
      
      if (m.is_primary_adviser) {
        groups[initials].primaryMemberName = m.name;
      } else {
        groups[initials].assistantNames.push(m.name);
      }
    });
    
    return groups;
  }, [jurisdictionMembers, regionalData.advisors]);

  const { periodStart, periodEnd, priorStart, priorEnd, workingDays } = useMemo(() => {
    const { start, end } = getDateRange(datePreset, customFrom, customTo);
    const periodDays = differenceInDays(end, start) + 1;
    const prior = { start: addDays(start, -periodDays), end: addDays(start, -1) };
    return {
      periodStart: start, periodEnd: end,
      priorStart: prior.start, priorEnd: prior.end,
      workingDays: getWorkingDays(start, end),
    };
  }, [datePreset, customFrom, customTo]);

  const rows = useMemo(
    () => computeRows(tasks, subView === "user" ? "assigned_to_name" : "task_type", periodStart, periodEnd, priorStart, priorEnd, workingDays),
    [tasks, subView, periodStart, periodEnd, priorStart, priorEnd, workingDays]
  );

  // Group rows by adviser initials for the "user" sub-view
  const groupedByAdviser = useMemo(() => {
    if (subView !== "user") return null;

    // Build a name -> advisor_initials lookup
    const nameToInitials: Record<string, string> = {};
    jurisdictionMembers.forEach((m) => {
      if (m.advisor_initials) nameToInitials[m.name] = m.advisor_initials;
    });

    const result: Record<string, AnalyticsRow[]> = {};
    rows.forEach((row) => {
      const initials = nameToInitials[row.label];
      if (!initials) return; // skip unmatched (e.g. "Unassigned")
      if (!result[initials]) result[initials] = [];
      result[initials].push(row);
    });

    return result;
  }, [rows, subView, jurisdictionMembers]);

  // Initialize expanded state with all adviser initials
  const allAdviserKeys = useMemo(() => groupedByAdviser ? Object.keys(groupedByAdviser) : [], [groupedByAdviser]);
  if (!expandedInitialized && allAdviserKeys.length > 0) {
    setExpandedAdvisors(new Set(allAdviserKeys));
    setExpandedInitialized(true);
  }

  const toggleAdviser = (initials: string) => {
    setExpandedAdvisors(prev => {
      const next = new Set(prev);
      if (next.has(initials)) next.delete(initials);
      else next.add(initials);
      return next;
    });
  };

  const totals = useMemo(() => aggregateRows(rows), [rows]);

  const buildColumnFilters = (column: string): Partial<TaskFilters> => {
    const now = new Date();
    const today = startOfDay(now);
    const todayStr = format(today, "yyyy-MM-dd");
    const tomorrow = addDays(today, 1);
    const tomorrowStr = format(tomorrow, "yyyy-MM-dd");
    const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
    const thisWeekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const nextWeekStart = addDays(thisWeekEnd, 1);
    const nextWeekEnd = endOfWeek(nextWeekStart, { weekStartsOn: 1 });
    const yesterday = addDays(today, -1);

    switch (column) {
      case "overdue":
        return { dueDateTo: format(yesterday, "yyyy-MM-dd"), status: ["Not Started", "In Progress", "Pending Client"] };
      case "dueToday":
        return { dueDateFrom: todayStr, dueDateTo: todayStr, status: ["Not Started", "In Progress", "Pending Client"] };
      case "dueTomorrow":
        return { dueDateFrom: tomorrowStr, dueDateTo: tomorrowStr, status: ["Not Started", "In Progress", "Pending Client"] };
      case "dueThisWeek":
        return { dueDateFrom: format(thisWeekStart, "yyyy-MM-dd"), dueDateTo: format(thisWeekEnd, "yyyy-MM-dd"), status: ["Not Started", "In Progress", "Pending Client"] };
      case "dueNextWeek":
        return { dueDateFrom: format(nextWeekStart, "yyyy-MM-dd"), dueDateTo: format(nextWeekEnd, "yyyy-MM-dd"), status: ["Not Started", "In Progress", "Pending Client"] };
      case "completedInPeriod":
        return { status: ["Completed"], dueDateFrom: format(periodStart, "yyyy-MM-dd"), dueDateTo: format(periodEnd, "yyyy-MM-dd") };
      case "completedPriorPeriod":
        return { status: ["Completed"], dueDateFrom: format(priorStart, "yyyy-MM-dd"), dueDateTo: format(priorEnd, "yyyy-MM-dd") };
      case "dueItems":
        return { status: ["Not Started", "In Progress", "Pending Client"] };
      default:
        return {};
    }
  };

  const handleCellClick = (row: AnalyticsRow, column: string) => {
    const filters: TaskFilters = { ...buildColumnFilters(column) };
    if (subView === "type") {
      filters.taskType = [row.filterKey];
    } else {
      filters.assignedTo = row.filterKey;
    }
    onDrillDown(filters);
  };




  const groupLabel = subView === "user" ? "Assigned To" : "Task Type";
  const presetLabels: Record<DatePreset, string> = {
    this_week: "This Week", last_week: "Last Week",
    this_month: "This Month", last_month: "Last Month",
    custom: "Custom Range",
  };

  const isDefaultFilters = datePreset === "this_week";

  const getDateLabel = () => {
    if (datePreset === "custom" && customFrom && customTo) {
      return `${format(customFrom, "dd MMM")} – ${format(customTo, "dd MMM yyyy")}`;
    }
    if (datePreset !== "this_week") return presetLabels[datePreset];
    return null;
  };

  const resetFilters = () => {
    setSubView("user");
    setDatePreset("this_week");
    setCustomFrom(undefined);
    setCustomTo(undefined);
  };

  const handleSaveFilter = async () => {
    if (!filterName.trim()) return;
    const payload: any = {
      type: "analytics",
      subView,
      datePreset,
      customFrom: customFrom?.toISOString(),
      customTo: customTo?.toISOString(),
    };
    await saveFilter(filterName.trim(), payload);
    setFilterName("");
    setSaveDialogOpen(false);
  };

  const applySavedFilter = (filters: any) => {
    const f = typeof filters === "string" ? JSON.parse(filters) : filters;
    if (f.subView) setSubView(f.subView);
    if (f.datePreset) setDatePreset(f.datePreset);
    setCustomFrom(f.customFrom ? new Date(f.customFrom) : undefined);
    setCustomTo(f.customTo ? new Date(f.customTo) : undefined);
  };

  const dateLabel = getDateLabel();

  return (
    <div className="p-6 space-y-4">
      {/* Row 1: Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Tabs value={subView} onValueChange={(v) => setSubView(v as "user" | "type")}>
            <TabsList>
              <TabsTrigger value="user" className="gap-2"><Users className="h-4 w-4" />By User</TabsTrigger>
              <TabsTrigger value="type" className="gap-2"><ListTodo className="h-4 w-4" />By Task Type</TabsTrigger>
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

          {analyticsSavedFilters.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-2">
                  <BookmarkCheck className="h-4 w-4" />Saved Views
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[260px]">
                <div className="p-2">
                  <Input
                    placeholder="Search saved views..."
                    value={savedViewsSearch}
                    onChange={(e) => setSavedViewsSearch(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                {filteredSavedViews.length === 0 ? (
                  <div className="px-2 py-3 text-xs text-muted-foreground text-center">No saved views found</div>
                ) : (
                  filteredSavedViews.map((sf) => (
                    <DropdownMenuItem
                      key={sf.id}
                      className="flex items-center justify-between cursor-pointer"
                      onSelect={() => applySavedFilter(sf.filters)}
                    >
                      <span className="truncate text-xs">{sf.name}</span>
                      <button
                        className="ml-2 p-0.5 rounded hover:bg-destructive/10"
                        onClick={(e) => { e.stopPropagation(); deleteFilter(sf.id); }}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                      </button>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <Button variant="outline" size="sm" className="gap-2" onClick={() => exportToCsv(rows, groupLabel)}>
          <Download className="h-4 w-4" />Export Report
        </Button>
      </div>

      {/* Row 2: Active Filter Tags */}
      {!isDefaultFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground font-medium">Filtered by:</span>
          {dateLabel && (
            <Badge variant="secondary" className="gap-1 text-xs">
              {dateLabel}
              <button onClick={() => { setDatePreset("this_week"); setCustomFrom(undefined); setCustomTo(undefined); }}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          <button onClick={resetFilters} className="text-xs text-primary hover:underline ml-1">Reset Filters</button>
          <span className="text-muted-foreground">|</span>
          <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={() => setSaveDialogOpen(true)}>
            <Save className="h-3.5 w-3.5" />Save Filter
          </Button>
        </div>
      )}

      {/* Save Filter Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="sm:max-w-[360px]">
          <DialogHeader>
            <DialogTitle>Save Analytics Filter</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Input
              placeholder="Filter name..."
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveFilter()}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSaveFilter} disabled={!filterName.trim()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
         <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center justify-between">
            <span>Task Analytics — {subView === "user" ? "By User" : "By Task Type"}</span>
            <div className="flex items-center gap-2">
              {subView === "user" && groupedByAdviser && Object.keys(groupedByAdviser).length > 0 && (
                <>
                  <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={() => setExpandedAdvisors(new Set(Object.keys(groupedByAdviser)))}>
                    <ChevronsUpDown className="h-3.5 w-3.5" />Expand All
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={() => setExpandedAdvisors(new Set())}>
                    <ChevronsDownUp className="h-3.5 w-3.5" />Collapse All
                  </Button>
                </>
              )}
              <span className="text-xs font-normal text-muted-foreground">
                {format(periodStart, "dd MMM yyyy")} – {format(periodEnd, "dd MMM yyyy")}
              </span>
            </div>
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
                    {subView === "user" && groupedByAdviser ? (
                      <>
                        {Object.entries(adviserGroups)
                          .sort(([, a], [, b]) => a.adviserName.localeCompare(b.adviserName))
                          .map(([initials, group]) => {
                            const adviserRows = groupedByAdviser[initials] || [];
                            if (adviserRows.length === 0) return null;
                            
                            // Separate primary adviser row from assistant rows
                            const primaryRow = adviserRows.find(r => r.label === group.primaryMemberName);
                            const assistantRows = adviserRows.filter(r => r.label !== group.primaryMemberName);
                            
                            // Totals for the adviser header include all members
                            const adviserTotals = aggregateRows(adviserRows);
                            
                            return (
                              <AdviserGroupRow
                                key={initials}
                                adviserName={group.adviserName}
                                totals={adviserTotals}
                                open={expandedAdvisors.has(initials)}
                                onToggle={() => toggleAdviser(initials)}
                                onCellClick={(col) => {
                                  const adviserName = group.primaryMemberName || group.adviserName;
                                  const filters: TaskFilters = { ...buildColumnFilters(col), assignedTo: adviserName };
                                  onDrillDown(filters);
                                }}
                              >
                                {assistantRows.map((row, i) => (
                                  <AnalyticsDataRow key={row.label} row={row} index={i} indented onCellClick={(col) => handleCellClick(row, col)} />
                                ))}
                              </AdviserGroupRow>
                            );
                          })}
                      </>
                    ) : (
                      rows.map((row, i) => (
                        <AnalyticsDataRow key={row.label} row={row} index={i} onCellClick={(col) => handleCellClick(row, col)} />
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

      {/* Task Type Standards Management */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              Task Type Standards
            </span>
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setShowStandards(!showStandards)}>
              {showStandards ? "Hide" : "Show"}
            </Button>
          </CardTitle>
        </CardHeader>
        {showStandards && (
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold min-w-[180px]">Task Type</TableHead>
                    <TableHead className="text-center font-semibold min-w-[160px]">Standard Execution (mins)</TableHead>
                    <TableHead className="text-center font-semibold min-w-[140px]">SLA Target (hours)</TableHead>
                    <TableHead className="text-center font-semibold min-w-[80px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {["Annual Review", "Portfolio Review", "Client Complaint", "Follow-up", "Compliance", "Onboarding", "Document Request"].map((taskType) => {
                    const existing = standards.find((s) => s.task_type === taskType);
                    const editing = editingStandards[taskType];
                    const mins = editing?.mins ?? existing?.standard_execution_minutes ?? 0;
                    const sla = editing?.sla ?? existing?.sla_hours ?? 0;

                    return (
                      <TableRow key={taskType}>
                        <TableCell className="font-medium">{taskType}</TableCell>
                        <TableCell className="text-center">
                          <Input
                            type="number"
                            className="w-24 mx-auto text-center h-8"
                            value={mins}
                            onChange={(e) =>
                              setEditingStandards((prev) => ({
                                ...prev,
                                [taskType]: { mins: Number(e.target.value), sla: prev[taskType]?.sla ?? sla },
                              }))
                            }
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Input
                            type="number"
                            className="w-24 mx-auto text-center h-8"
                            value={sla}
                            onChange={(e) =>
                              setEditingStandards((prev) => ({
                                ...prev,
                                [taskType]: { mins: prev[taskType]?.mins ?? mins, sla: Number(e.target.value) },
                              }))
                            }
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            disabled={!editing}
                            onClick={() => {
                              upsertStandard.mutate(
                                { task_type: taskType, standard_execution_minutes: editing.mins, sla_hours: editing.sla },
                                {
                                  onSuccess: () => {
                                    toast.success(`${taskType} standards updated`);
                                    setEditingStandards((prev) => {
                                      const next = { ...prev };
                                      delete next[taskType];
                                      return next;
                                    });
                                  },
                                }
                              );
                            }}
                          >
                            <Save className="h-3 w-3 mr-1" />Save
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
