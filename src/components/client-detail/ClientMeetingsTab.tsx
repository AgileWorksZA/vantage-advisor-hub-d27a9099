import { useState, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarDays, Clock, Video, Users, Loader2 } from "lucide-react";
import { format, isAfter, isBefore } from "date-fns";
import { useClientCalendarEvents, ClientCalendarEvent } from "@/hooks/useClientCalendarEvents";
import { useClientMeetingPrep } from "@/hooks/useClientMeetingPrep";
import WebMeetingProgressBar, { getDefaultStep, type MeetingStep } from "./meeting-steps/WebMeetingProgressBar";
import WebPrepStep, { type KeyOutcome } from "./meeting-steps/WebPrepStep";
import WebMeetStep from "./meeting-steps/WebMeetStep";
import WebOutcomesStep from "./meeting-steps/WebOutcomesStep";
import WebFollowUpsStep from "./meeting-steps/WebFollowUpsStep";

function getMeetingStatus(start: Date, end: Date): { label: string; className: string } {
  const now = new Date();
  if (isBefore(now, start)) return { label: "Upcoming", className: "bg-blue-500/10 text-blue-600" };
  if (isAfter(now, end)) return { label: "Past", className: "bg-muted text-muted-foreground" };
  return { label: "Live", className: "bg-emerald-500/10 text-emerald-600" };
}

const ClientMeetingsTab = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const { events, loading } = useClientCalendarEvents(clientId);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<MeetingStep>("prep");
  const [keyOutcomes, setKeyOutcomes] = useState<KeyOutcome[]>([]);
  const [outcomesSeeded, setOutcomesSeeded] = useState(false);

  const selectedEvent = events.find(e => e.id === selectedEventId) || events[0] || null;

  // Auto-select first event
  useMemo(() => {
    if (events.length > 0 && !selectedEventId) {
      setSelectedEventId(events[0].id);
      setActiveStep(getDefaultStep(events[0].startTime, events[0].endTime));
    }
  }, [events, selectedEventId]);

  // Seed outcomes from prep data
  const { opportunities, tasks, documents } = useClientMeetingPrep(selectedEvent?.id ? clientId || null : null);

  useMemo(() => {
    if (outcomesSeeded || !selectedEvent) return;
    const initial: KeyOutcome[] = [];
    opportunities.forEach((o) => {
      initial.push({ id: crypto.randomUUID(), text: `Discuss ${o.opportunityType.toLowerCase()} opportunity`, completed: false, origin: "prep", note: null, transcriptTimestamp: null, transcriptSnippet: null });
    });
    if (tasks.filter(t => t.isOverdue).length > 0) {
      initial.push({ id: crypto.randomUUID(), text: `Address ${tasks.filter(t => t.isOverdue).length} overdue task(s)`, completed: false, origin: "prep", note: null, transcriptTimestamp: null, transcriptSnippet: null });
    }
    if (documents.filter(d => d.status === "Expired").length > 0) {
      initial.push({ id: crypto.randomUUID(), text: "Review expiring documents", completed: false, origin: "prep", note: null, transcriptTimestamp: null, transcriptSnippet: null });
    }
    if (initial.length > 0) {
      setKeyOutcomes(initial);
      setOutcomesSeeded(true);
    }
  }, [opportunities, tasks, documents, outcomesSeeded, selectedEvent]);

  const handleSelectEvent = useCallback((event: ClientCalendarEvent) => {
    setSelectedEventId(event.id);
    setActiveStep(getDefaultStep(event.startTime, event.endTime));
    setKeyOutcomes([]);
    setOutcomesSeeded(false);
  }, []);

  const handleAddOutcome = useCallback((text: string, origin: KeyOutcome["origin"]) => {
    setKeyOutcomes(prev => [...prev, { id: crypto.randomUUID(), text, completed: false, origin, note: null, transcriptTimestamp: null, transcriptSnippet: null }]);
  }, []);

  const handleRemoveOutcome = useCallback((id: string) => {
    setKeyOutcomes(prev => prev.filter(o => o.id !== id));
  }, []);

  const handleToggleOutcome = useCallback((id: string) => {
    setKeyOutcomes(prev => prev.map(o => o.id === id ? { ...o, completed: !o.completed } : o));
  }, []);

  const handleUpdateOutcomeNote = useCallback((id: string, note: string) => {
    setKeyOutcomes(prev => prev.map(o => o.id === id ? { ...o, note } : o));
  }, []);

  const talkingPoints = useMemo(() => {
    const points: string[] = [];
    if (opportunities.length > 0) points.push(`${opportunities[0].opportunityType} opportunity`);
    if (tasks.filter(t => t.isOverdue).length > 0) points.push("Overdue tasks");
    if (documents.filter(d => d.status === "Expired").length > 0) points.push("Expiring documents");
    if (opportunities.length > 1) points.push("Portfolio growth");
    if (points.length === 0) points.push("General check-in", "Portfolio review");
    return points;
  }, [opportunities, tasks, documents]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex gap-4 h-[calc(100vh-280px)] min-h-[500px]">
      {/* Left Panel - Meeting List */}
      <div className="w-72 shrink-0 overflow-hidden">
        <h3 className="text-sm font-semibold text-foreground mb-3">Meetings</h3>
        <ScrollArea className="h-[calc(100%-32px)]">
          <div className="space-y-2 pr-3">
            {events.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <CalendarDays className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">No meetings found</p>
                </CardContent>
              </Card>
            ) : (
              events.map((event) => {
                const status = getMeetingStatus(event.startTime, event.endTime);
                const isSelected = selectedEvent?.id === event.id;
                return (
                  <button
                    key={event.id}
                    onClick={() => handleSelectEvent(event)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card hover:bg-accent/50"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${status.className}`}>
                        {status.label}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {event.eventType}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1 line-clamp-2 break-words">{event.title}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        {format(event.startTime, "dd MMM")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(event.startTime, "HH:mm")} – {format(event.endTime, "HH:mm")}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Right Panel - Meeting Workflow */}
      <div className="flex-1 min-w-0">
        {selectedEvent ? (
          <Card className="h-full flex flex-col">
            {/* Header */}
            <div className="px-4 pt-4 pb-0 border-b border-border">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="text-base font-semibold text-foreground">{selectedEvent.title}</h2>
                  <p className="text-xs text-muted-foreground">
                    {format(selectedEvent.startTime, "EEEE, dd MMMM yyyy")} · {format(selectedEvent.startTime, "HH:mm")} – {format(selectedEvent.endTime, "HH:mm")}
                  </p>
                </div>
                <Badge variant="secondary" className={`${getMeetingStatus(selectedEvent.startTime, selectedEvent.endTime).className}`}>
                  {getMeetingStatus(selectedEvent.startTime, selectedEvent.endTime).label}
                </Badge>
              </div>
              <WebMeetingProgressBar
                activeStep={activeStep}
                onStepClick={setActiveStep}
                startTime={selectedEvent.startTime}
                endTime={selectedEvent.endTime}
              />
            </div>

            {/* Step Content */}
            <ScrollArea className="flex-1 px-4 py-4">
              {activeStep === "prep" && (
                <WebPrepStep
                  clientId={clientId || null}
                  clientName={undefined}
                  keyOutcomes={keyOutcomes}
                  onAddOutcome={(text) => handleAddOutcome(text, "prep")}
                  onRemoveOutcome={handleRemoveOutcome}
                />
              )}
              {activeStep === "meet" && (
                <WebMeetStep
                  startTime={selectedEvent.startTime}
                  endTime={selectedEvent.endTime}
                  talkingPoints={talkingPoints}
                  keyOutcomes={keyOutcomes}
                  onAddOutcome={(text) => handleAddOutcome(text, "meeting")}
                />
              )}
              {activeStep === "outcomes" && (
                <WebOutcomesStep
                  eventId={selectedEvent.id}
                  clientId={clientId || null}
                  keyOutcomes={keyOutcomes}
                  onAddOutcome={(text) => handleAddOutcome(text, "post-meeting")}
                  onToggleOutcome={handleToggleOutcome}
                  onUpdateOutcomeNote={handleUpdateOutcomeNote}
                  setKeyOutcomes={setKeyOutcomes}
                />
              )}
              {activeStep === "follow-ups" && (
                <WebFollowUpsStep
                  eventId={selectedEvent.id}
                  clientId={clientId || null}
                  clientName={undefined}
                  keyOutcomes={keyOutcomes}
                />
              )}
            </ScrollArea>
          </Card>
        ) : (
          <Card className="h-full flex items-center justify-center">
            <div className="text-center space-y-2">
              <Video className="h-10 w-10 text-muted-foreground/30 mx-auto" />
              <p className="text-sm text-muted-foreground">Select a meeting to view details</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ClientMeetingsTab;
