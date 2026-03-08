import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TaskTemplate {
  type: string;
  title: string;
  jurisdictions?: string[]; // if set, only for these jurisdictions
}

const globalTemplates: TaskTemplate[] = [
  { type: "Follow-up", title: "Follow up on pending client documentation" },
  { type: "Follow-up", title: "Follow up on investment proposal" },
  { type: "Follow-up", title: "Follow up on policy amendment request" },
  { type: "Follow-up", title: "Scheduled check-in call" },
  { type: "Follow-up", title: "Discuss recent market developments" },
  { type: "Follow-up", title: "Follow up on beneficiary nomination update" },
  { type: "Portfolio Review", title: "Quarterly investment review meeting" },
  { type: "Portfolio Review", title: "Review portfolio allocation drift" },
  { type: "Portfolio Review", title: "Rebalance equity-to-fixed-income ratio" },
  { type: "Annual Review", title: "Annual portfolio performance review" },
  { type: "Annual Review", title: "Annual financial plan review" },
  { type: "Annual Review", title: "Annual risk cover adequacy assessment" },
  { type: "Compliance", title: "KYC documentation update" },
  { type: "Document Request", title: "Request updated tax certificate" },
  { type: "Document Request", title: "Request beneficiary nomination form" },
  { type: "Document Request", title: "Collect signed mandate from client" },
];

const jurisdictionTemplates: TaskTemplate[] = [
  // South Africa
  { type: "Compliance", title: "FICA compliance verification", jurisdictions: ["South Africa"] },
  { type: "Follow-up", title: "RA top-up follow-up before tax year end", jurisdictions: ["South Africa"] },
  { type: "Document Request", title: "Request Section 11F certificate", jurisdictions: ["South Africa"] },
  { type: "Portfolio Review", title: "Living annuity withdrawal rate review", jurisdictions: ["South Africa"] },
  { type: "Follow-up", title: "TFSA contribution limit review", jurisdictions: ["South Africa"] },
  { type: "Portfolio Review", title: "JSE offshore allocation rebalance", jurisdictions: ["South Africa"] },

  // Australia
  { type: "Compliance", title: "TFN declaration update", jurisdictions: ["Australia"] },
  { type: "Portfolio Review", title: "Superannuation performance review", jurisdictions: ["Australia"] },
  { type: "Compliance", title: "SMSF compliance audit preparation", jurisdictions: ["Australia"] },
  { type: "Follow-up", title: "Super salary sacrifice arrangement follow-up", jurisdictions: ["Australia"] },
  { type: "Follow-up", title: "Div 293 tax assessment review", jurisdictions: ["Australia"] },
  { type: "Portfolio Review", title: "Transition to retirement strategy review", jurisdictions: ["Australia"] },

  // Canada
  { type: "Follow-up", title: "RRSP contribution reminder before deadline", jurisdictions: ["Canada"] },
  { type: "Portfolio Review", title: "TFSA rebalance review", jurisdictions: ["Canada"] },
  { type: "Document Request", title: "Request T4 and T5 tax slips", jurisdictions: ["Canada"] },
  { type: "Portfolio Review", title: "RESP education savings strategy review", jurisdictions: ["Canada"] },
  { type: "Follow-up", title: "RRIF minimum withdrawal calculation", jurisdictions: ["Canada"] },
  { type: "Tax Planning", title: "Capital gains inclusion rate impact analysis", jurisdictions: ["Canada"] },

  // United Kingdom
  { type: "Compliance", title: "NI number verification", jurisdictions: ["United Kingdom"] },
  { type: "Follow-up", title: "ISA allowance top-up reminder", jurisdictions: ["United Kingdom"] },
  { type: "Portfolio Review", title: "SIPP drawdown strategy review", jurisdictions: ["United Kingdom"] },
  { type: "Investment", title: "Flexi-access drawdown rate review", jurisdictions: ["United Kingdom"] },
  { type: "Tax Planning", title: "Dividend allowance utilisation review", jurisdictions: ["United Kingdom"] },
  { type: "Document Request", title: "Request HMRC tax summary", jurisdictions: ["United Kingdom"] },

  // United States
  { type: "Portfolio Review", title: "401(k) allocation rebalancing review", jurisdictions: ["United States"] },
  { type: "Follow-up", title: "RMD calculation and distribution follow-up", jurisdictions: ["United States"] },
  { type: "Document Request", title: "Request W-2 and 1099 tax documents", jurisdictions: ["United States"] },
  { type: "Investment", title: "Roth conversion opportunity analysis", jurisdictions: ["United States"] },
  { type: "Tax Planning", title: "HSA contribution strategy review", jurisdictions: ["United States"] },
  { type: "Follow-up", title: "IRA rollover processing follow-up", jurisdictions: ["United States"] },
];

const priorities = ["Low", "Medium", "Medium", "High", "Urgent"];
const statuses = ["Not Started", "Not Started", "In Progress", "In Progress", "In Progress"];
const locations = ["Office", "Zoom", "Client Premises", "Teams", null];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateDueDate(): string {
  const today = new Date();
  const offset = Math.floor(Math.random() * 21) - 3; // -3 to +18 days (some overdue)
  const d = new Date(today);
  d.setDate(d.getDate() + offset);
  return d.toISOString().split("T")[0];
}

// Map jurisdiction names from team_members to country names used in templates
function getJurisdiction(jurisdiction: string | null): string | null {
  if (!jurisdiction) return null;
  const map: Record<string, string> = {
    ZA: "South Africa",
    AU: "Australia",
    CA: "Canada",
    GB: "United Kingdom",
    US: "United States",
    "South Africa": "South Africa",
    Australia: "Australia",
    Canada: "Canada",
    "United Kingdom": "United Kingdom",
    "United States": "United States",
  };
  return map[jurisdiction] || null;
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

      const jurisdiction = getJurisdiction(member.jurisdiction);

      // Build template pool: global + jurisdiction-specific
      const templatePool = [
        ...globalTemplates,
        ...jurisdictionTemplates.filter(
          (t) => !t.jurisdictions || (jurisdiction && t.jurisdictions.includes(jurisdiction))
        ),
      ];

      const count = 8 + Math.floor(Math.random() * 5); // 8-12 tasks per advisor

      for (let i = 0; i < count; i++) {
        const template = randomFrom(templatePool);
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

    // Insert tasks in batches of 100
    const batchSize = 100;
    let totalInserted = 0;
    const allInserted: any[] = [];

    for (let b = 0; b < tasks.length; b += batchSize) {
      const batch = tasks.slice(b, b + batchSize);
      const { data: inserted, error: insertError } = await supabase
        .from("tasks")
        .insert(batch)
        .select("id");

      if (insertError) {
        console.error("Insert error:", insertError);
        return new Response(
          JSON.stringify({ error: insertError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (inserted) {
        // Adjust indices for batch offset
        for (let i = 0; i < inserted.length; i++) {
          allInserted[b + i] = inserted[i];
        }
        totalInserted += inserted.length;
      }
    }

    // Create task_clients links
    if (allInserted.length) {
      const links = taskClientMap
        .filter((m) => allInserted[m.taskIndex])
        .map((m) => ({
          user_id: userId,
          task_id: allInserted[m.taskIndex].id,
          client_id: m.clientId,
          role: "Primary",
        }));

      // Insert links in batches
      for (let b = 0; b < links.length; b += batchSize) {
        const batch = links.slice(b, b + batchSize);
        await supabase.from("task_clients").insert(batch);
      }
    }

    console.log(`Seeded ${totalInserted} open tasks across ${teamMembers.length} advisors`);

    return new Response(
      JSON.stringify({ success: true, totalTasks: totalInserted, advisors: teamMembers.length }),
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
