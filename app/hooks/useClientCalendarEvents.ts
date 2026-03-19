import { useState, useEffect, useCallback } from "react";
import { kapable } from "@/integrations/kapable/client";

export interface ClientCalendarEvent {
  id: string;
  title: string;
  description: string | null;
  eventType: string;
  startTime: Date;
  endTime: Date;
  location: string | null;
  status: string;
  color: string | null;
  aiPrepNote: string | null;
}

export const useClientCalendarEvents = (clientId: string | undefined) => {
  const [events, setEvents] = useState<ClientCalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    if (!clientId) {
      setEvents([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await kapable
        .from("calendar_events")
        .select("*")
        .eq("client_id", clientId)
        .eq("is_deleted", false)
        .order("start_time", { ascending: false })
        .limit(10);

      if (error) throw error;

      setEvents((data || []).map((e: any) => ({
        id: e.id,
        title: e.title,
        description: e.description,
        eventType: e.event_type,
        startTime: new Date(e.start_time),
        endTime: new Date(e.end_time),
        location: e.location,
        status: e.status,
        color: e.color,
        aiPrepNote: e.ai_prep_note || null,
      })));
    } catch (err) {
      console.error("Error fetching client calendar events:", err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  return { events, loading, refetch: fetchEvents };
};
