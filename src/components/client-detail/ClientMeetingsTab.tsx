import { useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Search,
  Mic,
  Clock,
  ChevronDown,
  ChevronRight,
  FileText,
  Brain,
  CheckSquare,
  Trash2,
  Play,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { useMeetingRecordings, MeetingRecording } from "@/hooks/useMeetingRecordings";
import { TranscriptionPanel } from "@/components/calendar/TranscriptionPanel";
import { ActionItemsList } from "@/components/calendar/ActionItemsList";
import { supabase } from "@/integrations/supabase/client";

const ClientMeetingsTab = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const {
    recordings,
    loading,
    processingState,
    transcribeRecording,
    processRecording,
    deleteRecording,
  } = useMeetingRecordings(undefined, clientId);

  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [processingId, setProcessingId] = useState<string | null>(null);

  const filteredRecordings = recordings.filter((recording) =>
    recording.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "—";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  const getStatusBadge = (recording: MeetingRecording) => {
    if (recording.aiActionItems && recording.aiActionItems.length > 0) {
      return <Badge className="bg-green-500 hover:bg-green-600">AI Ready</Badge>;
    }
    if (recording.transcriptionStatus === "completed") {
      return <Badge variant="secondary">Transcribed</Badge>;
    }
    if (recording.transcriptionStatus === "processing") {
      return <Badge variant="outline">Processing</Badge>;
    }
    if (recording.transcriptionStatus === "failed") {
      return <Badge variant="destructive">Failed</Badge>;
    }
    return <Badge variant="outline">Pending</Badge>;
  };

  const handleTranscribe = async (recordingId: string) => {
    setProcessingId(recordingId);
    await transcribeRecording(recordingId);
    setProcessingId(null);
  };

  const handleAnalyze = async (recordingId: string) => {
    setProcessingId(recordingId);
    await processRecording(recordingId);
    setProcessingId(null);
  };

  const handlePlayAudio = async (recordingUrl: string) => {
    try {
      const { data } = await supabase.storage
        .from("meeting-recordings")
        .createSignedUrl(recordingUrl, 3600);

      if (data?.signedUrl) {
        const audio = new Audio(data.signedUrl);
        audio.play();
      }
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Meeting Recordings</h2>
          <p className="text-sm text-muted-foreground">
            Recorded meetings, transcriptions, and AI-generated notes
          </p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search meetings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Empty State */}
      {filteredRecordings.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Mic className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-1">No Recordings Yet</p>
              <p className="text-sm">
                Start recording meetings from the Calendar to see them here
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"></TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecordings.map((recording) => (
                <Collapsible
                  key={recording.id}
                  open={expandedRows.has(recording.id)}
                  onOpenChange={() => toggleRow(recording.id)}
                  asChild
                >
                  <>
                    <CollapsibleTrigger asChild>
                      <TableRow className="cursor-pointer hover:bg-muted/50">
                        <TableCell>
                          {expandedRows.has(recording.id) ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </TableCell>
                        <TableCell>
                          {recording.recordingStartedAt
                            ? format(new Date(recording.recordingStartedAt), "dd MMM yyyy")
                            : format(new Date(recording.createdAt), "dd MMM yyyy")}
                        </TableCell>
                        <TableCell className="font-medium">
                          {recording.title}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {formatDuration(recording.durationSeconds)}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(recording)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {recording.recordingUrl && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePlayAudio(recording.recordingUrl!);
                                }}
                              >
                                <Play className="w-4 h-4" />
                              </Button>
                            )}
                            {recording.transcriptionStatus === "pending" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTranscribe(recording.id);
                                }}
                                disabled={processingId === recording.id}
                              >
                                {processingId === recording.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <FileText className="w-4 h-4" />
                                )}
                              </Button>
                            )}
                            {recording.transcriptionStatus === "completed" &&
                              !recording.aiActionItems && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAnalyze(recording.id);
                                  }}
                                  disabled={processingId === recording.id}
                                >
                                  {processingId === recording.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Brain className="w-4 h-4" />
                                  )}
                                </Button>
                              )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteRecording(recording.id);
                              }}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    </CollapsibleTrigger>
                    <CollapsibleContent asChild>
                      <TableRow>
                        <TableCell colSpan={6} className="bg-muted/30 p-4">
                          <div className="space-y-4">
                            <TranscriptionPanel
                              transcription={recording.transcription}
                              aiSummary={recording.aiSummary}
                            />
                            <ActionItemsList
                              actionItems={recording.aiActionItems}
                              clientId={clientId || null}
                            />
                            {!recording.transcription && !recording.aiSummary && (
                              <div className="text-center py-4 text-muted-foreground">
                                <p>No transcription or analysis available yet.</p>
                                {recording.transcriptionStatus === "pending" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-2"
                                    onClick={() => handleTranscribe(recording.id)}
                                    disabled={processingId === recording.id}
                                  >
                                    {processingId === recording.id ? (
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                      <FileText className="w-4 h-4 mr-2" />
                                    )}
                                    Transcribe Recording
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    </CollapsibleContent>
                  </>
                </Collapsible>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
};

export default ClientMeetingsTab;
