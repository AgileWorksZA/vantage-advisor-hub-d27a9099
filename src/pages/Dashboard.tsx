import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard, Users, Mail, ListTodo, LineChart, Building2, Plus, X, Search, Bell, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { AdvisorFilter } from "@/components/dashboard/AdvisorFilter";
const providerData = [{
  name: "Ninety One",
  bookPercent: "55.3 %",
  value: "R 2,026,539,331"
}, {
  name: "Old Mutual International",
  bookPercent: "10.6 %",
  value: "R 387,751,193"
}, {
  name: "Allan Gray",
  bookPercent: "9.5 %",
  value: "R 348,470,019"
}, {
  name: "Sanlam Glacier",
  bookPercent: "4.9 %",
  value: "R 178,833,622"
}, {
  name: "Investec Corporate Cash Management",
  bookPercent: "3.8 %",
  value: "R 139,656,065"
}];
const topAccountsData = [{
  investor: "NG Kerk Sinode Oos-Kaapland",
  bookPercent: "1.1 %",
  value: "R 41,926,359.70"
}, {
  investor: "De Villiers, Jean",
  bookPercent: "1.0 %",
  value: "R 36,258,037.37"
}, {
  investor: "Louw, Rudolph",
  bookPercent: "0.9 %",
  value: "R 34,277,493.78"
}, {
  investor: "Daan Van Der Sijde",
  bookPercent: "0.9 %",
  value: "R 31,913,925.69"
}, {
  investor: "Philippus Koon",
  bookPercent: "0.8 %",
  value: "R 28,160,599.60"
}];
const aumByProductData = [{
  name: "Cash Management",
  value: 12.2,
  color: "hsl(210, 70%, 40%)"
}, {
  name: "Endowment",
  value: 14.0,
  color: "hsl(142, 76%, 36%)"
}, {
  name: "Investment Plan",
  value: 5.8,
  color: "hsl(45, 93%, 47%)"
}, {
  name: "Living Annuity",
  value: 21.2,
  color: "hsl(280, 65%, 50%)"
}, {
  name: "Other",
  value: 1.3,
  color: "hsl(0, 0%, 60%)"
}, {
  name: "Pension Preservation Fund",
  value: 5.9,
  color: "hsl(210, 100%, 50%)"
}, {
  name: "Preservation Fund",
  value: 39.1,
  color: "hsl(160, 60%, 45%)"
}, {
  name: "Provident Preservation Fund",
  value: 0.5,
  color: "hsl(18, 86%, 56%)"
}];
const birthdaysData = [{
  name: "Andre Thomas Coetzer",
  nextBirthday: "28 January",
  age: 42
}, {
  name: "Elsie Sophia Lourens",
  nextBirthday: "28 January",
  age: 65
}, {
  name: "Samuel de Jager",
  nextBirthday: "28 January",
  age: 69
}, {
  name: "Elana Wasmuth",
  nextBirthday: "28 January",
  age: 34
}, {
  name: "Angeline Loraine Mostert",
  nextBirthday: "28 January",
  age: 63
}, {
  name: "Esther Amanda Nieman",
  nextBirthday: "28 January",
  age: 74
}, {
  name: "Melia Nocwaka Malgas",
  nextBirthday: "28 January",
  age: 73
}, {
  name: "Denise Thiart",
  nextBirthday: "28 January",
  age: 69
}, {
  name: "Elizabeth Saunders",
  nextBirthday: "28 January",
  age: 77
}, {
  name: "Zonwabele Harry Molefe",
  nextBirthday: "28 January",
  age: 64
}];
const clientsByValueData = [{
  range: "R0 – R100 000",
  value: "R 15,579,983",
  investors: 468
}, {
  range: "R100 001 – R1M",
  value: "R 371,511,255",
  investors: 850
}, {
  range: "R1 000 001 – R3M",
  value: "R 831,330,967",
  investors: 469
}, {
  range: "R3 000 001 – R10M",
  value: "R 1,501,814,056",
  investors: 286
}, {
  range: "> R10M",
  value: "R 947,490,312",
  investors: 52
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
  icon: Mail,
  label: "Email",
  path: "/email"
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
  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Adviser";
  return <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar */}
      <aside className="w-16 bg-[hsl(180,25%,25%)] flex flex-col items-center py-4 gap-1">
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
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-14 bg-background border-b border-border flex items-center justify-between px-6">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search..." className="pl-10 bg-muted/50 border-0" />
          </div>
          <div className="flex items-center gap-4">
            <AdvisorFilter />
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
                    {providerData.map(provider => <tr key={provider.name} className="border-t border-border">
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
                    {topAccountsData.map(account => <tr key={account.investor} className="border-t border-border">
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
                <p className="text-xl font-semibold mb-2">3,667,726,572.38</p>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={aumByProductData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value">
                        {aumByProductData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                      <Tooltip formatter={value => `${value}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs mt-2">
                  {aumByProductData.map(item => <div key={item.name} className="flex items-center gap-1">
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
                    {birthdaysData.map(person => <tr key={person.name} className="border-t border-border">
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
                    {clientsByValueData.map(row => <tr key={row.range} className="border-t border-border">
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