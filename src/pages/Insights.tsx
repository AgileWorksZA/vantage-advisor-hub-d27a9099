import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LayoutDashboard, Users, Briefcase, Mail, CalendarIcon, ListTodo, LineChart, Building2, X, Award, Target, DollarSign, TrendingUp, Users2, BarChart3, Shield, Heart, Umbrella, Clock, ChevronDown, GripVertical } from "lucide-react";
import commandCenterIcon from "@/assets/command-center-icon.png";
import vantageLogo from "@/assets/vantage-logo.png";
import { AppHeader } from "@/components/layout/AppHeader";
import { EChartsWrapper, createGradient } from "@/components/ui/echarts-wrapper";
import { format, subMonths } from "date-fns";
import { DraggableWidgetGrid, WidgetLayout } from "@/components/widgets/DraggableWidgetGrid";
import { useWidgetLayout } from "@/hooks/useWidgetLayout";
import GlobalAIChat from "@/components/ai-assistant/GlobalAIChat";

// Generate 60 months of commission by type data (5 years)
const generateCommissionByTypeData = () => {
  const data = [];
  const baseDate = new Date(2025, 11, 1); // December 2025

  for (let i = 59; i >= 0; i--) {
    const date = subMonths(baseDate, i);
    const monthStr = format(date, "MMM yyyy");
    const yearFactor = 1 + (59 - i) / 60 * 0.3; // Growth over time
    const seasonalFactor = 1 + Math.sin((date.getMonth() + 1) * Math.PI / 6) * 0.15;
    data.push({
      month: monthStr,
      PUFs: Math.round((-40000 + Math.random() * 30000) * yearFactor),
      Ongoing: Math.round((600000 + Math.random() * 200000) * yearFactor * seasonalFactor),
      Lapses: Math.round((70000 + Math.random() * 50000) * yearFactor),
      Initial: Math.round((40000 + Math.random() * 30000) * yearFactor * seasonalFactor),
      "2nd Year": Math.round((25000 + Math.random() * 20000) * yearFactor)
    });
  }
  return data;
};

// Generate 60 months of commission earned data (5 years)
const generateCommissionEarnedData = () => {
  const data = [];
  const baseDate = new Date(2025, 11, 1);
  for (let i = 59; i >= 0; i--) {
    const date = subMonths(baseDate, i);
    const monthStr = format(date, "MMM yyyy");
    const yearFactor = 1 + (59 - i) / 60 * 0.25;
    const seasonalFactor = 1 + Math.sin((date.getMonth() + 1) * Math.PI / 6) * 0.1;
    data.push({
      month: monthStr,
      value: Math.round((650000 + Math.random() * 200000) * yearFactor * seasonalFactor)
    });
  }
  return data;
};

// Generate 60 months of commission summary data (5 years)
const generateCommissionSummaryData = () => {
  const data = [];
  const baseDate = new Date(2025, 11, 1);
  for (let i = 59; i >= 0; i--) {
    const date = subMonths(baseDate, i);
    const monthStr = format(date, "MMM yyyy");
    const yearFactor = 1 + (59 - i) / 60 * 0.2;
    const seasonalFactor = 1 + Math.sin((date.getMonth() + 1) * Math.PI / 6) * 0.08;
    const target = Math.round(835764.76 * yearFactor);
    const variance = 0.85 + Math.random() * 0.25; // 85% to 110% of target

    data.push({
      month: monthStr,
      target: target,
      earned: Math.round(target * variance * seasonalFactor)
    });
  }
  return data;
};

// Pre-generate all data with seeded randomness (using fixed seed for consistency)
const allCommissionByTypeData = generateCommissionByTypeData();
const allCommissionEarnedData = generateCommissionEarnedData();
const allCommissionSummaryData = generateCommissionSummaryData();
const monthlyCommissionData = [{
  name: "Target",
  value: 843734.04,
  color: "hsl(180, 70%, 45%)"
}, {
  name: "Actual",
  value: 784650.28,
  color: "hsl(45, 93%, 47%)"
}, {
  name: "Shortfall",
  value: 59083.76,
  color: "hsl(142, 76%, 36%)"
}];
const leaderboardData = [{
  icon: Users2,
  label: "My Competitors",
  value: "7/212"
}, {
  icon: BarChart3,
  label: "Investment",
  value: "5/185"
}, {
  icon: Shield,
  label: "Risk Benefits",
  value: "95/166"
}, {
  icon: Heart,
  label: "Health Benefits",
  value: "113/149"
}, {
  icon: Umbrella,
  label: "GAP Cover",
  value: "83/141"
}, {
  icon: Clock,
  label: "Short Term",
  value: "134/158"
}];
const sidebarItems = [{
  icon: LayoutDashboard,
  label: "Dash",
  path: "/dashboard"
}, {
  icon: Users,
  label: "Clients",
  path: "/clients"
}, {
  icon: LineChart,
  label: "Portfolio",
  path: "/portfolio"
}, {
  icon: Mail,
  label: "Message",
  path: "/email"
}, {
  icon: CalendarIcon,
  label: "Calendar",
  path: "/calendar"
}, {
  icon: ListTodo,
  label: "Workflows",
  path: "/tasks"
}, {
  icon: Briefcase,
  label: "Insights",
  path: "/insights"
}, {
  icon: Building2,
  label: "Practice",
  path: "/practice"
}];

// Period options for dropdowns
const periodOptions = [{
  value: "3m",
  label: "3 Months"
}, {
  value: "6m",
  label: "6 Months"
}, {
  value: "1y",
  label: "1 Year"
}, {
  value: "5y",
  label: "5 Years"
}, {
  value: "ytd",
  label: "Year to Date"
}];

// Helper function to filter data by period
const filterDataByPeriod = <T,>(data: T[], period: string): T[] => {
  const now = new Date(2025, 11, 1); // December 2025
  let monthsToShow: number;
  switch (period) {
    case "3m":
      monthsToShow = 3;
      break;
    case "6m":
      monthsToShow = 6;
      break;
    case "1y":
      monthsToShow = 12;
      break;
    case "5y":
      monthsToShow = 60;
      break;
    case "ytd":
      monthsToShow = now.getMonth() + 1;
      break;
    // January to current month (December = 12)
    default:
      monthsToShow = 3;
  }
  return data.slice(-monthsToShow);
};
const defaultInsightsLayout: WidgetLayout[] = [{
  i: 'commission-type',
  x: 0,
  y: 0,
  w: 3,
  h: 3
}, {
  i: 'monthly-commission',
  x: 3,
  y: 0,
  w: 3,
  h: 3
}, {
  i: 'leaderboard',
  x: 6,
  y: 0,
  w: 3,
  h: 3
}, {
  i: 'commission-summary',
  x: 0,
  y: 3,
  w: 6,
  h: 3
}, {
  i: 'commission-snapshot',
  x: 6,
  y: 3,
  w: 3,
  h: 3
}, {
  i: 'commission-earned',
  x: 0,
  y: 6,
  w: 3,
  h: 3
}];
const Insights = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Time period states for each chart
  const [commissionByTypePeriod, setCommissionByTypePeriod] = useState<string>("3m");
  const [commissionEarnedPeriod, setCommissionEarnedPeriod] = useState<string>("3m");
  const [commissionSummaryPeriod, setCommissionSummaryPeriod] = useState<string>("1y");

  // Widget layout hook
  const {
    layout,
    onLayoutChange
  } = useWidgetLayout({
    pageId: 'insights',
    defaultLayout: defaultInsightsLayout,
    userId: user?.id
  });
  useEffect(() => {
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (!session?.user) {
        navigate("/auth");
      }
    });
    supabase.auth.getSession().then(({
      data: {
        session
      }
    }) => {
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

  // Memoized filtered data
  const filteredCommissionByTypeData = useMemo(() => filterDataByPeriod(allCommissionByTypeData, commissionByTypePeriod), [commissionByTypePeriod]);
  const filteredCommissionEarnedData = useMemo(() => filterDataByPeriod(allCommissionEarnedData, commissionEarnedPeriod), [commissionEarnedPeriod]);
  const filteredCommissionSummaryData = useMemo(() => filterDataByPeriod(allCommissionSummaryData, commissionSummaryPeriod), [commissionSummaryPeriod]);
  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>;
  }
  const userName = user?.user_metadata?.full_name || "Adviser";
  const userEmail = user?.email || "adviser@vantage.co";

  // Commission by Type stacked bar chart options
  const commissionByTypeOption = {
    tooltip: {
      trigger: 'axis' as const,
      axisPointer: {
        type: 'shadow' as const
      },
      formatter: (params: any) => {
        let result = `<div style="font-weight:600;margin-bottom:4px">${params[0].axisValue}</div>`;
        params.forEach((p: any) => {
          result += `<div style="display:flex;justify-content:space-between;gap:16px">
            <span>${p.marker} ${p.seriesName}</span>
            <span style="font-weight:500">R ${p.value.toLocaleString()}</span>
          </div>`;
        });
        return result;
      }
    },
    grid: {
      left: 8,
      right: 8,
      top: 8,
      bottom: 24,
      containLabel: true
    },
    xAxis: {
      type: 'category' as const,
      data: filteredCommissionByTypeData.map(d => d.month),
      axisLabel: {
        rotate: filteredCommissionByTypeData.length > 12 ? 45 : 0,
        fontSize: filteredCommissionByTypeData.length > 24 ? 9 : 11
      }
    },
    yAxis: {
      type: 'value' as const,
      axisLabel: {
        formatter: (v: number) => `${(v / 1000).toFixed(0)}k`
      }
    },
    series: [{
      name: 'PUFs',
      type: 'bar' as const,
      stack: 'total',
      data: filteredCommissionByTypeData.map(d => d.PUFs),
      itemStyle: {
        color: 'hsl(210, 70%, 50%)'
      }
    }, {
      name: 'Ongoing',
      type: 'bar' as const,
      stack: 'total',
      data: filteredCommissionByTypeData.map(d => d.Ongoing),
      itemStyle: {
        color: 'hsl(180, 70%, 45%)'
      }
    }, {
      name: 'Lapses',
      type: 'bar' as const,
      stack: 'total',
      data: filteredCommissionByTypeData.map(d => d.Lapses),
      itemStyle: {
        color: 'hsl(45, 93%, 47%)'
      }
    }, {
      name: 'Initial',
      type: 'bar' as const,
      stack: 'total',
      data: filteredCommissionByTypeData.map(d => d.Initial),
      itemStyle: {
        color: 'hsl(0, 70%, 50%)'
      }
    }, {
      name: '2nd Year',
      type: 'bar' as const,
      stack: 'total',
      data: filteredCommissionByTypeData.map(d => d["2nd Year"]),
      itemStyle: {
        color: 'hsl(280, 65%, 50%)'
      }
    }]
  };

  // Commission Earned bar chart options
  const commissionEarnedOption = {
    tooltip: {
      trigger: 'axis' as const,
      formatter: (params: any) => `${params[0].axisValue}<br/>R ${params[0].value.toLocaleString()}`
    },
    grid: {
      left: 8,
      right: 8,
      top: 8,
      bottom: 24,
      containLabel: true
    },
    xAxis: {
      type: 'category' as const,
      data: filteredCommissionEarnedData.map(d => d.month),
      axisLabel: {
        rotate: filteredCommissionEarnedData.length > 12 ? 45 : 0,
        fontSize: filteredCommissionEarnedData.length > 24 ? 9 : 11
      }
    },
    yAxis: {
      type: 'value' as const,
      axisLabel: {
        formatter: (v: number) => `${(v / 1000).toFixed(0)}k`
      }
    },
    series: [{
      type: 'bar' as const,
      data: filteredCommissionEarnedData.map(d => d.value),
      itemStyle: {
        color: createGradient('hsl(180, 70%, 55%)', 'hsl(180, 70%, 35%)'),
        borderRadius: [4, 4, 0, 0]
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 180, 180, 0.3)'
        }
      }
    }]
  };

  // Monthly Commission pie chart options
  const monthlyCommissionOption = {
    tooltip: {
      trigger: 'item' as const,
      formatter: (params: any) => `${params.name}: R ${params.value.toLocaleString()}`
    },
    series: [{
      type: 'pie' as const,
      radius: ['40%', '75%'],
      center: ['50%', '50%'],
      selectedMode: 'single' as const,
      selectedOffset: 12,
      data: monthlyCommissionData.map(d => ({
        name: d.name,
        value: d.value,
        itemStyle: {
          color: d.color
        }
      })),
      label: {
        show: false
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 20,
          shadowColor: 'rgba(0, 0, 0, 0.3)'
        },
        scale: true,
        scaleSize: 12
      },
      animationType: 'scale' as const,
      animationEasing: 'elasticOut' as const
    }]
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
      }
    },
    legend: {
      data: ['Annual Target', 'Annual Earned Commission'],
      bottom: 0
    },
    grid: {
      left: 8,
      right: 8,
      top: 8,
      bottom: 40,
      containLabel: true
    },
    xAxis: {
      type: 'category' as const,
      data: filteredCommissionSummaryData.map(d => d.month),
      boundaryGap: false,
      axisLabel: {
        rotate: filteredCommissionSummaryData.length > 12 ? 45 : 0,
        fontSize: filteredCommissionSummaryData.length > 24 ? 9 : 11
      }
    },
    yAxis: {
      type: 'value' as const,
      axisLabel: {
        formatter: (v: number) => `${(v / 1000000).toFixed(1)}M`
      }
    },
    dataZoom: [{
      type: 'inside' as const,
      start: 0,
      end: 100
    }, {
      type: 'slider' as const,
      start: 0,
      end: 100,
      height: 16,
      bottom: 24,
      handleSize: '80%'
    }],
    series: [{
      name: 'Annual Target',
      type: 'line' as const,
      data: filteredCommissionSummaryData.map(d => d.target),
      smooth: true,
      lineStyle: {
        color: 'hsl(210, 70%, 50%)',
        width: 2
      },
      itemStyle: {
        color: 'hsl(210, 70%, 50%)'
      },
      areaStyle: {
        color: createGradient('hsla(210, 70%, 50%, 0.4)', 'hsla(210, 70%, 50%, 0.05)')
      },
      emphasis: {
        focus: 'series' as const
      }
    }, {
      name: 'Annual Earned Commission',
      type: 'line' as const,
      data: filteredCommissionSummaryData.map(d => d.earned),
      smooth: true,
      lineStyle: {
        color: 'hsl(180, 70%, 45%)',
        width: 2
      },
      itemStyle: {
        color: 'hsl(180, 70%, 45%)'
      },
      areaStyle: {
        color: createGradient('hsla(180, 70%, 45%, 0.5)', 'hsla(180, 70%, 45%, 0.05)')
      },
      emphasis: {
        focus: 'series' as const
      }
    }]
  };
  return <div className="h-screen bg-muted/30 flex overflow-hidden">
      {/* Sidebar - Fixed */}
      <aside className="w-16 bg-[hsl(180,25%,25%)] flex flex-col items-center py-4 gap-1 shrink-0">
        <Button variant="ghost" size="icon" className="w-10 h-10 text-white/80 hover:bg-white/10 mb-4" onClick={() => navigate("/command-center")} title="Practice Overview">
          <img src={commandCenterIcon} alt="Command Center" className="w-5 h-5" />
        </Button>
        {sidebarItems.map(item => <button key={item.label} onClick={() => navigate(item.path)} className={`w-full flex flex-col items-center py-2 text-xs gap-1 ${item.path === "/insights" ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white/80"}`}>
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </button>)}
        
        {/* Spacer to push logo to bottom */}
        <div className="flex-1" />
        
        {/* VANTAGE Logo - rotated to read bottom to top */}
        <div className="mb-2 overflow-visible">
          <img src={vantageLogo} alt="Vantage" className="h-[80px] w-auto object-contain -rotate-90 origin-center" />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header - Sticky */}
        <AppHeader searchPlaceholder="Search..." userName={userName} userEmail={userEmail} onSignOut={handleSignOut} onAccountSettings={() => navigate("/account-settings")} />

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

          <DraggableWidgetGrid layout={layout} onLayoutChange={onLayoutChange}>
            {/* Commission by Type */}
            <div key="commission-type">
              <Card className="h-full">
                <CardHeader className="widget-drag-handle flex flex-row items-center justify-between py-3 px-4 cursor-move">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                    <CardTitle className="text-sm font-medium">COMMISSION BY TYPE</CardTitle>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <X className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <Select value={commissionByTypePeriod} onValueChange={setCommissionByTypePeriod}>
                    <SelectTrigger className="w-[130px] h-8 bg-[hsl(180,25%,25%)] text-white border-0 mb-4">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {periodOptions.map(option => <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>)}
                    </SelectContent>
                  </Select>
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
                    <EChartsWrapper height={192} option={commissionByTypeOption} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Commission Earned */}
            <div key="commission-earned">
              <Card className="h-full">
                <CardHeader className="widget-drag-handle flex flex-row items-center justify-between py-3 px-4 cursor-move">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                    <CardTitle className="text-sm font-medium">COMMISSION EARNED</CardTitle>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <X className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <Select value={commissionEarnedPeriod} onValueChange={setCommissionEarnedPeriod}>
                      <SelectTrigger className="w-[130px] h-8 bg-[hsl(180,25%,25%)] text-white border-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {periodOptions.map(option => <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>)}
                      </SelectContent>
                    </Select>
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
                    <EChartsWrapper height={192} option={commissionEarnedOption} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Monthly Commission */}
            <div key="monthly-commission">
              <Card className="h-full">
                <CardHeader className="widget-drag-handle flex flex-row items-center justify-between py-3 px-4 cursor-move">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                    <CardTitle className="text-sm font-medium">MONTHLY COMMISSION</CardTitle>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <X className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="h-48 flex items-center justify-center">
                    <EChartsWrapper height={192} option={monthlyCommissionOption} />
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
            </div>

            {/* Commission Snapshot */}
            <div key="commission-snapshot">
              <Card className="h-full">
                <CardHeader className="widget-drag-handle flex flex-row items-center justify-between py-3 px-4 cursor-move">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                    <CardTitle className="text-sm font-medium">COMMISSION SNAPSHOT</CardTitle>
                  </div>
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
                      <p className="text-sm font-medium">Platinum</p>
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
            </div>

            {/* Commission Summary */}
            <div key="commission-summary">
              <Card className="h-full">
                <CardHeader className="widget-drag-handle flex flex-row items-center justify-between py-3 px-4 cursor-move">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                    <CardTitle className="text-sm font-medium">COMMISSION SUMMARY</CardTitle>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <X className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <Select value={commissionSummaryPeriod} onValueChange={setCommissionSummaryPeriod}>
                      <SelectTrigger className="w-[130px] h-8 bg-[hsl(180,25%,25%)] text-white border-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {periodOptions.map(option => <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>)}
                      </SelectContent>
                    </Select>
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
                    <EChartsWrapper height={224} option={commissionSummaryOption} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Leaderboard Snapshot */}
            <div key="leaderboard">
              <Card className="h-full">
                <CardHeader className="widget-drag-handle flex flex-row items-center justify-between py-3 px-4 cursor-move">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                    <CardTitle className="text-sm font-medium">LEADERBOARD SNAPSHOT</CardTitle>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <X className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-3">
                  {leaderboardData.map(item => <div key={item.label} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <item.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{item.label}</p>
                        <p className="text-sm font-semibold">{item.value}</p>
                      </div>
                    </div>)}
                </CardContent>
              </Card>
            </div>
          </DraggableWidgetGrid>
        </main>
      </div>
      <GlobalAIChat currentPage="insights" />
    </div>;
};
export default Insights;