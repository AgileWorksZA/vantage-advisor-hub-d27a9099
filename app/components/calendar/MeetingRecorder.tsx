import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Square, Loader2, FileAudio, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

interface MeetingRecorderProps {
  isRecording: boolean;
  duration: number;
  transcriptionStatus?: "pending" | "processing" | "completed" | "failed";
  isTranscribing: boolean;
  isAnalyzing: boolean;
  hasTranscription: boolean;
  hasAnalysis: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onTranscribe: () => void;
  onAnalyze: () => void;
}

export function MeetingRecorder({
  isRecording,
  duration,
  transcriptionStatus,
  isTranscribing,
  isAnalyzing,
  hasTranscription,
  hasAnalysis,
  onStartRecording,
  onStopRecording,
  onTranscribe,
  onAnalyze,
}: MeetingRecorderProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const getStatusBadge = () => {
    if (isRecording) {
      return <Badge variant="destructive" className="animate-pulse">Recording</Badge>;
    }
    if (isTranscribing) {
      return <Badge variant="secondary">Transcribing...</Badge>;
    }
    if (isAnalyzing) {
      return <Badge variant="secondary">Analyzing...</Badge>;
    }
    if (transcriptionStatus === "completed" && hasAnalysis) {
      return <Badge className="bg-green-500 hover:bg-green-600">Ready</Badge>;
    }
    if (transcriptionStatus === "completed") {
      return <Badge variant="outline">Transcribed</Badge>;
    }
    if (transcriptionStatus === "processing") {
      return <Badge variant="secondary">Processing</Badge>;
    }
    if (transcriptionStatus === "failed") {
      return <Badge variant="destructive">Failed</Badge>;
    }
    if (transcriptionStatus === "pending") {
      return <Badge variant="outline">Pending</Badge>;
    }
    return null;
  };

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Mic className="w-4 h-4" />
            Meeting Recorder
          </CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Recording Timer */}
        {isRecording && (
          <div className="flex items-center justify-center py-2">
            <div className="flex items-center gap-2 text-2xl font-mono">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              {formatDuration(duration)}
            </div>
          </div>
        )}

        {/* Recording Controls */}
        <div className="flex items-center gap-2">
          {!isRecording ? (
            <Button
              onClick={onStartRecording}
              className="flex-1 bg-[hsl(180,70%,45%)] hover:bg-[hsl(180,70%,40%)]"
              disabled={isTranscribing || isAnalyzing}
            >
              <Mic className="w-4 h-4 mr-2" />
              Start Recording
            </Button>
          ) : (
            <Button
              onClick={onStopRecording}
              variant="destructive"
              className="flex-1"
            >
              <Square className="w-4 h-4 mr-2" />
              Stop Recording
            </Button>
          )}
        </div>

        {/* Processing Controls */}
        {transcriptionStatus === "pending" && !isRecording && (
          <div className="flex items-center gap-2">
            <Button
              onClick={onTranscribe}
              variant="outline"
              className="flex-1"
              disabled={isTranscribing}
            >
              {isTranscribing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FileAudio className="w-4 h-4 mr-2" />
              )}
              Transcribe
            </Button>
          </div>
        )}

        {transcriptionStatus === "completed" && !hasAnalysis && (
          <div className="flex items-center gap-2">
            <Button
              onClick={onAnalyze}
              variant="outline"
              className="flex-1"
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Brain className="w-4 h-4 mr-2" />
              )}
              Generate AI Notes
            </Button>
          </div>
        )}

        {/* Processing Status */}
        {(isTranscribing || isAnalyzing) && (
          <div className="text-center text-sm text-muted-foreground">
            {isTranscribing && "Processing audio... This may take a minute."}
            {isAnalyzing && "AI is analyzing the meeting..."}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
