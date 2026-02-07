import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  PieChart,
  Briefcase,
  Settings,
  ArrowLeft,
  Heart,
} from "lucide-react";
import { TaxLossHarvestingNudge } from "@/components/command-center/TaxLossHarvestingNudge";
import { PortfolioDriftNudge } from "@/components/command-center/PortfolioDriftNudge";
import { ClientEngagementNudge } from "@/components/command-center/ClientEngagementNudge";
import { ClientComfortNudge } from "@/components/command-center/ClientComfortNudge";
import { CommissionNudge } from "@/components/command-center/CommissionNudge";
import { ComplianceNudge } from "@/components/command-center/ComplianceNudge";
import { ReviewRemindersNudge } from "@/components/command-center/ReviewRemindersNudge";
import { DocumentExpiryNudge } from "@/components/command-center/DocumentExpiryNudge";
import { AppHeader } from "@/components/layout/AppHeader";
import GlobalAIChat from "@/components/ai-assistant/GlobalAIChat";

const sidebarItems = [
  { icon: Users, label: "CRM", active: false },
  { icon: PieChart, label: "Portfolios", active: false },
  { icon: Briefcase, label: "Backoffice", active: false },
  { icon: Settings, label: "Settings", active: false },
];

const CommandCenter = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("all");
  const practiceHealthScore = 78;

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (!session?.user) {
        navigate("/auth");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
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

  const userName = user?.user_metadata?.full_name || "Adviser";
  const userEmail = user?.email || "adviser@vantage.co";

  return (
    <div className="h-screen bg-muted/30 flex overflow-hidden">
      {/* Sidebar - Fixed */}
      <aside className="w-16 bg-[hsl(222,76%,25%)] flex flex-col items-center py-4 gap-1 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10 text-white/80 hover:bg-white/10 mb-4"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        {sidebarItems.map((item) => (
          <button
            key={item.label}
            className={`w-full flex flex-col items-center py-2 text-xs gap-1 ${
              item.active
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
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar - Sticky */}
        <AppHeader
          searchPlaceholder="Search clients, accounts, nudges..."
          userName={userName}
          userEmail={userEmail}
          onSignOut={handleSignOut}
          onAccountSettings={() => navigate("/practice")}
        />

        {/* Main Workspace - Scrollable */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold">Practice Overview</h1>
              <p className="text-muted-foreground text-sm mt-1">
                AI-powered nudges to optimize your practice
              </p>
            </div>
            <div className="flex gap-2">
              {["all", "urgent", "important", "routine"].map((section) => (
                <Button
                  key={section}
                  variant={activeSection === section ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveSection(section)}
                  className="capitalize"
                >
                  {section}
                </Button>
              ))}
            </div>
          </div>

          {/* Urgency Labels */}
          <div className="space-y-8">
            {/* Urgent Section */}
            {(activeSection === "all" || activeSection === "urgent") && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-destructive" />
                  <h2 className="text-lg font-semibold text-destructive">
                    Urgent Actions
                  </h2>
                  <span className="text-sm text-muted-foreground">(3)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <TaxLossHarvestingNudge />
                  <ComplianceNudge />
                  <DocumentExpiryNudge />
                </div>
              </section>
            )}

            {/* Important Section */}
            {(activeSection === "all" || activeSection === "important") && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-[hsl(45,93%,47%)]" />
                  <h2 className="text-lg font-semibold text-[hsl(45,93%,47%)]">
                    Important
                  </h2>
                  <span className="text-sm text-muted-foreground">(3)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <PortfolioDriftNudge />
                  <CommissionNudge />
                  <ClientComfortNudge />
                </div>
              </section>
            )}

            {/* Routine Section */}
            {(activeSection === "all" || activeSection === "routine") && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-[hsl(210,70%,40%)]" />
                  <h2 className="text-lg font-semibold text-[hsl(210,70%,40%)]">
                    Routine
                  </h2>
                  <span className="text-sm text-muted-foreground">(2)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <ClientEngagementNudge />
                  <ReviewRemindersNudge />
                </div>
              </section>
            )}
          </div>
        </main>
      </div>
      <GlobalAIChat currentPage="command-center" />
    </div>
  );
};

export default CommandCenter;
