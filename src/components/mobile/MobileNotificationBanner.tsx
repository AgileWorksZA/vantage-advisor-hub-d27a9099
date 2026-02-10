import { useState, useEffect, useCallback } from "react";
import { CheckCircle2, AlertTriangle, XCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MobileNotification {
  id: string;
  type: "success" | "warning" | "error";
  title: string;
  description?: string;
}

const iconMap = {
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
};

const styleMap = {
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  error: "border-destructive/30 bg-destructive/10 text-destructive",
};

const AUTO_DISMISS_MS = 4000;
const MAX_VISIBLE = 3;

export default function MobileNotificationBanner() {
  const [notifications, setNotifications] = useState<MobileNotification[]>([]);

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<Omit<MobileNotification, "id">>).detail;
      const id = crypto.randomUUID();
      setNotifications((prev) => [{ ...detail, id }, ...prev].slice(0, MAX_VISIBLE));

      setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    };
    window.addEventListener("mobile-notification", handler);
    return () => window.removeEventListener("mobile-notification", handler);
  }, [dismiss]);

  if (notifications.length === 0) return null;

  return (
    <div className="absolute bottom-16 left-3 right-3 z-30 flex flex-col gap-1.5 pointer-events-none">
      {notifications.map((n) => {
        const Icon = iconMap[n.type];
        return (
          <div
            key={n.id}
            className={cn(
              "pointer-events-auto flex items-start gap-2 p-2.5 rounded-lg border shadow-sm backdrop-blur-sm animate-in slide-in-from-bottom-2 duration-200",
              styleMap[n.type]
            )}
          >
            <Icon className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold leading-tight truncate">{n.title}</p>
              {n.description && (
                <p className="text-[11px] opacity-80 leading-tight mt-0.5 truncate">{n.description}</p>
              )}
            </div>
            <button onClick={() => dismiss(n.id)} className="shrink-0 p-0.5 rounded hover:bg-foreground/10">
              <X className="h-3 w-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

/** Helper to dispatch a mobile notification from anywhere */
export function showMobileNotification(type: MobileNotification["type"], title: string, description?: string) {
  window.dispatchEvent(
    new CustomEvent("mobile-notification", { detail: { type, title, description } })
  );
}
