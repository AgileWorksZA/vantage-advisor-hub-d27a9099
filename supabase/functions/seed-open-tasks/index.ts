import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const taskTemplates = [
  { type: "Follow-up", title: "Follow up on pending client documentation" },
  { type: "Follow-up", title: "Follow up on investment proposal" },
  { type: "Follow-up", title: "Follow up on policy amendment request" },
  { type: "Portfolio Review", title: "Quarterly investment review meeting" },
  { type: "Portfolio Review", title: "Review portfolio allocation drift" },
  { type: "Annual Review", title: "Annual portfolio performance review" },
  { type: "Annual Review", title: "Annual financial plan review" },
  { type: "Compliance", title: "KYC documentation update" },
  { type: "Compliance", title: "FICA compliance verification" },
  { type: "Document Request", title: "Request updated tax certificate" },
  { type: "Document Request", title: "Request beneficiary nomination form" },
  { type: "Client Call", title: "Scheduled check-in call" },
  { type: "Client Call", title: "Discuss recent market developments" },
];

const priorities = ["Medium", "High", "Urgent"];
const statuses = ["Not Started", "In Progress"];
const locations = ["Office", "Zoom", "Client Premises", null];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateDueDate(): string {
  const today = new Date();
  const offset = Math.floor(Math.random() * 8); // 0-7 days
  const d = new Date(today);
  d.setDate(d.getDate() + offset);
  return d.toISOString().split("T")[0];
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
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get calling user
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await anonClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = user.id;

    // Fetch all active team members (advisors)
    const { data: teamMembers, error: tmError } = await supabase
      .from("team_members")
      .select("name, jurisdiction")
      .eq("is_active", true);

    if (tmError || !teamMembers?.length) {
      return new Response(
        JSON.stringify({ error: "No team members found. Seed team members first." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch all clients with their advisor
    const { data: clients, error: clError } = await supabase
      .from("clients")
      .select("id, first_name, surname, advisor")
      .limit(5000);

    if (clError || !clients?.length) {
      return new Response(
        JSON.stringify({ error: "No clients found. Seed clients first." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Group clients by advisor name
    const clientsByAdvisor: Record<string, typeof clients> = {};
    for (const c of clients) {
      if (c.advisor) {
        if (!clientsByAdvisor[c.advisor]) clientsByAdvisor[c.advisor] = [];
        clientsByAdvisor[c.advisor].push(c);
      }
    }

    const tasks: any[] = [];
    const taskClientMap: { taskIndex: number; clientId: string }[] = [];

    for (const member of teamMembers) {
      const advisorClients = clientsByAdvisor[member.name];
      if (!advisorClients?.length) continue;

      const count = 3 + Math.floor(Math.random() * 3); // 3-5

      for (let i = 0; i < count; i++) {
        const template = randomFrom(taskTemplates);
        const client = randomFrom(advisorClients);
        const clientName = `${client.first_name} ${client.surname}`;

        tasks.push({
          user_id: userId,
          title: `${template.title} - ${clientName}`,
          description: `${template.title} for client ${clientName}`,
          task_type: template.type,
          priority: randomFrom(priorities),
          status: randomFrom(statuses),
          due_date: generateDueDate(),
          client_id: client.id,
          assigned_to_user_id: userId,
          assigned_to_name: member.name,
          created_by: userId,
          is_practice_task: false,
          source: "System",
          notes: [],
          internal_notes: [],
          tags: ["seeded"],
        });

        taskClientMap.push({
          taskIndex: tasks.length - 1,
          clientId: client.id,
        });
      }
    }

    if (!tasks.length) {
      return new Response(
        JSON.stringify({ success: false, message: "No advisors matched to clients" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert tasks in one batch (small dataset)
    const { data: inserted, error: insertError } = await supabase
      .from("tasks")
      .insert(tasks)
      .select("id");

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(
        JSON.stringify({ error: insertError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create task_clients links
    if (inserted?.length) {
      const links = taskClientMap
        .filter((m) => inserted[m.taskIndex])
        .map((m) => ({
          user_id: userId,
          task_id: inserted[m.taskIndex].id,
          client_id: m.clientId,
          role: "Primary",
        }));

      if (links.length) {
        await supabase.from("task_clients").insert(links);
      }
    }

    console.log(`Seeded ${inserted?.length || 0} open tasks across ${teamMembers.length} advisors`);

    return new Response(
      JSON.stringify({ success: true, totalTasks: inserted?.length || 0, advisors: teamMembers.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in seed-open-tasks:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
