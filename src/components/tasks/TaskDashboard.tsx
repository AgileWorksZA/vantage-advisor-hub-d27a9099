import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EChartsWrapper } from "@/components/ui/echarts-wrapper";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  ListTodo,
  CalendarIcon,
} from "lucide-react";
import { EnhancedTask, TaskFilters } from "@/hooks/useTasksEnhanced";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subWeeks,
  subMonths,
  isWithinInterval,
  startOfDay,
  endOfDay,
  isBefore,
  format,
} from "date-fns";

type DatePreset = "this_week" | "last_week" | "this_month" | "last_month" | "custom";

const getDateRange = (preset: DatePreset, customFrom?: Date, customTo?: Date): { start: Date; end: Date } => {
  const now = new Date();
  switch (preset) {
    case "this_week":
      return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
    case "last_week": {
      const s = subWeeks(startOfWeek(now, { weekStartsOn: 1 }), 1);
      return { start: s, end: endOfWeek(s, { weekStartsOn: 1 }) };
    }
    case "this_month":
      return { start: startOfMonth(now), end: endOfMonth(now) };
    case "last_month": {
      const lm = subMonths(now, 1);
      return { start: startOfMonth(lm), end: endOfMonth(lm) };
    }
    case "custom":
      return { start: customFrom || startOfWeek(now, { weekStartsOn: 1 }), end: customTo || endOfWeek(now, { weekStartsOn: 1 }) };
    default:
      return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
  }
};

interface TaskDashboardProps {
  tasks: EnhancedTask[];
  onViewDetail: (filters?: TaskFilters) => void;
}

export function TaskDashboard({ tasks, onViewDetail }: TaskDashboardProps) {
  const [datePreset, setDatePreset] = useState<DatePreset>("this_week");
  const [customFrom, setCustomFrom] = useState<Date | undefined>();
  const [customTo, setCustomTo] = useState<Date | undefined>();

  const { start: periodStart, end: periodEnd } = useMemo(
    () => getDateRange(datePreset, customFrom, customTo),
    [datePreset, customFrom, customTo]
  );

  // Filter tasks by date period (based on due_date for open, completed_at for completed)
  const periodTasks = useMemo(() => {
    return tasks.filter(t => {
      const dateStr = t.status === "Completed" ? t.completed_at : t.due_date;
      if (!dateStr) return false;
      const d = new Date(dateStr);
      return isWithinInterval(d, { start: startOfDay(periodStart), end: endOfDay(periodEnd) });
    });
  }, [tasks, periodStart, periodEnd]);

  // Compute stats from period-filtered tasks
  const stats = useMemo(() => {
    const today = startOfDay(new Date());
    const todayStr = format(today, "yyyy-MM-dd");

    const s = {
      totalOpen: periodTasks.filter(t => !["Completed", "Cancelled"].includes(t.status)).length,
      dueToday: periodTasks.filter(t => t.due_date === todayStr && !["Completed", "Cancelled"].includes(t.status)).length,
      overdue: periodTasks.filter(t => t.due_date && isBefore(new Date(t.due_date), today) && !["Completed", "Cancelled"].includes(t.status)).length,
      completedInPeriod: periodTasks.filter(t => t.status === "Completed").length,
      byStatus: {} as Record<string, number>,
      byType: {} as Record<string, number>,
      byPriority: {} as Record<string, number>,
    };
    periodTasks.forEach(t => {
      s.byStatus[t.status] = (s.byStatus[t.status] || 0) + 1;
      s.byType[t.task_type] = (s.byType[t.task_type] || 0) + 1;
      s.byPriority[t.priority] = (s.byPriority[t.priority] || 0) + 1;
    });
    return s;
  }, [periodTasks]);

  // SLA Adherence: use sla_deadline field
  const slaData = useMemo(() => {
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const withSla = periodTasks.filter(t => t.sla_deadline);
    let adherent = 0;
    let breached = 0;
    let atRisk = 0;
    withSla.forEach(t => {
      const deadline = new Date(t.sla_deadline!);
      if (t.status === "Completed" && t.completed_at) {
        if (new Date(t.completed_at) <= deadline) adherent++;
        else breached++;
      } else if (!["Completed", "Cancelled"].includes(t.status) && isBefore(deadline, now)) {
        breached++;
      } else if (!["Completed", "Cancelled"].includes(t.status) && isBefore(deadline, threeDaysFromNow)) {
        atRisk++;
      } else if (t.status === "Completed") {
        adherent++;
      }
    });
    const pct = (adherent + breached) > 0 ? Math.round((adherent / (adherent + breached)) * 100) : 100;
    return { adherent, breached, atRisk, pct, total: withSla.length };
  }, [periodTasks]);

  const periodLabel = useMemo(() => `${format(periodStart, "d MMM")} – ${format(periodEnd, "d MMM yyyy")}`, [periodStart, periodEnd]);
  const periodFromStr = format(periodStart, "yyyy-MM-dd");
  const periodToStr = format(periodEnd, "yyyy-MM-dd");

  const openStatuses = ["Not Started", "In Progress", "Pending Client"];

  const statusChartOption = useMemo(() => ({
    tooltip: { trigger: "item" as const },
    legend: { bottom: "0%", left: "center", itemGap: 8, textStyle: { fontSize: 11 } },
    series: [{
      type: "pie" as const,
      radius: ["35%", "60%"],
      center: ["50%", "45%"],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 0, borderColor: "transparent", borderWidth: 2 },
      label: { show: false },
      emphasis: { label: { show: true, fontSize: 14, fontWeight: "bold" as const } },
      data: Object.entries(stats.byStatus).map(([name, value]) => ({ name, value })),
    }],
  }), [stats.byStatus]);

  const typeChartOption = useMemo(() => ({
    tooltip: { trigger: "axis" as const, axisPointer: { type: "none" as const } },
    grid: { left: "3%", right: "4%", bottom: "3%", top: "3%", containLabel: true },
    xAxis: { type: "value" as const, show: false },
    yAxis: {
      type: "category" as const,
      data: Object.keys(stats.byType).slice(0, 8),
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [{
      type: "bar" as const,
      data: Object.values(stats.byType).slice(0, 8),
      itemStyle: { borderRadius: [0, 4, 4, 0] },
      barWidth: 16,
    }],
  }), [stats.byType]);

  const priorityChartOption = useMemo(() => ({
    tooltip: { trigger: "item" as const },
    legend: { bottom: 0, left: "center" },
    series: [{
      type: "pie" as const,
      radius: "70%",
      data: Object.entries(stats.byPriority).map(([name, value]) => ({ name, value })),
      emphasis: {
        itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: "rgba(0, 0, 0, 0.5)" },
      },
    }],
  }), [stats.byPriority]);

  const slaGaugeOption = useMemo(() => {
    const visible = slaData.adherent + slaData.breached + slaData.atRisk;
    const phantomValue = visible > 0 ? visible : 1;
    const dataItems = visible > 0
      ? [
          { value: slaData.adherent, name: "Met", itemStyle: { color: "#10b981" } },
          { value: slaData.breached, name: "Breached", itemStyle: { color: "#ef4444" } },
          { value: slaData.atRisk, name: "At Risk", itemStyle: { color: "#f59e0b" } },
          { value: phantomValue, name: "", itemStyle: { color: "transparent" }, label: { show: false }, emphasis: { disabled: true } },
        ]
      : [
          { value: 1, name: "No Data", itemStyle: { color: "hsl(var(--muted))" } },
          { value: 1, name: "", itemStyle: { color: "transparent" }, label: { show: false }, emphasis: { disabled: true } },
        ];
    return {
      tooltip: { trigger: "item" as const },
      legend: { show: false },
      graphic: [
        { type: "text", left: "center", top: "55%", style: { text: `${slaData.pct}%`, fontSize: 24, fontWeight: "bold", fill: "#10b981", textAlign: "center" } },
        { type: "text", left: "center", top: "70%", style: { text: "SLA Met", fontSize: 12, fill: "hsl(var(--muted-foreground))", textAlign: "center" } },
      ],
      series: [{
        type: "pie" as const,
        radius: ["50%", "80%"],
        center: ["50%", "70%"],
        startAngle: 180,
        endAngle: 0,
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 0, borderColor: "transparent", borderWidth: 0 },
        label: { show: false },
        emphasis: { scale: false },
        data: dataItems,
      }],
    };
  }, [slaData]);

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = format(yesterday, "yyyy-MM-dd");

  const handleStatusChartClick = (params: any) => {
    if (params?.name) onViewDetail({ status: [params.name], dueDateFrom: periodFromStr, dueDateTo: periodToStr });
  };
  const handleTypeChartClick = (params: any) => {
    if (params?.name) onViewDetail({ taskType: [params.name], dueDateFrom: periodFromStr, dueDateTo: periodToStr });
  };
  const handlePriorityChartClick = (params: any) => {
    if (params?.name) onViewDetail({ priority: [params.name], dueDateFrom: periodFromStr, dueDateTo: periodToStr });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header with date selector */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tasks Dashboard</h1>
          <p className="text-muted-foreground">Overview of your task performance</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={datePreset} onValueChange={(v) => setDatePreset(v as DatePreset)}>
            <SelectTrigger className="w-[160px] gap-2">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this_week">This Week</SelectItem>
              <SelectItem value="last_week">Last Week</SelectItem>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="last_month">Last Month</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          {datePreset === "custom" && (
            <div className="flex items-center gap-1">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="text-xs">
                    {customFrom ? format(customFrom, "dd MMM") : "From"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={customFrom} onSelect={setCustomFrom} />
                </PopoverContent>
              </Popover>
              <span className="text-muted-foreground text-xs">–</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="text-xs">
                    {customTo ? format(customTo, "dd MMM") : "To"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={customTo} onSelect={setCustomTo} />
                </PopoverContent>
              </Popover>
            </div>
          )}
          <span className="text-xs text-muted-foreground">{periodLabel}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onViewDetail({ status: openStatuses, dueDateFrom: periodFromStr, dueDateTo: periodToStr })}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <ListTodo className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Open</p>
                <p className="text-2xl font-bold">{stats.totalOpen}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onViewDetail({ dueDateFrom: todayStr, dueDateTo: todayStr, status: openStatuses })}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 rounded-full">
                <Clock className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Due Today</p>
                <p className="text-2xl font-bold">{stats.dueToday}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onViewDetail({ dueDateTo: yesterdayStr, status: openStatuses })}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-destructive/10 rounded-full">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold">{stats.overdue}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onViewDetail({ status: ["Completed"], dueDateFrom: periodFromStr, dueDateTo: periodToStr })}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-full">
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed in Period</p>
                <p className="text-2xl font-bold">{stats.completedInPeriod}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="cursor-pointer">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tasks by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <EChartsWrapper option={statusChartOption} height={220} onEvents={{ click: handleStatusChartClick }} />
          </CardContent>
        </Card>

        <Card className="cursor-pointer">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tasks by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <EChartsWrapper option={typeChartOption} height={220} onEvents={{ click: handleTypeChartClick }} />
          </CardContent>
        </Card>

        <Card className="cursor-pointer">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tasks by Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <EChartsWrapper option={priorityChartOption} height={220} onEvents={{ click: handlePriorityChartClick }} />
          </CardContent>
        </Card>

        <Card className="cursor-pointer" onClick={() => onViewDetail({ status: openStatuses, dueDateFrom: periodFromStr, dueDateTo: periodToStr })}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">SLA Adherence</CardTitle>
          </CardHeader>
          <CardContent>
            <EChartsWrapper option={slaGaugeOption} height={160} onEvents={{}} />
            <div className="flex justify-center gap-4 mt-1 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {slaData.adherent} Met
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                {slaData.breached} Breached
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                {slaData.atRisk} At Risk
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
