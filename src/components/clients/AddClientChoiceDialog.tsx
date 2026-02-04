import { ClipboardList, TrendingUp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AddClientChoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChoiceSelected: (choice: "simple" | "advice") => void;
}

export const AddClientChoiceDialog = ({
  open,
  onOpenChange,
  onChoiceSelected,
}: AddClientChoiceDialogProps) => {
  const handleChoice = (choice: "simple" | "advice") => {
    onOpenChange(false);
    onChoiceSelected(choice);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
          <DialogDescription>
            How would you like to proceed?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <Button
            variant="outline"
            className="w-full h-auto p-4 flex items-start gap-4 hover:bg-muted/50 hover:border-primary/50 transition-colors"
            onClick={() => handleChoice("simple")}
          >
            <ClipboardList className="w-6 h-6 text-[hsl(180,70%,45%)] shrink-0 mt-0.5" />
            <div className="flex flex-col items-start text-left">
              <span className="font-medium">Load Client Only</span>
              <span className="text-sm text-muted-foreground">
                Create the client profile and return to the clients list
              </span>
            </div>
          </Button>

          <Button
            variant="outline"
            className="w-full h-auto p-4 flex items-start gap-4 hover:bg-muted/50 hover:border-primary/50 transition-colors"
            onClick={() => handleChoice("advice")}
          >
            <TrendingUp className="w-6 h-6 text-[hsl(180,70%,45%)] shrink-0 mt-0.5" />
            <div className="flex flex-col items-start text-left">
              <span className="font-medium">Start Advice Process</span>
              <span className="text-sm text-muted-foreground">
                Create the client and begin the financial planning workflow
              </span>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
