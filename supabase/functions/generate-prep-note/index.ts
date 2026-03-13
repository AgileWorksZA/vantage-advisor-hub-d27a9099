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
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (!lovableApiKey) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No auth" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { calendarEventId } = await req.json();
    if (!calendarEventId) {
      return new Response(JSON.stringify({ error: "calendarEventId required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch event
    const { data: event, error: eventErr } = await supabase
      .from("calendar_events")
      .select("*, clients(first_name, surname, advisor, country_of_issue)")
      .eq("id", calendarEventId)
      .single();

    if (eventErr || !event) {
      return new Response(JSON.stringify({ error: "Event not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const clientId = event.client_id;
    const clientName = event.clients ? `${event.clients.first_name} ${event.clients.surname}` : "Unknown Client";

    // Fetch context data in parallel
    const [notesRes, tasksRes, docsRes, productsRes, oppsRes] = await Promise.all([
      clientId ? supabase.from("client_notes").select("subject, content, interaction_type, priority").eq("client_id", clientId).eq("is_deleted", false).order("created_at", { ascending: false }).limit(5) : { data: [] },
      clientId ? supabase.from("tasks").select("title, status, priority, due_date").eq("client_id", clientId).eq("is_deleted", false).order("created_at", { ascending: false }).limit(5) : { data: [] },
      clientId ? supabase.from("documents").select("name, status, category").eq("client_id", clientId).eq("is_deleted", false).limit(5) : { data: [] },
      clientId ? supabase.from("client_products").select("current_value, premium_amount, status, policy_number, products(name, category)").eq("client_id", clientId).eq("is_deleted", false).limit(5) : { data: [] },
      clientId ? supabase.from("project_opportunities").select("opportunity_type, potential_revenue, confidence, suggested_action, status").eq("client_id", clientId).limit(3) : { data: [] },
    ]);

    const notes = notesRes.data || [];
    const tasks = tasksRes.data || [];
    const docs = docsRes.data || [];
    const products = productsRes.data || [];
    const opps = oppsRes.data || [];

    const systemPrompt = `You are an AI assistant for a financial advisor. Generate a concise 3-4 sentence meeting preparation briefing for the advisor. Focus on actionable insights: what the advisor should discuss, any urgent items, and opportunities. Use the client's name naturally. Be specific with numbers and dates when available. Do not use bullet points — write flowing prose.`;

    const contextParts: string[] = [
      `Meeting: ${event.event_type} with ${clientName} on ${new Date(event.start_time).toLocaleDateString()}`,
    ];

    if (notes.length > 0) {
      contextParts.push(`Recent notes: ${notes.map(n => `${n.subject} (${n.interaction_type}, ${n.priority})`).join("; ")}`);
    }
    if (tasks.length > 0) {
      const overdue = tasks.filter((t: any) => t.due_date && new Date(t.due_date) < new Date() && t.status !== "Done");
      contextParts.push(`Tasks: ${tasks.length} total, ${overdue.length} overdue. Items: ${tasks.map((t: any) => t.title).join("; ")}`);
    }
    if (docs.length > 0) {
      const expired = docs.filter((d: any) => d.status === "Expired");
      contextParts.push(`Documents: ${docs.length} on file, ${expired.length} expired. Types: ${docs.map((d: any) => `${d.name} (${d.status})`).join("; ")}`);
    }
    if (products.length > 0) {
      const totalValue = products.reduce((s: number, p: any) => s + (p.current_value || 0), 0);
      contextParts.push(`Products: ${products.length} active, total value ~${totalValue.toLocaleString()}. ${products.map((p: any) => p.products?.name || "Unknown product").join("; ")}`);
    }
    if (opps.length > 0) {
      contextParts.push(`Opportunities: ${opps.map((o: any) => `${o.opportunity_type} (revenue: ${o.potential_revenue}, confidence: ${o.confidence}%)`).join("; ")}`);
    }

    const userPrompt = contextParts.join("\n\n");

    // Call Lovable AI
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
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      const errText = await aiResponse.text();
      console.error("AI gateway error:", status, errText);

      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "AI generation failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResult = await aiResponse.json();
    const prepNote = aiResult.choices?.[0]?.message?.content?.trim() || "Unable to generate prep note.";

    // Save to calendar_events
    const { error: updateErr } = await supabase
      .from("calendar_events")
      .update({ ai_prep_note: prepNote } as any)
      .eq("id", calendarEventId);

    if (updateErr) {
      console.error("Update error:", updateErr);
    }

    return new Response(JSON.stringify({ success: true, note: prepNote }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
