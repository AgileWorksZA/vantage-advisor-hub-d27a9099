import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface NotificationSoundSettings {
  notification_sound_enabled: boolean;
  notification_push_enabled: boolean;
  notification_critical_only_sound: boolean;
}

// Simple beep as a data URI so we don't need an external file
const NOTIFICATION_SOUND_URI =
  "data:audio/wav;base64,UklGRlQFAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YTAFAACAgICAgICAgICAgICAgICAgICA" +
  "gIB/f4CBgoOEhYaHiImKi4yNjo+QkZKTlJWWl5iZmpucnZ6foKGio6SlpqeoqaqrrK2ur7CxsrO0tba3" +
  "uLm6u7y9vr/AwcLDxMXGx8jJysvMzc7P0NHS09TV1tfY2drb3N3e3+Dh4uPk5ebn6Onq6+zt7u/w8fLz" +
  "9PX29/j5+vv8/f7/AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8gISIjJCUmJygpKissLS4v" +
  "MDEyMzQ1Njc4OTo7PD0+P0BBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWltcXV5fYGFiY2RlZmdoaWpr" +
  "bG1ub3BxcnN0dXZ3eHl6e3x9fn+AgYKDhIWGh4iJiouMjY6PkJGSk5SVlpeYmZqbnJ2en6ChoqOkpaan" +
  "qKmqq6ytrq+wsbKztLW2t7i5uru8vb6/wMHCw8TFxsfIycrLzM3Oz9DR0tPU1dbX2Nna29zd3t/g4eLj" +
  "5OXm5+jp6uvs7e7v8PHy8/T19vf4+fr7/P3+/wABAgMEBQYHCAkKCwwNDg8QERITFBUWFxgZGhscHR4f";

const CRITICAL_TYPES = ["task", "communication"];

function isCriticalNotification(n: Notification): boolean {
  return CRITICAL_TYPES.includes(n.type) || (n.opportunity_tag?.toLowerCase().includes("compliance") ?? false);
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const { settings } = useUserSettings();
  const knownIdsRef = useRef<Set<string>>(new Set());
  const initialLoadDone = useRef(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
  }, []);

  const playSound = useCallback(() => {
    try {
      const audio = new Audio(NOTIFICATION_SOUND_URI);
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch {}
  }, []);

  const showPushNotification = useCallback((notification: Notification) => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;
    try {
      new window.Notification(notification.title, {
        body: notification.description || undefined,
        icon: "/favicon.ico",
        tag: notification.id,
      });
    } catch {}
  }, []);

  const handleNewNotification = useCallback(
    (notification: Notification) => {
      const soundEnabled = settings?.notification_sound_enabled ?? true;
      const criticalOnly = settings?.notification_critical_only_sound ?? false;
      const pushEnabled = settings?.notification_push_enabled ?? false;

      const shouldSound = soundEnabled && (!criticalOnly || isCriticalNotification(notification));
      if (shouldSound) playSound();
      if (pushEnabled) showPushNotification(notification);
    },
    [settings, playSound, showPushNotification]
  );

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("is_dismissed", false)
      .order("created_at", { ascending: false });

    if (data) {
      const typed = data as unknown as Notification[];
      // Detect new notifications after initial load
      if (initialLoadDone.current) {
        for (const n of typed) {
          if (!knownIdsRef.current.has(n.id)) {
            handleNewNotification(n);
          }
        }
      }
      knownIdsRef.current = new Set(typed.map((n) => n.id));
      initialLoadDone.current = true;
      setNotifications(typed);
    }
  }, [userId, handleNewNotification]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
  };

  const dismiss = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    await supabase.from("notifications").update({ is_dismissed: true }).eq("id", id);
  };

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    if (!userId) return;
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_dismissed", false);
  };

  const clearAll = async () => {
    setNotifications([]);
    if (!userId) return;
    await supabase
      .from("notifications")
      .update({ is_dismissed: true })
      .eq("user_id", userId)
      .eq("is_dismissed", false);
  };

  const requestPushPermission = async (): Promise<NotificationPermission> => {
    if (typeof window === "undefined" || !("Notification" in window)) return "denied";
    return Notification.requestPermission();
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    dismiss,
    markAllRead,
    clearAll,
    requestPushPermission,
  };
};
