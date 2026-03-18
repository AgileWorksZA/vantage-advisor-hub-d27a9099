import { useState, useMemo } from "react";
import { useParams } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft, ChevronRight, ChevronFirst, ChevronLast,
  Loader2, Plus, Search, ListTodo, Clock, AlertTriangle, CheckCircle2,
} from "lucide-react";
import { useClientWorkflows } from "@/hooks/useClientWorkflows";
import { CreateClientWorkflowDialog } from "./workflows/CreateClientWorkflowDialog";
import { CreateAdviceWorkflowDialog } from "./workflows/CreateAdviceWorkflowDialog";
import { isBefore, startOfDay, format } from "date-fns";

const statusBadgeColors: Record<string, string> = {
  Active: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
  Open: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
  Complete: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
  Inactive: "bg-muted text-muted-foreground",
  Cancelled: "bg-destructive/10 text-destructive",
};

const ClientWorkflowsTab = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [workflowPage, setWorkflowPage] = useState(1);
  const [advicePage, setAdvicePage] = useState(1);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [adviceDialogOpen, setAdviceDialogOpen] = useState(false);

  const {
    workflows, adviceWorkflows, workflowCount, adviceCount,
    loading, createWorkflow, updateWorkflowStatus, createAdviceWorkflow,
  } = useClientWorkflows(clientId || "");

  // Stats computation
  const stats = useMemo(() => {
    const today = startOfDay(new Date());
    const todayStr = format(today, "dd MMM yyyy");
    const open = workflows.filter(w => !["Complete", "Cancelled"].includes(w.status));
    const overdue = open.filter(w => {
      if (!w.endDate || w.endDate === "-") return false;
      try { return isBefore(new Date(w.endDate), today); } catch { return false; }
    });
    const dueToday = open.filter(w => w.endDate === todayStr);
    const completed = workflows.filter(w => w.status === "Complete");
    return { totalOpen: open.length, dueToday: dueToday.length, overdue: overdue.length, completed: completed.length };
  }, [workflows]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const filteredWorkflows = workflows.filter(w => {
    const matchesSearch = !searchQuery || w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.service.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || w.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const workflowPages = Math.ceil(filteredWorkflows.length / 20) || 1;
  const paginatedWorkflows = filteredWorkflows.slice((workflowPage - 1) * 20, workflowPage * 20);
  const advicePages = Math.ceil(adviceCount / 20) || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-end">
        <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-3.5 w-3.5" /> New Workflow
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <ListTodo className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Open</p>
                <p className="text-2xl font-bold">{stats.totalOpen}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 rounded-full">
                <Clock className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Due Today</p>
                <p className="text-2xl font-bold">{stats.dueToday}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-destructive/10 rounded-full">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold">{stats.overdue}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-full">
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overview Table */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search workflows..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Complete">Complete</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Service</TableHead>
                <TableHead className="text-xs">Name</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">Adviser</TableHead>
                <TableHead className="text-xs">End Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedWorkflows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No workflows found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedWorkflows.map(w => (
                  <TableRow key={w.id}>
                    <TableCell className="text-sm">{w.service}</TableCell>
                    <TableCell className="text-sm font-medium">{w.name}</TableCell>
                    <TableCell className="text-sm">
                      <span className={`px-2 py-1 rounded text-xs ${statusBadgeColors[w.status] || "bg-muted text-muted-foreground"}`}>
                        {w.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{w.adviser}</TableCell>
                    <TableCell className="text-sm">{w.endDate}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <span className="text-sm text-muted-foreground">{filteredWorkflows.length} items, page {workflowPage} of {workflowPages}</span>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={workflowPage === 1} onClick={() => setWorkflowPage(1)}>
                <ChevronFirst className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={workflowPage === 1} onClick={() => setWorkflowPage(p => p - 1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={workflowPage >= workflowPages} onClick={() => setWorkflowPage(p => p + 1)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={workflowPage >= workflowPages} onClick={() => setWorkflowPage(workflowPages)}>
                <ChevronLast className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advice Workflows */}
      <Card>
        <CardHeader className="pb-4 flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Advice Workflows</CardTitle>
          <Button size="sm" variant="outline" onClick={() => setAdviceDialogOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Create Advice Workflow
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">#</TableHead>
                <TableHead className="text-xs">Name</TableHead>
                <TableHead className="text-xs">Current Step</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">Adviser</TableHead>
                <TableHead className="text-xs">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adviceWorkflows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No advice workflows found.
                  </TableCell>
                </TableRow>
              ) : (
                adviceWorkflows.map(aw => (
                  <TableRow key={aw.id}>
                    <TableCell className="text-sm">{aw.id}</TableCell>
                    <TableCell className="text-sm font-medium">{aw.name}</TableCell>
                    <TableCell className="text-sm">{aw.currentStep}</TableCell>
                    <TableCell className="text-sm">
                      <span className={`px-2 py-1 rounded text-xs ${statusBadgeColors[aw.status] || "bg-muted text-muted-foreground"}`}>
                        {aw.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{aw.adviser}</TableCell>
                    <TableCell className="text-sm">{aw.date}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <span className="text-sm text-muted-foreground">{adviceCount} items, page {advicePage} of {advicePages}</span>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={advicePage === 1} onClick={() => setAdvicePage(1)}>
                <ChevronFirst className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={advicePage === 1} onClick={() => setAdvicePage(p => p - 1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={advicePage >= advicePages} onClick={() => setAdvicePage(p => p + 1)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={advicePage >= advicePages} onClick={() => setAdvicePage(advicePages)}>
                <ChevronLast className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreateClientWorkflowDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={data => createWorkflow(data)}
      />
      <CreateAdviceWorkflowDialog
        open={adviceDialogOpen}
        onOpenChange={setAdviceDialogOpen}
        onSubmit={type => createAdviceWorkflow(type)}
      />
    </div>
  );
};

export default ClientWorkflowsTab;
