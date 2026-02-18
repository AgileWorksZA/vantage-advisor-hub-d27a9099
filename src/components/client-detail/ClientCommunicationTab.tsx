import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight, ChevronFirst, ChevronLast, RotateCcw, Eye, Search, Mail, MessageSquare, Phone, Send, Loader2 } from "lucide-react";
import { useClientCommunications, Communication } from "@/hooks/useClientCommunications";
import { useClientDetail } from "@/hooks/useClientDetail";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const channelIcons: Record<Communication["channel"], React.ComponentType<any>> = {
  "Email": Mail,
  "SMS": MessageSquare,
  "Phone": Phone,
  "WhatsApp": Send,
  "Push": Mail,
};

const getSentiment = (content: string | null): { color: string; label: string } => {
  if (!content) return { color: "bg-orange-400", label: "Neutral sentiment" };
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    hash = (hash * 31 + content.charCodeAt(i)) | 0;
  }
  const mod = ((hash % 3) + 3) % 3;
  if (mod === 0) return { color: "bg-green-500", label: "Positive sentiment detected" };
  if (mod === 1) return { color: "bg-orange-400", label: "Neutral sentiment" };
  return { color: "bg-red-500", label: "Negative sentiment detected" };
};

const getChannelContactInfo = (
  channel: Communication["channel"],
  client: { email?: string | null; cell_number?: string | null } | null
): string | null => {
  if (!client) return null;
  if (channel === "Email") return client.email || null;
  if (channel === "SMS" || channel === "WhatsApp" || channel === "Phone") return client.cell_number || null;
  return null;
};

const ClientCommunicationTab = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const [emailPage, setEmailPage] = useState(1);
  const [activeChannel, setActiveChannel] = useState<Communication["channel"] | null>(null);
  const [directionFilter, setDirectionFilter] = useState<string>("all");

  const { communications, channelCounts, loading, refetch } = useClientCommunications(clientId || "");
  const { client } = useClientDetail(clientId);

  const handleChannelClick = (channel: Communication["channel"]) => {
    setActiveChannel(channel);
    refetch(channel);
  };

  const filteredComms = useMemo(() => {
    if (directionFilter === "all") return communications;
    const dir = directionFilter === "received" ? "Inbound" : "Outbound";
    return communications.filter((c) => c.direction === dir);
  }, [communications, directionFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex gap-6">
        {/* Left Sidebar - Communication Categories */}
        <div className="w-64 shrink-0">
          <div className="bg-background rounded-lg border border-border">
            {channelCounts.map((category) => {
              const Icon = channelIcons[category.channel];
              const contactInfo = getChannelContactInfo(category.channel, client);
              return (
                <button
                  key={category.channel}
                  onClick={() => handleChannelClick(category.channel)}
                  className={`w-full flex items-center justify-between px-4 py-3 border-b border-border last:border-0 hover:bg-muted/50 transition-colors ${
                    activeChannel === category.channel ? "bg-muted" : ""
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div className="flex flex-col items-start min-w-0">
                      <span className="text-sm">{category.channel}</span>
                      {contactInfo && (
                        <span className="text-[10px] text-muted-foreground truncate max-w-[140px]">{contactInfo}</span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded shrink-0">
                    {category.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content - Communications Table */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">{activeChannel || "All"}</h2>
          <div className="flex items-center gap-2">
              <ToggleGroup type="single" value={directionFilter} onValueChange={(v) => v && setDirectionFilter(v)} variant="outline" size="sm">
                <ToggleGroupItem value="all">All</ToggleGroupItem>
                <ToggleGroupItem value="received">Received</ToggleGroupItem>
                <ToggleGroupItem value="sent">Sent</ToggleGroupItem>
              </ToggleGroup>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => { setActiveChannel(null); refetch(); }}>
                <RotateCcw className="w-4 h-4" />
                Refresh
              </Button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-10 w-64" />
              </div>
            </div>
          </div>

          <div className="bg-background rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs font-normal text-muted-foreground w-12">#</TableHead>
                  <TableHead className="text-xs font-normal text-muted-foreground w-8"></TableHead>
                  <TableHead className="text-xs font-normal text-muted-foreground">Date sent</TableHead>
                  <TableHead className="text-xs font-normal text-muted-foreground">From</TableHead>
                  <TableHead className="text-xs font-normal text-muted-foreground">Subject</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredComms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No communications found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredComms.map((comm, idx) => {
                    const sentiment = getSentiment(comm.content);
                    return (
                      <TableRow key={comm.id} className="hover:bg-muted/50">
                        <TableCell className="text-sm">{idx + 1}</TableCell>
                        <TableCell>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className={`inline-block w-2.5 h-2.5 rounded-full ${sentiment.color}`} />
                            </TooltipTrigger>
                            <TooltipContent side="right">
                              <p className="text-xs">{sentiment.label}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                        <TableCell className="text-sm whitespace-nowrap">{comm.dateSent}</TableCell>
                        <TableCell className="text-sm">{comm.from}</TableCell>
                        <TableCell className="text-sm">{comm.subject}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={emailPage === 1}>
              <ChevronFirst className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={emailPage === 1}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground">Page {emailPage} of 1</span>
            <Button variant="outline" size="icon" className="h-8 w-8" disabled>
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" disabled>
              <ChevronLast className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default ClientCommunicationTab;
