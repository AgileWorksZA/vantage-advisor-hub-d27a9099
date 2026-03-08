import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing auth" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from token
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!);
    const { data: { user }, error: userError } = await anonClient.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = user.id;

    // Clear existing notifications for this user
    await supabase.from("notifications").delete().eq("user_id", userId);

    // Fetch real task IDs to link notifications
    const { data: tasks } = await supabase
      .from("tasks")
      .select("id, title")
      .eq("user_id", userId)
      .limit(5);

    const taskIds = (tasks || []).map((t: any) => t.id);

    const notifications = [
      { type: "task", title: tasks?.[0]?.title || "Task ONBOARD - 96724", description: "Client onboarding pending review.", created_at: "2025-09-11T09:00:00Z", is_read: false, task_id: taskIds[0] || null, opportunity_tag: "New Business" },
      { type: "general", title: "Reminder", description: "Monthly portfolio review reminder for all clients.", created_at: "2025-09-10T11:00:00Z", is_read: false, task_id: null, opportunity_tag: null },
      { type: "transaction", title: "Transaction Alert", description: "Large withdrawal detected on client account.", created_at: "2025-09-10T12:00:00Z", is_read: false, task_id: null, opportunity_tag: "Upsell" },
      { type: "communication", title: "Client Message", description: "New message from client regarding policy update.", created_at: "2025-09-10T13:00:00Z", is_read: false, task_id: null, opportunity_tag: null },
      { type: "task", title: tasks?.[1]?.title || "Task Onboarding Task - ONBOARD - 94911", description: "The task has been completed.", created_at: "2025-08-07T09:00:00Z", is_read: true, task_id: taskIds[1] || null, opportunity_tag: "New Business" },
      { type: "task", title: tasks?.[2]?.title || "Annual Review", description: "Annual review completed successfully.", created_at: "2025-08-13T09:00:00Z", is_read: true, task_id: taskIds[2] || null, opportunity_tag: "Portfolio Review" },
      { type: "task", title: tasks?.[3]?.title || "Portfolio Review", description: "Portfolio review completed.", created_at: "2025-08-13T10:00:00Z", is_read: true, task_id: taskIds[3] || null, opportunity_tag: "Portfolio Review" },
      { type: "task", title: tasks?.[4]?.title || "Compliance Check", description: "Compliance documentation review pending.", created_at: "2025-08-12T09:00:00Z", is_read: true, task_id: taskIds[4] || null, opportunity_tag: null },
      { type: "task", title: "Follow-up Required", description: "Client follow-up after annual review meeting.", created_at: "2025-08-08T09:00:00Z", is_read: true, task_id: null, opportunity_tag: null },
    ].map((n) => ({ ...n, user_id: userId }));

    const { error } = await supabase.from("notifications").insert(notifications);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, count: notifications.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
