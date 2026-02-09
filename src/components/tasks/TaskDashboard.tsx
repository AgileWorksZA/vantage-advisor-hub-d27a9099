import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EChartsWrapper } from "@/components/ui/echarts-wrapper";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  ListTodo,
} from "lucide-react";
import { TaskStats, TaskFilters } from "@/hooks/useTasksEnhanced";

interface TaskDashboardProps {
  stats: TaskStats;
  onViewDetail: (filters?: TaskFilters) => void;
}

export function TaskDashboard({ stats, onViewDetail }: TaskDashboardProps) {
  const statusChartOption = useMemo(() => ({
    tooltip: { trigger: "item" as const },
    legend: { bottom: 0, left: "center" },
    series: [
      {
        type: "pie" as const,
        radius: ["40%", "70%"],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 10, borderColor: "transparent", borderWidth: 2 },
        label: { show: false },
        emphasis: { label: { show: true, fontSize: 14, fontWeight: "bold" as const } },
        data: Object.entries(stats.byStatus).map(([name, value]) => ({ name, value })),
      },
    ],
  }), [stats.byStatus]);

  const typeChartOption = useMemo(() => ({
    tooltip: { trigger: "axis" as const, axisPointer: { type: "shadow" as const } },
    grid: { left: "3%", right: "4%", bottom: "3%", top: "3%", containLabel: true },
    xAxis: { type: "value" as const, show: false },
    yAxis: {
      type: "category" as const,
      data: Object.keys(stats.byType).slice(0, 8),
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [
      {
        type: "bar" as const,
        data: Object.values(stats.byType).slice(0, 8),
        itemStyle: { borderRadius: [0, 4, 4, 0] },
        barWidth: 16,
      },
    ],
  }), [stats.byType]);

  const priorityChartOption = useMemo(() => ({
    tooltip: { trigger: "item" as const },
    legend: { bottom: 0, left: "center" },
    series: [
      {
        type: "pie" as const,
        radius: "70%",
        data: Object.entries(stats.byPriority).map(([name, value]) => ({ name, value })),
        emphasis: {
          itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: "rgba(0, 0, 0, 0.5)" },
        },
      },
    ],
  }), [stats.byPriority]);

  const slaCompliance = stats.totalOpen > 0 
    ? Math.round(((stats.totalOpen - stats.overdue) / stats.totalOpen) * 100)
    : 100;

  const slaGaugeOption = useMemo(() => ({
    series: [
      {
        type: "gauge" as const,
        startAngle: 180,
        endAngle: 0,
        min: 0,
        max: 100,
        splitNumber: 4,
        itemStyle: {
          color: slaCompliance >= 80 ? "hsl(var(--chart-2))" : slaCompliance >= 50 ? "hsl(var(--chart-4))" : "hsl(var(--destructive))",
        },
        progress: { show: true, width: 18 },
        pointer: { show: false },
        axisLine: { lineStyle: { width: 18 } },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        title: { show: false },
        detail: {
          valueAnimation: true,
          offsetCenter: [0, "0%"],
          fontSize: 24,
          fontWeight: "bold" as const,
          formatter: "{value}%",
          color: "inherit",
        },
        data: [{ value: slaCompliance }],
      },
    ],
  }), [slaCompliance]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const handleStatusChartClick = (params: any) => {
    if (params?.name) onViewDetail({ status: [params.name] });
  };
  const handleTypeChartClick = (params: any) => {
    if (params?.name) onViewDetail({ taskType: [params.name] });
  };
  const handlePriorityChartClick = (params: any) => {
    if (params?.name) onViewDetail({ priority: [params.name] });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Tasks Dashboard</h1>
        <p className="text-muted-foreground">Overview of your task performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onViewDetail()}>
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

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onViewDetail({ dueDateFrom: todayStr, dueDateTo: todayStr })}>
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

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onViewDetail({ dueDateTo: yesterdayStr })}>
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

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onViewDetail({ status: ["Completed"] })}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-full">
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed This Week</p>
                <p className="text-2xl font-bold">{stats.completedThisWeek}</p>
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

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">SLA Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <EChartsWrapper option={slaGaugeOption} height={220} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
