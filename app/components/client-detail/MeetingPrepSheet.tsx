import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { MeetingPrepPanel } from "@/components/calendar/MeetingPrepPanel";
import { ClientCalendarEvent } from "@/hooks/useClientCalendarEvents";

interface MeetingPrepSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: ClientCalendarEvent | null;
  clientId: string;
  onNavigate?: (type: string, id?: string) => void;
}

const eventTypeColor = (type: string) => {
  switch (type) {
    case "Meeting": return "bg-[hsl(180,50%,90%)] text-[hsl(180,70%,30%)] dark:bg-[hsl(180,50%,15%)] dark:text-[hsl(180,70%,60%)]";
    case "Annual Review": return "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300";
    case "Portfolio Review": return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300";
    case "Compliance Review": return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300";
    default: return "bg-muted text-muted-foreground";
  }
};

export function MeetingPrepSheet({ open, onOpenChange, event, clientId, onNavigate }: MeetingPrepSheetProps) {
  if (!event) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-2 mb-1">
            <Badge className={`text-[10px] ${eventTypeColor(event.eventType)}`}>{event.eventType}</Badge>
            <Badge variant="outline" className="text-[10px]">{event.status}</Badge>
          </div>
          <SheetTitle className="text-lg">{event.title}</SheetTitle>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3" />
              <span>{format(event.startTime, "EEEE, dd MMMM yyyy")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              <span>{format(event.startTime, "HH:mm")} – {format(event.endTime, "HH:mm")}</span>
            </div>
            {event.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3" />
                <span>{event.location}</span>
              </div>
            )}
          </div>
          {event.description && (
            <p className="text-xs text-muted-foreground mt-2">{event.description}</p>
          )}
        </SheetHeader>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-1.5">
            AI Meeting Prep
          </h3>
          <MeetingPrepPanel clientId={clientId} onNavigate={onNavigate} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
