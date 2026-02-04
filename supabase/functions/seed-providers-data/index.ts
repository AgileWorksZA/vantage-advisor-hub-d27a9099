import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface Provider {
  code: string;
  name: string;
  provider_type: string;
  country: string;
  contact_email?: string;
  contact_phone?: string;
  portal_url?: string;
  services: string[];
  is_umbrella_provider?: boolean;
}

const southAfricaProviders: Provider[] = [
  { code: "ABSA", name: "ABSA Life", provider_type: "Insurance", country: "ZA", services: ["Life and Risk", "Investments"] },
  { code: "SNLM", name: "Sanlam", provider_type: "Insurance", country: "ZA", services: ["Life and Risk", "Investments", "Fiduciary Services"], is_umbrella_provider: true },
  { code: "OLMU", name: "Old Mutual", provider_type: "Insurance", country: "ZA", services: ["Life and Risk", "Investments", "Fiduciary Services"], is_umbrella_provider: true },
  { code: "DSCV", name: "Discovery", provider_type: "Insurance", country: "ZA", services: ["Life and Risk", "Medical", "Investments"] },
  { code: "ALXF", name: "Alexander Forbes", provider_type: "Insurance", country: "ZA", services: ["Life and Risk", "Investments", "Fiduciary Services"] },
  { code: "LIBT", name: "Liberty", provider_type: "Insurance", country: "ZA", services: ["Life and Risk", "Investments"] },
  { code: "MOMN", name: "Momentum Metropolitan", provider_type: "Insurance", country: "ZA", services: ["Life and Risk", "Investments", "Medical"] },
  { code: "PSGW", name: "PSG Wealth", provider_type: "Investment", country: "ZA", services: ["Investments", "Stockbroking"] },
  { code: "NINP", name: "Ninety One", provider_type: "Asset Management", country: "ZA", services: ["Investments"] },
  { code: "CORO", name: "Coronation", provider_type: "Asset Management", country: "ZA", services: ["Investments"] },
  { code: "ALLP", name: "Allan Gray", provider_type: "Asset Management", country: "ZA", services: ["Investments"] },
  { code: "INVS", name: "Investec", provider_type: "Banking/Investment", country: "ZA", services: ["Investments", "Stockbroking"] },
  { code: "STDL", name: "Standard Bank Life", provider_type: "Insurance", country: "ZA", services: ["Life and Risk", "Investments"] },
  { code: "FNBL", name: "FNB Life", provider_type: "Insurance", country: "ZA", services: ["Life and Risk"] },
  { code: "CAPL", name: "Capitec", provider_type: "Banking", country: "ZA", services: ["Life and Risk"] },
  { code: "AFLI", name: "African Life", provider_type: "Insurance", country: "ZA", services: ["Life and Risk"] },
  { code: "ASST", name: "Assupol", provider_type: "Insurance", country: "ZA", services: ["Life and Risk"] },
  { code: "BRTY", name: "Brightrock", provider_type: "Insurance", country: "ZA", services: ["Life and Risk"] },
  { code: "HOLL", name: "Hollard", provider_type: "Insurance", country: "ZA", services: ["Life and Risk", "Short Term Insurance (Commercial)", "Short Term Insurance (Personal)"] },
  { code: "OUDS", name: "Outsurance", provider_type: "Insurance", country: "ZA", services: ["Short Term Insurance (Commercial)", "Short Term Insurance (Personal)", "Life and Risk"] },
];

const unitedStatesProviders: Provider[] = [
  { code: "MLFN", name: "MetLife", provider_type: "Insurance", country: "US", services: ["Life and Risk", "Investments"] },
  { code: "PRUD", name: "Prudential Financial", provider_type: "Insurance", country: "US", services: ["Life and Risk", "Investments"] },
  { code: "NWMU", name: "Northwestern Mutual", provider_type: "Insurance", country: "US", services: ["Life and Risk", "Investments"] },
  { code: "NYFL", name: "New York Life", provider_type: "Insurance", country: "US", services: ["Life and Risk", "Investments"] },
  { code: "LINF", name: "Lincoln Financial", provider_type: "Insurance", country: "US", services: ["Life and Risk", "Investments"] },
  { code: "PRNA", name: "Principal Financial", provider_type: "Insurance", country: "US", services: ["Life and Risk", "Investments"] },
  { code: "AFLC", name: "Aflac", provider_type: "Insurance", country: "US", services: ["Life and Risk"] },
  { code: "VANG", name: "Vanguard", provider_type: "Asset Management", country: "US", services: ["Investments"] },
  { code: "BLCK", name: "BlackRock", provider_type: "Asset Management", country: "US", services: ["Investments"] },
  { code: "FIDL", name: "Fidelity", provider_type: "Asset Management", country: "US", services: ["Investments", "Stockbroking"] },
  { code: "SCHW", name: "Charles Schwab", provider_type: "Brokerage", country: "US", services: ["Investments", "Stockbroking"] },
  { code: "EDWJ", name: "Edward Jones", provider_type: "Brokerage", country: "US", services: ["Investments"] },
  { code: "MORN", name: "Morgan Stanley", provider_type: "Banking/Investment", country: "US", services: ["Investments", "Stockbroking"] },
  { code: "JPMW", name: "JPMorgan Wealth", provider_type: "Banking/Investment", country: "US", services: ["Investments"] },
  { code: "GSAM", name: "Goldman Sachs AM", provider_type: "Asset Management", country: "US", services: ["Investments"] },
  { code: "AMFA", name: "Ameriprise Financial", provider_type: "Insurance", country: "US", services: ["Life and Risk", "Investments"] },
  { code: "TRPR", name: "Transamerica", provider_type: "Insurance", country: "US", services: ["Life and Risk", "Investments"] },
  { code: "MAFC", name: "Massachusetts Mutual", provider_type: "Insurance", country: "US", services: ["Life and Risk", "Investments"] },
  { code: "UNUM", name: "Unum Group", provider_type: "Insurance", country: "US", services: ["Life and Risk"] },
  { code: "ALLZ", name: "Allianz US", provider_type: "Insurance", country: "US", services: ["Life and Risk", "Investments"] },
];

const unitedKingdomProviders: Provider[] = [
  { code: "AVVA", name: "Aviva", provider_type: "Insurance", country: "UK", services: ["Life and Risk", "Investments"] },
  { code: "LGLG", name: "Legal & General", provider_type: "Insurance", country: "UK", services: ["Life and Risk", "Investments"] },
  { code: "PHNX", name: "Phoenix Group", provider_type: "Insurance", country: "UK", services: ["Life and Risk", "Investments"] },
  { code: "STJS", name: "St. James's Place", provider_type: "Investment", country: "UK", services: ["Investments"] },
  { code: "STLI", name: "Standard Life", provider_type: "Insurance", country: "UK", services: ["Life and Risk", "Investments"] },
  { code: "ROYL", name: "Royal London", provider_type: "Insurance", country: "UK", services: ["Life and Risk", "Investments"] },
  { code: "SLII", name: "Scottish Widows", provider_type: "Insurance", country: "UK", services: ["Life and Risk", "Investments"] },
  { code: "AEGN", name: "Aegon UK", provider_type: "Insurance", country: "UK", services: ["Life and Risk", "Investments"] },
  { code: "ZURC", name: "Zurich UK", provider_type: "Insurance", country: "UK", services: ["Life and Risk", "Investments"] },
  { code: "BAIF", name: "Baillie Gifford", provider_type: "Asset Management", country: "UK", services: ["Investments"] },
  { code: "ABRD", name: "Abrdn", provider_type: "Asset Management", country: "UK", services: ["Investments"] },
  { code: "LGIM", name: "L&G Investment", provider_type: "Asset Management", country: "UK", services: ["Investments"] },
  { code: "SCHR", name: "Schroders", provider_type: "Asset Management", country: "UK", services: ["Investments"] },
  { code: "JPHM", name: "Jupiter", provider_type: "Asset Management", country: "UK", services: ["Investments"] },
  { code: "MGIV", name: "M&G Investments", provider_type: "Asset Management", country: "UK", services: ["Investments"] },
  { code: "HRGS", name: "Hargreaves Lansdown", provider_type: "Brokerage", country: "UK", services: ["Investments", "Stockbroking"] },
  { code: "AJBL", name: "AJ Bell", provider_type: "Brokerage", country: "UK", services: ["Investments", "Stockbroking"] },
  { code: "INIV", name: "Interactive Investor", provider_type: "Brokerage", country: "UK", services: ["Investments", "Stockbroking"] },
  { code: "VRIT", name: "Vitality", provider_type: "Insurance", country: "UK", services: ["Life and Risk", "Medical"] },
  { code: "PRTC", name: "Prudential UK", provider_type: "Insurance", country: "UK", services: ["Life and Risk", "Investments"] },
];

const australiaProviders: Provider[] = [
  { code: "CMMW", name: "Commonwealth Bank Wealth", provider_type: "Banking/Investment", country: "AU", services: ["Investments"] },
  { code: "AMPW", name: "AMP", provider_type: "Insurance", country: "AU", services: ["Life and Risk", "Investments"] },
  { code: "MQGW", name: "Macquarie Group", provider_type: "Banking/Investment", country: "AU", services: ["Investments", "Stockbroking"] },
  { code: "SUNC", name: "Suncorp", provider_type: "Insurance", country: "AU", services: ["Life and Risk", "Short Term Insurance (Personal)"] },
  { code: "IAGN", name: "IAG", provider_type: "Insurance", country: "AU", services: ["Short Term Insurance (Commercial)", "Short Term Insurance (Personal)"] },
  { code: "QBEI", name: "QBE Insurance", provider_type: "Insurance", country: "AU", services: ["Short Term Insurance (Commercial)", "Short Term Insurance (Personal)"] },
  { code: "MLCW", name: "MLC Wealth", provider_type: "Insurance", country: "AU", services: ["Life and Risk", "Investments"] },
  { code: "COLO", name: "Colonial First State", provider_type: "Asset Management", country: "AU", services: ["Investments"] },
  { code: "BTFG", name: "BT Financial", provider_type: "Investment", country: "AU", services: ["Investments"] },
  { code: "WSTW", name: "Westpac Wealth", provider_type: "Banking/Investment", country: "AU", services: ["Investments"] },
  { code: "ANZW", name: "ANZ Wealth", provider_type: "Banking/Investment", country: "AU", services: ["Investments"] },
  { code: "NATW", name: "NAB Wealth", provider_type: "Banking/Investment", country: "AU", services: ["Investments"] },
  { code: "MFGE", name: "Magellan Financial", provider_type: "Asset Management", country: "AU", services: ["Investments"] },
  { code: "PPTL", name: "Perpetual", provider_type: "Asset Management", country: "AU", services: ["Investments", "Fiduciary Services"] },
  { code: "CHLL", name: "Challenger", provider_type: "Insurance", country: "AU", services: ["Life and Risk", "Investments"] },
  { code: "RESM", name: "Resolution Life", provider_type: "Insurance", country: "AU", services: ["Life and Risk"] },
  { code: "ZUAU", name: "Zurich Australia", provider_type: "Insurance", country: "AU", services: ["Life and Risk"] },
  { code: "TALN", name: "TAL", provider_type: "Insurance", country: "AU", services: ["Life and Risk"] },
  { code: "ONEP", name: "OnePath", provider_type: "Insurance", country: "AU", services: ["Life and Risk", "Investments"] },
  { code: "AFFA", name: "AustralianSuper", provider_type: "Superannuation", country: "AU", services: ["Investments"] },
];

const canadaProviders: Provider[] = [
  { code: "MNLF", name: "Manulife", provider_type: "Insurance", country: "CA", services: ["Life and Risk", "Investments"] },
  { code: "SUNL", name: "Sun Life", provider_type: "Insurance", country: "CA", services: ["Life and Risk", "Investments"] },
  { code: "GTWL", name: "Great-West Lifeco", provider_type: "Insurance", country: "CA", services: ["Life and Risk", "Investments"] },
  { code: "CNLF", name: "Canada Life", provider_type: "Insurance", country: "CA", services: ["Life and Risk", "Investments"] },
  { code: "DSJD", name: "Desjardins", provider_type: "Insurance", country: "CA", services: ["Life and Risk", "Investments", "Short Term Insurance (Personal)"] },
  { code: "INDL", name: "Industrial Alliance", provider_type: "Insurance", country: "CA", services: ["Life and Risk", "Investments"] },
  { code: "BMOW", name: "BMO Wealth", provider_type: "Banking/Investment", country: "CA", services: ["Investments"] },
  { code: "RBCW", name: "RBC Wealth", provider_type: "Banking/Investment", country: "CA", services: ["Investments"] },
  { code: "TDWM", name: "TD Wealth", provider_type: "Banking/Investment", country: "CA", services: ["Investments"] },
  { code: "CISW", name: "CIBC Wealth", provider_type: "Banking/Investment", country: "CA", services: ["Investments"] },
  { code: "SCOW", name: "Scotiabank Wealth", provider_type: "Banking/Investment", country: "CA", services: ["Investments"] },
  { code: "POWC", name: "Power Corporation", provider_type: "Investment", country: "CA", services: ["Investments"] },
  { code: "AGFM", name: "AGF Management", provider_type: "Asset Management", country: "CA", services: ["Investments"] },
  { code: "CIXW", name: "CI Financial", provider_type: "Asset Management", country: "CA", services: ["Investments"] },
  { code: "IGMF", name: "IGM Financial", provider_type: "Asset Management", country: "CA", services: ["Investments"] },
  { code: "FIRL", name: "Fairfax Financial", provider_type: "Insurance", country: "CA", services: ["Short Term Insurance (Commercial)"] },
  { code: "INTC", name: "Intact Financial", provider_type: "Insurance", country: "CA", services: ["Short Term Insurance (Commercial)", "Short Term Insurance (Personal)"] },
  { code: "EQTB", name: "Equitable Bank", provider_type: "Banking", country: "CA", services: ["Investments"] },
  { code: "BNCI", name: "Beneva", provider_type: "Insurance", country: "CA", services: ["Life and Risk", "Short Term Insurance (Personal)"] },
  { code: "WAWF", name: "Wawanesa", provider_type: "Insurance", country: "CA", services: ["Short Term Insurance (Personal)", "Life and Risk"] },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;

    const allProviders = [
      ...southAfricaProviders,
      ...unitedStatesProviders,
      ...unitedKingdomProviders,
      ...australiaProviders,
      ...canadaProviders,
    ];

    const providersToInsert = allProviders.map((p) => ({
      user_id: userId,
      code: p.code,
      name: p.name,
      provider_type: p.provider_type,
      country: p.country,
      contact_email: p.contact_email || null,
      contact_phone: p.contact_phone || null,
      portal_url: p.portal_url || null,
      services: p.services,
      is_umbrella_provider: p.is_umbrella_provider || false,
      is_active: true,
      is_approved: true,
    }));

    const { data, error } = await supabase
      .from("product_providers")
      .upsert(providersToInsert, {
        onConflict: "user_id,code",
        ignoreDuplicates: false,
      })
      .select();

    if (error) {
      console.error("Error seeding providers:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully seeded ${data?.length || 0} providers`,
        count: data?.length || 0,
        breakdown: {
          southAfrica: southAfricaProviders.length,
          unitedStates: unitedStatesProviders.length,
          unitedKingdom: unitedKingdomProviders.length,
          australia: australiaProviders.length,
          canada: canadaProviders.length,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
