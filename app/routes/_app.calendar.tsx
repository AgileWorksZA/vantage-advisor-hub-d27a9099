import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useRegion } from "@/contexts/RegionContext";
import { useNavigate } from "react-router";
import { useKapableAuth } from "@/integrations/kapable/auth-context";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Mail,
  CalendarIcon,
  ListTodo,
  LineChart,
  Building2,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Trash2,
  Edit,
  X,
  Globe,
  Search,
} from "lucide-react";
import commandCenterIcon from "@/assets/command-center-icon.png";
import vantageLogo from "@/assets/vantage-logo.png";
import { AppHeader } from "@/components/layout/AppHeader";
import { WeekView } from "@/components/calendar/WeekView";
import { DayView } from "@/components/calendar/DayView";
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
import { useMeetingRecordings } from "@/hooks/useMeetingRecordings";
import { MeetingRecorder } from "@/components/calendar/MeetingRecorder";
import { TranscriptionPanel } from "@/components/calendar/TranscriptionPanel";
import { ActionItemsList } from "@/components/calendar/ActionItemsList";
import { MeetingPrepPanel } from "@/components/calendar/MeetingPrepPanel";
import { cn } from "@/lib/utils";
import { useUserSettings } from "@/hooks/useUserSettings";
import { COMMON_TIMEZONES, TIMEZONE_REGIONS, getActiveTimezone, getTimezoneAbbreviation, convertToTimezone } from "@/lib/timezone-utils";
import GlobalAIChat from "@/components/ai-assistant/GlobalAIChat";
import { EventHoverCard, eventTypeAccentColors } from "@/components/calendar/EventHoverCard";
import { ScrollArea } from "@/components/ui/scroll-area";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dash", path: "/dashboard" },
  { icon: Users, label: "Clients", path: "/clients" },
  { icon: LineChart, label: "Portfolio", path: "/portfolio" },
  { icon: Mail, label: "Message", path: "/email" },
  { icon: CalendarIcon, label: "Calendar", path: "/calendar" },
  { icon: ListTodo, label: "Workflows", path: "/tasks" },
  { icon: Briefcase, label: "Insights", path: "/insights" },
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
  const { email, name } = useKapableAuth();

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
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [editEvent, setEditEvent] = useState<Partial<CreateCalendarEventInput>>({});

  // Form state for new event
  const [newEvent, setNewEvent] = useState<Partial<CreateCalendarEventInput>>({
    title: "",
    eventType: "Meeting",
    allDay: false,
  });

  const { events: rawEvents, loading: eventsLoading, createEvent, updateEvent, deleteEvent, refetch } = useCalendarEvents(viewDate, viewMode);
  const { clients } = useClients();
  const { selectedAdvisors, regionalData, selectedRegion } = useRegion();
  const { settings: userSettings, upsertSettings } = useUserSettings();
  const [displayTimezone, setDisplayTimezone] = useState<string | null>(null);
  const activeTimezone = displayTimezone || getActiveTimezone(userSettings?.timezone, selectedRegion);

  // Event search state
  const [eventSearchQuery, setEventSearchQuery] = useState("");
  const [eventSearchOpen, setEventSearchOpen] = useState(false);
  const eventSearchRef = useRef<HTMLDivElement>(null);

  // Month/year picker state
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(viewDate.getFullYear());

  // Sync picker year when viewDate changes
  useEffect(() => {
    setPickerYear(viewDate.getFullYear());
  }, [viewDate]);

  // Close event search on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (eventSearchRef.current && !eventSearchRef.current.contains(e.target as Node)) {
        setEventSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);



  const timezoneAbbr = getTimezoneAbbreviation(activeTimezone);

  // Sync displayTimezone from persisted settings on load
  useEffect(() => {
    if (userSettings?.timezone && !displayTimezone) {
      setDisplayTimezone(userSettings.timezone);
    }
  }, [userSettings?.timezone]);

  const handleTimezoneChange = (tz: string) => {
    setDisplayTimezone(tz);
    upsertSettings.mutate({ timezone: tz });
  };


  // Map selected advisor initials to full names
  const selectedAdvisorNames = useMemo(() => {
    return regionalData.advisors
      .filter(a => selectedAdvisors.includes(a.initials))
      .map(a => a.name);
  }, [selectedAdvisors, regionalData.advisors]);

  // Filter events by selected advisors
  const events = useMemo(() => {
    return rawEvents.filter(event => {
      // Events without a client (personal/team) are always visible
      if (!event.clientId) return true;
      // Events linked to a client must match a selected advisor
      return event.clientAdvisor ? selectedAdvisorNames.includes(event.clientAdvisor) : false;
    });
  }, [rawEvents, selectedAdvisorNames]);
  
  // Meeting recordings for the selected event
  const {
    recordings: eventRecordings,
    recordingState,
    processingState,
    startRecording,
    stopRecording,
    transcribeRecording,
    processRecording,
    refetch: refetchRecordings,
  } = useMeetingRecordings(selectedEvent?.id);

  const handleSignOut = () => {
    navigate("/logout");
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

  // Convert event times to display timezone
  const convertedEvents = useMemo(() => {
    return filteredEvents.map(event => ({
      ...event,
      startTime: convertToTimezone(event.startTime, activeTimezone),
      endTime: convertToTimezone(event.endTime, activeTimezone),
    }));
  }, [filteredEvents, activeTimezone]);

  // Filtered event search results
  const eventSearchResults = useMemo(() => {
    if (eventSearchQuery.length < 2) return [];
    const q = eventSearchQuery.toLowerCase();
    return convertedEvents
      .filter(e => e.title.toLowerCase().includes(q) || e.clientName?.toLowerCase().includes(q))
      .slice(0, 8);
  }, [convertedEvents, eventSearchQuery]);

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

  // Get events for a specific day (using converted times)
  const getEventsForDay = (day: Date) => {
    return convertedEvents.filter((event) => isSameDay(event.startTime, day));
  };

  // Get upcoming events (next 7 days)
  const upcomingEvents = useMemo(() => {
    const now = convertToTimezone(new Date(), activeTimezone);
    const weekFromNow = addDays(now, 7);
    return convertedEvents
      .filter((event) => event.startTime >= now && event.startTime <= weekFromNow)
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
      .slice(0, 5);
  }, [convertedEvents, activeTimezone]);

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
    setIsEditingEvent(false);
    setEventSheetOpen(true);
  };

  const handleStartEditing = () => {
    if (!selectedEvent) return;
    setEditEvent({
      title: selectedEvent.title,
      eventType: selectedEvent.eventType,
      startTime: selectedEvent.startTime,
      endTime: selectedEvent.endTime,
      allDay: selectedEvent.allDay,
      location: selectedEvent.location || "",
      description: selectedEvent.description || "",
      clientId: selectedEvent.clientId || undefined,
      timezone: selectedEvent.timezone || activeTimezone,
    });
    setIsEditingEvent(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedEvent || !editEvent.title) return;
    const success = await updateEvent(selectedEvent.id, editEvent);
    if (success) {
      setIsEditingEvent(false);
      setEventSheetOpen(false);
      setSelectedEvent(null);
    }
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

  const userName = name || "Adviser";
  const userEmail = email || "adviser@vantage.co";

  return (
    <div className="h-screen bg-muted/30 flex overflow-hidden">
      {/* Sidebar - Fixed */}
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
              item.path === "/calendar"
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
        <div className="mb-2 overflow-visible">
          <img 
            src={vantageLogo} 
            alt="Vantage" 
            className="h-[80px] w-auto object-contain -rotate-90 origin-center"
          />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header - Sticky */}
        <AppHeader
          userName={userName}
          userEmail={userEmail}
          onSignOut={handleSignOut}
          onAccountSettings={() => navigate("/account-settings")}
        />

        {/* Calendar Content - Scrollable */}
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

            {/* Event Search */}
            <div className="relative" ref={eventSearchRef}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
              <Input
                placeholder="Search events..."
                className="pl-10 bg-muted/50 border-0 h-9 text-sm"
                value={eventSearchQuery}
                onChange={(e) => {
                  setEventSearchQuery(e.target.value);
                  setEventSearchOpen(e.target.value.length >= 2);
                }}
                onFocus={() => eventSearchQuery.length >= 2 && setEventSearchOpen(true)}
                onKeyDown={(e) => e.key === "Escape" && setEventSearchOpen(false)}
              />
              {eventSearchOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 overflow-hidden">
                  {eventSearchResults.length === 0 ? (
                    <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                      No events found
                    </div>
                  ) : (
                    <ScrollArea className="max-h-[300px]">
                      <div className="py-1">
                        {eventSearchResults.map((event) => {
                          const accent = eventTypeAccentColors[event.eventType];
                          return (
                            <button
                              key={event.id}
                              type="button"
                              onClick={() => {
                                handleEventClick(event);
                                setEventSearchQuery("");
                                setEventSearchOpen(false);
                              }}
                              className="w-full flex items-start gap-3 px-3 py-2.5 text-left hover:bg-muted/50 transition-colors"
                            >
                              <div className={cn("w-1 self-stretch rounded-full mt-0.5", accent.border.replace("border-l-", "bg-"))} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{event.title}</p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {event.clientName || format(event.startTime, "EEE, MMM d • h:mm a")}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  )}
                </div>
              )}
            </div>

            {/* Mini Calendar */}
            <Card className="p-2 overflow-hidden flex-shrink-0">
              <div className="w-full max-w-[224px]">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="w-full pointer-events-auto !p-0"
                  classNames={{
                    months: "flex flex-col w-full",
                    month: "space-y-2 w-full",
                    caption: "flex justify-center pt-1 relative items-center",
                    caption_label: "text-xs font-medium",
                    nav: "space-x-1 flex items-center",
                    nav_button: "h-5 w-5 bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center",
                    nav_button_previous: "absolute left-0",
                    nav_button_next: "absolute right-0",
                    table: "w-full border-collapse",
                    head_row: "flex w-full",
                    head_cell: "text-muted-foreground rounded-md flex-1 font-normal text-[0.65rem] text-center",
                    row: "flex w-full mt-1",
                    cell: "flex-1 aspect-square text-center text-xs p-0 relative",
                    day: "h-full w-full p-0 font-normal text-[0.65rem] hover:bg-accent rounded-md flex items-center justify-center",
                    day_selected: "bg-primary text-primary-foreground hover:bg-primary",
                    day_today: "bg-accent text-accent-foreground",
                    day_outside: "text-muted-foreground opacity-50",
                  }}
                />
              </div>
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
                  {viewMode === "day" 
                    ? format(viewDate, "EEEE, MMMM d, yyyy")
                    : viewMode === "week"
                    ? `${format(startOfWeek(viewDate, { weekStartsOn: 0 }), "MMM d")} - ${format(endOfWeek(viewDate, { weekStartsOn: 0 }), "MMM d, yyyy")}`
                    : (
                      <Popover open={monthPickerOpen} onOpenChange={setMonthPickerOpen}>
                        <PopoverTrigger asChild>
                          <button className="hover:underline cursor-pointer decoration-[hsl(180,70%,45%)] underline-offset-4">
                            {format(viewDate, "MMMM yyyy")}
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-3 bg-popover z-50" align="start">
                          <div className="flex items-center justify-between mb-3">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPickerYear(y => y - 1)}>
                              <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <span className="text-sm font-semibold">{pickerYear}</span>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPickerYear(y => y + 1)}>
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-4 gap-1">
                            {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m, i) => {
                              const isCurrentMonth = viewDate.getMonth() === i && viewDate.getFullYear() === pickerYear;
                              return (
                                <Button
                                  key={m}
                                  variant="ghost"
                                  size="sm"
                                  className={cn(
                                    "h-8 text-xs",
                                    isCurrentMonth && "bg-[hsl(180,70%,45%)] text-white hover:bg-[hsl(180,70%,40%)] hover:text-white"
                                  )}
                                  onClick={() => {
                                    setViewDate(new Date(pickerYear, i, 1));
                                    setMonthPickerOpen(false);
                                  }}
                                >
                                  {m}
                                </Button>
                              );
                            })}
                          </div>
                        </PopoverContent>
                      </Popover>
                    )}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                {/* Timezone selector */}
                <Select value={activeTimezone} onValueChange={handleTimezoneChange}>
                  <SelectTrigger className="w-auto min-w-[160px] h-8 text-sm bg-muted/50 border-none gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <SelectValue>{timezoneAbbr}</SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-popover max-h-[300px] z-50">
                    {TIMEZONE_REGIONS.map(region => (
                      <div key={region}>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">{region}</div>
                        {COMMON_TIMEZONES.filter(tz => tz.region === region).map(tz => (
                          <SelectItem key={tz.value} value={tz.value} className="text-sm">
                            {tz.label}
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
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
                          {dayEvents.slice(0, 3).map((event) => {
                            const accent = eventTypeAccentColors[event.eventType];
                            return (
                              <EventHoverCard key={event.id} event={event} side="right">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEventClick(event);
                                  }}
                                  className={cn(
                                    "w-full text-left px-1.5 py-0.5 rounded text-xs text-gray-900 dark:text-white truncate border-l-[3px] border border-border/40",
                                    accent.border,
                                    accent.bg
                                  )}
                                >
                                  {event.title}
                                </button>
                              </EventHoverCard>
                            );
                          })}
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

            {/* Week View */}
            {viewMode === "week" && (
              <WeekView
                viewDate={viewDate}
                events={convertedEvents}
                selectedDate={selectedDate}
                onEventClick={handleEventClick}
                onDayClick={handleDayClick}
                onTimeSlotClick={(day, hour) => {
                  const startTime = setMinutes(setHours(day, hour), 0);
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
              />
            )}

            {/* Day View */}
            {viewMode === "day" && (
              <DayView
                viewDate={viewDate}
                events={convertedEvents}
                onEventClick={handleEventClick}
                onTimeSlotClick={(day, hour) => {
                  const startTime = setMinutes(setHours(day, hour), 0);
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
              />
            )}
          </div>
        </main>
      </div>

      {/* Event Detail Sheet */}
      <Sheet open={eventSheetOpen} onOpenChange={(open) => { setEventSheetOpen(open); if (!open) setIsEditingEvent(false); }}>
        <SheetContent className="w-[400px] sm:w-[600px] overflow-y-auto">
          {selectedEvent && !isEditingEvent && (
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
                        : `${format(selectedEvent.startTime, "h:mm a")} - ${format(selectedEvent.endTime, "h:mm a")} ${getTimezoneAbbreviation(selectedEvent.timezone || activeTimezone)}`}
                    </p>
                  </div>
                </div>

                {selectedEvent.location && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      {selectedEvent.location.startsWith("http") ? (
                        <a href={selectedEvent.location} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">
                          {selectedEvent.location}
                        </a>
                      ) : (
                        <p>{selectedEvent.location}</p>
                      )}
                    </div>
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

                {/* Meeting Prep Panel - shown when client is linked */}
                {selectedEvent.clientId && (
                  <MeetingPrepPanel clientId={selectedEvent.clientId} />
                )}

                {/* Meeting Recorder Section */}
                <div className="pt-4 border-t space-y-4">
                  <MeetingRecorder
                    isRecording={recordingState.isRecording}
                    duration={recordingState.duration}
                    transcriptionStatus={eventRecordings[0]?.transcriptionStatus}
                    isTranscribing={processingState.transcribing}
                    isAnalyzing={processingState.analyzing}
                    hasTranscription={!!eventRecordings[0]?.transcription}
                    hasAnalysis={!!eventRecordings[0]?.aiActionItems}
                    onStartRecording={() => startRecording(selectedEvent.title, selectedEvent.id, selectedEvent.clientId || undefined)}
                    onStopRecording={stopRecording}
                    onTranscribe={() => eventRecordings[0] && transcribeRecording(eventRecordings[0].id)}
                    onAnalyze={() => eventRecordings[0] && processRecording(eventRecordings[0].id)}
                  />

                  {eventRecordings[0] && (
                    <TranscriptionPanel
                      transcription={eventRecordings[0].transcription}
                      aiSummary={eventRecordings[0].aiSummary}
                      isLoading={processingState.transcribing || processingState.analyzing}
                    />
                  )}

                  {eventRecordings[0] && (
                    <ActionItemsList
                      actionItems={eventRecordings[0].aiActionItems}
                      clientId={selectedEvent.clientId}
                      aiSummary={eventRecordings[0].aiSummary}
                    />
                  )}
                </div>

                <div className="pt-4 border-t flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={handleStartEditing}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
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

          {/* Edit mode */}
          {selectedEvent && isEditingEvent && (
            <>
              <SheetHeader>
                <SheetTitle>Edit Event</SheetTitle>
                <SheetDescription>Update event details</SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Title</Label>
                  <Input
                    id="edit-title"
                    value={editEvent.title || ""}
                    onChange={(e) => setEditEvent((prev) => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Event Type</Label>
                  <Select
                    value={editEvent.eventType}
                    onValueChange={(value) => setEditEvent((prev) => ({ ...prev, eventType: value as CalendarEventType }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
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
                      value={editEvent.startTime ? format(editEvent.startTime, "yyyy-MM-dd") : ""}
                      onChange={(e) => {
                        const date = new Date(e.target.value);
                        const currentTime = editEvent.startTime || new Date();
                        date.setHours(currentTime.getHours(), currentTime.getMinutes());
                        setEditEvent((prev) => ({ ...prev, startTime: date }));
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Input
                      type="time"
                      value={editEvent.startTime ? format(editEvent.startTime, "HH:mm") : ""}
                      onChange={(e) => {
                        const [hours, minutes] = e.target.value.split(":").map(Number);
                        const date = new Date(editEvent.startTime || new Date());
                        date.setHours(hours, minutes);
                        setEditEvent((prev) => ({ ...prev, startTime: date }));
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={editEvent.endTime ? format(editEvent.endTime, "yyyy-MM-dd") : ""}
                      onChange={(e) => {
                        const date = new Date(e.target.value);
                        const currentTime = editEvent.endTime || new Date();
                        date.setHours(currentTime.getHours(), currentTime.getMinutes());
                        setEditEvent((prev) => ({ ...prev, endTime: date }));
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <Input
                      type="time"
                      value={editEvent.endTime ? format(editEvent.endTime, "HH:mm") : ""}
                      onChange={(e) => {
                        const [hours, minutes] = e.target.value.split(":").map(Number);
                        const date = new Date(editEvent.endTime || new Date());
                        date.setHours(hours, minutes);
                        setEditEvent((prev) => ({ ...prev, endTime: date }));
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select
                    value={editEvent.timezone || activeTimezone}
                    onValueChange={(value) => setEditEvent((prev) => ({ ...prev, timezone: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMON_TIMEZONES.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Link to Client (Optional)</Label>
                  <Select
                    value={editEvent.clientId || "none"}
                    onValueChange={(value) => setEditEvent((prev) => ({ ...prev, clientId: value === "none" ? undefined : value }))}
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
                  <Label htmlFor="edit-location">Location (Optional)</Label>
                  <Input
                    id="edit-location"
                    value={editEvent.location || ""}
                    onChange={(e) => setEditEvent((prev) => ({ ...prev, location: e.target.value }))}
                    placeholder="Zoom link, address, or Google Maps URL"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description (Optional)</Label>
                  <Textarea
                    id="edit-description"
                    value={editEvent.description || ""}
                    onChange={(e) => setEditEvent((prev) => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="edit-allDay"
                    checked={editEvent.allDay || false}
                    onCheckedChange={(checked) => setEditEvent((prev) => ({ ...prev, allDay: !!checked }))}
                  />
                  <Label htmlFor="edit-allDay" className="cursor-pointer">All day event</Label>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button variant="outline" className="flex-1" onClick={() => setIsEditingEvent(false)}>
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-[hsl(180,70%,45%)] hover:bg-[hsl(180,70%,40%)]"
                    onClick={handleSaveEdit}
                    disabled={!editEvent.title}
                  >
                    Save Changes
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
              <Label>Timezone</Label>
              <Select
                value={newEvent.timezone || activeTimezone}
                onValueChange={(value) => setNewEvent((prev) => ({ ...prev, timezone: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_TIMEZONES.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
      <GlobalAIChat currentPage="calendar" />
    </div>
  );
};

export default CalendarPage;
