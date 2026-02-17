import { useState } from "react";
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, X, User } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useTaskTypes } from "@/hooks/useTaskTypes";
import { useClients } from "@/hooks/useClients";
import { useTaskTypeStandards } from "@/hooks/useTaskTypeStandards";
import { EnhancedTask } from "@/hooks/useTasksEnhanced";

interface CreateTaskDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (task: Partial<EnhancedTask>, linkedClientIds?: string[]) => Promise<any>;
}

export function CreateTaskDialog({ open, onClose, onCreate }: CreateTaskDialogProps) {
  const { taskTypes, taskStatuses, taskPriorities, taskCategories } = useTaskTypes();
  const { clients } = useClients();
  const { getStandardForType } = useTaskTypeStandards();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [taskType, setTaskType] = useState("Follow-up");
  const [priority, setPriority] = useState("Medium");
  const [status, setStatus] = useState("Not Started");
  const [category, setCategory] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [clientSearchOpen, setClientSearchOpen] = useState(false);
  const [clientSearch, setClientSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setTaskType("Follow-up");
    setPriority("Medium");
    setStatus("Not Started");
    setCategory("");
    setDueDate(undefined);
    setSelectedClients([]);
    setClientSearch("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleCreate = async () => {
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const standard = getStandardForType(taskType);
      const slaDeadline = standard
        ? new Date(Date.now() + standard.sla_hours * 60 * 60 * 1000).toISOString()
        : undefined;

      await onCreate(
        {
          title,
          description: description || undefined,
          task_type: taskType,
          priority,
          status,
          category: category || undefined,
          due_date: dueDate?.toISOString().split("T")[0],
          client_id: selectedClients[0] || undefined,
          standard_execution_minutes: standard?.standard_execution_minutes,
          sla_deadline: slaDeadline,
        } as Partial<EnhancedTask>,
        selectedClients
      );
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const addClient = (clientId: string) => {
    if (!selectedClients.includes(clientId)) {
      setSelectedClients([...selectedClients, clientId]);
    }
    setClientSearchOpen(false);
    setClientSearch("");
  };

  const removeClient = (clientId: string) => {
    setSelectedClients(selectedClients.filter((id) => id !== clientId));
  };

  const getClientName = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    return client ? client.client : "Unknown";
  };

  const filteredClients = clients.filter(
    (c) =>
      !selectedClients.includes(c.id) &&
      c.client.toLowerCase().includes(clientSearch.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Workflow</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Workflow title..."
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Workflow description..."
              rows={3}
            />
          </div>

          {/* Linked Clients */}
          <div className="space-y-2">
            <Label>Link to Client(s)</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedClients.map((clientId) => (
                <Badge key={clientId} variant="secondary" className="gap-1">
                  {getClientName(clientId)}
                  <button
                    onClick={() => removeClient(clientId)}
                    className="ml-1 hover:bg-muted rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <Popover open={clientSearchOpen} onOpenChange={setClientSearchOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <User className="h-4 w-4 mr-2" />
                  Add Client
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder="Search clients..."
                    value={clientSearch}
                    onValueChange={setClientSearch}
                  />
                  <CommandList>
                    <CommandEmpty>No clients found.</CommandEmpty>
                    <CommandGroup>
                      {filteredClients.slice(0, 10).map((client) => (
                        <CommandItem
                          key={client.id}
                          onSelect={() => addClient(client.id)}
                          className="cursor-pointer"
                        >
                          {client.client}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Type */}
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={taskType} onValueChange={setTaskType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {taskTypes.map((t) => (
                    <SelectItem key={t.code} value={t.code}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {taskPriorities.map((p) => (
                    <SelectItem key={p.code} value={p.code}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {taskStatuses.map((s) => (
                    <SelectItem key={s.code} value={s.code}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category */}
            {taskCategories.length > 0 && (
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category || "__none__"} onValueChange={(val) => setCategory(val === "__none__" ? "" : val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {taskCategories.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label>Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : "Select due date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!title.trim() || isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Workflow"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
