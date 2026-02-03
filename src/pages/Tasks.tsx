import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  MoreHorizontal,
  Users,
  Briefcase,
  FileText,
  LayoutDashboard,
  Mail,
  CalendarIcon,
  ListTodo,
  LineChart,
  Building2,
  Search,
  X,
} from "lucide-react";
import { format } from "date-fns";
import commandCenterIcon from "@/assets/command-center-icon.png";
import vantageLogo from "@/assets/vantage-logo.png";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { MultiSelect } from "@/components/ui/multi-select";
import { useRegion } from "@/contexts/RegionContext";
import { TaskData } from "@/data/regionalData";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dash", path: "/dashboard" },
  { icon: Users, label: "Clients", path: "/clients" },
  { icon: Briefcase, label: "Portfolio", path: "/portfolio" },
  { icon: Mail, label: "Email", path: "/email" },
  { icon: CalendarIcon, label: "Calendar", path: "/calendar" },
  { icon: ListTodo, label: "Tasks", path: "/tasks" },
  { icon: LineChart, label: "Insights", path: "/insights" },
  { icon: Building2, label: "Practice", path: "/practice" },
];

const taskTypeOptions = [
  { value: "Access Request", label: "Access Request" },
  { value: "Annuity review", label: "Annuity review" },
  { value: "Claim", label: "Claim" },
  { value: "Client onboarding", label: "Client onboarding" },
  { value: "Client review", label: "Client review" },
  { value: "Compliance", label: "Compliance" },
  { value: "Compliance alert", label: "Compliance alert" },
  { value: "Consent request", label: "Consent request" },
  { value: "Contact request", label: "Contact request" },
  { value: "Contract changes", label: "Contract changes" },
  { value: "Document request", label: "Document request" },
  { value: "Estate administration", label: "Estate administration" },
  { value: "Fee change", label: "Fee change" },
  { value: "Intermediary appointment", label: "Intermediary appointment" },
  { value: "Leads", label: "Leads" },
  { value: "MIS form", label: "MIS form" },
  { value: "New business", label: "New business" },
  { value: "Other", label: "Other" },
  { value: "Personal detail change", label: "Personal detail change" },
  { value: "Planning hub", label: "Planning hub" },
  { value: "Referral Task", label: "Referral Task" },
  { value: "Risk rating", label: "Risk rating" },
  { value: "Transaction Transfer", label: "Transaction Transfer" },
];

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "In Progress", label: "In Progress" },
  { value: "Completed", label: "Completed" },
  { value: "Overdue", label: "Overdue" },
  { value: "Cancelled", label: "Cancelled" },
  { value: "Not Started", label: "Not Started" },
];

const ITEMS_PER_PAGE = 15;

const getStatusStyle = (status: TaskData["status"]) => {
  switch (status) {
    case "In Progress":
      return "text-blue-600 dark:text-blue-400";
    case "Not Started":
      return "text-muted-foreground";
    case "Completed":
      return "text-emerald-600 dark:text-emerald-400";
    case "Overdue":
      return "text-amber-600 dark:text-amber-400";
    case "Cancelled":
      return "text-muted-foreground line-through";
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
  
  // Filter state
  const [tableSearchQuery, setTableSearchQuery] = useState("");
  const [selectedTaskTypes, setSelectedTaskTypes] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  
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
    const openTasks = tasks.filter(t => t.status !== "Completed" && t.status !== "Cancelled");
    const urgentTasks = tasks.filter(t => t.isUrgent && t.status !== "Completed" && t.status !== "Cancelled");
    const overdueTasks = tasks.filter(t => t.isOverdue && t.status !== "Completed" && t.status !== "Cancelled");
    const completedTasks = tasks.filter(t => t.status === "Completed");
    
    return {
      total: openTasks.length,
      urgent: urgentTasks.length,
      overdue: overdueTasks.length,
      completed: completedTasks.length,
    };
  }, [filteredRegionalData.tasks]);

  // Filter tasks based on all filters
  const displayedTasks = useMemo(() => {
    let tasks = filteredRegionalData.tasks || [];
    
    // Apply card filter
    if (cardFilter === 'urgent') {
      tasks = tasks.filter(t => t.isUrgent && t.status !== "Completed" && t.status !== "Cancelled");
    } else if (cardFilter === 'overdue') {
      tasks = tasks.filter(t => t.isOverdue && t.status !== "Completed" && t.status !== "Cancelled");
    } else if (cardFilter === 'completed') {
      tasks = tasks.filter(t => t.status === "Completed");
    } else if (cardFilter === 'total' || cardFilter === null) {
      tasks = tasks.filter(t => t.status !== "Completed" && t.status !== "Cancelled");
    }
    
    // Apply table search filter
    if (tableSearchQuery) {
      const query = tableSearchQuery.toLowerCase();
      tasks = tasks.filter(t => 
        t.clientName.toLowerCase().includes(query) ||
        t.title.toLowerCase().includes(query) ||
        t.taskType.toLowerCase().includes(query) ||
        t.id.toLowerCase().includes(query)
      );
    }
    
    // Apply task type filter
    if (selectedTaskTypes.length > 0) {
      tasks = tasks.filter(t => selectedTaskTypes.includes(t.taskType));
    }
    
    // Apply status filter
    if (selectedStatus !== "all") {
      tasks = tasks.filter(t => t.status === selectedStatus);
    }
    
    // Apply date filter
    if (selectedDate) {
      const dateStr = format(selectedDate, "dd/MM/yyyy");
      tasks = tasks.filter(t => t.dueDate === dateStr);
    }
    
    return tasks;
  }, [filteredRegionalData.tasks, cardFilter, tableSearchQuery, selectedTaskTypes, selectedStatus, selectedDate]);

  // Paginated tasks
  const paginatedTasks = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return displayedTasks.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [displayedTasks, currentPage]);

  const totalPages = Math.ceil(displayedTasks.length / ITEMS_PER_PAGE);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredRegionalData.tasks, cardFilter, tableSearchQuery, selectedTaskTypes, selectedStatus, selectedDate]);

  const handleCardClick = (filter: string) => {
    if (cardFilter === filter) {
      setCardFilter(null);
    } else {
      setCardFilter(filter);
    }
  };

  const clearFilters = () => {
    setTableSearchQuery("");
    setSelectedTaskTypes([]);
    setSelectedStatus("all");
    setSelectedDate(undefined);
  };

  const hasActiveFilters = tableSearchQuery || selectedTaskTypes.length > 0 || selectedStatus !== "all" || selectedDate;

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
        
        <div className="flex-1" />
        
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
        <AppHeader
          searchPlaceholder="Search tasks or clients..."
          userName={userName}
          userEmail={userEmail}
          onSignOut={handleSignOut}
          onAccountSettings={() => navigate("/practice")}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <main className="flex-1 p-6 overflow-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Tasks Dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage and track your practice tasks</p>
          </div>

          {/* Stats Cards */}
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
            <CardContent className="p-4">
              {/* Filter Row */}
              <div className="flex flex-wrap gap-3 mb-4 items-center">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tasks..."
                    value={tableSearchQuery}
                    onChange={(e) => setTableSearchQuery(e.target.value)}
                    className="pl-9 w-[200px]"
                  />
                </div>
                
                {/* Task Type Multi-Select */}
                <MultiSelect
                  options={taskTypeOptions}
                  selected={selectedTaskTypes}
                  onChange={setSelectedTaskTypes}
                  placeholder="Task Type"
                  className="w-[180px]"
                />
                
                {/* Status Dropdown */}
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* Date Picker */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[150px] justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "Due Date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-popover z-50" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                
                {/* Clear Filters */}
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>

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
                  {paginatedTasks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                        No tasks found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedTasks.map((task) => (
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
                            <DropdownMenuContent align="end" className="bg-popover">
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 px-2">
                  <p className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, displayedTasks.length)} of {displayedTasks.length} tasks
                  </p>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Tasks;
