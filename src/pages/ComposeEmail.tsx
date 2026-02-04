import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DOMPurify from "dompurify";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Mail,
  CalendarIcon,
  ListTodo,
  LineChart,
  Building2,
  Send,
  Paperclip,
  Trash2,
  Save,
  Loader2,
  Plus,
  X,
} from "lucide-react";
import commandCenterIcon from "@/assets/command-center-icon.png";
import vantageLogo from "@/assets/vantage-logo.png";
import { AppHeader } from "@/components/layout/AppHeader";
import { RichTextEditor } from "@/components/email/RichTextEditor";
import { TaskLinkingSection } from "@/components/email/TaskLinkingSection";
import {
  ClientAvatarBadge,
  formatClientName,
  getClientInitials,
} from "@/components/email/ClientAvatarBadge";
import { EmailQuotedContent, generateQuotedHtml } from "@/components/email/EmailQuotedContent";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useEmailDetail, LinkedClient } from "@/hooks/useEmailDetail";
import { useCommunicationCampaigns, CommunicationChannel } from "@/hooks/useCommunicationCampaigns";
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

interface RecipientBadge {
  id: string;
  email: string;
  name?: string;
}

const ComposeEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // Mode detection from URL params
  const mode = searchParams.get("mode") as "reply" | "forward" | null;
  const originalEmailId = searchParams.get("emailId");

  // Fetch original email for reply/forward
  const { email: originalEmail, linkedClients: originalClients } = useEmailDetail(
    mode ? originalEmailId : null
  );

  // Form state
  const [recipients, setRecipients] = useState<RecipientBadge[]>([]);
  const [ccRecipients, setCcRecipients] = useState<RecipientBadge[]>([]);
  const [bccRecipients, setBccRecipients] = useState<RecipientBadge[]>([]);
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [subject, setSubject] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [newRecipient, setNewRecipient] = useState("");
  const [newCc, setNewCc] = useState("");
  const [newBcc, setNewBcc] = useState("");
  const [linkedClients, setLinkedClients] = useState<LinkedClient[]>([]);

  const { settings } = useUserSettings();
  const { createCampaign } = useCommunicationCampaigns();

  // Pre-fill form when original email loads
  useEffect(() => {
    if (originalEmail && mode) {
      // Set subject with Re: or Fwd:
      if (mode === "reply") {
        setSubject(
          originalEmail.subject?.startsWith("Re:")
            ? originalEmail.subject
            : `Re: ${originalEmail.subject || ""}`
        );
        // Set recipient to original sender for reply
        setRecipients([
          {
            id: "reply-to",
            email: originalEmail.from_address,
          },
        ]);
      } else if (mode === "forward") {
        setSubject(
          originalEmail.subject?.startsWith("Fwd:")
            ? originalEmail.subject
            : `Fwd: ${originalEmail.subject || ""}`
        );
        // For forward, leave recipient empty
        setRecipients([]);
      }

      // Pre-fill linked clients from original email
      if (originalClients.length > 0) {
        setLinkedClients(originalClients);
      }
    }
  }, [originalEmail, originalClients, mode]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
      if (!session?.user) {
        navigate("/auth");
      }
    });

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

  const handleAddRecipient = (email: string, type: "to" | "cc" | "bcc") => {
    if (!email.trim() || !email.includes("@")) return;
    const badge: RecipientBadge = { id: email, email: email.trim() };

    if (type === "to") {
      if (!recipients.find((r) => r.email === email)) {
        setRecipients([...recipients, badge]);
      }
      setNewRecipient("");
    } else if (type === "cc") {
      if (!ccRecipients.find((r) => r.email === email)) {
        setCcRecipients([...ccRecipients, badge]);
      }
      setNewCc("");
    } else {
      if (!bccRecipients.find((r) => r.email === email)) {
        setBccRecipients([...bccRecipients, badge]);
      }
      setNewBcc("");
    }
  };

  const handleRemoveRecipient = (email: string, type: "to" | "cc" | "bcc") => {
    if (type === "to") {
      setRecipients(recipients.filter((r) => r.email !== email));
    } else if (type === "cc") {
      setCcRecipients(ccRecipients.filter((r) => r.email !== email));
    } else {
      setBccRecipients(bccRecipients.filter((r) => r.email !== email));
    }
  };

  const handleRemoveClient = (clientId: string) => {
    setLinkedClients(linkedClients.filter((c) => c.id !== clientId));
  };

  const handleDiscard = () => {
    navigate("/email");
  };

  const handleSaveDraft = async () => {
    try {
      await createCampaign.mutateAsync({
        channel: "Email" as CommunicationChannel,
        campaign_type: "Single",
        description: null,
        from_team_member_id: null,
        from_primary_adviser: false,
        subject: subject || null,
        body_html: bodyHtml || null,
        body_text: bodyHtml.replace(/<[^>]*>/g, "") || null,
        scheduled_at: null,
        importance: "Normal",
        request_read_receipt: false,
        is_newsletter: false,
        allow_duplicates: false,
        auto_note_completion: true,
        recipient_filter: { conditions: [] },
        recipient_client_ids: linkedClients.map((c) => c.id),
        attachment_types: [],
        status: "Draft",
        sent_at: null,
        sent_count: 0,
        failed_count: 0,
      });
      toast({ title: "Draft saved" });
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleSend = async () => {
    if (!subject) {
      toast({ title: "Subject required", variant: "destructive" });
      return;
    }
    if (recipients.length === 0) {
      toast({ title: "At least one recipient required", variant: "destructive" });
      return;
    }

    // Build full body including quoted content
    let fullBody = bodyHtml;
    if (mode && originalEmail) {
      const quotedHtml = generateQuotedHtml(
        originalEmail.from_address,
        originalEmail.received_at || originalEmail.sent_at,
        originalEmail.to_addresses,
        originalEmail.subject,
        originalEmail.body_html,
        originalEmail.body_preview
      );
      fullBody = `${bodyHtml}${quotedHtml}`;
    }

    setIsSending(true);
    try {
      await createCampaign.mutateAsync({
        channel: "Email" as CommunicationChannel,
        campaign_type: "Single",
        description: null,
        from_team_member_id: null,
        from_primary_adviser: false,
        subject,
        body_html: fullBody,
        body_text: fullBody.replace(/<[^>]*>/g, ""),
        scheduled_at: null,
        importance: "Normal",
        request_read_receipt: false,
        is_newsletter: false,
        allow_duplicates: false,
        auto_note_completion: true,
        recipient_filter: { conditions: [] },
        recipient_client_ids: linkedClients.map((c) => c.id),
        attachment_types: [],
        status: "Sent",
        sent_at: new Date().toISOString(),
        sent_count: recipients.length,
        failed_count: 0,
      });
      toast({ title: "Email sent" });
      navigate("/email");
    } catch (error) {
      // Error handled by hook
    } finally {
      setIsSending(false);
    }
  };

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
        <div className="flex-1 flex flex-col bg-background overflow-y-auto">
          {/* Action Bar */}
          <div className="flex items-center gap-2 p-4 border-b border-border">
            <Button
              size="sm"
              onClick={handleSend}
              disabled={isSending}
              className="gap-1.5 bg-[hsl(180,70%,45%)] hover:bg-[hsl(180,70%,40%)] text-white"
            >
              {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Paperclip className="w-4 h-4" />
              Attach File
            </Button>
            <Button variant="outline" size="sm" onClick={handleDiscard} className="gap-1.5">
              <Trash2 className="w-4 h-4" />
              Discard
            </Button>
            <Button variant="outline" size="sm" onClick={handleSaveDraft} className="gap-1.5">
              <Save className="w-4 h-4" />
              Save
            </Button>
          </div>

          {/* Form */}
          <div className="p-6 max-w-4xl space-y-4">
            {/* Metadata Section */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              {/* From */}
              <div className="flex items-center gap-3">
                <Label className="w-16 text-sm text-muted-foreground">From</Label>
                <Input value={userEmail} readOnly className="flex-1 bg-background" />
              </div>

              {/* To */}
              <div className="flex items-start gap-3">
                <Label className="w-16 text-sm text-muted-foreground pt-2">To*</Label>
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2 min-h-[36px] p-2 bg-background border border-input rounded-md">
                    {recipients.map((r) => (
                      <div
                        key={r.email}
                        className="inline-flex items-center gap-1.5 bg-muted px-2 py-1 rounded text-sm"
                      >
                        {r.email}
                        <button
                          type="button"
                          onClick={() => handleRemoveRecipient(r.email, "to")}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    <input
                      type="email"
                      value={newRecipient}
                      onChange={(e) => setNewRecipient(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === ",") {
                          e.preventDefault();
                          handleAddRecipient(newRecipient, "to");
                        }
                      }}
                      placeholder="Add recipient..."
                      className="flex-1 min-w-[150px] bg-transparent outline-none text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    {!showBcc && (
                      <button
                        type="button"
                        onClick={() => setShowBcc(true)}
                        className="text-xs text-primary hover:underline"
                      >
                        +BCC
                      </button>
                    )}
                    {!showCc && (
                      <button
                        type="button"
                        onClick={() => setShowCc(true)}
                        className="text-xs text-primary hover:underline"
                      >
                        +CC
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* CC */}
              {showCc && (
                <div className="flex items-start gap-3">
                  <Label className="w-16 text-sm text-muted-foreground pt-2">CC</Label>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 min-h-[36px] p-2 bg-background border border-input rounded-md">
                      {ccRecipients.map((r) => (
                        <div
                          key={r.email}
                          className="inline-flex items-center gap-1.5 bg-muted px-2 py-1 rounded text-sm"
                        >
                          {r.email}
                          <button
                            type="button"
                            onClick={() => handleRemoveRecipient(r.email, "cc")}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      <input
                        type="email"
                        value={newCc}
                        onChange={(e) => setNewCc(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === ",") {
                            e.preventDefault();
                            handleAddRecipient(newCc, "cc");
                          }
                        }}
                        placeholder="Add CC..."
                        className="flex-1 min-w-[150px] bg-transparent outline-none text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* BCC */}
              {showBcc && (
                <div className="flex items-start gap-3">
                  <Label className="w-16 text-sm text-muted-foreground pt-2">BCC</Label>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 min-h-[36px] p-2 bg-background border border-input rounded-md">
                      {bccRecipients.map((r) => (
                        <div
                          key={r.email}
                          className="inline-flex items-center gap-1.5 bg-muted px-2 py-1 rounded text-sm"
                        >
                          {r.email}
                          <button
                            type="button"
                            onClick={() => handleRemoveRecipient(r.email, "bcc")}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      <input
                        type="email"
                        value={newBcc}
                        onChange={(e) => setNewBcc(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === ",") {
                            e.preventDefault();
                            handleAddRecipient(newBcc, "bcc");
                          }
                        }}
                        placeholder="Add BCC..."
                        className="flex-1 min-w-[150px] bg-transparent outline-none text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Subject */}
              <div className="flex items-center gap-3">
                <Label className="w-16 text-sm text-muted-foreground">Subject</Label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Email subject..."
                  className="flex-1 bg-background"
                />
              </div>

              {/* Clients */}
              <div className="flex items-start gap-3">
                <Label className="w-16 text-sm text-muted-foreground pt-2">Clients</Label>
                <div className="flex-1 flex flex-wrap items-center gap-2">
                  {linkedClients.map((client) => (
                    <ClientAvatarBadge
                      key={client.id}
                      id={client.id}
                      initials={getClientInitials(client.first_name, client.surname)}
                      name={formatClientName(client.first_name, client.surname, client.initials)}
                      hasGreenDot
                      onRemove={() => handleRemoveClient(client.id)}
                    />
                  ))}
                  <Button variant="ghost" size="sm" className="gap-1 text-xs h-8">
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </Button>
                </div>
              </div>
            </div>

            {/* Task Linking */}
            <TaskLinkingSection
              linkedTasks={[]}
              onGuessTask={() => toast({ title: "AI task matching coming soon" })}
              onSearchTask={() => navigate("/tasks")}
              onNewTask={() => navigate("/tasks")}
              onGuessCompletedTask={() => toast({ title: "Completed task matching coming soon" })}
            />

            {/* Message */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Message</Label>
              <RichTextEditor
                value={bodyHtml}
                onChange={setBodyHtml}
                channel="Email"
                placeholder="Write your message..."
              />
            </div>

            {/* Quoted Content (for reply/forward) */}
            {mode && originalEmail && (
              <EmailQuotedContent
                fromAddress={originalEmail.from_address}
                sentAt={originalEmail.received_at || originalEmail.sent_at}
                toAddresses={originalEmail.to_addresses}
                subject={originalEmail.subject}
                bodyHtml={originalEmail.body_html}
                bodyText={originalEmail.body_preview}
              />
            )}

            {/* Signature */}
            {settings?.email_signature && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Signature</Label>
                <div
                  className="p-4 bg-muted/30 rounded-md border border-border text-sm prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(settings.email_signature),
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComposeEmail;
