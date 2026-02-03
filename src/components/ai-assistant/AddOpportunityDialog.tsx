import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OpportunityProject } from "@/hooks/useOpportunityProjects";
import { ClientOpportunity } from "@/components/ai-assistant/OpportunityCard";

interface AddOpportunityDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: {
    project_id: string;
    client_name: string;
    opportunity_type: string;
    current_value: number;
    potential_revenue: number;
    confidence: number;
    reasoning: string;
    suggested_action: string;
  }) => void;
  projects: OpportunityProject[];
  preselectedOpportunity?: ClientOpportunity | null;
  currencySymbol: string;
  isLoading?: boolean;
}

const opportunityTypes = [
  { value: "upsell", label: "Upsell" },
  { value: "cross-sell", label: "Cross-Sell" },
  { value: "migration", label: "Migration" },
  { value: "platform", label: "Platform Consolidation" },
  { value: "at-risk", label: "At-Risk Retention" },
];

const AddOpportunityDialog = ({
  isOpen,
  onClose,
  onAdd,
  projects,
  preselectedOpportunity,
  currencySymbol,
  isLoading,
}: AddOpportunityDialogProps) => {
  const [projectId, setProjectId] = useState("");
  const [clientName, setClientName] = useState(preselectedOpportunity?.clientName || "");
  const [opportunityType, setOpportunityType] = useState<string>(preselectedOpportunity?.opportunityType || "upsell");
  const [currentValue, setCurrentValue] = useState(preselectedOpportunity?.currentValue?.toString() || "");
  const [potentialRevenue, setPotentialRevenue] = useState(preselectedOpportunity?.potentialRevenue?.toString() || "");
  const [confidence, setConfidence] = useState([preselectedOpportunity?.confidence || 50]);
  const [reasoning, setReasoning] = useState(preselectedOpportunity?.reasoning || "");
  const [suggestedAction, setSuggestedAction] = useState(preselectedOpportunity?.suggestedAction || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      project_id: projectId,
      client_name: clientName,
      opportunity_type: opportunityType,
      current_value: parseFloat(currentValue) || 0,
      potential_revenue: parseFloat(potentialRevenue) || 0,
      confidence: confidence[0],
      reasoning,
      suggested_action: suggestedAction,
    });
    resetForm();
  };

  const resetForm = () => {
    setProjectId("");
    setClientName("");
    setOpportunityType("upsell");
    setCurrentValue("");
    setPotentialRevenue("");
    setConfidence([50]);
    setReasoning("");
    setSuggestedAction("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-slate-900 border-white/10 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Opportunity to Project</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Project Selection */}
          <div className="space-y-2">
            <Label>Select Project</Label>
            <Select value={projectId} onValueChange={setProjectId} required>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Choose a project..." />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Client Name */}
          <div className="space-y-2">
            <Label htmlFor="clientName">Client Name</Label>
            <Input
              id="clientName"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="e.g., John Smith"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
              required
            />
          </div>

          {/* Opportunity Type */}
          <div className="space-y-2">
            <Label>Opportunity Type</Label>
            <Select value={opportunityType} onValueChange={setOpportunityType}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {opportunityTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Values */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentValue">Current Value</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">
                  {currencySymbol}
                </span>
                <Input
                  id="currentValue"
                  type="number"
                  value={currentValue}
                  onChange={(e) => setCurrentValue(e.target.value)}
                  placeholder="0"
                  className="bg-white/5 border-white/10 text-white pl-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="potentialRevenue">Potential Revenue</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">
                  {currencySymbol}
                </span>
                <Input
                  id="potentialRevenue"
                  type="number"
                  value={potentialRevenue}
                  onChange={(e) => setPotentialRevenue(e.target.value)}
                  placeholder="0"
                  className="bg-white/5 border-white/10 text-white pl-8"
                />
              </div>
            </div>
          </div>

          {/* Confidence */}
          <div className="space-y-3">
            <Label>Confidence: {confidence[0]}%</Label>
            <Slider
              value={confidence}
              onValueChange={setConfidence}
              min={10}
              max={100}
              step={5}
              className="w-full"
            />
          </div>

          {/* Reasoning */}
          <div className="space-y-2">
            <Label htmlFor="reasoning">Reasoning</Label>
            <Textarea
              id="reasoning"
              value={reasoning}
              onChange={(e) => setReasoning(e.target.value)}
              placeholder="Why is this an opportunity..."
              className="bg-white/5 border-white/10 text-white placeholder:text-white/40 min-h-[60px]"
            />
          </div>

          {/* Suggested Action */}
          <div className="space-y-2">
            <Label htmlFor="action">Suggested Action</Label>
            <Input
              id="action"
              value={suggestedAction}
              onChange={(e) => setSuggestedAction(e.target.value)}
              placeholder="e.g., Schedule review meeting"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} className="text-white/70">
              Cancel
            </Button>
            <Button type="submit" disabled={!projectId || !clientName || isLoading}>
              {isLoading ? "Adding..." : "Add to Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddOpportunityDialog;
