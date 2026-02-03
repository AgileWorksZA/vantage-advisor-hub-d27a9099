import { useState } from "react";
import { Plus, Filter, FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { OpportunityProject } from "@/hooks/useOpportunityProjects";
import { ProjectOpportunity } from "@/hooks/useProjectOpportunities";
import { ProjectTask } from "@/hooks/useProjectTasks";
import ProjectCard from "./ProjectCard";

interface ProjectsListProps {
  projects: OpportunityProject[];
  opportunities: ProjectOpportunity[];
  tasks: ProjectTask[];
  activeFilter: string | null;
  onCreateProject: () => void;
  onEditProject: (project: OpportunityProject) => void;
  onDeleteProject: (projectId: string) => void;
  onAddTask: (projectId: string) => void;
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
  { id: "Active", label: "Active" },
  { id: "Completed", label: "Completed" },
  { id: "On Hold", label: "On Hold" },
];

const ProjectsList = ({
  projects,
  opportunities,
  tasks,
  activeFilter,
  onCreateProject,
  onEditProject,
  onDeleteProject,
  onAddTask,
  onUpdateTask,
  formatCurrency,
}: ProjectsListProps) => {
  const [typeFilter, setTypeFilter] = useState<string | null>(activeFilter);
  const [statusFilter, setStatusFilter] = useState<string>("Active");

  // Filter projects
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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FolderKanban className="w-5 h-5 text-white/70" />
          <h2 className="text-lg font-semibold text-white">Projects</h2>
          <Badge variant="outline" className="text-white/60 border-white/20">
            {filteredProjects.length}
          </Badge>
        </div>
        <Button
          onClick={onCreateProject}
          size="sm"
          className="bg-white/10 hover:bg-white/20 text-white border-0"
        >
          <Plus className="w-4 h-4 mr-1" />
          New Project
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
                    ? "bg-white/20 text-white"
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

      {/* Projects List */}
      {filteredProjects.length > 0 ? (
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
              onUpdateTask={onUpdateTask}
              formatCurrency={formatCurrency}
            />
          ))}
        </div>
      ) : (
        <div className="glass-panel rounded-xl p-8 text-center border border-white/10">
          <FolderKanban className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <h3 className="text-white/70 font-medium mb-1">No projects found</h3>
          <p className="text-white/40 text-sm mb-4">
            {typeFilter
              ? `No ${typeFilter} projects yet. Create one to get started.`
              : "Create a project to start tracking opportunities."}
          </p>
          <Button
            onClick={onCreateProject}
            size="sm"
            className="bg-white/10 hover:bg-white/20 text-white border-0"
          >
            <Plus className="w-4 h-4 mr-1" />
            Create Project
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProjectsList;
