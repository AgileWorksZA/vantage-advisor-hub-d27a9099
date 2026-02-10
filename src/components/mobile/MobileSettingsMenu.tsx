import { useState, useEffect } from "react";
import { ArrowLeft, Settings, LogOut, Moon, Sun, Sparkles, Monitor, Smartphone, Globe, Users, Mic } from "lucide-react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useAppMode } from "@/contexts/AppModeContext";
import { useRegion } from "@/contexts/RegionContext";
import { regions } from "@/components/dashboard/RegionSelector";
import { supabase } from "@/integrations/supabase/client";

const AI_CHAT_STORAGE_KEY = "vantage-ai-chat-enabled";
const VOICE_MEMO_STORAGE_KEY = "vantage-voice-memo-visible";

interface MobileSettingsMenuProps {
  onBack: () => void;
}

const MobileSettingsMenu = ({ onBack }: MobileSettingsMenuProps) => {
  const { selectedRegion, setSelectedRegion, regionalData, selectedAdvisors, setSelectedAdvisors, isJurisdictionRestricted } = useRegion();
  const { resolvedTheme, setTheme } = useTheme();
  const { mode, setMode } = useAppMode();

  const [mounted, setMounted] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [aiChatEnabled, setAiChatEnabled] = useState(() => {
    const stored = localStorage.getItem(AI_CHAT_STORAGE_KEY);
    return stored !== "false";
  });
  const [voiceMemoVisible, setVoiceMemoVisible] = useState(() => {
    const stored = localStorage.getItem(VOICE_MEMO_STORAGE_KEY);
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

  const toggleVoiceMemo = () => {
    const newValue = !voiceMemoVisible;
    setVoiceMemoVisible(newValue);
    localStorage.setItem(VOICE_MEMO_STORAGE_KEY, String(newValue));
    window.dispatchEvent(
      new CustomEvent("voice-memo-toggle", { detail: { visible: newValue } })
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
        <div className="py-3 px-4 border-b border-border space-y-1.5">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Jurisdiction</span>
            {isJurisdictionRestricted && (
              <span className="text-[10px] text-muted-foreground italic ml-auto">restricted</span>
            )}
          </div>
          <Select value={selectedRegion} onValueChange={setSelectedRegion} disabled={isJurisdictionRestricted}>
            <SelectTrigger className="w-full h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-[9999] bg-popover">
              {regions.map((region) => (
                <SelectItem key={region.code} value={region.code}>
                  <span className="flex items-center gap-2">
                    <img
                      src={`https://flagcdn.com/w40/${region.flagCode}.png`}
                      alt={`${region.name} flag`}
                      className="object-contain"
                      style={{ height: 14, width: "auto" }}
                    />
                    {region.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Advisor Filter */}
        <div className="py-3 px-4 border-b border-border space-y-1.5">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Advisor</span>
          </div>
          <Select value={selectedAdvisors[0] || ""} onValueChange={(val) => setSelectedAdvisors([val])}>
            <SelectTrigger className="w-full h-9 text-sm">
              <SelectValue placeholder="Select Advisor" />
            </SelectTrigger>
            <SelectContent className="z-[9999] bg-popover">
              {regionalData.advisors.map((advisor) => (
                <SelectItem key={advisor.initials} value={advisor.initials}>
                  <span className="flex items-center gap-2">
                    <span className="h-5 w-5 rounded-full bg-[hsl(180,25%,25%)] flex items-center justify-center text-[8px] font-bold text-white shrink-0">
                      {advisor.initials}
                    </span>
                    {advisor.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
            onClick={toggleVoiceMemo}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-muted/50 active:bg-muted"
          >
            <Mic className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1 text-left">Voice Memo Button</span>
            <Switch
              checked={voiceMemoVisible}
              onCheckedChange={toggleVoiceMemo}
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
