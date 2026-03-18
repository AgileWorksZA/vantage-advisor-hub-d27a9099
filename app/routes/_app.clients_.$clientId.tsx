import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { useRegion } from "@/contexts/RegionContext";
import { usePageContext } from "@/contexts/PageContext";
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
  ArrowLeft,
} from "lucide-react";
import commandCenterIcon from "@/assets/command-center-icon.png";
import vantageLogo from "@/assets/vantage-logo.png";
import { AppHeader } from "@/components/layout/AppHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ClientRibbon from "@/components/client-detail/ClientRibbon";
import ClientDashboardTab from "@/components/client-detail/ClientDashboardTab";
import ClientSummaryTab from "@/components/client-detail/ClientSummaryTab";
import ClientDetailsTab from "@/components/client-detail/ClientDetailsTab";

import ClientRelationshipsTab from "@/components/client-detail/ClientRelationshipsTab";
import ClientWorkflowsTab from "@/components/client-detail/ClientWorkflowsTab";
import ClientComplianceTab from "@/components/client-detail/ClientComplianceTab";
import Client360ViewTab from "@/components/client-detail/Client360ViewTab";
import ClientNotesTab from "@/components/client-detail/ClientNotesTab";
import ClientCommunicationTab from "@/components/client-detail/ClientCommunicationTab";
import ClientDocumentsTab from "@/components/client-detail/ClientDocumentsTab";
import ClientMeetingsTab from "@/components/client-detail/ClientMeetingsTab";

import ClientRecentActivityTab from "@/components/client-detail/ClientRecentActivityTab";
import ClientPortfolioTab from "@/components/client-detail/ClientPortfolioTab";
import { useClientDetail } from "@/hooks/useClientDetail";
import { useClientRelationships } from "@/hooks/useClientRelationships";
import { getDisplayName } from "@/types/client";
import GlobalAIChat from "@/components/ai-assistant/GlobalAIChat";
import { useRecentlyViewedClients } from "@/hooks/useRecentlyViewedClients";
import { generateClient360Data } from "@/data/regional360ViewData";
import { getOpportunityPriority } from "@/lib/opportunity-priority";
import { buildGapOpportunities } from "@/components/client-detail/next-best-action/OpportunitiesTab";

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

const ClientDetail = () => {
  const navigate = useNavigate();
  const { clientId } = useParams<{ clientId: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const { regionalData, selectedAdvisors } = useRegion();
  const { setCurrentAdvisorInitials } = usePageContext();

  // Fetch client data from Supabase
  const { client, loading: clientLoading, error, updateClient, refetch } = useClientDetail(clientId);
  const { recordView } = useRecentlyViewedClients();
  
  // Fetch relationships for the "Manage related entity" dropdown
  const { familyMembers, businesses } = useClientRelationships(clientId || "");

  // Record client view when profile is loaded
  useEffect(() => {
    if (client && clientId) {
      recordView(clientId);
    }
  }, [client, clientId, recordView]);
  
  // Combine family members and businesses that have a related_client_id for quick navigation
  const relatedEntities = [
    ...familyMembers.filter(f => f.relatedClientId).map(f => ({
      id: f.relatedClientId!,
      name: f.name,
      type: f.familyType,
    })),
    ...businesses.filter(b => b.relatedClientId).map(b => ({
      id: b.relatedClientId!,
      name: b.name,
      type: b.type,
    })),
  ];
  
  const clientName = client ? getDisplayName(client) : "Loading...";

  // Compute status dot color based on opportunity urgency
  const statusDotColor = useMemo(() => {
    if (!client || !clientId) return "green" as const;
    const clientData = generateClient360Data(clientId, client.nationality, client.country_of_issue);
    // Build product list matching the format expected by buildGapOpportunities
    const products = [
      ...clientData.onPlatformProducts.map(p => ({ category: "Investment", currentValue: p.amountValue, productName: p.product } as any)),
      ...clientData.externalProducts.map(p => ({ category: "External Investment", currentValue: p.amountValue, productName: p.product } as any)),
      ...clientData.platformCashAccounts.map(p => ({ category: "Cash", currentValue: p.amountValue, productName: p.name } as any)),
      ...clientData.riskProducts.map(p => ({ category: "Risk/Insurance", currentValue: 0, productName: p.holdingName } as any)),
    ];
    const gaps = buildGapOpportunities(products, false, clientId);
    const types = gaps.map(g => g.type);
    if (types.some(t => getOpportunityPriority(t) === "urgent")) return "red" as const;
    if (types.some(t => getOpportunityPriority(t) === "important")) return "orange" as const;
    return "green" as const;
  }, [client, clientId]);

  // Check if client's advisor is in the current selection
  const clientAdvisorInitials = client?.advisor
    ? regionalData.advisors.find((a) => a.name === client.advisor)?.initials
    : null;

  const isAdvisorSelected = clientAdvisorInitials
    ? selectedAdvisors.includes(clientAdvisorInitials)
    : true; // If no advisor assigned, allow access

  // Set the page context with the client's advisor initials
  useEffect(() => {
    if (client?.advisor) {
      const advisorEntry = regionalData.advisors.find(
        (a) => a.name === client.advisor
      );
      setCurrentAdvisorInitials(advisorEntry?.initials ?? null);
    } else {
      setCurrentAdvisorInitials(null);
    }
    return () => setCurrentAdvisorInitials(null);
  }, [client?.advisor, regionalData.advisors, setCurrentAdvisorInitials]);

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

  // Access restriction check - show message if advisor not selected
  if (!isAdvisorSelected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md px-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Access Restricted</h2>
            <p className="text-muted-foreground">
              This client is assigned to <span className="font-medium text-foreground">{client.advisor}</span>, who is not currently selected in your advisor filter.
            </p>
            <p className="text-sm text-muted-foreground">
              To view this client, add the advisor to your selection or navigate to a different client.
            </p>
          </div>
          <Button onClick={() => navigate("/clients")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Clients
          </Button>
        </div>
      </div>
    );
  }

  const userName = user?.user_metadata?.full_name || "Adviser";
  const userEmail = user?.email || "adviser@vantage.co";

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <div className="h-screen bg-muted/30 flex overflow-hidden">
      {/* Sidebar */}
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
        {/* Header */}
        <AppHeader
          searchPlaceholder="Search..."
          userName={userName}
          userEmail={userEmail}
          onSignOut={handleSignOut}
          onAccountSettings={() => navigate("/account-settings")}
        />

        {/* Client Detail Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          {/* Sticky ribbon + tabs header */}
          <div className="shrink-0 bg-background border-b border-border">
            <ClientRibbon
              client={client}
              clientName={clientName}
              relatedEntities={relatedEntities}
              onTabChange={setActiveTab}
              statusDotColor={statusDotColor}
            />
            <TabsList className="w-full justify-start h-auto p-0 bg-transparent rounded-none gap-0 flex-wrap px-6 mt-1">
              {[
                { value: "dashboard", label: "Dashboard" },
                { value: "summary", label: "Opportunities" },
                { value: "360-view", label: "Products" },
                { value: "portfolio", label: "Portfolio" },
                
                { value: "meetings", label: "Meetings" },
                
                
                { value: "workflows", label: "Workflows" },
                { value: "compliance", label: "Compliance" },
                { value: "notes", label: "Notes" },
                { value: "communication", label: "Communication" },
                { value: "documents", label: "Documents" },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-[hsl(180,70%,45%)] data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2.5 text-sm"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Scrollable tab content */}
          <main className="flex-1 p-6 overflow-auto">
            <TabsContent value="dashboard" className="mt-0">
              <ClientDashboardTab client={client} clientId={clientId!} onTabChange={setActiveTab} userId={user?.id} />
            </TabsContent>
            <TabsContent value="summary" className="mt-0">
              <ClientSummaryTab
                client={client} 
                clientId={clientId!} 
                onShowMoreActivity={() => setActiveTab("recent-activity")}
                onTabChange={setActiveTab}
              />
            </TabsContent>
            <TabsContent value="360-view" className="mt-0">
              <Client360ViewTab />
            </TabsContent>
            <TabsContent value="portfolio" className="mt-0">
              <ClientPortfolioTab clientId={clientId!} nationality={client.nationality} countryOfIssue={client.country_of_issue} />
            </TabsContent>
            <TabsContent value="details" className="mt-0">
              <ClientDetailsTab client={client} onUpdate={updateClient} />
            </TabsContent>
            <TabsContent value="meetings" className="mt-0">
              <ClientMeetingsTab />
            </TabsContent>
            <TabsContent value="relationships" className="mt-0">
              <ClientRelationshipsTab householdGroup={client?.household_group} client={client} onTabChange={setActiveTab} />
            </TabsContent>
            <TabsContent value="workflows" className="mt-0">
              <ClientWorkflowsTab />
            </TabsContent>
            <TabsContent value="compliance" className="mt-0">
              <ClientComplianceTab />
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
            <TabsContent value="recent-activity" className="mt-0">
              <ClientRecentActivityTab clientName={clientName} />
            </TabsContent>
          </main>
        </Tabs>
      </div>
      <GlobalAIChat currentPage="clients" />
    </div>
  );
};

export default ClientDetail;
