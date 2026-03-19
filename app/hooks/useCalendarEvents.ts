import { useState, useEffect, useCallback } from "react";
import { kapable } from "@/integrations/kapable/client";
import { useKapableAuth } from "@/integrations/kapable/auth-context";
import { toast } from "sonner";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays } from "date-fns";

export type CalendarEventType = 
  | "Meeting" 
  | "Annual Review" 
  | "Portfolio Review" 
  | "Compliance Review"
  | "Reminder" 
  | "Personal" 
  | "Team Event" 
  | "Client Call";

export type CalendarEventStatus = "Scheduled" | "Completed" | "Cancelled";

export interface CalendarEvent {
  id: string;
  userId: string;
  clientId: string | null;
  clientName?: string;
  clientAdvisor?: string;
  title: string;
  description: string | null;
  eventType: CalendarEventType;
  startTime: Date;
  endTime: Date;
  allDay: boolean;
  location: string | null;
  isRecurring: boolean;
  recurrenceRule: string | null;
  reminderMinutes: number | null;
  status: CalendarEventStatus;
  color: string | null;
  attendees: any[];
  timezone: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCalendarEventInput {
  title: string;
  description?: string;
  eventType: CalendarEventType;
  startTime: Date;
  endTime: Date;
  allDay?: boolean;
  location?: string;
  isRecurring?: boolean;
  recurrenceRule?: string;
  reminderMinutes?: number;
  clientId?: string;
  color?: string;
  attendees?: any[];
  timezone?: string;
}

export interface UpdateCalendarEventInput extends Partial<CreateCalendarEventInput> {
  status?: CalendarEventStatus;
}

export const useCalendarEvents = (viewDate: Date = new Date(), viewMode: "month" | "week" | "day" = "month") => {
  const { userId } = useKapableAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate date range based on view mode
  const getDateRange = useCallback(() => {
    if (viewMode === "month") {
      const monthStart = startOfMonth(viewDate);
      const monthEnd = endOfMonth(viewDate);
      // Extend to include full weeks
      return {
        start: startOfWeek(monthStart, { weekStartsOn: 0 }),
        end: endOfWeek(monthEnd, { weekStartsOn: 0 }),
      };
    } else if (viewMode === "week") {
      return {
        start: startOfWeek(viewDate, { weekStartsOn: 0 }),
        end: endOfWeek(viewDate, { weekStartsOn: 0 }),
      };
    } else {
      return {
        start: new Date(viewDate.setHours(0, 0, 0, 0)),
        end: new Date(viewDate.setHours(23, 59, 59, 999)),
      };
    }
  }, [viewDate, viewMode]);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!userId) {
        setEvents([]);
        return;
      }

      const { start, end } = getDateRange();

      const { data, error: fetchError } = await kapable
        .from("calendar_events")
        .select("*")
        .eq("user_id", userId)
        .eq("is_deleted", false)
        .gte("start_time", start.toISOString())
        .lte("end_time", end.toISOString())
        .order("start_time", { ascending: true });

      if (fetchError) throw fetchError;

      const mappedEvents: CalendarEvent[] = (data || []).map((event: any) => ({
        id: event.id,
        userId: event.user_id,
        clientId: event.client_id,
        clientName: event.clients 
          ? `${event.clients.first_name} ${event.clients.surname}`
          : undefined,
        clientAdvisor: event.clients?.advisor || undefined,
        title: event.title,
        description: event.description,
        eventType: event.event_type as CalendarEventType,
        startTime: new Date(event.start_time),
        endTime: new Date(event.end_time),
        allDay: event.all_day,
        location: event.location,
        isRecurring: event.is_recurring,
        recurrenceRule: event.recurrence_rule,
        reminderMinutes: event.reminder_minutes,
        status: event.status as CalendarEventStatus,
        color: event.color,
        attendees: event.attendees || [],
        timezone: event.timezone || null,
        createdAt: new Date(event.created_at),
        updatedAt: new Date(event.updated_at),
      }));

      setEvents(mappedEvents);
    } catch (err) {
      console.error("Error fetching calendar events:", err);
      setError("Failed to load calendar events");
      toast.error("Failed to load calendar events");
    } finally {
      setLoading(false);
    }
  }, [getDateRange]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const createEvent = async (input: CreateCalendarEventInput): Promise<CalendarEvent | null> => {
    try {
      if (!userId) {
        toast.error("You must be logged in to create events");
        return null;
      }

      const { data, error: createError } = await kapable
        .from("calendar_events")
        .insert({
          user_id: userId,
          title: input.title,
          description: input.description || null,
          event_type: input.eventType,
          start_time: input.startTime.toISOString(),
          end_time: input.endTime.toISOString(),
          all_day: input.allDay || false,
          location: input.location || null,
          is_recurring: input.isRecurring || false,
          recurrence_rule: input.recurrenceRule || null,
          reminder_minutes: input.reminderMinutes || null,
          client_id: input.clientId || null,
          color: input.color || null,
          attendees: input.attendees || [],
          timezone: input.timezone || null,
          created_by: userId,
        })
        .select()
        .single();

      if (createError) throw createError;

      toast.success("Event created successfully");
      await fetchEvents();

      return {
        id: data.id,
        userId: data.user_id,
        clientId: data.client_id,
        title: data.title,
        description: data.description,
        eventType: data.event_type as CalendarEventType,
        startTime: new Date(data.start_time),
        endTime: new Date(data.end_time),
        allDay: data.all_day,
        location: data.location,
        isRecurring: data.is_recurring,
        recurrenceRule: data.recurrence_rule,
        reminderMinutes: data.reminder_minutes,
        status: data.status as CalendarEventStatus,
        color: data.color,
        attendees: Array.isArray(data.attendees) ? data.attendees : [],
        timezone: data.timezone || null,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };
    } catch (err) {
      console.error("Error creating event:", err);
      toast.error("Failed to create event");
      return null;
    }
  };

  const updateEvent = async (eventId: string, input: UpdateCalendarEventInput): Promise<boolean> => {
    try {
      const updateData: any = {};
      
      if (input.title !== undefined) updateData.title = input.title;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.eventType !== undefined) updateData.event_type = input.eventType;
      if (input.startTime !== undefined) updateData.start_time = input.startTime.toISOString();
      if (input.endTime !== undefined) updateData.end_time = input.endTime.toISOString();
      if (input.allDay !== undefined) updateData.all_day = input.allDay;
      if (input.location !== undefined) updateData.location = input.location;
      if (input.isRecurring !== undefined) updateData.is_recurring = input.isRecurring;
      if (input.recurrenceRule !== undefined) updateData.recurrence_rule = input.recurrenceRule;
      if (input.reminderMinutes !== undefined) updateData.reminder_minutes = input.reminderMinutes;
      if (input.clientId !== undefined) updateData.client_id = input.clientId;
      if (input.color !== undefined) updateData.color = input.color;
      if (input.attendees !== undefined) updateData.attendees = input.attendees;
      if (input.status !== undefined) updateData.status = input.status;
      if ((input as any).timezone !== undefined) updateData.timezone = (input as any).timezone;

      const { error: updateError } = await kapable
        .from("calendar_events")
        .update(updateData)
        .eq("id", eventId);

      if (updateError) throw updateError;

      toast.success("Event updated successfully");
      await fetchEvents();
      return true;
    } catch (err) {
      console.error("Error updating event:", err);
      toast.error("Failed to update event");
      return false;
    }
  };

  const deleteEvent = async (eventId: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await kapable
        .from("calendar_events")
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq("id", eventId);

      if (deleteError) throw deleteError;

      toast.success("Event deleted successfully");
      await fetchEvents();
      return true;
    } catch (err) {
      console.error("Error deleting event:", err);
      toast.error("Failed to delete event");
      return false;
    }
  };

  return {
    events,
    loading,
    error,
    refetch: fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
  };
};
