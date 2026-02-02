import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  LayoutDashboard,
  Users,
  Mail,
  CalendarIcon,
  ListTodo,
  LineChart,
  Building2,
  Plus,
  Search,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Trash2,
  Edit,
  X,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
  addWeeks,
  subWeeks,
  addHours,
  setHours,
  setMinutes,
} from "date-fns";
import { useCalendarEvents, CalendarEvent, CalendarEventType, CreateCalendarEventInput } from "@/hooks/useCalendarEvents";
import { useClients } from "@/hooks/useClients";
import { cn } from "@/lib/utils";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dash", path: "/dashboard" },
  { icon: Users, label: "Clients", path: "/clients" },
  { icon: Mail, label: "Email", path: "/email" },
  { icon: CalendarIcon, label: "Calendar", path: "/calendar" },
  { icon: ListTodo, label: "Tasks", path: "/tasks" },
  { icon: LineChart, label: "Insights", path: "/insights" },
  { icon: Building2, label: "Practice", path: "/practice" },
];

const eventTypeColors: Record<CalendarEventType, string> = {
  "Meeting": "bg-[hsl(180,70%,45%)]",
  "Annual Review": "bg-purple-500",
  "Portfolio Review": "bg-purple-400",
  "Compliance Review": "bg-amber-500",
  "Reminder": "bg-blue-400",
  "Personal": "bg-blue-500",
  "Team Event": "bg-green-500",
  "Client Call": "bg-teal-400",
};

const eventTypes: CalendarEventType[] = [
  "Meeting",
  "Annual Review",
  "Portfolio Review",
  "Compliance Review",
  "Reminder",
  "Personal",
  "Team Event",
  "Client Call",
];

const CalendarPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [viewDate, setViewDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  const [calendarFilters, setCalendarFilters] = useState({
    myCalendar: true,
    clientMeetings: true,
    teamEvents: true,
  });

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventSheetOpen, setEventSheetOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Form state for new event
  const [newEvent, setNewEvent] = useState<Partial<CreateCalendarEventInput>>({
    title: "",
    eventType: "Meeting",
    allDay: false,
  });

  const { events, loading: eventsLoading, createEvent, updateEvent, deleteEvent, refetch } = useCalendarEvents(viewDate, viewMode);
  const { clients } = useClients();

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

  // Filter events based on calendar filters
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (!calendarFilters.myCalendar && event.eventType === "Personal") return false;
      if (!calendarFilters.clientMeetings && event.clientId) return false;
      if (!calendarFilters.teamEvents && event.eventType === "Team Event") return false;
      return true;
    });
  }, [events, calendarFilters]);

  // Generate calendar days for month view
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(viewDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const days: Date[] = [];
    let day = calendarStart;
    while (day <= calendarEnd) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [viewDate]);

  // Get events for a specific day
  const getEventsForDay = (day: Date) => {
    return filteredEvents.filter((event) => isSameDay(event.startTime, day));
  };

  // Get upcoming events (next 7 days)
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    const weekFromNow = addDays(now, 7);
    return filteredEvents
      .filter((event) => event.startTime >= now && event.startTime <= weekFromNow)
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
      .slice(0, 5);
  }, [filteredEvents]);

  const handlePrev = () => {
    if (viewMode === "month") {
      setViewDate(subMonths(viewDate, 1));
    } else if (viewMode === "week") {
      setViewDate(subWeeks(viewDate, 1));
    } else {
      setViewDate(addDays(viewDate, -1));
    }
  };

  const handleNext = () => {
    if (viewMode === "month") {
      setViewDate(addMonths(viewDate, 1));
    } else if (viewMode === "week") {
      setViewDate(addWeeks(viewDate, 1));
    } else {
      setViewDate(addDays(viewDate, 1));
    }
  };

  const handleToday = () => {
    setViewDate(new Date());
    setSelectedDate(new Date());
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setEventSheetOpen(true);
  };

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    // Pre-fill new event with selected date
    const startTime = setMinutes(setHours(day, 9), 0);
    const endTime = addHours(startTime, 1);
    setNewEvent({
      title: "",
      eventType: "Meeting",
      allDay: false,
      startTime,
      endTime,
    });
    setCreateDialogOpen(true);
  };

  const handleCreateEvent = async () => {
    if (!newEvent.title || !newEvent.startTime || !newEvent.endTime) {
      return;
    }

    await createEvent(newEvent as CreateCalendarEventInput);
    setCreateDialogOpen(false);
    setNewEvent({
      title: "",
      eventType: "Meeting",
      allDay: false,
    });
  };

  const handleDeleteEvent = async (eventId: string) => {
    await deleteEvent(eventId);
    setEventSheetOpen(false);
    setSelectedEvent(null);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Adviser";

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar */}
      <aside className="w-16 bg-[hsl(180,25%,25%)] flex flex-col items-center py-4 gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10 text-white/80 hover:bg-white/10 mb-4"
          onClick={() => navigate("/command-center")}
          title="Practice Overview"
        >
          <Plus className="w-5 h-5" />
        </Button>
        {sidebarItems.map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className={`w-full flex flex-col items-center py-2 text-xs gap-1 ${
              item.path === "/calendar"
                ? "bg-white/10 text-white"
                : "text-white/60 hover:bg-white/5 hover:text-white/80"
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </button>
        ))}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-14 bg-background border-b border-border flex items-center justify-between px-6">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search events..." className="pl-10 bg-muted/50 border-0" />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-1">
              <span className="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center font-medium">CZ</span>
              <span className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center font-medium">DH</span>
              <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-medium">EW</span>
              <span className="w-6 h-6 rounded-full bg-green-600 text-white text-xs flex items-center justify-center font-medium">IN</span>
              <span className="w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-medium">RS</span>
            </div>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">1</span>
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{userName}</span>
              <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign out">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Calendar Content */}
        <main className="flex-1 flex overflow-hidden">
          {/* Left Sidebar */}
          <div className="w-64 bg-background border-r border-border p-4 flex flex-col gap-4">
            {/* Create Event Button */}
            <Button
              className="w-full bg-[hsl(180,70%,45%)] hover:bg-[hsl(180,70%,40%)] text-white"
              onClick={() => {
                const now = new Date();
                const startTime = setMinutes(setHours(now, now.getHours() + 1), 0);
                const endTime = addHours(startTime, 1);
                setNewEvent({
                  title: "",
                  eventType: "Meeting",
                  allDay: false,
                  startTime,
                  endTime,
                });
                setCreateDialogOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>

            {/* Mini Calendar */}
            <Card className="p-2 overflow-hidden">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="w-full pointer-events-auto"
                classNames={{
                  months: "flex flex-col",
                  month: "space-y-2",
                  table: "w-full border-collapse",
                  head_row: "flex justify-between",
                  head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.7rem]",
                  row: "flex w-full justify-between mt-1",
                  cell: "h-8 w-8 text-center text-sm p-0 relative",
                  day: "h-8 w-8 p-0 font-normal text-xs hover:bg-accent rounded-md",
                  day_selected: "bg-primary text-primary-foreground hover:bg-primary",
                  day_today: "bg-accent text-accent-foreground",
                  day_outside: "text-muted-foreground opacity-50",
                  nav_button: "h-6 w-6 bg-transparent p-0 opacity-50 hover:opacity-100",
                  caption_label: "text-xs font-medium",
                }}
              />
            </Card>

            {/* Calendar Filters */}
            <Card>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm font-medium">My Calendars</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="myCalendar"
                    checked={calendarFilters.myCalendar}
                    onCheckedChange={(checked) =>
                      setCalendarFilters((prev) => ({ ...prev, myCalendar: !!checked }))
                    }
                  />
                  <Label htmlFor="myCalendar" className="text-sm cursor-pointer">My Calendar</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="clientMeetings"
                    checked={calendarFilters.clientMeetings}
                    onCheckedChange={(checked) =>
                      setCalendarFilters((prev) => ({ ...prev, clientMeetings: !!checked }))
                    }
                  />
                  <Label htmlFor="clientMeetings" className="text-sm cursor-pointer">Client Meetings</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="teamEvents"
                    checked={calendarFilters.teamEvents}
                    onCheckedChange={(checked) =>
                      setCalendarFilters((prev) => ({ ...prev, teamEvents: !!checked }))
                    }
                  />
                  <Label htmlFor="teamEvents" className="text-sm cursor-pointer">Team Events</Label>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card className="flex-1 overflow-hidden flex flex-col">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 flex-1 overflow-auto">
                {upcomingEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No upcoming events</p>
                ) : (
                  <div className="space-y-2">
                    {upcomingEvents.map((event) => (
                      <button
                        key={event.id}
                        onClick={() => handleEventClick(event)}
                        className="w-full text-left p-2 rounded-md hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start gap-2">
                          <div className={cn("w-2 h-2 rounded-full mt-1.5", eventTypeColors[event.eventType])} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{event.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(event.startTime, "EEE, MMM d • h:mm a")}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Calendar Area */}
          <div className="flex-1 flex flex-col bg-background">
            {/* Calendar Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" onClick={handleToday}>
                  Today
                </Button>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={handlePrev}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleNext}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                <h2 className="text-xl font-semibold">
                  {format(viewDate, "MMMM yyyy")}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "day" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("day")}
                  className={viewMode === "day" ? "bg-[hsl(180,70%,45%)] hover:bg-[hsl(180,70%,40%)]" : ""}
                >
                  Day
                </Button>
                <Button
                  variant={viewMode === "week" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("week")}
                  className={viewMode === "week" ? "bg-[hsl(180,70%,45%)] hover:bg-[hsl(180,70%,40%)]" : ""}
                >
                  Week
                </Button>
                <Button
                  variant={viewMode === "month" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("month")}
                  className={viewMode === "month" ? "bg-[hsl(180,70%,45%)] hover:bg-[hsl(180,70%,40%)]" : ""}
                >
                  Month
                </Button>
              </div>
            </div>

            {/* Calendar Grid - Month View */}
            {viewMode === "month" && (
              <div className="flex-1 overflow-auto p-4">
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 gap-px bg-border mb-px">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="bg-muted/50 p-2 text-center text-sm font-medium text-muted-foreground">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-px bg-border">
                  {calendarDays.map((day, index) => {
                    const dayEvents = getEventsForDay(day);
                    const isCurrentMonth = isSameMonth(day, viewDate);
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    const isTodayDate = isToday(day);

                    return (
                      <div
                        key={index}
                        onClick={() => handleDayClick(day)}
                        className={cn(
                          "min-h-[100px] bg-background p-1 cursor-pointer hover:bg-muted/50 transition-colors",
                          !isCurrentMonth && "bg-muted/30",
                          isSelected && "ring-2 ring-[hsl(180,70%,45%)] ring-inset"
                        )}
                      >
                        <div
                          className={cn(
                            "w-7 h-7 flex items-center justify-center rounded-full text-sm mb-1",
                            isTodayDate && "bg-[hsl(180,70%,45%)] text-white",
                            !isCurrentMonth && "text-muted-foreground"
                          )}
                        >
                          {format(day, "d")}
                        </div>
                        <div className="space-y-0.5">
                          {dayEvents.slice(0, 3).map((event) => (
                            <button
                              key={event.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEventClick(event);
                              }}
                              className={cn(
                                "w-full text-left px-1 py-0.5 rounded text-xs text-white truncate",
                                event.color || eventTypeColors[event.eventType]
                              )}
                            >
                              {event.title}
                            </button>
                          ))}
                          {dayEvents.length > 3 && (
                            <p className="text-xs text-muted-foreground px-1">
                              +{dayEvents.length - 3} more
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Week View Placeholder */}
            {viewMode === "week" && (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Week view coming soon</p>
                  <p className="text-sm">Switch to Month view for now</p>
                </div>
              </div>
            )}

            {/* Day View Placeholder */}
            {viewMode === "day" && (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Day view coming soon</p>
                  <p className="text-sm">Switch to Month view for now</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Event Detail Sheet */}
      <Sheet open={eventSheetOpen} onOpenChange={setEventSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          {selectedEvent && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <div className={cn("w-3 h-3 rounded-full", eventTypeColors[selectedEvent.eventType])} />
                  {selectedEvent.title}
                </SheetTitle>
                <SheetDescription>
                  {selectedEvent.eventType}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">
                      {format(selectedEvent.startTime, "EEEE, MMMM d, yyyy")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedEvent.allDay
                        ? "All day"
                        : `${format(selectedEvent.startTime, "h:mm a")} - ${format(selectedEvent.endTime, "h:mm a")}`}
                    </p>
                  </div>
                </div>

                {selectedEvent.location && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <p>{selectedEvent.location}</p>
                  </div>
                )}

                {selectedEvent.clientName && (
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <p>Client: {selectedEvent.clientName}</p>
                  </div>
                )}

                {selectedEvent.description && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">Description</p>
                    <p>{selectedEvent.description}</p>
                  </div>
                )}

                <div className="pt-4 border-t flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setEventSheetOpen(false)}>
                    <X className="w-4 h-4 mr-2" />
                    Close
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteEvent(selectedEvent.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Create Event Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newEvent.title || ""}
                onChange={(e) => setNewEvent((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Event title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventType">Event Type</Label>
              <Select
                value={newEvent.eventType}
                onValueChange={(value) => setNewEvent((prev) => ({ ...prev, eventType: value as CalendarEventType }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", eventTypeColors[type])} />
                        {type}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={newEvent.startTime ? format(newEvent.startTime, "yyyy-MM-dd") : ""}
                  onChange={(e) => {
                    const date = new Date(e.target.value);
                    const currentTime = newEvent.startTime || new Date();
                    date.setHours(currentTime.getHours(), currentTime.getMinutes());
                    setNewEvent((prev) => ({ ...prev, startTime: date }));
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={newEvent.startTime ? format(newEvent.startTime, "HH:mm") : ""}
                  onChange={(e) => {
                    const [hours, minutes] = e.target.value.split(":").map(Number);
                    const date = new Date(newEvent.startTime || new Date());
                    date.setHours(hours, minutes);
                    setNewEvent((prev) => ({ ...prev, startTime: date }));
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={newEvent.endTime ? format(newEvent.endTime, "yyyy-MM-dd") : ""}
                  onChange={(e) => {
                    const date = new Date(e.target.value);
                    const currentTime = newEvent.endTime || new Date();
                    date.setHours(currentTime.getHours(), currentTime.getMinutes());
                    setNewEvent((prev) => ({ ...prev, endTime: date }));
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={newEvent.endTime ? format(newEvent.endTime, "HH:mm") : ""}
                  onChange={(e) => {
                    const [hours, minutes] = e.target.value.split(":").map(Number);
                    const date = new Date(newEvent.endTime || new Date());
                    date.setHours(hours, minutes);
                    setNewEvent((prev) => ({ ...prev, endTime: date }));
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="client">Link to Client (Optional)</Label>
              <Select
                value={newEvent.clientId || "none"}
                onValueChange={(value) => setNewEvent((prev) => ({ ...prev, clientId: value === "none" ? undefined : value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No client</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.client}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location (Optional)</Label>
              <Input
                id="location"
                value={newEvent.location || ""}
                onChange={(e) => setNewEvent((prev) => ({ ...prev, location: e.target.value }))}
                placeholder="Event location"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={newEvent.description || ""}
                onChange={(e) => setNewEvent((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Event description"
                rows={3}
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="allDay"
                checked={newEvent.allDay || false}
                onCheckedChange={(checked) => setNewEvent((prev) => ({ ...prev, allDay: !!checked }))}
              />
              <Label htmlFor="allDay" className="cursor-pointer">All day event</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateEvent}
              disabled={!newEvent.title || !newEvent.startTime || !newEvent.endTime}
              className="bg-[hsl(180,70%,45%)] hover:bg-[hsl(180,70%,40%)]"
            >
              Create Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarPage;
