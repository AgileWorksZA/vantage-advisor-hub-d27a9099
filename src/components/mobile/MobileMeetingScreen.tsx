import { useState, useMemo } from "react";
import { ArrowLeft, Clock } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { CalendarEvent } from "@/hooks/useCalendarEvents";
import { useClientMeetingPrep } from "@/hooks/useClientMeetingPrep";
import MeetingProgressBar, { getDefaultStep, type MeetingStep } from "./meeting-steps/MeetingProgressBar";
import PrepStep, { type DetailView } from "./meeting-steps/PrepStep";
import MeetStep from "./meeting-steps/MeetStep";
import OutcomesStep from "./meeting-steps/OutcomesStep";
import FollowUpsStep from "./meeting-steps/FollowUpsStep";
import MobileContextDetailView from "./meeting-steps/MobileContextDetailView";

interface MobileMeetingScreenProps {
  event: CalendarEvent;
  onBack: () => void;
}

export default function MobileMeetingScreen({ event, onBack }: MobileMeetingScreenProps) {
  const [activeStep, setActiveStep] = useState<MeetingStep>(
    getDefaultStep(event.startTime, event.endTime)
  );
  const [detailView, setDetailView] = useState<DetailView | null>(null);
  const { toast } = useToast();

  // Derive talking points from prep data
  const { opportunities, tasks, documents } = useClientMeetingPrep(event.clientId);

  const talkingPoints = useMemo(() => {
    const points: string[] = [];
    if (opportunities.length > 0) points.push(`${opportunities[0].opportunityType} opportunity`);
    if (tasks.filter(t => t.isOverdue).length > 0) points.push("Overdue tasks");
    if (documents.filter(d => d.status === "Expired").length > 0) points.push("Expiring documents");
    if (opportunities.length > 1) points.push("Portfolio growth");
    if (points.length === 0) points.push("General check-in", "Portfolio review");
    return points;
  }, [opportunities, tasks, documents]);

  const handleConvertToTask = (title: string, description: string) => {
    toast({
      title: "Task created",
      description: title,
    });
  };

  if (detailView) {
    return (
      <MobileContextDetailView
        view={detailView}
        onBack={() => setDetailView(null)}
        onConvertToTask={handleConvertToTask}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="p-1">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-semibold text-foreground truncate">{event.title}</h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {event.clientName && <span>{event.clientName}</span>}
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {format(event.startTime, "HH:mm")} – {format(event.endTime, "HH:mm")}
              </span>
            </div>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground shrink-0">
            {event.eventType}
          </span>
        </div>

        {/* Progress Bar */}
        <MeetingProgressBar
          activeStep={activeStep}
          onStepClick={setActiveStep}
          startTime={event.startTime}
          endTime={event.endTime}
        />
      </div>

      {/* Step Content */}
      <div className="px-4 pt-4">
        {activeStep === "prep" && (
          <PrepStep
            clientId={event.clientId}
            clientName={event.clientName}
            onTagClick={setDetailView}
            onConvertToTask={handleConvertToTask}
          />
        )}
        {activeStep === "meet" && (
          <MeetStep
            startTime={event.startTime}
            endTime={event.endTime}
            talkingPoints={talkingPoints}
            onConvertToTask={handleConvertToTask}
          />
        )}
        {activeStep === "outcomes" && (
          <OutcomesStep
            eventId={event.id}
            clientId={event.clientId}
            onConvertToTask={handleConvertToTask}
          />
        )}
        {activeStep === "follow-ups" && (
          <FollowUpsStep
            eventId={event.id}
            clientId={event.clientId}
            clientName={event.clientName}
            onConvertToTask={handleConvertToTask}
            onTagClick={setDetailView}
          />
        )}
      </div>
    </div>
  );
}
