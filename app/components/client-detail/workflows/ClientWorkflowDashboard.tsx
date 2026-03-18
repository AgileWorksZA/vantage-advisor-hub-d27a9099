import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EChartsWrapper } from "@/components/ui/echarts-wrapper";
import { CheckCircle2, Clock, AlertTriangle, ListTodo } from "lucide-react";
import { WorkflowListItem } from "@/hooks/useClientWorkflows";
import { isBefore, startOfDay, format } from "date-fns";

interface ClientWorkflowDashboardProps {
  workflows: WorkflowListItem[];
}

export function ClientWorkflowDashboard({ workflows }: ClientWorkflowDashboardProps) {
  const stats = useMemo(() => {
    const today = startOfDay(new Date());
    const todayStr = format(today, "dd MMM yyyy");

    const open = workflows.filter(w => !["Complete", "Cancelled"].includes(w.status));
    const overdue = open.filter(w => {
      if (!w.endDate || w.endDate === "-") return false;
      try {
        return isBefore(new Date(w.endDate), today);
      } catch { return false; }
    });
    const dueToday = open.filter(w => w.endDate === todayStr);
    const completed = workflows.filter(w => w.status === "Complete");

    const byStatus: Record<string, number> = {};
    const byService: Record<string, number> = {};
    workflows.forEach(w => {
      byStatus[w.status] = (byStatus[w.status] || 0) + 1;
      byService[w.service] = (byService[w.service] || 0) + 1;
    });

    return {
      totalOpen: open.length,
      dueToday: dueToday.length,
      overdue: overdue.length,
      completed: completed.length,
      byStatus,
      byService,
    };
  }, [workflows]);

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

  const serviceChartOption = useMemo(() => ({
    tooltip: { trigger: "axis" as const, axisPointer: { type: "none" as const } },
    grid: { left: "3%", right: "4%", bottom: "3%", top: "3%", containLabel: true },
    xAxis: { type: "value" as const, show: false },
    yAxis: {
      type: "category" as const,
      data: Object.keys(stats.byService).slice(0, 8),
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [{
      type: "bar" as const,
      data: Object.values(stats.byService).slice(0, 8),
      itemStyle: { borderRadius: [0, 4, 4, 0] },
      barWidth: 16,
    }],
  }), [stats.byService]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
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
        <Card>
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
        <Card>
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
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-full">
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Workflows by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <EChartsWrapper option={statusChartOption} height={220} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Workflows by Service</CardTitle>
          </CardHeader>
          <CardContent>
            <EChartsWrapper option={serviceChartOption} height={220} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
