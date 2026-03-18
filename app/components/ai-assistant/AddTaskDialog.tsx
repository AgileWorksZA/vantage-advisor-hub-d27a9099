import { useState } from "react";
import { addDays, format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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

interface AddTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: {
    project_id: string;
    title: string;
    description: string;
    task_type: string;
    priority: string;
    due_date: string;
    sla_deadline: string;
    assigned_to: string;
  }) => void;
  projectId: string;
  defaultSLADays: number;
  isLoading?: boolean;
}

const taskTypes = [
  { value: "Action", label: "Action" },
  { value: "Follow-up", label: "Follow-up" },
  { value: "Meeting", label: "Meeting" },
  { value: "Document", label: "Document" },
  { value: "Review", label: "Review" },
];

const priorities = [
  { value: "Low", label: "Low" },
  { value: "Medium", label: "Medium" },
  { value: "High", label: "High" },
  { value: "Urgent", label: "Urgent" },
];

const AddTaskDialog = ({
  isOpen,
  onClose,
  onAdd,
  projectId,
  defaultSLADays,
  isLoading,
}: AddTaskDialogProps) => {
  const defaultDeadline = format(addDays(new Date(), defaultSLADays), "yyyy-MM-dd");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [taskType, setTaskType] = useState("Action");
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState(defaultDeadline);
  const [slaDeadline, setSlaDeadline] = useState(defaultDeadline);
  const [assignedTo, setAssignedTo] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      project_id: projectId,
      title,
      description,
      task_type: taskType,
      priority,
      due_date: dueDate,
      sla_deadline: slaDeadline,
      assigned_to: assignedTo,
    });
    resetForm();
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setTaskType("Action");
    setPriority("Medium");
    setDueDate(defaultDeadline);
    setSlaDeadline(defaultDeadline);
    setAssignedTo("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] bg-slate-900 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>Add Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Schedule portfolio review"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
              required
            />
          </div>

          {/* Type & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Task Type</Label>
              <Select value={taskType} onValueChange={setTaskType}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {taskTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task details..."
              className="bg-white/5 border-white/10 text-white placeholder:text-white/40 min-h-[60px]"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slaDeadline">SLA Deadline</Label>
              <Input
                id="slaDeadline"
                type="date"
                value={slaDeadline}
                onChange={(e) => setSlaDeadline(e.target.value)}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>

          {/* Assigned To */}
          <div className="space-y-2">
            <Label htmlFor="assignedTo">Assigned To (optional)</Label>
            <Input
              id="assignedTo"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              placeholder="e.g., Johan Botha"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} className="text-white/70">
              Cancel
            </Button>
            <Button type="submit" disabled={!title || isLoading}>
              {isLoading ? "Adding..." : "Add Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTaskDialog;
