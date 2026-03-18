import { useNavigate } from "react-router";
import { Bell, X, CheckSquare, MessageSquare, CreditCard, UserCircle, ArrowLeft, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getOpportunityConfig } from "@/lib/opportunity-detection";
import { AppHeader } from "@/components/layout/AppHeader";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useNotifications, type Notification } from "@/hooks/useNotifications";

const getNotificationIcon = (type: Notification["type"]) => {
  switch (type) {
    case "task": return <CheckSquare className="w-4 h-4" />;
    case "communication": return <MessageSquare className="w-4 h-4" />;
    case "transaction": return <CreditCard className="w-4 h-4" />;
    default: return <UserCircle className="w-4 h-4" />;
  }
};

const getNotificationColor = (type: Notification["type"], isRead: boolean) => {
  if (isRead) return "bg-muted/50 text-muted-foreground";
  switch (type) {
    case "task": return "bg-[hsl(180,70%,45%)]/10 text-[hsl(180,70%,35%)]";
    case "communication": return "bg-purple-100 text-purple-600";
    case "transaction": return "bg-blue-100 text-blue-600";
    default: return "bg-muted text-muted-foreground";
  }
};

const groupByDate = (notifications: Notification[]) => {
  const groups: { [key: string]: Notification[] } = {};
  notifications.forEach((n) => {
    const date = n.created_at.split("T")[0];
    if (!groups[date]) groups[date] = [];
    groups[date].push(n);
  });
  return Object.entries(groups).sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime());
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-ZA", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, "-");
};

const Notifications = () => {
  const navigate = useNavigate();
  const { notifications, markAsRead, dismiss, markAllRead, clearAll } = useNotifications();
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setUserName(data.user.email.split("@")[0]);
    });
  }, []);

  const groupedNotifications = groupByDate(notifications);

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.type === "task") {
      if (notification.task_id) {
        navigate(`/tasks?taskId=${notification.task_id}`);
      } else {
        navigate("/tasks");
      }
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader
          userName={userName}
          onSignOut={() => supabase.auth.signOut().then(() => navigate("/auth"))}
        />
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-foreground" />
                  <h1 className="text-xl font-semibold">All Notifications</h1>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={markAllRead}>Mark all read</Button>
                <Button variant="outline" size="sm" onClick={clearAll}>Clear All</Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate("/account-settings?section=notifications")}>
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {notifications.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">No notifications</CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {groupedNotifications.map(([date, items]) => (
                  <Card key={date}>
                    <CardHeader className="py-3 px-4 bg-muted/30">
                      <CardTitle className="text-xs font-medium text-muted-foreground">{formatDate(date)}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 divide-y divide-border/50">
                      {items.map((notification) => (
                        <div
                          key={notification.id}
                          className={cn(
                            "px-4 py-3 flex items-start gap-3 cursor-pointer transition-colors hover:bg-muted/50",
                            !notification.is_read && "bg-accent/30"
                          )}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className={cn("flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center", getNotificationColor(notification.type, notification.is_read))}>
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className={cn("text-sm leading-tight", notification.is_read ? "text-muted-foreground" : "font-medium text-foreground")}>
                                {notification.title}
                              </p>
                              {notification.opportunity_tag && (() => {
                                const config = getOpportunityConfig(notification.opportunity_tag);
                                return (
                                  <Badge variant="outline" className={`${config.color} text-[9px] px-1.5 py-0 leading-tight`}>
                                    {config.label}
                                  </Badge>
                                );
                              })()}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{notification.description}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 flex-shrink-0 opacity-50 hover:opacity-100"
                            onClick={(e) => { e.stopPropagation(); dismiss(notification.id); }}
                          >
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
