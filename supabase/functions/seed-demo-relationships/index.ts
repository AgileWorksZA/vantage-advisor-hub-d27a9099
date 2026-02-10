import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface Client {
  id: string;
  user_id: string;
  first_name: string;
  surname: string;
  gender: string | null;
  date_of_birth: string | null;
  client_type: string;
  country_of_issue: string | null;
  advisor: string | null;
  id_number: string | null;
  passport_number: string | null;
}

const reciprocalType: Record<string, string> = {
  Spouse: "Spouse",
  Parent: "Child",
  Child: "Parent",
  Sibling: "Sibling",
  Director: "Shareholder",
  Shareholder: "Director",
  Trustee: "Beneficiary",
  Beneficiary: "Trustee",
};

const professionalContacts: Record<string, Array<{ name: string; jobTitle: string; company: string; contactType: string }>> = {
  "South Africa": [
    { name: "Johan van der Merwe", jobTitle: "Accountant", company: "Van der Merwe & Associates", contactType: "Accountant" },
    { name: "Fatima Patel", jobTitle: "Attorney", company: "Patel Attorneys Inc.", contactType: "Attorney" },
    { name: "Pieter Botha", jobTitle: "Financial Planner", company: "Botha Wealth Planning", contactType: "Financial Planner" },
    { name: "Nomsa Dlamini", jobTitle: "Tax Consultant", company: "Dlamini Tax Services", contactType: "Tax Consultant" },
    { name: "André Pretorius", jobTitle: "Estate Planner", company: "Pretorius Estate Planning", contactType: "Estate Planner" },
  ],
  Australia: [
    { name: "James Mitchell", jobTitle: "Accountant", company: "Mitchell & Partners", contactType: "Accountant" },
    { name: "Sarah O'Brien", jobTitle: "Solicitor", company: "O'Brien Legal", contactType: "Attorney" },
    { name: "David Chen", jobTitle: "Financial Adviser", company: "Chen Financial Group", contactType: "Financial Planner" },
    { name: "Emma Thompson", jobTitle: "Tax Agent", company: "Thompson Tax Advisory", contactType: "Tax Consultant" },
    { name: "Michael Wong", jobTitle: "Estate Planner", company: "Wong Estate Solutions", contactType: "Estate Planner" },
  ],
  Canada: [
    { name: "Marc-André Tremblay", jobTitle: "Accountant", company: "Tremblay CPA", contactType: "Accountant" },
    { name: "Jennifer Campbell", jobTitle: "Lawyer", company: "Campbell Law Office", contactType: "Attorney" },
    { name: "Robert Singh", jobTitle: "Financial Planner", company: "Singh Financial Inc.", contactType: "Financial Planner" },
    { name: "Catherine Dubois", jobTitle: "Tax Specialist", company: "Dubois Tax Services", contactType: "Tax Consultant" },
    { name: "William Fraser", jobTitle: "Estate Planner", company: "Fraser Estate Planning", contactType: "Estate Planner" },
  ],
  "United Kingdom": [
    { name: "Oliver Hughes", jobTitle: "Chartered Accountant", company: "Hughes & Co.", contactType: "Accountant" },
    { name: "Charlotte Bennett", jobTitle: "Solicitor", company: "Bennett & Partners LLP", contactType: "Attorney" },
    { name: "William Davies", jobTitle: "Financial Adviser", company: "Davies Wealth Management", contactType: "Financial Planner" },
    { name: "Elizabeth Taylor", jobTitle: "Tax Adviser", company: "Taylor Tax Consulting", contactType: "Tax Consultant" },
    { name: "George Wilson", jobTitle: "Estate Planner", company: "Wilson Estate Services", contactType: "Estate Planner" },
  ],
  "United States": [
    { name: "Robert Johnson", jobTitle: "CPA", company: "Johnson & Associates CPA", contactType: "Accountant" },
    { name: "Amanda Williams", jobTitle: "Attorney at Law", company: "Williams Legal Group", contactType: "Attorney" },
    { name: "Michael Davis", jobTitle: "CFP", company: "Davis Financial Planning", contactType: "Financial Planner" },
    { name: "Patricia Martinez", jobTitle: "Tax Advisor", company: "Martinez Tax Advisory", contactType: "Tax Consultant" },
    { name: "Christopher Brown", jobTitle: "Estate Attorney", company: "Brown Estate Law", contactType: "Estate Planner" },
  ],
};

function calculateAge(dob: string | null): number {
  if (!dob) return 35;
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

function getIdTypeForJurisdiction(jurisdiction: string): string {
  const normalized = jurisdiction.toLowerCase().trim();
  if (normalized === "south africa") return "SA ID";
  if (normalized === "australia") return "National ID";
  if (normalized === "canada") return "SIN";
  if (normalized === "united kingdom") return "NI Number";
  if (normalized === "united states") return "SSN";
  return "National ID";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all clients
    const { data: allClients, error: fetchErr } = await supabase
      .from("clients")
      .select("id, user_id, first_name, surname, gender, date_of_birth, client_type, country_of_issue, advisor, id_number, passport_number")
      .order("created_at", { ascending: true });

    if (fetchErr) throw fetchErr;
    if (!allClients || allClients.length === 0) {
      return new Response(JSON.stringify({ message: "No clients found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Delete existing seeded relationships and contacts to allow re-run
    const userIds = [...new Set(allClients.map((c: Client) => c.user_id))];
    for (const uid of userIds) {
      await supabase.from("client_relationships").delete().eq("user_id", uid);
      await supabase.from("client_contacts").delete().eq("user_id", uid);
      await supabase.from("clients").update({ household_group: null }).eq("user_id", uid);
    }

    // Group clients by user_id -> country_of_issue
    const grouped: Record<string, Record<string, Client[]>> = {};
    for (const c of allClients as Client[]) {
      const uid = c.user_id;
      const jurisdiction = c.country_of_issue || "Unknown";
      if (!grouped[uid]) grouped[uid] = {};
      if (!grouped[uid][jurisdiction]) grouped[uid][jurisdiction] = [];
      grouped[uid][jurisdiction].push(c);
    }

    const relationshipsToInsert: any[] = [];
    const contactsToInsert: any[] = [];
    const familyGroupUpdates: Array<{ id: string; household_group: string }> = [];

    for (const userId of Object.keys(grouped)) {
      for (const jurisdiction of Object.keys(grouped[userId])) {
        const clients = grouped[userId][jurisdiction];
        if (jurisdiction === "Unknown") continue;

        const individuals = clients.filter((c) => c.client_type === "individual");
        const businessEntities = clients.filter((c) => c.client_type === "business" || c.client_type === "trust");

        // Sort individuals by age descending for parent-child pairing
        const sorted = [...individuals].sort(
          (a, b) => calculateAge(b.date_of_birth) - calculateAge(a.date_of_birth)
        );

        const males = sorted.filter((c) => c.gender === "Male");
        const females = sorted.filter((c) => c.gender === "Female");

        // --- Spouse pairs (up to 4 pairs) ---
        const spousePairCount = Math.min(4, males.length, females.length);
        const usedForSpouse = new Set<string>();
        const familyGroups: Array<{ surname: string; members: Client[] }> = [];

        for (let i = 0; i < spousePairCount; i++) {
          const husband = males[i];
          const wife = females[i];
          usedForSpouse.add(husband.id);
          usedForSpouse.add(wife.id);

          const familySurname = husband.surname;
          const familyGroupName = `The ${familySurname} Household`;

          familyGroups.push({ surname: familySurname, members: [husband, wife] });
          familyGroupUpdates.push({ id: husband.id, household_group: familyGroupName });
          familyGroupUpdates.push({ id: wife.id, household_group: familyGroupName });

          // Bi-directional spouse
          relationshipsToInsert.push({
            user_id: userId,
            client_id: husband.id,
            related_client_id: wife.id,
            name: `${wife.first_name} ${wife.surname}`,
            entity_type: "Individual",
            identification: wife.id_number || wife.passport_number || null,
            id_type: wife.id_number ? getIdTypeForJurisdiction(jurisdiction) : "Passport",
            relationship_type: "Spouse",
            family_name: familyGroupName,
          });
          relationshipsToInsert.push({
            user_id: userId,
            client_id: wife.id,
            related_client_id: husband.id,
            name: `${husband.first_name} ${husband.surname}`,
            entity_type: "Individual",
            identification: husband.id_number || husband.passport_number || null,
            id_type: husband.id_number ? getIdTypeForJurisdiction(jurisdiction) : "Passport",
            relationship_type: "Spouse",
            family_name: familyGroupName,
          });
        }

        // --- Parent-Child links ---
        // For each family group, find younger individuals to assign as children
        const availableChildren = sorted.filter(
          (c) => !usedForSpouse.has(c.id) && calculateAge(c.date_of_birth) < 40
        );
        let childIdx = 0;

        for (const fg of familyGroups) {
          const childrenToAdd = Math.min(2, availableChildren.length - childIdx);
          for (let j = 0; j < childrenToAdd; j++) {
            const child = availableChildren[childIdx++];
            const parent = fg.members[0]; // husband as parent
            const familyGroupName = `The ${fg.surname} Household`;

            familyGroupUpdates.push({ id: child.id, household_group: familyGroupName });
            fg.members.push(child);

            // Parent -> Child
            relationshipsToInsert.push({
              user_id: userId,
              client_id: parent.id,
              related_client_id: child.id,
              name: `${child.first_name} ${child.surname}`,
              entity_type: "Individual",
              identification: child.id_number || child.passport_number || null,
              id_type: child.id_number ? getIdTypeForJurisdiction(jurisdiction) : "Passport",
              relationship_type: "Child",
              family_name: familyGroupName,
            });
            // Child -> Parent
            relationshipsToInsert.push({
              user_id: userId,
              client_id: child.id,
              related_client_id: parent.id,
              name: `${parent.first_name} ${parent.surname}`,
              entity_type: "Individual",
              identification: parent.id_number || parent.passport_number || null,
              id_type: parent.id_number ? getIdTypeForJurisdiction(jurisdiction) : "Passport",
              relationship_type: "Parent",
              family_name: familyGroupName,
            });
            // Also link to mother
            const mother = fg.members[1];
            relationshipsToInsert.push({
              user_id: userId,
              client_id: mother.id,
              related_client_id: child.id,
              name: `${child.first_name} ${child.surname}`,
              entity_type: "Individual",
              identification: child.id_number || child.passport_number || null,
              id_type: child.id_number ? getIdTypeForJurisdiction(jurisdiction) : "Passport",
              relationship_type: "Child",
              family_name: familyGroupName,
            });
            relationshipsToInsert.push({
              user_id: userId,
              client_id: child.id,
              related_client_id: mother.id,
              name: `${mother.first_name} ${mother.surname}`,
              entity_type: "Individual",
              identification: mother.id_number || mother.passport_number || null,
              id_type: mother.id_number ? getIdTypeForJurisdiction(jurisdiction) : "Passport",
              relationship_type: "Parent",
              family_name: familyGroupName,
            });
          }
        }

        // --- Business entity relationships ---
        const availableForBusiness = sorted.filter((c) => !usedForSpouse.has(c.id));
        const bizCount = Math.min(3, businessEntities.length);
        for (let i = 0; i < bizCount; i++) {
          const biz = businessEntities[i];
          const individual = availableForBusiness[i % availableForBusiness.length];
          if (!individual) continue;

          const relType = biz.client_type === "trust" ? "Trustee" : "Director";
          const reverseType = reciprocalType[relType];
          const entityType = biz.client_type === "trust" ? "Trust" : "Company";

          relationshipsToInsert.push({
            user_id: userId,
            client_id: individual.id,
            related_client_id: biz.id,
            name: `${biz.first_name} ${biz.surname}`,
            entity_type: entityType,
            identification: biz.id_number || biz.passport_number || null,
            id_type: biz.id_number ? "Registration" : "Passport",
            relationship_type: relType,
            share_percentage: relType === "Director" ? 50 : null,
          });
          relationshipsToInsert.push({
            user_id: userId,
            client_id: biz.id,
            related_client_id: individual.id,
            name: `${individual.first_name} ${individual.surname}`,
            entity_type: "Individual",
            identification: individual.id_number || individual.passport_number || null,
            id_type: individual.id_number ? getIdTypeForJurisdiction(jurisdiction) : "Passport",
            relationship_type: reverseType,
            share_percentage: reverseType === "Shareholder" ? 50 : null,
          });
        }

        // --- Professional contacts ---
        const contacts = professionalContacts[jurisdiction] || [];
        const contactClients = individuals.slice(0, Math.min(5, individuals.length));
        for (let i = 0; i < contactClients.length && i < contacts.length; i++) {
          const client = contactClients[i];
          const contact = contacts[i];
          contactsToInsert.push({
            user_id: userId,
            client_id: client.id,
            name: contact.name,
            job_title: contact.jobTitle,
            company: contact.company,
            contact_type: contact.contactType,
            email: `${contact.name.split(" ")[0].toLowerCase()}@${contact.company.toLowerCase().replace(/[^a-z]/g, "").slice(0, 15)}.com`,
            phone: jurisdiction === "South Africa" ? "+27 11 " + String(Math.floor(Math.random() * 9000000 + 1000000)) :
                   jurisdiction === "Australia" ? "+61 2 " + String(Math.floor(Math.random() * 90000000 + 10000000)) :
                   jurisdiction === "Canada" ? "+1 416 " + String(Math.floor(Math.random() * 9000000 + 1000000)) :
                   jurisdiction === "United Kingdom" ? "+44 20 " + String(Math.floor(Math.random() * 90000000 + 10000000)) :
                   "+1 212 " + String(Math.floor(Math.random() * 9000000 + 1000000)),
          });
        }
      }
    }

    // Batch insert relationships
    if (relationshipsToInsert.length > 0) {
      const batchSize = 200;
      for (let i = 0; i < relationshipsToInsert.length; i += batchSize) {
        const batch = relationshipsToInsert.slice(i, i + batchSize);
        const { error: relErr } = await supabase.from("client_relationships").insert(batch);
        if (relErr) console.error("Relationship insert error:", relErr);
      }
    }

    // Batch insert contacts
    if (contactsToInsert.length > 0) {
      const { error: contactErr } = await supabase.from("client_contacts").insert(contactsToInsert);
      if (contactErr) console.error("Contact insert error:", contactErr);
    }

    // Update family_group on clients
    for (const update of familyGroupUpdates) {
      await supabase.from("clients").update({ household_group: update.household_group }).eq("id", update.id);
    }

    return new Response(
      JSON.stringify({
        message: "Relationships seeded successfully",
        relationships: relationshipsToInsert.length,
        contacts: contactsToInsert.length,
        familyGroups: familyGroupUpdates.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error seeding relationships:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
