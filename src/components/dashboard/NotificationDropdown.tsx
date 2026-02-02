import { useState } from "react";
import { Bell, X, CheckSquare, MessageSquare, CreditCard, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: "task" | "communication" | "transaction" | "general";
  title: string;
  description: string;
  date: string;
  isRead: boolean;
  link?: string;
}

const initialNotifications: Notification[] = [
  {
    id: "1",
    type: "task",
    title: "Task",
    description: "This is just a test enjoy!",
    date: "2025-07-08",
    isRead: false,
  },
  {
    id: "2",
    type: "general",
    title: "Reminder",
    description: "This is just a test enjoy!",
    date: "2025-07-08",
    isRead: false,
  },
  {
    id: "3",
    type: "transaction",
    title: "Transaction",
    description: "This is just a test enjoy!",
    date: "2025-07-08",
    isRead: false,
  },
  {
    id: "4",
    type: "communication",
    title: "Communication",
    description: "This is just a test enjoy!",
    date: "2025-07-08",
    isRead: false,
  },
  {
    id: "5",
    type: "task",
    title: "Task Onboarding Task - ONBOARD - 94911",
    description: "The task has been completed.",
    date: "2025-08-07",
    isRead: true,
  },
  {
    id: "6",
    type: "task",
    title: "Task Onboarding Task - ONBOARD - 94911",
    description: "The task has been completed.",
    date: "2025-08-08",
    isRead: true,
  },
  {
    id: "7",
    type: "task",
    title: "Annual Review",
    description: "The task has been completed.",
    date: "2025-08-13",
    isRead: true,
  },
  {
    id: "8",
    type: "task",
    title: "Portfolio Review",
    description: "The task has been completed.",
    date: "2025-08-13",
    isRead: true,
  },
  {
    id: "9",
    type: "task",
    title: "Task ONBOARD - 96724",
    description: "Client onboarding pending review.",
    date: "2025-09-11",
    isRead: false,
  },
];

const getNotificationIcon = (type: Notification["type"]) => {
  switch (type) {
    case "task":
      return <CheckSquare className="w-4 h-4" />;
    case "communication":
      return <MessageSquare className="w-4 h-4" />;
    case "transaction":
      return <CreditCard className="w-4 h-4" />;
    default:
      return <UserCircle className="w-4 h-4" />;
  }
};

const getNotificationColor = (type: Notification["type"], isRead: boolean) => {
  if (isRead) {
    return "bg-muted/50 text-muted-foreground";
  }
  switch (type) {
    case "task":
      return "bg-[hsl(180,70%,45%)]/10 text-[hsl(180,70%,35%)]";
    case "communication":
      return "bg-purple-100 text-purple-600";
    case "transaction":
      return "bg-blue-100 text-blue-600";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const groupByDate = (notifications: Notification[]) => {
  const groups: { [key: string]: Notification[] } = {};
  notifications.forEach((n) => {
    if (!groups[n.date]) {
      groups[n.date] = [];
    }
    groups[n.date].push(n);
  });
  return Object.entries(groups).sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime());
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-ZA", { 
    day: "2-digit", 
    month: "2-digit", 
    year: "numeric" 
  }).replace(/\//g, "-");
};

export const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const groupedNotifications = groupByDate(notifications);

  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const handleNotificationClick = (notification: Notification) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
    );
    // Could navigate to relevant page here
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-full hover:bg-muted"
        >
          <Bell className="w-5 h-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-destructive text-destructive-foreground text-[10px] font-medium rounded-full flex items-center justify-center shadow-sm">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0 shadow-lg border" 
        align="end"
        sideOffset={8}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto py-1 px-2 text-xs text-[hsl(180,70%,45%)] hover:text-[hsl(180,70%,35%)] hover:bg-transparent"
              onClick={handleClearAll}
            >
              Clear All
            </Button>
          )}
        </div>

        <ScrollArea className="max-h-[400px]">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-sm">
              No notifications
            </div>
          ) : (
            <div className="divide-y">
              {groupedNotifications.map(([date, items]) => (
                <div key={date}>
                  <div className="px-4 py-2 text-xs font-medium text-muted-foreground bg-muted/30 sticky top-0">
                    {formatDate(date)}
                  </div>
                  <div className="divide-y divide-border/50">
                    {items.map((notification) => (
                      <div
                        key={notification.id}
                        className={cn(
                          "px-4 py-3 flex items-start gap-3 cursor-pointer transition-colors hover:bg-muted/50",
                          !notification.isRead && "bg-accent/30"
                        )}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div
                          className={cn(
                            "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                            getNotificationColor(notification.type, notification.isRead)
                          )}
                        >
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "text-sm leading-tight",
                            notification.isRead ? "text-muted-foreground" : "font-medium text-foreground"
                          )}>
                            {notification.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {notification.description}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 flex-shrink-0 opacity-50 hover:opacity-100"
                          onClick={(e) => handleDismiss(notification.id, e)}
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
