import { useState, useMemo } from "react";
import { ConversationList } from "./ConversationList";
import { ChatPanel } from "./ChatPanel";
import { useDirectMessages, DirectMessageChannel, ConversationSummary } from "@/hooks/useDirectMessages";
import { CommunicationChannel } from "@/hooks/useCommunicationCampaigns";
import { useRegion } from "@/contexts/RegionContext";
import { ContentFilter } from "@/hooks/useEmails";

const OPPORTUNITY_KEYWORDS = /\b(opportunity|recommend|rebalance|top[\s-]?up|review|contribution|switch|beneficiary|annuity|retirement|estate|tax|insurance|risk|hedge|diversif)/i;
const TASK_KEYWORDS = /\b(task|todo|to-do|action item|follow[\s-]?up|deadline|assign|complete|outstanding|overdue|remind)/i;

interface ChatInterfaceProps {
  channel: CommunicationChannel;
  contentFilter?: ContentFilter;
}

const mapChannelToDirectChannel = (channel: CommunicationChannel): DirectMessageChannel => {
  switch (channel) {
    case "WhatsApp":
      return "whatsapp";
    case "SMS":
      return "sms";
    case "Push":
      return "push";
    default:
      return "whatsapp";
  }
};

export const ChatInterface = ({ channel, contentFilter = "all" }: ChatInterfaceProps) => {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const { selectedRegion } = useRegion();

  const directChannel = mapChannelToDirectChannel(channel);
  const { conversations, loading } = useDirectMessages(directChannel, selectedRegion);

  const filteredConversations = useMemo(() => {
    if (contentFilter === "all") return conversations;

    return conversations.filter((conv: ConversationSummary) => {
      const text = conv.last_message || "";
      const matchesTasks = TASK_KEYWORDS.test(text);
      const matchesOpportunities = OPPORTUNITY_KEYWORDS.test(text);

      if (contentFilter === "has-both") return matchesTasks && matchesOpportunities;
      if (contentFilter === "has-tasks") return matchesTasks;
      if (contentFilter === "has-opportunities") return matchesOpportunities;
      return true;
    });
  }, [conversations, contentFilter]);

  return (
    <div className="flex flex-1 overflow-hidden">
      <ConversationList
        channel={directChannel}
        conversations={filteredConversations}
        selectedClientId={selectedClientId}
        onSelectClient={setSelectedClientId}
        loading={loading}
        jurisdiction={selectedRegion}
      />
      <ChatPanel
        channel={directChannel}
        clientId={selectedClientId}
      />
    </div>
  );
};
