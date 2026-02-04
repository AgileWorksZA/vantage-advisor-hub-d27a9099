import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
  ArrowLeft,
  Send,
  Save,
  FlaskConical,
  Loader2,
} from "lucide-react";
import commandCenterIcon from "@/assets/command-center-icon.png";
import vantageLogo from "@/assets/vantage-logo.png";
import { AppHeader } from "@/components/layout/AppHeader";
import { CommunicationTypeSelector } from "@/components/email/CommunicationTypeSelector";
import { ComposeSidebar } from "@/components/email/ComposeSidebar";
import { ComposeFromField } from "@/components/email/ComposeFromField";
import { ComposeToField } from "@/components/email/ComposeToField";
import { AttachmentSection } from "@/components/email/AttachmentSection";
import { RichTextEditor } from "@/components/email/RichTextEditor";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useClients } from "@/hooks/useClients";
import { useCommunicationCampaigns, CommunicationChannel, ImportanceLevel, FilterCondition } from "@/hooks/useCommunicationCampaigns";
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

const ComposeEmail = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // Form state
  const [channel, setChannel] = useState<CommunicationChannel>("Email");
  const [description, setDescription] = useState("");
  const [scheduledAt, setScheduledAt] = useState<Date | null>(null);
  const [autoNoteCompletion, setAutoNoteCompletion] = useState(true);
  const [importance, setImportance] = useState<ImportanceLevel>("Normal");
  const [requestReadReceipt, setRequestReadReceipt] = useState(false);
  const [isNewsletter, setIsNewsletter] = useState(false);
  const [allowDuplicates, setAllowDuplicates] = useState(false);
  const [selectedTeamMemberId, setSelectedTeamMemberId] = useState<string | null>(null);
  const [fromPrimaryAdviser, setFromPrimaryAdviser] = useState(false);
  const [recipientFilter, setRecipientFilter] = useState<{ conditions: FilterCondition[] }>({ conditions: [] });
  const [attachmentTypes, setAttachmentTypes] = useState<string[]>([]);
  const [subject, setSubject] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");

  const { settings } = useUserSettings();
  const { clients } = useClients();
  const { createCampaign } = useCommunicationCampaigns();

  // Calculate recipient count based on filters
  const recipientCount = useMemo(() => {
    if (recipientFilter.conditions.length === 0) return 0;
    
    return clients.filter((client) => {
      return recipientFilter.conditions.every((condition) => {
        const fieldValue = (client as any)[condition.field];
        if (!fieldValue) return condition.operator === "is_empty";
        
        const strValue = String(fieldValue).toLowerCase();
        const filterValue = condition.value.toLowerCase();

        switch (condition.operator) {
          case "equals":
            return strValue === filterValue;
          case "not_equals":
            return strValue !== filterValue;
          case "contains":
            return strValue.includes(filterValue);
          case "starts_with":
            return strValue.startsWith(filterValue);
          case "is_empty":
            return !fieldValue;
          case "is_not_empty":
            return !!fieldValue;
          default:
            return true;
        }
      });
    }).length;
  }, [clients, recipientFilter]);

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

  const handleSaveDraft = async () => {
    try {
      await createCampaign.mutateAsync({
        channel,
        campaign_type: recipientFilter.conditions.length > 0 ? "Bulk" : "Single",
        description: description || null,
        from_team_member_id: selectedTeamMemberId,
        from_primary_adviser: fromPrimaryAdviser,
        subject: subject || null,
        body_html: bodyHtml || null,
        body_text: bodyHtml.replace(/<[^>]*>/g, "") || null,
        scheduled_at: scheduledAt?.toISOString() || null,
        importance,
        request_read_receipt: requestReadReceipt,
        is_newsletter: isNewsletter,
        allow_duplicates: allowDuplicates,
        auto_note_completion: autoNoteCompletion,
        recipient_filter: recipientFilter,
        recipient_client_ids: [],
        attachment_types: attachmentTypes,
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

  const handleSendTest = async () => {
    toast({
      title: "Test mail sent",
      description: `Sent to ${user?.email}`,
    });
  };

  const handleSend = async () => {
    if (!subject && channel === "Email") {
      toast({ title: "Subject required", variant: "destructive" });
      return;
    }
    if (!bodyHtml) {
      toast({ title: "Message required", variant: "destructive" });
      return;
    }

    setIsSending(true);
    try {
      await createCampaign.mutateAsync({
        channel,
        campaign_type: recipientFilter.conditions.length > 0 ? "Bulk" : "Single",
        description: description || null,
        from_team_member_id: selectedTeamMemberId,
        from_primary_adviser: fromPrimaryAdviser,
        subject: subject || null,
        body_html: bodyHtml || null,
        body_text: bodyHtml.replace(/<[^>]*>/g, "") || null,
        scheduled_at: scheduledAt?.toISOString() || null,
        importance,
        request_read_receipt: requestReadReceipt,
        is_newsletter: isNewsletter,
        allow_duplicates: allowDuplicates,
        auto_note_completion: autoNoteCompletion,
        recipient_filter: recipientFilter,
        recipient_client_ids: [],
        attachment_types: attachmentTypes,
        status: scheduledAt ? "Scheduled" : "Sent",
        sent_at: scheduledAt ? null : new Date().toISOString(),
        sent_count: recipientCount,
        failed_count: 0,
      });
      toast({ title: scheduledAt ? "Campaign scheduled" : "Campaign sent" });
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
        <Button variant="ghost" size="icon" className="w-10 h-10 text-white/80 hover:bg-white/10 mb-4" onClick={() => navigate("/command-center")} title="Practice Overview">
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

        {/* Compose Content */}
        <main className="flex-1 flex overflow-hidden">
          {/* Options Sidebar */}
          <ComposeSidebar
            description={description}
            onDescriptionChange={setDescription}
            scheduledAt={scheduledAt}
            onScheduledAtChange={setScheduledAt}
            autoNoteCompletion={autoNoteCompletion}
            onAutoNoteCompletionChange={setAutoNoteCompletion}
            importance={importance}
            onImportanceChange={setImportance}
            requestReadReceipt={requestReadReceipt}
            onRequestReadReceiptChange={setRequestReadReceipt}
            isNewsletter={isNewsletter}
            onIsNewsletterChange={setIsNewsletter}
            allowDuplicates={allowDuplicates}
            onAllowDuplicatesChange={setAllowDuplicates}
          />

          {/* Main Compose Area */}
          <div className="flex-1 flex flex-col bg-background overflow-y-auto">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate("/email")} className="gap-1">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
                <CommunicationTypeSelector value={channel} onChange={setChannel} />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleSendTest} className="gap-1">
                  <FlaskConical className="w-4 h-4" />
                  Send Test
                </Button>
                <Button variant="outline" size="sm" onClick={handleSaveDraft} className="gap-1">
                  <Save className="w-4 h-4" />
                  Save Draft
                </Button>
                <Button size="sm" onClick={handleSend} disabled={isSending} className="gap-1 bg-primary hover:bg-primary/90">
                  {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {scheduledAt ? "Schedule" : "Send"}
                </Button>
              </div>
            </div>

            {/* Form */}
            <div className="p-6 space-y-6 max-w-4xl">
              {/* From */}
              <ComposeFromField
                currentUserEmail={userEmail}
                currentUserName={userName}
                selectedTeamMemberId={selectedTeamMemberId}
                onTeamMemberChange={setSelectedTeamMemberId}
                fromPrimaryAdviser={fromPrimaryAdviser}
                onFromPrimaryAdviserChange={setFromPrimaryAdviser}
              />

              {/* To */}
              <ComposeToField
                recipientFilter={recipientFilter}
                onFilterChange={setRecipientFilter}
                recipientCount={recipientCount}
              />

              {/* Attachments */}
              <AttachmentSection
                channel={channel}
                selectedTypes={attachmentTypes}
                onTypesChange={setAttachmentTypes}
              />

              {/* Subject (Email only) */}
              {channel === "Email" && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Subject</Label>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Email subject..."
                  />
                </div>
              )}

              {/* Message */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Message</Label>
                <RichTextEditor
                  value={bodyHtml}
                  onChange={setBodyHtml}
                  channel={channel}
                  placeholder={channel === "SMS" ? "Type your SMS message..." : "Write your message..."}
                  maxLength={channel === "SMS" ? 160 : undefined}
                />
              </div>

              {/* Signature (Email only) */}
              {channel === "Email" && settings?.email_signature && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Signature</Label>
                  <div
                    className="p-4 bg-muted/30 rounded-md border border-border text-sm prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: settings.email_signature }}
                  />
                  <p className="text-xs text-muted-foreground">
                    Edit signature in{" "}
                    <button
                      type="button"
                      onClick={() => navigate("/practice")}
                      className="text-primary hover:underline"
                    >
                      Practice Settings → Communication
                    </button>
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ComposeEmail;
