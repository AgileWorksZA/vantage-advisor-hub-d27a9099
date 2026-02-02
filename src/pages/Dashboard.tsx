import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard, Users, Mail, CalendarIcon, ListTodo, LineChart, Building2, Plus, X } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { getRegionalData } from "@/data/regionalData";
import { AppHeader } from "@/components/layout/AppHeader";

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
const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<string>("ZA");

  // Get regional data based on selected region
  const regionalData = getRegionalData(selectedRegion);

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
          <Plus className="w-5 h-5" />
        </Button>
        {sidebarItems.map(item => <button key={item.label} onClick={() => navigate(item.path)} className={`w-full flex flex-col items-center py-2 text-xs gap-1 ${item.path === "/dashboard" ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white/80"}`}>
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </button>)}
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
          <h1 className="text-2xl font-semibold mb-6">Advisor Dashboard</h1>
          
          <div className="grid grid-cols-12 gap-4">
            {/* Provider View */}
            <Card className="col-span-3">
              <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
                <CardTitle className="text-sm font-medium">Provider View</CardTitle>
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
                    {regionalData.providers.map(provider => <tr key={provider.name} className="border-t border-border">
                        <td className="py-2">{provider.name}</td>
                        <td className="py-2 text-right text-muted-foreground">{provider.bookPercent}</td>
                        <td className="py-2 text-right">{provider.value}</td>
                      </tr>)}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* Top 5 Accounts */}
            <Card className="col-span-3">
              <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
                <CardTitle className="text-sm font-medium">Top 5 Accounts</CardTitle>
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
                    {regionalData.topAccounts.map(account => <tr key={account.investor} className="border-t border-border">
                        <td className="py-2">{account.investor}</td>
                        <td className="py-2 text-right text-muted-foreground">{account.bookPercent}</td>
                        <td className="py-2 text-right">{account.value}</td>
                      </tr>)}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* AUM by Product */}
            <Card className="col-span-3">
              <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
                <CardTitle className="text-sm font-medium">AUM by Product</CardTitle>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <X className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <p className="text-xl font-semibold mb-2">{regionalData.totalAUM}</p>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={regionalData.products} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value">
                        {regionalData.products.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                      <Tooltip formatter={value => `${value}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs mt-2">
                  {regionalData.products.map(item => <div key={item.name} className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full" style={{
                    backgroundColor: item.color
                  }}></span>
                      <span className="text-muted-foreground">{item.name}</span>
                    </div>)}
                </div>
              </CardContent>
            </Card>

            {/* Birthdays */}
            <Card className="col-span-3">
              <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
                <CardTitle className="text-sm font-medium">Birthdays</CardTitle>
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
                    {regionalData.birthdays.map(person => <tr key={person.name} className="border-t border-border">
                        <td className="py-1.5">{person.name}</td>
                        <td className="py-1.5 text-right text-muted-foreground">{person.nextBirthday}</td>
                        <td className="py-1.5 text-right">{person.age}</td>
                      </tr>)}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* Clients by Value */}
            <Card className="col-span-3">
              <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
                <CardTitle className="text-sm font-medium">Clients by Value</CardTitle>
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
                    {regionalData.clientsByValue.map(row => <tr key={row.range} className="border-t border-border">
                        <td className="py-2">{row.range}</td>
                        <td className="py-2 text-right">{row.value}</td>
                        <td className="py-2 text-right text-muted-foreground">{row.investors}</td>
                      </tr>)}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>;
};
export default Dashboard;