import { useState } from "react";
import { CalendarDays, Users, CheckSquare, BarChart3, Sparkles, Bell, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import MobileTodayTab from "./MobileTodayTab";
import MobileClientsTab from "./MobileClientsTab";
import MobileTasksTab from "./MobileTasksTab";
import MobileInsightsTab from "./MobileInsightsTab";
import MobileAITab from "./MobileAITab";
import MobileSettingsMenu from "./MobileSettingsMenu";
import { MobileRegionProvider } from "@/contexts/MobileRegionProvider";

type MobileTab = "today" | "clients" | "tasks" | "insights" | "ai";

const tabs: { id: MobileTab; label: string; icon: typeof CalendarDays }[] = [
  { id: "today", label: "Today", icon: CalendarDays },
  { id: "clients", label: "Clients", icon: Users },
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  { id: "insights", label: "Insights", icon: BarChart3 },
  { id: "ai", label: "AI", icon: Sparkles },
];

const MobileAppContent = () => {
  const [activeTab, setActiveTab] = useState<MobileTab>("today");
  const [showSettings, setShowSettings] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case "today":
        return <MobileTodayTab />;
      case "clients":
        return <MobileClientsTab />;
      case "tasks":
        return <MobileTasksTab />;
      case "insights":
        return <MobileInsightsTab />;
      case "ai":
        return <MobileAITab />;
    }
  };

  if (showSettings) {
    return (
      <div className="relative w-full h-full flex flex-col bg-background">
        <MobileSettingsMenu onBack={() => setShowSettings(false)} />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 h-12 bg-background border-b border-border shrink-0">
        <div className="flex items-baseline gap-0">
          <span className="text-lg font-extrabold tracking-tight text-foreground">
            Advisor
          </span>
          <span
            className="text-lg font-extrabold tracking-tight"
            style={{
              background: "linear-gradient(135deg, hsl(180, 80%, 55%) 0%, hsl(18, 86%, 56%) 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            First
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 relative">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-destructive text-destructive-foreground text-[10px] rounded-full flex items-center justify-center">
              3
            </span>
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowSettings(true)}>
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        {renderContent()}
      </main>

      {/* Bottom Tab Bar */}
      <nav className="sticky bottom-0 z-10 flex items-center justify-around h-14 bg-background border-t border-border shrink-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors",
                isActive
                  ? "text-[hsl(180,70%,45%)]"
                  : "text-muted-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5]")} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

const MobileApp = () => (
  <MobileRegionProvider>
    <MobileAppContent />
  </MobileRegionProvider>
);

export default MobileApp;
