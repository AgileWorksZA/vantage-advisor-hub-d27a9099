import { useState } from "react";
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

const channelIcons: Record<Communication["channel"], React.ComponentType<any>> = {
  "Email": Mail,
  "SMS": MessageSquare,
  "Phone": Phone,
  "WhatsApp": Send,
  "Push": Mail,
  "Webinar": Mail,
  "Office Event": Mail,
};

const ClientCommunicationTab = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const [emailPage, setEmailPage] = useState(1);
  const [activeChannel, setActiveChannel] = useState<Communication["channel"] | null>(null);
  
  const { communications, channelCounts, loading, refetch } = useClientCommunications(clientId || "");

  const handleChannelClick = (channel: Communication["channel"]) => {
    setActiveChannel(channel);
    refetch(channel);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      {/* Left Sidebar - Communication Categories */}
      <div className="w-64 shrink-0">
        <div className="bg-background rounded-lg border border-border">
          {channelCounts.map((category) => {
            const Icon = channelIcons[category.channel];
            return (
              <button
                key={category.channel}
                onClick={() => handleChannelClick(category.channel)}
                className={`w-full flex items-center justify-between px-4 py-3 border-b border-border last:border-0 hover:bg-muted/50 transition-colors ${
                  activeChannel === category.channel ? "bg-muted" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{category.channel}</span>
                </div>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
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
          <h2 className="text-lg font-medium">Communication {activeChannel || "All"}</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => { setActiveChannel(null); refetch(); }}>
              <RotateCcw className="w-4 h-4" />
              Reset
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
                <TableHead className="text-xs font-normal text-muted-foreground">Date sent</TableHead>
                <TableHead className="text-xs font-normal text-muted-foreground">From</TableHead>
                <TableHead className="text-xs font-normal text-muted-foreground">Subject</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {communications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No communications found.
                  </TableCell>
                </TableRow>
              ) : (
                communications.map((comm, idx) => (
                  <TableRow key={comm.id} className="hover:bg-muted/50">
                    <TableCell className="text-sm">{idx + 1}</TableCell>
                    <TableCell className="text-sm whitespace-nowrap">{comm.dateSent}</TableCell>
                    <TableCell className="text-sm">{comm.from}</TableCell>
                    <TableCell className="text-sm">{comm.subject}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
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
  );
};

export default ClientCommunicationTab;
