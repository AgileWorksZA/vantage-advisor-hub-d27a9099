import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepData {
  completed: boolean;
  data?: Record<string, unknown>;
}

interface WorkflowProgressIndicatorProps {
  currentStep: number;
  stepData?: Record<string, StepData>;
  stepTitles: string[];
  onStepClick: (step: number) => void;
}

export const WorkflowProgressIndicator = ({
  currentStep,
  stepData,
  stepTitles,
  onStepClick,
}: WorkflowProgressIndicatorProps) => {
  const isStepComplete = (step: number) => {
    return stepData?.[step]?.completed ?? false;
  };

  const canNavigateToStep = (step: number) => {
    // Can always go back to completed steps or current step
    if (step <= currentStep) return true;
    // Can go to next step if current is complete
    if (step === currentStep + 1 && isStepComplete(currentStep)) return true;
    return false;
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-muted/30 rounded-lg">
      {stepTitles.map((title, index) => {
        const step = index + 1;
        const isComplete = isStepComplete(step);
        const isCurrent = step === currentStep;
        const canNavigate = canNavigateToStep(step);

        return (
          <div key={step} className="flex items-center flex-1">
            <button
              onClick={() => canNavigate && onStepClick(step)}
              disabled={!canNavigate}
              className={cn(
                "flex items-center gap-2 transition-all",
                canNavigate ? "cursor-pointer" : "cursor-not-allowed opacity-50"
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                  isComplete && !isCurrent
                    ? "bg-primary text-primary-foreground"
                    : isCurrent
                    ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {isComplete && !isCurrent ? (
                  <Check className="w-4 h-4" />
                ) : (
                  step
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-medium hidden lg:block",
                  isCurrent ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {title}
              </span>
            </button>
            {step < stepTitles.length && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-2",
                  isComplete ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
