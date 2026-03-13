import { Check } from "lucide-react";
import { format } from "date-fns";

export type MeetingStep = "prep" | "meet" | "outcomes" | "follow-ups";

const STEP_ORDER: MeetingStep[] = ["prep", "meet", "outcomes", "follow-ups"];

function getStepIndex(step: MeetingStep) {
  return STEP_ORDER.indexOf(step);
}

export function getDefaultStep(startTime: Date, endTime: Date): MeetingStep {
  const now = new Date();
  if (now < startTime) return "prep";
  if (now <= endTime) return "meet";
  return "outcomes";
}

interface WebMeetingProgressBarProps {
  activeStep: MeetingStep;
  onStepClick: (step: MeetingStep) => void;
  startTime: Date;
  endTime: Date;
}

export default function WebMeetingProgressBar({
  activeStep,
  onStepClick,
  startTime,
  endTime,
}: WebMeetingProgressBarProps) {
  const activeIdx = getStepIndex(activeStep);

  const steps = [
    { key: "prep" as MeetingStep, label: "Prep", timestamp: "T-30min" },
    { key: "meet" as MeetingStep, label: "Meet", timestamp: format(startTime, "HH:mm") },
    { key: "outcomes" as MeetingStep, label: "Outcomes", timestamp: format(endTime, "HH:mm") },
    { key: "follow-ups" as MeetingStep, label: "Follow-ups", timestamp: "Post" },
  ];

  return (
    <div className="flex items-center justify-between px-4 py-4">
      {steps.map((step, idx) => {
        const isCompleted = idx < activeIdx;
        const isActive = idx === activeIdx;
        const isFuture = idx > activeIdx;

        return (
          <div key={step.key} className="flex items-center flex-1 last:flex-none">
            <button
              onClick={() => onStepClick(step.key)}
              className="flex flex-col items-center gap-1.5 min-w-0"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all
                  ${isCompleted ? "bg-primary text-primary-foreground" : ""}
                  ${isActive ? "ring-2 ring-primary ring-offset-2 ring-offset-background bg-primary/10 text-primary" : ""}
                  ${isFuture ? "border border-muted-foreground/30 text-muted-foreground/50" : ""}
                `}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : idx + 1}
              </div>
              <span className={`text-xs font-medium ${isActive ? "text-primary" : isFuture ? "text-muted-foreground/50" : "text-foreground"}`}>
                {step.label}
              </span>
              <span className="text-[10px] text-muted-foreground">{step.timestamp}</span>
            </button>
            {idx < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 mt-[-20px] rounded-full ${
                  idx < activeIdx ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
