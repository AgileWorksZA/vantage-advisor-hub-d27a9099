import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard, Users, Mail, CalendarIcon, ListTodo, LineChart, Building2, X, GripVertical } from "lucide-react";
import commandCenterIcon from "@/assets/command-center-icon.png";
import vantageLogo from "@/assets/vantage-logo.png";
import { EChartsWrapper } from "@/components/ui/echarts-wrapper";
import { AppHeader } from "@/components/layout/AppHeader";
import { useRegion } from "@/contexts/RegionContext";
import { DraggableWidgetGrid, WidgetLayout } from "@/components/widgets/DraggableWidgetGrid";
import { useWidgetLayout } from "@/hooks/useWidgetLayout";

const sidebarItems = [{
  icon: LayoutDashboard,
  label: "Dash",
  path: "/dashboard"
}, {
  icon: Users,
  label: "Clients",
  path: "/clients"
}, {
  icon: Mail,
  label: "Email",
  path: "/email"
}, {
  icon: CalendarIcon,
  label: "Calendar",
  path: "/calendar"
}, {
  icon: ListTodo,
  label: "Tasks",
  path: "/tasks"
}, {
  icon: LineChart,
  label: "Insights",
  path: "/insights"
}, {
  icon: Building2,
  label: "Practice",
  path: "/practice"
}];

const defaultDashboardLayout: WidgetLayout[] = [
  { i: 'provider-view', x: 0, y: 0, w: 3, h: 3 },
  { i: 'aum-product', x: 3, y: 0, w: 3, h: 3 },
  { i: 'top-accounts', x: 6, y: 0, w: 3, h: 3 },
  { i: 'birthdays', x: 0, y: 3, w: 3, h: 3 },
  { i: 'clients-value', x: 3, y: 3, w: 3, h: 3 },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllBirthdays, setShowAllBirthdays] = useState(false);
  const [showAllAccounts, setShowAllAccounts] = useState(false);
  
  // Use global region context with filtered data
  const { selectedRegion, setSelectedRegion, filteredRegionalData } = useRegion();

  // Widget layout hook
  const { layout, onLayoutChange, loading: layoutLoading } = useWidgetLayout({
    pageId: 'dashboard',
    defaultLayout: defaultDashboardLayout,
    userId: user?.id,
  });

  useEffect(() => {
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
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
      setSession(session);
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
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>;
  }

  const userName = user?.user_metadata?.full_name || "Adviser";
  const userEmail = user?.email || "adviser@vantage.co";

  return <div className="h-screen bg-muted/30 flex overflow-hidden">
      {/* Sidebar - Fixed */}
      <aside className="w-16 bg-[hsl(180,25%,25%)] flex flex-col items-center py-4 gap-1 shrink-0">
        <Button 
          variant="ghost" 
          size="icon" 
          className="w-10 h-10 text-white/80 hover:bg-white/10 mb-4"
          onClick={() => navigate("/command-center")}
          title="Practice Overview"
        >
          <img src={commandCenterIcon} alt="Command Center" className="w-5 h-5" />
        </Button>
        {sidebarItems.map(item => <button key={item.label} onClick={() => navigate(item.path)} className={`w-full flex flex-col items-center py-2 text-xs gap-1 ${item.path === "/dashboard" ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white/80"}`}>
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </button>)}
        
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
          userName={userName}
          userEmail={userEmail}
          onSignOut={handleSignOut}
          onAccountSettings={() => navigate("/practice")}
          selectedRegion={selectedRegion}
          onRegionChange={setSelectedRegion}
        />

        {/* Dashboard Content - Scrollable */}
        <main className="flex-1 p-6 overflow-auto">
          <h1 className="text-2xl font-semibold mb-6">
            Advisor Dashboard
            <button 
              onClick={() => navigate("/ai-assistant")}
              className="ml-2 inline-flex items-center px-2 py-0.5 text-xs font-bold 
                         bg-gradient-to-r from-violet-500 to-cyan-500 text-white 
                         rounded-full animate-pulse hover:scale-110 transition-transform
                         align-super cursor-pointer"
            >
              AI
            </button>
          </h1>
          
          <DraggableWidgetGrid layout={layout} onLayoutChange={onLayoutChange}>
            {/* Provider View */}
            <div key="provider-view">
              <Card className="h-full">
                <CardHeader className="widget-drag-handle flex flex-row items-center justify-between py-3 px-4 cursor-move">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                    <CardTitle className="text-sm font-medium">Provider View</CardTitle>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <X className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-muted-foreground text-xs">
                        <th className="text-left pb-2 font-normal">Provider name</th>
                        <th className="text-right pb-2 font-normal">Book%</th>
                        <th className="text-right pb-2 font-normal">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRegionalData.providers.map(provider => <tr key={provider.name} className="border-t border-border">
                          <td className="py-2">{provider.name}</td>
                          <td className="py-2 text-right text-muted-foreground">{provider.bookPercent}</td>
                          <td className="py-2 text-right">{provider.value}</td>
                        </tr>)}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>

            {/* Top 5 Accounts */}
            <div key="top-accounts">
              <Card className="h-full">
                <CardHeader className="widget-drag-handle flex flex-row items-center justify-between py-3 px-4 cursor-move">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                    <CardTitle className="text-sm font-medium">Top 5 Accounts</CardTitle>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <X className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-muted-foreground text-xs">
                        <th className="text-left pb-2 font-normal">Investor</th>
                        <th className="text-right pb-2 font-normal">Book%</th>
                        <th className="text-right pb-2 font-normal">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRegionalData.topAccounts.slice(0, 7).map(account => <tr key={account.investor} className="border-t border-border">
                          <td className="py-2 max-w-[120px] truncate" title={account.investor}>{account.investor}</td>
                          <td className="py-2 text-right text-muted-foreground whitespace-nowrap">{account.bookPercent}</td>
                          <td className="py-2 text-right whitespace-nowrap">{account.value}</td>
                        </tr>)}
                    </tbody>
                  </table>
                  {filteredRegionalData.topAccounts.length > 7 && (
                    <button 
                      className="w-full text-center text-xs text-primary hover:underline mt-2"
                      onClick={() => setShowAllAccounts(true)}
                    >
                      Show more ({filteredRegionalData.topAccounts.length - 7} more)
                    </button>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* AUM by Product */}
            <div key="aum-product">
              <Card className="h-full">
                <CardHeader className="widget-drag-handle flex flex-row items-center justify-between py-3 px-4 cursor-move">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                    <CardTitle className="text-sm font-medium">AUM by Product</CardTitle>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <X className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <p className="text-xl font-semibold mb-2">{filteredRegionalData.currencySymbol} {filteredRegionalData.totalAUM}</p>
                  <div className="h-32">
                    <EChartsWrapper
                      height={128}
                      option={{
                        tooltip: {
                          trigger: 'item',
                          formatter: (params: any) => `${params.name}: ${params.value}%`,
                        },
                        series: [{
                          type: 'pie',
                          radius: ['45%', '75%'],
                          center: ['50%', '50%'],
                          data: filteredRegionalData.products.map(p => ({
                            name: p.name,
                            value: p.value,
                            itemStyle: { color: p.color }
                          })),
                          label: { show: false },
                          emphasis: {
                            itemStyle: {
                              shadowBlur: 20,
                              shadowColor: 'rgba(0, 0, 0, 0.3)',
                            },
                            scale: true,
                            scaleSize: 8,
                          },
                          animationType: 'scale',
                          animationEasing: 'elasticOut',
                          animationDelay: (idx: number) => idx * 100,
                        }],
                      }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs mt-2">
                    {filteredRegionalData.products.map(item => <div key={item.name} className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full" style={{
                      backgroundColor: item.color
                    }}></span>
                        <span className="text-muted-foreground">{item.name}</span>
                      </div>)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Birthdays */}
            <div key="birthdays">
              <Card className="h-full">
                <CardHeader className="widget-drag-handle flex flex-row items-center justify-between py-3 px-4 cursor-move">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                    <CardTitle className="text-sm font-medium">Birthdays</CardTitle>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <X className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-muted-foreground text-xs">
                        <th className="text-left pb-2 font-normal">Name</th>
                        <th className="text-right pb-2 font-normal">Date</th>
                        <th className="text-right pb-2 font-normal">Age</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRegionalData.birthdays.slice(0, 7).map(person => <tr key={person.name} className="border-t border-border">
                          <td className="py-1.5">{person.name}</td>
                          <td className="py-1.5 text-right text-muted-foreground">{person.nextBirthday}</td>
                          <td className="py-1.5 text-right">{person.age}</td>
                        </tr>)}
                    </tbody>
                  </table>
                  {filteredRegionalData.birthdays.length > 7 && (
                    <button 
                      className="w-full text-center text-xs text-primary hover:underline mt-2"
                      onClick={() => setShowAllBirthdays(true)}
                    >
                      Show more ({filteredRegionalData.birthdays.length - 7} more)
                    </button>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Clients by Value */}
            <div key="clients-value">
              <Card className="h-full">
                <CardHeader className="widget-drag-handle flex flex-row items-center justify-between py-3 px-4 cursor-move">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                    <CardTitle className="text-sm font-medium">Clients by Value</CardTitle>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <X className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-muted-foreground text-xs">
                        <th className="text-left pb-2 font-normal"></th>
                        <th className="text-right pb-2 font-normal">Value</th>
                        <th className="text-right pb-2 font-normal">Investors</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRegionalData.clientsByValue.map(row => <tr key={row.range} className="border-t border-border">
                          <td className="py-2">{row.range}</td>
                          <td className="py-2 text-right">{row.value}</td>
                          <td className="py-2 text-right text-muted-foreground">{row.investors}</td>
                        </tr>)}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>
          </DraggableWidgetGrid>
        </main>
      </div>
    </div>;
};
export default Dashboard;
