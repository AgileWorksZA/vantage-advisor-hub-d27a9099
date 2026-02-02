import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Users, 
  Mail, 
  CalendarIcon,
  ListTodo, 
  LineChart, 
  Building2, 
  Plus,
  Search,
  Bell,
  LogOut,
  ArrowLeft,
  ChevronDown,
  MoreHorizontal
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ClientSummaryTab from "@/components/client-detail/ClientSummaryTab";
import ClientDetailsTab from "@/components/client-detail/ClientDetailsTab";
import ClientCRMTab from "@/components/client-detail/ClientCRMTab";
import ClientFamilyTab from "@/components/client-detail/ClientFamilyTab";
import ClientBusinessesTab from "@/components/client-detail/ClientBusinessesTab";
import ClientContactsTab from "@/components/client-detail/ClientContactsTab";
import ClientWorkflowsTab from "@/components/client-detail/ClientWorkflowsTab";
import ClientComplianceTab from "@/components/client-detail/ClientComplianceTab";
import ClientProductsTab from "@/components/client-detail/ClientProductsTab";
import ClientNotesTab from "@/components/client-detail/ClientNotesTab";
import ClientCommunicationTab from "@/components/client-detail/ClientCommunicationTab";
import ClientDocumentsTab from "@/components/client-detail/ClientDocumentsTab";
import { useClientDetail } from "@/hooks/useClientDetail";
import { getDisplayName } from "@/types/client";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dash", path: "/dashboard" },
  { icon: Users, label: "Clients", path: "/clients" },
  { icon: Mail, label: "Email", path: "/email" },
  { icon: CalendarIcon, label: "Calendar", path: "/calendar" },
  { icon: ListTodo, label: "Tasks", path: "/tasks" },
  { icon: LineChart, label: "Insights", path: "/insights" },
  { icon: Building2, label: "Practice", path: "/practice" },
];

const ClientDetail = () => {
  const navigate = useNavigate();
  const { clientId } = useParams<{ clientId: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("summary");

  // Fetch client data from Supabase
  const { client, loading: clientLoading, error, updateClient, refetch } = useClientDetail(clientId);
  
  const clientName = client ? getDisplayName(client) : "Loading...";

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setAuthLoading(false);
        
        if (!session?.user) {
          navigate("/auth");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setAuthLoading(false);
      
      if (!session?.user) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (authLoading || clientLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-lg text-muted-foreground">{error || "Client not found"}</p>
          <Button onClick={() => navigate("/clients")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Clients
          </Button>
        </div>
      </div>
    );
  }

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Adviser";

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
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

        {/* Client Detail Content */}
        <main className="flex-1 p-6 overflow-auto">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate("/clients")}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <h1 className="text-xl font-semibold">
                Manage individual (Owner) - {clientName}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Select defaultValue="personal-financial">
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select report" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal-financial">Personal financial report</SelectItem>
                  <SelectItem value="investment-summary">Investment summary</SelectItem>
                  <SelectItem value="risk-profile">Risk profile</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="gap-2">
                Manage related entity
                <ChevronDown className="w-4 h-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Export client data</DropdownMenuItem>
                  <DropdownMenuItem>Print profile</DropdownMenuItem>
                  <DropdownMenuItem>Archive client</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">Delete client</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Tab Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b border-border rounded-none gap-0 flex-wrap">
              {[
                { value: "summary", label: "Summary" },
                { value: "details", label: "Details" },
                { value: "crm", label: "CRM" },
                { value: "family", label: "Family" },
                { value: "businesses", label: "Businesses" },
                { value: "contacts", label: "Contacts" },
                { value: "workflows", label: "Workflows" },
                { value: "compliance", label: "Compliance" },
                { value: "products", label: "Products" },
                { value: "notes", label: "Notes" },
                { value: "communication", label: "Communication" },
                { value: "documents", label: "Documents" },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-[hsl(180,70%,45%)] data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 text-sm"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="mt-6">
              <TabsContent value="summary" className="mt-0">
                <ClientSummaryTab client={client} />
              </TabsContent>
              <TabsContent value="details" className="mt-0">
                <ClientDetailsTab client={client} onUpdate={updateClient} />
              </TabsContent>
              <TabsContent value="crm" className="mt-0">
                <ClientCRMTab client={client} onUpdate={updateClient} />
              </TabsContent>
              <TabsContent value="family" className="mt-0">
                <ClientFamilyTab />
              </TabsContent>
              <TabsContent value="businesses" className="mt-0">
                <ClientBusinessesTab />
              </TabsContent>
              <TabsContent value="contacts" className="mt-0">
                <ClientContactsTab />
              </TabsContent>
              <TabsContent value="workflows" className="mt-0">
                <ClientWorkflowsTab />
              </TabsContent>
              <TabsContent value="compliance" className="mt-0">
                <ClientComplianceTab />
              </TabsContent>
              <TabsContent value="products" className="mt-0">
                <ClientProductsTab />
              </TabsContent>
              <TabsContent value="notes" className="mt-0">
                <ClientNotesTab />
              </TabsContent>
              <TabsContent value="communication" className="mt-0">
                <ClientCommunicationTab />
              </TabsContent>
              <TabsContent value="documents" className="mt-0">
                <ClientDocumentsTab />
              </TabsContent>
            </div>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default ClientDetail;
