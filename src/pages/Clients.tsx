import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
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
  RefreshCw,
  ChevronLeft,
  ChevronFirst,
  Users2,
  Building
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const clientsData = [
  {
    profileState: "Active",
    profileType: "Client",
    clientType: "family",
    client: "Wegner, E (Emile)",
    title: "Mr",
    identification: "8108255051081",
    age: 44,
    phone: "+27762149144",
    email: "emilewegner@efgroup.co.za",
    advisor: "Emile Wegner",
    wealthManager: "",
    language: "English",
    dateCreated: "15-Apr-2025 08:18:28",
  },
  {
    profileState: "Active",
    profileType: "Prospect",
    clientType: "individual",
    client: "Johno, M (Mako)",
    title: "Mrs",
    identification: "8002152190083",
    age: 45,
    phone: "+27722031095",
    email: "dale.harding@efgroup.co.za",
    advisor: "Dale Harding",
    wealthManager: "",
    language: "English",
    dateCreated: "09-Jul-2025 10:04:34",
  },
  {
    profileState: "Active",
    profileType: "Client",
    clientType: "individual",
    client: "Jones, M (Michelle )",
    title: "Mrs",
    identification: "6901190029085",
    age: 57,
    phone: "+27716733160",
    email: "mhough1969@gmail.com",
    advisor: "Christo van Zyl",
    wealthManager: "",
    language: "Afrikaans",
    dateCreated: "27-Feb-2025 06:17:59",
  },
  {
    profileState: "Active",
    profileType: "Prospect",
    clientType: "individual",
    client: "Crowcamp, DI (Danny Junior)",
    title: "",
    identification: "5306045081086",
    age: 72,
    phone: "+27617532303",
    email: "trisha@efgroup.co.za",
    advisor: "Christo van Zyl",
    wealthManager: "",
    language: "English",
    dateCreated: "18-Nov-2025 08:18:40",
  },
  {
    profileState: "Active",
    profileType: "Client",
    clientType: "individual",
    client: "New TAU, NC (New CRM)",
    title: "Adv",
    identification: "6802141451081",
    age: 57,
    phone: "+27712223333",
    email: "test@efgroup.co.za",
    advisor: "Dale Harding",
    wealthManager: "",
    language: "English",
    dateCreated: "08-Jul-2025 18:46:06",
  },
  {
    profileState: "Active",
    profileType: "Client",
    clientType: "family",
    client: "Harding, DS (Dale)",
    title: "Mr",
    identification: "9206245170083",
    age: 33,
    phone: "+27722031095",
    email: "dale.harding@efgroup.co.za",
    advisor: "Dale Harding",
    wealthManager: "",
    language: "English",
    dateCreated: "10-Jul-2025 13:45:48",
  },
  {
    profileState: "Active",
    profileType: "Client",
    clientType: "business",
    client: "GAB Investments (PTY) Ltd",
    title: "",
    identification: "2025/523192/07",
    age: null,
    phone: "+27723458855",
    email: "reg@quicksilverlogistics.co.za",
    advisor: "Ihan Nel",
    wealthManager: "",
    language: "English",
    dateCreated: "18-Sep-2025 12:55:31",
  },
  {
    profileState: "Active",
    profileType: "Client",
    clientType: "individual",
    client: "Doe, J (John)",
    title: "Dr",
    identification: "0404018797088",
    age: 21,
    phone: "+27617532303",
    email: "test@efgroup.co.za",
    advisor: "Christo van Zyl",
    wealthManager: "",
    language: "English",
    dateCreated: "21-Oct-2025 10:25:52",
  },
  {
    profileState: "Active",
    profileType: "Prospect",
    clientType: "individual",
    client: "Dannheimer (Steenkamp), W (W.H.H )",
    title: "Dr",
    identification: "5212095004087",
    age: 73,
    phone: "",
    email: "dannheimersteenkamp@gmail.com",
    advisor: "Christo van Zyl",
    wealthManager: "",
    language: "English",
    dateCreated: "27-Feb-2025 06:20:22",
  },
];

const filterTabs = [
  { label: "Lead", color: "hsl(180, 70%, 45%)" },
  { label: "Prospect", color: "hsl(180, 70%, 45%)" },
  { label: "Client", color: "hsl(180, 70%, 45%)" },
  { label: "Shared Clients", color: "hsl(0, 0%, 70%)" },
  { label: "Incomplete Profile", color: "hsl(0, 0%, 70%)" },
  { label: "Deceased", color: "hsl(0, 0%, 70%)" },
];

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dash", path: "/dashboard" },
  { icon: Users, label: "Clients", path: "/clients" },
  { icon: Mail, label: "Email", path: "/email" },
  { icon: ListTodo, label: "Tasks", path: "/tasks" },
  { icon: LineChart, label: "Insights", path: "/insights" },
  { icon: Building2, label: "Practice", path: "/practice" },
];

const Clients = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [activeFilter, setActiveFilter] = useState("Client");

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (!session?.user) {
          navigate("/auth");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
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
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Adviser";

  const getClientIcon = (type: string) => {
    switch (type) {
      case "family":
        return <Users2 className="w-4 h-4 text-muted-foreground" />;
      case "business":
        return <Building className="w-4 h-4 text-muted-foreground" />;
      default:
        return <Users className="w-4 h-4 text-muted-foreground" />;
    }
  };

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
              item.path === "/clients" 
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
            <Input 
              placeholder="Search..." 
              className="pl-10 bg-muted/50 border-0"
            />
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

        {/* Clients Content */}
        <main className="flex-1 p-6 overflow-auto">
          {/* Filter Tabs Row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {filterTabs.map((tab) => (
                <button
                  key={tab.label}
                  onClick={() => setActiveFilter(tab.label)}
                  className={`px-4 py-1.5 text-sm rounded border transition-colors ${
                    activeFilter === tab.label
                      ? "bg-[hsl(180,70%,45%)] text-white border-[hsl(180,70%,45%)]"
                      : "bg-background border-border text-foreground hover:bg-muted"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <Button className="bg-[hsl(180,70%,45%)] hover:bg-[hsl(180,70%,40%)] text-white">
              + Add Profile
            </Button>
          </div>

          {/* Reset Filters & Include Inactive */}
          <div className="flex items-center gap-4 mb-6">
            <button className="text-[hsl(180,70%,45%)] text-sm hover:underline">
              Reset Filters
            </button>
            <div className="flex items-center gap-2">
              <Switch 
                checked={includeInactive} 
                onCheckedChange={setIncludeInactive}
              />
              <span className="text-sm text-muted-foreground">Include inactive clients</span>
            </div>
          </div>

          {/* Recently Viewed Section */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[hsl(180,70%,45%)] font-medium">RECENTLY VIEWED</h2>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-[hsl(180,70%,45%)] text-[hsl(180,70%,45%)] hover:bg-[hsl(180,70%,45%)]/10"
                >
                  Reports
                </Button>
                <Select>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="option1">Option 1</SelectItem>
                    <SelectItem value="option2">Option 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mb-4">
              <Input 
                placeholder="" 
                className="max-w-md bg-background"
              />
              <Button className="bg-[hsl(180,70%,45%)] hover:bg-[hsl(180,70%,40%)] text-white">
                Search
              </Button>
              <Button variant="outline" size="icon" className="border-[hsl(180,70%,45%)] text-[hsl(180,70%,45%)]">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Clients Table */}
          <div className="bg-background rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs font-normal text-muted-foreground">Profile state</TableHead>
                  <TableHead className="text-xs font-normal text-muted-foreground">Profile Type</TableHead>
                  <TableHead className="text-xs font-normal text-muted-foreground">Client</TableHead>
                  <TableHead className="text-xs font-normal text-muted-foreground">Title</TableHead>
                  <TableHead className="text-xs font-normal text-muted-foreground">Identification</TableHead>
                  <TableHead className="text-xs font-normal text-muted-foreground">Age</TableHead>
                  <TableHead className="text-xs font-normal text-muted-foreground">Contact Details</TableHead>
                  <TableHead className="text-xs font-normal text-muted-foreground">Advisor</TableHead>
                  <TableHead className="text-xs font-normal text-muted-foreground">Wealth Manager</TableHead>
                  <TableHead className="text-xs font-normal text-muted-foreground">Language</TableHead>
                  <TableHead className="text-xs font-normal text-muted-foreground">Date Created</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientsData.map((client, index) => (
                  <TableRow 
                    key={index} 
                    className="hover:bg-muted/50 cursor-pointer"
                    onClick={() => {
                      const clientId = client.client.toLowerCase().replace(/[^a-z]/g, "-").replace(/-+/g, "-").slice(0, 20);
                      navigate(`/clients/${clientId}`);
                    }}
                  >
                    <TableCell className="text-sm">{client.profileState}</TableCell>
                    <TableCell className="text-sm">{client.profileType}</TableCell>
                    <TableCell className="text-sm">
                      <div className="flex items-center gap-2">
                        {getClientIcon(client.clientType)}
                        <span>{client.client}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{client.title}</TableCell>
                    <TableCell className="text-sm">{client.identification}</TableCell>
                    <TableCell className="text-sm">{client.age || ""}</TableCell>
                    <TableCell className="text-sm">
                      <div className="flex flex-col">
                        <span>{client.phone}</span>
                        <span className="text-muted-foreground text-xs">{client.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{client.advisor}</TableCell>
                    <TableCell className="text-sm">{client.wealthManager}</TableCell>
                    <TableCell className="text-sm">{client.language}</TableCell>
                    <TableCell className="text-sm">{client.dateCreated}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center gap-2 mt-4">
            <Button variant="outline" size="icon" className="h-8 w-8" disabled>
              <ChevronFirst className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" disabled>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground ml-2">1 to 9 of 9</span>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Clients;
