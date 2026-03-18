import { useState } from "react";
import { Calendar, Target, Clock } from "lucide-react";
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
import { cn } from "@/lib/utils";

interface CreateProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: {
    name: string;
    description: string;
    project_type: string;
    target_revenue: number;
    target_date: string;
    sla_days: number;
  }) => void;
  defaultType?: string;
  currencySymbol: string;
  isLoading?: boolean;
}

const projectTypes = [
  { id: "growth", label: "Growth", description: "Upsell & cross-sell opportunities", color: "emerald" },
  { id: "derisking", label: "De-risking", description: "Risk mitigation & retention", color: "cyan" },
  { id: "migration", label: "Migration", description: "Platform & portfolio transfers", color: "violet" },
  { id: "consolidation", label: "Consolidation", description: "Multi-platform consolidation", color: "orange" },
];

const CreateProjectDialog = ({
  isOpen,
  onClose,
  onCreate,
  defaultType = "growth",
  currencySymbol,
  isLoading,
}: CreateProjectDialogProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [projectType, setProjectType] = useState(defaultType);
  const [targetRevenue, setTargetRevenue] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [slaDays, setSLADays] = useState([30]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      name,
      description,
      project_type: projectType,
      target_revenue: parseFloat(targetRevenue) || 0,
      target_date: targetDate,
      sla_days: slaDays[0],
    });
    // Reset form
    setName("");
    setDescription("");
    setProjectType(defaultType);
    setTargetRevenue("");
    setTargetDate("");
    setSLADays([30]);
  };

  const colorClasses: Record<string, { bg: string; border: string; text: string }> = {
    emerald: { bg: "bg-emerald-500/20", border: "border-emerald-500", text: "text-emerald-400" },
    cyan: { bg: "bg-cyan-500/20", border: "border-cyan-500", text: "text-cyan-400" },
    violet: { bg: "bg-violet-500/20", border: "border-violet-500", text: "text-violet-400" },
    orange: { bg: "bg-orange-500/20", border: "border-orange-500", text: "text-orange-400" },
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-slate-900 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Q1 Growth Initiative"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
              required
            />
          </div>

          {/* Project Type */}
          <div className="space-y-2">
            <Label>Project Type</Label>
            <div className="grid grid-cols-2 gap-2">
              {projectTypes.map((type) => {
                const colors = colorClasses[type.color];
                const isSelected = projectType === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setProjectType(type.id)}
                    className={cn(
                      "p-3 rounded-lg border text-left transition-all",
                      isSelected
                        ? cn(colors.bg, colors.border, "border-2")
                        : "border-white/10 hover:border-white/30"
                    )}
                  >
                    <p className={cn("font-medium text-sm", isSelected ? colors.text : "text-white")}>
                      {type.label}
                    </p>
                    <p className="text-xs text-white/50 mt-0.5">{type.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of project goals..."
              className="bg-white/5 border-white/10 text-white placeholder:text-white/40 min-h-[80px]"
            />
          </div>

          {/* Target Revenue & Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="revenue" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Target Revenue
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">
                  {currencySymbol}
                </span>
                <Input
                  id="revenue"
                  type="number"
                  value={targetRevenue}
                  onChange={(e) => setTargetRevenue(e.target.value)}
                  placeholder="0"
                  className="bg-white/5 border-white/10 text-white pl-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Target Date
              </Label>
              <Input
                id="date"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>

          {/* SLA Days */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Default SLA: {slaDays[0]} days
            </Label>
            <Slider
              value={slaDays}
              onValueChange={setSLADays}
              min={7}
              max={90}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-white/40">
              Tasks in this project will have a default deadline of {slaDays[0]} days from creation
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} className="text-white/70">
              Cancel
            </Button>
            <Button type="submit" disabled={!name || isLoading}>
              {isLoading ? "Creating..." : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectDialog;
