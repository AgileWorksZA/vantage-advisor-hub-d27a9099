import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useRegion } from "@/contexts/RegionContext";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Mail,
  CalendarIcon,
  ListTodo,
  LineChart,
  Building2,
  Plus,
  BarChart3,
  Table as TableIcon,
  TrendingUp,
  Columns3,
} from "lucide-react";
import commandCenterIcon from "@/assets/command-center-icon.png";
import vantageLogo from "@/assets/vantage-logo.png";
import { AppHeader } from "@/components/layout/AppHeader";
import { useTasksEnhanced, TaskFilters, EnhancedTask } from "@/hooks/useTasksEnhanced";
import { TaskDashboard } from "@/components/tasks/TaskDashboard";
import { TaskTable } from "@/components/tasks/TaskTable";
import { TaskFilters as TaskFiltersComponent } from "@/components/tasks/TaskFilters";
import { TaskDetailSheet } from "@/components/tasks/TaskDetailSheet";
import { CreateTaskDialog } from "@/components/tasks/CreateTaskDialog";
import { TaskAnalyticsTab } from "@/components/tasks/TaskAnalyticsTab";
import TaskKanbanBoard, { KanbanGroupBy } from "@/components/tasks/TaskKanbanBoard";
import GlobalAIChat from "@/components/ai-assistant/GlobalAIChat";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dash", path: "/dashboard" },
  { icon: Users, label: "Clients", path: "/clients" },
  { icon: LineChart, label: "Portfolio", path: "/portfolio" },
  { icon: Mail, label: "Message", path: "/email" },
  { icon: CalendarIcon, label: "Calendar", path: "/calendar" },
  { icon: ListTodo, label: "Tasks", path: "/tasks" },
  { icon: Briefcase, label: "Insights", path: "/insights" },
  { icon: Building2, label: "Practice", path: "/practice" },
];

const Tasks = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Read URL params for deep-linking from onboarding widget
  const urlTaskType = searchParams.get("taskType");
  const urlStatus = searchParams.get("status");
  const urlDueBucket = searchParams.get("dueBucket");

  const [view, setView] = useState<"dashboard" | "analytics" | "detail" | "kanban">(() => {
    if (urlTaskType || searchParams.get("view") === "detail") return "detail";
    if (searchParams.get("view") === "analytics") return "analytics";
    if (searchParams.get("view") === "kanban") return "kanban";
    return "dashboard";
  });

  // Detail/Overview filters - only used for the Overview table, NOT for the dashboard
  const [filters, setFilters] = useState<TaskFilters>(() => {
    const initial: TaskFilters = {};
    if (urlTaskType) initial.taskType = [urlTaskType];
    if (urlStatus) initial.status = [urlStatus];
    if (urlDueBucket) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split("T")[0];

      switch (urlDueBucket) {
        case "today":
          initial.dueDateFrom = todayStr;
          initial.dueDateTo = todayStr;
          break;
        case "lt7days": {
          const d = new Date(today);
          d.setDate(d.getDate() + 7);
          initial.dueDateFrom = todayStr;
          initial.dueDateTo = d.toISOString().split("T")[0];
          break;
        }
        case "lt14days": {
          const d1 = new Date(today);
          d1.setDate(d1.getDate() + 8);
          const d2 = new Date(today);
          d2.setDate(d2.getDate() + 14);
          initial.dueDateFrom = d1.toISOString().split("T")[0];
          initial.dueDateTo = d2.toISOString().split("T")[0];
          break;
        }
        case "lt1month": {
          const d1 = new Date(today);
          d1.setDate(d1.getDate() + 15);
          const d2 = new Date(today);
          d2.setDate(d2.getDate() + 30);
          initial.dueDateFrom = d1.toISOString().split("T")[0];
          initial.dueDateTo = d2.toISOString().split("T")[0];
          break;
        }
        case "gte1month": {
          const d = new Date(today);
          d.setDate(d.getDate() + 31);
          initial.dueDateFrom = d.toISOString().split("T")[0];
          break;
        }
      }
    }
    return initial;
  });
  const [selectedTask, setSelectedTask] = useState<EnhancedTask | null>(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [kanbanGroupBy, setKanbanGroupBy] = useState<KanbanGroupBy>("none");

  // Fetch ALL tasks (no filters) - dashboard & analytics always see everything
  const { tasks: allTasks, loading, createTask, updateTask, deleteTask, togglePin, addNote } = useTasksEnhanced();
  const { selectedAdvisors, regionalData } = useRegion();

  // Map selected advisor initials to full names for filtering
  const selectedAdvisorNames = useMemo(() => {
    return regionalData.advisors
      .filter(a => selectedAdvisors.includes(a.initials))
      .map(a => a.name);
  }, [selectedAdvisors, regionalData.advisors]);

  // Filter tasks by selected advisors (global filter for all views)
  const advisorFilteredTasks = useMemo(() => {
    return allTasks.filter(task => {
      if (!task.client_id) return true;
      return task.client_advisor ? selectedAdvisorNames.includes(task.client_advisor) : false;
    });
  }, [allTasks, selectedAdvisorNames]);

  // Apply detail filters client-side for the Overview table only
  const filteredTasks = useMemo(() => {
    let result = advisorFilteredTasks;
    if (filters.status && filters.status.length > 0) {
      result = result.filter(t => filters.status!.includes(t.status));
    }
    if (filters.priority && filters.priority.length > 0) {
      result = result.filter(t => filters.priority!.includes(t.priority));
    }
    if (filters.taskType && filters.taskType.length > 0) {
      result = result.filter(t => filters.taskType!.includes(t.task_type));
    }
    if (filters.category && filters.category.length > 0) {
      result = result.filter(t => filters.category!.includes(t.category || ""));
    }
    if (filters.dueDateFrom) {
      result = result.filter(t => t.due_date && t.due_date >= filters.dueDateFrom!);
    }
    if (filters.dueDateTo) {
      result = result.filter(t => t.due_date && t.due_date <= filters.dueDateTo!);
    }
    if (filters.assignedTo) {
      result = result.filter(t => t.assigned_to_name === filters.assignedTo);
    }
    if (filters.isPinned !== undefined) {
      result = result.filter(t => t.is_pinned === filters.isPinned);
    }
    if (filters.search) {
      const s = filters.search.toLowerCase();
      result = result.filter(t => t.title.toLowerCase().includes(s) || (t.description || "").toLowerCase().includes(s));
    }
    return result;
  }, [advisorFilteredTasks, filters]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const paginatedTasks = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTasks.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTasks, currentPage]);

  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
      if (!session?.user) navigate("/auth");
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
      if (!session?.user) navigate("/auth");
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleViewChange = (newView: "dashboard" | "analytics" | "detail" | "kanban", newFilters?: TaskFilters) => {
    setView(newView);
    setSearchParams(newView === "dashboard" ? {} : { view: newView });
    if (newView === "dashboard") {
      setFilters({});
    } else if (newFilters) {
      setFilters(newFilters);
      setCurrentPage(1);
    }
  };

  const handleTaskClick = (task: EnhancedTask) => {
    setSelectedTask(task);
    setDetailSheetOpen(true);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const userName = user?.user_metadata?.full_name || "Adviser";
  const userEmail = user?.email || "adviser@vantage.co";

  return (
    <div className="h-screen bg-muted/30 flex overflow-hidden">
      <aside className="w-16 bg-[hsl(180,25%,25%)] flex flex-col items-center py-4 gap-1 shrink-0">
        <Button variant="ghost" size="icon" className="w-10 h-10 text-white/80 hover:bg-white/10 mb-4" onClick={() => navigate("/command-center")} title="Practice Overview">
          <img src={commandCenterIcon} alt="Command Center" className="w-5 h-5" />
        </Button>
        {sidebarItems.map((item) => (
          <button key={item.label} onClick={() => navigate(item.path)} className={`w-full flex flex-col items-center py-2 text-xs gap-1 ${item.path === "/tasks" ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white/80"}`}>
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </button>
        ))}
        <div className="flex-1" />
        <div className="mb-2 overflow-visible"><img src={vantageLogo} alt="Vantage" className="h-[80px] w-auto object-contain -rotate-90 origin-center" /></div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AppHeader searchPlaceholder="Search tasks..." userName={userName} userEmail={userEmail} onSignOut={handleSignOut} onAccountSettings={() => navigate("/account-settings")} />

        <div className="flex items-center justify-between px-6 py-3 border-b bg-background">
          <div className="flex items-center gap-2">
            <Button variant={view === "dashboard" ? "default" : "outline"} size="sm" onClick={() => handleViewChange("dashboard")} className="gap-2">
              <BarChart3 className="h-4 w-4" />Dashboard
            </Button>
            <Button variant={view === "analytics" ? "default" : "outline"} size="sm" onClick={() => handleViewChange("analytics")} className="gap-2">
              <TrendingUp className="h-4 w-4" />Analytics
            </Button>
            <Button variant={view === "kanban" ? "default" : "outline"} size="sm" onClick={() => handleViewChange("kanban")} className="gap-2">
              <Columns3 className="h-4 w-4" />Kanban
            </Button>
            <Button variant={view === "detail" ? "default" : "outline"} size="sm" onClick={() => handleViewChange("detail")} className="gap-2">
              <TableIcon className="h-4 w-4" />Overview
            </Button>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />New Task
          </Button>
        </div>

        <main className={`flex-1 ${view === "kanban" ? "flex flex-col min-h-0" : "overflow-y-auto"}`}>
          {view === "dashboard" ? (
            <TaskDashboard tasks={advisorFilteredTasks} onViewDetail={(f) => handleViewChange("detail", f)} />
          ) : view === "analytics" ? (
            <TaskAnalyticsTab tasks={advisorFilteredTasks} onDrillDown={(f) => handleViewChange("detail", f)} />
          ) : view === "kanban" ? (
            <div className="flex flex-col flex-1 min-h-0 h-full">
              <div className="flex items-center gap-3 px-6 py-2 border-b bg-background">
                <div className="flex-1 min-w-0">
                  <TaskFiltersComponent filters={filters} onFiltersChange={setFilters} />
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-xs font-medium text-muted-foreground mr-1">Group:</span>
                  {(["none", "assignee", "priority"] as KanbanGroupBy[]).map((g) => (
                    <Button key={g} size="sm" variant={kanbanGroupBy === g ? "default" : "outline"} className="h-7 text-xs" onClick={() => setKanbanGroupBy(g)}>
                      {g === "none" ? "None" : g === "assignee" ? "Assignee" : "Priority"}
                    </Button>
                  ))}
                </div>
              </div>
              <TaskKanbanBoard tasks={filteredTasks} onTaskClick={handleTaskClick} onUpdateTask={updateTask} groupBy={kanbanGroupBy} />
            </div>
          ) : (
            <div className="p-6 space-y-4">
              <TaskFiltersComponent filters={filters} onFiltersChange={setFilters} />
              <TaskTable tasks={paginatedTasks} loading={loading} onTaskClick={handleTaskClick} onTogglePin={(id, isPinned) => togglePin(id, isPinned)} onDeleteTask={deleteTask} selectedTasks={selectedTaskIds} onSelectionChange={setSelectedTaskIds} />
              {totalPages > 1 && (
                <div className="flex items-center justify-between py-4">
                  <p className="text-sm text-muted-foreground">Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredTasks.length)} of {filteredTasks.length} tasks</p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>Previous</Button>
                    <span className="text-sm">Page {currentPage} of {totalPages}</span>
                    <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>Next</Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <TaskDetailSheet task={selectedTask} open={detailSheetOpen} onClose={() => { setDetailSheetOpen(false); setSelectedTask(null); }} onUpdate={updateTask} onDelete={deleteTask} onTogglePin={togglePin} onAddNote={addNote} />
      <CreateTaskDialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} onCreate={createTask} />
      <GlobalAIChat currentPage="tasks" />
    </div>
  );
};

export default Tasks;
