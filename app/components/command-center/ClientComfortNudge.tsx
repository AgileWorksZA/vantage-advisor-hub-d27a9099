import { useState } from "react";
import { AlertCircle, MessageSquare, Phone } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const clientConcerns = [
  {
    id: 1,
    name: "Peter Williams",
    initials: "PW",
    concern: "Market Volatility",
    note: "Client expressed worry about recent market downturn. Mentioned considering moving to cash.",
    date: "2 days ago",
    severity: "high",
    suggestedAction: "Schedule call to discuss defensive positioning",
  },
  {
    id: 2,
    name: "Sarah Joubert",
    initials: "SJ",
    concern: "Retirement Readiness",
    note: "Uncertain if retirement savings will be sufficient. Asked about pension options.",
    date: "3 days ago",
    severity: "medium",
    suggestedAction: "Prepare retirement projection analysis",
  },
  {
    id: 3,
    name: "Michael Naidoo",
    initials: "MN",
    concern: "Fee Structure",
    note: "Questioned the value of advisory fees versus DIY investing. Mentioned a friend using a robo-advisor.",
    date: "1 week ago",
    severity: "medium",
    suggestedAction: "Schedule value demonstration meeting",
  },
];

export const ClientComfortNudge = () => {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [actionOpen, setActionOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<
    (typeof clientConcerns)[0] | null
  >(null);
  const [followUpNote, setFollowUpNote] = useState("");

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "hsl(0,84%,60%)";
      case "medium":
        return "hsl(45,93%,47%)";
      default:
        return "hsl(210,70%,40%)";
    }
  };

  const handleTakeAction = (client: (typeof clientConcerns)[0]) => {
    setSelectedClient(client);
    setFollowUpNote("");
    setActionOpen(true);
  };

  const handleLogAction = () => {
    toast.success(`Follow-up logged for ${selectedClient?.name}`);
    setActionOpen(false);
    setSelectedClient(null);
  };

  return (
    <>
      <NudgeCard
        title="Client Comfort Alerts"
        icon={<AlertCircle className="w-4 h-4 text-[hsl(45,93%,47%)]" />}
        reasoning="3 clients have expressed concerns in recent notes or communications. Proactive outreach can prevent client attrition."
        actionLabel="Review Concerns"
        onAction={() => setSheetOpen(true)}
        urgencyColor="hsl(45,93%,47%)"
        badge="3 concerns"
      >
        <div className="space-y-2">
          {clientConcerns.slice(0, 2).map((concern) => (
            <div
              key={concern.id}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: getSeverityColor(concern.severity) }}
                />
                <span className="truncate max-w-[100px]">{concern.name}</span>
              </div>
              <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                {concern.concern}
              </span>
            </div>
          ))}
          {clientConcerns.length > 2 && (
            <p className="text-xs text-muted-foreground">
              +{clientConcerns.length - 2} more...
            </p>
          )}
        </div>
      </NudgeCard>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Client Comfort Concerns</SheetTitle>
            <SheetDescription>
              AI-detected concerns from client notes and communications
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            {clientConcerns.map((concern) => (
              <div
                key={concern.id}
                className="p-4 border rounded-lg"
                style={{
                  borderLeftWidth: 4,
                  borderLeftColor: getSeverityColor(concern.severity),
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {concern.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{concern.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {concern.date}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    style={{ borderColor: getSeverityColor(concern.severity) }}
                  >
                    {concern.concern}
                  </Badge>
                </div>

                <div className="bg-muted/50 p-3 rounded-md mb-3">
                  <p className="text-sm italic text-muted-foreground">
                    "{concern.note}"
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    <strong>Suggested:</strong> {concern.suggestedAction}
                  </p>
                  <Button size="sm" onClick={() => handleTakeAction(concern)}>
                    Take Action
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={actionOpen} onOpenChange={setActionOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Follow Up Action</SheetTitle>
            <SheetDescription>for {selectedClient?.name}</SheetDescription>
          </SheetHeader>

          {selectedClient && (
            <div className="mt-6 space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Concern</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedClient.concern}: {selectedClient.note}
                </p>
              </div>

              <div className="p-4 bg-[hsl(210,70%,40%)]/10 rounded-lg border border-[hsl(210,70%,40%)]/20">
                <h4 className="font-medium mb-2 text-[hsl(210,70%,40%)]">
                  AI Suggested Action
                </h4>
                <p className="text-sm">{selectedClient.suggestedAction}</p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <Phone className="w-4 h-4 mr-1" />
                  Schedule Call
                </Button>
                <Button variant="outline" className="flex-1">
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Send Email
                </Button>
              </div>

              <div>
                <label className="text-sm font-medium">Follow-up Notes</label>
                <Textarea
                  value={followUpNote}
                  onChange={(e) => setFollowUpNote(e.target.value)}
                  placeholder="Log your follow-up action..."
                  className="mt-2"
                />
              </div>

              <Button className="w-full" onClick={handleLogAction}>
                Log & Complete
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};
