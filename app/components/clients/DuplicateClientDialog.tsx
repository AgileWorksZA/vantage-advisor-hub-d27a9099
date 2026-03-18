import { useNavigate } from "react-router";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

interface DuplicateClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingClient: {
    id: string;
    name: string;
    idNumber: string;
  } | null;
  onCancel: () => void;
  onCloseParentDialog?: () => void;
}

const DuplicateClientDialog = ({
  open,
  onOpenChange,
  existingClient,
  onCancel,
  onCloseParentDialog,
}: DuplicateClientDialogProps) => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    if (existingClient) {
      onOpenChange(false);
      onCloseParentDialog?.();
      navigate(`/clients/${existingClient.id}`);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Duplicate Identification Number Found
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              A client with this identification number already exists in the system.
            </p>
            {existingClient && (
              <div className="bg-muted rounded-md p-3 space-y-1">
                <p className="font-medium text-foreground">
                  Existing Client: {existingClient.name}
                </p>
                <p className="text-sm">
                  ID Number: {existingClient.idNumber}
                </p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleNavigate}
            className="bg-primary hover:bg-primary/90"
          >
            Go to Existing Client
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DuplicateClientDialog;
