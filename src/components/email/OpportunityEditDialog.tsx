import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { opportunityTypeConfig, getOpportunityConfig } from "@/lib/opportunity-detection";
import { getOpportunityPriority } from "@/lib/opportunity-priority";

interface OpportunityEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opportunityType: string;
  sourceText?: string;
  clientName?: string;
}

export const OpportunityEditDialog = ({
  open,
  onOpenChange,
  opportunityType,
  sourceText,
  clientName,
}: OpportunityEditDialogProps) => {
  const [type, setType] = useState(opportunityType);
  const [description, setDescription] = useState(sourceText?.substring(0, 200) || "");
  const [suggestedAction, setSuggestedAction] = useState("");
  const [opportunitySize, setOpportunitySize] = useState("");

  const config = getOpportunityConfig(type);
  const priority = getOpportunityPriority(type);

  const priorityColors: Record<string, string> = {
    urgent: "bg-destructive/10 text-destructive border-destructive/20",
    important: "bg-orange-100 text-orange-700 border-orange-200",
    routine: "bg-muted text-muted-foreground border-border",
  };

  const handleSave = () => {
    toast.success("Opportunity saved", {
      description: `${getOpportunityConfig(type).label} opportunity${clientName ? ` for ${clientName}` : ""} has been noted.`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="shrink-0">{config.icon}</span>
            Edit Opportunity
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {clientName && (
            <div>
              <Label className="text-xs text-muted-foreground">Client</Label>
              <p className="text-sm font-medium">{clientName}</p>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="opp-type">Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="opp-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(opportunityTypeConfig).map(([key, cfg]) => (
                  <SelectItem key={key} value={key}>
                    <span className="flex items-center gap-2">
                      {cfg.icon}
                      {cfg.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`${config.color} text-[10px]`}>{config.label}</Badge>
            <Badge variant="outline" className={`${priorityColors[priority]} text-[10px] capitalize`}>{priority}</Badge>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="opp-desc">Description</Label>
            <Textarea
              id="opp-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe the opportunity..."
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="opp-action">Suggested Action</Label>
            <Input
              id="opp-action"
              value={suggestedAction}
              onChange={(e) => setSuggestedAction(e.target.value)}
              placeholder="e.g. Schedule review meeting"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="opp-size">Estimated Value</Label>
            <Input
              id="opp-size"
              type="number"
              value={opportunitySize}
              onChange={(e) => setOpportunitySize(e.target.value)}
              placeholder="0"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} className="bg-[hsl(var(--primary))] text-primary-foreground">Save Opportunity</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
