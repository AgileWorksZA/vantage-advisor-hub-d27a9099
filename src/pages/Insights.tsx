import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LayoutDashboard,
  Users,
  Mail,
  CalendarIcon,
  ListTodo,
  LineChart,
  Building2,
  X,
  Award,
  Target,
  DollarSign,
  TrendingUp,
  Users2,
  BarChart3,
  Shield,
  Heart,
  Umbrella,
  Clock,
  ChevronDown,
} from "lucide-react";
import commandCenterIcon from "@/assets/command-center-icon.png";
import vantageLogo from "@/assets/vantage-logo.png";
import { AppHeader } from "@/components/layout/AppHeader";
import { EChartsWrapper, createGradient } from "@/components/ui/echarts-wrapper";

const commissionByTypeData = [
  { month: "Oct 2025", PUFs: -50000, Ongoing: 650000, Lapses: 100000, Initial: 50000, "2nd Year": 30000 },
  { month: "Nov 2025", PUFs: -30000, Ongoing: 700000, Lapses: 80000, Initial: 60000, "2nd Year": 40000 },
  { month: "Dec 2025", PUFs: -20000, Ongoing: 750000, Lapses: 70000, Initial: 45000, "2nd Year": 35000 },
];

const commissionEarnedData = [
  { month: "Oct 2025", value: 650000 },
  { month: "Nov 2025", value: 780000 },
  { month: "Dec 2025", value: 720000 },
];

const monthlyCommissionData = [
  { name: "Target", value: 843734.04, color: "hsl(180, 70%, 45%)" },
  { name: "Actual", value: 784650.28, color: "hsl(45, 93%, 47%)" },
  { name: "Shortfall", value: 59083.76, color: "hsl(142, 76%, 36%)" },
];

const commissionSummaryData = [
  { month: "Jan 2025", target: 835764.76, earned: 745702.7 },
  { month: "Feb 2025", target: 835764.76, earned: 805731.88 },
  { month: "Mar 2025", target: 835764.76, earned: 809900.1 },
  { month: "Apr 2025", target: 835764.76, earned: 721512.82 },
  { month: "May 2025", target: 835764.76, earned: 724693.32 },
  { month: "Jun 2025", target: 835764.76, earned: 915570.04 },
  { month: "Jul 2025", target: 843734.04, earned: 781904.53 },
  { month: "Aug 2025", target: 843734.04, earned: 818029 },
  { month: "Sep 2025", target: 843734.04, earned: 864200.56 },
  { month: "Oct 2025", target: 843734.04, earned: 836458.8 },
  { month: "Nov 2025", target: 843734.04, earned: 806561.87 },
  { month: "Dec 2025", target: 843734.04, earned: 764650.28 },
];

const leaderboardData = [
  { icon: Users2, label: "My Competitors", value: "7/212" },
  { icon: BarChart3, label: "Investment", value: "5/185" },
  { icon: Shield, label: "Risk Benefits", value: "95/166" },
  { icon: Heart, label: "Health Benefits", value: "113/149" },
  { icon: Umbrella, label: "GAP Cover", value: "83/141" },
  { icon: Clock, label: "Short Term", value: "134/158" },
];

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dash", path: "/dashboard" },
  { icon: Users, label: "Clients", path: "/clients" },
  { icon: Mail, label: "Email", path: "/email" },
  { icon: CalendarIcon, label: "Calendar", path: "/calendar" },
  { icon: ListTodo, label: "Tasks", path: "/tasks" },
  { icon: LineChart, label: "Insights", path: "/insights" },
  { icon: Building2, label: "Practice", path: "/practice" },
];

const Insights = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (!session?.user) {
        navigate("/auth");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (!session?.user) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const userName = user?.user_metadata?.full_name || "Adviser";
  const userEmail = user?.email || "adviser@vantage.co";

  // Commission by Type stacked bar chart options
  const commissionByTypeOption = {
    tooltip: {
      trigger: 'axis' as const,
      axisPointer: { type: 'shadow' as const },
      formatter: (params: any) => {
        let result = `<div style="font-weight:600;margin-bottom:4px">${params[0].axisValue}</div>`;
        params.forEach((p: any) => {
          result += `<div style="display:flex;justify-content:space-between;gap:16px">
            <span>${p.marker} ${p.seriesName}</span>
            <span style="font-weight:500">R ${p.value.toLocaleString()}</span>
          </div>`;
        });
        return result;
      },
    },
    grid: { left: 8, right: 8, top: 8, bottom: 24, containLabel: true },
    xAxis: {
      type: 'category' as const,
      data: commissionByTypeData.map(d => d.month),
    },
    yAxis: {
      type: 'value' as const,
      axisLabel: {
        formatter: (v: number) => `${(v / 1000).toFixed(0)}k`,
      },
    },
    series: [
      { name: 'PUFs', type: 'bar' as const, stack: 'total', data: commissionByTypeData.map(d => d.PUFs), itemStyle: { color: 'hsl(210, 70%, 50%)' } },
      { name: 'Ongoing', type: 'bar' as const, stack: 'total', data: commissionByTypeData.map(d => d.Ongoing), itemStyle: { color: 'hsl(180, 70%, 45%)' } },
      { name: 'Lapses', type: 'bar' as const, stack: 'total', data: commissionByTypeData.map(d => d.Lapses), itemStyle: { color: 'hsl(45, 93%, 47%)' } },
      { name: 'Initial', type: 'bar' as const, stack: 'total', data: commissionByTypeData.map(d => d.Initial), itemStyle: { color: 'hsl(0, 70%, 50%)' } },
      { name: '2nd Year', type: 'bar' as const, stack: 'total', data: commissionByTypeData.map(d => d["2nd Year"]), itemStyle: { color: 'hsl(280, 65%, 50%)' } },
    ],
  };

  // Commission Earned bar chart options
  const commissionEarnedOption = {
    tooltip: {
      trigger: 'axis' as const,
      formatter: (params: any) => `${params[0].axisValue}<br/>R ${params[0].value.toLocaleString()}`,
    },
    grid: { left: 8, right: 8, top: 8, bottom: 24, containLabel: true },
    xAxis: {
      type: 'category' as const,
      data: commissionEarnedData.map(d => d.month),
    },
    yAxis: {
      type: 'value' as const,
      axisLabel: {
        formatter: (v: number) => `${(v / 1000).toFixed(0)}k`,
      },
    },
    series: [{
      type: 'bar' as const,
      data: commissionEarnedData.map(d => d.value),
      itemStyle: {
        color: createGradient('hsl(180, 70%, 55%)', 'hsl(180, 70%, 35%)'),
        borderRadius: [4, 4, 0, 0],
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 180, 180, 0.3)',
        },
      },
    }],
  };

  // Monthly Commission pie chart options
  const monthlyCommissionOption = {
    tooltip: {
      trigger: 'item' as const,
      formatter: (params: any) => `${params.name}: R ${params.value.toLocaleString()}`,
    },
    series: [{
      type: 'pie' as const,
      radius: ['50%', '80%'],
      center: ['50%', '50%'],
      data: monthlyCommissionData.map(d => ({
        name: d.name,
        value: d.value,
        itemStyle: { color: d.color },
      })),
      label: { show: false },
      emphasis: {
        itemStyle: {
          shadowBlur: 20,
          shadowColor: 'rgba(0, 0, 0, 0.3)',
        },
        scale: true,
        scaleSize: 10,
      },
      animationType: 'scale' as const,
      animationEasing: 'elasticOut' as const,
    }],
  };

  // Commission Summary area chart options
  const commissionSummaryOption = {
    tooltip: {
      trigger: 'axis' as const,
      formatter: (params: any) => {
        let result = `<div style="font-weight:600;margin-bottom:4px">${params[0].axisValue}</div>`;
        params.forEach((p: any) => {
          result += `<div style="display:flex;justify-content:space-between;gap:16px">
            <span>${p.marker} ${p.seriesName}</span>
            <span style="font-weight:500">R ${p.value.toLocaleString()}</span>
          </div>`;
        });
        return result;
      },
    },
    legend: {
      data: ['Annual Target', 'Annual Earned Commission'],
      bottom: 0,
    },
    grid: { left: 8, right: 8, top: 8, bottom: 40, containLabel: true },
    xAxis: {
      type: 'category' as const,
      data: commissionSummaryData.map(d => d.month),
      boundaryGap: false,
    },
    yAxis: {
      type: 'value' as const,
      axisLabel: {
        formatter: (v: number) => `${(v / 1000000).toFixed(1)}M`,
      },
    },
    dataZoom: [
      {
        type: 'inside' as const,
        start: 0,
        end: 100,
      },
      {
        type: 'slider' as const,
        start: 0,
        end: 100,
        height: 16,
        bottom: 24,
        handleSize: '80%',
      },
    ],
    series: [
      {
        name: 'Annual Target',
        type: 'line' as const,
        data: commissionSummaryData.map(d => d.target),
        smooth: true,
        lineStyle: { color: 'hsl(210, 70%, 50%)', width: 2 },
        itemStyle: { color: 'hsl(210, 70%, 50%)' },
        areaStyle: {
          color: createGradient('hsla(210, 70%, 50%, 0.4)', 'hsla(210, 70%, 50%, 0.05)'),
        },
        emphasis: {
          focus: 'series' as const,
        },
      },
      {
        name: 'Annual Earned Commission',
        type: 'line' as const,
        data: commissionSummaryData.map(d => d.earned),
        smooth: true,
        lineStyle: { color: 'hsl(180, 70%, 45%)', width: 2 },
        itemStyle: { color: 'hsl(180, 70%, 45%)' },
        areaStyle: {
          color: createGradient('hsla(180, 70%, 45%, 0.5)', 'hsla(180, 70%, 45%, 0.05)'),
        },
        emphasis: {
          focus: 'series' as const,
        },
      },
    ],
  };

  return (
    <div className="h-screen bg-muted/30 flex overflow-hidden">
      {/* Sidebar - Fixed */}
      <aside className="w-16 bg-[hsl(180,25%,25%)] flex flex-col items-center py-4 gap-1 shrink-0">
        <Button variant="ghost" size="icon" className="w-10 h-10 text-white/80 hover:bg-white/10 mb-4" onClick={() => navigate("/command-center")} title="Practice Overview">
          <img src={commandCenterIcon} alt="Command Center" className="w-5 h-5" />
        </Button>
        {sidebarItems.map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className={`w-full flex flex-col items-center py-2 text-xs gap-1 ${
              item.path === "/insights"
                ? "bg-white/10 text-white"
                : "text-white/60 hover:bg-white/5 hover:text-white/80"
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </button>
        ))}
        
        {/* Spacer to push logo to bottom */}
        <div className="flex-1" />
        
        {/* VANTAGE Logo - rotated to read bottom to top */}
        <div className="mb-2">
          <img 
            src={vantageLogo} 
            alt="Vantage" 
            className="h-10 object-contain -rotate-90 origin-center"
          />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header - Sticky */}
        <AppHeader
          searchPlaceholder="Search..."
          userName={userName}
          userEmail={userEmail}
          onSignOut={handleSignOut}
          onAccountSettings={() => navigate("/practice")}
        />

        {/* Dashboard Content - Scrollable */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold">Insights Dashboard</h1>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="flex items-center gap-2">
                Riaan Swart
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4">
            {/* Commission by Type */}
            <Card className="col-span-3">
              <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
                <CardTitle className="text-sm font-medium">COMMISSION BY TYPE</CardTitle>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <X className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <Button size="sm" className="bg-[hsl(180,25%,25%)] hover:bg-[hsl(180,25%,20%)] text-white mb-4">
                  3 Months
                </Button>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs mb-4">
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-sm bg-[hsl(210,70%,50%)]"></span>
                    <span>PUFs</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-sm bg-[hsl(180,70%,45%)]"></span>
                    <span>Ongoing</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-sm bg-[hsl(45,93%,47%)]"></span>
                    <span>Lapses</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-sm bg-[hsl(0,70%,50%)]"></span>
                    <span>Initial</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-sm bg-[hsl(280,65%,50%)]"></span>
                    <span>2nd Year</span>
                  </div>
                </div>
                <div className="h-48">
                  <EChartsWrapper
                    height={192}
                    option={commissionByTypeOption}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Commission Earned */}
            <Card className="col-span-3">
              <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
                <CardTitle className="text-sm font-medium">COMMISSION EARNED</CardTitle>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <X className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <Button size="sm" className="bg-[hsl(180,25%,25%)] hover:bg-[hsl(180,25%,20%)] text-white">
                    3 Months
                  </Button>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Last Month</p>
                    <p className="text-sm font-semibold">R800,561.87</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Current Month</p>
                    <p className="text-sm font-semibold">R784,650.28</p>
                  </div>
                </div>
                <div className="h-48">
                  <EChartsWrapper
                    height={192}
                    option={commissionEarnedOption}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Monthly Commission */}
            <Card className="col-span-3">
              <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
                <CardTitle className="text-sm font-medium">MONTHLY COMMISSION</CardTitle>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <X className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="h-48 flex items-center justify-center">
                  <EChartsWrapper
                    height={192}
                    option={monthlyCommissionOption}
                  />
                </div>
                <div className="flex justify-between text-center mt-2">
                  <div>
                    <p className="text-sm font-semibold">R 843,734.04</p>
                    <p className="text-xs text-muted-foreground">Target</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">R 784,650.28</p>
                    <p className="text-xs text-muted-foreground">Actual</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">R 59,083.76</p>
                    <p className="text-xs text-muted-foreground">Shortfall</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Commission Snapshot */}
            <Card className="col-span-3 row-span-2">
              <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
                <CardTitle className="text-sm font-medium">COMMISSION SNAPSHOT</CardTitle>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <X className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Rank Status</p>
                    <p className="text-sm font-medium">Platinum (Millionaires' Club)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Position</p>
                    <p className="text-sm font-medium">7/212</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Commission due next payment</p>
                    <p className="text-sm font-medium">R49,545.15</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Monthly Target Commission</p>
                    <p className="text-sm font-medium">R843,734.04</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Monthly adjusted target</p>
                    <p className="text-sm font-medium">R874,183.83</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Commission Summary */}
            <Card className="col-span-6">
              <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
                <CardTitle className="text-sm font-medium">COMMISSION SUMMARY</CardTitle>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <X className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <Button size="sm" className="bg-[hsl(180,25%,25%)] hover:bg-[hsl(180,25%,20%)] text-white">
                    1 Year
                  </Button>
                  <div className="flex gap-8">
                    <div>
                      <p className="text-xs text-muted-foreground">Annual earned commission YTD</p>
                      <p className="text-sm font-semibold text-[hsl(180,70%,45%)]">R4,879,705.54</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Annual Target Commission</p>
                      <p className="text-sm font-semibold">R10,124,808.49</p>
                    </div>
                  </div>
                </div>
                <div className="h-56">
                  <EChartsWrapper
                    height={224}
                    option={commissionSummaryOption}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Leaderboard Snapshot */}
            <Card className="col-span-3">
              <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
                <CardTitle className="text-sm font-medium">LEADERBOARD SNAPSHOT</CardTitle>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <X className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-3">
                {leaderboardData.map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{item.label}</p>
                      <p className="text-sm font-semibold">{item.value}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Insights;
