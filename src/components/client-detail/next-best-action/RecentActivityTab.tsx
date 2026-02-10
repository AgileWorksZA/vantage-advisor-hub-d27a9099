import React, { useState } from "react";
import { DollarSign, Image, MessageSquare, User, FileCheck, Calendar } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { useClientCalendarEvents, ClientCalendarEvent } from "@/hooks/useClientCalendarEvents";

interface RecentActivityTabProps {
  householdView?: boolean;
  clientId?: string;
  onCalendarEventClick?: (event: ClientCalendarEvent) => void;
  onActivityClick?: (type: string) => void;
}

const staticActivities = [
  { id: "1", type: "product_sold", title: "Product purchased", description: 'Client added "Discovery Life Plan"', timestamp: new Date(Date.now() - 5 * 60 * 1000) },
  { id: "2", type: "document_uploaded", title: "Document uploaded", description: 'Uploaded "ID Document.pdf"', timestamp: new Date(Date.now() - 30 * 60 * 1000) },
  { id: "3", type: "note_added", title: "Note added", description: 'Meeting notes: Discussed retirement planning options', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) },
  { id: "4", type: "profile_updated", title: "Profile updated", description: 'Updated contact details and address', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  { id: "5", type: "compliance_created", title: "Compliance created", description: 'FAIS Control document generated', timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000) },
  { id: "6", type: "product_sold", title: "Premium adjusted", description: 'Updated premium on "Sanlam Investment"', timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000) },
  { id: "7", type: "note_added", title: "Call logged", description: 'Follow-up call regarding policy renewal', timestamp: new Date(Date.now() - 96 * 60 * 60 * 1000) },
  { id: "8", type: "document_uploaded", title: "Document signed", description: 'Signed "Beneficiary Nomination Form"', timestamp: new Date(Date.now() - 120 * 60 * 60 * 1000) },
];

const getActivityIcon = (type: string) => {
  switch (type) {
    case "product_sold": return <DollarSign className="w-4 h-4 text-amber-500" />;
    case "document_uploaded": return <Image className="w-4 h-4 text-purple-500" />;
    case "note_added": return <MessageSquare className="w-4 h-4 text-blue-500" />;
    case "profile_updated": return <User className="w-4 h-4 text-green-500" />;
    case "compliance_created": return <FileCheck className="w-4 h-4 text-[hsl(180,70%,45%)]" />;
    case "calendar_event": return <Calendar className="w-4 h-4 text-[hsl(180,70%,45%)]" />;
    default: return <MessageSquare className="w-4 h-4 text-muted-foreground" />;
  }
};

const getTitleColor = (type: string) => {
  switch (type) {
    case "product_sold": return "text-amber-600";
    case "document_uploaded": return "text-purple-600";
    case "note_added": return "text-blue-600";
    case "profile_updated": return "text-green-600";
    case "compliance_created": return "text-[hsl(180,70%,45%)]";
    case "calendar_event": return "text-[hsl(180,70%,45%)]";
    default: return "text-foreground";
  }
};

const getNavigationType = (type: string): string | null => {
  switch (type) {
    case "note_added": return "notes";
    case "document_uploaded": return "documents";
    case "compliance_created": return "compliance";
    case "product_sold": return "crm";
    case "profile_updated": return "details";
    default: return null;
  }
};

export const RECENT_ACTIVITY_COUNT = 8;

const RecentActivityTab = ({ householdView, clientId, onCalendarEventClick, onActivityClick }: RecentActivityTabProps) => {
  const { events: calendarEvents } = useClientCalendarEvents(clientId);

  // Merge calendar events with static activities
  const calendarItems: Array<{id: string; type: string; title: string; description: string; timestamp: Date; calendarEvent?: ClientCalendarEvent}> = calendarEvents.map(e => ({
    id: e.id,
    type: "calendar_event",
    title: e.title,
    description: `${e.eventType} — ${format(e.startTime, "dd MMM, HH:mm")}`,
    timestamp: e.startTime,
    calendarEvent: e,
  }));

  const allItems: Array<{id: string; type: string; title: string; description: string; timestamp: Date; calendarEvent?: ClientCalendarEvent}> = [...calendarItems, ...staticActivities]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 10);

  return (
    <div className="space-y-0">
      {allItems.map((activity) => {
        const navType = activity.type === "calendar_event" ? null : getNavigationType(activity.type);
        const isClickable = activity.type === "calendar_event" || navType;

        return (
          <div
            key={activity.id}
            className={`flex gap-2 py-1.5 border-b border-border/50 last:border-0 ${isClickable ? 'cursor-pointer hover:bg-muted/50 rounded transition-colors px-1 -mx-1' : ''}`}
            onClick={() => {
              if (activity.type === "calendar_event" && activity.calendarEvent) {
                onCalendarEventClick?.(activity.calendarEvent);
              } else if (navType) {
                onActivityClick?.(navType);
              }
            }}
          >
            <div className="shrink-0 mt-0.5">{getActivityIcon(activity.type)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className={`font-medium text-xs ${getTitleColor(activity.type)}`}>{activity.title}</p>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RecentActivityTab;
