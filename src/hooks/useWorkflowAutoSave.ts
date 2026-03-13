import { useEffect, useRef, useState, useCallback } from "react";

interface AutoSaveOptions {
  onSave: () => Promise<void>;
  intervalMs?: number;
  enabled?: boolean;
}

export const useWorkflowAutoSave = ({ 
  onSave, 
  intervalMs = 120000, // 2 minutes
  enabled = true 
}: AutoSaveOptions) => {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isDirtyRef = useRef(false);

  const save = useCallback(async () => {
    if (!isDirtyRef.current || isSaving) return;
    
    try {
      setIsSaving(true);
      await onSave();
      setLastSaved(new Date());
      isDirtyRef.current = false;
    } catch (error) {
      console.error("Auto-save failed:", error);
    } finally {
      setIsSaving(false);
    }
  }, [onSave, isSaving]);

  const markDirty = useCallback(() => {
    isDirtyRef.current = true;
  }, []);

  const forceSave = useCallback(async () => {
    isDirtyRef.current = true;
    await save();
  }, [save]);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(save, intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, intervalMs, save]);

  // Save on unmount if dirty
  useEffect(() => {
    return () => {
      if (isDirtyRef.current) {
        save();
      }
    };
  }, [save]);

  const getTimeSinceLastSave = useCallback(() => {
    if (!lastSaved) return null;
    const diff = Date.now() - lastSaved.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    if (minutes === 1) return "1 minute ago";
    return `${minutes} minutes ago`;
  }, [lastSaved]);

  return {
    lastSaved,
    isSaving,
    markDirty,
    forceSave,
    getTimeSinceLastSave,
  };
};
