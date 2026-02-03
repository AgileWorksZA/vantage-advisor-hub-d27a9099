import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Paperclip, Upload, FileText, ClipboardList, FileCheck, MessageSquareText, X } from "lucide-react";
import { CommunicationChannel } from "@/hooks/useCommunicationCampaigns";

interface AttachmentSectionProps {
  channel: CommunicationChannel;
  selectedTypes: string[];
  onTypesChange: (types: string[]) => void;
}

const attachmentTypes = [
  { value: "files", label: "Files", icon: Upload, description: "Upload custom files" },
  { value: "financial_report", label: "Financial Report", icon: FileText, description: "Generate from client data" },
  { value: "client_data_sheet", label: "Client Data Sheet", icon: ClipboardList, description: "Export client summary" },
  { value: "review_letter", label: "Review Letter", icon: FileCheck, description: "Template-based document" },
  { value: "survey", label: "Survey", icon: MessageSquareText, description: "Link to survey form" },
];

export const AttachmentSection = ({
  channel,
  selectedTypes,
  onTypesChange,
}: AttachmentSectionProps) => {
  const [popoverOpen, setPopoverOpen] = useState(false);

  // SMS doesn't support attachments
  if (channel === "SMS") {
    return null;
  }

  // Push only supports basic message
  if (channel === "Push") {
    return null;
  }

  const toggleType = (type: string) => {
    if (selectedTypes.includes(type)) {
      onTypesChange(selectedTypes.filter((t) => t !== type));
    } else {
      onTypesChange([...selectedTypes, type]);
    }
  };

  const removeType = (type: string) => {
    onTypesChange(selectedTypes.filter((t) => t !== type));
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Attachments</Label>
      <div className="flex items-center gap-2 flex-wrap">
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" size="sm" className="gap-2">
              <Paperclip className="w-4 h-4" />
              Add attachment
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-2" align="start">
            <div className="space-y-1">
              {attachmentTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedTypes.includes(type.value);
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => toggleType(type.value)}
                    className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-muted text-left"
                  >
                    <Checkbox checked={isSelected} />
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{type.label}</p>
                      <p className="text-xs text-muted-foreground">{type.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>

        {selectedTypes.map((type) => {
          const typeInfo = attachmentTypes.find((t) => t.value === type);
          if (!typeInfo) return null;
          const Icon = typeInfo.icon;
          return (
            <Badge key={type} variant="secondary" className="gap-1">
              <Icon className="w-3 h-3" />
              {typeInfo.label}
              <button
                type="button"
                onClick={() => removeType(type)}
                className="ml-1 hover:bg-muted rounded"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          );
        })}
      </div>
    </div>
  );
};
