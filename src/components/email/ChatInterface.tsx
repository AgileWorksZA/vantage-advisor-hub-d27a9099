import { useState } from "react";
import { ConversationList } from "./ConversationList";
import { ChatPanel } from "./ChatPanel";
import { useDirectMessages, DirectMessageChannel } from "@/hooks/useDirectMessages";
import { CommunicationChannel } from "@/hooks/useCommunicationCampaigns";

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
  
  const directChannel = mapChannelToDirectChannel(channel);
  const { conversations, loading } = useDirectMessages(directChannel);

  return (
    <div className="flex flex-1 overflow-hidden">
      <ConversationList
        channel={directChannel}
        conversations={conversations}
        selectedClientId={selectedClientId}
        onSelectClient={setSelectedClientId}
        loading={loading}
      />
      <ChatPanel
        channel={directChannel}
        clientId={selectedClientId}
      />
    </div>
  );
};
