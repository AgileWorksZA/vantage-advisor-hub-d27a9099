import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Search,
  Bell,
  Users,
  PieChart,
  Briefcase,
  Settings,
  ArrowLeft,
  TrendingUp,
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

const sidebarItems = [
  { icon: Users, label: "CRM", active: false },
  { icon: PieChart, label: "Portfolios", active: false },
  { icon: Briefcase, label: "Backoffice", active: false },
  { icon: Settings, label: "Settings", active: false },
];

const CommandCenter = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("all");
  const practiceHealthScore = 78;

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar */}
      <aside className="w-16 bg-[hsl(222,76%,25%)] flex flex-col items-center py-4 gap-1">
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
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="h-14 bg-background border-b border-border flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search clients, accounts, nudges..."
                className="pl-10 bg-muted/50 border-0"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Practice Health Score */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-[hsl(142,76%,36%)]" />
                <span className="text-sm font-medium">Practice Health</span>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={practiceHealthScore} className="w-24 h-2" />
                <span className="text-sm font-semibold text-[hsl(142,76%,36%)]">
                  {practiceHealthScore}%
                </span>
              </div>
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                12
              </span>
            </Button>
          </div>
        </header>

        {/* Main Workspace */}
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
    </div>
  );
};

export default CommandCenter;
