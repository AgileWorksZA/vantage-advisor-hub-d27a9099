import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import ClientSummaryTab from "@/components/client-detail/ClientSummaryTab";
import ClientDetailsTab from "@/components/client-detail/ClientDetailsTab";
import ClientCRMTab from "@/components/client-detail/ClientCRMTab";
import ClientRelationshipsTab from "@/components/client-detail/ClientRelationshipsTab";
import ClientWorkflowsTab from "@/components/client-detail/ClientWorkflowsTab";
import ClientComplianceTab from "@/components/client-detail/ClientComplianceTab";
import Client360ViewTab from "@/components/client-detail/Client360ViewTab";
import ClientNotesTab from "@/components/client-detail/ClientNotesTab";
import ClientCommunicationTab from "@/components/client-detail/ClientCommunicationTab";
import ClientDocumentsTab from "@/components/client-detail/ClientDocumentsTab";
import ClientMeetingsTab from "@/components/client-detail/ClientMeetingsTab";
import ClientRecentActivityTab from "@/components/client-detail/ClientRecentActivityTab";
import { useClientDetail } from "@/hooks/useClientDetail";
import { useClientRelationships } from "@/hooks/useClientRelationships";
import { getDisplayName } from "@/types/client";
import GlobalAIChat from "@/components/ai-assistant/GlobalAIChat";

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

const ClientDetail = () => {
  const navigate = useNavigate();
  const { clientId } = useParams<{ clientId: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("summary");
  const { regionalData } = useRegion();
  const { setCurrentAdvisorInitials } = usePageContext();

  // Fetch client data from Supabase
  const { client, loading: clientLoading, error, updateClient, refetch } = useClientDetail(clientId);
  
  // Fetch relationships for the "Manage related entity" dropdown
  const { familyMembers, businesses } = useClientRelationships(clientId || "");
  
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
            />
            <TabsList className="w-full justify-start h-auto p-0 bg-transparent rounded-none gap-0 flex-wrap px-6 mt-1">
              {[
                { value: "summary", label: "Summary" },
                { value: "360-view", label: "360 View" },
                { value: "details", label: "Details" },
                { value: "crm", label: "CRM" },
                { value: "meetings", label: "Meetings" },
                { value: "relationships", label: "Relationships" },
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
            <TabsContent value="summary" className="mt-0">
              <ClientSummaryTab 
                client={client} 
                clientId={clientId!} 
                onShowMoreActivity={() => setActiveTab("recent-activity")}
              />
            </TabsContent>
            <TabsContent value="360-view" className="mt-0">
              <Client360ViewTab />
            </TabsContent>
            <TabsContent value="details" className="mt-0">
              <ClientDetailsTab client={client} onUpdate={updateClient} />
            </TabsContent>
            <TabsContent value="crm" className="mt-0">
              <ClientCRMTab client={client} onUpdate={updateClient} />
            </TabsContent>
            <TabsContent value="meetings" className="mt-0">
              <ClientMeetingsTab />
            </TabsContent>
            <TabsContent value="relationships" className="mt-0">
              <ClientRelationshipsTab />
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
