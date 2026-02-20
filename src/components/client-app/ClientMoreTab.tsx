import { useState, useEffect } from "react";
import { Moon, Sun, Monitor, Smartphone, User as UserIcon, LogOut, Phone, Mail, ArrowLeftRight } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useAppMode } from "@/contexts/AppModeContext";

interface ClientMoreTabProps {
  clientName: string;
  clientEmail: string | null;
  onChangeClient: () => void;
}

const ClientMoreTab = ({ clientName, clientEmail, onChangeClient }: ClientMoreTabProps) => {
  const { resolvedTheme, setTheme } = useTheme();
  const { setMode } = useAppMode();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const isDark = mounted && resolvedTheme === "dark";
  const toggleTheme = () => setTheme(resolvedTheme === "dark" ? "light" : "dark");

  return (
    <div className="px-4 py-4 space-y-4">
      <h2 className="text-lg font-bold text-foreground">More</h2>

      {/* Client Profile */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
        <div className="h-12 w-12 rounded-full bg-[hsl(220,60%,50%)] flex items-center justify-center text-white font-bold text-lg shrink-0">
          {clientName.charAt(0)}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">{clientName}</p>
          {clientEmail && <p className="text-xs text-muted-foreground truncate">{clientEmail}</p>}
        </div>
      </div>

      {/* Your Adviser */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-2">Your Adviser</h3>
        <div className="p-3 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-full bg-[hsl(180,25%,25%)] flex items-center justify-center text-white text-xs font-bold shrink-0">
              A
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Your Primary Adviser</p>
              <p className="text-[10px] text-muted-foreground">Vantage Wealth Management</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-foreground">Call</span>
            </button>
            <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-foreground">Email</span>
            </button>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="space-y-1">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-colors hover:bg-muted/50"
        >
          {isDark ? <Sun className="h-4 w-4 text-muted-foreground" /> : <Moon className="h-4 w-4 text-muted-foreground" />}
          <span className="flex-1 text-left text-foreground">Dark Mode</span>
          <Switch checked={isDark} onCheckedChange={toggleTheme} className="pointer-events-none" />
        </button>
        <button
          onClick={onChangeClient}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-colors hover:bg-muted/50"
        >
          <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
          <span className="flex-1 text-left text-foreground">Switch Client</span>
        </button>
        <button
          onClick={() => setMode("web")}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-colors hover:bg-muted/50"
        >
          <Monitor className="h-4 w-4 text-muted-foreground" />
          <span className="flex-1 text-left text-foreground">Switch to Web</span>
        </button>
        <button
          onClick={() => setMode("adviser")}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-colors hover:bg-muted/50"
        >
          <Smartphone className="h-4 w-4 text-muted-foreground" />
          <span className="flex-1 text-left text-foreground">Switch to Adviser App</span>
        </button>
        <button
          onClick={() => setMode("web")}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-colors hover:bg-muted/50"
        >
          <LogOut className="h-4 w-4 text-muted-foreground" />
          <span className="flex-1 text-left text-foreground">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default ClientMoreTab;
