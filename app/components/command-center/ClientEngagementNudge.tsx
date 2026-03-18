import { useState } from "react";
import { Cake, Send, Gift } from "lucide-react";
import { NudgeCard } from "./NudgeCard";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

const upcomingEvents = [
  {
    id: 1,
    name: "Andre Thomas Coetzer",
    initials: "AC",
    event: "Birthday",
    date: "28 January",
    age: 42,
  },
  {
    id: 2,
    name: "Elsie Sophia Lourens",
    initials: "EL",
    event: "Birthday",
    date: "28 January",
    age: 65,
  },
  {
    id: 3,
    name: "Samuel de Jager",
    initials: "SD",
    event: "Birthday",
    date: "29 January",
    age: 69,
  },
  {
    id: 4,
    name: "Van Der Berg Family Trust",
    initials: "VB",
    event: "Anniversary",
    date: "30 January",
    years: 5,
  },
  {
    id: 5,
    name: "Maria Pretorius",
    initials: "MP",
    event: "Birthday",
    date: "1 February",
    age: 58,
  },
];

export const ClientEngagementNudge = () => {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<
    (typeof upcomingEvents)[0] | null
  >(null);
  const [message, setMessage] = useState("");

  const handleSendMessage = (client: (typeof upcomingEvents)[0]) => {
    setSelectedClient(client);
    setMessage(
      client.event === "Birthday"
        ? `Dear ${client.name.split(" ")[0]},\n\nWishing you a wonderful birthday! May this year bring you health, happiness, and prosperity.\n\nWarm regards,\nYour Financial Advisor`
        : `Dear ${client.name},\n\nCongratulations on your ${client.years}-year anniversary with us! We're honored to have been part of your financial journey.\n\nBest wishes,\nYour Financial Advisor`
    );
    setMessageOpen(true);
  };

  const handleSend = () => {
    toast.success(`Message sent to ${selectedClient?.name}`);
    setMessageOpen(false);
    setSelectedClient(null);
  };

  return (
    <>
      <NudgeCard
        title="Client Birthdays & Events"
        icon={<Cake className="w-4 h-4 text-[hsl(210,70%,40%)]" />}
        reasoning="5 clients have upcoming birthdays or anniversaries this week. Personal outreach strengthens client relationships and retention."
        actionLabel="View & Send Messages"
        onAction={() => setSheetOpen(true)}
        urgencyColor="hsl(210,70%,40%)"
        badge="5 this week"
      >
        <div className="space-y-2">
          {upcomingEvents.slice(0, 3).map((event) => (
            <div
              key={event.id}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs bg-[hsl(210,70%,40%)] text-white">
                    {event.initials}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate max-w-[120px]">
                  {event.name.split(" ")[0]}
                </span>
              </div>
              <span className="text-muted-foreground text-xs">{event.date}</span>
            </div>
          ))}
          {upcomingEvents.length > 3 && (
            <p className="text-xs text-muted-foreground">
              +{upcomingEvents.length - 3} more...
            </p>
          )}
        </div>
      </NudgeCard>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Upcoming Client Events</SheetTitle>
            <SheetDescription>
              Send personalized messages to strengthen relationships
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-[hsl(210,70%,40%)] text-white">
                      {event.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{event.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {event.event === "Birthday" ? (
                        <Cake className="w-3 h-3" />
                      ) : (
                        <Gift className="w-3 h-3" />
                      )}
                      <span>
                        {event.event} - {event.date}
                      </span>
                      {event.age && <span>({event.age} yrs)</span>}
                      {event.years && <span>({event.years} years)</span>}
                    </div>
                  </div>
                </div>
                <Button size="sm" onClick={() => handleSendMessage(event)}>
                  <Send className="w-4 h-4 mr-1" />
                  Send
                </Button>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={messageOpen} onOpenChange={setMessageOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Send Message</SheetTitle>
            <SheetDescription>to {selectedClient?.name}</SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[200px]"
            />
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setMessageOpen(false)}
              >
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleSend}>
                <Send className="w-4 h-4 mr-1" />
                Send Message
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
