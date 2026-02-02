import { useState, useCallback, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface MeetingRecording {
  id: string;
  userId: string;
  calendarEventId: string | null;
  clientId: string | null;
  title: string;
  recordingUrl: string | null;
  durationSeconds: number | null;
  transcription: string | null;
  transcriptionStatus: "pending" | "processing" | "completed" | "failed";
  aiSummary: AISummary | null;
  aiActionItems: AIActionItem[] | null;
  recordingStartedAt: string | null;
  recordingEndedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AISummary {
  summary: string;
  key_topics: string[];
  decisions_made: string[];
  client_facts: {
    retirement_date?: string;
    financial_goals?: string[];
    risk_tolerance?: string;
    life_events?: string[];
    family_details?: string[];
    concerns?: string[];
  };
  follow_up_date?: string;
}

export interface AIActionItem {
  title: string;
  description: string;
  priority: "High" | "Medium" | "Low";
  suggested_due_date: string;
  task_type: string;
  source_quote: string;
}

interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  recordingId: string | null;
}

export function useMeetingRecordings(calendarEventId?: string, clientId?: string) {
  const { toast } = useToast();
  const [recordings, setRecordings] = useState<MeetingRecording[]>([]);
  const [loading, setLoading] = useState(false);
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    recordingId: null,
  });
  const [processingState, setProcessingState] = useState<{
    transcribing: boolean;
    analyzing: boolean;
  }>({ transcribing: false, analyzing: false });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);

  // Fetch recordings
  const fetchRecordings = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("meeting_recordings")
        .select("*")
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

      if (calendarEventId) {
        query = query.eq("calendar_event_id", calendarEventId);
      }
      if (clientId) {
        query = query.eq("client_id", clientId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const mappedRecordings: MeetingRecording[] = (data || []).map((r) => ({
        id: r.id,
        userId: r.user_id,
        calendarEventId: r.calendar_event_id,
        clientId: r.client_id,
        title: r.title,
        recordingUrl: r.recording_url,
        durationSeconds: r.duration_seconds,
        transcription: r.transcription,
        transcriptionStatus: r.transcription_status,
        aiSummary: r.ai_summary as unknown as AISummary | null,
        aiActionItems: r.ai_action_items as unknown as AIActionItem[] | null,
        recordingStartedAt: r.recording_started_at,
        recordingEndedAt: r.recording_ended_at,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }));

      setRecordings(mappedRecordings);
    } catch (error) {
      console.error("Error fetching recordings:", error);
      toast({
        title: "Error",
        description: "Failed to fetch recordings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [calendarEventId, clientId, toast]);

  // Start recording
  const startRecording = useCallback(async (title: string, eventId?: string, eventClientId?: string) => {
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      audioChunksRef.current = [];
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Start recording
      mediaRecorder.start(1000); // Collect data every second
      startTimeRef.current = new Date();

      // Create database record
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: recording, error } = await supabase
        .from("meeting_recordings")
        .insert({
          user_id: user.id,
          title,
          calendar_event_id: eventId || calendarEventId || null,
          client_id: eventClientId || clientId || null,
          transcription_status: "pending",
          recording_started_at: startTimeRef.current.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Start duration timer
      durationIntervalRef.current = setInterval(() => {
        setRecordingState((prev) => ({
          ...prev,
          duration: prev.duration + 1,
        }));
      }, 1000);

      setRecordingState({
        isRecording: true,
        isPaused: false,
        duration: 0,
        recordingId: recording.id,
      });

      toast({
        title: "Recording Started",
        description: "Your meeting is now being recorded",
      });

      return recording.id;
    } catch (error) {
      console.error("Error starting recording:", error);
      toast({
        title: "Error",
        description: error instanceof Error && error.name === "NotAllowedError"
          ? "Microphone access was denied. Please allow microphone access to record."
          : "Failed to start recording",
        variant: "destructive",
      });
      return null;
    }
  }, [calendarEventId, clientId, toast]);

  // Stop recording
  const stopRecording = useCallback(async () => {
    return new Promise<string | null>((resolve) => {
      if (!mediaRecorderRef.current || !recordingState.recordingId) {
        resolve(null);
        return;
      }

      const recordingId = recordingState.recordingId;
      const mediaRecorder = mediaRecorderRef.current;

      mediaRecorder.onstop = async () => {
        try {
          // Clear duration timer
          if (durationIntervalRef.current) {
            clearInterval(durationIntervalRef.current);
            durationIntervalRef.current = null;
          }

          // Stop all tracks
          mediaRecorder.stream.getTracks().forEach((track) => track.stop());

          // Create audio blob
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          
          // Calculate duration
          const endTime = new Date();
          const durationSeconds = startTimeRef.current
            ? Math.floor((endTime.getTime() - startTimeRef.current.getTime()) / 1000)
            : recordingState.duration;

          // Upload to storage
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("Not authenticated");

          const filePath = `${user.id}/${recordingId}.webm`;
          const { error: uploadError } = await supabase.storage
            .from("meeting-recordings")
            .upload(filePath, audioBlob, {
              contentType: "audio/webm",
              upsert: true,
            });

          if (uploadError) throw uploadError;

          // Update database record
          const { error: updateError } = await supabase
            .from("meeting_recordings")
            .update({
              recording_url: filePath,
              duration_seconds: durationSeconds,
              recording_ended_at: endTime.toISOString(),
            })
            .eq("id", recordingId);

          if (updateError) throw updateError;

          setRecordingState({
            isRecording: false,
            isPaused: false,
            duration: 0,
            recordingId: null,
          });

          toast({
            title: "Recording Saved",
            description: `Recording saved (${Math.floor(durationSeconds / 60)}:${String(durationSeconds % 60).padStart(2, "0")})`,
          });

          // Refresh recordings list
          fetchRecordings();
          resolve(recordingId);
        } catch (error) {
          console.error("Error stopping recording:", error);
          toast({
            title: "Error",
            description: "Failed to save recording",
            variant: "destructive",
          });
          resolve(null);
        }
      };

      mediaRecorder.stop();
    });
  }, [recordingState.recordingId, recordingState.duration, toast, fetchRecordings]);

  // Transcribe recording
  const transcribeRecording = useCallback(async (recordingId: string) => {
    setProcessingState((prev) => ({ ...prev, transcribing: true }));
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await supabase.functions.invoke("transcribe-meeting", {
        body: { recordingId },
      });

      if (response.error) throw new Error(response.error.message);

      toast({
        title: "Transcription Complete",
        description: "Your meeting has been transcribed successfully",
      });

      // Refresh recordings
      fetchRecordings();
      return true;
    } catch (error) {
      console.error("Error transcribing:", error);
      toast({
        title: "Transcription Failed",
        description: error instanceof Error ? error.message : "Failed to transcribe recording",
        variant: "destructive",
      });
      return false;
    } finally {
      setProcessingState((prev) => ({ ...prev, transcribing: false }));
    }
  }, [toast, fetchRecordings]);

  // Process/analyze recording
  const processRecording = useCallback(async (recordingId: string) => {
    setProcessingState((prev) => ({ ...prev, analyzing: true }));
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await supabase.functions.invoke("process-meeting", {
        body: { recordingId },
      });

      if (response.error) throw new Error(response.error.message);

      toast({
        title: "Analysis Complete",
        description: "AI has analyzed your meeting and extracted action items",
      });

      // Refresh recordings
      fetchRecordings();
      return response.data;
    } catch (error) {
      console.error("Error processing:", error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze recording",
        variant: "destructive",
      });
      return null;
    } finally {
      setProcessingState((prev) => ({ ...prev, analyzing: false }));
    }
  }, [toast, fetchRecordings]);

  // Get single recording
  const getRecording = useCallback(async (recordingId: string) => {
    try {
      const { data, error } = await supabase
        .from("meeting_recordings")
        .select("*")
        .eq("id", recordingId)
        .single();

      if (error) throw error;

      return {
        id: data.id,
        userId: data.user_id,
        calendarEventId: data.calendar_event_id,
        clientId: data.client_id,
        title: data.title,
        recordingUrl: data.recording_url,
        durationSeconds: data.duration_seconds,
        transcription: data.transcription,
        transcriptionStatus: data.transcription_status,
        aiSummary: data.ai_summary as unknown as AISummary | null,
        aiActionItems: data.ai_action_items as unknown as AIActionItem[] | null,
        recordingStartedAt: data.recording_started_at,
        recordingEndedAt: data.recording_ended_at,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      } as MeetingRecording;
    } catch (error) {
      console.error("Error fetching recording:", error);
      return null;
    }
  }, []);

  // Delete recording
  const deleteRecording = useCallback(async (recordingId: string) => {
    try {
      const { error } = await supabase
        .from("meeting_recordings")
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq("id", recordingId);

      if (error) throw error;

      toast({
        title: "Recording Deleted",
        description: "The recording has been deleted",
      });

      fetchRecordings();
      return true;
    } catch (error) {
      console.error("Error deleting recording:", error);
      toast({
        title: "Error",
        description: "Failed to delete recording",
        variant: "destructive",
      });
      return false;
    }
  }, [toast, fetchRecordings]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchRecordings();
  }, [fetchRecordings]);

  return {
    recordings,
    loading,
    recordingState,
    processingState,
    startRecording,
    stopRecording,
    transcribeRecording,
    processRecording,
    getRecording,
    deleteRecording,
    refetch: fetchRecordings,
  };
}
