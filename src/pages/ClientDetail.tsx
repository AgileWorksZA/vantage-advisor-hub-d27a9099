import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dash", path: "/dashboard" },
  { icon: Users, label: "Clients", path: "/clients" },
  { icon: Mail, label: "Email", path: "/email" },
  { icon: ListTodo, label: "Tasks", path: "/tasks" },
  { icon: LineChart, label: "Insights", path: "/insights" },
  { icon: Building2, label: "Practice", path: "/practice" },
];

// Helper to generate consistent client IDs from names
const generateClientId = (name: string) => {
  return name.toLowerCase().replace(/[^a-z]/g, "-").replace(/-+/g, "-").slice(0, 20);
};

// Mock client data - in real app this would come from API/database
const clientsRaw = [
  {
    client: "Wegner, E (Emile)",
    title: "Mr",
    personType: "Individual",
    idNumber: "8108255051081",
    countryOfIssue: "South Africa",
    gender: "Male",
    age: 44,
    birthday: "25 Aug 1981",
    language: "English",
    taxNumber: "1234567890",
    phone: "+27762149144",
    email: "emilewegner@efgroup.co.za",
    workNumber: "+27 21 555 1234",
    workExtension: "101",
    homeNumber: "+27 21 555 5678",
    cellNumber: "+27762149144",
    advisor: "Emile Wegner",
  },
  {
    client: "Johno, M (Mako)",
    title: "Mrs",
    personType: "Individual",
    idNumber: "8002152190083",
    countryOfIssue: "South Africa",
    gender: "Female",
    age: 45,
    birthday: "15 Feb 1980",
    language: "English",
    taxNumber: "0987654321",
    phone: "+27722031095",
    email: "dale.harding@efgroup.co.za",
    workNumber: "+27 21 555 2345",
    workExtension: "102",
    homeNumber: "+27 21 555 6789",
    cellNumber: "+27722031095",
    advisor: "Dale Harding",
  },
  {
    client: "Jones, M (Michelle )",
    title: "Mrs",
    personType: "Individual",
    idNumber: "6901190029085",
    countryOfIssue: "South Africa",
    gender: "Female",
    age: 57,
    birthday: "19 Jan 1969",
    language: "Afrikaans",
    taxNumber: "2345678901",
    phone: "+27716733160",
    email: "mhough1969@gmail.com",
    workNumber: "+27 21 555 3456",
    workExtension: "103",
    homeNumber: "+27 21 555 7890",
    cellNumber: "+27716733160",
    advisor: "Christo van Zyl",
  },
  {
    client: "Crowcamp, DI (Danny Junior)",
    title: "",
    personType: "Individual",
    idNumber: "5306045081086",
    countryOfIssue: "South Africa",
    gender: "Male",
    age: 72,
    birthday: "04 Jun 1953",
    language: "English",
    taxNumber: "3456789012",
    phone: "+27617532303",
    email: "trisha@efgroup.co.za",
    workNumber: "+27 21 555 4567",
    workExtension: "104",
    homeNumber: "+27 21 555 8901",
    cellNumber: "+27617532303",
    advisor: "Christo van Zyl",
  },
  {
    client: "New TAU, NC (New CRM)",
    title: "Adv",
    personType: "Individual",
    idNumber: "6802141451081",
    countryOfIssue: "South Africa",
    gender: "Female",
    age: 57,
    birthday: "14 Feb 1968",
    language: "English",
    taxNumber: "4567890123",
    phone: "+27712223333",
    email: "test@efgroup.co.za",
    workNumber: "+27 21 555 5678",
    workExtension: "105",
    homeNumber: "+27 21 555 9012",
    cellNumber: "+27712223333",
    advisor: "Dale Harding",
  },
  {
    client: "Harding, DS (Dale)",
    title: "Mr",
    personType: "Individual",
    idNumber: "9206245170083",
    countryOfIssue: "South Africa",
    gender: "Male",
    age: 33,
    birthday: "24 Jun 1992",
    language: "English",
    taxNumber: "5678901234",
    phone: "+27722031095",
    email: "dale.harding@efgroup.co.za",
    workNumber: "+27 21 555 6789",
    workExtension: "106",
    homeNumber: "+27 21 555 0123",
    cellNumber: "+27722031095",
    advisor: "Dale Harding",
  },
  {
    client: "GAB Investments (PTY) Ltd",
    title: "",
    personType: "Company",
    idNumber: "2025/523192/07",
    countryOfIssue: "South Africa",
    gender: "-",
    age: 0,
    birthday: "-",
    language: "English",
    taxNumber: "6789012345",
    phone: "+27723458855",
    email: "reg@quicksilverlogistics.co.za",
    workNumber: "+27 21 555 7890",
    workExtension: "107",
    homeNumber: "-",
    cellNumber: "+27723458855",
    advisor: "Ihan Nel",
  },
  {
    client: "Doe, J (John)",
    title: "Dr",
    personType: "Individual",
    idNumber: "0404018797088",
    countryOfIssue: "South Africa",
    gender: "Male",
    age: 21,
    birthday: "01 Apr 2004",
    language: "English",
    taxNumber: "7890123456",
    phone: "+27617532303",
    email: "test@efgroup.co.za",
    workNumber: "+27 21 555 8901",
    workExtension: "108",
    homeNumber: "+27 21 555 1234",
    cellNumber: "+27617532303",
    advisor: "Christo van Zyl",
  },
  {
    client: "Dannheimer (Steenkamp), W (W.H.H )",
    title: "Dr",
    personType: "Individual",
    idNumber: "5212095004087",
    countryOfIssue: "South Africa",
    gender: "Male",
    age: 73,
    birthday: "09 Dec 1952",
    language: "English",
    taxNumber: "8901234567",
    phone: "",
    email: "dannheimersteenkamp@gmail.com",
    workNumber: "+27 21 555 9012",
    workExtension: "109",
    homeNumber: "+27 21 555 2345",
    cellNumber: "",
    advisor: "Christo van Zyl",
  },
];

// Build lookup by generated ID
const clientsData: Record<string, {
  id: string;
  name: string;
  title: string;
  initials: string;
  personType: string;
  idNumber: string;
  countryOfIssue: string;
  gender: string;
  age: number;
  birthday: string;
  language: string;
  taxNumber: string;
  phone: string;
  email: string;
  workNumber: string;
  workExtension: string;
  homeNumber: string;
  cellNumber: string;
  advisor: string;
}> = {};

clientsRaw.forEach((c) => {
  const id = generateClientId(c.client);
  // Extract initials from name (first letter of each part before parenthesis)
  const nameParts = c.client.split(",")[0] || c.client;
  const initialsMatch = c.client.match(/\(([^)]+)\)/);
  const initials = initialsMatch 
    ? initialsMatch[1].split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
    : nameParts.slice(0, 2).toUpperCase();
  
  clientsData[id] = {
    id,
    name: c.client,
    title: c.title,
    initials,
    personType: c.personType,
    idNumber: c.idNumber,
    countryOfIssue: c.countryOfIssue,
    gender: c.gender,
    age: c.age,
    birthday: c.birthday,
    language: c.language,
    taxNumber: c.taxNumber,
    phone: c.phone,
    email: c.email,
    workNumber: c.workNumber,
    workExtension: c.workExtension,
    homeNumber: c.homeNumber,
    cellNumber: c.cellNumber,
    advisor: c.advisor,
  };
});

const ClientDetail = () => {
  const navigate = useNavigate();
  const { clientId } = useParams<{ clientId: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("summary");

  // Get client data based on clientId
  const client = clientId ? clientsData[clientId] : clientsData["botha-karel"];
  const clientName = client?.name || "Botha, Karel";

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
                <ClientDetailsTab client={client} />
              </TabsContent>
              <TabsContent value="crm" className="mt-0">
                <ClientCRMTab client={client} />
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
