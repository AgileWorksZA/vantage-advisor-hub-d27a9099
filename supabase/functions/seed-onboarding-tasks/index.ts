import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const onboardingTemplates = [
  { title: "New client onboarding - documentation", description: "Collect and verify all required documentation for new client setup." },
  { title: "New client onboarding - risk profiling", description: "Complete comprehensive risk profiling questionnaire with new client." },
  { title: "New client onboarding - investment selection", description: "Guide new client through investment product selection process." },
  { title: "New client onboarding - FICA", description: "Complete FICA verification for new client account opening." },
  { title: "New client onboarding - portal setup", description: "Set up client access to online portal and provide training." },
  { title: "New client welcome meeting", description: "Schedule and conduct welcome meeting to establish relationship." },
  { title: "New client needs analysis", description: "Complete comprehensive financial needs analysis for new client." },
  { title: "New client policy delivery", description: "Deliver and explain policy documents to new client." },
  { title: "New client onboarding - KYC verification", description: "Complete Know Your Customer verification process for new client." },
  { title: "New client onboarding - beneficiary setup", description: "Assist new client with beneficiary nominations across all policies." },
  { title: "New client onboarding - debit order setup", description: "Set up recurring payment instructions for new client premiums." },
  { title: "New client onboarding - compliance sign-off", description: "Obtain compliance department sign-off on new client account." },
];

// Nationality to jurisdiction mapping
const nationalityToJurisdiction: Record<string, string> = {
  "South African": "ZA", "Australian": "AU", "Canadian": "CA",
  "British": "GB", "American": "US",
};

// Statuses for onboarding widget columns
const onboardingStatuses = ["In Progress", "Pending Client", "Not Started"];

function randomFromArray<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateDueDate(bucketIndex: number): string {
  const today = new Date();
  let offset = 0;

  switch (bucketIndex) {
    case 0: // Today
      offset = 0;
      break;
    case 1: // < 7 days
      offset = 1 + Math.floor(Math.random() * 6);
      break;
    case 2: // < 14 days
      offset = 8 + Math.floor(Math.random() * 6);
      break;
    case 3: // < 1 month
      offset = 15 + Math.floor(Math.random() * 15);
      break;
    case 4: // >= 1 month
      offset = 31 + Math.floor(Math.random() * 30);
      break;
  }

  const date = new Date(today);
  date.setDate(date.getDate() + offset);
  return date.toISOString().split("T")[0];
}

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
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub;

    // Check if we already have enough onboarding tasks
    const { count: existingCount } = await supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .eq("task_type", "Onboarding")
      .eq("is_deleted", false);

    if ((existingCount || 0) >= 50) {
      return new Response(
        JSON.stringify({ seeded: false, message: "Sufficient onboarding tasks already exist", count: existingCount }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch clients grouped by nationality
    const { data: clients, error: clientsError } = await supabase
      .from("clients")
      .select("id, nationality, advisor")
      .limit(1000);

    if (clientsError || !clients?.length) {
      return new Response(
        JSON.stringify({ error: "No clients found. Please seed clients first." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Group clients by jurisdiction
    const clientsByJurisdiction: Record<string, typeof clients> = {};
    for (const client of clients) {
      const jurisdiction = nationalityToJurisdiction[client.nationality || ""] || null;
      if (jurisdiction) {
        if (!clientsByJurisdiction[jurisdiction]) clientsByJurisdiction[jurisdiction] = [];
        clientsByJurisdiction[jurisdiction].push(client);
      }
    }

    const tasks: any[] = [];
    const taskClientLinks: { task_index: number; client_id: string }[] = [];

    // For each jurisdiction, create 12-15 onboarding tasks spread across statuses and time buckets
    for (const [jurisdiction, jClients] of Object.entries(clientsByJurisdiction)) {
      const taskCount = 12 + Math.floor(Math.random() * 4); // 12-15 tasks

      for (let i = 0; i < taskCount; i++) {
        const template = onboardingTemplates[i % onboardingTemplates.length];
        const status = onboardingStatuses[i % onboardingStatuses.length];
        const bucketIndex = i % 5; // Distribute across 5 time buckets
        const client = jClients[i % jClients.length];
        const dueDate = generateDueDate(bucketIndex);

        const priority = ["Medium", "High", "Low"][i % 3];

        tasks.push({
          user_id: userId,
          title: template.title,
          description: template.description,
          task_type: "Onboarding",
          priority,
          status,
          due_date: dueDate,
          client_id: client.id,
          assigned_to_user_id: userId,
          created_by: userId,
          is_practice_task: false,
          source: "System",
          notes: [],
          internal_notes: [],
          tags: ["onboarding"],
        });

        taskClientLinks.push({
          task_index: tasks.length - 1,
          client_id: client.id,
        });
      }
    }

    if (tasks.length === 0) {
      return new Response(
        JSON.stringify({ seeded: false, message: "No jurisdictions with clients found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert tasks in batches of 50
    let totalInserted = 0;
    for (let i = 0; i < tasks.length; i += 50) {
      const batch = tasks.slice(i, i + 50);
      const { data: inserted, error: insertError } = await supabase
        .from("tasks")
        .insert(batch)
        .select("id");

      if (insertError) {
        console.error("Error inserting tasks batch:", insertError);
        continue;
      }

      if (inserted) {
        totalInserted += inserted.length;

        // Create task_clients links
        const links = [];
        for (let j = 0; j < inserted.length; j++) {
          const globalIndex = i + j;
          const linkInfo = taskClientLinks.find(l => l.task_index === globalIndex);
          if (linkInfo) {
            links.push({
              user_id: userId,
              task_id: inserted[j].id,
              client_id: linkInfo.client_id,
              role: "Primary",
            });
          }
        }

        if (links.length > 0) {
          await supabase.from("task_clients").insert(links);
        }
      }
    }

    console.log(`Seeded ${totalInserted} onboarding tasks across ${Object.keys(clientsByJurisdiction).length} jurisdictions`);

    return new Response(
      JSON.stringify({ seeded: true, count: totalInserted }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in seed-onboarding-tasks:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
