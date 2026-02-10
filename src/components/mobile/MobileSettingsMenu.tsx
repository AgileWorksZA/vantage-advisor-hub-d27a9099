import { useState, useEffect } from "react";
import { ArrowLeft, Settings, LogOut, Moon, Sun, Sparkles, Monitor, Smartphone, Globe, Users, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useAppMode } from "@/contexts/AppModeContext";
import { useRegion } from "@/contexts/RegionContext";
import { regions } from "@/components/dashboard/RegionSelector";
import { supabase } from "@/integrations/supabase/client";

const AI_CHAT_STORAGE_KEY = "vantage-ai-chat-enabled";

interface MobileSettingsMenuProps {
  onBack: () => void;
}

const MobileSettingsMenu = ({ onBack }: MobileSettingsMenuProps) => {
  const { resolvedTheme, setTheme } = useTheme();
  const { mode, setMode } = useAppMode();
  const { selectedRegion, setSelectedRegion, regionalData, selectedAdvisors, setSelectedAdvisors, isJurisdictionRestricted } = useRegion();

  const [mounted, setMounted] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [aiChatEnabled, setAiChatEnabled] = useState(() => {
    const stored = localStorage.getItem(AI_CHAT_STORAGE_KEY);
    return stored !== "false";
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || "");
        const { data: profile } = await supabase
          .from("profiles" as any)
          .select("display_name")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profile && (profile as any).display_name) {
          setUserName((profile as any).display_name);
        } else {
          setUserName(user.email?.split("@")[0] || "User");
        }
      }
    };
    fetchUser();
  }, []);

  const getInitial = (name: string) => name.charAt(0).toUpperCase();

  const isDark = mounted && resolvedTheme === "dark";

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const toggleAiChat = () => {
    const newValue = !aiChatEnabled;
    setAiChatEnabled(newValue);
    localStorage.setItem(AI_CHAT_STORAGE_KEY, String(newValue));
    window.dispatchEvent(
      new CustomEvent("ai-chat-toggle", { detail: { enabled: newValue } })
    );
  };

  const handleAccountSettings = () => {
    setMode("web");
    setTimeout(() => { window.location.href = "/account-settings"; }, 100);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setMode("web");
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 h-12 border-b border-border shrink-0">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-semibold">Settings</span>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* User Info */}
        <div className="flex flex-col items-center py-4 border-b border-border">
          <div className="h-16 w-16 rounded-full bg-purple-500 flex items-center justify-center text-white font-semibold text-2xl mb-2">
            {getInitial(userName)}
          </div>
          <span className="font-medium text-sm">{userName}</span>
          {userEmail && (
            <span className="text-xs text-purple-500">{userEmail}</span>
          )}
          {/* Web / Mobile Toggle */}
          <div className="flex mt-3 bg-muted rounded-full p-0.5">
            <button
              onClick={() => { setMode("web"); }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all",
                mode === "web"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Monitor className="h-3 w-3" />
              Web
            </button>
            <button
              onClick={() => { setMode("mobile"); }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all",
                mode === "mobile"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Smartphone className="h-3 w-3" />
              Mobile
            </button>
          </div>
        </div>

        {/* Jurisdiction Selector */}
        <div className="border-b border-border">
          <div className="flex items-center gap-2 px-4 pt-3 pb-1">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Jurisdiction</span>
            {isJurisdictionRestricted && (
              <span className="text-[10px] text-muted-foreground italic">(restricted)</span>
            )}
          </div>
          <div className="py-1">
            {regions.map((region) => (
              <button
                key={region.code}
                disabled={isJurisdictionRestricted}
                onClick={() => setSelectedRegion(region.code)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                  isJurisdictionRestricted ? "opacity-60 cursor-not-allowed" : "hover:bg-muted/50 active:bg-muted",
                  selectedRegion === region.code && "bg-muted/50"
                )}
              >
                <img
                  src={`https://flagcdn.com/w40/${region.flagCode}.png`}
                  srcSet={`https://flagcdn.com/w80/${region.flagCode}.png 2x`}
                  alt={`${region.name} flag`}
                  className="object-contain"
                  style={{ height: 18, width: 'auto' }}
                />
                <span className="flex-1 text-left">{region.name}</span>
                {selectedRegion === region.code && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Advisor Filter */}
        <div className="border-b border-border">
          <div className="flex items-center gap-2 px-4 pt-3 pb-1">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Advisors</span>
          </div>
          <div className="py-1">
            {/* Toggle All */}
            <button
              onClick={() => {
                const allInitials = regionalData.advisors.map(a => a.initials);
                const allSelected = allInitials.every(i => selectedAdvisors.includes(i));
                setSelectedAdvisors(allSelected ? [] : allInitials);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-muted/50 active:bg-muted"
            >
              <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                <Users className="h-3 w-3 text-muted-foreground" />
              </div>
              <span className="flex-1 text-left font-medium">
                {regionalData.advisors.every(a => selectedAdvisors.includes(a.initials)) ? "Deselect All" : "Select All"}
              </span>
              {regionalData.advisors.every(a => selectedAdvisors.includes(a.initials)) && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </button>
            {regionalData.advisors.map((advisor) => {
              const isSelected = selectedAdvisors.includes(advisor.initials);
              return (
                <button
                  key={advisor.initials}
                  onClick={() => {
                    setSelectedAdvisors(
                      isSelected
                        ? selectedAdvisors.filter(i => i !== advisor.initials)
                        : [...selectedAdvisors, advisor.initials]
                    );
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-muted/50 active:bg-muted"
                >
                  <div className="h-6 w-6 rounded-full bg-[hsl(var(--sidebar-primary))] flex items-center justify-center text-[10px] font-bold text-primary-foreground">
                    {advisor.initials}
                  </div>
                  <span className="flex-1 text-left">{advisor.name}</span>
                  {isSelected && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Menu Items */}
        <div className="py-2">
          <button
            onClick={handleAccountSettings}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-muted/50 active:bg-muted"
          >
            <Settings className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1 text-left">Account Settings</span>
          </button>
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-muted/50 active:bg-muted"
          >
            {mounted ? (
              isDark ? (
                <Sun className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Moon className="h-4 w-4 text-muted-foreground" />
              )
            ) : (
              <Moon className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="flex-1 text-left">Dark Mode</span>
            <Switch
              checked={isDark}
              onCheckedChange={toggleTheme}
              className="pointer-events-none"
            />
          </button>
          <button
            onClick={toggleAiChat}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-muted/50 active:bg-muted"
          >
            <Sparkles className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1 text-left">AI Assistant</span>
            <Switch
              checked={aiChatEnabled}
              onCheckedChange={toggleAiChat}
              className="pointer-events-none"
            />
          </button>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-muted/50 active:bg-muted"
          >
            <LogOut className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1 text-left">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileSettingsMenu;
