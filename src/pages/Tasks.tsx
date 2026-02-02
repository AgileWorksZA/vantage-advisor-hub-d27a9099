import { useState, useEffect } from "react";
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
  Phone,
  Briefcase,
  Shield,
  X,
  LayoutDashboard,
  Mail,
  CalendarIcon,
  ListTodo,
  LineChart,
  Building2,
  Filter,
  ChevronDown,
  Calendar,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import commandCenterIcon from "@/assets/command-center-icon.png";
import vantageLogo from "@/assets/vantage-logo.png";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTasks, TaskListItem } from "@/hooks/useTasks";

interface Task extends TaskListItem {}

const teamMembers = [
  { name: "Sarah Johnson", initials: "SJ" },
  { name: "Michael Chen", initials: "MC" },
  { name: "Emma Williams", initials: "EW" },
  { name: "David Thompson", initials: "DT" },
];

// Sample tasks removed - now using useTasks hook

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dash", path: "/dashboard" },
  { icon: Users, label: "Clients", path: "/clients" },
  { icon: Mail, label: "Email", path: "/email" },
  { icon: CalendarIcon, label: "Calendar", path: "/calendar" },
  { icon: ListTodo, label: "Tasks", path: "/tasks" },
  { icon: LineChart, label: "Insights", path: "/insights" },
  { icon: Building2, label: "Practice", path: "/practice" },
];

const taskFilterItems = [
  { label: "All Tasks", filter: "all", icon: ListTodo },
  { label: "My Tasks", filter: "my", icon: UserIcon },
  { label: "Urgent", filter: "urgent", icon: AlertTriangle },
  { label: "Overdue", filter: "overdue", icon: Clock },
];

const taskTypeFilters = [
  { label: "Client Complaints", filter: "Client Complaint" },
  { label: "Follow-ups", filter: "Follow-up" },
  { label: "Annual Reviews", filter: "Annual Review" },
  { label: "Portfolio Reviews", filter: "Portfolio Review" },
  { label: "Compliance", filter: "Compliance" },
  { label: "Onboarding", filter: "Onboarding" },
  { label: "Document Requests", filter: "Document Request" },
];

const getTaskTypeIcon = (type: Task["taskType"]) => {
  switch (type) {
    case "Client Complaint":
      return <AlertTriangle className="h-4 w-4" />;
    case "Follow-up":
      return <Phone className="h-4 w-4" />;
    case "Annual Review":
    case "Portfolio Review":
      return <Briefcase className="h-4 w-4" />;
    case "Compliance":
      return <Shield className="h-4 w-4" />;
    case "Onboarding":
      return <Users className="h-4 w-4" />;
    case "Document Request":
      return <FileText className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

const getTaskTypeColor = (type: Task["taskType"]) => {
  switch (type) {
    case "Client Complaint":
      return "bg-destructive/10 text-destructive border-destructive/20";
    case "Follow-up":
      return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800";
    case "Annual Review":
    case "Portfolio Review":
      return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800";
    case "Compliance":
      return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800";
    case "Onboarding":
      return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800";
    case "Document Request":
      return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950/30 dark:text-slate-400 dark:border-slate-800";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const getPriorityColor = (priority: Task["priority"]) => {
  switch (priority) {
    case "High":
      return "bg-destructive text-destructive-foreground";
    case "Medium":
      return "bg-amber-500 text-white";
    case "Low":
      return "bg-muted text-muted-foreground";
  }
};

const getStatusColor = (status: Task["status"]) => {
  switch (status) {
    case "Not Started":
      return "bg-muted text-muted-foreground";
    case "In Progress":
      return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400";
    case "Pending Client":
      return "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400";
    case "Completed":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400";
  }
};

const Tasks = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { tasks, loading: tasksLoading, updateTask, refetch } = useTasks();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAssignee, setFilterAssignee] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("dueDate");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sidebarFilter, setSidebarFilter] = useState<string>("all");
  const [typeFilterOpen, setTypeFilterOpen] = useState(false);

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

  const loading = authLoading || tasksLoading;


  const now = new Date();
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

  const isUrgent = (task: Task) => {
    if (task.status === "Completed") return false;
    return task.taskType === "Client Complaint" || task.createdDate < twoDaysAgo;
  };

  const getDaysOverdue = (task: Task) => {
    const diff = Math.floor((now.getTime() - task.dueDate.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getDaysOpen = (task: Task) => {
    const diff = Math.floor((now.getTime() - task.createdDate.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });
  };

  // Apply sidebar filter first
  const sidebarFilteredTasks = tasks.filter((task) => {
    switch (sidebarFilter) {
      case "my":
        return task.assignedTo.name === "Sarah Johnson"; // Replace with actual current user
      case "urgent":
        return isUrgent(task);
      case "overdue":
        return task.status !== "Completed" && task.dueDate < now;
      default:
        // Check if it's a task type filter
        if (taskTypeFilters.some(t => t.filter === sidebarFilter)) {
          return task.taskType === sidebarFilter;
        }
        return true;
    }
  });

  // Filter and sort tasks
  const filteredTasks = sidebarFilteredTasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.clientName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAssignee = filterAssignee === "all" || task.assignedTo.name === filterAssignee;
    const matchesType = filterType === "all" || task.taskType === filterType;
    return matchesSearch && matchesAssignee && matchesType;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case "dueDate":
        return a.dueDate.getTime() - b.dueDate.getTime();
      case "createdDate":
        return b.createdDate.getTime() - a.createdDate.getTime();
      case "priority":
        const priorityOrder = { High: 0, Medium: 1, Low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      case "client":
        return a.clientName.localeCompare(b.clientName);
      default:
        return 0;
    }
  });

  const urgentTasks = sortedTasks.filter(isUrgent);
  const normalTasks = sortedTasks.filter((task) => !isUrgent(task));
  const completedToday = tasks.filter(
    (t) => t.status === "Completed" && t.dueDate.toDateString() === now.toDateString()
  ).length;
  const overdueTasks = tasks.filter(
    (t) => t.status !== "Completed" && t.dueDate < now
  ).length;

  const handleMarkComplete = async (taskId: string) => {
    await updateTask(taskId, { status: "Completed" });
    if (selectedTask?.id === taskId) {
      setSelectedTask({ ...selectedTask, status: "Completed" });
    }
  };

  const openTaskDetail = (task: Task) => {
    setSelectedTask(task);
    setSheetOpen(true);
  };

  if (loading) {
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
            className="h-4 w-auto -rotate-90 origin-center"
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

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Tasks</p>
                    <p className="text-3xl font-bold text-foreground">{tasks.filter((t) => t.status !== "Completed").length}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-destructive/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Urgent Tasks</p>
                    <p className="text-3xl font-bold text-destructive">{tasks.filter(isUrgent).length}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-destructive" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-amber-500/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Overdue</p>
                    <p className="text-3xl font-bold text-amber-600">{overdueTasks}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-950/30 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-emerald-500/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Completed Today</p>
                    <p className="text-3xl font-bold text-emerald-600">{completedToday}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters Bar */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex flex-wrap gap-2 flex-1">
                  <Select value={filterAssignee} onValueChange={setFilterAssignee}>
                    <SelectTrigger className="w-[160px]">
                      <UserIcon className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Team Members</SelectItem>
                      {teamMembers.map((member) => (
                        <SelectItem key={member.name} value={member.name}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-[160px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Task Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Client Complaint">Client Complaint</SelectItem>
                      <SelectItem value="Follow-up">Follow-up</SelectItem>
                      <SelectItem value="Annual Review">Annual Review</SelectItem>
                      <SelectItem value="Portfolio Review">Portfolio Review</SelectItem>
                      <SelectItem value="Compliance">Compliance</SelectItem>
                      <SelectItem value="Onboarding">Onboarding</SelectItem>
                      <SelectItem value="Document Request">Document Request</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[140px]">
                      <ChevronDown className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dueDate">Due Date</SelectItem>
                      <SelectItem value="createdDate">Created Date</SelectItem>
                      <SelectItem value="priority">Priority</SelectItem>
                      <SelectItem value="client">Client Name</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {sidebarFilter !== "all" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSidebarFilter("all")}
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    Clear Filter
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Urgent Tasks Section */}
          {urgentTasks.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <h2 className="text-lg font-semibold text-foreground">Urgent Tasks</h2>
                <Badge variant="destructive">{urgentTasks.length}</Badge>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {urgentTasks.map((task) => (
                  <Card
                    key={task.id}
                    className="border-2 border-destructive/30 bg-destructive/5 hover:border-destructive/50 transition-colors cursor-pointer"
                    onClick={() => openTaskDetail(task)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <Badge variant="destructive" className="text-xs">URGENT</Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleMarkComplete(task.id); }}>
                              Mark Complete
                            </DropdownMenuItem>
                            <DropdownMenuItem>Reassign</DropdownMenuItem>
                            <DropdownMenuItem>Reschedule</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">{task.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{task.clientName}</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="outline" className={getTaskTypeColor(task.taskType)}>
                          {getTaskTypeIcon(task.taskType)}
                          <span className="ml-1">{task.taskType}</span>
                        </Badge>
                        <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1 text-destructive">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {getDaysOverdue(task) > 0
                              ? `${getDaysOverdue(task)} days overdue`
                              : `Open ${getDaysOpen(task)} days`}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                              {task.assignedTo.initials}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-muted-foreground text-xs">{task.assignedTo.name.split(" ")[0]}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Normal Tasks Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ListTodo className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold text-foreground">All Tasks</h2>
              <Badge variant="secondary">{normalTasks.length}</Badge>
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {normalTasks.map((task) => (
                <Card
                  key={task.id}
                  className="hover:border-primary/30 transition-colors cursor-pointer"
                  onClick={() => openTaskDetail(task)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline" className={getTaskTypeColor(task.taskType)}>
                        {getTaskTypeIcon(task.taskType)}
                        <span className="ml-1 text-xs">{task.taskType}</span>
                      </Badge>
                      <Checkbox
                        checked={task.status === "Completed"}
                        onClick={(e) => e.stopPropagation()}
                        onCheckedChange={() => handleMarkComplete(task.id)}
                      />
                    </div>
                    <h3 className="font-medium text-foreground text-sm mb-1 line-clamp-2">{task.title}</h3>
                    <p className="text-xs text-muted-foreground mb-2">{task.clientName}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(task.dueDate)}</span>
                      </div>
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="text-[10px] bg-muted">
                          {task.assignedTo.initials}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <Badge className={`mt-2 text-xs ${getStatusColor(task.status)}`}>
                      {task.status}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {filteredTasks.length === 0 && (
            <div className="text-center py-12">
              <ListTodo className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No tasks found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or search query</p>
            </div>
          )}
        </main>
      </div>

      {/* Task Detail Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedTask && (
            <>
              <SheetHeader className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  {isUrgent(selectedTask) && (
                    <Badge variant="destructive">URGENT</Badge>
                  )}
                  <Badge className={getPriorityColor(selectedTask.priority)}>
                    {selectedTask.priority}
                  </Badge>
                </div>
                <SheetTitle className="text-xl">{selectedTask.title}</SheetTitle>
                <SheetDescription>{selectedTask.clientName}</SheetDescription>
              </SheetHeader>

              <div className="space-y-6">
                {/* Task Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Status</p>
                    <Badge className={getStatusColor(selectedTask.status)}>
                      {selectedTask.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Type</p>
                    <Badge variant="outline" className={getTaskTypeColor(selectedTask.taskType)}>
                      {getTaskTypeIcon(selectedTask.taskType)}
                      <span className="ml-1">{selectedTask.taskType}</span>
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Due Date</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className={getDaysOverdue(selectedTask) > 0 ? "text-destructive" : ""}>
                        {formatDate(selectedTask.dueDate)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Assigned To</p>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {selectedTask.assignedTo.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span>{selectedTask.assignedTo.name}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Description */}
                {selectedTask.description && (
                  <div>
                    <p className="text-sm font-medium mb-2">Description</p>
                    <p className="text-sm text-muted-foreground">{selectedTask.description}</p>
                  </div>
                )}

                {/* Notes */}
                {selectedTask.notes && selectedTask.notes.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Activity Notes</p>
                    <div className="space-y-2">
                      {selectedTask.notes.map((note, index) => (
                        <div key={index} className="text-sm text-muted-foreground bg-muted p-2 rounded">
                          {note}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <Button
                    className="w-full"
                    onClick={() => handleMarkComplete(selectedTask.id)}
                    disabled={selectedTask.status === "Completed"}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {selectedTask.status === "Completed" ? "Completed" : "Mark as Complete"}
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline">
                      <UserIcon className="h-4 w-4 mr-2" />
                      Reassign
                    </Button>
                    <Button variant="outline">
                      <Calendar className="h-4 w-4 mr-2" />
                      Reschedule
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Tasks;
