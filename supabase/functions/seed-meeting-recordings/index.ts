import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Jurisdiction-aware transcript templates by event type
const transcriptTemplates: Record<string, (clientName: string, jurisdiction: string) => string> = {
  "Portfolio Review": (name, jur) => {
    const products = {
      ZA: "Retirement Annuity and TFSA",
      AU: "Superannuation fund and managed portfolio",
      CA: "RRSP and TFSA accounts",
      GB: "ISA and SIPP holdings",
      US: "401(k) and IRA accounts",
    }[jur] || "investment portfolio";
    return `[00:00] Advisor: Good morning ${name}, thank you for joining. Today we'll be reviewing your portfolio performance over the last quarter.
[00:45] ${name}: Thanks for setting this up. I've been curious about how things have been tracking.
[01:30] Advisor: Let's start with your ${products}. Overall, your portfolio has returned 8.2% year-to-date, which is ahead of our benchmark by about 1.5%.
[03:15] ${name}: That's encouraging. I noticed some volatility last month though.
[04:00] Advisor: Yes, we saw some market turbulence in the tech sector. Your equity allocation dipped briefly but has recovered. Your current asset allocation is 65% equities, 25% fixed income, and 10% alternatives.
[06:30] ${name}: Should we be concerned about the concentration in equities?
[07:15] Advisor: Given your risk profile and time horizon, the allocation is appropriate. However, I'd recommend we consider rebalancing slightly — moving about 5% from equities into fixed income to lock in some gains.
[09:00] ${name}: That sounds reasonable. What about the fees? I saw something about platform fees changing.
[10:30] Advisor: Good question. The platform fee adjustment is minimal — about 0.05% increase. I've done a comparison and your current platform still offers the best value for your portfolio size.
[12:00] Advisor: I'd also like to flag that we have an opportunity to consolidate two of your smaller holdings into a more tax-efficient structure.
[13:45] ${name}: Tell me more about that.
[14:30] Advisor: We could merge your two separate unit trust holdings into a single balanced fund, which would reduce your overall expense ratio by about 0.3% annually and simplify your reporting.
[16:00] ${name}: I like the sound of that. Let's go ahead with the consolidation.
[17:30] Advisor: Perfect. I'll prepare the switch instruction for your approval. We should also review your beneficiary nominations — when did you last update those?
[19:00] ${name}: Hmm, I think it's been about two years. My circumstances haven't changed though.
[20:15] Advisor: It's still good practice to confirm them annually. I'll send you the current nominations to review and sign off on.
[22:00] Advisor: One last item — your annual review is coming up in three months. I'd like to do a comprehensive financial plan update at that stage. Sound good?
[23:30] ${name}: Absolutely. Thanks for the thorough review today.
[24:00] Advisor: My pleasure. I'll send you a summary with the action items we discussed. Have a great day.`;
  },

  "Annual Review": (name, jur) => {
    const taxTerm = {
      ZA: "tax year-end in February",
      AU: "end of financial year in June",
      CA: "RRSP contribution deadline in March",
      GB: "tax year-end in April",
      US: "tax filing deadline in April",
    }[jur] || "tax year-end";
    return `[00:00] Advisor: Welcome ${name}. This is our annual comprehensive review. I want to cover your financial goals, life changes, and overall strategy.
[01:00] ${name}: Great, I've been looking forward to this. There are a few things I want to discuss.
[02:00] Advisor: Perfect. Let's start — have there been any significant life changes since we last met? Marriage, children, job changes, health issues?
[03:30] ${name}: Actually yes, we're expecting our second child in about four months.
[04:15] Advisor: Congratulations! That's wonderful news. This will impact our planning in several ways — we should review your life cover, income protection, and potentially adjust your emergency fund.
[06:00] ${name}: Yes, I was thinking the same. My current life cover might not be enough now.
[07:00] Advisor: Let me pull up your current coverage. You have 10x annual salary, which was appropriate for one child. With a second on the way, I'd recommend increasing to 12-15x. I'll get quotes for you this week.
[09:00] Advisor: Now let's look at your investment performance. Your portfolio has grown 12% over the past year, outperforming the benchmark by 2.3%.
[11:00] ${name}: That's great. What about my retirement projections?
[12:30] Advisor: Based on your current savings rate and investment returns, you're on track to retire at 62 with approximately 75% income replacement. If we increase your monthly contribution by 10%, we could bring that up to 80%.
[14:00] ${name}: That's something to consider. We need to balance that with the new baby expenses though.
[15:30] Advisor: Absolutely. I suggest we revisit the contribution increase in six months, once you've settled into the new routine. For now, let's focus on the insurance gap and updating your estate plan.
[17:00] ${name}: Good idea. My will definitely needs updating to include the new baby.
[18:30] Advisor: I'll coordinate with your estate planner. We also need to update your beneficiary nominations across all your policies. With ${taxTerm} approaching, there may also be some tax optimization opportunities.
[20:00] ${name}: What kind of opportunities?
[21:00] Advisor: We could make an additional lump sum contribution before the deadline. This would give you a tax deduction and boost your retirement savings. I'll run the numbers and send you a recommendation.
[23:00] Advisor: Let me summarize our action items: update life cover, review estate plan, update beneficiaries, and assess tax optimization. I'll have everything prepared within two weeks.
[24:30] ${name}: Thank you, this has been really productive.
[25:00] Advisor: Absolutely. Congratulations again on the new addition to the family!`;
  },

  "Compliance Review": (name, jur) => {
    const compliance = {
      ZA: "FICA verification and FAIS compliance",
      AU: "AML/CTF verification and AFSL compliance",
      CA: "KYC verification and securities compliance",
      GB: "FCA compliance and anti-money laundering checks",
      US: "KYC/AML verification and SEC compliance",
    }[jur] || "regulatory compliance";
    return `[00:00] Advisor: Hello ${name}. Today we need to go through our regular ${compliance} review. This is a regulatory requirement to ensure all your documentation is current.
[01:30] ${name}: Of course. What do you need from me?
[02:00] Advisor: First, let me confirm your personal details. Has your residential address changed in the past 12 months?
[03:00] ${name}: No, same address.
[03:30] Advisor: Good. And your employment status — still with the same employer?
[04:00] ${name}: Yes, though I was promoted to Senior Manager last quarter.
[04:30] Advisor: Congratulations! I'll update that. Now, I need to verify your identity documents. Your ID document on file expires in six months — we should get an updated copy.
[06:00] ${name}: I can email that to you this week.
[06:30] Advisor: Perfect. I also need to review your risk profile questionnaire. We last did this 18 months ago. Given the promotion and any changes in your financial situation, it's worth revisiting.
[08:00] ${name}: Sure, my risk appetite hasn't really changed, but I understand the need to document it.
[09:00] Advisor: I'll send you the updated questionnaire via our secure portal. Now, regarding your source of funds — we need to confirm the origin of any new deposits over the past year.
[10:30] ${name}: The large deposit in March was from my annual bonus, and the one in August was from selling my old car.
[11:30] Advisor: Thank you, I'll note that. Lastly, I need to confirm your tax residency status — you're still only tax resident in this jurisdiction?
[12:30] ${name}: Correct, no changes there.
[13:00] Advisor: Excellent. Everything looks in order. I'll send you the risk profile questionnaire and request the updated ID copy. Once those are in, we'll be fully compliant for the next review cycle.
[14:00] ${name}: Sounds good. Thanks for making this painless.
[14:30] Advisor: That's what we're here for. Have a great day.`;
  },

  "Meeting": (name, jur) => {
    const product = {
      ZA: "unit trusts and tax-free savings",
      AU: "managed funds and superannuation",
      CA: "mutual funds and registered accounts",
      GB: "ISAs and pension schemes",
      US: "mutual funds and retirement accounts",
    }[jur] || "investment products";
    return `[00:00] Advisor: Hi ${name}, thanks for coming in today. I wanted to discuss a few things — your current financial position and some new opportunities I've identified.
[01:00] ${name}: Great, I've got a few questions as well.
[01:30] Advisor: Let's start with your current ${product}. Your investment portfolio has been performing well, but I've noticed some idle cash that could be put to work.
[03:00] ${name}: Yes, I've been meaning to invest that. How much is sitting in cash?
[03:30] Advisor: About 15% of your total portfolio, which is higher than your target of 5%. I'd recommend deploying the excess into a diversified equity fund to capture the current market opportunity.
[05:00] ${name}: That makes sense. What fund would you recommend?
[05:30] Advisor: Given your moderate-aggressive risk profile, I'd suggest a balanced growth fund with a 70/30 equity-bond split. The management fee is competitive at 0.65%.
[07:00] ${name}: Okay, let's do that. I also wanted to ask about estate planning — we haven't discussed that in a while.
[08:00] Advisor: Good timing. I've flagged that your will is more than three years old. With the changes in your family situation, it's important to update it.
[09:30] ${name}: You're right. Can you refer me to someone?
[10:00] Advisor: Absolutely, I work closely with an estate planning specialist. I'll set up an introduction. In the meantime, let's make sure your beneficiary nominations are current across all your policies.
[11:30] ${name}: Perfect. One more thing — I'm thinking about increasing my monthly savings. Is there a tax-efficient way to do that?
[12:30] Advisor: Definitely. We can increase your contributions to your tax-advantaged accounts. I'll calculate the optimal amount and send you a proposal by end of week.
[14:00] ${name}: That would be great. Thanks for the thorough discussion.
[14:30] Advisor: My pleasure. I'll follow up with everything we discussed within the next few days.`;
  },

  "Client Call": (name, jur) => {
    return `[00:00] Advisor: Hi ${name}, thanks for taking my call. I just wanted to touch base on a few items from our last meeting.
[00:30] ${name}: Of course, good to hear from you.
[01:00] Advisor: First, the fund switch we discussed has been processed. The confirmation should be in your email.
[01:45] ${name}: Great, I did see that come through. Everything look okay?
[02:15] Advisor: Yes, it went through smoothly. The new fund allocation is now active. Secondly, I wanted to let you know that your quarterly statement is available on the portal.
[03:30] ${name}: Thanks, I'll take a look.
[04:00] Advisor: One more thing — I noticed that your risk insurance premium is due for review next month. It might be worth shopping around for a better rate given your improved health profile.
[05:00] ${name}: That's a good point. I did mention I've been more active lately.
[05:30] Advisor: Exactly. I'll request updated quotes and compare them with your current premium. If we can get a better deal, I'll present the options.
[06:30] ${name}: Sounds good. Anything else?
[07:00] Advisor: That's it for now. I'll send you the insurance quote comparison by next week. Have a great day.
[07:30] ${name}: Thanks, you too.`;
  },
};

function getJurisdiction(client: any): string {
  const country = (client?.country || client?.jurisdiction || "").toLowerCase();
  if (country.includes("south africa") || country === "za") return "ZA";
  if (country.includes("australia") || country === "au") return "AU";
  if (country.includes("canada") || country === "ca") return "CA";
  if (country.includes("united kingdom") || country === "gb") return "GB";
  if (country.includes("united states") || country === "us") return "US";
  return "ZA"; // default
}

function getEventCategory(eventType: string, title: string): string {
  const t = (title || "").toLowerCase();
  if (t.includes("portfolio review") || t.includes("investment review")) return "Portfolio Review";
  if (t.includes("annual review") || t.includes("yearly review")) return "Annual Review";
  if (t.includes("compliance") || t.includes("fica") || t.includes("kyc")) return "Compliance Review";
  if (t.includes("call") || t.includes("check-in") || t.includes("follow")) return "Client Call";
  if (eventType === "Portfolio Review") return "Portfolio Review";
  if (eventType === "Compliance Review") return "Compliance Review";
  return "Meeting";
}

function generateAiSummary(category: string, clientName: string, jurisdiction: string, eventDate: string) {
  const summaries: Record<string, any> = {
    "Portfolio Review": {
      summary: `Comprehensive portfolio review conducted with ${clientName}. Portfolio returned 8.2% YTD, outperforming benchmark by 1.5%. Discussed rebalancing to reduce equity concentration and consolidating smaller holdings for tax efficiency.`,
      key_topics: ["Portfolio Performance", "Asset Allocation", "Rebalancing", "Fee Analysis", "Tax Efficiency"],
      decisions_made: ["Rebalance 5% from equities to fixed income", "Consolidate two unit trust holdings", "Confirm beneficiary nominations"],
      client_facts: { risk_tolerance: "Moderate-Aggressive", satisfaction: "High", investment_horizon: "Long-term" },
    },
    "Annual Review": {
      summary: `Annual comprehensive review with ${clientName}. Key life change: expecting second child. Reviewed retirement projections showing on-track for 75% income replacement at 62. Identified gaps in life cover and estate planning.`,
      key_topics: ["Life Changes", "Retirement Planning", "Life Insurance", "Estate Planning", "Tax Optimization"],
      decisions_made: ["Increase life cover to 12-15x salary", "Update will and estate plan", "Reassess contribution increase in 6 months"],
      client_facts: { life_event: "Expecting second child", retirement_age_target: 62, income_replacement: "75%" },
    },
    "Compliance Review": {
      summary: `Regulatory compliance review completed with ${clientName}. Personal details confirmed. ID document expiring in 6 months — copy requested. Risk profile questionnaire to be updated. Source of funds verified for recent deposits.`,
      key_topics: ["Identity Verification", "Risk Profile Update", "Source of Funds", "Document Expiry", "Regulatory Compliance"],
      decisions_made: ["Request updated ID document", "Send risk profile questionnaire", "Document source of funds for recent deposits"],
      client_facts: { employment_change: "Promoted to Senior Manager", address_changed: false, tax_residency_confirmed: true },
    },
    "Meeting": {
      summary: `Advisory meeting with ${clientName}. Identified 15% idle cash above target allocation. Recommended deploying excess into balanced growth fund. Discussed estate planning needs and tax-efficient savings strategies.`,
      key_topics: ["Cash Management", "Fund Selection", "Estate Planning", "Tax-Efficient Savings", "Beneficiary Review"],
      decisions_made: ["Invest excess cash into balanced growth fund", "Arrange estate planning referral", "Increase tax-advantaged contributions"],
      client_facts: { idle_cash_percentage: "15%", risk_profile: "Moderate-Aggressive", will_age: "3+ years" },
    },
    "Client Call": {
      summary: `Follow-up call with ${clientName}. Confirmed fund switch processed successfully. Quarterly statement available. Identified insurance premium review opportunity based on improved health profile.`,
      key_topics: ["Fund Switch Confirmation", "Statement Review", "Insurance Premium Review"],
      decisions_made: ["Request updated insurance quotes", "Compare premiums with current provider"],
      client_facts: { fund_switch_status: "Completed", health_profile: "Improved" },
    },
  };

  const base = summaries[category] || summaries["Meeting"];
  const followUpDate = new Date(eventDate);
  followUpDate.setDate(followUpDate.getDate() + 14 + Math.floor(Math.random() * 14));

  return {
    ...base,
    follow_up_date: followUpDate.toISOString().split("T")[0],
  };
}

function generateActionItems(category: string, eventDate: string, jurisdiction: string) {
  const baseDate = new Date(eventDate);
  const dueDate = (days: number) => {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + days);
    return d.toISOString().split("T")[0];
  };

  const items: Record<string, any[]> = {
    "Portfolio Review": [
      { title: "Process rebalancing instruction", description: "Move 5% from equities to fixed income as discussed", priority: "High", suggested_due_date: dueDate(7), task_type: "Portfolio Review", source_quote: "I'd recommend we consider rebalancing slightly — moving about 5% from equities into fixed income" },
      { title: "Prepare fund consolidation switch", description: "Merge two unit trust holdings into single balanced fund", priority: "Medium", suggested_due_date: dueDate(14), task_type: "Follow-up", source_quote: "We could merge your two separate unit trust holdings into a single balanced fund" },
      { title: "Send beneficiary nomination forms", description: "Email current nominations for client review and sign-off", priority: "Medium", suggested_due_date: dueDate(5), task_type: "Follow-up", source_quote: "I'll send you the current nominations to review and sign off on" },
    ],
    "Annual Review": [
      { title: "Obtain life cover quotes", description: "Get quotes for increased cover at 12-15x annual salary", priority: "High", suggested_due_date: dueDate(7), task_type: "Follow-up", source_quote: "I'd recommend increasing to 12-15x. I'll get quotes for you this week" },
      { title: "Coordinate estate plan update", description: "Contact estate planner to update will for new child", priority: "High", suggested_due_date: dueDate(14), task_type: "Follow-up", source_quote: "I'll coordinate with your estate planner" },
      { title: "Update beneficiary nominations", description: "Update across all policies to include new family member", priority: "Medium", suggested_due_date: dueDate(10), task_type: "Follow-up", source_quote: "We also need to update your beneficiary nominations across all your policies" },
      { title: "Calculate tax optimization opportunity", description: "Run numbers for additional lump sum contribution before deadline", priority: "Medium", suggested_due_date: dueDate(21), task_type: "Follow-up", source_quote: "I'll run the numbers and send you a recommendation" },
    ],
    "Compliance Review": [
      { title: "Follow up on ID document copy", description: "Ensure client sends updated ID document before expiry", priority: "High", suggested_due_date: dueDate(7), task_type: "Follow-up", source_quote: "Your ID document on file expires in six months — we should get an updated copy" },
      { title: "Send risk profile questionnaire", description: "Send updated questionnaire via secure portal", priority: "Medium", suggested_due_date: dueDate(3), task_type: "Follow-up", source_quote: "I'll send you the updated questionnaire via our secure portal" },
      { title: "Update employment details", description: "Record promotion to Senior Manager in client profile", priority: "Low", suggested_due_date: dueDate(2), task_type: "Follow-up", source_quote: "I was promoted to Senior Manager last quarter" },
    ],
    "Meeting": [
      { title: "Process idle cash deployment", description: "Invest excess cash into balanced growth fund (70/30 split)", priority: "High", suggested_due_date: dueDate(7), task_type: "Portfolio Review", source_quote: "I'd suggest a balanced growth fund with a 70/30 equity-bond split" },
      { title: "Arrange estate planning introduction", description: "Set up meeting with estate planning specialist", priority: "Medium", suggested_due_date: dueDate(10), task_type: "Follow-up", source_quote: "I work closely with an estate planning specialist. I'll set up an introduction" },
      { title: "Prepare tax-efficient savings proposal", description: "Calculate optimal contribution increase for tax-advantaged accounts", priority: "Medium", suggested_due_date: dueDate(5), task_type: "Follow-up", source_quote: "I'll calculate the optimal amount and send you a proposal by end of week" },
    ],
    "Client Call": [
      { title: "Request updated insurance quotes", description: "Obtain competitive quotes based on improved health profile", priority: "Medium", suggested_due_date: dueDate(7), task_type: "Follow-up", source_quote: "I'll request updated quotes and compare them with your current premium" },
      { title: "Send insurance comparison report", description: "Compare new quotes with current premium and present options", priority: "Medium", suggested_due_date: dueDate(14), task_type: "Follow-up", source_quote: "If we can get a better deal, I'll present the options" },
    ],
  };

  return items[category] || items["Meeting"];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Get all completed past calendar events with client info
    const now = new Date().toISOString();
    const { data: events, error: eventsError } = await supabase
      .from("calendar_events")
      .select("id, title, start_time, end_time, event_type, client_id, user_id, clients(first_name, last_name, country, jurisdiction)")
      .eq("is_deleted", false)
      .lt("end_time", now)
      .not("client_id", "is", null)
      .order("start_time", { ascending: false })
      .limit(500);

    if (eventsError) throw eventsError;
    if (!events || events.length === 0) {
      return new Response(JSON.stringify({ success: true, message: "No past events found", count: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Delete existing meeting recordings for these events (idempotent)
    const eventIds = events.map((e: any) => e.id);
    await supabase
      .from("meeting_recordings")
      .delete()
      .in("calendar_event_id", eventIds);

    let created = 0;
    const batchSize = 50;

    for (let i = 0; i < events.length; i += batchSize) {
      const batch = events.slice(i, i + batchSize);
      const recordings = batch.map((event: any) => {
        const client = event.clients;
        const clientName = client ? `${client.first_name} ${client.last_name}` : "Client";
        const jurisdiction = getJurisdiction(client);
        const category = getEventCategory(event.event_type, event.title);

        const templateFn = transcriptTemplates[category] || transcriptTemplates["Meeting"];
        const transcription = templateFn(clientName, jurisdiction);

        const startTime = new Date(event.start_time);
        const endTime = new Date(event.end_time);
        const durationSeconds = Math.max(
          Math.floor((endTime.getTime() - startTime.getTime()) / 1000),
          1200 + Math.floor(Math.random() * 2400) // 20-60 min fallback
        );

        return {
          title: event.title,
          calendar_event_id: event.id,
          client_id: event.client_id,
          user_id: event.user_id,
          transcription,
          transcription_status: "completed",
          duration_seconds: durationSeconds,
          recording_started_at: event.start_time,
          recording_ended_at: event.end_time,
          ai_summary: generateAiSummary(category, clientName, jurisdiction, event.start_time),
          ai_action_items: generateActionItems(category, event.start_time, jurisdiction),
        };
      });

      const { error: insertError } = await supabase
        .from("meeting_recordings")
        .insert(recordings);

      if (insertError) {
        console.error("Batch insert error:", insertError);
      } else {
        created += recordings.length;
      }
    }

    return new Response(
      JSON.stringify({ success: true, count: created, totalEvents: events.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("seed-meeting-recordings error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
