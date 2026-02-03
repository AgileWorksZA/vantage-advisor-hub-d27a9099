import { Mail, MessageSquare, Phone, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { CommunicationChannel } from "@/hooks/useCommunicationCampaigns";

interface CommunicationTypeSelectorProps {
  value: CommunicationChannel;
  onChange: (value: CommunicationChannel) => void;
}

const channels: { value: CommunicationChannel; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "Email", label: "Email", icon: Mail },
  { value: "WhatsApp", label: "WhatsApp", icon: MessageSquare },
  { value: "SMS", label: "SMS", icon: Phone },
  { value: "Push", label: "Push", icon: Bell },
];

export const CommunicationTypeSelector = ({ value, onChange }: CommunicationTypeSelectorProps) => {
  return (
    <div className="flex rounded-lg border border-border overflow-hidden">
      {channels.map((channel) => {
        const Icon = channel.icon;
        const isActive = value === channel.value;
        return (
          <button
            key={channel.value}
            type="button"
            onClick={() => onChange(channel.value)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "bg-background text-muted-foreground hover:bg-muted"
            )}
          >
            <Icon className="w-4 h-4" />
            {channel.label}
          </button>
        );
      })}
    </div>
  );
};
