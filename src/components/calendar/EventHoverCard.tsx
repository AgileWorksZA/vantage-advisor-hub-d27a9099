import { ReactNode } from "react";
import { format } from "date-fns";
import { CalendarEvent, CalendarEventType } from "@/hooks/useCalendarEvents";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, User, Users, Calendar, FileText } from "lucide-react";

export const eventTypeAccentColors: Record<CalendarEventType, { border: string; bg: string; text: string }> = {
  "Meeting": { border: "border-l-[hsl(180,70%,45%)]", bg: "bg-[hsl(180,70%,45%)]/10 dark:bg-[hsl(180,70%,45%)]/20", text: "text-[hsl(180,70%,35%)] dark:text-[hsl(180,70%,55%)]" },
  "Annual Review": { border: "border-l-purple-500", bg: "bg-purple-500/10 dark:bg-purple-500/20", text: "text-purple-600 dark:text-purple-400" },
  "Portfolio Review": { border: "border-l-purple-400", bg: "bg-purple-400/10 dark:bg-purple-400/20", text: "text-purple-500 dark:text-purple-300" },
  "Compliance Review": { border: "border-l-amber-500", bg: "bg-amber-500/10 dark:bg-amber-500/20", text: "text-amber-600 dark:text-amber-400" },
  "Reminder": { border: "border-l-blue-400", bg: "bg-blue-400/10 dark:bg-blue-400/20", text: "text-blue-500 dark:text-blue-300" },
  "Personal": { border: "border-l-blue-500", bg: "bg-blue-500/10 dark:bg-blue-500/20", text: "text-blue-600 dark:text-blue-400" },
  "Team Event": { border: "border-l-green-500", bg: "bg-green-500/10 dark:bg-green-500/20", text: "text-green-600 dark:text-green-400" },
  "Client Call": { border: "border-l-teal-400", bg: "bg-teal-400/10 dark:bg-teal-400/20", text: "text-teal-500 dark:text-teal-300" },
};

const statusColors: Record<string, string> = {
  Scheduled: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  Completed: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  Cancelled: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
};

function isUrl(text: string): boolean {
  return /https?:\/\/|zoom\.us|maps\.google|meet\.google/i.test(text);
}

interface EventHoverCardProps {
  event: CalendarEvent;
  children: ReactNode;
  side?: "top" | "bottom" | "left" | "right";
}

export function EventHoverCard({ event, children, side = "bottom" }: EventHoverCardProps) {
  const accent = eventTypeAccentColors[event.eventType];

  return (
    <HoverCard openDelay={300} closeDelay={100}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent side={side} align="start" className="w-80 p-0 overflow-hidden">
        {/* Colored top bar */}
        <div className={`h-1.5 w-full ${accent.border.replace("border-l-", "bg-")}`} />

        <div className="p-4 space-y-3">
          {/* Title + type badge */}
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold text-sm text-foreground leading-tight">{event.title}</h4>
            <Badge variant="secondary" className={`text-[10px] shrink-0 ${accent.text}`}>
              {event.eventType}
            </Badge>
          </div>

          {/* Date & time */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            {event.allDay ? (
              <span>{format(event.startTime, "EEEE, d MMMM yyyy")} · All day</span>
            ) : (
              <span>
                {format(event.startTime, "EEE, d MMM")} · {format(event.startTime, "h:mm a")} – {format(event.endTime, "h:mm a")}
              </span>
            )}
          </div>

          {/* Location */}
          {event.location && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {isUrl(event.location) ? (
                <a
                  href={event.location.startsWith("http") ? event.location : `https://${event.location}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline truncate"
                  onClick={(e) => e.stopPropagation()}
                >
                  {event.location}
                </a>
              ) : (
                <span className="truncate">{event.location}</span>
              )}
            </div>
          )}

          {/* Client */}
          {event.clientName && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="h-3.5 w-3.5 shrink-0" />
              <span>{event.clientName}</span>
            </div>
          )}

          {/* Attendees */}
          {event.attendees && event.attendees.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5 shrink-0" />
              <span>{event.attendees.length} attendee{event.attendees.length !== 1 ? "s" : ""}</span>
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <FileText className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <p className="line-clamp-3">{event.description}</p>
            </div>
          )}

          {/* Status */}
          <div className="flex items-center gap-2 pt-1 border-t border-border">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColors[event.status] || ""}`}>
              {event.status}
            </span>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
