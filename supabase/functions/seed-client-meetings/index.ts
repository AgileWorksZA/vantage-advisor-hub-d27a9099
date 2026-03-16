import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TIMEZONE_MAP: Record<string, string> = {
  ZA: "Africa/Johannesburg",
  AU: "Australia/Sydney",
  CA: "America/Toronto",
  GB: "Europe/London",
  US: "America/New_York",
};

const EVENT_TYPES = [
  { type: "Portfolio Review", color: "hsl(180,70%,45%)" },
  { type: "Annual Review", color: "hsl(171,70%,45%)" },
  { type: "Compliance Review", color: "hsl(38,90%,55%)" },
  { type: "Meeting", color: "hsl(270,60%,60%)" },
  { type: "Client Call", color: "hsl(270,70%,55%)" },
] as const;

const PREP_FRAGMENTS: Record<string, Record<string, string[]>> = {
  ZA: {
    "Portfolio Review": [
      "Portfolio drift is above model tolerance and should be rebalanced.",
      "Discuss Regulation 28 room and offshore diversification opportunities.",
      "Highlight total return progress versus CPI+5% target.",
    ],
    "Annual Review": [
      "Prepare a full annual review pack covering retirement, estate, and tax planning.",
      "Review beneficiary nominations and living annuity drawdown assumptions.",
      "Assess retirement contribution levels before tax year-end.",
    ],
    "Compliance Review": [
      "FICA documents should be refreshed and proof of address confirmed.",
      "Verify risk profile and record of advice currency.",
      "Check replacement advice documentation for recent switches.",
    ],
    "Meeting": [
      "Review cash reserves, savings capacity, and near-term planning priorities.",
      "Discuss tax-free savings and discretionary investment funding.",
      "Confirm the next action items from the last client discussion.",
    ],
    "Client Call": [
      "Share updates on documentation, processing, and pending follow-ups.",
      "Confirm quarter-end statement questions and next actions.",
      "Check progress on outstanding compliance or servicing items.",
    ],
  },
  AU: {
    "Portfolio Review": [
      "Review superannuation allocation and home-bias in Australian equities.",
      "Discuss fee compression via lower-cost ETF alternatives.",
      "Assess international exposure and currency hedging settings.",
    ],
    "Annual Review": [
      "Prepare Statement of Advice review and contribution-cap planning.",
      "Review insurance inside super and binding nomination expiry.",
      "Model retirement lifestyle against ASFA targets.",
    ],
    "Compliance Review": [
      "Check FDS and opt-in obligations for the ongoing fee arrangement.",
      "Refresh risk profile under Best Interests Duty requirements.",
      "Confirm AML and identity documentation is current.",
    ],
    "Meeting": [
      "Discuss EOFY contribution strategy and tax planning.",
      "Review super rollover or SMSF administration considerations.",
      "Confirm immediate priorities for the next implementation window.",
    ],
    "Client Call": [
      "Follow up on quote requests and implementation progress.",
      "Confirm portal documents and recent statement availability.",
      "Check next meeting timing before EOFY deadlines.",
    ],
  },
  CA: {
    "Portfolio Review": [
      "Review RRSP, TFSA, and non-registered account positioning.",
      "Highlight tax-loss selling opportunities in the taxable account.",
      "Assess Canadian home-bias against target global allocation.",
    ],
    "Annual Review": [
      "Prepare annual review covering retirement and estate planning updates.",
      "Revisit insurance and beneficiary designations across accounts.",
      "Model CPP/OAS timing and contribution strategy.",
    ],
    "Compliance Review": [
      "Refresh KYC and source-of-funds documentation.",
      "Validate suitability records for current recommendations.",
      "Confirm CRM2 reporting inputs and relationship disclosures.",
    ],
    "Meeting": [
      "Discuss contribution room optimization and RESP planning.",
      "Review liquidity and debt-management priorities.",
      "Confirm next steps for implementation and follow-up.",
    ],
    "Client Call": [
      "Follow up on paperwork, signatures, and account changes.",
      "Confirm statement availability and pending advice items.",
      "Check readiness for the next planning milestone.",
    ],
  },
  GB: {
    "Portfolio Review": [
      "Review ISA and SIPP allocation against target risk exposure.",
      "Assess UK equity overweight and global diversification opportunities.",
      "Discuss cost and charges against lower-cost alternatives.",
    ],
    "Annual Review": [
      "Prepare annual suitability review and updated cashflow modelling.",
      "Revisit pension drawdown assumptions and beneficiary wishes.",
      "Review protection and inheritance-tax planning priorities.",
    ],
    "Compliance Review": [
      "Refresh FCA suitability and Consumer Duty documentation.",
      "Confirm AML inputs and vulnerability assessment notes.",
      "Review fee value and service agreement currency.",
    ],
    "Meeting": [
      "Discuss ISA allowance use and pension contribution timing.",
      "Review near-term planning opportunities and service priorities.",
      "Confirm follow-up actions for implementation.",
    ],
    "Client Call": [
      "Follow up on transfer paperwork and open servicing items.",
      "Share updates on pension or platform administration.",
      "Confirm the next scheduled review date.",
    ],
  },
  US: {
    "Portfolio Review": [
      "Review 401(k), IRA, and taxable account positioning.",
      "Discuss tax-loss harvesting and diversification away from concentration risk.",
      "Assess fee drag and consolidation opportunities across holdings.",
    ],
    "Annual Review": [
      "Prepare annual review covering retirement, estate, and insurance planning.",
      "Revisit beneficiary designations and Social Security timing.",
      "Model contribution and Roth conversion opportunities.",
    ],
    "Compliance Review": [
      "Refresh KYC, source-of-funds, and advisory disclosure records.",
      "Confirm suitability and relationship documentation is current.",
      "Review policy acknowledgements and identity documents.",
    ],
    "Meeting": [
      "Discuss cash deployment, tax-efficient savings, and planning priorities.",
      "Review estate planning and insurance action items.",
      "Confirm follow-up actions from the last advisory discussion.",
    ],
    "Client Call": [
      "Follow up on implementation, statements, and quote requests.",
      "Confirm account paperwork and pending signatures.",
      "Check timing for the next planning review.",
    ],
  },
};

const jurisdictionNotes: Record<string, { subjects: string[]; content: string[] }> = {
  ZA: {
    subjects: ["FICA verification follow-up", "Retirement annuity contribution review", "Tax-free savings discussion"],
    content: [
      "Discussed FICA documentation requirements. Client to provide updated proof of address within 30 days.",
      "Reviewed RA contribution limits for the current tax year. Recommend maximising before February deadline.",
      "Client interested in increasing TFSA contributions before tax year-end.",
    ],
  },
  AU: {
    subjects: ["Super contribution review", "Insurance within super review", "EOFY planning notes"],
    content: [
      "Reviewed concessional and non-concessional contribution capacity for the year.",
      "Assessed life and TPD cover inside super and discussed adequacy.",
      "Outlined EOFY planning priorities and contribution timing.",
    ],
  },
  CA: {
    subjects: ["RRSP contribution review", "TFSA rebalancing discussion", "CPP/OAS projection notes"],
    content: [
      "Reviewed RRSP contribution room and near-term funding options.",
      "TFSA allocation drifted from target and should be rebalanced.",
      "Discussed retirement income timing and government benefit assumptions.",
    ],
  },
  GB: {
    subjects: ["ISA allowance review", "Pension drawdown discussion", "IHT planning notes"],
    content: [
      "Reviewed ISA funding before tax year-end and transfer options.",
      "Discussed pension drawdown sustainability and cashflow implications.",
      "Highlighted inheritance-tax planning actions and gifting allowances.",
    ],
  },
  US: {
    subjects: ["401(k) rollover discussion", "Roth conversion review", "Tax-loss harvesting notes"],
    content: [
      "Discussed rollover options and account consolidation opportunities.",
      "Reviewed Roth conversion timing and tax bracket management.",
      "Identified harvesting opportunities in the taxable account.",
    ],
  },
};

const jurisdictionDocs: Record<string, { name: string; category: string }[]> = {
  ZA: [
    { name: "FICA - Proof of ID", category: "FICA" },
    { name: "FICA - Proof of Address", category: "FICA" },
    { name: "Record of Advice", category: "Client" },
  ],
  AU: [
    { name: "Tax File Declaration", category: "FICA" },
    { name: "Statement of Advice", category: "Client" },
    { name: "Super Fund Statement", category: "Product" },
  ],
  CA: [
    { name: "KYC Verification Form", category: "FICA" },
    { name: "Investment Policy Statement", category: "Client" },
    { name: "RRSP Contribution Receipt", category: "Product" },
  ],
  GB: [
    { name: "Anti-Money Laundering Check", category: "FICA" },
    { name: "Suitability Report", category: "Client" },
    { name: "ISA Transfer Form", category: "Product" },
  ],
  US: [
    { name: "W-9 Form", category: "FICA" },
    { name: "Financial Plan Summary", category: "Client" },
    { name: "IRA Rollover Form", category: "Product" },
  ],
};

const opportunityTemplates = [
  { type: "Portfolio Rebalancing", action: "Rebalance portfolio to align with target allocation", reasoning: "Portfolio drift detected relative to target allocation." },
  { type: "Retirement Planning", action: "Increase retirement contributions", reasoning: "Current trajectory shows a retirement income gap." },
  { type: "Estate Planning", action: "Update will and beneficiary designations", reasoning: "Estate planning documents should be refreshed after recent review." },
];

const transcriptTemplates: Record<string, (clientName: string, jurisdiction: string) => string> = {
  "Portfolio Review": (name) => `[00:00] Advisor: Good morning ${name}, today we'll review your portfolio performance and any rebalancing needs.\n[03:00] ${name}: I'd like to understand whether the recent market moves changed the strategy.\n[06:30] Advisor: Your portfolio is still aligned overall, but there is enough drift to justify a rebalance.\n[10:00] ${name}: Let's proceed with the recommendation and send me the summary afterward.`,
  "Annual Review": (name) => `[00:00] Advisor: Welcome ${name}. This is our annual planning review covering goals, protection, retirement, and estate planning.\n[04:00] ${name}: I want to make sure we're still on track and that my cover is adequate.\n[08:00] Advisor: We identified a few actions on insurance, beneficiaries, and contribution levels.\n[12:00] ${name}: Great, please send the recommendations and next steps.`,
  "Compliance Review": (name) => `[00:00] Advisor: Hi ${name}, today we need to complete a short compliance review to refresh your documentation.\n[02:00] ${name}: No problem, what do you need from me?\n[05:00] Advisor: We'll update your ID documents, risk profile, and source-of-funds notes.\n[08:00] ${name}: Understood, I'll send anything outstanding this week.`,
  "Meeting": (name) => `[00:00] Advisor: Hi ${name}, thanks for joining. I wanted to discuss a few planning priorities and action items from our last conversation.\n[03:00] ${name}: Sounds good, I also have a couple of questions.\n[07:00] Advisor: We covered cash deployment, estate planning, and additional savings options.\n[11:00] ${name}: Please send through the recommendation summary and proposed next steps.`,
  "Client Call": (name) => `[00:00] Advisor: Hi ${name}, just a quick follow-up call on the recent actions and pending items.\n[01:30] ${name}: Thanks, I wanted an update on what still needs to be done.\n[04:00] Advisor: I confirmed the latest processing status and next documents required.\n[06:00] ${name}: Perfect, let's keep the next review date as planned.`,
};

const actionItemTemplates: Record<string, { title: string; description: string; priority: string; task_type: string; source_quote: string }[]> = {
  "Portfolio Review": [
    { title: "Process portfolio rebalance", description: "Implement the agreed rebalancing changes.", priority: "High", task_type: "Portfolio Review", source_quote: "there is enough drift to justify a rebalance" },
    { title: "Send review summary", description: "Email the client the portfolio summary and rationale.", priority: "Medium", task_type: "Follow-up", source_quote: "send me the summary afterward" },
  ],
  "Annual Review": [
    { title: "Prepare annual recommendations", description: "Summarise planning recommendations from the annual review.", priority: "High", task_type: "Annual Review", source_quote: "please send the recommendations and next steps" },
    { title: "Update beneficiaries", description: "Refresh beneficiary nominations across active products.", priority: "Medium", task_type: "Follow-up", source_quote: "we identified a few actions on insurance, beneficiaries, and contribution levels" },
  ],
  "Compliance Review": [
    { title: "Collect updated compliance documents", description: "Request refreshed ID and supporting records.", priority: "High", task_type: "Compliance", source_quote: "We'll update your ID documents, risk profile, and source-of-funds notes" },
    { title: "Send risk profile questionnaire", description: "Issue updated risk profile questionnaire to client.", priority: "Medium", task_type: "Follow-up", source_quote: "today we need to complete a short compliance review" },
  ],
  "Meeting": [
    { title: "Prepare planning recommendations", description: "Summarise agreed planning next steps and proposals.", priority: "High", task_type: "Follow-up", source_quote: "Please send through the recommendation summary and proposed next steps" },
    { title: "Arrange specialist referral", description: "Coordinate the external or internal referral discussed in meeting.", priority: "Medium", task_type: "Follow-up", source_quote: "We covered cash deployment, estate planning, and additional savings options" },
  ],
  "Client Call": [
    { title: "Confirm outstanding documents", description: "Follow up on any pending signatures or required documents.", priority: "Medium", task_type: "Document Request", source_quote: "I confirmed the latest processing status and next documents required" },
    { title: "Schedule next review", description: "Confirm and log the next review date.", priority: "Low", task_type: "Follow-up", source_quote: "let's keep the next review date as planned" },
  ],
};

function randomFrom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

function getJurisdiction(country: string | null | undefined): string {
  const normalized = (country || "ZA").toLowerCase().trim();
  if (normalized === "south africa" || normalized === "za") return "ZA";
  if (normalized === "australia" || normalized === "au") return "AU";
  if (normalized === "canada" || normalized === "ca") return "CA";
  if (normalized === "united kingdom" || normalized === "gb") return "GB";
  if (normalized === "united states" || normalized === "us") return "US";
  return "ZA";
}

function buildPrepNote(jurisdiction: string, eventType: string, clientName: string) {
  const fragments = PREP_FRAGMENTS[jurisdiction]?.[eventType] ?? PREP_FRAGMENTS.ZA.Meeting;
  return `${clientName}: ${shuffle(fragments).slice(0, 2).join(" ")}`;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function setTime(date: Date, hours: number, minutes: number) {
  const next = new Date(date);
  next.setHours(hours, minutes, 0, 0);
  return next;
}

function generateAiSummary(category: string, clientName: string, eventDate: string) {
  const followUpDate = addDays(new Date(eventDate), randomInt(7, 21)).toISOString().split("T")[0];
  return {
    summary: `${category} completed with ${clientName}. Key themes included planning priorities, service actions, and implementation follow-ups.`,
    key_topics: [category, "Planning", "Implementation", "Follow-up"],
    decisions_made: ["Proceed with agreed follow-up actions", "Send written summary to client"],
    client_facts: { engagement: "High", follow_up_required: true },
    follow_up_date: followUpDate,
  };
}

function generateActionItems(category: string, eventDate: string) {
  const dueDate = (days: number) => addDays(new Date(eventDate), days).toISOString().split("T")[0];
  return (actionItemTemplates[category] || actionItemTemplates.Meeting).map((item, index) => ({
    ...item,
    suggested_due_date: dueDate(5 + index * 5),
  }));
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;
    const admin = createClient(supabaseUrl, serviceRoleKey);

    const body = await req.json().catch(() => ({}));
    const clientId = typeof body?.clientId === "string" ? body.clientId.trim() : "";
    if (!clientId) {
      return new Response(JSON.stringify({ success: false, error: "clientId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: client, error: clientError } = await admin
      .from("clients")
      .select("id, first_name, surname, country_of_issue")
      .eq("id", clientId)
      .eq("user_id", userId)
      .eq("is_deleted", false)
      .maybeSingle();

    if (clientError) throw clientError;
    if (!client) {
      return new Response(JSON.stringify({ success: false, error: "Client not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const jurisdiction = getJurisdiction(client.country_of_issue);
    const timezone = TIMEZONE_MAP[jurisdiction] || "UTC";
    const clientName = `${client.first_name} ${client.surname}`;

    const [{ data: docTypes }, { data: products }] = await Promise.all([
      admin.from("document_types").select("id, category").eq("user_id", userId),
      admin.from("products").select("id, name").eq("user_id", userId).eq("is_deleted", false).limit(10),
    ]);

    const docTypeIdsByCategory = (docTypes || []).reduce<Record<string, string[]>>((acc: Record<string, string[]>, item: any) => {
      const key = item.category || "Client";
      if (!acc[key]) acc[key] = [];
      acc[key].push(item.id);
      return acc;
    }, {});

    const now = new Date();
    const eventPlan = [
      { dayOffset: -56, type: "Annual Review", duration: 75 },
      { dayOffset: -35, type: "Portfolio Review", duration: 60 },
      { dayOffset: -18, type: "Compliance Review", duration: 45 },
      { dayOffset: -7, type: "Meeting", duration: 50 },
      { dayOffset: 6, type: "Client Call", duration: 30 },
      { dayOffset: 18, type: "Portfolio Review", duration: 60 },
      { dayOffset: 32, type: "Meeting", duration: 45 },
    ];

    const startWindow = addDays(now, -90).toISOString();
    const endWindow = addDays(now, 60).toISOString();

    const { data: existingEvents } = await admin
      .from("calendar_events")
      .select("id")
      .eq("user_id", userId)
      .eq("client_id", clientId)
      .gte("start_time", startWindow)
      .lte("start_time", endWindow)
      .eq("is_deleted", false);

    const existingEventIds = (existingEvents || []).map((event: any) => event.id);
    if (existingEventIds.length > 0) {
      await admin.from("meeting_recordings").delete().in("calendar_event_id", existingEventIds);
      await admin.from("calendar_events").delete().in("id", existingEventIds);
    }

    await Promise.all([
      admin.from("client_notes").delete().eq("user_id", userId).eq("client_id", clientId),
      admin.from("documents").delete().eq("user_id", userId).eq("client_id", clientId),
      admin.from("project_opportunities").delete().eq("user_id", userId).eq("client_id", clientId),
      admin.from("client_products").delete().eq("user_id", userId).eq("client_id", clientId),
      admin.from("tasks").delete().eq("user_id", userId).eq("client_id", clientId),
    ]);

    const eventsToInsert = eventPlan.map((plan, index) => {
      const eventType = EVENT_TYPES.find((item) => item.type === plan.type) || EVENT_TYPES[0];
      const eventDate = addDays(now, plan.dayOffset);
      const startTime = setTime(eventDate, 9 + (index % 4) * 2, index % 2 === 0 ? 0 : 30);
      const endTime = new Date(startTime.getTime() + plan.duration * 60_000);
      const isPast = endTime.getTime() < now.getTime();

      return {
        user_id: userId,
        client_id: clientId,
        title: `${plan.type} - ${clientName}`,
        description: `${plan.type} with ${clientName}`,
        event_type: plan.type,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        color: eventType.color,
        status: isPast ? "Completed" : "Scheduled",
        location: index % 2 === 0 ? "Office" : "Zoom",
        timezone,
        all_day: false,
        is_recurring: false,
        is_deleted: false,
        ai_prep_note: buildPrepNote(jurisdiction, plan.type, clientName),
      };
    });

    const { data: insertedEvents, error: eventsInsertError } = await admin
      .from("calendar_events")
      .insert(eventsToInsert)
      .select("id, title, event_type, start_time, end_time, client_id, user_id");

    if (eventsInsertError) throw eventsInsertError;

    const noteTemplates = jurisdictionNotes[jurisdiction] || jurisdictionNotes.ZA;
    const notesToInsert = noteTemplates.subjects.map((subject, index) => ({
      user_id: userId,
      client_id: clientId,
      subject,
      content: noteTemplates.content[index],
      interaction_type: randomFrom(["Note", "Email", "Call"]),
      priority: randomFrom(["Low", "Medium", "High"]),
      is_complete: Math.random() > 0.35,
      is_deleted: false,
      is_visible_portal: false,
      created_at: addDays(now, -50 + index * 9).toISOString(),
    }));

    const docTemplates = jurisdictionDocs[jurisdiction] || jurisdictionDocs.ZA;
    const documentsToInsert = docTemplates.map((document, index) => {
      const status = index === 0 ? "Expired" : index === 1 ? "Pending" : "Complete";
      const categoryIds = docTypeIdsByCategory[document.category] || docTypeIdsByCategory.Client || [];
      return {
        user_id: userId,
        client_id: clientId,
        name: document.name,
        status,
        document_type_id: categoryIds[0] || null,
        expiry_date: status === "Expired"
          ? addDays(now, -20).toISOString().split("T")[0]
          : status === "Pending"
          ? addDays(now, 45).toISOString().split("T")[0]
          : null,
        is_deleted: false,
        created_at: addDays(now, -40 + index * 5).toISOString(),
      };
    });

    let opportunityProjectId: string | null = null;
    const { data: opportunityProject, error: opportunityProjectError } = await admin
      .from("opportunity_projects")
      .insert({
        user_id: userId,
        name: `${clientName} Meeting Opportunities`,
        description: `Seeded meeting workflow opportunities for ${clientName}`,
        project_type: "growth",
        status: "Active",
        target_revenue: 100000,
        realized_revenue: 0,
        region_code: jurisdiction,
        sla_days: 30,
      })
      .select("id")
      .single();

    if (opportunityProjectError) throw opportunityProjectError;
    opportunityProjectId = opportunityProject.id;

    const opportunitiesToInsert = shuffle(opportunityTemplates).slice(0, 3).map((opportunity, index) => ({
      user_id: userId,
      client_id: clientId,
      client_name: clientName,
      opportunity_type: opportunity.type,
      potential_revenue: 10000 + index * 12500,
      confidence: 55 + index * 10,
      status: index === 0 ? "In Progress" : "Identified",
      suggested_action: opportunity.action,
      reasoning: opportunity.reasoning,
      current_value: 250000 + index * 200000,
      project_id: opportunityProjectId,
    }));

    const tasksToInsert = insertedEvents
      .filter((event: any) => new Date(event.end_time).getTime() < now.getTime())
      .flatMap((event: any) => {
        const templates = generateActionItems(event.event_type, event.start_time);
        return templates.map((task: any, index: number) => ({
          user_id: userId,
          client_id: clientId,
          title: task.title,
          description: task.description,
          task_type: task.task_type,
          priority: task.priority,
          status: index === 0 ? "In Progress" : "Not Started",
          due_date: task.suggested_due_date,
          assigned_to_user_id: userId,
          created_by: userId,
          is_practice_task: false,
          notes: [],
          is_deleted: false,
          created_at: addDays(new Date(event.start_time), 1).toISOString(),
        }));
      });

    const productIds = (products || []).map((product: any) => product.id).slice(0, 3);
    const productsToInsert = productIds.map((productId: string, index: number) => ({
      user_id: userId,
      client_id: clientId,
      product_id: productId,
      status: "Active",
      role: "Owner",
      current_value: 150000 + index * 175000,
      premium_amount: 1500 + index * 500,
      frequency: index % 2 === 0 ? "Monthly" : "Annually",
      policy_number: `POL-${randomInt(100000, 999999)}`,
      start_date: addDays(now, -(365 + index * 180)).toISOString().split("T")[0],
      is_deleted: false,
      is_linked: false,
    }));

    await Promise.all([
      notesToInsert.length ? admin.from("client_notes").insert(notesToInsert) : Promise.resolve(),
      documentsToInsert.length ? admin.from("documents").insert(documentsToInsert) : Promise.resolve(),
      opportunitiesToInsert.length ? admin.from("project_opportunities").insert(opportunitiesToInsert) : Promise.resolve(),
      tasksToInsert.length ? admin.from("tasks").insert(tasksToInsert) : Promise.resolve(),
      productsToInsert.length ? admin.from("client_products").insert(productsToInsert) : Promise.resolve(),
    ]);

    const recordingsToInsert = insertedEvents
      .filter((event: any) => new Date(event.end_time).getTime() < now.getTime())
      .map((event: any) => ({
        title: event.title,
        calendar_event_id: event.id,
        client_id: clientId,
        user_id: userId,
        transcription: (transcriptTemplates[event.event_type] || transcriptTemplates.Meeting)(clientName, jurisdiction),
        transcription_status: "completed",
        duration_seconds: Math.max(Math.floor((new Date(event.end_time).getTime() - new Date(event.start_time).getTime()) / 1000), 1200),
        recording_started_at: event.start_time,
        recording_ended_at: event.end_time,
        ai_summary: generateAiSummary(event.event_type, clientName, event.start_time),
        ai_action_items: generateActionItems(event.event_type, event.start_time),
        is_deleted: false,
      }));

    if (recordingsToInsert.length) {
      const { error: recordingsError } = await admin.from("meeting_recordings").insert(recordingsToInsert);
      if (recordingsError) throw recordingsError;
    }

    return new Response(JSON.stringify({
      success: true,
      clientId,
      clientName,
      meetings: insertedEvents.length,
      recordings: recordingsToInsert.length,
      tasks: tasksToInsert.length,
      notes: notesToInsert.length,
      documents: documentsToInsert.length,
      opportunities: opportunitiesToInsert.length,
      products: productsToInsert.length,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("seed-client-meetings error:", error);
    return new Response(JSON.stringify({ success: false, error: error.message || "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
