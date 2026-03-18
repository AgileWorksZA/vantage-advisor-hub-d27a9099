import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckSquare, Plus, Quote, Loader2, Target, CheckCircle2, TrendingUp } from "lucide-react";
import { AIActionItem, TaggedAction, TaggedOpportunity, AISummary } from "@/hooks/useMeetingRecordings";
import { useTasks } from "@/hooks/useTasks";
import { useToast } from "@/hooks/use-toast";

interface ActionItemsListProps {
  actionItems: AIActionItem[] | null;
  clientId: string | null;
  aiSummary?: AISummary | null;
  onTaskCreated?: () => void;
}

type TaskPriority = "Low" | "Medium" | "High" | "Urgent";
type TaskType = "Client Complaint" | "Follow-up" | "Annual Review" | "Portfolio Review" | "Compliance" | "Onboarding" | "Document Request";

export function ActionItemsList({
  actionItems,
  clientId,
  aiSummary,
  onTaskCreated,
}: ActionItemsListProps) {
  const { createTask, updateTask } = useTasks();
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<AIActionItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createdItems, setCreatedItems] = useState<Set<number>>(new Set());
  
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    priority: "Medium" as TaskPriority,
    taskType: "Follow-up" as TaskType,
    dueDate: "",
  });

  const taggedActions = aiSummary?.tagged_actions || [];
  const taggedOpportunities = aiSummary?.tagged_opportunities || [];
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [creatingOppTask, setCreatingOppTask] = useState<string | null>(null);

  if (!actionItems || actionItems.length === 0) {
    // Still show tagged sections even without new action items
    if (taggedActions.length === 0 && taggedOpportunities.length === 0) {
      return null;
    }
  }

  const handleOpenCreateDialog = (item: AIActionItem, index: number) => {
    setSelectedItem(item);
    setTaskForm({
      title: item.title,
      description: item.description,
      priority: (item.priority as TaskPriority) || "Medium",
      taskType: (item.task_type as TaskType) || "Follow-up",
      dueDate: item.suggested_due_date || "",
    });
    setCreateDialogOpen(true);
  };

  const handleCreateTask = async () => {
    if (!taskForm.title) return;

    setIsCreating(true);
    try {
      await createTask({
        title: taskForm.title,
        description: taskForm.description,
        priority: taskForm.priority,
        task_type: taskForm.taskType,
        due_date: taskForm.dueDate || undefined,
        client_id: clientId || undefined,
      });

      toast({
        title: "Task Created",
        description: "The action item has been added to your tasks",
      });

      // Mark as created
      const itemIndex = actionItems.findIndex(
        (item) => item.title === selectedItem?.title
      );
      if (itemIndex !== -1) {
        setCreatedItems((prev) => new Set([...prev, itemIndex]));
      }

      setCreateDialogOpen(false);
      setSelectedItem(null);
      onTaskCreated?.();
    } catch (error) {
      console.error("Error creating task:", error);
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateAllTasks = async () => {
    setIsCreating(true);
    let created = 0;

    try {
      for (let i = 0; i < actionItems.length; i++) {
        if (createdItems.has(i)) continue;

        const item = actionItems[i];
        await createTask({
          title: item.title,
          description: item.description,
          priority: (item.priority as TaskPriority) || "Medium",
          task_type: (item.task_type as TaskType) || "Follow-up",
          due_date: item.suggested_due_date || undefined,
          client_id: clientId || undefined,
        });
        
        setCreatedItems((prev) => new Set([...prev, i]));
        created++;
      }

      toast({
        title: "Tasks Created",
        description: `${created} action items have been added to your tasks`,
      });
      
      onTaskCreated?.();
    } catch (error) {
      console.error("Error creating tasks:", error);
      toast({
        title: "Error",
        description: "Some tasks failed to create",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "Low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const remainingItems = (actionItems?.length || 0) - createdItems.size;

  const handleUpdateTaggedTask = async (action: TaggedAction) => {
    setUpdatingTaskId(action.task_id);
    try {
      await updateTask(action.task_id, {
        status: action.status_suggestion === "Completed" ? "Completed" : "In Progress",
      } as any);
      toast({ title: "Task Updated", description: `"${action.task_title}" marked as ${action.status_suggestion}` });
    } catch {
      toast({ title: "Error", description: "Failed to update task", variant: "destructive" });
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handleCreateOppTask = async (opp: TaggedOpportunity) => {
    if (!opp.suggested_task) return;
    setCreatingOppTask(opp.opportunity_id || opp.opportunity_name);
    try {
      await createTask({
        title: opp.suggested_task.title,
        priority: opp.suggested_task.priority || "Medium",
        due_date: opp.suggested_task.due_date || undefined,
        client_id: clientId || undefined,
        task_type: "Follow-up",
        description: `Opportunity: ${opp.opportunity_name} — ${opp.outcome}`,
      });
      toast({ title: "Task Created", description: `Follow-up task created for "${opp.opportunity_name}"` });
      onTaskCreated?.();
    } catch {
      toast({ title: "Error", description: "Failed to create task", variant: "destructive" });
    } finally {
      setCreatingOppTask(null);
    }
  };

  return (
    <>
      {/* Suggested Actions - only show if there are action items */}
      {actionItems && actionItems.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckSquare className="w-4 h-4" />
                Suggested Actions
                <Badge variant="secondary" className="ml-1">
                  {remainingItems} remaining
                </Badge>
              </CardTitle>
              {remainingItems > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCreateAllTasks}
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 mr-1" />
                  )}
                  Create All
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {actionItems.map((item, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    createdItems.has(index)
                      ? "bg-muted/50 opacity-60"
                      : "bg-background hover:bg-muted/50"
                  } transition-colors`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={`text-sm font-medium ${createdItems.has(index) ? "line-through" : ""}`}>
                          {item.title}
                        </p>
                        <Badge
                          variant="outline"
                          className={`text-xs ${getPriorityColor(item.priority)}`}
                        >
                          {item.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {item.description}
                      </p>
                      {item.source_quote && (
                        <div className="flex items-start gap-1 text-xs text-muted-foreground italic">
                          <Quote className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-2">"{item.source_quote}"</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-muted-foreground">
                          Due: {item.suggested_due_date || "Not set"}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {item.task_type}
                        </Badge>
                      </div>
                    </div>
                    {!createdItems.has(index) && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenCreateDialog(item, index)}
                        className="flex-shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tagged Outstanding Actions */}
      {taggedActions.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-500" />
              Meeting Outcomes — Outstanding Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {taggedActions.map((action, i) => (
                <div key={i} className="p-3 rounded-lg border bg-background space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{action.task_title}</span>
                    <Badge variant="outline" className="text-xs">{action.status_suggestion}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{action.outcome}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-1"
                    disabled={updatingTaskId === action.task_id}
                    onClick={() => handleUpdateTaggedTask(action)}
                  >
                    {updatingTaskId === action.task_id ? (
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                    )}
                    Mark as {action.status_suggestion}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tagged Opportunities */}
      {taggedOpportunities.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              Meeting Outcomes — Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {taggedOpportunities.map((opp, i) => (
                <div key={i} className="p-3 rounded-lg border bg-background space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{opp.opportunity_name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{opp.outcome}</p>
                  {opp.suggested_task && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-1"
                      disabled={creatingOppTask === (opp.opportunity_id || opp.opportunity_name)}
                      onClick={() => handleCreateOppTask(opp)}
                    >
                      {creatingOppTask === (opp.opportunity_id || opp.opportunity_name) ? (
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      ) : (
                        <Plus className="w-3 h-3 mr-1" />
                      )}
                      Create: {opp.suggested_task.title}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Task Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Task from Action Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="taskTitle">Title</Label>
              <Input
                id="taskTitle"
                value={taskForm.title}
                onChange={(e) =>
                  setTaskForm((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taskDescription">Description</Label>
              <Textarea
                id="taskDescription"
                value={taskForm.description}
                onChange={(e) =>
                  setTaskForm((prev) => ({ ...prev, description: e.target.value }))
                }
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={taskForm.priority}
                  onValueChange={(value) =>
                    setTaskForm((prev) => ({ ...prev, priority: value as TaskPriority }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Task Type</Label>
                <Select
                  value={taskForm.taskType}
                  onValueChange={(value) =>
                    setTaskForm((prev) => ({ ...prev, taskType: value as TaskType }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Follow-up">Follow-up</SelectItem>
                    <SelectItem value="Document Request">Document Request</SelectItem>
                    <SelectItem value="Portfolio Review">Portfolio Review</SelectItem>
                    <SelectItem value="Annual Review">Annual Review</SelectItem>
                    <SelectItem value="Compliance">Compliance</SelectItem>
                    <SelectItem value="Onboarding">Onboarding</SelectItem>
                    <SelectItem value="Client Complaint">Client Complaint</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={taskForm.dueDate}
                onChange={(e) =>
                  setTaskForm((prev) => ({ ...prev, dueDate: e.target.value }))
                }
              />
            </div>

            {selectedItem?.source_quote && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Source Quote:</p>
                <p className="text-sm italic">"{selectedItem.source_quote}"</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateTask}
              disabled={!taskForm.title || isCreating}
              className="bg-[hsl(180,70%,45%)] hover:bg-[hsl(180,70%,40%)]"
            >
              {isCreating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
