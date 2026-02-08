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

interface NavigationWarningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  changeType: "jurisdiction" | "advisor";
  landingPageLabel: string;
}

export function NavigationWarningDialog({
  open,
  onOpenChange,
  onConfirm,
  changeType,
  landingPageLabel,
}: NavigationWarningDialogProps) {
  const changeLabel =
    changeType === "jurisdiction"
      ? "jurisdiction"
      : "advisor selection";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Leave this page?</AlertDialogTitle>
          <AlertDialogDescription>
            Changing your {changeLabel} will discard any unsaved changes on this
            page. You will be returned to the {landingPageLabel} list.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
