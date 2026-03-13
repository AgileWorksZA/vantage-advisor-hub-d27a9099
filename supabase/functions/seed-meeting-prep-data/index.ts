import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface Client {
  id: string;
  first_name: string;
  last_name: string;
  country_of_issue: string | null;
}

const jurisdictionNotes: Record<string, { subjects: string[]; content: string[] }> = {
  ZA: {
    subjects: [
      "FICA verification follow-up",
      "Retirement annuity contribution review",
      "Tax-free savings discussion",
      "Estate duty planning notes",
      "Offshore investment discussion",
    ],
    content: [
      "Discussed FICA documentation requirements. Client to provide updated proof of address within 30 days.",
      "Reviewed RA contribution limits for the current tax year. Recommend maximising before February deadline.",
      "Client interested in increasing TFSA contributions. Currently at R28,000 of R36,000 annual limit.",
      "Reviewed estate duty implications. Recommended updating will to reflect new beneficiary structure.",
      "Discussed Regulation 28 limits and offshore diversification options via feeder funds.",
    ],
  },
  AU: {
    subjects: [
      "Superannuation rollover discussion",
      "Tax file declaration update",
      "SMSF compliance review",
      "Insurance within super review",
      "Contribution cap planning",
    ],
    content: [
      "Client considering consolidating multiple super accounts. Compared fees and insurance implications.",
      "Updated tax file declaration on file. Confirmed TFN with fund administrator.",
      "Reviewed SMSF compliance requirements. Annual audit due next quarter.",
      "Assessed life and TPD cover within super. Premiums competitive but cover may be insufficient.",
      "Discussed concessional and non-concessional contribution caps for the financial year.",
    ],
  },
  CA: {
    subjects: [
      "RRSP contribution review",
      "TFSA rebalancing discussion",
      "RESP planning for children",
      "CPP/OAS retirement income projection",
      "Non-resident tax implications",
    ],
    content: [
      "Reviewed RRSP contribution room. Client has $45,000 unused room from prior years.",
      "TFSA portfolio drifted from target allocation. Recommend rebalancing into fixed income.",
      "Discussed RESP contributions and CESG matching. Currently contributing $2,500/year per child.",
      "Projected CPP and OAS income at age 65 vs 70. Deferral significantly increases monthly benefit.",
      "Client relocated temporarily. Reviewed non-resident withholding tax on investment income.",
    ],
  },
  GB: {
    subjects: [
      "ISA transfer notes",
      "Pension drawdown review",
      "IHT planning discussion",
      "Annual allowance check",
      "SIPP contribution strategy",
    ],
    content: [
      "Client transferring Cash ISA to Stocks & Shares ISA. Confirmed no loss of allowance.",
      "Reviewed pension drawdown strategy. Sustainable withdrawal rate at 4% with current fund size.",
      "Discussed inheritance tax planning. Potentially exempt transfers and use of nil-rate band.",
      "Checked annual allowance utilisation. Carry forward available from 3 prior years.",
      "Discussed employer pension vs SIPP contributions. Tax relief at higher rate confirmed.",
    ],
  },
  US: {
    subjects: [
      "401(k) rollover discussion",
      "Roth conversion strategy",
      "Estate planning trust review",
      "Social Security timing analysis",
      "Tax-loss harvesting review",
    ],
    content: [
      "Client left employer. Discussed rolling 401(k) to IRA vs keeping in plan. Fee comparison reviewed.",
      "Analyzed Roth conversion ladder strategy for early retirement. Tax bracket optimization discussed.",
      "Reviewed revocable living trust. Beneficiary designations need updating after life event.",
      "Modeled Social Security claiming at 62, FRA, and 70. Break-even analysis favours deferral.",
      "Identified tax-loss harvesting opportunities in taxable account. Wash sale rules reviewed.",
    ],
  },
};

const jurisdictionDocs: Record<string, { name: string; docTypeCategory: string }[]> = {
  ZA: [
    { name: "FICA - Proof of ID", docTypeCategory: "FICA" },
    { name: "FICA - Proof of Address", docTypeCategory: "FICA" },
    { name: "Record of Advice", docTypeCategory: "Client" },
    { name: "Tax Certificate", docTypeCategory: "FICA" },
    { name: "Mandate - Discretionary", docTypeCategory: "Client" },
  ],
  AU: [
    { name: "Tax File Declaration", docTypeCategory: "FICA" },
    { name: "Super Fund Statement", docTypeCategory: "Product" },
    { name: "Insurance Policy Schedule", docTypeCategory: "Product" },
    { name: "Statement of Advice", docTypeCategory: "Client" },
    { name: "ID Verification - Passport", docTypeCategory: "FICA" },
  ],
  CA: [
    { name: "KYC Verification Form", docTypeCategory: "FICA" },
    { name: "RRSP Contribution Receipt", docTypeCategory: "Product" },
    { name: "Investment Policy Statement", docTypeCategory: "Client" },
    { name: "Beneficiary Designation", docTypeCategory: "Product" },
    { name: "CRA Tax Assessment", docTypeCategory: "FICA" },
  ],
  GB: [
    { name: "ISA Transfer Form", docTypeCategory: "Product" },
    { name: "Pension Illustration", docTypeCategory: "Product" },
    { name: "Suitability Report", docTypeCategory: "Client" },
    { name: "Anti-Money Laundering Check", docTypeCategory: "FICA" },
    { name: "Fee Agreement", docTypeCategory: "Product" },
  ],
  US: [
    { name: "W-9 Form", docTypeCategory: "FICA" },
    { name: "IRA Rollover Form", docTypeCategory: "Product" },
    { name: "Financial Plan Summary", docTypeCategory: "Client" },
    { name: "Beneficiary Change Form", docTypeCategory: "Product" },
    { name: "ADV Part 2 Disclosure", docTypeCategory: "Client" },
  ],
};

const opportunityTemplates = [
  { type: "Portfolio Rebalancing", action: "Rebalance portfolio to align with target allocation", reasoning: "Portfolio drift detected — equity allocation exceeds target by 8%." },
  { type: "Life Cover Gap", action: "Review and increase life cover", reasoning: "Current cover insufficient based on income replacement analysis." },
  { type: "Retirement Planning", action: "Increase retirement contributions", reasoning: "On-track analysis shows projected shortfall at current contribution levels." },
  { type: "Tax Optimization", action: "Maximize tax-advantaged contributions before year-end", reasoning: "Unused contribution room available that expires at tax year-end." },
  { type: "Estate Planning", action: "Update will and beneficiary designations", reasoning: "Recent life event (marriage/child) requires estate plan revision." },
];

const interactionTypes = ["Note", "Email", "Call"];
const priorities = ["Low", "Medium", "High"];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

function jurisdiction(client: Client): string {
  const c = (client.country_of_issue || "ZA").toUpperCase().trim();
  if (c === "SOUTH AFRICA") return "ZA";
  if (c === "AUSTRALIA") return "AU";
  if (c === "CANADA") return "CA";
  if (c === "UNITED KINGDOM") return "GB";
  if (c === "UNITED STATES") return "US";
  return ["ZA", "AU", "CA", "GB", "US"].includes(c) ? c : "ZA";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Get user
    let userId: string;
    if (authHeader) {
      const userClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user } } = await userClient.auth.getUser();
      if (!user) throw new Error("Unauthorized");
      userId = user.id;
    } else {
      throw new Error("No authorization header");
    }

    const admin = createClient(supabaseUrl, serviceKey);

    // 1. Fetch all clients for this user
    const { data: clients, error: clientsErr } = await admin
      .from("clients")
      .select("id, first_name, last_name, country_of_issue")
      .eq("user_id", userId)
      .eq("is_deleted", false);

    if (clientsErr) throw clientsErr;
    if (!clients?.length) {
      return new Response(JSON.stringify({ success: true, message: "No clients found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Fetch document types for FK references
    const { data: docTypes } = await admin
      .from("document_types")
      .select("id, name, category")
      .eq("user_id", userId);

    const docTypeMap: Record<string, string[]> = {};
    (docTypes || []).forEach((dt: any) => {
      if (!docTypeMap[dt.category]) docTypeMap[dt.category] = [];
      docTypeMap[dt.category].push(dt.id);
    });

    // 3. Fetch existing products for client_products FK
    const { data: products } = await admin
      .from("products")
      .select("id, name")
      .eq("user_id", userId)
      .eq("is_deleted", false)
      .limit(50);

    const productIds = (products || []).map((p: any) => p.id);

    // 4. Delete existing seeded data (idempotent)
    await admin.from("client_notes").delete().eq("user_id", userId);
    await admin.from("documents").delete().eq("user_id", userId);
    await admin.from("project_opportunities").delete().eq("user_id", userId);
    await admin.from("opportunity_projects").delete().eq("user_id", userId);
    await admin.from("client_products").delete().eq("user_id", userId);

    // 5. Seed client_notes
    const allNotes: any[] = [];
    for (const client of clients) {
      const jur = jurisdiction(client);
      const templates = jurisdictionNotes[jur] || jurisdictionNotes.ZA;
      const count = randomInt(3, 5);
      const indices = [...Array(templates.subjects.length).keys()]
        .sort(() => Math.random() - 0.5)
        .slice(0, count);

      for (const idx of indices) {
        allNotes.push({
          user_id: userId,
          client_id: client.id,
          subject: templates.subjects[idx],
          content: templates.content[idx],
          interaction_type: randomFrom(interactionTypes),
          priority: randomFrom(priorities),
          is_complete: Math.random() > 0.3,
          is_deleted: false,
          is_visible_portal: false,
          created_at: daysAgo(randomInt(7, 180)),
        });
      }
    }

    // Batch insert notes in chunks
    for (let i = 0; i < allNotes.length; i += 500) {
      const { error } = await admin.from("client_notes").insert(allNotes.slice(i, i + 500));
      if (error) console.error("Notes insert error:", error.message);
    }

    // 6. Seed documents
    const allDocs: any[] = [];
    for (const client of clients) {
      const jur = jurisdiction(client);
      const templates = jurisdictionDocs[jur] || jurisdictionDocs.ZA;
      const count = randomInt(3, Math.min(5, templates.length));
      const selected = [...templates].sort(() => Math.random() - 0.5).slice(0, count);

      for (const doc of selected) {
        const statusRoll = Math.random();
        const status = statusRoll < 0.4 ? "Complete" : statusRoll < 0.7 ? "Pending" : "Expired";
        const catIds = docTypeMap[doc.docTypeCategory] || docTypeMap["Client"] || [];
        const docTypeId = catIds.length ? randomFrom(catIds) : null;

        allDocs.push({
          user_id: userId,
          client_id: client.id,
          name: doc.name,
          status,
          document_type_id: docTypeId,
          expiry_date: status === "Expired"
            ? daysFromNow(-randomInt(10, 90))
            : status === "Pending"
            ? daysFromNow(randomInt(30, 180))
            : null,
          is_deleted: false,
          created_at: daysAgo(randomInt(30, 365)),
        });
      }
    }

    for (let i = 0; i < allDocs.length; i += 500) {
      const { error } = await admin.from("documents").insert(allDocs.slice(i, i + 500));
      if (error) console.error("Documents insert error:", error.message);
    }

    // 7. Seed opportunity_projects (one per jurisdiction)
    const regionProjects: Record<string, string> = {};
    const regionCodes = ["ZA", "AU", "CA", "GB", "US"];

    for (const rc of regionCodes) {
      const { data: proj, error } = await admin
        .from("opportunity_projects")
        .insert({
          user_id: userId,
          name: `${rc} Growth Opportunities`,
          description: `Client growth and retention opportunities for ${rc} region`,
          project_type: "growth",
          status: "Active",
          target_revenue: 500000,
          realized_revenue: 0,
          region_code: rc,
          sla_days: 30,
        })
        .select("id")
        .single();

      if (!error && proj) regionProjects[rc] = proj.id;
    }

    // 8. Seed project_opportunities
    const allOpps: any[] = [];
    for (const client of clients) {
      const jur = jurisdiction(client);
      const projectId = regionProjects[jur];
      if (!projectId) continue;

      const count = randomInt(1, 2);
      const selected = [...opportunityTemplates]
        .sort(() => Math.random() - 0.5)
        .slice(0, count);

      for (const tpl of selected) {
        allOpps.push({
          user_id: userId,
          project_id: projectId,
          client_id: client.id,
          client_name: `${client.first_name} ${client.last_name}`,
          opportunity_type: tpl.type,
          potential_revenue: randomInt(5000, 50000),
          confidence: randomInt(40, 90),
          status: randomFrom(["Identified", "In Progress", "Qualified"]),
          suggested_action: tpl.action,
          reasoning: tpl.reasoning,
          current_value: randomInt(100000, 2000000),
        });
      }
    }

    for (let i = 0; i < allOpps.length; i += 500) {
      const { error } = await admin.from("project_opportunities").insert(allOpps.slice(i, i + 500));
      if (error) console.error("Opportunities insert error:", error.message);
    }

    // 9. Seed client_products (only if products exist)
    let productsSeeded = 0;
    if (productIds.length > 0) {
      const allProducts: any[] = [];
      for (const client of clients) {
        const count = randomInt(2, 4);
        const selected = [...productIds]
          .sort(() => Math.random() - 0.5)
          .slice(0, Math.min(count, productIds.length));

        for (const prodId of selected) {
          allProducts.push({
            user_id: userId,
            client_id: client.id,
            product_id: prodId,
            status: "Active",
            role: "Owner",
            current_value: randomInt(50000, 5000000),
            premium_amount: randomInt(500, 10000),
            frequency: randomFrom(["Monthly", "Annually", "Once-off"]),
            policy_number: `POL-${randomInt(100000, 999999)}`,
            start_date: daysFromNow(-randomInt(365, 1825)),
            is_deleted: false,
            is_linked: false,
          });
        }
      }

      for (let i = 0; i < allProducts.length; i += 500) {
        const { error } = await admin.from("client_products").insert(allProducts.slice(i, i + 500));
        if (error) console.error("Products insert error:", error.message);
      }
      productsSeeded = allProducts.length;
    }

    const result = {
      success: true,
      clients: clients.length,
      notes: allNotes.length,
      documents: allDocs.length,
      opportunities: allOpps.length,
      products: productsSeeded,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
