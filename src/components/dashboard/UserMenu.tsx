import { useState, useEffect } from "react";
import { LogOut, Moon, Sun, Sparkles, Monitor, Smartphone, User } from "lucide-react";
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

const AI_CHAT_STORAGE_KEY = "vantage-ai-chat-enabled";

interface UserMenuProps {
  userName: string;
  userEmail?: string;
  onSignOut: () => void;
}

export function UserMenu({ userName, userEmail, onSignOut }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { mode, setMode } = useAppMode();
  const [mounted, setMounted] = useState(false);
  const [aiChatEnabled, setAiChatEnabled] = useState(() => {
    const stored = localStorage.getItem(AI_CHAT_STORAGE_KEY);
    return stored !== "false";
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const handleSignOut = () => {
    setOpen(false);
    onSignOut();
  };

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

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full p-0 hover:bg-transparent"
          title={userName}
        >
          <div className="h-9 w-9 rounded-full bg-purple-500 flex items-center justify-center text-white font-semibold text-base">
            {getInitial(userName)}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0 bg-popover border border-border shadow-lg" align="end">
        {/* User Info Header */}
        <div className="flex flex-col items-center py-4 border-b border-border">
          <div className="h-16 w-16 rounded-full bg-purple-500 flex items-center justify-center text-white font-semibold text-2xl mb-2">
            {getInitial(userName)}
          </div>
          <span className="font-medium text-sm">{userName}</span>
          {userEmail && (
            <span className="text-xs text-purple-500">{userEmail}</span>
          )}
          {/* Web / Adviser App / Client App Toggle */}
          <div className="flex mt-3 bg-muted rounded-full p-0.5">
            <button
              onClick={() => { setMode("web"); setOpen(false); }}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all",
                mode === "web"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Monitor className="h-3 w-3" />
              Web
            </button>
            <button
              onClick={() => { setMode("adviser"); setOpen(false); }}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all",
                mode === "adviser"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Smartphone className="h-3 w-3" />
              Adviser
            </button>
            <button
              onClick={() => { setMode("client"); setOpen(false); }}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all",
                mode === "client"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <User className="h-3 w-3" />
              Client
            </button>
          </div>
        </div>

        {/* Menu Items */}
        <div className="py-2">
          <button
            onClick={toggleTheme}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
              "hover:bg-muted/50"
            )}
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
            className={cn(
              "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
              "hover:bg-muted/50"
            )}
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
            className={cn(
              "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
              "hover:bg-muted/50"
            )}
          >
            <LogOut className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1 text-left">Sign Out</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
