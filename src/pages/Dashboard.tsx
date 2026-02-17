import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard, Users, Briefcase, Mail, CalendarIcon, ListTodo, LineChart, Building2, X, GripVertical, MoreVertical, Settings } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { WidgetSettingsDialog, WidgetConfig } from "@/components/widgets/WidgetSettingsDialog";
import commandCenterIcon from "@/assets/command-center-icon.png";
import vantageLogo from "@/assets/vantage-logo.png";
import { EChartsWrapper } from "@/components/ui/echarts-wrapper";
import { AppHeader } from "@/components/layout/AppHeader";
import { useRegion } from "@/contexts/RegionContext";
import { DraggableWidgetGrid, WidgetLayout } from "@/components/widgets/DraggableWidgetGrid";
import { useWidgetLayout } from "@/hooks/useWidgetLayout";
import { toast } from "sonner";
import GlobalAIChat from "@/components/ai-assistant/GlobalAIChat";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OnboardingProgressWidget } from "@/components/dashboard/OnboardingProgressWidget";

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

const defaultDashboardLayout: WidgetLayout[] = [
  { i: 'provider-view', x: 0, y: 0, w: 3, h: 3 },
  { i: 'aum-product', x: 3, y: 0, w: 3, h: 3 },
  { i: 'top-accounts', x: 6, y: 0, w: 3, h: 3 },
  { i: 'birthdays', x: 0, y: 3, w: 3, h: 3 },
  { i: 'clients-value', x: 3, y: 3, w: 3, h: 3 },
  { i: 'corporate-actions', x: 6, y: 3, w: 3, h: 3 },
  { i: 'onboarding-progress', x: 0, y: 6, w: 3, h: 3 },
  
];

const DASHBOARD_WIDGETS: WidgetConfig[] = [
  { id: 'provider-view', label: 'Provider View' },
  { id: 'aum-product', label: 'AUM by Product' },
  { id: 'top-accounts', label: 'Top 5 Accounts' },
  { id: 'birthdays', label: 'Birthdays' },
  { id: 'clients-value', label: 'Clients by Value' },
  { id: 'corporate-actions', label: 'Upcoming Corporate Actions' },
  { id: 'onboarding-progress', label: 'Account Onboarding Progress' },
  
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [caFilter, setCaFilter] = useState<'mandatory' | 'voluntary'>('mandatory');
  
  
  // Use global region context with filtered data
  const { selectedRegion, setSelectedRegion, filteredRegionalData, selectedAdvisors, regionalData } = useRegion();

  // Map selected advisor initials to full names for onboarding widget filtering
  const selectedAdvisorNames = useMemo(() => {
    return regionalData.advisors
      .filter(a => selectedAdvisors.includes(a.initials))
      .map(a => a.name);
  }, [selectedAdvisors, regionalData.advisors]);

  // Widget layout hook
  const { layout, onLayoutChange, hiddenWidgets, setHiddenWidgets, loading: layoutLoading } = useWidgetLayout({
    pageId: 'dashboard',
    defaultLayout: defaultDashboardLayout,
    userId: user?.id,
  });

  const handleToggleWidget = useCallback((widgetId: string, visible: boolean) => {
    if (visible) {
      setHiddenWidgets(hiddenWidgets.filter(id => id !== widgetId));
    } else {
      setHiddenWidgets([...hiddenWidgets, widgetId]);
    }
  }, [hiddenWidgets, setHiddenWidgets]);

  // Filter layout and determine which widgets to show
  const visibleLayout = useMemo(() => 
    layout.filter(item => !hiddenWidgets.includes(item.i)),
    [layout, hiddenWidgets]
  );

  const isWidgetVisible = useCallback((id: string) => !hiddenWidgets.includes(id), [hiddenWidgets]);

  // Helper function to find client by name in database
  const findClientByName = async (fullName: string): Promise<string | null> => {
    const nameParts = fullName.trim().split(' ');
    if (nameParts.length < 2) return null;
    
    const firstName = nameParts[0];
    const surname = nameParts[nameParts.length - 1];
    
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id')
        .ilike('first_name', `%${firstName}%`)
        .ilike('surname', `%${surname}%`)
        .limit(1)
        .single();
      
      if (error || !data) return null;
      return data.id;
    } catch {
      return null;
    }
  };

  // Handle click on client name in widgets
  const handleClientClick = async (clientName: string) => {
    const clientId = await findClientByName(clientName);
    if (clientId) {
      navigate(`/clients/${clientId}?from=dashboard`);
    } else {
      toast.error(`Client "${clientName}" not found in database`);
    }
  };

  // Seed demo clients for new users
  const seedDemoClients = async (accessToken: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/seed-demo-clients`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const result = await response.json();
      if (result.seeded) {
        console.log(`Seeded ${result.count} demo clients`);
      }
    } catch (error) {
      console.error('Failed to seed demo clients:', error);
    }
  };

  // Seed onboarding tasks for new users
  const seedOnboardingTasks = async (accessToken: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/seed-onboarding-tasks`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const result = await response.json();
      if (result.seeded) {
        console.log(`Seeded ${result.count} onboarding tasks`);
      }
    } catch (error) {
      console.error('Failed to seed onboarding tasks:', error);
    }
  };

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
      } else if (session.access_token) {
        // Seed demo clients on login
        seedDemoClients(session.access_token);
        seedOnboardingTasks(session.access_token);
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
      } else if (session.access_token) {
        // Seed demo clients on initial load
        seedDemoClients(session.access_token);
        seedOnboardingTasks(session.access_token);
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
        <div className="mb-2 overflow-visible">
          <img 
            src={vantageLogo} 
            alt="Vantage" 
            className="h-[80px] w-auto object-contain -rotate-90 origin-center"
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
          onAccountSettings={() => navigate("/account-settings")}
        />

        {/* Dashboard Content - Scrollable */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="flex items-center justify-between mb-6 pr-[54px]">
            <h1 className="text-2xl font-semibold">
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
            <WidgetSettingsDialog
              widgets={DASHBOARD_WIDGETS}
              hiddenWidgets={hiddenWidgets}
              onToggleWidget={handleToggleWidget}
            />
          </div>
          
          {(loading || layoutLoading) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader className="py-3 px-4">
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <Skeleton className="w-full h-[200px]" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
          <DraggableWidgetGrid layout={visibleLayout} onLayoutChange={onLayoutChange}>
            {/* Provider View */}
            {isWidgetVisible('provider-view') && <div key="provider-view">
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
                        <th className="text-right pb-2 font-normal">Book %</th>
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
            </div>}

            {isWidgetVisible('top-accounts') && <div key="top-accounts">
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
                        <th className="text-right pb-2 font-normal">Book %</th>
                        <th className="text-right pb-2 font-normal">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...filteredRegionalData.topAccounts]
                        .sort((a, b) => {
                          const parseValue = (v: string) => parseFloat(v.replace(/[^0-9.-]/g, ''));
                          return parseValue(b.value) - parseValue(a.value);
                        })
                        .slice(0, 5)
                        .map(account => (
                          <tr 
                            key={account.investor} 
                            className="border-t border-border hover:bg-muted/50 cursor-pointer"
                            onClick={() => handleClientClick(account.investor)}
                          >
                            <td className="py-2 max-w-[120px] truncate" title={account.investor}>{account.investor}</td>
                            <td className="py-2 text-right text-muted-foreground whitespace-nowrap">{account.bookPercent}</td>
                            <td className="py-2 text-right whitespace-nowrap">{account.value}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>}

            {/* AUM by Product */}
            {isWidgetVisible('aum-product') && <div key="aum-product">
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
            </div>}

            {/* Birthdays */}
            {isWidgetVisible('birthdays') && <div key="birthdays">
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
                      {filteredRegionalData.birthdays.slice(0, 7).map(person => (
                        <tr 
                          key={person.name} 
                          className="border-t border-border hover:bg-muted/50 cursor-pointer"
                          onClick={() => handleClientClick(person.name)}
                        >
                          <td className="py-1.5">{person.name}</td>
                          <td className="py-1.5 text-right text-muted-foreground">{person.nextBirthday}</td>
                          <td className="py-1.5 text-right">{person.age}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredRegionalData.birthdays.length > 7 && (
                    <button 
                      className="w-full text-center text-xs text-primary hover:underline mt-2"
                      onClick={() => {
                        const birthdayData = filteredRegionalData.birthdays.map(b => ({
                          name: b.name,
                          birthday: b.nextBirthday,
                          age: b.age
                        }));
                        navigate(`/clients?filter=birthdays&data=${encodeURIComponent(JSON.stringify(birthdayData))}`);
                      }}
                    >
                      Show more ({filteredRegionalData.birthdays.length - 7} more)
                    </button>
                  )}
                </CardContent>
              </Card>
            </div>}

            {/* Clients by Value */}
            {isWidgetVisible('clients-value') && <div key="clients-value">
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
            </div>}

            {/* Upcoming Corporate Actions */}
            {isWidgetVisible('corporate-actions') && <div key="corporate-actions">
              <Card className="h-full">
                <CardHeader className="widget-drag-handle flex flex-row items-center justify-between py-3 px-4 cursor-move">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                    <CardTitle className="text-sm font-medium">Upcoming corporate actions</CardTitle>
                  </div>
                  <div className="flex items-center gap-1">
                    <Select value={caFilter} onValueChange={(v) => setCaFilter(v as 'mandatory' | 'voluntary')}>
                      <SelectTrigger className="h-6 text-xs w-[110px] border-none bg-muted/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mandatory">Mandatory</SelectItem>
                        <SelectItem value="voluntary">Voluntary</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-muted-foreground text-xs">
                        <th className="text-left pb-2 font-normal">Code</th>
                        <th className="text-left pb-2 font-normal">Event</th>
                        <th className="text-right pb-2 font-normal">Accts</th>
                        <th className="text-right pb-2 font-normal">Ex date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRegionalData.corporateActions
                        .filter(ca => ca.type === caFilter)
                        .map(ca => (
                          <tr key={ca.id} className="border-t border-border">
                            <td className="py-1.5 max-w-[70px] truncate" title={ca.investmentCode}>{ca.investmentCode}</td>
                            <td className="py-1.5 max-w-[80px] truncate" title={ca.eventType}>{ca.eventType}</td>
                            <td className="py-1.5 text-right text-muted-foreground">{ca.affectedAccounts}</td>
                            <td className="py-1.5 text-right text-muted-foreground whitespace-nowrap">{ca.exDate}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>}

            {/* Account Onboarding Progress */}
            {isWidgetVisible('onboarding-progress') && <div key="onboarding-progress">
              <OnboardingProgressWidget selectedAdvisorNames={selectedAdvisorNames} />
            </div>}

          </DraggableWidgetGrid>
          )}
        </main>
      </div>
      <GlobalAIChat currentPage="dashboard" />
    </div>;
};
export default Dashboard;
