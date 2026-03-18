import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CreateClientWorkflowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string; service_area: string }) => void;
}

const SERVICE_AREAS = ["General", "Investment", "Insurance", "Retirement", "Tax", "Estate"];

export function CreateClientWorkflowDialog({ open, onOpenChange, onSubmit }: CreateClientWorkflowDialogProps) {
  const [name, setName] = useState("");
  const [serviceArea, setServiceArea] = useState("General");

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), service_area: serviceArea });
    setName("");
    setServiceArea("General");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>New Workflow</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="wf-name">Name</Label>
            <Input id="wf-name" value={name} onChange={e => setName(e.target.value)} placeholder="Workflow name" />
          </div>
          <div className="space-y-2">
            <Label>Service Area</Label>
            <Select value={serviceArea} onValueChange={setServiceArea}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {SERVICE_AREAS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!name.trim()}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
