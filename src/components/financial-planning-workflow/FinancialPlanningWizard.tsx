import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useFinancialPlanningWorkflow } from "@/hooks/useFinancialPlanningWorkflow";
import { useWorkflowAutoSave } from "@/hooks/useWorkflowAutoSave";
import { WorkflowProgressIndicator } from "./WorkflowProgressIndicator";
import { WorkflowNavigation } from "./WorkflowNavigation";
import { Step1ClientIntroduction } from "./steps/Step1ClientIntroduction";
import { Step2GatherInformation } from "./steps/Step2GatherInformation";
import { Step3AnalysePosition } from "./steps/Step3AnalysePosition";
import { Step4PresentRecommendation } from "./steps/Step4PresentRecommendation";
import { Step5ImplementAgreements } from "./steps/Step5ImplementAgreements";
import { Step6CompleteReview } from "./steps/Step6CompleteReview";
import { Loader2 } from "lucide-react";

interface FinancialPlanningWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  clientName: string;
  workflowId?: string;
}

const STEP_TITLES = [
  "Client Introduction",
  "Gather Information",
  "Analyse Position",
  "Present Recommendation",
  "Implement Agreements",
  "Complete & Review",
];

export const FinancialPlanningWizard = ({
  open,
  onOpenChange,
  clientId,
  clientName,
  workflowId: existingWorkflowId,
}: FinancialPlanningWizardProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [workflowId, setWorkflowId] = useState<string | undefined>(existingWorkflowId);
  const [isInitializing, setIsInitializing] = useState(!existingWorkflowId);

  const {
    workflow,
    loading,
    saving,
    createWorkflow,
    updateWorkflow,
    updateCurrentStep,
    markStepComplete,
    completeWorkflow,
  } = useFinancialPlanningWorkflow(clientId, workflowId);

  const handleAutoSave = useCallback(async () => {
    if (workflow) {
      await updateWorkflow({});
    }
  }, [workflow, updateWorkflow]);

  const { lastSaved, isSaving, markDirty, getTimeSinceLastSave } = useWorkflowAutoSave({
    onSave: handleAutoSave,
    enabled: !!workflowId && open,
  });

  // Initialize workflow on first open
  useEffect(() => {
    const initWorkflow = async () => {
      if (open && !existingWorkflowId && !workflowId) {
        setIsInitializing(true);
        const id = await createWorkflow(`Financial Plan - ${clientName}`);
        if (id) {
          setWorkflowId(id);
        }
        setIsInitializing(false);
      }
    };
    initWorkflow();
  }, [open, existingWorkflowId, workflowId, createWorkflow, clientName]);

  // Sync step with workflow
  useEffect(() => {
    if (workflow) {
      setCurrentStep(workflow.current_step);
    }
  }, [workflow]);

  const handleStepChange = async (step: number) => {
    if (step < 1 || step > 6) return;
    setCurrentStep(step);
    await updateCurrentStep(step);
  };

  const handleNext = async () => {
    if (currentStep < 6) {
      await markStepComplete(currentStep);
      await handleStepChange(currentStep + 1);
    }
  };

  const handlePrevious = async () => {
    if (currentStep > 1) {
      await handleStepChange(currentStep - 1);
    }
  };

  const handleSaveAndExit = async () => {
    await updateWorkflow({});
    onOpenChange(false);
  };

  const handleComplete = async () => {
    await markStepComplete(6);
    await completeWorkflow();
    onOpenChange(false);
  };

  const renderStep = () => {
    if (!workflowId) return null;

    switch (currentStep) {
      case 1:
        return <Step1ClientIntroduction clientId={clientId} workflowId={workflowId} onDataChange={markDirty} />;
      case 2:
        return <Step2GatherInformation clientId={clientId} workflowId={workflowId} onDataChange={markDirty} />;
      case 3:
        return <Step3AnalysePosition clientId={clientId} workflowId={workflowId} onDataChange={markDirty} />;
      case 4:
        return <Step4PresentRecommendation clientId={clientId} workflowId={workflowId} onDataChange={markDirty} />;
      case 5:
        return <Step5ImplementAgreements clientId={clientId} workflowId={workflowId} onDataChange={markDirty} />;
      case 6:
        return <Step6CompleteReview clientId={clientId} workflowId={workflowId} onDataChange={markDirty} />;
      default:
        return null;
    }
  };

  const isLoading = loading || isInitializing;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl font-semibold">
            Financial Planning Workflow - {clientName}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <WorkflowProgressIndicator
              currentStep={currentStep}
              stepData={workflow?.step_data}
              stepTitles={STEP_TITLES}
              onStepClick={handleStepChange}
            />

            <div className="flex-1 overflow-y-auto py-4 min-h-0">
              {renderStep()}
            </div>

            <WorkflowNavigation
              currentStep={currentStep}
              totalSteps={6}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onSaveAndExit={handleSaveAndExit}
              onComplete={handleComplete}
              isSaving={saving || isSaving}
              lastSaved={getTimeSinceLastSave()}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
