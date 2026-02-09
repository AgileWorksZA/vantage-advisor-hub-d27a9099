import { useState, useEffect } from "react";
import { Settings, LogOut, Moon, Sun, Sparkles, Monitor, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useAppMode } from "@/contexts/AppModeContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const AI_CHAT_STORAGE_KEY = "vantage-ai-chat-enabled";

const MobileSettingsMenu = () => {
  const [open, setOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const { mode, setMode } = useAppMode();
  const navigate = useNavigate();
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
        // Try to get display name from profiles table
        const { data: profile } = await supabase
          .from("profiles" as any)
          .select("display_name")
          .eq("user_id", user.id)
          .maybeSingle();
        
        if (profile && (profile as any).display_name) {
          setUserName((profile as any).display_name);
        } else {
          // Fallback to email prefix
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
    setOpen(false);
    setMode("web");
    setTimeout(() => navigate("/account-settings"), 100);
  };

  const handleSignOut = async () => {
    setOpen(false);
    await supabase.auth.signOut();
    setMode("web");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Settings className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0 bg-popover border border-border shadow-lg" align="end">
        {/* User Info Header */}
        <div className="flex flex-col items-center py-4 border-b border-border">
          <div className="h-14 w-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-xl mb-2">
            {getInitial(userName)}
          </div>
          <span className="font-medium text-sm">{userName}</span>
          {userEmail && (
            <span className="text-xs text-primary">{userEmail}</span>
          )}
          {/* Web / Mobile Toggle */}
          <div className="flex mt-3 bg-muted rounded-full p-0.5">
            <button
              onClick={() => { setMode("web"); setOpen(false); }}
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
              onClick={() => { setMode("mobile"); setOpen(false); }}
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

        {/* Menu Items */}
        <div className="py-2">
          <button
            onClick={handleAccountSettings}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-muted/50"
          >
            <Settings className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1 text-left">Account Settings</span>
          </button>
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-muted/50"
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
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-muted/50"
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
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-muted/50"
          >
            <LogOut className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1 text-left">Sign Out</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default MobileSettingsMenu;
