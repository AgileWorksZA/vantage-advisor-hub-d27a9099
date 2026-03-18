import { Check } from "lucide-react";
import { format } from "date-fns";

export type MeetingStep = "prep" | "meet" | "outcomes" | "follow-ups";

interface StepConfig {
  key: MeetingStep;
  label: string;
  timestamp: string;
}

interface MeetingProgressBarProps {
  activeStep: MeetingStep;
  onStepClick: (step: MeetingStep) => void;
  startTime: Date;
  endTime: Date;
}

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

export default function MeetingProgressBar({
  activeStep,
  onStepClick,
  startTime,
  endTime,
}: MeetingProgressBarProps) {
  const activeIdx = getStepIndex(activeStep);

  const steps: StepConfig[] = [
    { key: "prep", label: "Prep", timestamp: `T-30min` },
    { key: "meet", label: "Meet", timestamp: format(startTime, "HH:mm") },
    { key: "outcomes", label: "Outcomes", timestamp: format(endTime, "HH:mm") },
    { key: "follow-ups", label: "Follow-ups", timestamp: "Post" },
  ];

  return (
    <div className="flex items-center justify-between px-2 py-3">
      {steps.map((step, idx) => {
        const isCompleted = idx < activeIdx;
        const isActive = idx === activeIdx;
        const isFuture = idx > activeIdx;

        return (
          <div key={step.key} className="flex items-center flex-1 last:flex-none">
            <button
              onClick={() => onStepClick(step.key)}
              className="flex flex-col items-center gap-1 min-w-0"
            >
              {/* Circle */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all
                  ${isCompleted ? "bg-[hsl(180,70%,45%)] text-white" : ""}
                  ${isActive ? "ring-2 ring-[hsl(180,70%,45%)] ring-offset-2 ring-offset-background bg-[hsl(180,70%,45%)]/10 text-[hsl(180,70%,45%)]" : ""}
                  ${isFuture ? "border border-muted-foreground/30 text-muted-foreground/50" : ""}
                `}
              >
                {isCompleted ? <Check className="h-3.5 w-3.5" /> : idx + 1}
              </div>
              <span className={`text-[10px] font-medium leading-tight ${isActive ? "text-[hsl(180,70%,45%)]" : isFuture ? "text-muted-foreground/50" : "text-foreground"}`}>
                {step.label}
              </span>
              <span className="text-[9px] text-muted-foreground">{step.timestamp}</span>
            </button>

            {/* Connector line */}
            {idx < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-1 mt-[-18px] rounded-full ${
                  idx < activeIdx ? "bg-[hsl(180,70%,45%)]" : "bg-muted"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
