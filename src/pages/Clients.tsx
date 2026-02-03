import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  X,
  RefreshCw,
  ChevronLeft,
  ChevronFirst,
  Users2,
  Building,
  Trash2
} from "lucide-react";
import commandCenterIcon from "@/assets/command-center-icon.png";
import vantageLogo from "@/assets/vantage-logo.png";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useClients } from "@/hooks/useClients";
import AddClientDialog from "@/components/clients/AddClientDialog";
import { AppHeader } from "@/components/layout/AppHeader";

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
  { icon: CalendarIcon, label: "Calendar", path: "/calendar" },
  { icon: ListTodo, label: "Tasks", path: "/tasks" },
  { icon: LineChart, label: "Insights", path: "/insights" },
  { icon: Building2, label: "Practice", path: "/practice" },
];

const Clients = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [activeFilter, setActiveFilter] = useState("Client");
  const [searchQuery, setSearchQuery] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<{ id: string; name: string } | null>(null);
  
  // Dashboard widget filter state
  const [filterSource, setFilterSource] = useState<string | null>(null);
  const [filteredNames, setFilteredNames] = useState<string[]>([]);
  const [widgetData, setWidgetData] = useState<Record<string, { birthday?: string; age?: number; value?: string; bookPercent?: string }>>({});

  const { clients, loading: clientsLoading, refetch, deleteClient } = useClients();

  // Read URL parameters for Dashboard widget filters
  useEffect(() => {
    const filter = searchParams.get('filter');
    const dataParam = searchParams.get('data');
    
    if (filter && dataParam) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(dataParam));
        setFilterSource(filter === 'birthdays' ? 'Upcoming Birthdays' : 'Top Accounts');
        
        // Build lookup map by name
        const dataMap: Record<string, any> = {};
        parsedData.forEach((item: any) => {
          const name = item.name.toLowerCase();
          if (filter === 'birthdays') {
            dataMap[name] = { birthday: item.birthday, age: item.age };
          } else {
            dataMap[name] = { value: item.value, bookPercent: item.bookPercent };
          }
        });
        setWidgetData(dataMap);
        
        // Extract names for filtering
        const nameList = parsedData.map((item: any) => item.name);
        setFilteredNames(nameList);
        setActiveFilter("");
      } catch (e) {
        console.error('Failed to parse widget data:', e);
        setFilterSource(null);
        setFilteredNames([]);
        setWidgetData({});
      }
    } else {
      setFilterSource(null);
      setFilteredNames([]);
      setWidgetData({});
    }
  }, [searchParams]);

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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleDeleteClick = (e: React.MouseEvent, clientId: string, clientName: string) => {
    e.stopPropagation();
    setClientToDelete({ id: clientId, name: clientName });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (clientToDelete) {
      await deleteClient(clientToDelete.id);
      setDeleteDialogOpen(false);
      setClientToDelete(null);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const userName = user?.user_metadata?.full_name || "Adviser";
  const userEmail = user?.email || "adviser@vantage.co";

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

  // Clear dashboard filter helper
  const clearDashboardFilter = () => {
    setSearchParams({});
    setFilteredNames([]);
    setFilterSource(null);
    setWidgetData({});
    setActiveFilter("Client");
  };

  // Get widget data for a client by fuzzy name matching
  const getWidgetDataForClient = (clientName: string) => {
    const clientLower = clientName.toLowerCase();
    
    for (const [widgetName, data] of Object.entries(widgetData)) {
      let surname: string;
      let firstName: string;
      
      // Handle "Surname, FirstName" format (Top Accounts) vs "FirstName ... Surname" format (Birthdays)
      if (widgetName.includes(',')) {
        // Top Accounts format: "Chen, Wei" or "Johnson, Robert"
        const commaParts = widgetName.split(',').map(p => p.trim());
        surname = commaParts[0]; // "Chen"
        firstName = commaParts[1] || ''; // "Wei"
      } else {
        // Birthday format: "Andre Thomas Coetzer"
        const spaceParts = widgetName.split(' ');
        surname = spaceParts[spaceParts.length - 1]; // Last word
        firstName = spaceParts[0]; // First word
      }
      
      // Check if client name contains surname or firstName
      if (clientLower.includes(surname.toLowerCase()) || 
          (firstName && clientLower.includes(firstName.toLowerCase()))) {
        return data;
      }
    }
    return null;
  };

  // Filter clients based on active filter, search query, and dashboard widget filter
  const filteredClients = clients.filter((client) => {
    // If coming from Dashboard widget, filter by name list
    if (filteredNames.length > 0) {
      const clientFullName = client.client.toLowerCase();
      const matchesName = filteredNames.some(name => {
        const nameParts = name.toLowerCase().split(' ');
        const surname = nameParts[nameParts.length - 1];
        const firstName = nameParts[0];
        // Match surname or first name in client display name
        return clientFullName.includes(surname) || clientFullName.includes(firstName);
      });
      if (!matchesName) return false;
    }
    
    // Filter by profile type (only if not coming from dashboard filter)
    if (!filterSource) {
      if (activeFilter === "Lead" && client.profileType !== "Lead") return false;
      if (activeFilter === "Prospect" && client.profileType !== "Prospect") return false;
      if (activeFilter === "Client" && client.profileType !== "Client") return false;
    }
    
    // Filter by inactive state
    if (!includeInactive && client.profileState === "Inactive") return false;
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        client.client.toLowerCase().includes(query) ||
        client.email.toLowerCase().includes(query) ||
        client.phone.includes(query) ||
        client.identification.includes(query)
      );
    }
    
    return true;
  });

  return (
    <div className="h-screen bg-muted/30 flex overflow-hidden">
      {/* Sidebar - Fixed */}
      <aside className="w-16 bg-[hsl(180,25%,25%)] flex flex-col items-center py-4 gap-1 shrink-0">
        <Button variant="ghost" size="icon" className="w-10 h-10 text-white/80 hover:bg-white/10 mb-4" onClick={() => navigate("/command-center")} title="Practice Overview">
          <img src={commandCenterIcon} alt="Command Center" className="w-5 h-5" />
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
          searchPlaceholder="Search..."
          userName={userName}
          userEmail={userEmail}
          onSignOut={handleSignOut}
          onAccountSettings={() => navigate("/practice")}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Clients Content - Scrollable */}
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
            <Button 
              className="bg-[hsl(180,70%,45%)] hover:bg-[hsl(180,70%,40%)] text-white"
              onClick={() => setAddDialogOpen(true)}
            >
              + Add Profile
            </Button>
          </div>

          {/* Dashboard Filter Indicator */}
          {filterSource && (
            <div className="flex items-center gap-2 mb-4 p-3 bg-primary/10 rounded-lg border border-primary/30">
              <span className="text-sm">
                Showing clients from: <strong>{filterSource}</strong>
              </span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={clearDashboardFilter}
                className="h-7 px-2"
              >
                <X className="w-4 h-4 mr-1" />
                Clear Filter
              </Button>
            </div>
          )}

          {/* Reset Filters & Include Inactive */}
          <div className="flex items-center gap-4 mb-6">
            <button 
              className="text-[hsl(180,70%,45%)] text-sm hover:underline"
              onClick={() => {
                clearDashboardFilter();
                setSearchQuery("");
                setIncludeInactive(false);
              }}
            >
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
              <h2 className="text-[hsl(180,70%,45%)] font-medium">
                {clients.length > 0 ? "YOUR CLIENTS" : "RECENTLY VIEWED"}
              </h2>
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
                placeholder="Search clients..." 
                className="max-w-md bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button className="bg-[hsl(180,70%,45%)] hover:bg-[hsl(180,70%,40%)] text-white">
                Search
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="border-[hsl(180,70%,45%)] text-[hsl(180,70%,45%)]"
                onClick={refetch}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Clients Table */}
          <div className="bg-background rounded-lg border border-border">
            {clientsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Users className="w-12 h-12 mb-4 opacity-50" />
                <p className="text-lg font-medium">No clients found</p>
                <p className="text-sm">
                  {clients.length === 0 
                    ? "Click '+ Add Profile' to add your first client" 
                    : "Try adjusting your filters or search query"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-xs font-normal text-muted-foreground">Profile state</TableHead>
                    <TableHead className="text-xs font-normal text-muted-foreground">Profile Type</TableHead>
                    <TableHead className="text-xs font-normal text-muted-foreground">Client</TableHead>
                    <TableHead className="text-xs font-normal text-muted-foreground">Title</TableHead>
                    <TableHead className="text-xs font-normal text-muted-foreground">Identification</TableHead>
                    <TableHead className="text-xs font-normal text-muted-foreground">Age</TableHead>
                    {filterSource === 'Upcoming Birthdays' && (
                      <TableHead className="text-xs font-normal text-muted-foreground">Birthday</TableHead>
                    )}
                    {filterSource === 'Top Accounts' && (
                      <TableHead className="text-xs font-normal text-muted-foreground">Account Value</TableHead>
                    )}
                    <TableHead className="text-xs font-normal text-muted-foreground">Contact Details</TableHead>
                    <TableHead className="text-xs font-normal text-muted-foreground">Advisor</TableHead>
                    <TableHead className="text-xs font-normal text-muted-foreground">Wealth Manager</TableHead>
                    <TableHead className="text-xs font-normal text-muted-foreground">Language</TableHead>
                    <TableHead className="text-xs font-normal text-muted-foreground">Date Created</TableHead>
                    <TableHead className="w-20"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow 
                      key={client.id} 
                      className="hover:bg-muted/50 cursor-pointer"
                      onClick={() => navigate(`/clients/${client.id}`)}
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
                      {filterSource === 'Upcoming Birthdays' && (
                        <TableCell className="text-sm font-medium text-primary">
                          {getWidgetDataForClient(client.client)?.birthday || "—"}
                        </TableCell>
                      )}
                      {filterSource === 'Top Accounts' && (
                        <TableCell className="text-sm font-medium text-emerald-600">
                          {getWidgetDataForClient(client.client)?.value || "—"}
                        </TableCell>
                      )}
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
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <Plus className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-destructive hover:text-destructive"
                            onClick={(e) => handleDeleteClick(e, client.id, client.client)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center gap-2 mt-4">
            <Button variant="outline" size="icon" className="h-8 w-8" disabled>
              <ChevronFirst className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" disabled>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground ml-2">
              1 to {filteredClients.length} of {filteredClients.length}
            </span>
          </div>
        </main>
      </div>

      {/* Add Client Dialog */}
      <AddClientDialog 
        open={addDialogOpen} 
        onOpenChange={setAddDialogOpen} 
        onClientAdded={refetch}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Client</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{clientToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Clients;
