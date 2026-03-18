import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Loader2, Plus, FolderOpen, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { AIOpportunity } from "@/hooks/useAIOpportunities";

interface Project {
  id: string;
  name: string;
  project_type: string;
  status: string;
  target_revenue: number | null;
}

interface AddSelectedToProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToExisting: (projectId: string, opportunities: AIOpportunity[]) => void;
  onCreateNew: () => void;
  selectedOpportunities: AIOpportunity[];
  projects: Project[];
  formatCurrency: (value: number) => string;
  isLoading?: boolean;
}

const projectTypeColors: Record<string, { bg: string; text: string }> = {
  growth: { bg: "bg-emerald-500/20", text: "text-emerald-400" },
  derisking: { bg: "bg-rose-500/20", text: "text-rose-400" },
  migration: { bg: "bg-violet-500/20", text: "text-violet-400" },
  consolidation: { bg: "bg-orange-500/20", text: "text-orange-400" },
};

const AddSelectedToProjectDialog = ({
  isOpen,
  onClose,
  onAddToExisting,
  onCreateNew,
  selectedOpportunities,
  projects,
  formatCurrency,
  isLoading = false,
}: AddSelectedToProjectDialogProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Filter active projects
  const activeProjects = useMemo(() => {
    return projects.filter(
      (p) =>
        p.status === "Active" &&
        (searchTerm === "" ||
          p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [projects, searchTerm]);

  // Calculate totals
  const totalValue = useMemo(() => {
    return selectedOpportunities.reduce((sum, o) => sum + o.potentialRevenue, 0);
  }, [selectedOpportunities]);

  const handleConfirm = () => {
    if (selectedProjectId) {
      onAddToExisting(selectedProjectId, selectedOpportunities);
    }
  };

  const handleClose = () => {
    setSearchTerm("");
    setSelectedProjectId(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg bg-slate-900 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-emerald-400" />
            Add to Project
          </DialogTitle>
          <DialogDescription className="text-white/60">
            Choose a project to add the selected opportunities
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary */}
          <div className="glass-panel rounded-lg p-3 border border-white/10">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">Selected Opportunities</span>
              <span className="text-white font-medium">
                {selectedOpportunities.length} client{selectedOpportunities.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-white/60">Total Potential Value</span>
              <span className="text-emerald-400 font-semibold">
                +{formatCurrency(totalValue)}
              </span>
            </div>
          </div>

          <Separator className="bg-white/10" />

          {/* Search */}
          <div>
            <Label className="text-white/70 text-xs mb-1.5 block">Search Projects</Label>
            <Input
              placeholder="Search by project name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
            />
          </div>

          {/* Projects List */}
          <ScrollArea className="h-[240px]">
            <div className="space-y-2 pr-3">
              {activeProjects.length > 0 ? (
                activeProjects.map((project) => {
                  const colors = projectTypeColors[project.project_type] || projectTypeColors.growth;
                  const isSelected = selectedProjectId === project.id;

                  return (
                    <div
                      key={project.id}
                      onClick={() => setSelectedProjectId(project.id)}
                      className={cn(
                        "p-3 rounded-lg cursor-pointer transition-all duration-200",
                        "border border-white/10 hover:border-white/20",
                        isSelected
                          ? "bg-emerald-500/10 border-emerald-500/30"
                          : "bg-white/5 hover:bg-white/10"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {isSelected && (
                            <Check className="w-4 h-4 text-emerald-400" />
                          )}
                          <span className="text-white font-medium">{project.name}</span>
                        </div>
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-xs font-medium capitalize",
                            colors.bg,
                            colors.text
                          )}
                        >
                          {project.project_type}
                        </span>
                      </div>
                      {project.target_revenue && project.target_revenue > 0 && (
                        <div className="mt-1 text-xs text-white/50">
                          Current target: {formatCurrency(Number(project.target_revenue))}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <FolderOpen className="w-12 h-12 mx-auto text-white/20 mb-3" />
                  <p className="text-white/50 text-sm">
                    {searchTerm
                      ? "No projects match your search"
                      : "No active projects available"}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onCreateNew}
                    className="mt-3 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Create New Project
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Create new project option */}
          {activeProjects.length > 0 && (
            <>
              <Separator className="bg-white/10" />
              <Button
                variant="ghost"
                onClick={onCreateNew}
                className="w-full justify-start text-white/60 hover:text-white hover:bg-white/10"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create a new project instead
              </Button>
            </>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button
            variant="ghost"
            onClick={handleClose}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedProjectId || isLoading}
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add {selectedOpportunities.length} Opportunities
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddSelectedToProjectDialog;
