import { useState } from "react";
import { CalendarDays, MapPin, Video, Phone, Plus, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { showMobileNotification } from "../MobileNotificationBanner";
import { format } from "date-fns";

interface TaskItem {
  id: string;
  title: string;
  status?: string;
}

interface ScheduleFollowUpPanelProps {
  tasks: TaskItem[];
  clientId: string | null;
  clientName?: string;
  suggestedDate: string;
  meetingTitle: string;
  onScheduled: (scheduledTaskIds: string[], eventDetails: { date: string; time: string; type: string }) => void;
}

const meetingTypes = [
  { value: "Meeting", label: "In-person", icon: MapPin },
  { value: "Client Call", label: "Online", icon: Video },
  { value: "Client Call", label: "Call", icon: Phone },
] as const;

export default function ScheduleFollowUpPanel({
  tasks,
  clientId,
  clientName,
  suggestedDate,
  meetingTitle,
  onScheduled,
}: ScheduleFollowUpPanelProps) {
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>(tasks.map(t => t.id));
  const [date, setDate] = useState(suggestedDate.split("T")[0] || format(new Date(), "yyyy-MM-dd"));
  const [time, setTime] = useState("09:00");
  const [meetingType, setMeetingType] = useState<number>(0);
  const [customTask, setCustomTask] = useState("");
  const [customTasks, setCustomTasks] = useState<TaskItem[]>([]);
  const [scheduling, setScheduling] = useState(false);

  const { createEvent } = useCalendarEvents();
  

  const allTasks = [...tasks, ...customTasks];

  const toggleTask = (id: string) => {
    setSelectedTaskIds(prev =>
      prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
    );
  };

  const addCustomTask = () => {
    if (!customTask.trim()) return;
    const newTask: TaskItem = { id: `custom-${Date.now()}`, title: customTask.trim() };
    setCustomTasks(prev => [...prev, newTask]);
    setSelectedTaskIds(prev => [...prev, newTask.id]);
    setCustomTask("");
  };

  const handleSchedule = async () => {
    if (selectedTaskIds.length === 0) {
      showMobileNotification("error", "Select at least one task");
      return;
    }

    setScheduling(true);
    const startTime = new Date(`${date}T${time}:00`);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour

    const selectedTitles = allTasks
      .filter(t => selectedTaskIds.includes(t.id))
      .map(t => t.title);

    const typeInfo = meetingTypes[meetingType];

    const result = await createEvent({
      title: `Follow-up: ${clientName || meetingTitle}`,
      description: `Follow-up items:\n${selectedTitles.map(t => `• ${t}`).join("\n")}`,
      eventType: typeInfo.value as any,
      startTime,
      endTime,
      clientId: clientId || undefined,
      location: typeInfo.label === "In-person" ? "TBC" : typeInfo.label === "Online" ? "Video call" : "Phone call",
    });

    setScheduling(false);

    if (result) {
      onScheduled(selectedTaskIds, { date, time, type: typeInfo.label });
    }
  };

  return (
    <div className="space-y-3 p-3 rounded-lg bg-card border border-border">
      {/* Task checklist */}
      <div className="space-y-1.5">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Include Tasks</p>
        {allTasks.map(t => (
          <label key={t.id} className="flex items-center gap-2 p-1.5 rounded hover:bg-accent/50 cursor-pointer">
            <Checkbox
              checked={selectedTaskIds.includes(t.id)}
              onCheckedChange={() => toggleTask(t.id)}
            />
            <span className="text-sm text-foreground truncate">{t.title}</span>
          </label>
        ))}
        <div className="flex items-center gap-2 mt-1">
          <Input
            placeholder="Add custom item..."
            value={customTask}
            onChange={e => setCustomTask(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addCustomTask()}
            className="h-8 text-sm"
          />
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={addCustomTask}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Date & Time */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Date</p>
          <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="h-8 text-sm" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Time</p>
          <Input type="time" value={time} onChange={e => setTime(e.target.value)} className="h-8 text-sm" />
        </div>
      </div>

      {/* Meeting type */}
      <div>
        <p className="text-xs text-muted-foreground mb-1.5">Meeting Type</p>
        <div className="flex gap-1.5">
          {meetingTypes.map((mt, i) => {
            const Icon = mt.icon;
            return (
              <button
                key={i}
                onClick={() => setMeetingType(i)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  meetingType === i
                    ? "bg-[hsl(180,70%,45%)] text-white"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {mt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Schedule button */}
      <Button
        onClick={handleSchedule}
        disabled={scheduling || selectedTaskIds.length === 0}
        className="w-full h-9 bg-[hsl(180,70%,45%)] hover:bg-[hsl(180,70%,40%)] text-white"
      >
        {scheduling ? "Scheduling..." : (
          <>
            <CalendarDays className="h-4 w-4 mr-1.5" />
            Schedule Follow-up ({selectedTaskIds.length} items)
          </>
        )}
      </Button>
    </div>
  );
}
