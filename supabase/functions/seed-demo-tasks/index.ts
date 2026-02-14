import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Task templates organized by type (using database enum values)
const taskTemplates = {
  "Client Complaint": [
    { title: "Address billing discrepancy concern", description: "Investigate client's concern regarding incorrect billing amounts and resolve the issue." },
    { title: "Resolve statement delivery issue", description: "Address client's complaint about not receiving statements and update delivery preferences." },
    { title: "Investigate missed payment dispute", description: "Review payment records and resolve dispute regarding allegedly missed premium payment." },
    { title: "Handle service response time complaint", description: "Address client's dissatisfaction with response times and implement improvements." },
    { title: "Address communication preference issue", description: "Resolve complaint about receiving unwanted communications and update preferences." },
    { title: "Resolve incorrect tax certificate", description: "Investigate and correct errors on client's tax certificate documentation." },
    { title: "Handle failed debit order complaint", description: "Address issues with recurring payment failures and implement solution." },
    { title: "Address policy document error", description: "Correct errors found in policy documentation and issue amended documents." },
    { title: "Investigate premium increase query", description: "Explain and justify premium increases to concerned client." },
    { title: "Handle claims processing delay", description: "Escalate and expedite delayed claims processing for frustrated client." },
    { title: "Resolve incorrect fund allocation", description: "Address client's concern about funds being allocated incorrectly." },
    { title: "Handle portal access issues", description: "Assist client having trouble accessing their online portal." },
    { title: "Address advisor communication concern", description: "Resolve complaint about lack of proactive communication from advisor." },
    { title: "Investigate fee calculation dispute", description: "Review and explain fee calculations to client questioning charges." },
    { title: "Handle documentation request delay", description: "Expedite delayed document requests and apologize for inconvenience." },
    { title: "Resolve beneficiary dispute", description: "Mediate and resolve issues regarding beneficiary nominations." },
  ],
  "Follow-up": [
    { title: "Review and update investment portfolio allocation", description: "Analyze current portfolio allocation and recommend adjustments based on client's risk profile and market conditions." },
    { title: "Process pension contribution adjustment request", description: "Review and process client's request to modify their pension contribution amounts or frequency." },
    { title: "Update beneficiary details on life insurance policy", description: "Process beneficiary change request and ensure all documentation is properly updated." },
    { title: "Review asset rebalancing requirements", description: "Assess portfolio drift and recommend rebalancing actions to maintain target allocation." },
    { title: "Process fund switch request", description: "Execute client's request to switch between investment funds within their portfolio." },
    { title: "Update premium payment frequency", description: "Process change request for premium payment schedule from monthly to annual or vice versa." },
    { title: "Review annuity payout options", description: "Discuss and document client's preferred annuity payout structure and timing." },
    { title: "Process policy surrender request", description: "Handle client's request to surrender policy and ensure proper payout processing." },
    { title: "Follow up on pending client documentation", description: "Contact client to request outstanding documents needed for processing." },
    { title: "Follow up on investment decision", description: "Check in with client regarding pending investment decisions discussed previously." },
    { title: "Follow up on signed application", description: "Verify signed documents have been received and processed correctly." },
    { title: "Follow up on premium payment status", description: "Confirm premium payments are up to date and address any arrears." },
  ],
  "Annual Review": [
    { title: "Annual portfolio performance review", description: "Schedule and conduct annual portfolio performance review with client. Discuss investment returns, asset allocation, and rebalancing recommendations." },
    { title: "Life cover adequacy assessment", description: "Review current life cover amounts against client's needs and recommend adjustments." },
    { title: "Retirement planning annual review", description: "Comprehensive annual review of retirement planning progress and projections." },
    { title: "Medical aid benefit review", description: "Analyze current medical aid plan suitability and discuss alternatives." },
    { title: "Income protection review", description: "Assess current income protection cover adequacy and recommend adjustments." },
    { title: "Disability cover assessment", description: "Review disability insurance coverage and ensure adequate protection." },
    { title: "Estate planning document review", description: "Review will and estate planning documents for accuracy and updates needed." },
    { title: "Business assurance review", description: "Annual review of business insurance and key person cover." },
    { title: "Education policy progress review", description: "Review education savings progress against target amounts." },
    { title: "Comprehensive financial plan review", description: "Full financial planning review covering all aspects of client's portfolio." },
    { title: "Annual tax planning review", description: "Review tax efficiency of current investments and recommend optimizations." },
    { title: "Annual risk assessment update", description: "Update client risk profile and ensure investments align with risk tolerance." },
  ],
  "Portfolio Review": [
    { title: "Quarterly investment review meeting", description: "Conduct quarterly check-in to review investment performance and market outlook." },
    { title: "Update risk profile assessment", description: "Conduct updated risk assessment questionnaire and adjust portfolio accordingly." },
    { title: "Review retirement funding strategy", description: "Analyze current retirement savings progress and recommend strategy adjustments." },
    { title: "Process contribution increase request", description: "Update contribution amounts as requested by client for their investment accounts." },
    { title: "Update investment mandate", description: "Review and amend investment mandate based on changed client circumstances." },
    { title: "Process tax-free savings account changes", description: "Handle modifications to client's TFSA investment selections." },
    { title: "Review unit trust holdings", description: "Analyze performance of current unit trust investments and recommend changes." },
    { title: "Review offshore investment allocation", description: "Assess and adjust international investment exposure as per client request." },
    { title: "Analyze portfolio risk metrics", description: "Review portfolio volatility and risk-adjusted returns with client." },
    { title: "Review sector allocation", description: "Assess sector exposure and recommend rebalancing if needed." },
    { title: "Performance attribution analysis", description: "Break down portfolio returns by asset class and fund selection." },
    { title: "Benchmark comparison review", description: "Compare portfolio performance against relevant market benchmarks." },
  ],
  "Compliance": [
    { title: "FICA compliance verification", description: "Verify and update client FICA documentation as required." },
    { title: "Risk assessment renewal", description: "Conduct updated risk profiling assessment for compliance purposes." },
    { title: "KYC documentation update", description: "Request and verify updated Know Your Customer documentation." },
    { title: "Source of funds verification", description: "Verify and document source of funds for large transactions." },
    { title: "Regulatory disclosure review", description: "Ensure all required regulatory disclosures have been made to client." },
    { title: "Anti-money laundering check", description: "Complete AML verification procedures for client account." },
    { title: "Suitability assessment update", description: "Update product suitability assessment based on changed circumstances." },
    { title: "Record of advice update", description: "Ensure record of advice documentation is complete and accurate." },
    { title: "TCF compliance review", description: "Verify Treating Customers Fairly principles are being followed." },
    { title: "POPIA consent verification", description: "Confirm client consent for data processing is current and valid." },
  ],
  "Onboarding": [
    { title: "New client onboarding - documentation", description: "Collect and verify all required documentation for new client setup." },
    { title: "New client onboarding - risk profiling", description: "Complete comprehensive risk profiling questionnaire with new client." },
    { title: "New client onboarding - investment selection", description: "Guide new client through investment product selection process." },
    { title: "New client onboarding - FICA", description: "Complete FICA verification for new client account opening." },
    { title: "New client onboarding - portal setup", description: "Set up client access to online portal and provide training." },
    { title: "New client welcome meeting", description: "Schedule and conduct welcome meeting to establish relationship." },
    { title: "New client needs analysis", description: "Complete comprehensive financial needs analysis for new client." },
    { title: "New client policy delivery", description: "Deliver and explain policy documents to new client." },
  ],
  "Document Request": [
    { title: "Short-term insurance renewal", description: "Review and renew short-term insurance policies before expiry date." },
    { title: "Gap cover policy renewal", description: "Process gap cover renewal and discuss any benefit changes." },
    { title: "Dread disease cover review", description: "Assess critical illness coverage and recommend enhancements." },
    { title: "Investment policy anniversary review", description: "Conduct policy anniversary review and discuss performance." },
    { title: "Update debit order details", description: "Process banking detail changes for premium collection." },
    { title: "Process additional premium payment", description: "Handle ad-hoc additional contribution to investment policy." },
    { title: "Request tax certificate", description: "Generate and send tax certificate to client as requested." },
    { title: "Request policy schedule", description: "Provide updated policy schedule document to client." },
    { title: "Request statement of account", description: "Generate and deliver current statement of account." },
    { title: "Request surrender value quotation", description: "Provide quotation for policy surrender value." },
    { title: "Request paid-up value calculation", description: "Calculate and provide paid-up value for client review." },
    { title: "Request benefit statement", description: "Generate comprehensive benefit statement for client." },
  ],
};

// Distribution weights based on database enum values
const typeWeights = [
  { type: "Client Complaint", weight: 0.15 },
  { type: "Follow-up", weight: 0.20 },
  { type: "Annual Review", weight: 0.15 },
  { type: "Portfolio Review", weight: 0.15 },
  { type: "Compliance", weight: 0.10 },
  { type: "Onboarding", weight: 0.10 },
  { type: "Document Request", weight: 0.15 },
];

// Using database enum values for priority
const priorityWeights = [
  { priority: "Urgent", weight: 0.1 },
  { priority: "High", weight: 0.25 },
  { priority: "Medium", weight: 0.45 },
  { priority: "Low", weight: 0.2 },
];

// Using database enum values for status
const statusWeights = [
  { status: "Not Started", weight: 0.30 },
  { status: "In Progress", weight: 0.30 },
  { status: "Pending Client", weight: 0.15 },
  { status: "Completed", weight: 0.20 },
  { status: "Cancelled", weight: 0.05 },
];

const sourceOptions = ["Manual", "Manual", "Manual", "Email", "System"];
const tagPool = [
  "urgent",
  "follow-up",
  "documentation",
  "compliance",
  "review",
  "client-request",
  "annual",
  "quarterly",
  "escalation",
  "pending-info",
];

const noteTemplates = [
  "Client prefers afternoon meetings",
  "Discussed with client, awaiting documentation",
  "Initial contact made via email",
  "Client requested callback next week",
  "Documents received and under review",
  "Escalated to senior advisor for approval",
  "Waiting for third-party confirmation",
  "Client has upcoming travel - complete before then",
  "Linked to spouse's policy review",
  "Requires manager sign-off",
];

// Utility functions
function weightedRandom<T extends { weight: number }>(items: T[]): T {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;
  for (const item of items) {
    random -= item.weight;
    if (random <= 0) return item;
  }
  return items[items.length - 1];
}

function randomFromArray<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateDueDate(index: number): string | null {
  const today = new Date();
  const distribution = index % 20;

  if (distribution < 3) {
    const daysAgo = randomInt(1, 30);
    const date = new Date(today);
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split("T")[0];
  } else if (distribution < 4) {
    return today.toISOString().split("T")[0];
  } else if (distribution < 8) {
    const daysAhead = randomInt(1, 7);
    const date = new Date(today);
    date.setDate(date.getDate() + daysAhead);
    return date.toISOString().split("T")[0];
  } else if (distribution < 13) {
    const daysAhead = randomInt(8, 14);
    const date = new Date(today);
    date.setDate(date.getDate() + daysAhead);
    return date.toISOString().split("T")[0];
  } else if (distribution < 18) {
    const daysAhead = randomInt(15, 45);
    const date = new Date(today);
    date.setDate(date.getDate() + daysAhead);
    return date.toISOString().split("T")[0];
  } else {
    return null;
  }
}

function generateFollowUpDate(dueDate: string | null): string | null {
  if (!dueDate || Math.random() > 0.6) return null;
  const date = new Date(dueDate);
  date.setDate(date.getDate() + randomInt(3, 7));
  return date.toISOString().split("T")[0];
}

function generateSlaDeadline(dueDate: string | null): string | null {
  if (!dueDate || Math.random() > 0.7) return null;
  const date = new Date(dueDate);
  date.setDate(date.getDate() - randomInt(1, 2));
  return date.toISOString().split("T")[0];
}

function generateNotes(userId: string): object[] {
  if (Math.random() > 0.5) return [];
  const noteCount = randomInt(1, 3);
  const notes = [];
  const now = new Date();
  for (let i = 0; i < noteCount; i++) {
    const createdAt = new Date(now);
    createdAt.setDate(createdAt.getDate() - randomInt(1, 30));
    notes.push({
      id: crypto.randomUUID(),
      content: randomFromArray(noteTemplates),
      created_at: createdAt.toISOString(),
      created_by: userId,
      is_internal: Math.random() > 0.7,
    });
  }
  return notes;
}

function generateTags(): string[] {
  if (Math.random() > 0.4) return [];
  const tagCount = randomInt(1, 3);
  const tags: string[] = [];
  for (let i = 0; i < tagCount; i++) {
    const tag = randomFromArray(tagPool);
    if (!tags.includes(tag)) tags.push(tag);
  }
  return tags;
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

    // Verify user
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } =
      await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub;

    // Fetch all clients for this user
    const { data: clients, error: clientsError } = await supabase
      .from("clients")
      .select("id")
      .limit(500);

    if (clientsError) {
      throw new Error(`Failed to fetch clients: ${clientsError.message}`);
    }

    if (!clients || clients.length === 0) {
      return new Response(
        JSON.stringify({ error: "No clients found. Please seed clients first." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Fetch team members for assigning tasks - include is_primary_adviser
    const { data: teamMembers } = await supabase
      .from("team_members")
      .select("name, team_name, jurisdiction, is_primary_adviser")
      .eq("user_id", userId)
      .eq("is_active", true);

    const allMembers = teamMembers || [];
    const primaryMembers = allMembers.filter((m: any) => m.is_primary_adviser);
    const assistantMembers = allMembers.filter((m: any) => !m.is_primary_adviser);

    console.log(`Found ${clients.length} clients, ${allMembers.length} team members (${primaryMembers.length} advisers, ${assistantMembers.length} assistants)`);

    // Delete existing tasks for idempotent re-seeding
    // First delete task_clients links, then tasks
    const { error: deleteLinksError } = await supabase
      .from("task_clients")
      .delete()
      .eq("user_id", userId);
    if (deleteLinksError) {
      console.error("Error deleting task_clients:", deleteLinksError);
    }

    const { error: deleteTasksError } = await supabase
      .from("tasks")
      .delete()
      .eq("user_id", userId);
    if (deleteTasksError) {
      console.error("Error deleting tasks:", deleteTasksError);
    }

    console.log("Cleared existing tasks for re-seeding");

    // Generate 500 tasks
    const tasks = [];
    const TOTAL_TASKS = 500;

    // Standard execution minutes by type
    const execMinutesByType: Record<string, number> = {
      "Client Complaint": 90,
      "Follow-up": 30,
      "Annual Review": 120,
      "Portfolio Review": 60,
      "Compliance": 45,
      "Onboarding": 180,
      "Document Request": 20,
    };

    for (let i = 0; i < TOTAL_TASKS; i++) {
      const taskType = weightedRandom(typeWeights).type;
      const templates = taskTemplates[taskType as keyof typeof taskTemplates];
      const template = randomFromArray(templates);
      const priority = weightedRandom(priorityWeights).priority;
      const status = weightedRandom(statusWeights).status;
      const dueDate = generateDueDate(i);
      const clientId = clients[i % clients.length].id;

      // Assign to a team member - 60% to advisers, 40% to assistants
      let assignedToName: string;
      if (allMembers.length === 0) {
        assignedToName = "Unassigned";
      } else if (primaryMembers.length > 0 && assistantMembers.length > 0) {
        if (Math.random() < 0.6) {
          assignedToName = randomFromArray(primaryMembers).name;
        } else {
          assignedToName = randomFromArray(assistantMembers).name;
        }
      } else {
        assignedToName = randomFromArray(allMembers).name;
      }

      const task: any = {
        user_id: userId,
        client_id: clientId,
        title: template.title,
        description: template.description,
        task_type: taskType,
        priority: priority,
        status: status,
        due_date: dueDate,
        follow_up_date: generateFollowUpDate(dueDate),
        sla_deadline: generateSlaDeadline(dueDate),
        is_pinned: Math.random() < 0.05,
        source: randomFromArray(sourceOptions),
        tags: generateTags(),
        notes: generateNotes(userId),
        estimated_hours: Math.round(Math.random() * 7.5 * 2 + 1) / 2,
        standard_execution_minutes: execMinutesByType[taskType] || 60,
        assigned_to_name: assignedToName,
        completed_at: status === "Completed" ? new Date(Date.now() - randomInt(0, 14) * 86400000).toISOString() : null,
      };

      tasks.push(task);
    }

    // Batch insert tasks (100 at a time)
    const BATCH_SIZE = 100;
    const insertedTaskIds: string[] = [];
    let totalInserted = 0;

    for (let i = 0; i < tasks.length; i += BATCH_SIZE) {
      const batch = tasks.slice(i, i + BATCH_SIZE);
      const { data: insertedBatch, error: insertError } = await supabase
        .from("tasks")
        .insert(batch)
        .select("id");

      if (insertError) {
        console.error(`Batch ${i / BATCH_SIZE + 1} error:`, insertError);
        throw new Error(`Failed to insert tasks batch: ${insertError.message}`);
      }

      if (insertedBatch) {
        insertedTaskIds.push(...insertedBatch.map((t) => t.id));
        totalInserted += insertedBatch.length;
      }

      console.log(`Inserted batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length} tasks`);
    }

    // Create multi-client links for 10% of tasks (50 tasks)
    const multiClientTasks = insertedTaskIds.slice(0, 50);
    const taskClientLinks = [];

    for (const taskId of multiClientTasks) {
      const additionalClients = randomInt(1, 2);
      const usedClientIds = new Set<string>();

      for (let j = 0; j < additionalClients; j++) {
        const randomClient = randomFromArray(clients);
        if (!usedClientIds.has(randomClient.id)) {
          usedClientIds.add(randomClient.id);
          taskClientLinks.push({
            user_id: userId,
            task_id: taskId,
            client_id: randomClient.id,
            role: randomFromArray(["Related", "Spouse", "Beneficiary", "Co-applicant"]),
          });
        }
      }
    }

    // Insert task_clients links
    if (taskClientLinks.length > 0) {
      const { error: linkError } = await supabase
        .from("task_clients")
        .insert(taskClientLinks);

      if (linkError) {
        console.error("Task clients link error:", linkError);
      } else {
        console.log(`Created ${taskClientLinks.length} multi-client links`);
      }
    }

    // Calculate summary stats
    const summary = {
      total_tasks_created: totalInserted,
      clients_used: clients.length,
      multi_client_links: taskClientLinks.length,
      team_members_used: allMembers.length,
      distribution: {
        by_status: {
          "Not Started": tasks.filter((t) => t.status === "Not Started").length,
          "In Progress": tasks.filter((t) => t.status === "In Progress").length,
          "Pending Client": tasks.filter((t) => t.status === "Pending Client").length,
          "Completed": tasks.filter((t) => t.status === "Completed").length,
          "Cancelled": tasks.filter((t) => t.status === "Cancelled").length,
        },
        by_priority: {
          Urgent: tasks.filter((t) => t.priority === "Urgent").length,
          High: tasks.filter((t) => t.priority === "High").length,
          Medium: tasks.filter((t) => t.priority === "Medium").length,
          Low: tasks.filter((t) => t.priority === "Low").length,
        },
        by_type: {
          "Client Complaint": tasks.filter((t) => t.task_type === "Client Complaint").length,
          "Follow-up": tasks.filter((t) => t.task_type === "Follow-up").length,
          "Annual Review": tasks.filter((t) => t.task_type === "Annual Review").length,
          "Portfolio Review": tasks.filter((t) => t.task_type === "Portfolio Review").length,
          "Compliance": tasks.filter((t) => t.task_type === "Compliance").length,
          "Onboarding": tasks.filter((t) => t.task_type === "Onboarding").length,
          "Document Request": tasks.filter((t) => t.task_type === "Document Request").length,
        },
        assigned_null_count: tasks.filter((t) => !t.assigned_to_name || t.assigned_to_name === "Unassigned").length,
        overdue: tasks.filter((t) => t.due_date && new Date(t.due_date) < new Date()).length,
        pinned: tasks.filter((t) => t.is_pinned).length,
      },
    };

    return new Response(JSON.stringify({ success: true, summary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error seeding tasks:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
