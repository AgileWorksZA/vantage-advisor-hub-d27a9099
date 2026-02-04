import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
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
import {
  Pin,
  PinOff,
  Mail,
  Trash2,
  CalendarIcon,
  Plus,
  Send,
  Clock,
  FileText,
  MessageSquare,
  Activity,
  Users,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { EnhancedTask } from "@/hooks/useTasksEnhanced";
import { useTaskTypes } from "@/hooks/useTaskTypes";
import { useTaskClients } from "@/hooks/useTaskClients";
import { useTaskDocuments } from "@/hooks/useTaskDocuments";
import { useTaskCommunications } from "@/hooks/useTaskCommunications";
import { useTaskHistory } from "@/hooks/useTaskHistory";
import { useClients } from "@/hooks/useClients";
import { TaskClientSelector } from "./TaskClientSelector";
import { TaskTimeline } from "./TaskTimeline";
import { ComposeMessageDialog } from "@/components/email/ComposeMessageDialog";

interface TaskDetailSheetProps {
  task: EnhancedTask | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (taskId: string, updates: Partial<EnhancedTask>) => Promise<boolean>;
  onDelete: (taskId: string) => Promise<boolean>;
  onTogglePin: (taskId: string, isPinned: boolean) => void;
  onAddNote: (taskId: string, note: string, isInternal: boolean) => Promise<boolean>;
}

export function TaskDetailSheet({
  task,
  open,
  onClose,
  onUpdate,
  onDelete,
  onTogglePin,
  onAddNote,
}: TaskDetailSheetProps) {
  const { taskTypes, taskStatuses, taskPriorities, taskCategories, taskResolutionTypes, taskSources } = useTaskTypes();
  const { clients } = useClients();
  
  const [editedTask, setEditedTask] = useState<Partial<EnhancedTask>>({});
  const [newNote, setNewNote] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [composeDialogOpen, setComposeDialogOpen] = useState(false);

  // Hooks for related data
  const { taskClients, fetchTaskClients, addClient, removeClient } = useTaskClients(task?.id);
  const { taskDocuments, fetchTaskDocuments } = useTaskDocuments(task?.id);
  const { taskCommunications, fetchTaskCommunications } = useTaskCommunications(task?.id);
  const { history, fetchHistory } = useTaskHistory(task?.id);

  useEffect(() => {
    if (task) {
      setEditedTask({
        title: task.title,
        description: task.description,
        task_type: task.task_type,
        priority: task.priority,
        status: task.status,
        due_date: task.due_date,
        follow_up_date: task.follow_up_date,
        sla_deadline: task.sla_deadline,
        category: task.category,
        subcategory: task.subcategory,
        source: task.source,
        resolution: task.resolution,
        resolution_category: task.resolution_category,
        estimated_hours: task.estimated_hours,
        actual_hours: task.actual_hours,
        tags: task.tags,
      });
      fetchTaskClients();
      fetchTaskDocuments();
      fetchTaskCommunications();
      fetchHistory();
    }
  }, [task?.id]);

  if (!task) return null;

  const handleSave = async () => {
    await onUpdate(task.id, editedTask);
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    const success = await onAddNote(task.id, newNote, isInternalNote);
    if (success) {
      setNewNote("");
    }
  };

  const handleSendMessage = () => {
    setComposeDialogOpen(true);
  };

  const handleDeleteTask = async () => {
    const confirmed = window.confirm("Are you sure you want to delete this task?");
    if (confirmed) {
      const success = await onDelete(task.id);
      if (success) onClose();
    }
  };

  return (
    <Sheet open={open} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-[700px] overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono">
                  #{task.task_number || "—"}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onTogglePin(task.id, task.is_pinned)}
                >
                  {task.is_pinned ? (
                    <Pin className="h-4 w-4 text-primary fill-primary" />
                  ) : (
                    <PinOff className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              <Input
                value={editedTask.title || ""}
                onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                className="text-xl font-semibold border-none p-0 h-auto focus-visible:ring-0"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleSendMessage}>
                <Mail className="h-4 w-4 mr-1" />
                Message
              </Button>
              <Button variant="destructive" size="icon" className="h-8 w-8" onClick={handleDeleteTask}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="w-full grid grid-cols-5">
            <TabsTrigger value="details" className="gap-1">
              <FileText className="h-4 w-4" />
              Details
            </TabsTrigger>
            <TabsTrigger value="clients" className="gap-1">
              <Users className="h-4 w-4" />
              Clients
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-1">
              <Activity className="h-4 w-4" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="documents" className="gap-1">
              <FileText className="h-4 w-4" />
              Docs
            </TabsTrigger>
            <TabsTrigger value="communications" className="gap-1">
              <MessageSquare className="h-4 w-4" />
              Comms
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Status */}
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={editedTask.status}
                  onValueChange={(value) => setEditedTask({ ...editedTask, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {taskStatuses.map((s) => (
                      <SelectItem key={s.code} value={s.code}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={editedTask.priority}
                  onValueChange={(value) => setEditedTask({ ...editedTask, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {taskPriorities.map((p) => (
                      <SelectItem key={p.code} value={p.code}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Type */}
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={editedTask.task_type}
                  onValueChange={(value) => setEditedTask({ ...editedTask, task_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {taskTypes.map((t) => (
                      <SelectItem key={t.code} value={t.code}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label>Category</Label>
              <Select
                  value={editedTask.category || "__none__"}
                  onValueChange={(value) => setEditedTask({ ...editedTask, category: value === "__none__" ? null : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {taskCategories.map((c) => (
                      <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Due Date */}
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editedTask.due_date ? format(new Date(editedTask.due_date), "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={editedTask.due_date ? new Date(editedTask.due_date) : undefined}
                      onSelect={(date) => setEditedTask({ ...editedTask, due_date: date?.toISOString().split("T")[0] || null })}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Follow-up Date */}
              <div className="space-y-2">
                <Label>Follow-up Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editedTask.follow_up_date ? format(new Date(editedTask.follow_up_date), "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={editedTask.follow_up_date ? new Date(editedTask.follow_up_date) : undefined}
                      onSelect={(date) => setEditedTask({ ...editedTask, follow_up_date: date?.toISOString().split("T")[0] || null })}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* SLA Deadline */}
              <div className="space-y-2">
                <Label>SLA Deadline</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <Clock className="mr-2 h-4 w-4" />
                      {editedTask.sla_deadline ? format(new Date(editedTask.sla_deadline), "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={editedTask.sla_deadline ? new Date(editedTask.sla_deadline) : undefined}
                      onSelect={(date) => setEditedTask({ ...editedTask, sla_deadline: date?.toISOString().split("T")[0] || null })}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Source */}
              <div className="space-y-2">
                <Label>Source</Label>
                <Select
                  value={editedTask.source || ""}
                  onValueChange={(value) => setEditedTask({ ...editedTask, source: value || null })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    {taskSources.length > 0 ? (
                      taskSources.map((s) => (
                        <SelectItem key={s.code} value={s.code}>{s.name}</SelectItem>
                      ))
                    ) : (
                      <>
                        <SelectItem value="Manual">Manual</SelectItem>
                        <SelectItem value="Email">Email</SelectItem>
                        <SelectItem value="Phone Call">Phone Call</SelectItem>
                        <SelectItem value="AI Generated">AI Generated</SelectItem>
                        <SelectItem value="Client Portal">Client Portal</SelectItem>
                        <SelectItem value="System">System</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={editedTask.description || ""}
                onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                placeholder="Task description..."
                rows={4}
              />
            </div>

            {/* Time Tracking */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Estimated Hours</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={editedTask.estimated_hours || ""}
                  onChange={(e) => setEditedTask({ ...editedTask, estimated_hours: parseFloat(e.target.value) || null })}
                />
              </div>
              <div className="space-y-2">
                <Label>Actual Hours</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={editedTask.actual_hours || ""}
                  onChange={(e) => setEditedTask({ ...editedTask, actual_hours: parseFloat(e.target.value) || null })}
                />
              </div>
            </div>

            {/* Resolution (if completed) */}
            {editedTask.status === "Completed" && (
              <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                <div className="space-y-2">
                  <Label>Resolution Category</Label>
                  <Select
                    value={editedTask.resolution_category || ""}
                    onValueChange={(value) => setEditedTask({ ...editedTask, resolution_category: value || null })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="How was it resolved?" />
                    </SelectTrigger>
                    <SelectContent>
                      {taskResolutionTypes.length > 0 ? (
                        taskResolutionTypes.map((r) => (
                          <SelectItem key={r.code} value={r.code}>{r.name}</SelectItem>
                        ))
                      ) : (
                        <>
                          <SelectItem value="Resolved">Resolved</SelectItem>
                          <SelectItem value="Closed - No Action">Closed - No Action</SelectItem>
                          <SelectItem value="Transferred">Transferred</SelectItem>
                          <SelectItem value="Duplicate">Duplicate</SelectItem>
                          <SelectItem value="Client Request">Client Request</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Resolution Notes</Label>
                  <Textarea
                    value={editedTask.resolution || ""}
                    onChange={(e) => setEditedTask({ ...editedTask, resolution: e.target.value })}
                    placeholder="Resolution details..."
                    rows={2}
                  />
                </div>
              </div>
            )}

            <Button onClick={handleSave} className="w-full">
              Save Changes
            </Button>
          </TabsContent>

          <TabsContent value="clients" className="mt-4">
            <TaskClientSelector
              taskClients={taskClients}
              allClients={clients.map(c => ({ id: c.id, client: c.client, email: c.email }))}
              onAddClient={addClient}
              onRemoveClient={removeClient}
            />
          </TabsContent>

          <TabsContent value="activity" className="space-y-4 mt-4">
            {/* Add Note */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Add Note</Label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={isInternalNote}
                    onChange={(e) => setIsInternalNote(e.target.checked)}
                    className="rounded"
                  />
                  Internal only
                </label>
              </div>
              <div className="flex gap-2">
                <Textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note..."
                  rows={2}
                  className="flex-1"
                />
                <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Timeline */}
            <TaskTimeline
              notes={task.notes || []}
              internalNotes={task.internal_notes || []}
              history={history}
            />
          </TabsContent>

          <TabsContent value="documents" className="mt-4">
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Document upload coming soon</p>
              <p className="text-sm">
                {taskDocuments.length > 0
                  ? `${taskDocuments.length} document(s) linked`
                  : "No documents linked yet"}
              </p>
            </div>
          </TabsContent>

          <TabsContent value="communications" className="mt-4">
            <div className="space-y-4">
              <Button onClick={handleSendMessage} className="w-full gap-2">
                <Send className="h-4 w-4" />
                Compose New Message
              </Button>

              {taskCommunications.length > 0 ? (
                <div className="space-y-2">
                  {taskCommunications.map((comm) => (
                    <div
                      key={comm.id}
                      className="p-3 border rounded-lg bg-muted/30"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{comm.subject || "No Subject"}</span>
                        <Badge variant="outline">{comm.channel}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {comm.direction} • {comm.sent_at ? format(new Date(comm.sent_at), "PPP") : "Draft"}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No communications linked yet</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Compose Message Dialog */}
        <ComposeMessageDialog
          open={composeDialogOpen}
          onOpenChange={setComposeDialogOpen}
          initialClientIds={taskClients.map((tc) => tc.client_id)}
          taskId={task.id}
        />
      </SheetContent>
    </Sheet>
  );
}
