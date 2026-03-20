/**
 * BFF seed route — handles POST /api/seed/:name
 *
 * Inserts reference/demo data directly into the Kapable Data API.
 * All insertions are idempotent (check-before-insert).
 */
import type { ActionFunctionArgs } from "react-router";
import { requireAuth } from "@/lib/session.server";

const KAPABLE_API = process.env["KAPABLE_API_URL"] || "https://api.kapable.dev";
const DATA_KEY = process.env["KAPABLE_DATA_KEY"] || "";

const SEED_USER_ID = "00000000-0000-0000-0000-000000000001";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function kapableGet(table: string, query: string): Promise<{ data: any[] }> {
  const res = await fetch(`${KAPABLE_API}/v1/${table}?${query}`, {
    headers: { "x-api-key": DATA_KEY },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GET /v1/${table}?${query} failed (${res.status}): ${text}`);
  }
  return res.json();
}

async function kapableInsert(table: string, data: Record<string, unknown>): Promise<any> {
  const res = await fetch(`${KAPABLE_API}/v1/${table}`, {
    method: "POST",
    headers: { "x-api-key": DATA_KEY, "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`POST /v1/${table} failed (${res.status}): ${text}`);
  }
  return res.json();
}

async function insertIfNotExists(
  table: string,
  checkField: string,
  checkValue: string,
  data: Record<string, unknown>,
): Promise<{ skipped: boolean; created: boolean }> {
  const existing = await kapableGet(
    table,
    `where=${checkField}.eq.${encodeURIComponent(checkValue)}&limit=1`,
  );
  if (existing.data?.length > 0) {
    return { skipped: true, created: false };
  }
  await kapableInsert(table, data);
  return { skipped: false, created: true };
}

// ---------------------------------------------------------------------------
// Seed: admin reference data
// ---------------------------------------------------------------------------

async function seedAdminReferenceData(): Promise<Record<string, unknown>> {
  const listItems: { list_type: string; code: string; name: string; display_order: number }[] = [
    // Task types
    { list_type: "task_types", code: "CLIENT_COMPLAINT", name: "Client Complaint", display_order: 1 },
    { list_type: "task_types", code: "FOLLOW_UP", name: "Follow-up", display_order: 2 },
    { list_type: "task_types", code: "ANNUAL_REVIEW", name: "Annual Review", display_order: 3 },
    { list_type: "task_types", code: "PORTFOLIO_REVIEW", name: "Portfolio Review", display_order: 4 },
    { list_type: "task_types", code: "COMPLIANCE", name: "Compliance", display_order: 5 },
    { list_type: "task_types", code: "ONBOARDING", name: "Onboarding", display_order: 6 },
    { list_type: "task_types", code: "DOCUMENT_REQUEST", name: "Document Request", display_order: 7 },
    // Client statuses
    { list_type: "client_statuses", code: "ACTIVE", name: "Active", display_order: 1 },
    { list_type: "client_statuses", code: "INACTIVE", name: "Inactive", display_order: 2 },
    { list_type: "client_statuses", code: "DECEASED", name: "Deceased", display_order: 3 },
    // Relationship types
    { list_type: "relationship_types", code: "SPOUSE", name: "Spouse", display_order: 1 },
    { list_type: "relationship_types", code: "CHILD", name: "Child", display_order: 2 },
    { list_type: "relationship_types", code: "PARENT", name: "Parent", display_order: 3 },
    { list_type: "relationship_types", code: "SIBLING", name: "Sibling", display_order: 4 },
    { list_type: "relationship_types", code: "BUSINESS_PARTNER", name: "Business Partner", display_order: 5 },
    { list_type: "relationship_types", code: "TRUSTEE", name: "Trustee", display_order: 6 },
    { list_type: "relationship_types", code: "BENEFICIARY", name: "Beneficiary", display_order: 7 },
  ];

  let created = 0;
  let skipped = 0;

  for (const item of listItems) {
    const result = await insertIfNotExists(
      "admin_general_lists",
      "code",
      item.code,
      {
        user_id: SEED_USER_ID,
        list_type: item.list_type,
        code: item.code,
        name: item.name,
        display_order: item.display_order,
        is_active: true,
        metadata: {},
      },
    );
    if (result.created) created++;
    else skipped++;
  }

  return {
    success: true,
    message: `Seeded admin reference data: ${created} created, ${skipped} already existed`,
    counts: {
      task_types: listItems.filter((i) => i.list_type === "task_types").length,
      client_statuses: listItems.filter((i) => i.list_type === "client_statuses").length,
      relationship_types: listItems.filter((i) => i.list_type === "relationship_types").length,
    },
    created,
    skipped,
  };
}

// ---------------------------------------------------------------------------
// Seed: providers + instruments (funds)
// ---------------------------------------------------------------------------

interface ProviderSeed {
  name: string;
  code: string;
  provider_type: string;
  country: string;
  portal_url: string;
  funds: { name: string; code: string; isin: string; fund_type: string; sector: string; exchange: string }[];
}

const SA_PROVIDERS: ProviderSeed[] = [
  {
    name: "Ninety One",
    code: "NI",
    provider_type: "Asset Manager",
    country: "ZA",
    portal_url: "https://ninetyone.com",
    funds: [
      { name: "Ninety One Equity Fund", code: "NI-EQ", isin: "ZAE000201777", fund_type: "Unit Trust", sector: "Equity - General", exchange: "JSE" },
      { name: "Ninety One Balanced Fund", code: "NI-BAL", isin: "ZAE000201785", fund_type: "Unit Trust", sector: "Multi-Asset - High Equity", exchange: "JSE" },
      { name: "Ninety One Opportunity Fund", code: "NI-OPP", isin: "ZAE000201793", fund_type: "Unit Trust", sector: "Equity - General", exchange: "JSE" },
      { name: "Ninety One Value Fund", code: "NI-VAL", isin: "ZAE000201801", fund_type: "Unit Trust", sector: "Equity - Value", exchange: "JSE" },
      { name: "Ninety One Commodities Fund", code: "NI-COM", isin: "ZAE000201819", fund_type: "Unit Trust", sector: "Commodities - General", exchange: "JSE" },
    ],
  },
  {
    name: "Allan Gray",
    code: "AG",
    provider_type: "Asset Manager",
    country: "ZA",
    portal_url: "https://www.allangray.co.za",
    funds: [
      { name: "Allan Gray Equity Fund", code: "AG-EQ", isin: "ZAE000038800", fund_type: "Unit Trust", sector: "Equity - General", exchange: "JSE" },
      { name: "Allan Gray Balanced Fund", code: "AG-BAL", isin: "ZAE000038818", fund_type: "Unit Trust", sector: "Multi-Asset - High Equity", exchange: "JSE" },
      { name: "Allan Gray Stable Fund", code: "AG-STB", isin: "ZAE000038826", fund_type: "Unit Trust", sector: "Multi-Asset - Low Equity", exchange: "JSE" },
      { name: "Allan Gray Optimal Fund", code: "AG-OPT", isin: "ZAE000038834", fund_type: "Unit Trust", sector: "Equity - Market Neutral", exchange: "JSE" },
      { name: "Allan Gray Money Market Fund", code: "AG-MM", isin: "ZAE000038842", fund_type: "Unit Trust", sector: "Money Market", exchange: "JSE" },
    ],
  },
  {
    name: "Sanlam",
    code: "SLM",
    provider_type: "Insurance",
    country: "ZA",
    portal_url: "https://www.sanlam.co.za",
    funds: [
      { name: "Sanlam General Equity Fund", code: "SLM-EQ", isin: "ZAE000066676", fund_type: "Unit Trust", sector: "Equity - General", exchange: "JSE" },
      { name: "Sanlam Balanced Fund", code: "SLM-BAL", isin: "ZAE000066684", fund_type: "Unit Trust", sector: "Multi-Asset - High Equity", exchange: "JSE" },
      { name: "Sanlam Bond Fund", code: "SLM-BND", isin: "ZAE000066692", fund_type: "Unit Trust", sector: "Fixed Interest - Bond", exchange: "JSE" },
      { name: "Sanlam Property Fund", code: "SLM-PROP", isin: "ZAE000066700", fund_type: "Unit Trust", sector: "Real Estate - General", exchange: "JSE" },
      { name: "Sanlam Income Fund", code: "SLM-INC", isin: "ZAE000066718", fund_type: "Unit Trust", sector: "Multi-Asset - Income", exchange: "JSE" },
    ],
  },
  {
    name: "Old Mutual",
    code: "OM",
    provider_type: "Insurance",
    country: "ZA",
    portal_url: "https://www.oldmutual.co.za",
    funds: [
      { name: "Old Mutual Equity Fund", code: "OM-EQ", isin: "ZAE000055881", fund_type: "Unit Trust", sector: "Equity - General", exchange: "JSE" },
      { name: "Old Mutual Balanced Fund", code: "OM-BAL", isin: "ZAE000055899", fund_type: "Unit Trust", sector: "Multi-Asset - High Equity", exchange: "JSE" },
      { name: "Old Mutual Gold Fund", code: "OM-GLD", isin: "ZAE000055907", fund_type: "Unit Trust", sector: "Commodities - Precious Metals", exchange: "JSE" },
      { name: "Old Mutual Growth Fund", code: "OM-GRW", isin: "ZAE000055915", fund_type: "Unit Trust", sector: "Equity - Growth", exchange: "JSE" },
      { name: "Old Mutual Income Fund", code: "OM-INC", isin: "ZAE000055923", fund_type: "Unit Trust", sector: "Multi-Asset - Income", exchange: "JSE" },
    ],
  },
  {
    name: "Coronation",
    code: "COR",
    provider_type: "Asset Manager",
    country: "ZA",
    portal_url: "https://www.coronation.com",
    funds: [
      { name: "Coronation Top 20 Fund", code: "COR-T20", isin: "ZAE000012460", fund_type: "Unit Trust", sector: "Equity - Large Cap", exchange: "JSE" },
      { name: "Coronation Balanced Plus Fund", code: "COR-BPLUS", isin: "ZAE000012478", fund_type: "Unit Trust", sector: "Multi-Asset - High Equity", exchange: "JSE" },
      { name: "Coronation Capital Plus Fund", code: "COR-CPLUS", isin: "ZAE000012486", fund_type: "Unit Trust", sector: "Multi-Asset - Medium Equity", exchange: "JSE" },
      { name: "Coronation Strategic Income Fund", code: "COR-SI", isin: "ZAE000012494", fund_type: "Unit Trust", sector: "Multi-Asset - Income", exchange: "JSE" },
      { name: "Coronation Money Market Fund", code: "COR-MM", isin: "ZAE000012502", fund_type: "Unit Trust", sector: "Money Market", exchange: "JSE" },
    ],
  },
];

async function seedProvidersAndFunds(): Promise<Record<string, unknown>> {
  let providersCreated = 0;
  let providersSkipped = 0;
  let fundsCreated = 0;
  let fundsSkipped = 0;

  for (const provider of SA_PROVIDERS) {
    // Insert provider
    const providerResult = await insertIfNotExists(
      "product_providers",
      "code",
      provider.code,
      {
        user_id: SEED_USER_ID,
        name: provider.name,
        code: provider.code,
        provider_type: provider.provider_type,
        country: provider.country,
        portal_url: provider.portal_url,
        is_active: true,
        is_deleted: false,
      },
    );
    if (providerResult.created) providersCreated++;
    else providersSkipped++;

    // Insert funds into admin_funds
    for (const fund of provider.funds) {
      const fundResult = await insertIfNotExists(
        "admin_funds",
        "code",
        fund.code,
        {
          user_id: SEED_USER_ID,
          name: fund.name,
          code: fund.code,
          isin: fund.isin,
          fund_manager: provider.name,
          fund_type: fund.fund_type,
          sector: fund.sector,
          exchange: fund.exchange,
          domicile: "ZA",
          is_active: true,
          source: "seed",
        },
      );
      if (fundResult.created) fundsCreated++;
      else fundsSkipped++;
    }
  }

  return {
    success: true,
    message: `Seeded ${providersCreated} providers and ${fundsCreated} funds (${providersSkipped + fundsSkipped} already existed)`,
    providersCreated,
    providersSkipped,
    fundsCreated,
    fundsSkipped,
  };
}

// ---------------------------------------------------------------------------
// Seed: TLH clients
// ---------------------------------------------------------------------------

async function seedTLHClients(): Promise<Record<string, unknown>> {
  const opportunities = [
    {
      client_name: "Johan van der Merwe",
      jurisdiction: "ZA",
      current_fund_name: "Satrix 40 ETF",
      current_ticker: "STX40",
      suggested_replacement_name: "Sygnia Itrix Top 40 ETF",
      purchase_value: 520000,
      current_value: 445000,
      cost_basis: 520000,
      unrealized_gain_loss: -75000,
      estimated_tax_savings: 33750,
      holding_period: "short_term",
      wash_sale_ok: true,
      status: "new",
      is_deleted: false,
    },
    {
      client_name: "Pieter Botha",
      jurisdiction: "ZA",
      current_fund_name: "Ninety One Equity Fund",
      current_ticker: "NI-EQ",
      suggested_replacement_name: "Allan Gray Equity Fund",
      purchase_value: 380000,
      current_value: 332000,
      cost_basis: 380000,
      unrealized_gain_loss: -48000,
      estimated_tax_savings: 21600,
      holding_period: "long_term",
      wash_sale_ok: true,
      status: "new",
      is_deleted: false,
    },
    {
      client_name: "Zanele Dlamini",
      jurisdiction: "ZA",
      current_fund_name: "Old Mutual Gold Fund",
      current_ticker: "OM-GLD",
      suggested_replacement_name: "Absa NewGold ETF",
      purchase_value: 290000,
      current_value: 248000,
      cost_basis: 290000,
      unrealized_gain_loss: -42000,
      estimated_tax_savings: 18900,
      holding_period: "short_term",
      wash_sale_ok: true,
      status: "new",
      is_deleted: false,
    },
    {
      client_name: "Thabo Molefe",
      jurisdiction: "ZA",
      current_fund_name: "Coronation Top 20 Fund",
      current_ticker: "COR-T20",
      suggested_replacement_name: "Sanlam General Equity Fund",
      purchase_value: 650000,
      current_value: 580000,
      cost_basis: 650000,
      unrealized_gain_loss: -70000,
      estimated_tax_savings: 31500,
      holding_period: "long_term",
      wash_sale_ok: true,
      status: "new",
      is_deleted: false,
    },
  ];

  let created = 0;
  let skipped = 0;

  for (const opp of opportunities) {
    const result = await insertIfNotExists(
      "tlh_opportunities",
      "client_name",
      opp.client_name,
      {
        user_id: SEED_USER_ID,
        ...opp,
      },
    );
    if (result.created) created++;
    else skipped++;
  }

  return {
    success: true,
    message: `Seeded ${created} TLH opportunities (${skipped} already existed)`,
    created,
    skipped,
  };
}

// ---------------------------------------------------------------------------
// Seed dispatcher
// ---------------------------------------------------------------------------

const SEED_HANDLERS: Record<string, () => Promise<Record<string, unknown>>> = {
  "seed-admin-reference-data": seedAdminReferenceData,
  "seed-instruments-data": seedProvidersAndFunds,
  "seed-providers-data": seedProvidersAndFunds,
  "seed-tlh-clients": seedTLHClients,
};

export async function action({ request, params }: ActionFunctionArgs) {
  await requireAuth(request);

  const name = params.name;
  if (!name) {
    return Response.json({ success: false, error: "Missing seed name" }, { status: 400 });
  }

  const handler = SEED_HANDLERS[name];
  if (!handler) {
    return Response.json({
      success: true,
      message: `Seed function "${name}" not yet implemented`,
    });
  }

  try {
    const result = await handler();
    return Response.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`Seed "${name}" failed:`, error);
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
