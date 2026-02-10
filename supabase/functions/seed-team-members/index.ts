import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TeamMemberSeed {
  name: string;
  email: string;
  role: string;
  is_primary_adviser: boolean;
  team_name: string;
  jurisdiction: string;
}

const teamData: Record<string, Array<{ teamName: string; members: Array<{ name: string; role: string; isPrimary: boolean }> }>> = {
  ZA: [
    {
      teamName: "Jordaan Financial Planning",
      members: [
        { name: "Johan Botha", role: "Financial Adviser", isPrimary: true },
        { name: "Anele Mkhize", role: "Paraplanner", isPrimary: false },
        { name: "Zanele Dlamini", role: "Administrator", isPrimary: false },
      ],
    },
    {
      teamName: "Mostert Advisory",
      members: [
        { name: "Sarah Mostert", role: "Financial Adviser", isPrimary: true },
        { name: "Thabo Mokoena", role: "Assistant", isPrimary: false },
        { name: "Lerato Nkosi", role: "Paraplanner", isPrimary: false },
      ],
    },
    {
      teamName: "Van der Merwe Wealth",
      members: [
        { name: "Pieter van der Merwe", role: "Financial Adviser", isPrimary: true },
        { name: "Nomsa Khumalo", role: "Administrator", isPrimary: false },
        { name: "Ruan Erasmus", role: "Paraplanner", isPrimary: false },
      ],
    },
    {
      teamName: "Naidoo Financial Services",
      members: [
        { name: "Priya Naidoo", role: "Financial Adviser", isPrimary: true },
        { name: "Sipho Ndlovu", role: "Assistant", isPrimary: false },
      ],
    },
    {
      teamName: "Pretorius Practice",
      members: [
        { name: "Hendrik Pretorius", role: "Financial Adviser", isPrimary: true },
        { name: "Fatima Aboobaker", role: "Paraplanner", isPrimary: false },
        { name: "Kagiso Molefe", role: "Administrator", isPrimary: false },
      ],
    },
  ],
  AU: [
    {
      teamName: "Mitchell Financial Group",
      members: [
        { name: "James Mitchell", role: "Financial Adviser", isPrimary: true },
        { name: "Sophie Chen", role: "Paraplanner", isPrimary: false },
        { name: "Olivia Hayes", role: "Administrator", isPrimary: false },
      ],
    },
    {
      teamName: "Thompson Wealth Advisory",
      members: [
        { name: "Emma Thompson", role: "Financial Adviser", isPrimary: true },
        { name: "Liam Nguyen", role: "Assistant", isPrimary: false },
        { name: "Chloe Wang", role: "Paraplanner", isPrimary: false },
      ],
    },
    {
      teamName: "O'Brien & Associates",
      members: [
        { name: "Michael O'Brien", role: "Financial Adviser", isPrimary: true },
        { name: "Priya Sharma", role: "Administrator", isPrimary: false },
      ],
    },
    {
      teamName: "Clarke Financial Planning",
      members: [
        { name: "Sarah Clarke", role: "Financial Adviser", isPrimary: true },
        { name: "Daniel Kim", role: "Paraplanner", isPrimary: false },
        { name: "Jessica Patel", role: "Assistant", isPrimary: false },
      ],
    },
    {
      teamName: "Williams Advisory",
      members: [
        { name: "David Williams", role: "Financial Adviser", isPrimary: true },
        { name: "Mia Anderson", role: "Paraplanner", isPrimary: false },
      ],
    },
  ],
  CA: [
    {
      teamName: "Tremblay Wealth Management",
      members: [
        { name: "Marc Tremblay", role: "Financial Adviser", isPrimary: true },
        { name: "Anika Singh", role: "Paraplanner", isPrimary: false },
        { name: "Chantal Dubois", role: "Administrator", isPrimary: false },
      ],
    },
    {
      teamName: "Campbell Financial",
      members: [
        { name: "Laura Campbell", role: "Financial Adviser", isPrimary: true },
        { name: "Wei Zhang", role: "Assistant", isPrimary: false },
        { name: "Nadia Petrova", role: "Paraplanner", isPrimary: false },
      ],
    },
    {
      teamName: "Roy & Partners",
      members: [
        { name: "Philippe Roy", role: "Financial Adviser", isPrimary: true },
        { name: "Jennifer Lee", role: "Administrator", isPrimary: false },
      ],
    },
    {
      teamName: "MacLeod Advisory Group",
      members: [
        { name: "Duncan MacLeod", role: "Financial Adviser", isPrimary: true },
        { name: "Harpreet Kaur", role: "Paraplanner", isPrimary: false },
        { name: "Émilie Gagnon", role: "Assistant", isPrimary: false },
      ],
    },
    {
      teamName: "Chen Financial Services",
      members: [
        { name: "Michael Chen", role: "Financial Adviser", isPrimary: true },
        { name: "Samantha Brown", role: "Paraplanner", isPrimary: false },
      ],
    },
  ],
  GB: [
    {
      teamName: "Harrison Wealth Partners",
      members: [
        { name: "Oliver Harrison", role: "Financial Adviser", isPrimary: true },
        { name: "Amara Okafor", role: "Paraplanner", isPrimary: false },
        { name: "Charlotte Webb", role: "Administrator", isPrimary: false },
      ],
    },
    {
      teamName: "Taylor Financial Planning",
      members: [
        { name: "Emily Taylor", role: "Financial Adviser", isPrimary: true },
        { name: "Raj Patel", role: "Assistant", isPrimary: false },
        { name: "Lucy Morgan", role: "Paraplanner", isPrimary: false },
      ],
    },
    {
      teamName: "Blackwood Advisory",
      members: [
        { name: "Thomas Blackwood", role: "Financial Adviser", isPrimary: true },
        { name: "Fatima Khan", role: "Administrator", isPrimary: false },
      ],
    },
    {
      teamName: "Stewart Wealth Management",
      members: [
        { name: "Fiona Stewart", role: "Financial Adviser", isPrimary: true },
        { name: "George Abbott", role: "Paraplanner", isPrimary: false },
        { name: "Zara Hussain", role: "Assistant", isPrimary: false },
      ],
    },
    {
      teamName: "Davies & Co",
      members: [
        { name: "Rhys Davies", role: "Financial Adviser", isPrimary: true },
        { name: "Hannah Brooks", role: "Paraplanner", isPrimary: false },
      ],
    },
  ],
  US: [
    {
      teamName: "Johnson Wealth Advisors",
      members: [
        { name: "Robert Johnson", role: "Financial Adviser", isPrimary: true },
        { name: "Maria Garcia", role: "Paraplanner", isPrimary: false },
        { name: "Ashley Williams", role: "Administrator", isPrimary: false },
      ],
    },
    {
      teamName: "Martinez Financial Group",
      members: [
        { name: "Isabella Martinez", role: "Financial Adviser", isPrimary: true },
        { name: "Kevin Nguyen", role: "Assistant", isPrimary: false },
        { name: "Rachel Kim", role: "Paraplanner", isPrimary: false },
      ],
    },
    {
      teamName: "Anderson Advisory",
      members: [
        { name: "Brian Anderson", role: "Financial Adviser", isPrimary: true },
        { name: "Priya Desai", role: "Administrator", isPrimary: false },
      ],
    },
    {
      teamName: "Wilson Planning Group",
      members: [
        { name: "Catherine Wilson", role: "Financial Adviser", isPrimary: true },
        { name: "Marcus Brown", role: "Paraplanner", isPrimary: false },
        { name: "Tiffany Chang", role: "Assistant", isPrimary: false },
      ],
    },
    {
      teamName: "Rodriguez & Associates",
      members: [
        { name: "Carlos Rodriguez", role: "Financial Adviser", isPrimary: true },
        { name: "Sarah O'Connor", role: "Paraplanner", isPrimary: false },
      ],
    },
  ],
};

function generateEmail(name: string): string {
  return name.toLowerCase().replace(/[^a-z ]/g, "").replace(/\s+/g, ".") + "@vantage.co";
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

    // Use service role to bypass RLS for seeding
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the calling user
    const supabaseAuth = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub;

    // Delete existing team members for this user (idempotent)
    const { error: deleteError } = await supabase
      .from("team_members")
      .delete()
      .eq("user_id", userId);

    if (deleteError) {
      console.error("Delete error:", deleteError);
    }

    // Build all team members
    const allMembers: any[] = [];
    for (const [jurisdiction, teams] of Object.entries(teamData)) {
      for (const team of teams) {
        for (const member of team.members) {
          allMembers.push({
            user_id: userId,
            name: member.name,
            email: generateEmail(member.name),
            role: member.role,
            is_primary_adviser: member.isPrimary,
            is_active: true,
            team_name: team.teamName,
            jurisdiction,
          });
        }
      }
    }

    // Insert in batches
    const BATCH_SIZE = 50;
    let totalInserted = 0;
    for (let i = 0; i < allMembers.length; i += BATCH_SIZE) {
      const batch = allMembers.slice(i, i + BATCH_SIZE);
      const { error: insertError } = await supabase
        .from("team_members")
        .insert(batch);

      if (insertError) {
        throw new Error(`Insert error: ${insertError.message}`);
      }
      totalInserted += batch.length;
    }

    const summary = {
      total_members: totalInserted,
      by_jurisdiction: Object.fromEntries(
        Object.entries(teamData).map(([j, teams]) => [
          j,
          { teams: teams.length, members: teams.reduce((s, t) => s + t.members.length, 0) },
        ])
      ),
    };

    return new Response(JSON.stringify({ success: true, summary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error seeding team members:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
