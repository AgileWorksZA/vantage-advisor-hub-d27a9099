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

    const notifications = [
      { type: "task", title: "Task", description: "This is just a test enjoy!", created_at: "2025-07-08T10:00:00Z", is_read: false, task_id: null, opportunity_tag: "Cross-sell" },
      { type: "general", title: "Reminder", description: "This is just a test enjoy!", created_at: "2025-07-08T11:00:00Z", is_read: false, task_id: null, opportunity_tag: null },
      { type: "transaction", title: "Transaction", description: "This is just a test enjoy!", created_at: "2025-07-08T12:00:00Z", is_read: false, task_id: null, opportunity_tag: "Upsell" },
      { type: "communication", title: "Communication", description: "This is just a test enjoy!", created_at: "2025-07-08T13:00:00Z", is_read: false, task_id: null, opportunity_tag: null },
      { type: "task", title: "Task Onboarding Task - ONBOARD - 94911", description: "The task has been completed.", created_at: "2025-08-07T09:00:00Z", is_read: true, task_id: null, opportunity_tag: "New Business" },
      { type: "task", title: "Task Onboarding Task - ONBOARD - 94911", description: "The task has been completed.", created_at: "2025-08-08T09:00:00Z", is_read: true, task_id: null, opportunity_tag: null },
      { type: "task", title: "Annual Review", description: "The task has been completed.", created_at: "2025-08-13T09:00:00Z", is_read: true, task_id: null, opportunity_tag: "Portfolio Review" },
      { type: "task", title: "Portfolio Review", description: "The task has been completed.", created_at: "2025-08-13T10:00:00Z", is_read: true, task_id: null, opportunity_tag: "Portfolio Review" },
      { type: "task", title: "Task ONBOARD - 96724", description: "Client onboarding pending review.", created_at: "2025-09-11T09:00:00Z", is_read: false, task_id: null, opportunity_tag: "New Business" },
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
