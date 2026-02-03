import { useState } from "react";
import { ChevronDown, ChevronUp, MoreHorizontal, Users, Target, Calendar, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { OpportunityProject } from "@/hooks/useOpportunityProjects";
import { ProjectOpportunity } from "@/hooks/useProjectOpportunities";
import { ProjectTask } from "@/hooks/useProjectTasks";
import SLAIndicator from "./SLAIndicator";
import ProjectTaskRow from "./ProjectTaskRow";
import { format, parseISO } from "date-fns";

const projectTypeConfig = {
  growth: {
    label: "Growth",
    bg: "bg-emerald-500/20",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
  },
  derisking: {
    label: "De-risking",
    bg: "bg-cyan-500/20",
    text: "text-cyan-400",
    border: "border-cyan-500/30",
  },
  migration: {
    label: "Migration",
    bg: "bg-violet-500/20",
    text: "text-violet-400",
    border: "border-violet-500/30",
  },
  consolidation: {
    label: "Consolidation",
    bg: "bg-orange-500/20",
    text: "text-orange-400",
    border: "border-orange-500/30",
  },
};

interface ProjectCardProps {
  project: OpportunityProject;
  opportunities: ProjectOpportunity[];
  tasks: ProjectTask[];
  onEdit: () => void;
  onDelete: () => void;
  onAddTask: () => void;
  onUpdateTask: (taskId: string, status: string) => void;
  formatCurrency: (value: number) => string;
}

const ProjectCard = ({
  project,
  opportunities,
  tasks,
  onEdit,
  onDelete,
  onAddTask,
  onUpdateTask,
  formatCurrency,
}: ProjectCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const config = projectTypeConfig[project.project_type as keyof typeof projectTypeConfig] || projectTypeConfig.growth;
  const targetRevenue = Number(project.target_revenue) || 0;
  const realizedRevenue = Number(project.realized_revenue) || 0;
  const revenueProgress = targetRevenue > 0 ? Math.round((realizedRevenue / targetRevenue) * 100) : 0;

  const completedTasks = tasks.filter(t => t.status === "Completed").length;
  const totalTasks = tasks.length;
  const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const wonOpportunities = opportunities.filter(o => o.status === "Won").length;
  const totalOpportunities = opportunities.length;

  return (
    <div className={cn(
      "glass-panel rounded-xl border transition-all duration-300",
      config.border,
      isExpanded && "ring-1 ring-white/20"
    )}>
      {/* Header */}
      <div
        className="p-4 cursor-pointer hover:bg-white/5 transition-colors rounded-t-xl"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-white/50 hover:text-white hover:bg-white/10 -ml-1"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-white font-medium">{project.name}</h3>
                <Badge variant="outline" className={cn("text-xs", config.bg, config.text, config.border)}>
                  {config.label}
                </Badge>
                {project.status !== "Active" && (
                  <Badge variant="outline" className="text-xs text-white/50">
                    {project.status}
                  </Badge>
                )}
              </div>
              {project.description && (
                <p className="text-white/50 text-sm mt-1 line-clamp-1">{project.description}</p>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/10">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Project
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2 text-white/60">
            <Users className="w-4 h-4" />
            <span>{totalOpportunities} clients</span>
            {wonOpportunities > 0 && (
              <span className="text-emerald-400">({wonOpportunities} won)</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-white/60">
            <Target className="w-4 h-4" />
            <span>{completedTasks}/{totalTasks} tasks</span>
          </div>
          {project.target_date && (
            <div className="flex items-center gap-2 text-white/60">
              <Calendar className="w-4 h-4" />
              <span>{format(parseISO(project.target_date), "d MMM yyyy")}</span>
            </div>
          )}
        </div>

        {/* Progress Bars */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-white/50">Revenue</span>
              <span className={config.text}>{formatCurrency(realizedRevenue)} / {formatCurrency(targetRevenue)}</span>
            </div>
            <Progress value={revenueProgress} className="h-1.5 bg-white/10" />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-white/50">Tasks</span>
              <span className="text-white/70">{taskProgress}%</span>
            </div>
            <Progress value={taskProgress} className="h-1.5 bg-white/10" />
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-white/10 p-4 space-y-4">
          {/* Opportunities */}
          {opportunities.length > 0 && (
            <div>
              <h4 className="text-white/70 text-sm font-medium mb-2">Opportunities</h4>
              <div className="space-y-2">
                {opportunities.map((opp) => (
                  <div
                    key={opp.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-white/5 text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium",
                        config.bg, config.text
                      )}>
                        {opp.client_name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-medium">{opp.client_name}</p>
                        <p className="text-white/50 text-xs">{opp.opportunity_type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn("font-medium", config.text)}>
                        +{formatCurrency(Number(opp.potential_revenue))}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {opp.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tasks */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-white/70 text-sm font-medium">Tasks</h4>
              <Button
                variant="ghost"
                size="sm"
                className="text-white/50 hover:text-white hover:bg-white/10 h-7 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddTask();
                }}
              >
                + Add Task
              </Button>
            </div>
            {tasks.length > 0 ? (
              <div className="space-y-1">
                {tasks.map((task) => (
                  <ProjectTaskRow
                    key={task.id}
                    task={task}
                    onStatusChange={(status) => onUpdateTask(task.id, status)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-white/40 text-sm text-center py-4">
                No tasks yet. Add a task to get started.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectCard;
