import { useMemo } from "react";
import {
  format,
  startOfWeek,
  addDays,
  isSameDay,
  isToday,
  setHours,
  setMinutes,
  addHours,
  differenceInMinutes,
  startOfDay,
} from "date-fns";
import { CalendarEvent, CalendarEventType } from "@/hooks/useCalendarEvents";
import { cn } from "@/lib/utils";

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

interface WeekViewProps {
  viewDate: Date;
  events: CalendarEvent[];
  selectedDate?: Date;
  onEventClick: (event: CalendarEvent) => void;
  onDayClick: (day: Date) => void;
  onTimeSlotClick: (day: Date, hour: number) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const HOUR_HEIGHT = 60; // pixels per hour

export function WeekView({
  viewDate,
  events,
  selectedDate,
  onEventClick,
  onDayClick,
  onTimeSlotClick,
}: WeekViewProps) {
  const weekDays = useMemo(() => {
    const weekStart = startOfWeek(viewDate, { weekStartsOn: 0 });
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [viewDate]);

  const getEventsForDay = (day: Date) => {
    return events.filter((event) => isSameDay(event.startTime, day));
  };

  const getEventPosition = (event: CalendarEvent) => {
    const dayStart = startOfDay(event.startTime);
    const startMinutes = differenceInMinutes(event.startTime, dayStart);
    const endMinutes = differenceInMinutes(event.endTime, dayStart);
    const duration = endMinutes - startMinutes;
    
    return {
      top: (startMinutes / 60) * HOUR_HEIGHT,
      height: Math.max((duration / 60) * HOUR_HEIGHT, 24), // Minimum height
    };
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header with day names and dates */}
      <div className="flex border-b border-border sticky top-0 bg-background z-10">
        {/* Time gutter header */}
        <div className="w-16 flex-shrink-0 border-r border-border" />
        
        {/* Day headers */}
        {weekDays.map((day) => {
          const isTodayDate = isToday(day);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          
          return (
            <div
              key={day.toISOString()}
              onClick={() => onDayClick(day)}
              className={cn(
                "flex-1 text-center py-2 cursor-pointer border-r border-border last:border-r-0 hover:bg-muted/50 transition-colors",
                isSelected && "bg-muted/50"
              )}
            >
              <p className="text-xs text-muted-foreground uppercase">{format(day, "EEE")}</p>
              <p
                className={cn(
                  "text-lg font-semibold mt-0.5 w-8 h-8 rounded-full flex items-center justify-center mx-auto",
                  isTodayDate && "bg-[hsl(180,70%,45%)] text-white"
                )}
              >
                {format(day, "d")}
              </p>
            </div>
          );
        })}
      </div>

      {/* Time grid */}
      <div className="flex-1 overflow-auto">
        <div className="flex relative" style={{ minHeight: HOURS.length * HOUR_HEIGHT }}>
          {/* Time gutter */}
          <div className="w-16 flex-shrink-0 border-r border-border sticky left-0 bg-background z-[5]">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="border-b border-border text-right pr-2 text-xs text-muted-foreground"
                style={{ height: HOUR_HEIGHT }}
              >
                <span className="relative -top-2">
                  {hour === 0 ? "" : format(setHours(new Date(), hour), "h a")}
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map((day) => {
            const dayEvents = getEventsForDay(day);
            
            return (
              <div
                key={day.toISOString()}
                className="flex-1 relative border-r border-border last:border-r-0"
              >
                {/* Hour slots */}
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    onClick={() => onTimeSlotClick(day, hour)}
                    className="border-b border-border cursor-pointer hover:bg-muted/30 transition-colors"
                    style={{ height: HOUR_HEIGHT }}
                  />
                ))}

                {/* Events */}
                {dayEvents.map((event) => {
                  if (event.allDay) return null;
                  
                  const position = getEventPosition(event);
                  
                  return (
                    <button
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                      className={cn(
                        "absolute left-1 right-1 rounded px-1 py-0.5 text-xs text-white overflow-hidden text-left",
                        event.color || eventTypeColors[event.eventType]
                      )}
                      style={{
                        top: position.top,
                        height: position.height,
                        zIndex: 1,
                      }}
                    >
                      <p className="font-medium truncate">{event.title}</p>
                      {position.height >= 40 && (
                        <p className="text-white/80 truncate">
                          {format(event.startTime, "h:mm a")}
                        </p>
                      )}
                    </button>
                  );
                })}

                {/* All-day events bar at top */}
                {dayEvents.filter(e => e.allDay).length > 0 && (
                  <div className="absolute top-0 left-0 right-0 bg-muted p-1">
                    {dayEvents.filter(e => e.allDay).map((event) => (
                      <button
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(event);
                        }}
                        className={cn(
                          "w-full rounded px-1 py-0.5 text-xs text-white truncate mb-0.5 text-left",
                          event.color || eventTypeColors[event.eventType]
                        )}
                      >
                        {event.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
