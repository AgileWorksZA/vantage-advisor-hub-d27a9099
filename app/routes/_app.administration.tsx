import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, Users, Briefcase, Mail, CalendarIcon, ListTodo, LineChart, Building2
} from "lucide-react";
import commandCenterIcon from "@/assets/command-center-icon.png";
import vantageLogo from "@/assets/vantage-logo.png";
import { AppHeader } from "@/components/layout/AppHeader";
import { AdminLayout, adminSections } from "@/components/administration/AdminLayout";
import { GeneralListsSection } from "@/components/administration/general-lists/GeneralListsSection";
import { DataIntegrationsSection } from "@/components/administration/data-integrations/DataIntegrationsSection";
import { PlanningToolsSection } from "@/components/administration/planning-tools/PlanningToolsSection";
import { CampaignManagementSection } from "@/components/administration/campaign-management/CampaignManagementSection";
import { CommunicationSection } from "@/components/administration/communication/CommunicationSection";
import { DocumentsSection } from "@/components/administration/documents/DocumentsSection";
import { ProductsSection } from "@/components/administration/products/ProductsSection";
import { FundsSection } from "@/components/administration/funds/FundsSection";
import { TransactionsSection } from "@/components/administration/transactions/TransactionsSection";
import { NotesTasksSection } from "@/components/administration/notes-tasks/NotesTasksSection";
import { EventsSection } from "@/components/administration/events/EventsSection";
import { SystemSettingsSection } from "@/components/administration/system/SystemSettingsSection";
import GlobalAIChat from "@/components/ai-assistant/GlobalAIChat";

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

const Administration = () => {
  const navigate = useNavigate();
  const { section } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (!session?.user) {
        console.log("Auth handled by BFF");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (!session?.user) {
        console.log("Auth handled by BFF");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    console.log("Auth handled by BFF");
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
  const activeSection = section || "general-lists";

  const renderSectionContent = () => {
    switch (activeSection) {
      case "general-lists":
        return <GeneralListsSection />;
      case "data-integrations":
        return <DataIntegrationsSection />;
      case "planning-tools":
        return <PlanningToolsSection />;
      case "campaign-management":
        return <CampaignManagementSection />;
      case "communication":
        return <CommunicationSection />;
      case "documents":
        return <DocumentsSection />;
      case "products":
        return <ProductsSection />;
      case "funds":
        return <FundsSection />;
      case "transactions":
        return <TransactionsSection />;
      case "notes-tasks":
        return <NotesTasksSection />;
      case "events":
        return <EventsSection />;
      case "system":
        return <SystemSettingsSection />;
      default:
        return <GeneralListsSection />;
    }
  };

  return (
    <div className="h-screen bg-muted/30 flex overflow-hidden">
      {/* Sidebar - Fixed */}
      <aside className="w-16 bg-[hsl(180,25%,25%)] flex flex-col items-center py-4 gap-1 shrink-0">
        <Button 
          variant="ghost" 
          size="icon" 
          className="w-10 h-10 text-white/80 hover:bg-white/10 mb-4"
          onClick={() => navigate("/command-center")}
          title="Practice Overview"
        >
          <img src={commandCenterIcon} alt="Command Center" className="w-5 h-5" />
        </Button>
        {sidebarItems.map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className={`w-full flex flex-col items-center py-2 text-xs gap-1 ${
              item.path === "/practice"
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
        {/* Header - Sticky */}
        <AppHeader
          searchPlaceholder="Search administration..."
          userName={userName}
          userEmail={userEmail}
          onSignOut={handleSignOut}
          onAccountSettings={() => navigate("/account-settings")}
        />

        {/* Content - With Admin Layout */}
        <main className="flex-1 overflow-hidden">
          <AdminLayout>
            {renderSectionContent()}
          </AdminLayout>
        </main>
      </div>
      <GlobalAIChat currentPage="administration" />
    </div>
  );
};

export default Administration;
