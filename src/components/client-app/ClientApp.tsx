import { useState, useMemo } from "react";
import { getRegionalData } from "@/data/regionalData";
import { Home, PieChart, MessageSquare, FileText, MoreHorizontal, Bell, Mic } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import ClientPickerDialog from "./ClientPickerDialog";
import ClientHomeTab from "./ClientHomeTab";
import ClientPortfolioTab from "./ClientPortfolioTab";
import ClientMessagesTab from "./ClientMessagesTab";
import ClientDocumentsTab from "./ClientDocumentsTab";
import ClientMoreTab from "./ClientMoreTab";

import ClientVoiceChat from "./ClientVoiceChat";

type ClientTab = "home" | "portfolio" | "messages" | "documents" | "more";

const tabs: { id: ClientTab; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "portfolio", label: "Portfolio", icon: PieChart },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "more", label: "More", icon: MoreHorizontal },
];

const STORAGE_KEY = "vantage-client-app-selected-client";

interface SelectedClient {
  id: string;
  first_name: string;
  surname: string;
  email: string | null;
}

const ClientApp = () => {
  const [activeTab, setActiveTab] = useState<ClientTab>("home");
  const [selectedClient, setSelectedClient] = useState<SelectedClient | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [showPicker, setShowPicker] = useState(!selectedClient);
  
  const [showVoiceChat, setShowVoiceChat] = useState(false);

  const handleSelectClient = (client: SelectedClient) => {
    setSelectedClient(client);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(client));
    setShowPicker(false);
  };

  const handleChangeClient = () => {
    setShowPicker(true);
  };

  const handleMessageAdviser = (draft: string) => {
    setShowVoiceChat(false);
    setActiveTab("messages");
    // Draft message could be passed via state/context in future
  };

  const clientName = selectedClient ? `${selectedClient.first_name} ${selectedClient.surname}` : "";
  const adviserName = useMemo(() => {
    const region = localStorage.getItem("vantage-selected-region") || "ZA";
    return getRegionalData(region).advisors[0].name;
  }, []);

  if (showPicker) {
    return (
      <div className="relative w-full h-full bg-background">
        <ClientPickerDialog onSelect={handleSelectClient} />
      </div>
    );
  }


  const renderContent = () => {
    if (!selectedClient) return null;
    switch (activeTab) {
      case "home":
        return <ClientHomeTab clientId={selectedClient.id} clientName={clientName} nationality={null} />;
      case "portfolio":
        return <ClientPortfolioTab clientId={selectedClient.id} nationality={null} />;
      case "messages":
        return <ClientMessagesTab clientName={clientName} advisorName={adviserName} />;
      case "documents":
        return <ClientDocumentsTab clientName={clientName} />;
      case "more":
        return <ClientMoreTab clientName={clientName} clientEmail={selectedClient.email} onChangeClient={handleChangeClient} />;
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 h-12 bg-background border-b border-border shrink-0">
        <div className="flex items-baseline gap-0">
          <span className="text-lg font-extrabold tracking-tight text-foreground">Client</span>
          <span
            className="text-lg font-extrabold tracking-tight"
            style={{
              background: "linear-gradient(135deg, hsl(220, 80%, 55%) 0%, hsl(280, 70%, 55%) 100%)",
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
              2
            </span>
          </Button>
          <button onClick={handleChangeClient} className="shrink-0">
            <div className="h-8 w-8 rounded-full bg-[hsl(220,60%,50%)] flex items-center justify-center text-white text-xs font-bold">
              {selectedClient?.first_name.charAt(0)}{selectedClient?.surname.charAt(0)}
            </div>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        {renderContent()}
      </main>

      {/* Voice Chat FAB */}
      <button
        onClick={() => setShowVoiceChat(true)}
        className="absolute bottom-[4.5rem] right-4 z-20 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center active:scale-95 transition-transform"
        aria-label="Talk to adviser"
      >
        <Mic className="h-5 w-5" />
      </button>

      {/* Voice Chat Overlay */}
      {showVoiceChat && (
        <ClientVoiceChat
          onClose={() => setShowVoiceChat(false)}
          onMessageAdviser={handleMessageAdviser}
        />
      )}

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
                isActive ? "text-[hsl(220,60%,50%)]" : "text-muted-foreground"
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

export default ClientApp;
