import { useState, useEffect } from "react";
import { CalendarDays, Users, CheckSquare, BarChart3, Sparkles, Bell, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import MobileTodayTab from "./MobileTodayTab";
import MobileClientsTab from "./MobileClientsTab";
import MobileTasksTab from "./MobileTasksTab";
import MobileInsightsTab from "./MobileInsightsTab";
import MobileAITab from "./MobileAITab";
import MobileSettingsMenu from "./MobileSettingsMenu";
import MobileVoiceMemo from "./MobileVoiceMemo";
import MobileNotificationBanner from "./MobileNotificationBanner";
import MobileAdvisorProfile from "./MobileAdvisorProfile";
import AdvisorAvatar from "./AdvisorAvatar";
import { MobileRegionProvider } from "@/contexts/MobileRegionProvider";
import { useRegion } from "@/contexts/RegionContext";

type MobileTab = "today" | "clients" | "tasks" | "insights" | "ai";

const tabs: { id: MobileTab; label: string; icon: typeof CalendarDays }[] = [
  { id: "today", label: "Today", icon: CalendarDays },
  { id: "clients", label: "Clients", icon: Users },
  { id: "tasks", label: "Workflows", icon: CheckSquare },
  { id: "insights", label: "Insights", icon: BarChart3 },
  { id: "ai", label: "AI", icon: Sparkles },
];

const MobileAppContent = () => {
  const [activeTab, setActiveTab] = useState<MobileTab>("today");
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const { regionalData, selectedAdvisors } = useRegion();
  const currentAdvisor = regionalData.advisors.find(a => a.initials === selectedAdvisors[0]) || regionalData.advisors[0];
  const [voiceMemoVisible, setVoiceMemoVisible] = useState(() => {
    const stored = localStorage.getItem("vantage-voice-memo-visible");
    return stored !== "false";
  });
  const [mobileNotifications, setMobileNotifications] = useState<Array<{id: string; type: string; title: string; description: string; isRead: boolean; date: string; link?: string}>>([]);

  const handleNotification = (n: { type: string; title: string; description: string; link?: string }) => {
    setMobileNotifications(prev => [{
      id: crypto.randomUUID(),
      ...n,
      isRead: false,
      date: new Date().toISOString().split("T")[0],
    }, ...prev]);
  };

  useEffect(() => {
    const handler = (e: Event) => {
      setVoiceMemoVisible((e as CustomEvent).detail.visible);
    };
    window.addEventListener("voice-memo-toggle", handler);
    return () => window.removeEventListener("voice-memo-toggle", handler);
  }, []);

  const unreadNotifCount = 3 + mobileNotifications.filter(n => !n.isRead).length;

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

  if (showProfile && currentAdvisor) {
    return (
      <div className="relative w-full h-full flex flex-col bg-background">
        <MobileAdvisorProfile advisor={currentAdvisor} onBack={() => setShowProfile(false)} />
      </div>
    );
  }

  if (showSettings) {
    return (
      <div className="relative w-full h-full flex flex-col bg-background">
        <MobileSettingsMenu onBack={() => setShowSettings(false)} />
        {voiceMemoVisible && <MobileVoiceMemo />}
        <MobileNotificationBanner />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 h-12 bg-background border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <button onClick={() => setShowProfile(true)} className="shrink-0">
            <AdvisorAvatar advisor={currentAdvisor} size="sm" />
          </button>
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
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 relative">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-destructive text-destructive-foreground text-[10px] rounded-full flex items-center justify-center">
              {unreadNotifCount}
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

      {/* Voice Memo FAB */}
      {voiceMemoVisible && <MobileVoiceMemo />}
      <MobileNotificationBanner />

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
