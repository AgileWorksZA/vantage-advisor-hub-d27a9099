import { useState } from "react";
import { CalendarClock, Phone, Mail, CheckCircle } from "lucide-react";
import { NudgeCard } from "./NudgeCard";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const reviewsDue = [
  {
    id: 1,
    name: "Van Der Berg Family Trust",
    initials: "VB",
    lastReview: "15 months ago",
    portfolioValue: "R 4,250,000",
    reviewType: "Annual",
    status: "overdue",
  },
  {
    id: 2,
    name: "Peter Williams",
    initials: "PW",
    lastReview: "11 months ago",
    portfolioValue: "R 2,180,000",
    reviewType: "Annual",
    status: "due_soon",
  },
  {
    id: 3,
    name: "Khumalo Investments CC",
    initials: "KI",
    lastReview: "13 months ago",
    portfolioValue: "R 8,450,000",
    reviewType: "Annual",
    status: "overdue",
  },
  {
    id: 4,
    name: "Maria Pretorius",
    initials: "MP",
    lastReview: "10 months ago",
    portfolioValue: "R 1,560,000",
    reviewType: "Annual",
    status: "due_soon",
  },
];

export const ReviewRemindersNudge = () => {
  const [sheetOpen, setSheetOpen] = useState(false);

  const overdueCount = reviewsDue.filter((r) => r.status === "overdue").length;
  const dueSoonCount = reviewsDue.filter((r) => r.status === "due_soon").length;

  const handleScheduleReview = (client: (typeof reviewsDue)[0]) => {
    toast.success(`Review scheduled for ${client.name}`);
  };

  const handleMarkComplete = (client: (typeof reviewsDue)[0]) => {
    toast.success(`Review marked complete for ${client.name}`);
  };

  return (
    <>
      <NudgeCard
        title="Review Reminders"
        icon={<CalendarClock className="w-4 h-4 text-[hsl(210,70%,40%)]" />}
        reasoning={`${overdueCount} clients have overdue reviews and ${dueSoonCount} are due soon. Regular reviews maintain compliance and strengthen client relationships.`}
        actionLabel="Manage Reviews"
        onAction={() => setSheetOpen(true)}
        urgencyColor="hsl(210,70%,40%)"
        badge={`${reviewsDue.length} reviews`}
      >
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Overdue</span>
            <span className="font-semibold text-destructive">{overdueCount}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Due Soon</span>
            <span className="font-medium text-[hsl(45,93%,47%)]">
              {dueSoonCount}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total AUM Affected</span>
            <span className="font-medium">R 16.4M</span>
          </div>
        </div>
      </NudgeCard>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Client Review Schedule</SheetTitle>
            <SheetDescription>
              Manage annual and periodic client reviews
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            {reviewsDue.map((client) => (
              <div
                key={client.id}
                className="p-4 border rounded-lg"
                style={{
                  borderLeftWidth: 4,
                  borderLeftColor:
                    client.status === "overdue"
                      ? "hsl(0,84%,60%)"
                      : "hsl(45,93%,47%)",
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {client.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{client.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {client.portfolioValue}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      client.status === "overdue"
                        ? "border-destructive text-destructive"
                        : "border-[hsl(45,93%,47%)] text-[hsl(45,93%,47%)]"
                    }
                  >
                    {client.status === "overdue" ? "Overdue" : "Due Soon"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="text-muted-foreground">
                    Last Review: {client.lastReview}
                  </span>
                  <span className="text-xs">
                    {client.reviewType} Review
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleScheduleReview(client)}
                  >
                    <Phone className="w-4 h-4 mr-1" />
                    Schedule
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleScheduleReview(client)}
                  >
                    <Mail className="w-4 h-4 mr-1" />
                    Email
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => handleMarkComplete(client)}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Complete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
