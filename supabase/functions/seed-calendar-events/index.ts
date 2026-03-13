import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const TIMEZONE_MAP: Record<string, string> = {
  ZA: "Africa/Johannesburg",
  AU: "Australia/Sydney",
  CA: "America/Toronto",
  GB: "Europe/London",
  US: "America/New_York",
};

const EVENT_TYPES = [
  { type: "Meeting", weight: 35, color: "hsl(180,70%,45%)" },
  { type: "Client Call", weight: 25, color: "hsl(171,70%,45%)" },
  { type: "Portfolio Review", weight: 15, color: "hsl(270,60%,60%)" },
  { type: "Annual Review", weight: 15, color: "hsl(270,70%,55%)" },
  { type: "Compliance Review", weight: 10, color: "hsl(38,90%,55%)" },
];

const LOCATIONS = ["Office", "Zoom", "Client Premises", null];

// ~30 template fragments per jurisdiction/event-type for unique prep notes
const PREP_FRAGMENTS: Record<string, Record<string, string[]>> = {
  ZA: {
    "Meeting": [
      "Client's RA contributions are nearing the R350k annual deduction limit — discuss topping up before tax year-end.",
      "Offshore exposure currently sits at 22% against a 45% Regulation 28 limit; there's room to diversify further.",
      "The recent rand weakness has boosted the offshore portion — consider rebalancing to lock in gains.",
      "FICA documents were last updated 18 months ago; verify that proof of address is still current.",
      "Client mentioned interest in a living annuity drawdown adjustment at the last meeting.",
    ],
    "Client Call": [
      "Follow up on the tax-free savings account contribution for the current tax year.",
      "Client's unit trust distribution statements are available — share the updated yield figures.",
      "Medical aid scheme changes take effect next quarter; check if the current plan still suits the family.",
      "Discuss the impact of recent SA interest rate changes on the bond repayments.",
      "Outstanding SARS query on the IT12 return needs client input before the deadline.",
    ],
    "Portfolio Review": [
      "Portfolio has drifted 3.2% from the target allocation over the past quarter — rebalancing is recommended.",
      "Local equity allocation is overweight relative to the model portfolio; consider switching into balanced funds.",
      "The Regulation 28 compliant offshore property allocation is underperforming the benchmark by 1.8%.",
      "Total investment return of 11.4% YTD is ahead of CPI+5% target — highlight this positive momentum.",
      "Fee analysis shows the effective TER is 1.42%; compare against lower-cost passive alternatives.",
    ],
    "Annual Review": [
      "This is the client's annual review — prepare a comprehensive performance summary for all investment accounts.",
      "Estate plan was last reviewed two years ago; recommend updating beneficiary nominations.",
      "Life cover gap analysis indicates a shortfall of approximately R2.5 million — discuss options.",
      "Client's retirement projection shows a potential income gap at age 65 under current contribution levels.",
      "Tax certificate season is approaching — ensure all investment accounts are consolidated for the return.",
    ],
    "Compliance Review": [
      "FAIS compliance audit is due; ensure the record of advice is up to date for this client.",
      "Risk profile questionnaire needs to be refreshed — it was last completed over 12 months ago.",
      "Verify that the client's FICA status is current and all identification documents are on file.",
      "Ensure the latest replacement advice documentation is filed for the recent product switch.",
      "Review TCF (Treating Customers Fairly) outcomes against the client's recent interactions.",
    ],
  },
  US: {
    "Meeting": [
      "Client's 401(k) rollover from the previous employer is still pending — follow up on the paperwork status.",
      "RMD deadline is approaching in Q1 — calculate the required minimum distribution amount.",
      "Roth conversion opportunity exists given the client's lower income this year; model the tax impact.",
      "Check if the client's HSA contributions are maximized for the current tax year.",
      "Review beneficiary designations following the client's recent marriage.",
    ],
    "Client Call": [
      "Discuss the impact of recent Fed rate decisions on the client's fixed income allocation.",
      "Client's 529 plan for their eldest child needs a contribution review before the state tax deadline.",
      "Outstanding 1099 forms need to be reconciled before the April filing deadline.",
      "Follow up on the backdoor Roth IRA contribution strategy discussed last quarter.",
      "Social Security claiming strategy needs review — client turns 62 next year.",
    ],
    "Portfolio Review": [
      "S&P 500 exposure is 42% of the portfolio — evaluate concentration risk in US large cap.",
      "International diversification is below the recommended 25% target at only 16%.",
      "Tax-loss harvesting opportunities exist in the non-qualified brokerage account — identify specific lots.",
      "The portfolio's Sharpe ratio has improved to 1.3 over the trailing 12 months.",
      "ESG-aligned fund alternatives are available for the client's expressed interest in sustainable investing.",
    ],
    "Annual Review": [
      "Annual review should cover all accounts: 401(k), Roth IRA, taxable brokerage, and the 529 plan.",
      "Estate plan and trust documents need updating — the current will is from 2019.",
      "Life insurance policy review: the term policy expires in 3 years; discuss renewal or conversion options.",
      "Charitable giving strategy using donor-advised fund could provide significant tax benefits this year.",
      "Long-term care insurance quotes were requested at the last review — present the options.",
    ],
    "Compliance Review": [
      "Ensure ADV Part 2 brochure delivery is documented for the annual compliance requirement.",
      "Client's investment policy statement needs the annual acknowledgment signature.",
      "Review the suitability documentation for the recent alternative investment recommendation.",
      "Verify Form CRS delivery and documentation is current for this client relationship.",
      "Check that all required account paperwork meets current SEC and FINRA standards.",
    ],
  },
  AU: {
    "Meeting": [
      "Client's superannuation concessional contribution cap is $27,500 — check remaining capacity before June 30.",
      "The carry-forward unused concessional cap from prior years may allow an additional $15,000 contribution.",
      "Discuss the transition-to-retirement strategy as the client approaches preservation age.",
      "SMSF audit is due next quarter — ensure all investment strategy documentation is current.",
      "Review the impact of the recent Division 293 tax assessment on the client's super contributions.",
    ],
    "Client Call": [
      "Follow up on the insurance within super — death and TPD cover levels need review.",
      "Client's investment property settlement is expected next month; discuss the CGT implications.",
      "Centrelink asset test changes may affect the client's age pension eligibility — run the updated numbers.",
      "The new financial year brings updated contribution caps — prepare a summary of the changes.",
      "Discuss franking credit benefits from the increased allocation to Australian dividend stocks.",
    ],
    "Portfolio Review": [
      "Portfolio's Australian equity allocation is 48% — consider reducing home bias in favour of global exposure.",
      "The managed fund's MER of 0.89% is above the industry median; compare with lower-cost ETF alternatives.",
      "Infrastructure allocation has outperformed the benchmark by 2.1% — discuss maintaining the overweight position.",
      "Currency hedging on the international equity sleeve needs review given the weakening AUD.",
      "Performance attribution shows stock selection contributed 1.4% alpha over the past 12 months.",
    ],
    "Annual Review": [
      "Prepare the annual Statement of Advice review covering all superannuation and investment accounts.",
      "Estate planning: review the binding death benefit nomination — it expires in 3 months.",
      "Income protection insurance premiums have increased; compare quotes from alternative providers.",
      "Client's retirement projection indicates they're on track for a comfortable ASFA standard lifestyle.",
      "Tax planning for the end of financial year — explore strategies to minimize the client's tax liability.",
    ],
    "Compliance Review": [
      "Ensure the SOA (Statement of Advice) fee disclosure is compliant with the latest ASIC requirements.",
      "Client's annual FDS (Fee Disclosure Statement) is due — prepare the document.",
      "Opt-in notice needs to be sent within the next 60 days to maintain the ongoing fee arrangement.",
      "Review the appropriateness of the current risk profile against Best Interests Duty obligations.",
      "AFSL compliance register needs updating with the client's latest product holdings.",
    ],
  },
  CA: {
    "Meeting": [
      "RRSP contribution deadline is approaching — the client has $18,500 in available room.",
      "TFSA contribution limit for the current year is $7,000; discuss maximizing the tax-free growth opportunity.",
      "Client's RESP for their two children has room for additional contributions to maximize the CESG match.",
      "Discuss the Smith Manoeuvre strategy to make mortgage interest tax-deductible through investment borrowing.",
      "Non-registered account has accumulated capital gains — explore tax-loss selling before year-end.",
    ],
    "Client Call": [
      "Follow up on the RRSP meltdown strategy as the client approaches retirement.",
      "CPP and OAS optimization: discuss the benefits of deferring to age 70 versus starting at 65.",
      "Client's corporate investment account has retained earnings — review the passive income rules.",
      "Provincial health coverage changes may affect the client's supplementary insurance needs.",
      "GIC ladder is maturing next month — discuss reinvestment options given the current rate environment.",
    ],
    "Portfolio Review": [
      "Canadian equity exposure at 35% represents significant home bias — recommend increasing US and international allocation.",
      "The balanced fund's MER of 1.85% is above average; suggest lower-cost ETF portfolio alternatives.",
      "Dividend tax credit optimization: ensure eligible dividends are held in the non-registered account.",
      "Fixed income duration is currently 5.2 years — evaluate the interest rate risk given Bank of Canada signals.",
      "Alternative investments represent 8% of the portfolio — review the liquidity profile and suitability.",
    ],
    "Annual Review": [
      "Annual review should include RRSP, TFSA, RESP, and the non-registered investment account.",
      "Estate planning: review the will and power of attorney documents — last updated in 2020.",
      "Life insurance needs analysis: the term policy provides $500K but the client's needs have increased.",
      "Disability insurance review: the current benefit period and waiting period may need adjustment.",
      "Tax return preparation: gather T3, T5, and T5008 slips for all investment accounts.",
    ],
    "Compliance Review": [
      "Know Your Client form needs annual renewal — schedule the review with the client.",
      "Suitability assessment for the recent leveraged investment recommendation needs documentation.",
      "Ensure CRM2 cost reporting requirements are met for all client statements.",
      "Review compliance with the client-focused reforms including conflict of interest disclosure.",
      "Verify that the relationship disclosure information document is current and acknowledged.",
    ],
  },
  GB: {
    "Meeting": [
      "ISA allowance of £20,000 for the current tax year hasn't been fully utilized — discuss topping up.",
      "The client's pension lifetime allowance is approaching the limit; consider crystallisation strategies.",
      "Annual allowance carry-forward from the previous three years could allow an additional £40,000 pension contribution.",
      "Discuss the impact of the tapered annual allowance given the client's adjusted income level.",
      "Review the State Pension forecast and consider voluntary NI contributions to fill gaps.",
    ],
    "Client Call": [
      "Follow up on the pension drawdown income level — is the current withdrawal rate sustainable?",
      "Client's buy-to-let mortgage is coming off the fixed rate; discuss remortgaging options and impact on cash flow.",
      "The Junior ISA for their child is due for the annual top-up before the April deadline.",
      "Inheritance tax planning: review the use of gifting allowances and potentially exempt transfers.",
      "Enterprise Investment Scheme (EIS) opportunity may provide income tax relief — assess suitability.",
    ],
    "Portfolio Review": [
      "UK equity allocation is overweight at 38% relative to global market cap weighting of ~4%.",
      "Platform charges plus fund OCFs total 1.12% — benchmark against lower-cost alternatives.",
      "The multi-asset fund has underperformed its IA sector average by 0.8% over 3 years.",
      "Sustainable investment options have been requested — prepare ESG-screened fund alternatives.",
      "Fixed interest allocation may need adjusting given the Bank of England's rate trajectory.",
    ],
    "Annual Review": [
      "Annual suitability review covering the SIPP, ISA, and General Investment Account.",
      "Ensure the expression of wish form for the SIPP is up to date following the client's change in circumstances.",
      "Protection review: life cover and critical illness policies need to be assessed against current needs.",
      "Cash flow modelling should be updated to reflect the revised retirement date target.",
      "Consumer Duty: ensure the annual assessment demonstrates that the client is achieving good outcomes.",
    ],
    "Compliance Review": [
      "Ensure the annual suitability report meets the latest FCA requirements under Consumer Duty.",
      "Vulnerability assessment needs updating as part of the firm's fair value framework.",
      "Ongoing service agreement and fee structure must be reviewed for value assessment purposes.",
      "Check that MiFID II cost and charges disclosure has been provided for the current reporting period.",
      "Verify that the client's risk profile assessment is consistent with the current portfolio positioning.",
    ],
  },
};

function getRandomPrepNote(jurisdiction: string, eventType: string, clientName: string): string {
  const jur = PREP_FRAGMENTS[jurisdiction] || PREP_FRAGMENTS["ZA"];
  const fragments = jur[eventType] || jur["Meeting"] || [];
  if (fragments.length === 0) return `Prepare for the upcoming ${eventType.toLowerCase()} with ${clientName}.`;
  
  // Pick 2-3 random unique fragments
  const shuffled = [...fragments].sort(() => Math.random() - 0.5);
  const count = 2 + Math.floor(Math.random() * 2); // 2 or 3
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));
  return selected.join(" ");
}

function pickWeighted() {
  const total = EVENT_TYPES.reduce((s, e) => s + e.weight, 0);
  let r = Math.random() * total;
  for (const et of EVENT_TYPES) {
    r -= et.weight;
    if (r <= 0) return et;
  }
  return EVENT_TYPES[0];
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Get the UTC offset in ms for a given timezone at a given date
function getTimezoneOffsetMs(date: Date, tz: string): number {
  const utcStr = date.toLocaleString("en-US", { timeZone: "UTC" });
  const tzStr = date.toLocaleString("en-US", { timeZone: tz });
  return new Date(tzStr).getTime() - new Date(utcStr).getTime();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No auth" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = user.id;

    // Get all clients grouped by advisor
    const { data: clients, error: clientsError } = await supabase
      .from("clients")
      .select("id, first_name, surname, advisor, country_of_issue")
      .eq("user_id", userId);

    if (clientsError) throw clientsError;
    if (!clients || clients.length === 0) {
      return new Response(
        JSON.stringify({ error: "No clients found. Seed clients first." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Group clients by advisor
    const advisorClients: Record<
      string,
      { clients: typeof clients; jurisdiction: string }
    > = {};
    for (const c of clients) {
      const advisor = c.advisor || "Unknown";
      if (!advisorClients[advisor]) {
        // Determine jurisdiction from country_of_issue
        let jur = "ZA";
        const country = (c.country_of_issue || "").toLowerCase();
        if (country.includes("australia") || country === "au") jur = "AU";
        else if (country.includes("canada") || country === "ca") jur = "CA";
        else if (country.includes("united kingdom") || country === "gb")
          jur = "GB";
        else if (country.includes("united states") || country === "us")
          jur = "US";
        else if (country.includes("south africa") || country === "za")
          jur = "ZA";
        advisorClients[advisor] = { clients: [], jurisdiction: jur };
      }
      advisorClients[advisor].clients.push(c);
    }

    // Date range: today to today+29 (30 days)
    const now = new Date();
    const today = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    );
    const endDate = new Date(today);
    endDate.setUTCDate(endDate.getUTCDate() + 30);

    // Delete existing events in range for idempotency
    const { error: deleteError } = await supabase
      .from("calendar_events")
      .delete()
      .eq("user_id", userId)
      .gte("start_time", today.toISOString())
      .lt("start_time", endDate.toISOString());

    if (deleteError) {
      console.error("Delete error:", deleteError);
    }

    // Also delete past seeded events from today backwards 1 day to cover timezone offsets
    const yesterday = new Date(today);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    await supabase
      .from("calendar_events")
      .delete()
      .eq("user_id", userId)
      .gte("start_time", yesterday.toISOString())
      .lt("start_time", today.toISOString());

    // Generate events
    const allEvents: any[] = [];
    const advisorNames = Object.keys(advisorClients);

    for (const advisorName of advisorNames) {
      const { clients: advClients, jurisdiction } =
        advisorClients[advisorName];
      const tz = TIMEZONE_MAP[jurisdiction] || "UTC";

      for (let day = 0; day < 30; day++) {
        const dayDate = new Date(today);
        dayDate.setUTCDate(dayDate.getUTCDate() + day);

        // Calculate offset for this timezone on this day
        const offsetMs = getTimezoneOffsetMs(dayDate, tz);

        // 7 AM to 9 PM = 14 hours = 840 minutes
        // 20 events spread across 840 minutes = ~42 min slots
        const slotSize = 840 / 20;

        for (let i = 0; i < 20; i++) {
          const client =
            advClients[Math.floor(Math.random() * advClients.length)];
          const eventInfo = pickWeighted();
          const duration = randomInt(30, 90);

          // Start time in local minutes from midnight
          const localMinutes =
            7 * 60 + Math.floor(i * slotSize) + randomInt(0, Math.floor(slotSize * 0.6));
          const localHour = Math.floor(localMinutes / 60);
          const localMin = localMinutes % 60;

          // Clamp to 9 PM
          const clampedHour = Math.min(localHour, 21);

          // Build UTC start time: local midnight UTC + local offset - timezone offset
          const startUtc = new Date(dayDate);
          startUtc.setUTCHours(clampedHour, localMin, 0, 0);
          // Subtract timezone offset to convert local to UTC
          const startTime = new Date(startUtc.getTime() - offsetMs);

          const endTime = new Date(startTime.getTime() + duration * 60000);

          const clientName = `${client.first_name} ${client.surname}`;
          const title = `${eventInfo.type} - ${clientName}`;

          const status =
            endTime.getTime() < now.getTime() ? "Completed" : "Scheduled";
          const location =
            LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];

          allEvents.push({
            user_id: userId,
            title,
            description: `${eventInfo.type} with ${clientName}`,
            event_type: eventInfo.type,
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            client_id: client.id,
            color: eventInfo.color,
            status,
            location,
            timezone: tz,
            all_day: false,
            is_recurring: false,
            is_deleted: false,
            ai_prep_note: getRandomPrepNote(jurisdiction, eventInfo.type, clientName),
          });
        }
      }
    }

    // Insert in batches of 100
    let inserted = 0;
    for (let i = 0; i < allEvents.length; i += 100) {
      const batch = allEvents.slice(i, i + 100);
      const { error: insertError } = await supabase
        .from("calendar_events")
        .insert(batch);
      if (insertError) {
        console.error(`Batch insert error at ${i}:`, insertError);
        throw insertError;
      }
      inserted += batch.length;
    }

    return new Response(
      JSON.stringify({
        success: true,
        advisors: advisorNames.length,
        totalEvents: inserted,
        days: 30,
        eventsPerAdvisorPerDay: 20,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
