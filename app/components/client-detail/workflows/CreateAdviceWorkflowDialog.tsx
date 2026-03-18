import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const ADVICE_WORKFLOW_TYPES = [
  "Onboarding",
  "New Product",
  "Annual Reviews",
  "Portfolio Switches",
] as const;

interface CreateAdviceWorkflowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (type: string) => void;
}

export function CreateAdviceWorkflowDialog({ open, onOpenChange, onSubmit }: CreateAdviceWorkflowDialogProps) {
  const [selected, setSelected] = useState<string>(ADVICE_WORKFLOW_TYPES[0]);

  const handleSubmit = () => {
    onSubmit(selected);
    setSelected(ADVICE_WORKFLOW_TYPES[0]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Create Advice Workflow</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-3">
          <Label>Select Type</Label>
          <RadioGroup value={selected} onValueChange={setSelected} className="space-y-2">
            {ADVICE_WORKFLOW_TYPES.map(type => (
              <div key={type} className="flex items-center space-x-2">
                <RadioGroupItem value={type} id={`advice-${type}`} />
                <Label htmlFor={`advice-${type}`} className="font-normal cursor-pointer">{type}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
