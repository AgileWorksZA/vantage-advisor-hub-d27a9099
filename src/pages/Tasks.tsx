import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Filter,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  User,
  MoreHorizontal,
  ChevronDown,
  Users,
  FileText,
  Phone,
  Briefcase,
  Shield,
  X,
} from "lucide-react";
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
import { Separator } from "@/components/ui/separator";

interface Task {
  id: string;
  title: string;
  clientName: string;
  clientId: string;
  taskType: "Client Complaint" | "Follow-up" | "Annual Review" | "Portfolio Review" | "Compliance" | "Onboarding" | "Document Request";
  priority: "High" | "Medium" | "Low";
  status: "Not Started" | "In Progress" | "Pending Client" | "Completed";
  dueDate: Date;
  createdDate: Date;
  assignedTo: { name: string; initials: string };
  description?: string;
  notes?: string[];
}

const teamMembers = [
  { name: "Sarah Johnson", initials: "SJ" },
  { name: "Michael Chen", initials: "MC" },
  { name: "Emma Williams", initials: "EW" },
  { name: "David Thompson", initials: "DT" },
];

const sampleTasks: Task[] = [
  {
    id: "1",
    title: "Resolve fee dispute inquiry",
    clientName: "Robert Mitchell",
    clientId: "c1",
    taskType: "Client Complaint",
    priority: "High",
    status: "In Progress",
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    createdDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    assignedTo: teamMembers[0],
    description: "Client raised concerns about management fees on quarterly statement. Requires detailed fee breakdown and explanation.",
    notes: ["Called client on Monday - left voicemail", "Prepared fee comparison document"],
  },
  {
    id: "2",
    title: "Annual portfolio review meeting",
    clientName: "Jennifer Adams",
    clientId: "c2",
    taskType: "Annual Review",
    priority: "High",
    status: "Not Started",
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    createdDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    assignedTo: teamMembers[1],
    description: "Scheduled annual review to discuss performance and rebalancing strategy.",
  },
  {
    id: "3",
    title: "Service quality escalation",
    clientName: "William Carter",
    clientId: "c3",
    taskType: "Client Complaint",
    priority: "High",
    status: "Pending Client",
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    createdDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    assignedTo: teamMembers[0],
    description: "Client unhappy with response times. Need to schedule call to address concerns.",
  },
  {
    id: "4",
    title: "Investment switch follow-up",
    clientName: "Patricia Brown",
    clientId: "c4",
    taskType: "Follow-up",
    priority: "Medium",
    status: "In Progress",
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    createdDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    assignedTo: teamMembers[2],
    description: "Follow up on recent fund switch to ensure client understands new allocation.",
  },
  {
    id: "5",
    title: "Quarterly compliance audit prep",
    clientName: "N/A - Practice Task",
    clientId: "practice",
    taskType: "Compliance",
    priority: "High",
    status: "Not Started",
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    createdDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    assignedTo: teamMembers[3],
    description: "Prepare documentation for upcoming FSCA compliance audit.",
  },
  {
    id: "6",
    title: "New client onboarding - FICA docs",
    clientName: "Elizabeth Turner",
    clientId: "c5",
    taskType: "Onboarding",
    priority: "Medium",
    status: "Pending Client",
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    createdDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    assignedTo: teamMembers[1],
    description: "Awaiting FICA documentation from new client to complete onboarding.",
  },
  {
    id: "7",
    title: "Risk profile reassessment",
    clientName: "George Henderson",
    clientId: "c6",
    taskType: "Portfolio Review",
    priority: "Low",
    status: "Not Started",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    assignedTo: teamMembers[2],
    description: "Client turned 60 - review and update risk profile accordingly.",
  },
  {
    id: "8",
    title: "Beneficiary update request",
    clientName: "Nancy Phillips",
    clientId: "c7",
    taskType: "Document Request",
    priority: "Medium",
    status: "In Progress",
    dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    createdDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    assignedTo: teamMembers[0],
    description: "Client requested beneficiary changes following recent marriage.",
  },
  {
    id: "9",
    title: "Retirement planning consultation",
    clientName: "Charles Robinson",
    clientId: "c8",
    taskType: "Follow-up",
    priority: "Medium",
    status: "Not Started",
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    createdDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    assignedTo: teamMembers[3],
    description: "Schedule consultation to discuss early retirement options.",
  },
  {
    id: "10",
    title: "Portfolio performance review",
    clientName: "Margaret Davis",
    clientId: "c9",
    taskType: "Portfolio Review",
    priority: "Low",
    status: "Completed",
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    createdDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    assignedTo: teamMembers[1],
    description: "Completed quarterly performance review and sent report to client.",
  },
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
  const [tasks, setTasks] = useState<Task[]>(sampleTasks);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAssignee, setFilterAssignee] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("dueDate");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

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

  // Filter and sort tasks
  const filteredTasks = tasks.filter((task) => {
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

  const handleMarkComplete = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: "Completed" as const } : t))
    );
    if (selectedTask?.id === taskId) {
      setSelectedTask({ ...selectedTask, status: "Completed" });
    }
  };

  const openTaskDetail = (task: Task) => {
    setSelectedTask(task);
    setSheetOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Tasks Dashboard</h1>
                <p className="text-sm text-muted-foreground">Manage and track your practice tasks</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
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
                  <p className="text-3xl font-bold text-destructive">{urgentTasks.length}</p>
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

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks or clients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Select value={filterAssignee} onValueChange={setFilterAssignee}>
                  <SelectTrigger className="w-[160px]">
                    <User className="h-4 w-4 mr-2" />
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
            </div>
          </CardContent>
        </Card>

        {/* Urgent Tasks Section */}
        {urgentTasks.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <h2 className="text-lg font-semibold text-foreground">Urgent Tasks</h2>
              <Badge variant="destructive" className="ml-2">{urgentTasks.length}</Badge>
            </div>
            <div className="grid gap-4">
              {urgentTasks.map((task) => (
                <Card
                  key={task.id}
                  className="border-2 border-destructive/30 bg-destructive/5 hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => openTaskDetail(task)}
                >
                  <CardContent className="p-5">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <Checkbox
                          className="mt-1"
                          checked={task.status === "Completed"}
                          onClick={(e) => e.stopPropagation()}
                          onCheckedChange={() => handleMarkComplete(task.id)}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="destructive" className="text-xs font-bold">
                              URGENT
                            </Badge>
                            <Badge className={`text-xs border ${getTaskTypeColor(task.taskType)}`}>
                              {getTaskTypeIcon(task.taskType)}
                              <span className="ml-1">{task.taskType}</span>
                            </Badge>
                            <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </Badge>
                          </div>
                          <h3 className="font-semibold text-foreground text-lg mb-1">{task.title}</h3>
                          <p className="text-sm text-muted-foreground">{task.clientName}</p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="text-sm">
                          {getDaysOverdue(task) > 0 ? (
                            <span className="text-destructive font-medium">
                              {getDaysOverdue(task)} days overdue
                            </span>
                          ) : (
                            <span className="text-muted-foreground">
                              Open for {getDaysOpen(task)} days
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span className={getDaysOverdue(task) > 0 ? "text-destructive font-medium" : ""}>
                            {formatDate(task.dueDate)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                              {task.assignedTo.initials}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-muted-foreground">{task.assignedTo.name}</span>
                        </div>
                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button size="sm" variant="default" onClick={() => handleMarkComplete(task.id)}>
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Complete
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="outline">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Reassign</DropdownMenuItem>
                              <DropdownMenuItem>Change Due Date</DropdownMenuItem>
                              <DropdownMenuItem>Add Note</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
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
            <FileText className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-foreground">All Tasks</h2>
            <Badge variant="secondary" className="ml-2">{normalTasks.length}</Badge>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {normalTasks.map((task) => (
              <Card
                key={task.id}
                className={`hover:shadow-md transition-all cursor-pointer ${
                  task.status === "Completed" ? "opacity-60" : ""
                }`}
                onClick={() => openTaskDetail(task)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <Checkbox
                      className="mt-1"
                      checked={task.status === "Completed"}
                      onClick={(e) => e.stopPropagation()}
                      onCheckedChange={() => handleMarkComplete(task.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-medium text-foreground truncate ${task.status === "Completed" ? "line-through" : ""}`}>
                        {task.title}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">{task.clientName}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge className={`text-xs border ${getTaskTypeColor(task.taskType)}`}>
                      {getTaskTypeIcon(task.taskType)}
                      <span className="ml-1">{task.taskType}</span>
                    </Badge>
                    <Badge className={`text-xs ${getStatusColor(task.status)}`}>
                      {task.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span className={getDaysOverdue(task) > 0 && task.status !== "Completed" ? "text-destructive" : ""}>
                        {formatDate(task.dueDate)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {task.assignedTo.initials}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {filteredTasks.length === 0 && (
          <Card className="p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No tasks found matching your filters.</p>
          </Card>
        )}
      </main>

      {/* Task Detail Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedTask && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-2 mb-2">
                  {isUrgent(selectedTask) && (
                    <Badge variant="destructive" className="text-xs font-bold">URGENT</Badge>
                  )}
                  <Badge className={`text-xs border ${getTaskTypeColor(selectedTask.taskType)}`}>
                    {selectedTask.taskType}
                  </Badge>
                </div>
                <SheetTitle className="text-xl">{selectedTask.title}</SheetTitle>
                <SheetDescription>{selectedTask.clientName}</SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Status</p>
                    <Badge className={getStatusColor(selectedTask.status)}>{selectedTask.status}</Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Priority</p>
                    <Badge className={getPriorityColor(selectedTask.priority)}>{selectedTask.priority}</Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Due Date</p>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className={getDaysOverdue(selectedTask) > 0 ? "text-destructive font-medium" : "text-foreground"}>
                        {formatDate(selectedTask.dueDate)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Assigned To</p>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {selectedTask.assignedTo.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{selectedTask.assignedTo.name}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {selectedTask.description && (
                  <div>
                    <p className="text-sm font-medium mb-2">Description</p>
                    <p className="text-sm text-muted-foreground">{selectedTask.description}</p>
                  </div>
                )}

                {selectedTask.notes && selectedTask.notes.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Notes</p>
                    <ul className="space-y-2">
                      {selectedTask.notes.map((note, index) => (
                        <li key={index} className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Separator />

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
                      <User className="h-4 w-4 mr-2" />
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
