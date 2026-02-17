import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
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
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

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

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const email = "nico@advizorstack.com";
    const password = Deno.env.get("RESTRICTED_USER_PASSWORD");
    if (!password) {
      throw new Error("RESTRICTED_USER_PASSWORD secret is not configured");
    }
    const jurisdictionCode = "US";

    console.log(`Creating restricted user: ${email}`);

    // Check if user already exists
    const { data: existingUsers, error: listError } =
      await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      console.error("Error listing users:", listError);
      throw new Error(`Failed to list users: ${listError.message}`);
    }

    const existingUser = existingUsers?.users?.find(
      (u) => u.email === email
    );

    let userId: string;

    if (existingUser) {
      console.log(`User ${email} already exists with id ${existingUser.id}`);
      userId = existingUser.id;
    } else {
      // Create the user
      const { data: newUser, error: createError } =
        await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });

      if (createError) {
        console.error("Error creating user:", createError);
        throw new Error(`Failed to create user: ${createError.message}`);
      }

      userId = newUser.user.id;
      console.log(`Created user ${email} with id ${userId}`);
    }

    // Upsert profile
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert(
        {
          id: userId,
          first_name: "Nico",
          surname: "Admin",
        },
        { onConflict: "id" }
      );

    if (profileError) {
      console.error("Error upserting profile:", profileError);
      // Non-fatal, continue
    } else {
      console.log("Profile upserted successfully");
    }

    // Insert jurisdiction restriction (ignore conflict)
    const { error: jurisdictionError } = await supabaseAdmin
      .from("user_jurisdictions")
      .upsert(
        {
          user_id: userId,
          jurisdiction_code: jurisdictionCode,
        },
        { onConflict: "user_id,jurisdiction_code" }
      );

    if (jurisdictionError) {
      console.error("Error inserting jurisdiction:", jurisdictionError);
      throw new Error(
        `Failed to set jurisdiction: ${jurisdictionError.message}`
      );
    }

    console.log(
      `Jurisdiction restriction set: ${email} -> ${jurisdictionCode}`
    );

    return new Response(
      JSON.stringify({
        success: true,
        user_id: userId,
        email,
        jurisdiction: jurisdictionCode,
        was_existing: !!existingUser,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in create-restricted-user:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
