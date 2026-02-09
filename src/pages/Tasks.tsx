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

  const [view, setView] = useState<"dashboard" | "detail">(
    searchParams.get("view") === "detail" ? "detail" : "dashboard"
  );
  const [filters, setFilters] = useState<TaskFilters>({});
  const [selectedTask, setSelectedTask] = useState<EnhancedTask | null>(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

  const { tasks: allTasks, stats: rawStats, loading, createTask, updateTask, deleteTask, togglePin, addNote } = useTasksEnhanced(filters);
  const { selectedAdvisors, regionalData } = useRegion();

  // Map selected advisor initials to full names for filtering
  const selectedAdvisorNames = useMemo(() => {
    return regionalData.advisors
      .filter(a => selectedAdvisors.includes(a.initials))
      .map(a => a.name);
  }, [selectedAdvisors, regionalData.advisors]);

  // Filter tasks by selected advisors
  const tasks = useMemo(() => {
    return allTasks.filter(task => {
      // Tasks without a client (practice tasks) are always visible
      if (!task.client_id) return true;
      // Tasks with a client must match a selected advisor
      return task.client_advisor ? selectedAdvisorNames.includes(task.client_advisor) : false;
    });
  }, [allTasks, selectedAdvisorNames]);

  // Recalculate stats from filtered tasks
  const stats = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const s = {
      totalOpen: tasks.filter(t => !["Completed", "Cancelled"].includes(t.status)).length,
      dueToday: tasks.filter(t => t.due_date === today && !["Completed", "Cancelled"].includes(t.status)).length,
      overdue: tasks.filter(t => t.due_date && t.due_date < today && !["Completed", "Cancelled"].includes(t.status)).length,
      completedThisWeek: tasks.filter(t => t.status === "Completed" && t.completed_at && t.completed_at >= weekAgo).length,
      byStatus: {} as Record<string, number>,
      byType: {} as Record<string, number>,
      byPriority: {} as Record<string, number>,
    };
    tasks.forEach(t => {
      s.byStatus[t.status] = (s.byStatus[t.status] || 0) + 1;
      s.byType[t.task_type] = (s.byType[t.task_type] || 0) + 1;
      s.byPriority[t.priority] = (s.byPriority[t.priority] || 0) + 1;
    });
    return s;
  }, [tasks]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const paginatedTasks = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return tasks.slice(startIndex, startIndex + itemsPerPage);
  }, [tasks, currentPage]);

  const totalPages = Math.ceil(tasks.length / itemsPerPage);

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

  const handleViewChange = (newView: "dashboard" | "detail") => {
    setView(newView);
    setSearchParams(newView === "detail" ? { view: "detail" } : {});
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
            <Button variant={view === "detail" ? "default" : "outline"} size="sm" onClick={() => handleViewChange("detail")} className="gap-2">
              <TableIcon className="h-4 w-4" />All Tasks
            </Button>
          </div>
          {view === "detail" && (
            <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />New Task
            </Button>
          )}
        </div>

        <main className="flex-1 overflow-y-auto">
          {view === "dashboard" ? (
            <TaskDashboard stats={stats} onViewDetail={() => handleViewChange("detail")} />
          ) : (
            <div className="p-6 space-y-4">
              <TaskFiltersComponent filters={filters} onFiltersChange={setFilters} />
              <TaskTable tasks={paginatedTasks} loading={loading} onTaskClick={handleTaskClick} onTogglePin={(id, isPinned) => togglePin(id, isPinned)} onDeleteTask={deleteTask} selectedTasks={selectedTaskIds} onSelectionChange={setSelectedTaskIds} />
              {totalPages > 1 && (
                <div className="flex items-center justify-between py-4">
                  <p className="text-sm text-muted-foreground">Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, tasks.length)} of {tasks.length} tasks</p>
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
