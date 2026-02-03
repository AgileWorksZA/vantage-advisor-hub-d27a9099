import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  User as UserIcon,
  MoreHorizontal,
  Users,
  FileText,
  LayoutDashboard,
  Mail,
  CalendarIcon,
  ListTodo,
  LineChart,
  Building2,
} from "lucide-react";
import commandCenterIcon from "@/assets/command-center-icon.png";
import vantageLogo from "@/assets/vantage-logo.png";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRegion } from "@/contexts/RegionContext";
import { TaskData } from "@/data/regionalData";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dash", path: "/dashboard" },
  { icon: Users, label: "Clients", path: "/clients" },
  { icon: Mail, label: "Email", path: "/email" },
  { icon: CalendarIcon, label: "Calendar", path: "/calendar" },
  { icon: ListTodo, label: "Tasks", path: "/tasks" },
  { icon: LineChart, label: "Insights", path: "/insights" },
  { icon: Building2, label: "Practice", path: "/practice" },
];

const getStatusStyle = (status: TaskData["status"]) => {
  switch (status) {
    case "In Progress":
      return "text-blue-600 dark:text-blue-400";
    case "Not Started":
      return "text-muted-foreground";
    case "Completed":
      return "text-emerald-600 dark:text-emerald-400";
    default:
      return "text-muted-foreground";
  }
};

const getDueDateStyle = (dateStr: string, isOverdue?: boolean) => {
  if (isOverdue) {
    return "bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-400 dark:border-pink-800";
  }
  return "bg-muted text-muted-foreground border-border";
};

const Tasks = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [cardFilter, setCardFilter] = useState<string | null>(null);
  
  const { filteredRegionalData } = useRegion();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setAuthLoading(false);
      if (!session?.user) {
        navigate("/auth");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setAuthLoading(false);
      if (!session?.user) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  // Calculate stats from regional data
  const stats = useMemo(() => {
    const tasks = filteredRegionalData.tasks || [];
    const openTasks = tasks.filter(t => t.status !== "Completed");
    const urgentTasks = tasks.filter(t => t.isUrgent && t.status !== "Completed");
    const overdueTasks = tasks.filter(t => t.isOverdue && t.status !== "Completed");
    const completedTasks = tasks.filter(t => t.status === "Completed");
    
    return {
      total: openTasks.length,
      urgent: urgentTasks.length,
      overdue: overdueTasks.length,
      completed: completedTasks.length,
    };
  }, [filteredRegionalData.tasks]);

  // Filter tasks based on card filter and search
  const displayedTasks = useMemo(() => {
    let tasks = filteredRegionalData.tasks || [];
    
    // Apply card filter
    if (cardFilter === 'urgent') {
      tasks = tasks.filter(t => t.isUrgent && t.status !== "Completed");
    } else if (cardFilter === 'overdue') {
      tasks = tasks.filter(t => t.isOverdue && t.status !== "Completed");
    } else if (cardFilter === 'completed') {
      tasks = tasks.filter(t => t.status === "Completed");
    } else if (cardFilter === 'total' || cardFilter === null) {
      // Show all open tasks by default or when "total" is clicked
      tasks = tasks.filter(t => t.status !== "Completed");
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      tasks = tasks.filter(t => 
        t.clientName.toLowerCase().includes(query) ||
        t.title.toLowerCase().includes(query) ||
        t.taskType.toLowerCase().includes(query) ||
        t.id.toLowerCase().includes(query)
      );
    }
    
    return tasks;
  }, [filteredRegionalData.tasks, cardFilter, searchQuery]);

  const handleCardClick = (filter: string) => {
    if (cardFilter === filter) {
      setCardFilter(null); // Toggle off if already selected
    } else {
      setCardFilter(filter);
    }
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
      {/* Sidebar */}
      <aside className="w-16 bg-[hsl(180,25%,25%)] flex flex-col items-center py-4 gap-1 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10 text-white/80 hover:bg-white/10 mb-4"
          onClick={() => navigate("/command-center")}
          title="Practice Overview"
        >
          <img src={commandCenterIcon} alt="Command Center" className="w-5 h-5" />
        </Button>
        {sidebarItems.map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className={`w-full flex flex-col items-center py-2 text-xs gap-1 ${
              item.path === "/tasks"
                ? "bg-white/10 text-white"
                : "text-white/60 hover:bg-white/5 hover:text-white/80"
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </button>
        ))}
        
        {/* Spacer to push logo to bottom */}
        <div className="flex-1" />
        
        {/* VANTAGE Logo - rotated to read bottom to top */}
        <div className="mb-2">
          <img 
            src={vantageLogo} 
            alt="Vantage" 
            className="h-10 object-contain -rotate-90 origin-center"
          />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header - Sticky */}
        <AppHeader
          searchPlaceholder="Search tasks or clients..."
          userName={userName}
          userEmail={userEmail}
          onSignOut={handleSignOut}
          onAccountSettings={() => navigate("/practice")}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-auto">
          {/* Page Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Tasks Dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage and track your practice tasks</p>
          </div>

          {/* Stats Cards - Clickable */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card 
              className={`bg-card cursor-pointer transition-all hover:shadow-md ${cardFilter === 'total' || cardFilter === null ? 'ring-2 ring-primary' : ''}`}
              onClick={() => handleCardClick('total')}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Tasks</p>
                    <p className="text-3xl font-bold text-foreground">{stats.total}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card 
              className={`bg-card border-destructive/30 cursor-pointer transition-all hover:shadow-md ${cardFilter === 'urgent' ? 'ring-2 ring-destructive' : ''}`}
              onClick={() => handleCardClick('urgent')}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Urgent Tasks</p>
                    <p className="text-3xl font-bold text-destructive">{stats.urgent}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-destructive" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card 
              className={`bg-card border-amber-500/30 cursor-pointer transition-all hover:shadow-md ${cardFilter === 'overdue' ? 'ring-2 ring-amber-500' : ''}`}
              onClick={() => handleCardClick('overdue')}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Overdue</p>
                    <p className="text-3xl font-bold text-amber-600">{stats.overdue}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-950/30 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card 
              className={`bg-card border-emerald-500/30 cursor-pointer transition-all hover:shadow-md ${cardFilter === 'completed' ? 'ring-2 ring-emerald-500' : ''}`}
              onClick={() => handleCardClick('completed')}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-3xl font-bold text-emerald-600">{stats.completed}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tasks Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Client</TableHead>
                    <TableHead className="font-semibold">Task Type</TableHead>
                    <TableHead className="font-semibold">Title</TableHead>
                    <TableHead className="font-semibold">Due date</TableHead>
                    <TableHead className="font-semibold">Followup date</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Last comment</TableHead>
                    <TableHead className="font-semibold">Advisor</TableHead>
                    <TableHead className="font-semibold">Task number</TableHead>
                    <TableHead className="font-semibold">Assignee</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedTasks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                        No tasks found
                      </TableCell>
                    </TableRow>
                  ) : (
                    displayedTasks.map((task) => (
                      <TableRow key={task.id} className="hover:bg-muted/30">
                        <TableCell className="text-primary font-medium">{task.clientName}</TableCell>
                        <TableCell>{task.taskType}</TableCell>
                        <TableCell className="max-w-[180px] truncate" title={task.title}>{task.title}</TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={getDueDateStyle(task.dueDate, task.isOverdue)}
                          >
                            {task.dueDate}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{task.followupDate}</TableCell>
                        <TableCell>
                          <span className={getStatusStyle(task.status)}>{task.status}</span>
                        </TableCell>
                        <TableCell className="text-muted-foreground max-w-[150px] truncate" title={task.lastComment}>
                          {task.lastComment || "-"}
                        </TableCell>
                        <TableCell>{task.advisorName}</TableCell>
                        <TableCell className="text-muted-foreground">{task.id}</TableCell>
                        <TableCell>{task.assigneeName}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem>Edit Task</DropdownMenuItem>
                              <DropdownMenuItem>Mark Complete</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Tasks;
