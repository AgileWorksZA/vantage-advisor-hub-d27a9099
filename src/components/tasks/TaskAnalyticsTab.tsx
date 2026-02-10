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
import { Download, Users, ListTodo } from "lucide-react";
import { EnhancedTask, TaskFilters } from "@/hooks/useTasksEnhanced";
import {
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  addDays,
  isWithinInterval,
  isBefore,
  isToday,
  isTomorrow,
  subWeeks,
  isWeekend,
  eachDayOfInterval,
  format,
} from "date-fns";

interface TaskAnalyticsTabProps {
  tasks: EnhancedTask[];
  onDrillDown: (filters: TaskFilters) => void;
}

interface AnalyticsRow {
  label: string;
  filterKey: string;
  dueItems: number;
  overdue: number;
  dueToday: number;
  dueTomorrow: number;
  dueThisWeek: number;
  dueNextWeek: number;
  completedThisWeek: number;
  completedLastWeek: number;
  utilisationPct: number | null;
  slaPct: number | null;
}

const getWorkingDays = (start: Date, end: Date): number => {
  const days = eachDayOfInterval({ start, end });
  return days.filter((d) => !isWeekend(d)).length;
};

const computeRows = (
  tasks: EnhancedTask[],
  groupBy: "assigned_to_name" | "task_type"
): AnalyticsRow[] => {
  const now = new Date();
  const today = startOfDay(now);
  const tomorrow = addDays(today, 1);
  const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
  const thisWeekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const lastWeekStart = subWeeks(thisWeekStart, 1);
  const lastWeekEnd = addDays(thisWeekStart, -1);
  const nextWeekStart = addDays(thisWeekEnd, 1);
  const nextWeekEnd = endOfWeek(nextWeekStart, { weekStartsOn: 1 });
  const workingDaysThisWeek = getWorkingDays(thisWeekStart, thisWeekEnd);

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
          isWithinInterval(new Date(t.due_date), {
            start: thisWeekStart,
            end: thisWeekEnd,
          })
      ).length;
      const dueNextWeek = open.filter(
        (t) =>
          t.due_date &&
          isWithinInterval(new Date(t.due_date), {
            start: nextWeekStart,
            end: nextWeekEnd,
          })
      ).length;

      const completedThisWeek = groupTasks.filter(
        (t) =>
          t.status === "Completed" &&
          t.completed_at &&
          isWithinInterval(new Date(t.completed_at), {
            start: thisWeekStart,
            end: endOfDay(thisWeekEnd),
          })
      );
      const completedLastWeek = groupTasks.filter(
        (t) =>
          t.status === "Completed" &&
          t.completed_at &&
          isWithinInterval(new Date(t.completed_at), {
            start: lastWeekStart,
            end: endOfDay(lastWeekEnd),
          })
      );

      // Utilisation: sum standard_execution_minutes of completed this week / (7.5h * working days)
      const totalExecMins = completedThisWeek.reduce(
        (sum, t) => sum + ((t as any).standard_execution_minutes || 0),
        0
      );
      const maxMins = 7.5 * workingDaysThisWeek * 60;
      const utilisationPct =
        maxMins > 0 && totalExecMins > 0
          ? Math.round((totalExecMins / maxMins) * 100)
          : null;

      // SLA adherence: completed within SLA / total completed
      const allCompleted = [...completedThisWeek, ...completedLastWeek];
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
        completedThisWeek: completedThisWeek.length,
        completedLastWeek: completedLastWeek.length,
        utilisationPct,
        slaPct,
      };
    })
    .sort((a, b) => b.dueItems - a.dueItems);
};

const exportToCsv = (rows: AnalyticsRow[], viewLabel: string) => {
  const headers = [
    viewLabel,
    "Due Items",
    "Overdue",
    "Due Today",
    "Due Tomorrow",
    "Due This Week",
    "Due Next Week",
    "Completed This Week",
    "Completed Last Week",
    "Utilisation %",
    "SLA Adherence %",
  ];
  const csvRows = [
    headers.join(","),
    ...rows.map((r) =>
      [
        `"${r.label}"`,
        r.dueItems,
        r.overdue,
        r.dueToday,
        r.dueTomorrow,
        r.dueThisWeek,
        r.dueNextWeek,
        r.completedThisWeek,
        r.completedLastWeek,
        r.utilisationPct ?? "-",
        r.slaPct ?? "-",
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

export function TaskAnalyticsTab({ tasks, onDrillDown }: TaskAnalyticsTabProps) {
  const [subView, setSubView] = useState<"user" | "type">("user");

  const rows = useMemo(
    () =>
      computeRows(
        tasks,
        subView === "user" ? "assigned_to_name" : "task_type"
      ),
    [tasks, subView]
  );

  const totals = useMemo(() => {
    const t = {
      dueItems: 0,
      overdue: 0,
      dueToday: 0,
      dueTomorrow: 0,
      dueThisWeek: 0,
      dueNextWeek: 0,
      completedThisWeek: 0,
      completedLastWeek: 0,
    };
    rows.forEach((r) => {
      t.dueItems += r.dueItems;
      t.overdue += r.overdue;
      t.dueToday += r.dueToday;
      t.dueTomorrow += r.dueTomorrow;
      t.dueThisWeek += r.dueThisWeek;
      t.dueNextWeek += r.dueNextWeek;
      t.completedThisWeek += r.completedThisWeek;
      t.completedLastWeek += r.completedLastWeek;
    });
    return t;
  }, [rows]);

  const handleRowClick = (row: AnalyticsRow) => {
    const filters: TaskFilters = {};
    if (subView === "type") {
      filters.taskType = [row.filterKey];
    }
    // For user view, we'd filter by assignedTo but we only have names not IDs currently
    onDrillDown(filters);
  };

  const groupLabel = subView === "user" ? "Assigned To" : "Task Type";

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Tabs
          value={subView}
          onValueChange={(v) => setSubView(v as "user" | "type")}
        >
          <TabsList>
            <TabsTrigger value="user" className="gap-2">
              <Users className="h-4 w-4" />
              By User
            </TabsTrigger>
            <TabsTrigger value="type" className="gap-2">
              <ListTodo className="h-4 w-4" />
              By Task Type
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => exportToCsv(rows, groupLabel)}
        >
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            Task Analytics — {subView === "user" ? "By User" : "By Task Type"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold min-w-[160px]">
                    {groupLabel}
                  </TableHead>
                  <TableHead className="text-center font-semibold min-w-[80px]">
                    No. due items
                  </TableHead>
                  <TableHead className="text-center font-semibold min-w-[80px] bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-300">
                    Overdue
                  </TableHead>
                  <TableHead className="text-center font-semibold min-w-[80px] bg-yellow-100 dark:bg-yellow-950/30 text-yellow-800 dark:text-yellow-300">
                    Due today
                  </TableHead>
                  <TableHead className="text-center font-semibold min-w-[90px]">
                    Due tomorrow
                  </TableHead>
                  <TableHead className="text-center font-semibold min-w-[95px]">
                    Due this week
                  </TableHead>
                  <TableHead className="text-center font-semibold min-w-[95px]">
                    Due next week
                  </TableHead>
                  <TableHead className="text-center font-semibold min-w-[110px] bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-300">
                    Completed this week
                  </TableHead>
                  <TableHead className="text-center font-semibold min-w-[110px]">
                    Completed last week
                  </TableHead>
                  <TableHead className="text-center font-semibold min-w-[95px]">
                    % Utilisation
                  </TableHead>
                  <TableHead className="text-center font-semibold min-w-[100px]">
                    % SLA adherence
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={11}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No task data available
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {rows.map((row, i) => (
                      <TableRow
                        key={row.label}
                        className={`cursor-pointer hover:bg-muted/60 ${i % 2 === 1 ? "bg-muted/20" : ""}`}
                        onClick={() => handleRowClick(row)}
                      >
                        <TableCell className="font-medium">
                          {row.label}
                        </TableCell>
                        <TableCell className="text-center">
                          {row.dueItems || "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          {row.overdue > 0 ? (
                            <Badge variant="destructive" className="text-xs">
                              {row.overdue}
                            </Badge>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {row.dueToday > 0 ? (
                            <Badge className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/30 text-xs">
                              {row.dueToday}
                            </Badge>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {row.dueTomorrow || "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          {row.dueThisWeek || "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          {row.dueNextWeek || "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          {row.completedThisWeek > 0 ? (
                            <Badge className="bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30 text-xs">
                              {row.completedThisWeek}
                            </Badge>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {row.completedLastWeek || "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          {row.utilisationPct !== null
                            ? `${row.utilisationPct}%`
                            : "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          {row.slaPct !== null ? (
                            <span
                              className={
                                row.slaPct >= 80
                                  ? "text-green-600"
                                  : row.slaPct >= 50
                                    ? "text-yellow-600"
                                    : "text-red-600"
                              }
                            >
                              {row.slaPct}%
                            </span>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {/* Totals row */}
                    <TableRow className="bg-muted/40 font-semibold border-t-2">
                      <TableCell>Total</TableCell>
                      <TableCell className="text-center">
                        {totals.dueItems}
                      </TableCell>
                      <TableCell className="text-center">
                        {totals.overdue || "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        {totals.dueToday || "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        {totals.dueTomorrow || "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        {totals.dueThisWeek || "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        {totals.dueNextWeek || "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        {totals.completedThisWeek || "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        {totals.completedLastWeek || "-"}
                      </TableCell>
                      <TableCell className="text-center">-</TableCell>
                      <TableCell className="text-center">-</TableCell>
                    </TableRow>
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
