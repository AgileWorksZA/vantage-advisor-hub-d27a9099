import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LayoutDashboard, Users, Briefcase, Mail, CalendarIcon, ListTodo,
  LineChart, Building2, TrendingUp, PieChart, BarChart3, Wallet, Sparkles,
} from "lucide-react";
import commandCenterIcon from "@/assets/command-center-icon.png";
import vantageLogo from "@/assets/vantage-logo.png";
import { AppHeader } from "@/components/layout/AppHeader";
import GlobalAIChat from "@/components/ai-assistant/GlobalAIChat";
import { useRegion } from "@/contexts/RegionContext";
import { generateRebalancingGroups } from "@/data/practiceRebalancingData";
import RebalancingGroupRow from "@/components/portfolio/RebalancingGroupRow";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dash", path: "/dashboard" },
  { icon: Users, label: "Clients", path: "/clients" },
  { icon: LineChart, label: "Portfolio", path: "/portfolio" },
  { icon: Mail, label: "Message", path: "/email" },
  { icon: CalendarIcon, label: "Calendar", path: "/calendar" },
  { icon: ListTodo, label: "Workflows", path: "/tasks" },
  { icon: Briefcase, label: "Insights", path: "/insights" },
  { icon: Building2, label: "Practice", path: "/practice" },
];

const Portfolio = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { selectedRegion, currencySymbol, formatCurrency } = useRegion();

  const groups = useMemo(() => generateRebalancingGroups(selectedRegion), [selectedRegion]);

  const totals = useMemo(() => {
    const totalAUM = groups.reduce((s, g) => s + g.totalAUM, 0);
    const totalPortfolios = groups.reduce((s, g) => s + g.portfolios, 0);
    const uniqueClients = new Set(groups.flatMap(g => g.clients)).size;
    return { totalAUM, totalPortfolios, uniqueClients, opportunities: groups.length };
  }, [groups]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        if (!session?.user) navigate("/auth");
      }
    );
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (!session?.user) navigate("/auth");
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

  return (
    <div className="h-screen bg-muted/30 flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-16 bg-[hsl(180,25%,25%)] flex flex-col items-center py-4 gap-1 shrink-0">
        <Button variant="ghost" size="icon" className="w-10 h-10 text-white/80 hover:bg-white/10 mb-4" onClick={() => navigate("/command-center")} title="Practice Overview">
          <img src={commandCenterIcon} alt="Command Center" className="w-5 h-5" />
        </Button>
        {sidebarItems.map((item) => (
          <button key={item.label} onClick={() => navigate(item.path)} className={`w-full flex flex-col items-center py-2 text-xs gap-1 ${item.path === "/portfolio" ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white/80"}`}>
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </button>
        ))}
        <div className="flex-1" />
        <div className="mb-2 overflow-visible">
          <img src={vantageLogo} alt="Vantage" className="h-[80px] w-auto object-contain -rotate-90 origin-center" />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AppHeader searchPlaceholder="Search portfolios..." userName={userName} userEmail={userEmail} onSignOut={handleSignOut} onAccountSettings={() => navigate("/account-settings")} />

        <main className="flex-1 p-6 overflow-auto">
          <div className="flex items-center gap-2 mb-6">
            <h1 className="text-2xl font-semibold">Portfolio Rebalancing</h1>
            <Sparkles className="h-5 w-5 text-teal-600" />
          </div>

          {/* Summary Tiles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total AUM</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totals.totalAUM)}</div>
                <p className="text-xs text-muted-foreground">Across rebalancing groups</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Portfolios</CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totals.totalPortfolios}</div>
                <p className="text-xs text-muted-foreground">Impacted portfolios</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Clients</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totals.uniqueClients}</div>
                <p className="text-xs text-muted-foreground">Unique clients impacted</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rebalancing Opportunities</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">{totals.opportunities}</div>
                <p className="text-xs text-muted-foreground">AI-suggested groups</p>
              </CardContent>
            </Card>
          </div>

          {/* Rebalancing Groups */}
          <div>
            {groups.map(group => (
              <RebalancingGroupRow
                key={group.id}
                group={group}
                currencySymbol={currencySymbol}
                formatCurrency={formatCurrency}
              />
            ))}
          </div>
        </main>
      </div>
      <GlobalAIChat currentPage="portfolio" />
    </div>
  );
};

export default Portfolio;
