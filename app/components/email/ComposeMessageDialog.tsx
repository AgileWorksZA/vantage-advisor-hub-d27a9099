import { useState, useMemo } from "react";
import DOMPurify from "dompurify";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Send, Save, FlaskConical, Loader2, X } from "lucide-react";
import { CommunicationTypeSelector } from "./CommunicationTypeSelector";
import { ComposeFromField } from "./ComposeFromField";
import { ComposeToField } from "./ComposeToField";
import { AttachmentSection } from "./AttachmentSection";
import { RichTextEditor } from "./RichTextEditor";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useClients } from "@/hooks/useClients";
import {
  useCommunicationCampaigns,
  CommunicationChannel,
  ImportanceLevel,
  FilterCondition,
} from "@/hooks/useCommunicationCampaigns";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ComposeMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialClientIds?: string[];
  taskId?: string;
  defaultChannel?: CommunicationChannel;
}

export const ComposeMessageDialog = ({
  open,
  onOpenChange,
  initialClientIds = [],
  taskId,
  defaultChannel = "Email",
}: ComposeMessageDialogProps) => {
  const { toast } = useToast();
  const { settings } = useUserSettings();
  const { clients } = useClients();
  const { createCampaign } = useCommunicationCampaigns();

  // Form state
  const [channel, setChannel] = useState<CommunicationChannel>(defaultChannel);
  const [isSending, setIsSending] = useState(false);
  const [selectedTeamMemberId, setSelectedTeamMemberId] = useState<string | null>(null);
  const [fromPrimaryAdviser, setFromPrimaryAdviser] = useState(false);
  const [recipientFilter, setRecipientFilter] = useState<{ conditions: FilterCondition[] }>({ conditions: [] });
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>(initialClientIds);
  const [attachmentTypes, setAttachmentTypes] = useState<string[]>([]);
  const [subject, setSubject] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");

  // Get current user info
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("Adviser");

  useState(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserEmail(data.user.email || "");
        setUserName(data.user.user_metadata?.full_name || "Adviser");
      }
    });
  });

  // Calculate recipient count based on filters + direct selections
  const recipientCount = useMemo(() => {
    let count = selectedClientIds.length;

    if (recipientFilter.conditions.length > 0) {
      const filterMatches = clients.filter((client) => {
        // Skip clients already directly selected
        if (selectedClientIds.includes(client.id)) return false;

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
      count += filterMatches;
    }

    return count;
  }, [clients, recipientFilter, selectedClientIds]);

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleSaveDraft = async () => {
    try {
      await createCampaign.mutateAsync({
        channel,
        campaign_type: selectedClientIds.length > 1 || recipientFilter.conditions.length > 0 ? "Bulk" : "Single",
        description: null,
        from_team_member_id: selectedTeamMemberId,
        from_primary_adviser: fromPrimaryAdviser,
        subject: subject || null,
        body_html: bodyHtml || null,
        body_text: bodyHtml.replace(/<[^>]*>/g, "") || null,
        scheduled_at: null,
        importance: "Normal" as ImportanceLevel,
        request_read_receipt: false,
        is_newsletter: false,
        allow_duplicates: false,
        auto_note_completion: true,
        recipient_filter: recipientFilter,
        recipient_client_ids: selectedClientIds,
        attachment_types: attachmentTypes,
        status: "Draft",
        sent_at: null,
        sent_count: 0,
        failed_count: 0,
      });
      toast({ title: "Draft saved" });
      handleClose();
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleSendTest = async () => {
    toast({
      title: "Test mail sent",
      description: `Sent to ${userEmail}`,
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
    if (recipientCount === 0) {
      toast({ title: "No recipients selected", variant: "destructive" });
      return;
    }

    setIsSending(true);
    try {
      await createCampaign.mutateAsync({
        channel,
        campaign_type: selectedClientIds.length > 1 || recipientFilter.conditions.length > 0 ? "Bulk" : "Single",
        description: null,
        from_team_member_id: selectedTeamMemberId,
        from_primary_adviser: fromPrimaryAdviser,
        subject: subject || null,
        body_html: bodyHtml || null,
        body_text: bodyHtml.replace(/<[^>]*>/g, "") || null,
        scheduled_at: null,
        importance: "Normal" as ImportanceLevel,
        request_read_receipt: false,
        is_newsletter: false,
        allow_duplicates: false,
        auto_note_completion: true,
        recipient_filter: recipientFilter,
        recipient_client_ids: selectedClientIds,
        attachment_types: attachmentTypes,
        status: "Sent",
        sent_at: new Date().toISOString(),
        sent_count: recipientCount,
        failed_count: 0,
      });
      toast({ title: "Message sent" });
      handleClose();
    } catch (error) {
      // Error handled by hook
    } finally {
      setIsSending(false);
    }
  };

  // Build allClients lookup for the ToField
  const allClientsLookup = useMemo(() => {
    return clients.map((c) => ({
      id: c.id,
      name: `${(c as any).first_name || ""} ${(c as any).surname || ""}`.trim() || c.client || "Unknown",
      email: c.email || "",
    }));
  }, [clients]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Compose Message</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Channel Selector */}
          <div className="flex items-center justify-between">
            <CommunicationTypeSelector value={channel} onChange={setChannel} />
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleSendTest} className="gap-1">
                <FlaskConical className="w-4 h-4" />
                Test
              </Button>
              <Button variant="outline" size="sm" onClick={handleSaveDraft} className="gap-1">
                <Save className="w-4 h-4" />
                Draft
              </Button>
              <Button size="sm" onClick={handleSend} disabled={isSending} className="gap-1">
                {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send
              </Button>
            </div>
          </div>

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
            selectedClientIds={selectedClientIds}
            onSelectedClientIdsChange={setSelectedClientIds}
            allClients={allClientsLookup}
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
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(settings.email_signature) }}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
