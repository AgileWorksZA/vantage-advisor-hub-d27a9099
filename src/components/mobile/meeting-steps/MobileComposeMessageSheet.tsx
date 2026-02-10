import { useState } from "react";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CommunicationTypeSelector } from "@/components/email/CommunicationTypeSelector";
import { useCommunicationCampaigns, CommunicationChannel } from "@/hooks/useCommunicationCampaigns";
import { useToast } from "@/hooks/use-toast";

interface MobileComposeMessageSheetProps {
  clientId: string;
  clientName: string;
  subject: string;
  bodyText: string;
  defaultChannel?: CommunicationChannel;
  onClose: () => void;
  onSent: (channel: CommunicationChannel, sentAt: string) => void;
}

export default function MobileComposeMessageSheet({
  clientId,
  clientName,
  subject: initialSubject,
  bodyText: initialBody,
  defaultChannel = "Email",
  onClose,
  onSent,
}: MobileComposeMessageSheetProps) {
  const [channel, setChannel] = useState<CommunicationChannel>(defaultChannel);
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialBody);
  const [sending, setSending] = useState(false);

  const { createCampaign } = useCommunicationCampaigns();
  const { toast } = useToast();

  const handleSend = async () => {
    setSending(true);
    const sentAt = new Date().toISOString();

    try {
      await createCampaign.mutateAsync({
        channel,
        campaign_type: "Single",
        description: `Follow-up message to ${clientName}`,
        from_team_member_id: null,
        from_primary_adviser: true,
        subject: channel === "Email" ? subject : null,
        body_html: channel === "Email" ? `<div>${body.replace(/\n/g, "<br/>")}</div>` : null,
        body_text: body,
        scheduled_at: null,
        importance: "Normal",
        request_read_receipt: false,
        is_newsletter: false,
        allow_duplicates: false,
        auto_note_completion: true,
        recipient_filter: { conditions: [] },
        recipient_client_ids: [clientId],
        attachment_types: [],
        status: "Sent",
        sent_at: sentAt,
        sent_count: 1,
        failed_count: 0,
      });

      toast({ title: "Message sent", description: `${channel} sent to ${clientName}` });
      onSent(channel, sentAt);
    } catch {
      toast({ title: "Failed to send", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 h-12 border-b border-border shrink-0">
        <button onClick={onClose} className="p-1">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-sm font-semibold text-foreground flex-1">Send Follow-up</h1>
        <Button
          size="sm"
          onClick={handleSend}
          disabled={sending || !body.trim()}
          className="h-8 bg-[hsl(180,70%,45%)] hover:bg-[hsl(180,70%,40%)] text-white"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          <span className="ml-1.5">Send</span>
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Channel selector */}
        <div className="overflow-x-auto -mx-4 px-4">
          <CommunicationTypeSelector value={channel} onChange={setChannel} />
        </div>

        {/* To */}
        <div>
          <p className="text-xs text-muted-foreground mb-1">To</p>
          <div className="flex items-center h-9 px-3 rounded-md border border-border bg-muted/30">
            <span className="text-sm text-foreground">{clientName}</span>
          </div>
        </div>

        {/* Subject (email only) */}
        {channel === "Email" && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Subject</p>
            <Input value={subject} onChange={e => setSubject(e.target.value)} className="h-9 text-sm" />
          </div>
        )}

        {/* Body */}
        <div className="flex-1">
          <p className="text-xs text-muted-foreground mb-1">Message</p>
          <Textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            className="min-h-[200px] text-sm resize-none"
          />
        </div>
      </div>
    </div>
  );
}
