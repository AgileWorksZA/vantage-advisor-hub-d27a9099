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

        <div className="grid gap-3 py-4">
          <Button
            variant="outline"
            className="w-full h-auto p-4 justify-start text-left hover:bg-muted/50 hover:border-primary/50 transition-colors"
            onClick={() => handleChoice("simple")}
          >
            <div className="flex items-center gap-4 w-full">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <ClipboardList className="h-5 w-5 text-primary" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-medium">Load Client Only</span>
                <span className="text-sm text-muted-foreground font-normal">
                  Create the client profile and return to the clients list
                </span>
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="w-full h-auto p-4 justify-start text-left hover:bg-muted/50 hover:border-primary/50 transition-colors"
            onClick={() => handleChoice("advice")}
          >
            <div className="flex items-center gap-4 w-full">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-medium">Start Advice Process</span>
                <span className="text-sm text-muted-foreground font-normal">
                  Create the client and begin the financial planning workflow
                </span>
              </div>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
