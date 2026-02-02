import { useMemo } from "react";
import {
  format,
  isSameDay,
  isToday,
  setHours,
  setMinutes,
  differenceInMinutes,
  startOfDay,
} from "date-fns";
import { CalendarEvent, CalendarEventType } from "@/hooks/useCalendarEvents";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const eventTypeColors: Record<CalendarEventType, string> = {
  "Meeting": "bg-[hsl(180,70%,45%)]",
  "Annual Review": "bg-purple-500",
  "Portfolio Review": "bg-purple-400",
  "Compliance Review": "bg-amber-500",
  "Reminder": "bg-blue-400",
  "Personal": "bg-blue-500",
  "Team Event": "bg-green-500",
  "Client Call": "bg-teal-400",
};

interface DayViewProps {
  viewDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onTimeSlotClick: (day: Date, hour: number) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const HOUR_HEIGHT = 64; // pixels per hour

export function DayView({
  viewDate,
  events,
  onEventClick,
  onTimeSlotClick,
}: DayViewProps) {
  const dayEvents = useMemo(() => {
    return events.filter((event) => isSameDay(event.startTime, viewDate));
  }, [events, viewDate]);

  const allDayEvents = useMemo(() => {
    return dayEvents.filter((event) => event.allDay);
  }, [dayEvents]);

  const timedEvents = useMemo(() => {
    return dayEvents.filter((event) => !event.allDay);
  }, [dayEvents]);

  const getEventPosition = (event: CalendarEvent) => {
    const dayStart = startOfDay(event.startTime);
    const startMinutes = differenceInMinutes(event.startTime, dayStart);
    const endMinutes = differenceInMinutes(event.endTime, dayStart);
    const duration = endMinutes - startMinutes;

    return {
      top: (startMinutes / 60) * HOUR_HEIGHT,
      height: Math.max((duration / 60) * HOUR_HEIGHT, 30), // Minimum height
    };
  };

  // Get current time indicator position
  const getCurrentTimePosition = () => {
    if (!isToday(viewDate)) return null;
    const now = new Date();
    const dayStart = startOfDay(now);
    const minutes = differenceInMinutes(now, dayStart);
    return (minutes / 60) * HOUR_HEIGHT;
  };

  const currentTimePosition = getCurrentTimePosition();
  const isTodayDate = isToday(viewDate);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Day header */}
      <div className="border-b border-border bg-background sticky top-0 z-10">
        <div className="flex items-center p-4">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground uppercase">{format(viewDate, "EEEE")}</p>
            <p
              className={cn(
                "text-3xl font-bold mt-1 w-12 h-12 rounded-full flex items-center justify-center",
                isTodayDate && "bg-[hsl(180,70%,45%)] text-white"
              )}
            >
              {format(viewDate, "d")}
            </p>
          </div>
        </div>

        {/* All-day events section */}
        {allDayEvents.length > 0 && (
          <div className="px-4 pb-2 border-t border-border pt-2">
            <p className="text-xs text-muted-foreground mb-1">All day</p>
            <div className="flex flex-wrap gap-1">
              {allDayEvents.map((event) => (
                <button
                  key={event.id}
                  onClick={() => onEventClick(event)}
                  className={cn(
                    "rounded px-2 py-1 text-sm text-white truncate max-w-[200px]",
                    event.color || eventTypeColors[event.eventType]
                  )}
                >
                  {event.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Time grid */}
      <div className="flex-1 overflow-auto">
        <div className="flex relative" style={{ minHeight: HOURS.length * HOUR_HEIGHT }}>
          {/* Time gutter */}
          <div className="w-20 flex-shrink-0 border-r border-border sticky left-0 bg-background z-[5]">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="border-b border-border text-right pr-3 text-sm text-muted-foreground"
                style={{ height: HOUR_HEIGHT }}
              >
                <span className="relative -top-3">
                  {hour === 0 ? "" : format(setMinutes(setHours(new Date(), hour), 0), "h:mm a")}
                </span>
              </div>
            ))}
          </div>

          {/* Day column */}
          <div className="flex-1 relative">
            {/* Hour slots */}
            {HOURS.map((hour) => (
              <div
                key={hour}
                onClick={() => onTimeSlotClick(viewDate, hour)}
                className="border-b border-border cursor-pointer hover:bg-muted/30 transition-colors"
                style={{ height: HOUR_HEIGHT }}
              />
            ))}

            {/* Current time indicator */}
            {currentTimePosition !== null && (
              <div
                className="absolute left-0 right-0 pointer-events-none z-20"
                style={{ top: currentTimePosition }}
              >
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 -ml-1.5" />
                  <div className="flex-1 h-0.5 bg-red-500" />
                </div>
              </div>
            )}

            {/* Events */}
            {timedEvents.map((event) => {
              const position = getEventPosition(event);

              return (
                <button
                  key={event.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventClick(event);
                  }}
                  className={cn(
                    "absolute left-2 right-2 rounded-lg px-3 py-2 text-white overflow-hidden text-left shadow-sm",
                    event.color || eventTypeColors[event.eventType]
                  )}
                  style={{
                    top: position.top,
                    height: position.height,
                    zIndex: 1,
                  }}
                >
                  <p className="font-medium truncate">{event.title}</p>
                  <p className="text-sm text-white/80 truncate">
                    {format(event.startTime, "h:mm a")} - {format(event.endTime, "h:mm a")}
                  </p>
                  {position.height >= 80 && event.location && (
                    <p className="text-sm text-white/70 truncate mt-1">📍 {event.location}</p>
                  )}
                  {position.height >= 100 && event.clientName && (
                    <p className="text-sm text-white/70 truncate">👤 {event.clientName}</p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
