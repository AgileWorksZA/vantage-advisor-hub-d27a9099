import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import DOMPurify from "dompurify";
import { format } from "date-fns";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Mail,
  CalendarIcon,
  ListTodo,
  LineChart,
  Building2,
  Archive,
  Reply,
  Forward,
  Loader2,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import commandCenterIcon from "@/assets/command-center-icon.png";
import vantageLogo from "@/assets/vantage-logo.png";
import { AppHeader } from "@/components/layout/AppHeader";
import { AttachmentList } from "@/components/email/AttachmentList";
import { TaskLinkingSection } from "@/components/email/TaskLinkingSection";
import {
  ClientAvatarBadge,
  formatClientName,
  getClientInitials,
} from "@/components/email/ClientAvatarBadge";
import { useEmailDetail } from "@/hooks/useEmailDetail";
import { useToast } from "@/hooks/use-toast";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dash", path: "/dashboard" },
  { icon: Users, label: "Clients", path: "/clients" },
  { icon: LineChart, label: "Portfolio", path: "/portfolio" },
  { icon: Mail, label: "Message", path: "/email" },
  { icon: CalendarIcon, label: "Calendar", path: "/calendar" },
  { icon: ListTodo, label: "Tasks", path: "/tasks" },
  { icon: Briefcase, label: "Insights", path: "/insights" },
  { icon: Building2, label: "Practice", path: "/practice" },
];

const EmailView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const { email, attachments, linkedClients, loading } = useEmailDetail(id || null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setAuthLoading(false);
        if (!session?.user) {
          navigate("/auth");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
      if (!session?.user) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleArchive = () => {
    toast({ title: "Email archived" });
    navigate("/email");
  };

  const handleReply = () => {
    if (!email) return;
    const params = new URLSearchParams({
      mode: "reply",
      emailId: email.id,
    });
    navigate(`/email/compose?${params.toString()}`);
  };

  const handleForward = () => {
    if (!email) return;
    const params = new URLSearchParams({
      mode: "forward",
      emailId: email.id,
    });
    navigate(`/email/compose?${params.toString()}`);
  };

  const formatDateTime = (date: string | null) => {
    if (!date) return "-";
    return format(new Date(date), "dd/MM/yyyy hh:mm a");
  };

  // Sanitize HTML content
  const sanitizedHtml = email?.body_html
    ? DOMPurify.sanitize(email.body_html, {
        ALLOWED_TAGS: [
          "p", "br", "div", "span", "strong", "b", "i", "em", "u",
          "ul", "ol", "li", "a", "table", "tr", "td", "th", "thead", "tbody",
          "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "pre", "code",
        ],
        ALLOWED_ATTR: ["href", "target", "style", "class"],
      })
    : null;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const userName = user?.user_metadata?.full_name || "Adviser";
  const userEmail = user?.email || "adviser@vantage.co";

  return (
    <div className="h-screen bg-muted/30 flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-16 bg-[hsl(180,25%,25%)] flex flex-col items-center py-4 gap-1 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10 text-white/80 hover:bg-white/10 mb-4"
          onClick={() => navigate("/command-center")}
          title="Practice Overview"
        >
          <img src={commandCenterIcon} alt="Command Center" className="w-5 h-5" />
        </Button>
        {sidebarItems.map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className={`w-full flex flex-col items-center py-2 text-xs gap-1 ${
              item.path === "/email"
                ? "bg-white/10 text-white"
                : "text-white/60 hover:bg-white/5 hover:text-white/80"
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </button>
        ))}
        <div className="flex-1" />
        <div className="mb-2">
          <img
            src={vantageLogo}
            alt="Vantage"
            className="h-10 object-contain -rotate-90 origin-center"
          />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <AppHeader
          searchPlaceholder="Search..."
          userName={userName}
          userEmail={userEmail}
          onSignOut={handleSignOut}
          onAccountSettings={() => navigate("/practice")}
        />

        {/* Content */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : !email ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Email not found
          </div>
        ) : (
          <ScrollArea className="flex-1">
            <div className="p-6 max-w-5xl mx-auto space-y-4">
              {/* Action Bar */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleArchive}
                  className="gap-1.5"
                >
                  <Archive className="w-4 h-4" />
                  Move to archive
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReply}
                  className="gap-1.5"
                >
                  <Reply className="w-4 h-4" />
                  Reply
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleForward}
                  className="gap-1.5"
                >
                  <Forward className="w-4 h-4" />
                  Forward
                </Button>
              </div>

              {/* Subject + Date */}
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-xl font-semibold">
                  {email.subject || "(No Subject)"}
                </h1>
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  {formatDateTime(email.received_at || email.sent_at)}
                </span>
              </div>

              {/* Metadata Section */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                {/* From */}
                <div className="flex items-center gap-3">
                  <Label className="w-16 text-sm text-muted-foreground">From</Label>
                  <Input
                    value={email.from_address}
                    readOnly
                    className="flex-1 bg-background"
                  />
                </div>

                {/* To */}
                <div className="flex items-center gap-3">
                  <Label className="w-16 text-sm text-muted-foreground">To</Label>
                  <Input
                    value={email.to_addresses?.join(", ") || ""}
                    readOnly
                    className="flex-1 bg-background"
                  />
                </div>

                {/* Clients */}
                <div className="flex items-start gap-3">
                  <Label className="w-16 text-sm text-muted-foreground pt-2">
                    Clients
                  </Label>
                  <div className="flex-1 flex flex-wrap items-center gap-2">
                    {linkedClients.map((client) => (
                      <ClientAvatarBadge
                        key={client.id}
                        id={client.id}
                        initials={getClientInitials(client.first_name, client.surname)}
                        name={formatClientName(
                          client.first_name,
                          client.surname,
                          client.initials
                        )}
                        hasGreenDot
                      />
                    ))}
                    <Button variant="ghost" size="sm" className="gap-1 text-xs h-8">
                      <Plus className="w-3.5 h-3.5" />
                      Add
                    </Button>
                  </div>
                </div>
              </div>

              {/* Task Linking Section */}
              <TaskLinkingSection
                linkedTasks={[]}
                isReadOnly
                onGuessTask={() => toast({ title: "AI task matching coming soon" })}
                onSearchTask={() => navigate("/tasks")}
                onNewTask={() => navigate("/tasks")}
                onGuessCompletedTask={() =>
                  toast({ title: "Completed task matching coming soon" })
                }
              />

              {/* Email Body */}
              <div className="bg-accent/30 rounded-lg p-6">
                {sanitizedHtml ? (
                  <div
                    className="prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
                  />
                ) : (
                  <p className="text-sm whitespace-pre-wrap">
                    {email.body_preview || "No content"}
                  </p>
                )}
              </div>

              {/* Attachments */}
              {attachments.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Attachments ({attachments.length})
                  </Label>
                  <AttachmentList attachments={attachments} />
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
};

export default EmailView;
