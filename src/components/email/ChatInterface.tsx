import { useState } from "react";
import { ConversationList } from "./ConversationList";
import { ChatPanel } from "./ChatPanel";
import { useDirectMessages, DirectMessageChannel } from "@/hooks/useDirectMessages";
import { CommunicationChannel } from "@/hooks/useCommunicationCampaigns";
import { useRegion } from "@/contexts/RegionContext";

interface ChatInterfaceProps {
  channel: CommunicationChannel;
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

export const ChatInterface = ({ channel }: ChatInterfaceProps) => {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const { selectedRegion } = useRegion();

  const directChannel = mapChannelToDirectChannel(channel);
  const { conversations, loading } = useDirectMessages(directChannel, selectedRegion);

  return (
    <div className="flex flex-1 overflow-hidden">
      <ConversationList
        channel={directChannel}
        conversations={conversations}
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
