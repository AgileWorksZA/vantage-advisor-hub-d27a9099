import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { ImportanceLevel } from "@/hooks/useCommunicationCampaigns";

interface ComposeSidebarProps {
  description: string;
  onDescriptionChange: (value: string) => void;
  scheduledAt: Date | null;
  onScheduledAtChange: (value: Date | null) => void;
  autoNoteCompletion: boolean;
  onAutoNoteCompletionChange: (value: boolean) => void;
  importance: ImportanceLevel;
  onImportanceChange: (value: ImportanceLevel) => void;
  requestReadReceipt: boolean;
  onRequestReadReceiptChange: (value: boolean) => void;
  isNewsletter: boolean;
  onIsNewsletterChange: (value: boolean) => void;
  allowDuplicates: boolean;
  onAllowDuplicatesChange: (value: boolean) => void;
}

export const ComposeSidebar = ({
  description,
  onDescriptionChange,
  scheduledAt,
  onScheduledAtChange,
  autoNoteCompletion,
  onAutoNoteCompletionChange,
  importance,
  onImportanceChange,
  requestReadReceipt,
  onRequestReadReceiptChange,
  isNewsletter,
  onIsNewsletterChange,
  allowDuplicates,
  onAllowDuplicatesChange,
}: ComposeSidebarProps) => {
  return (
    <div className="w-64 bg-background border-r border-border p-4 space-y-6 overflow-y-auto">
      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Options</h3>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm">Description</Label>
        <Input
          id="description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Campaign description..."
          className="text-sm"
        />
      </div>

      {/* Scheduler */}
      <div className="space-y-2">
        <Label className="text-sm">Schedule</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal text-sm"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {scheduledAt ? format(scheduledAt, "PPP p") : "Send now"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={scheduledAt || undefined}
              onSelect={(date) => onScheduledAtChange(date || null)}
              initialFocus
            />
            <div className="p-3 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onScheduledAtChange(null)}
                className="w-full"
              >
                Clear schedule
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Importance */}
      <div className="space-y-2">
        <Label className="text-sm">Importance</Label>
        <Select value={importance} onValueChange={(v) => onImportanceChange(v as ImportanceLevel)}>
          <SelectTrigger className="text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Low">Low</SelectItem>
            <SelectItem value="Normal">Normal</SelectItem>
            <SelectItem value="High">High</SelectItem>
            <SelectItem value="Urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Toggle Options */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="autoNote" className="text-sm">Auto note completion</Label>
          <Switch
            id="autoNote"
            checked={autoNoteCompletion}
            onCheckedChange={onAutoNoteCompletionChange}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="readReceipt" className="text-sm">Read receipt</Label>
          <Switch
            id="readReceipt"
            checked={requestReadReceipt}
            onCheckedChange={onRequestReadReceiptChange}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="newsletter" className="text-sm">Is Newsletter</Label>
          <Switch
            id="newsletter"
            checked={isNewsletter}
            onCheckedChange={onIsNewsletterChange}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="duplicates" className="text-sm">Allow duplicates</Label>
          <Switch
            id="duplicates"
            checked={allowDuplicates}
            onCheckedChange={onAllowDuplicatesChange}
          />
        </div>
      </div>
    </div>
  );
};
