import { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Users, 
  Briefcase,
  Mail, 
  CalendarIcon,
  ListTodo, 
  LineChart, 
  Building2,
  X,
  RefreshCw,
  ChevronLeft,
  ChevronFirst,
  Users2,
  Building,
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
import { MultiSelect } from "@/components/ui/multi-select";
import { Badge } from "@/components/ui/badge";
import { useClients } from "@/hooks/useClients";
import { useRecentlyViewedClients } from "@/hooks/useRecentlyViewedClients";
import AddClientDialog from "@/components/clients/AddClientDialog";
import { AddClientChoiceDialog } from "@/components/clients/AddClientChoiceDialog";
import { FinancialPlanningWizard } from "@/components/financial-planning-workflow/FinancialPlanningWizard";
import { AppHeader } from "@/components/layout/AppHeader";
import { useRegion } from "@/contexts/RegionContext";
import GlobalAIChat from "@/components/ai-assistant/GlobalAIChat";

const profileFilterOptions = [
  { value: "Lead", label: "Lead" },
  { value: "Prospect", label: "Prospect" },
  { value: "Client", label: "Client" },
  { value: "Shared Clients", label: "Shared Clients" },
  { value: "Incomplete Profile", label: "Incomplete Profile" },
  { value: "Deceased", label: "Deceased" },
];

const clientTypeOptions = [
  { value: "individual", label: "Individual" },
  { value: "business", label: "Entity" },
  { value: "trust", label: "Trust" },
  { value: "family", label: "Family" },
];

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dash", path: "/dashboard" },
  { icon: Users, label: "Clients", path: "/clients" },
  { icon: LineChart, label: "Portfolio", path: "/portfolio" },
  { icon: Mail, label: "Message", path: "/email" },
  { icon: CalendarIcon, label: "Calendar", path: "/calendar" },
  { icon: ListTodo, label: "Tasks", path: "/tasks" },
  { icon: Briefcase, label: "Insights", path: "/insights" },
  { icon: Building2, label: "Practice", path: "/practice" },
];

const Clients = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [selectedProfileFilters, setSelectedProfileFilters] = useState<string[]>(
    profileFilterOptions.map(o => o.value)
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  
  // Add Client Choice Dialog state
  const [choiceDialogOpen, setChoiceDialogOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState<"simple" | "advice">("simple");
  const [newClientForWizard, setNewClientForWizard] = useState<{ id: string; name: string } | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  
  // Dashboard widget filter state
  const [filterSource, setFilterSource] = useState<string | null>(null);
  const [filteredNames, setFilteredNames] = useState<string[]>([]);
  const [widgetData, setWidgetData] = useState<Record<string, { birthday?: string; age?: number; value?: string; bookPercent?: string }>>({});
  
  // Client type filter state
  const [selectedClientTypes, setSelectedClientTypes] = useState<string[]>(
    ["individual", "business", "trust", "family"]
  );

  const { clients, loading: clientsLoading, refetch } = useClients();
  const { recentClientIds, loading: recentLoading } = useRecentlyViewedClients();
  const { regionalData, selectedAdvisors, selectedRegion } = useRegion();

  // Map selected advisor initials to full names for filtering
  const selectedAdvisorNames = useMemo(() => {
    return regionalData.advisors
      .filter(advisor => selectedAdvisors.includes(advisor.initials))
      .map(advisor => advisor.name);
  }, [regionalData.advisors, selectedAdvisors]);

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
        setSelectedProfileFilters(profileFilterOptions.map(o => o.value));
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


  // Handler for choice dialog selection
  const handleChoiceSelected = (choice: "simple" | "advice") => {
    setSelectedMode(choice);
    setAddDialogOpen(true);
  };

  // Handler when client is created
  const handleClientCreated = (client: { id: string; name: string }) => {
    if (selectedMode === "advice") {
      setNewClientForWizard(client);
      setShowWizard(true);
    }
    refetch();
  };

  // Filter clients based on active filter, search query, dashboard widget filter, AND selected advisors
  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      // Filter by selected client types (person type)
      if (selectedClientTypes.length < clientTypeOptions.length) {
        if (!selectedClientTypes.includes(client.clientType)) return false;
      }

      // Filter by selected advisors from region context
      if (selectedAdvisorNames.length > 0) {
        if (!client.advisor || !selectedAdvisorNames.includes(client.advisor)) {
          return false;
        }
      }

      // If coming from Dashboard widget, filter by name list
      if (filteredNames.length > 0) {
        const clientFullName = client.client.toLowerCase();
        const matchesName = filteredNames.some(name => {
          const nameParts = name.toLowerCase().split(' ');
          const surname = nameParts[nameParts.length - 1];
          const firstName = nameParts[0];
          return clientFullName.includes(surname) || clientFullName.includes(firstName);
        });
        if (!matchesName) return false;
      }
      
      // Filter by profile type (only if not coming from dashboard filter)
      if (!filterSource && selectedProfileFilters.length < profileFilterOptions.length) {
        const profileType = client.profileType;
        // Standard profile types
        if (!selectedProfileFilters.includes(profileType)) return false;
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
  }, [clients, selectedClientTypes, selectedAdvisorNames, filteredNames, filterSource, selectedProfileFilters, includeInactive, searchQuery]);

  // Determine display clients: recently viewed (recency order) when no search, full results otherwise
  const displayClients = useMemo(() => {
    if (searchQuery || filterSource) {
      return filteredClients;
    }
    // No search: show only recently viewed, in recency order
    if (recentClientIds.length === 0) return [];
    return recentClientIds
      .map(id => filteredClients.find(c => c.id === id))
      .filter((c): c is NonNullable<typeof c> => Boolean(c));
  }, [filteredClients, recentClientIds, searchQuery, filterSource]);

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
      case "trust":
        return <Briefcase className="w-4 h-4 text-muted-foreground" />;
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
    setSelectedProfileFilters(profileFilterOptions.map(o => o.value));
    setSelectedClientTypes(["individual", "business", "trust", "family"]);
  };

  // Get widget data for a client by fuzzy name matching
  const getWidgetDataForClient = (clientName: string) => {
    const clientLower = clientName.toLowerCase();
    
    for (const [widgetName, data] of Object.entries(widgetData)) {
      let surname: string;
      let firstName: string;
      
      if (widgetName.includes(',')) {
        const commaParts = widgetName.split(',').map(p => p.trim());
        surname = commaParts[0];
        firstName = commaParts[1] || '';
      } else {
        const spaceParts = widgetName.split(' ');
        surname = spaceParts[spaceParts.length - 1];
        firstName = spaceParts[0];
      }
      
      if (clientLower.includes(surname.toLowerCase()) || 
          (firstName && clientLower.includes(firstName.toLowerCase()))) {
        return data;
      }
    }
    return null;
  };

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
          onAccountSettings={() => navigate("/account-settings")}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Clients Content - Scrollable */}
        <main className="flex-1 p-6 overflow-auto">
          {/* Add Profile + Include Inactive Row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Switch 
                checked={includeInactive} 
                onCheckedChange={setIncludeInactive}
              />
              <span className="text-sm text-muted-foreground">Include inactive clients</span>
            </div>
            <Button 
              className="bg-[hsl(180,70%,45%)] hover:bg-[hsl(180,70%,40%)] text-white"
              onClick={() => setChoiceDialogOpen(true)}
            >
              + Add Profile
            </Button>
          </div>

          {/* Recently Viewed Section */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[hsl(180,70%,45%)] font-medium">
                {searchQuery ? "SEARCH RESULTS" : "RECENTLY VIEWED"}
              </h2>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-[hsl(180,70%,45%)] text-[hsl(180,70%,45%)] hover:bg-[hsl(180,70%,45%)]/10"
                >
                  Reports
                </Button>
                <MultiSelect
                  options={profileFilterOptions}
                  selected={selectedProfileFilters}
                  onChange={setSelectedProfileFilters}
                  placeholder="Profile status"
                  className="w-48"
                />
                <MultiSelect
                  options={clientTypeOptions}
                  selected={selectedClientTypes}
                  onChange={setSelectedClientTypes}
                  placeholder="Client types"
                  className="w-48"
                />
              </div>
            </div>

            {/* Filter Tags Row */}
            {((selectedProfileFilters.length < profileFilterOptions.length && selectedProfileFilters.length > 0) || 
             (selectedClientTypes.length < clientTypeOptions.length && selectedClientTypes.length > 0)) && (
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="text-xs text-muted-foreground">Filtered by:</span>
                {selectedProfileFilters.length < profileFilterOptions.length && selectedProfileFilters.map(type => (
                  <Badge key={`profile-${type}`} variant="secondary" className="text-xs gap-1">
                    {profileFilterOptions.find(o => o.value === type)?.label}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setSelectedProfileFilters(prev => prev.filter(t => t !== type))}
                    />
                  </Badge>
                ))}
                {selectedClientTypes.length < clientTypeOptions.length && selectedClientTypes.map(type => (
                  <Badge key={`type-${type}`} variant="secondary" className="text-xs gap-1">
                    {clientTypeOptions.find(o => o.value === type)?.label}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setSelectedClientTypes(prev => prev.filter(t => t !== type))}
                    />
                  </Badge>
                ))}
                <button 
                  className="text-[hsl(180,70%,45%)] text-xs hover:underline ml-2"
                  onClick={() => {
                    clearDashboardFilter();
                    setSearchQuery("");
                    setIncludeInactive(false);
                  }}
                >
                  Reset Filters
                </button>
              </div>
            )}
            
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
            ) : displayClients.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Users className="w-12 h-12 mb-4 opacity-50" />
                <p className="text-lg font-medium">
                  {searchQuery ? "No clients found" : "No recently viewed clients"}
                </p>
                <p className="text-sm">
                  {searchQuery 
                    ? "Try adjusting your filters or search query"
                    : "Search for a client or click a profile to get started"}
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
                    {selectedRegion === "ZA" && (
                      <TableHead className="text-xs font-normal text-muted-foreground">Language</TableHead>
                    )}
                    <TableHead className="text-xs font-normal text-muted-foreground">Date Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayClients.map((client) => (
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
                      {selectedRegion === "ZA" && (
                        <TableCell className="text-sm">{client.language}</TableCell>
                      )}
                      <TableCell className="text-sm">{client.dateCreated}</TableCell>
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
              1 to {displayClients.length} of {displayClients.length}
            </span>
          </div>
        </main>
      </div>

      {/* Add Client Choice Dialog */}
      <AddClientChoiceDialog
        open={choiceDialogOpen}
        onOpenChange={setChoiceDialogOpen}
        onChoiceSelected={handleChoiceSelected}
      />

      {/* Add Client Dialog */}
      <AddClientDialog 
        open={addDialogOpen} 
        onOpenChange={setAddDialogOpen} 
        onClientAdded={refetch}
        onClientCreated={handleClientCreated}
      />

      {/* Financial Planning Wizard */}
      {newClientForWizard && (
        <FinancialPlanningWizard
          open={showWizard}
          onOpenChange={(open) => {
            setShowWizard(open);
            if (!open) setNewClientForWizard(null);
          }}
          clientId={newClientForWizard.id}
          clientName={newClientForWizard.name}
        />
      )}

      <GlobalAIChat currentPage="clients" />
    </div>
  );
};

export default Clients;
