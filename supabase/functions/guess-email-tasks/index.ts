import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableApiKey) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY is not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify user
    const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await anonClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { emailId, clientIds, includeCompleted = false } = await req.json();

    if (!emailId) {
      return new Response(JSON.stringify({ error: "emailId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Fetch email content
    const { data: email, error: emailError } = await supabase
      .from("emails")
      .select("subject, body_preview, body_html, from_address, to_addresses, direction")
      .eq("id", emailId)
      .single();

    if (emailError || !email) {
      return new Response(JSON.stringify({ error: "Email not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch open tasks for the user, optionally filtered by client IDs
    let tasksQuery = supabase
      .from("tasks")
      .select("id, title, task_type, status, priority, due_date, assigned_to_name, task_number")
      .eq("user_id", user.id);

    if (!includeCompleted) {
      tasksQuery = tasksQuery.in("status", ["Not Started", "In Progress"]);
    }

    const { data: allTasks } = await tasksQuery.limit(500);

    // If clientIds provided, also fetch task_clients to filter
    let relevantTaskIds: Set<string> | null = null;
    if (clientIds && clientIds.length > 0) {
      const { data: taskClientLinks } = await supabase
        .from("task_clients")
        .select("task_id")
        .in("client_id", clientIds);

      if (taskClientLinks) {
        relevantTaskIds = new Set(taskClientLinks.map((tc: any) => tc.task_id));
      }
    }

    // Prepare tasks list for AI - prioritize client-related tasks but include others
    const clientTasks = allTasks?.filter((t: any) => relevantTaskIds?.has(t.id)) || [];
    const otherTasks = allTasks?.filter((t: any) => !relevantTaskIds || !relevantTaskIds.has(t.id)).slice(0, 50) || [];
    const tasksForAI = [...clientTasks, ...otherTasks];

    // Strip HTML for cleaner AI input
    const emailText = (email.body_html || email.body_preview || "")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const systemPrompt = `You are a financial advisory task matching AI. You analyze email content and match it to existing open tasks, and identify new action items or opportunities.

Given an email and a list of existing tasks, you must:
1. Match the email content to relevant existing tasks based on topic, client, and action items mentioned
2. Identify new opportunities or action items from the email that don't match existing tasks

Be specific and practical. Financial advisers deal with compliance, portfolio reviews, tax planning, claims, policy changes, investment opportunities, and client follow-ups.`;

    const userPrompt = `Email Subject: ${email.subject || "(No Subject)"}
Email Direction: ${email.direction}
Email From: ${email.from_address}
Email Content: ${emailText.substring(0, 2000)}

Existing Tasks (${tasksForAI.length} tasks):
${tasksForAI.map((t: any) => `- ID: ${t.id} | #Task-${t.task_number} | "${t.title}" | Type: ${t.task_type} | Status: ${t.status} | Priority: ${t.priority} | Due: ${t.due_date || "N/A"}`).join("\n")}

Analyze the email and call the appropriate function.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_email_tasks",
              description: "Return matched tasks and identified opportunities from the email",
              parameters: {
                type: "object",
                properties: {
                  matchedTasks: {
                    type: "array",
                    description: "Existing tasks that match the email content",
                    items: {
                      type: "object",
                      properties: {
                        taskId: { type: "string", description: "The task ID from the provided list" },
                        confidence: { type: "string", enum: ["high", "medium", "low"] },
                        reason: { type: "string", description: "Brief explanation of why this task matches" },
                      },
                      required: ["taskId", "confidence", "reason"],
                      additionalProperties: false,
                    },
                  },
                  identifiedOpportunities: {
                    type: "array",
                    description: "New action items or opportunities identified from the email that don't match existing tasks",
                    items: {
                      type: "object",
                      properties: {
                        type: { type: "string", enum: ["Follow-up", "Compliance", "Document Request", "Portfolio Review", "Annual Review", "Investment", "Tax Planning", "Claims"] },
                        description: { type: "string", description: "Brief description of the opportunity or action item" },
                        suggestedTitle: { type: "string", description: "Suggested task title" },
                        suggestedPriority: { type: "string", enum: ["Low", "Medium", "High", "Urgent"] },
                      },
                      required: ["type", "description", "suggestedTitle", "suggestedPriority"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["matchedTasks", "identifiedOpportunities"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "analyze_email_tasks" } },
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      return new Response(
        JSON.stringify({ matchedTasks: [], identifiedOpportunities: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let result;
    try {
      result = JSON.parse(toolCall.function.arguments);
    } catch {
      result = { matchedTasks: [], identifiedOpportunities: [] };
    }

    // Validate matched task IDs exist
    const validTaskIds = new Set(tasksForAI.map((t: any) => t.id));
    result.matchedTasks = (result.matchedTasks || []).filter((m: any) => validTaskIds.has(m.taskId));

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in guess-email-tasks:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
