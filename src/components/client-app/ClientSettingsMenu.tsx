import { useState, useEffect } from "react";
import { ArrowLeft, Moon, Sun, Monitor, Smartphone, User, LogOut, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useAppMode } from "@/contexts/AppModeContext";
import { supabase } from "@/integrations/supabase/client";

interface ClientSettingsMenuProps {
  onBack: () => void;
  onChangeClient: () => void;
}

const ClientSettingsMenu = ({ onBack, onChangeClient }: ClientSettingsMenuProps) => {
  const { resolvedTheme, setTheme } = useTheme();
  const { mode, setMode } = useAppMode();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const isDark = mounted && resolvedTheme === "dark";

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setMode("web");
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <header className="flex items-center gap-3 px-4 h-12 border-b border-border shrink-0">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-semibold">Settings</span>
      </header>

      <div className="flex-1 overflow-y-auto">
        {/* Mode Switcher */}
        <div className="flex flex-col items-center py-4 border-b border-border">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">App Mode</span>
          <div className="flex bg-muted rounded-full p-0.5">
            <button
              onClick={() => setMode("web")}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all",
                mode === "web" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Monitor className="h-3 w-3" /> Web
            </button>
            <button
              onClick={() => setMode("adviser")}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all",
                mode === "adviser" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Smartphone className="h-3 w-3" /> Adviser
            </button>
            <button
              onClick={() => setMode("client")}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all",
                mode === "client" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <User className="h-3 w-3" /> Client
            </button>
          </div>
        </div>

        {/* Menu Items */}
        <div className="py-2">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-muted/50 active:bg-muted"
          >
            {isDark ? <Sun className="h-4 w-4 text-muted-foreground" /> : <Moon className="h-4 w-4 text-muted-foreground" />}
            <span className="flex-1 text-left">Dark Mode</span>
            <Switch checked={isDark} onCheckedChange={toggleTheme} className="pointer-events-none" />
          </button>
          <button
            onClick={onChangeClient}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-muted/50 active:bg-muted"
          >
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1 text-left">Change Client</span>
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

export default ClientSettingsMenu;
