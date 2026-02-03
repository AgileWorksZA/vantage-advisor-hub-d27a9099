import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Save, Check, Loader2 } from "lucide-react";

interface WorkflowNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onSaveAndExit: () => void;
  onComplete: () => void;
  isSaving: boolean;
  lastSaved: string | null;
}

export const WorkflowNavigation = ({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onSaveAndExit,
  onComplete,
  isSaving,
  lastSaved,
}: WorkflowNavigationProps) => {
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="flex items-center justify-between pt-4 border-t">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={currentStep === 1}
        className="gap-2"
      >
        <ChevronLeft className="w-4 h-4" />
        Previous
      </Button>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {isSaving ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Saving...</span>
          </>
        ) : lastSaved ? (
          <span>Auto-saved {lastSaved}</span>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onSaveAndExit} className="gap-2">
          <Save className="w-4 h-4" />
          Save & Exit
        </Button>

        {isLastStep ? (
          <Button
            onClick={onComplete}
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            <Check className="w-4 h-4" />
            Complete Workflow
          </Button>
        ) : (
          <Button
            onClick={onNext}
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            Next Step
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
