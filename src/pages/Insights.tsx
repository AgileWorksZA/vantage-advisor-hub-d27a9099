import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  LayoutDashboard,
  Users,
  Mail,
  ListTodo,
  LineChart,
  Building2,
  Plus,
  Search,
  Bell,
  LogOut,
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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

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

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Adviser";

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar */}
      <aside className="w-16 bg-[hsl(180,25%,25%)] flex flex-col items-center py-4 gap-1">
        <Button variant="ghost" size="icon" className="w-10 h-10 text-white/80 hover:bg-white/10 mb-4">
          <Plus className="w-5 h-5" />
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
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-14 bg-background border-b border-border flex items-center justify-between px-6">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search..." className="pl-10 bg-muted/50 border-0" />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-1">
              <span className="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center font-medium">CZ</span>
              <span className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center font-medium">DH</span>
              <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-medium">EW</span>
              <span className="w-6 h-6 rounded-full bg-green-600 text-white text-xs flex items-center justify-center font-medium">IN</span>
              <span className="w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-medium">RS</span>
            </div>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">1</span>
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{userName}</span>
              <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign out">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
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
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={commissionByTypeData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(value: number) => `R ${value.toLocaleString()}`} />
                      <Bar dataKey="PUFs" stackId="a" fill="hsl(210, 70%, 50%)" />
                      <Bar dataKey="Ongoing" stackId="a" fill="hsl(180, 70%, 45%)" />
                      <Bar dataKey="Lapses" stackId="a" fill="hsl(45, 93%, 47%)" />
                      <Bar dataKey="Initial" stackId="a" fill="hsl(0, 70%, 50%)" />
                      <Bar dataKey="2nd Year" stackId="a" fill="hsl(280, 65%, 50%)" />
                    </BarChart>
                  </ResponsiveContainer>
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
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={commissionEarnedData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(value: number) => `R ${value.toLocaleString()}`} />
                      <Bar dataKey="value" fill="hsl(180, 70%, 45%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
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
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={monthlyCommissionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {monthlyCommissionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `R ${value.toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
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
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={commissionSummaryData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 9 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                      <Tooltip formatter={(value: number) => `R ${value.toLocaleString()}`} />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="target"
                        stackId="1"
                        stroke="hsl(210, 70%, 50%)"
                        fill="hsl(210, 70%, 50%)"
                        fillOpacity={0.6}
                        name="Annual Target"
                      />
                      <Area
                        type="monotone"
                        dataKey="earned"
                        stackId="2"
                        stroke="hsl(180, 70%, 45%)"
                        fill="hsl(180, 70%, 45%)"
                        fillOpacity={0.8}
                        name="Annual Earned Commission"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
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
