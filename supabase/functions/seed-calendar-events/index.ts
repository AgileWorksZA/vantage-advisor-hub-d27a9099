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
