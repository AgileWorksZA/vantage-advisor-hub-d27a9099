import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { CalendarEvent } from "@/hooks/useCalendarEvents";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RescheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: CalendarEvent;
}

const EVENT_TYPES = ["Meeting", "Review", "Call", "Follow-up", "Presentation", "Workshop", "Other"];

export default function RescheduleDialog({ open, onOpenChange, event }: RescheduleDialogProps) {
  const { toast } = useToast();
  const [subject, setSubject] = useState(event.title);
  const [date, setDate] = useState<Date>(event.startTime);
  const [startTime, setStartTime] = useState(format(event.startTime, "HH:mm"));
  const [endTime, setEndTime] = useState(format(event.endTime, "HH:mm"));
  const [invitees, setInvitees] = useState(
    event.attendees?.map((a: any) => a.name || a.email || a).join(", ") || ""
  );
  const [location, setLocation] = useState(event.location || "");
  const [meetingType, setMeetingType] = useState(String(event.eventType) || "Meeting");
  const [note, setNote] = useState("");

  const handleConfirm = () => {
    toast({ title: "Meeting rescheduled", description: `${subject} moved to ${format(date, "EEE, d MMM yyyy")} at ${startTime}` });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Reschedule Meeting</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Subject */}
          <div className="space-y-1.5">
            <Label htmlFor="subject">Meeting Subject *</Label>
            <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <Label>Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} initialFocus className="p-3 pointer-events-auto" />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="start-time">Start Time *</Label>
              <Input id="start-time" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="end-time">End Time *</Label>
              <Input id="end-time" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>

          {/* Invitees */}
          <div className="space-y-1.5">
            <Label htmlFor="invitees">Invitees</Label>
            <Input id="invitees" placeholder="e.g. John, jane@email.com" value={invitees} onChange={(e) => setInvitees(e.target.value)} />
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <Label htmlFor="location">Location</Label>
            <Input id="location" placeholder="Office, Zoom link, etc." value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>

          {/* Meeting Type */}
          <div className="space-y-1.5">
            <Label>Meeting Type</Label>
            <Select value={meetingType} onValueChange={setMeetingType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {EVENT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <Label htmlFor="note">Note / Reason</Label>
            <Textarea id="note" placeholder="Reason for rescheduling…" value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={!subject || !date}>Confirm Reschedule</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
