import { useState, useEffect } from "react";
import { Plus, Filter, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { OpportunityProject } from "@/hooks/useOpportunityProjects";
import { ProjectOpportunity } from "@/hooks/useProjectOpportunities";
import { ProjectTask } from "@/hooks/useProjectTasks";
import ProjectCard from "./ProjectCard";
import NewOpportunitiesTable from "./NewOpportunitiesTable";

interface OpportunitiesListProps {
  projects: OpportunityProject[];
  opportunities: ProjectOpportunity[];
  tasks: ProjectTask[];
  activeFilter: string | null;
  onCreateProject: () => void;
  onEditProject: (project: OpportunityProject) => void;
  onDeleteProject: (projectId: string) => void;
  onAddTask: (projectId: string) => void;
  onAddClients: (projectId: string, projectType: string, projectName: string) => void;
  onUpdateTask: (taskId: string, status: string) => void;
  formatCurrency: (value: number) => string;
}

const filterOptions = [
  { id: null, label: "All" },
  { id: "growth", label: "Growth" },
  { id: "derisking", label: "De-risking" },
  { id: "migration", label: "Migration" },
  { id: "consolidation", label: "Consolidation" },
];

const statusFilters = [
  { id: "New", label: "New", highlight: true },
  { id: "Active", label: "Active" },
  { id: "Completed", label: "Completed" },
  { id: "On Hold", label: "On Hold" },
];

const OpportunitiesList = ({
  projects,
  opportunities,
  tasks,
  activeFilter,
  onCreateProject,
  onEditProject,
  onDeleteProject,
  onAddTask,
  onAddClients,
  onUpdateTask,
  formatCurrency,
}: OpportunitiesListProps) => {
  const [typeFilter, setTypeFilter] = useState<string | null>(activeFilter);
  const [statusFilter, setStatusFilter] = useState<string>("New");

  // Sync typeFilter with activeFilter prop when it changes
  useEffect(() => {
    setTypeFilter(activeFilter);
  }, [activeFilter]);

  // Filter projects (only for non-New status)
  const filteredProjects = projects.filter((project) => {
    const matchesType = !typeFilter || project.project_type === typeFilter;
    const matchesStatus = project.status === statusFilter;
    return matchesType && matchesStatus;
  });

  // Get opportunities and tasks for a specific project
  const getProjectOpportunities = (projectId: string) =>
    opportunities.filter((o) => o.project_id === projectId);

  const getProjectTasks = (projectId: string) =>
    tasks.filter((t) => t.project_id === projectId);

  // Check if we're showing new opportunities
  const isNewStatus = statusFilter === "New";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-semibold text-white">Opportunities</h2>
          <Badge variant="outline" className="text-white/60 border-white/20">
            {isNewStatus ? "4 types" : filteredProjects.length}
          </Badge>
        </div>
        <Button
          onClick={onCreateProject}
          size="sm"
          className="bg-white/10 hover:bg-white/20 text-white border-0"
        >
          <Plus className="w-4 h-4 mr-1" />
          New Opportunity
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-white/50" />
          <span className="text-sm text-white/50">Type:</span>
          <div className="flex gap-1">
            {filterOptions.map((option) => (
              <Button
                key={option.id || "all"}
                variant="ghost"
                size="sm"
                className={cn(
                  "h-7 text-xs",
                  typeFilter === option.id
                    ? "bg-white/20 text-white"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                )}
                onClick={() => setTypeFilter(option.id)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-white/50">Status:</span>
          <div className="flex gap-1">
            {statusFilters.map((option) => (
              <Button
                key={option.id}
                variant="ghost"
                size="sm"
                className={cn(
                  "h-7 text-xs",
                  statusFilter === option.id
                    ? option.highlight
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      : "bg-white/20 text-white"
                    : option.highlight
                    ? "text-amber-400/70 hover:text-amber-400 hover:bg-amber-500/10"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                )}
                onClick={() => setStatusFilter(option.id)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* New Opportunities Table (when New status is selected) */}
      {isNewStatus && (
        <NewOpportunitiesTable
          formatCurrency={formatCurrency}
          typeFilter={typeFilter}
        />
      )}

      {/* Active/Completed/On Hold Projects List */}
      {!isNewStatus && filteredProjects.length > 0 && (
        <div className="space-y-3">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              opportunities={getProjectOpportunities(project.id)}
              tasks={getProjectTasks(project.id)}
              onEdit={() => onEditProject(project)}
              onDelete={() => onDeleteProject(project.id)}
              onAddTask={() => onAddTask(project.id)}
              onAddClients={() => onAddClients(project.id, project.project_type, project.name)}
              onUpdateTask={onUpdateTask}
              formatCurrency={formatCurrency}
            />
          ))}
        </div>
      )}

      {/* Empty state for Active/Completed/On Hold */}
      {!isNewStatus && filteredProjects.length === 0 && (
        <div className="glass-panel rounded-xl p-8 text-center border border-white/10">
          <Sparkles className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <h3 className="text-white/70 font-medium mb-1">No opportunities found</h3>
          <p className="text-white/40 text-sm mb-4">
            {typeFilter
              ? `No ${typeFilter} opportunities in ${statusFilter.toLowerCase()} status.`
              : `No ${statusFilter.toLowerCase()} opportunities yet. Create one to get started.`}
          </p>
          <Button
            onClick={onCreateProject}
            size="sm"
            className="bg-white/10 hover:bg-white/20 text-white border-0"
          >
            <Plus className="w-4 h-4 mr-1" />
            Create Opportunity
          </Button>
        </div>
      )}
    </div>
  );
};

export default OpportunitiesList;
