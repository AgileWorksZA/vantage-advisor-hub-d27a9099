import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const jurisdictionClients: Record<string, { first_name: string; surname: string; cell_number: string }[]> = {
  "South Africa": [
    { first_name: "Thabo", surname: "Mokoena", cell_number: "+27821234567" },
    { first_name: "Naledi", surname: "Dlamini", cell_number: "+27832345678" },
    { first_name: "Pieter", surname: "van der Merwe", cell_number: "+27843456789" },
    { first_name: "Ayanda", surname: "Nkosi", cell_number: "+27854567890" },
  ],
  "Australia": [
    { first_name: "James", surname: "Mitchell", cell_number: "+61412345678" },
    { first_name: "Sophie", surname: "Chen", cell_number: "+61423456789" },
    { first_name: "Liam", surname: "O'Brien", cell_number: "+61434567890" },
  ],
  "Canada": [
    { first_name: "Sarah", surname: "Thompson", cell_number: "+14165551234" },
    { first_name: "Raj", surname: "Patel", cell_number: "+16045552345" },
    { first_name: "Marie", surname: "Tremblay", cell_number: "+15145553456" },
  ],
  "United Kingdom": [
    { first_name: "Oliver", surname: "Wright", cell_number: "+447911123456" },
    { first_name: "Emma", surname: "Taylor", cell_number: "+447922234567" },
    { first_name: "William", surname: "Hughes", cell_number: "+447933345678" },
  ],
  "United States": [
    { first_name: "Michael", surname: "Johnson", cell_number: "+12125551234" },
    { first_name: "Emily", surname: "Davis", cell_number: "+13105552345" },
    { first_name: "Carlos", surname: "Rodriguez", cell_number: "+17135553456" },
  ],
};

const messageTemplates = [
  // Text messages
  { content: "Hi, I wanted to discuss my portfolio allocation for next quarter.", type: "text" },
  { content: "Thank you for the update on my investment performance.", type: "text" },
  { content: "Could we schedule a meeting to review my financial plan?", type: "text" },
  { content: "I've received the documents, everything looks good.", type: "text" },
  { content: "What are your thoughts on the current market conditions?", type: "text" },
  { content: "I'd like to increase my monthly contribution starting next month.", type: "text" },
  { content: "Thanks for the birthday wishes! Looking forward to our next review.", type: "text" },
  { content: "Can you send me the latest statement for my retirement fund?", type: "text" },
  { content: "I have a question about the tax implications of the switch.", type: "text" },
  { content: "Great news about the fund performance this quarter!", type: "text" },
  { content: "Please go ahead with the recommended changes.", type: "text" },
  { content: "I'll review the proposal and get back to you by Friday.", type: "text" },
];

const outboundTemplates = [
  { content: "Good morning! Just following up on our discussion about your investment strategy.", type: "text" },
  { content: "I've prepared the quarterly report for your review. Let me know if you have any questions.", type: "text" },
  { content: "Your portfolio has shown strong growth this month. Here's a quick summary.", type: "text" },
  { content: "Reminder: Our annual review meeting is scheduled for next week.", type: "text" },
  { content: "I've processed the changes you requested. You should see them reflected shortly.", type: "text" },
  { content: "Happy to help! I'll send the documents over by end of day.", type: "text" },
];

const pollTemplates = [
  {
    content: "Quick poll: When would you prefer our next review meeting?",
    poll_data: { question: "When would you prefer our next review meeting?", options: [{ text: "Monday morning", votes: 0 }, { text: "Wednesday afternoon", votes: 0 }, { text: "Friday morning", votes: 0 }], total_votes: 0, is_closed: false },
  },
  {
    content: "Poll: Which investment topic interests you most?",
    poll_data: { question: "Which investment topic interests you most?", options: [{ text: "Retirement planning", votes: 2 }, { text: "Tax optimization", votes: 1 }, { text: "Estate planning", votes: 0 }], total_votes: 3, is_closed: false },
  },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the caller
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await anonClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get ALL users
    const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();
    if (usersError) throw usersError;
    const userIds = usersData.users.map((u) => u.id);

    if (userIds.length === 0) {
      return new Response(JSON.stringify({ message: "No users found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let totalInserted = 0;

    for (const userId of userIds) {
      // For each user, seed conversations for ALL jurisdictions
      for (const [country, clients] of Object.entries(jurisdictionClients)) {
        for (const client of clients) {
          // Upsert client for this user
          const { data: existingClients } = await supabase
            .from("clients")
            .select("id")
            .eq("user_id", userId)
            .eq("first_name", client.first_name)
            .eq("surname", client.surname)
            .eq("country_of_issue", country)
            .limit(1);

          let clientId: string;

          if (existingClients && existingClients.length > 0) {
            clientId = existingClients[0].id;
          } else {
            const { data: newClient, error: clientError } = await supabase
              .from("clients")
              .insert({
                user_id: userId,
                first_name: client.first_name,
                surname: client.surname,
                cell_number: client.cell_number,
                country_of_issue: country,
                client_type: "Individual",
                profile_type: "Client",
                profile_state: "Active",
              })
              .select("id")
              .single();

            if (clientError) {
              console.error(`Error creating client ${client.first_name} ${client.surname}:`, clientError);
              continue;
            }
            clientId = newClient.id;
          }

          // Check if messages already exist for this user+client+whatsapp
          const { data: existingMsgs } = await supabase
            .from("direct_messages")
            .select("id")
            .eq("user_id", userId)
            .eq("client_id", clientId)
            .eq("channel", "whatsapp")
            .limit(1);

          if (existingMsgs && existingMsgs.length > 0) continue;

          // Generate 5-10 messages per conversation
          const msgCount = 5 + Math.floor(Math.random() * 6);
          const messages: any[] = [];
          const now = Date.now();

          for (let i = 0; i < msgCount; i++) {
            const isOutbound = Math.random() > 0.5;
            const templates = isOutbound ? outboundTemplates : messageTemplates;
            const template = templates[Math.floor(Math.random() * templates.length)];
            const sentAt = new Date(now - (msgCount - i) * 3600000 * (1 + Math.random() * 4)).toISOString();

            messages.push({
              user_id: userId,
              client_id: clientId,
              channel: "whatsapp",
              direction: isOutbound ? "outbound" : "inbound",
              content: template.content,
              message_type: template.type || "text",
              status: isOutbound ? "delivered" : (Math.random() > 0.3 ? "read" : "delivered"),
              sent_at: sentAt,
            });
          }

          // Add a poll for some conversations
          if (Math.random() > 0.6) {
            const poll = pollTemplates[Math.floor(Math.random() * pollTemplates.length)];
            messages.push({
              user_id: userId,
              client_id: clientId,
              channel: "whatsapp",
              direction: "outbound",
              content: poll.content,
              message_type: "poll",
              poll_data: poll.poll_data,
              status: "delivered",
              sent_at: new Date(now - 1800000).toISOString(),
            });
          }

          const { error: insertError } = await supabase.from("direct_messages").insert(messages);
          if (insertError) {
            console.error(`Error inserting messages for ${client.first_name}:`, insertError);
          } else {
            totalInserted += messages.length;
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, total_messages_inserted: totalInserted, users_seeded: userIds.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Seed error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
