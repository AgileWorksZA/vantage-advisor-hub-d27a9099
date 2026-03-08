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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get the authenticated user from the auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No auth header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userError } = await anonClient.auth.getUser();
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = userData.user.id;

    // Fetch existing emails for this user
    const { data: emails, error: emailsError } = await supabase
      .from("emails")
      .select("id")
      .eq("user_id", userId)
      .limit(20);

    if (emailsError) throw emailsError;
    if (!emails || emails.length === 0) {
      return new Response(
        JSON.stringify({ message: "No emails found for user" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch existing tasks for this user
    const { data: tasks, error: tasksError } = await supabase
      .from("tasks")
      .select("id, task_number, task_type, client_id")
      .eq("user_id", userId)
      .limit(50);

    if (tasksError) throw tasksError;
    if (!tasks || tasks.length === 0) {
      return new Response(
        JSON.stringify({ message: "No tasks found for user" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Clear existing email_tasks for this user
    await supabase
      .from("email_tasks")
      .delete()
      .eq("user_id", userId);

    // Link tasks to emails - distribute tasks across the first several emails
    const emailTaskRows: Array<{
      user_id: string;
      email_id: string;
      task_id: string;
      is_linked: boolean;
    }> = [];

    // Give the first 5 emails 2-4 linked tasks each
    const emailsToSeed = emails.slice(0, 5);
    let taskIndex = 0;

    for (const email of emailsToSeed) {
      const tasksPerEmail = Math.min(2 + Math.floor(Math.random() * 3), tasks.length - taskIndex);
      for (let i = 0; i < tasksPerEmail && taskIndex < tasks.length; i++) {
        emailTaskRows.push({
          user_id: userId,
          email_id: email.id,
          task_id: tasks[taskIndex].id,
          is_linked: true,
        });
        taskIndex++;
      }
    }

    if (emailTaskRows.length > 0) {
      const { error: insertError } = await supabase
        .from("email_tasks")
        .insert(emailTaskRows);

      if (insertError) throw insertError;
    }

    return new Response(
      JSON.stringify({
        message: `Seeded ${emailTaskRows.length} email-task links across ${emailsToSeed.length} emails`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error seeding email tasks:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
