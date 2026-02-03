import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Demo clients data extracted from regionalData.ts
const demoClients = [
  // ===== SOUTH AFRICA (ZA) =====
  // Johan Botha's clients (JB)
  { first_name: 'NG Kerk Sinode', surname: 'Oos-Kaapland', advisor: 'Johan Botha', nationality: 'South African', language: 'Afrikaans', client_type: 'business', age: null },
  { first_name: 'Marthinus', surname: 'Van Niekerk', advisor: 'Johan Botha', nationality: 'South African', language: 'Afrikaans', client_type: 'individual', age: 55 },
  { first_name: 'Isabella', surname: 'Venter', advisor: 'Johan Botha', nationality: 'South African', language: 'Afrikaans', client_type: 'individual', age: 48 },
  { first_name: 'Andre Thomas', surname: 'Coetzer', advisor: 'Johan Botha', nationality: 'South African', language: 'English', client_type: 'individual', age: 42 },
  { first_name: 'Esther Amanda', surname: 'Nieman', advisor: 'Johan Botha', nationality: 'South African', language: 'Afrikaans', client_type: 'individual', age: 74 },
  { first_name: 'Petrus Jacobus', surname: 'Botha', advisor: 'Johan Botha', nationality: 'South African', language: 'Afrikaans', client_type: 'individual', age: 58 },
  { first_name: 'Maria Susanna', surname: 'van Zyl', advisor: 'Johan Botha', nationality: 'South African', language: 'Afrikaans', client_type: 'individual', age: 65 },
  
  // Sarah Mostert's clients (SM)
  { first_name: 'Jean', surname: 'De Villiers', advisor: 'Sarah Mostert', nationality: 'South African', language: 'Afrikaans', client_type: 'individual', age: 52 },
  { first_name: 'Francois', surname: 'Joubert', advisor: 'Sarah Mostert', nationality: 'South African', language: 'Afrikaans', client_type: 'individual', age: 45 },
  { first_name: 'Chanelle', surname: 'Steyn', advisor: 'Sarah Mostert', nationality: 'South African', language: 'Afrikaans', client_type: 'individual', age: 38 },
  { first_name: 'Elsie Sophia', surname: 'Lourens', advisor: 'Sarah Mostert', nationality: 'South African', language: 'Afrikaans', client_type: 'individual', age: 71 },
  { first_name: 'Melia Nocwaka', surname: 'Malgas', advisor: 'Sarah Mostert', nationality: 'South African', language: 'Xhosa', client_type: 'individual', age: 52 },
  { first_name: 'Hendrik Willem', surname: 'Venter', advisor: 'Sarah Mostert', nationality: 'South African', language: 'Afrikaans', client_type: 'individual', age: 48 },
  { first_name: 'Anna Elizabeth', surname: 'Joubert', advisor: 'Sarah Mostert', nationality: 'South African', language: 'Afrikaans', client_type: 'individual', age: 63 },
  
  // Pieter Naudé's clients (PN)
  { first_name: 'Rudolph', surname: 'Louw', advisor: 'Pieter Naudé', nationality: 'South African', language: 'Afrikaans', client_type: 'individual', age: 60 },
  { first_name: 'Werner', surname: 'Le Roux', advisor: 'Pieter Naudé', nationality: 'South African', language: 'Afrikaans', client_type: 'individual', age: 47 },
  { first_name: 'Annika', surname: 'Marais', advisor: 'Pieter Naudé', nationality: 'South African', language: 'Afrikaans', client_type: 'individual', age: 35 },
  { first_name: 'Samuel', surname: 'de Jager', advisor: 'Pieter Naudé', nationality: 'South African', language: 'Afrikaans', client_type: 'individual', age: 29 },
  { first_name: 'Denise', surname: 'Thiart', advisor: 'Pieter Naudé', nationality: 'South African', language: 'Afrikaans', client_type: 'individual', age: 44 },
  { first_name: 'Gideon Francois', surname: 'Steyn', advisor: 'Pieter Naudé', nationality: 'South African', language: 'Afrikaans', client_type: 'individual', age: 56 },
  { first_name: 'Catharina Maria', surname: 'le Roux', advisor: 'Pieter Naudé', nationality: 'South African', language: 'Afrikaans', client_type: 'individual', age: 68 },
  
  // Linda van Wyk's clients (LV)
  { first_name: 'Daan', surname: 'Van Der Sijde', advisor: 'Linda van Wyk', nationality: 'South African', language: 'Afrikaans', client_type: 'individual', age: 53 },
  { first_name: 'Johannes', surname: 'Pretorius', advisor: 'Linda van Wyk', nationality: 'South African', language: 'Afrikaans', client_type: 'individual', age: 61 },
  { first_name: 'Lizelle', surname: 'Du Toit', advisor: 'Linda van Wyk', nationality: 'South African', language: 'Afrikaans', client_type: 'individual', age: 42 },
  { first_name: 'Elana', surname: 'Wasmuth', advisor: 'Linda van Wyk', nationality: 'South African', language: 'Afrikaans', client_type: 'individual', age: 38 },
  { first_name: 'Elizabeth', surname: 'Saunders', advisor: 'Linda van Wyk', nationality: 'South African', language: 'English', client_type: 'individual', age: 55 },
  { first_name: 'Barend Johannes', surname: 'Marais', advisor: 'Linda van Wyk', nationality: 'South African', language: 'Afrikaans', client_type: 'individual', age: 72 },
  { first_name: 'Susanna Petronella', surname: 'du Toit', advisor: 'Linda van Wyk', nationality: 'South African', language: 'Afrikaans', client_type: 'individual', age: 49 },
  
  // David Greenberg's clients (DG)
  { first_name: 'Philippus', surname: 'Koon', advisor: 'David Greenberg', nationality: 'South African', language: 'Afrikaans', client_type: 'individual', age: 58 },
  { first_name: 'Hendrik', surname: 'Coetzee', advisor: 'David Greenberg', nationality: 'South African', language: 'Afrikaans', client_type: 'individual', age: 64 },
  { first_name: 'Marlene', surname: 'Jacobs', advisor: 'David Greenberg', nationality: 'South African', language: 'Afrikaans', client_type: 'individual', age: 51 },
  { first_name: 'Angeline Loraine', surname: 'Mostert', advisor: 'David Greenberg', nationality: 'South African', language: 'Afrikaans', client_type: 'individual', age: 67 },
  { first_name: 'Zonwabele Harry', surname: 'Molefe', advisor: 'David Greenberg', nationality: 'South African', language: 'Zulu', client_type: 'individual', age: 45 },
  { first_name: 'Willem Adriaan', surname: 'Coetzee', advisor: 'David Greenberg', nationality: 'South African', language: 'Afrikaans', client_type: 'individual', age: 59 },
  { first_name: 'Johanna Cornelia', surname: 'Jacobs', advisor: 'David Greenberg', nationality: 'South African', language: 'Afrikaans', client_type: 'individual', age: 76 },

  // ===== AUSTRALIA (AU) =====
  // James Mitchell's clients (JM)
  { first_name: 'Melbourne Grammar School', surname: 'Foundation', advisor: 'James Mitchell', nationality: 'Australian', language: 'English', client_type: 'business', age: null },
  { first_name: 'Konstantinos', surname: 'Papadopoulos', advisor: 'James Mitchell', nationality: 'Australian', language: 'English', client_type: 'individual', age: 52 },
  { first_name: 'David', surname: 'Nguyen', advisor: 'James Mitchell', nationality: 'Australian', language: 'English', client_type: 'individual', age: 45 },
  { first_name: 'William James', surname: 'Mitchell', advisor: 'James Mitchell', nationality: 'Australian', language: 'English', client_type: 'individual', age: 68 },
  { first_name: 'Charlotte Grace', surname: 'Wilson', advisor: 'James Mitchell', nationality: 'Australian', language: 'English', client_type: 'individual', age: 55 },
  { first_name: 'Mai Linh', surname: 'Nguyen', advisor: 'James Mitchell', nationality: 'Australian', language: 'English', client_type: 'individual', age: 42 },
  { first_name: 'Oliver James', surname: 'Taylor', advisor: 'James Mitchell', nationality: 'Australian', language: 'English', client_type: 'individual', age: 38 },
  
  // Sarah Thompson's clients (ST)
  { first_name: 'Michael', surname: "O'Connor", advisor: 'Sarah Thompson', nationality: 'Australian', language: 'English', client_type: 'individual', age: 58 },
  { first_name: 'Giuseppe', surname: 'Romano', advisor: 'Sarah Thompson', nationality: 'Australian', language: 'English', client_type: 'individual', age: 62 },
  { first_name: 'William', surname: 'Chen', advisor: 'Sarah Thompson', nationality: 'Australian', language: 'English', client_type: 'individual', age: 47 },
  { first_name: 'Sarah Elizabeth', surname: 'Thompson', advisor: 'Sarah Thompson', nationality: 'Australian', language: 'English', client_type: 'individual', age: 71 },
  { first_name: 'Thomas Edward', surname: 'Murphy', advisor: 'Sarah Thompson', nationality: 'Australian', language: 'English', client_type: 'individual', age: 52 },
  { first_name: 'Sophia', surname: 'Chen', advisor: 'Sarah Thompson', nationality: 'Australian', language: 'English', client_type: 'individual', age: 34 },
  { first_name: 'Emma Louise', surname: 'Brown', advisor: 'Sarah Thompson', nationality: 'Australian', language: 'English', client_type: 'individual', age: 45 },
  
  // Michael O'Brien's clients (MO)
  { first_name: 'Sarah', surname: 'Thompson', advisor: "Michael O'Brien", nationality: 'Australian', language: 'English', client_type: 'individual', age: 49 },
  { first_name: 'Brendan', surname: 'Kelly', advisor: "Michael O'Brien", nationality: 'Australian', language: 'English', client_type: 'individual', age: 55 },
  { first_name: 'Rajesh', surname: 'Patel', advisor: "Michael O'Brien", nationality: 'Australian', language: 'English', client_type: 'individual', age: 43 },
  { first_name: 'James Robert', surname: "O'Brien", advisor: "Michael O'Brien", nationality: 'Australian', language: 'English', client_type: 'individual', age: 74 },
  { first_name: 'Olivia Jane', surname: 'Campbell', advisor: "Michael O'Brien", nationality: 'Australian', language: 'English', client_type: 'individual', age: 48 },
  { first_name: 'Priya', surname: 'Patel', advisor: "Michael O'Brien", nationality: 'Australian', language: 'English', client_type: 'individual', age: 39 },
  { first_name: 'Alexander John', surname: 'McDonald', advisor: "Michael O'Brien", nationality: 'Australian', language: 'English', client_type: 'individual', age: 61 },
  
  // Emily Anderson's clients (EA)
  { first_name: 'David', surname: 'Williams', advisor: 'Emily Anderson', nationality: 'Australian', language: 'English', client_type: 'individual', age: 57 },
  { first_name: 'Helena', surname: 'Stavros', advisor: 'Emily Anderson', nationality: 'Australian', language: 'English', client_type: 'individual', age: 51 },
  { first_name: 'Andrew', surname: 'Morrison', advisor: 'Emily Anderson', nationality: 'Australian', language: 'English', client_type: 'individual', age: 44 },
  { first_name: 'Emily Rose', surname: 'Anderson', advisor: 'Emily Anderson', nationality: 'Australian', language: 'English', client_type: 'individual', age: 66 },
  { first_name: 'Henry William', surname: 'Scott', advisor: 'Emily Anderson', nationality: 'Australian', language: 'English', client_type: 'individual', age: 53 },
  { first_name: 'Isabella Grace', surname: 'Davis', advisor: 'Emily Anderson', nationality: 'Australian', language: 'English', client_type: 'individual', age: 37 },
  
  // Thomas Murphy's clients (TM)
  { first_name: 'Jennifer', surname: 'Brown', advisor: 'Thomas Murphy', nationality: 'Australian', language: 'English', client_type: 'individual', age: 48 },
  { first_name: 'Benjamin', surname: 'Lee', advisor: 'Thomas Murphy', nationality: 'Australian', language: 'English', client_type: 'individual', age: 41 },
  { first_name: 'Catherine', surname: 'Walsh', advisor: 'Thomas Murphy', nationality: 'Australian', language: 'English', client_type: 'individual', age: 59 },
  { first_name: 'Michael Patrick', surname: 'Kelly', advisor: 'Thomas Murphy', nationality: 'Australian', language: 'English', client_type: 'individual', age: 72 },
  { first_name: 'Sophie Anne', surname: 'Martin', advisor: 'Thomas Murphy', nationality: 'Australian', language: 'English', client_type: 'individual', age: 35 },

  // ===== CANADA (CA) =====
  // Pierre Tremblay's clients (PT)
  { first_name: 'Toronto General Hospital', surname: 'Foundation', advisor: 'Pierre Tremblay', nationality: 'Canadian', language: 'English', client_type: 'business', age: null },
  { first_name: 'Jean-François', surname: 'Lavoie', advisor: 'Pierre Tremblay', nationality: 'Canadian', language: 'French', client_type: 'individual', age: 54 },
  { first_name: 'Émilie', surname: 'Bergeron', advisor: 'Pierre Tremblay', nationality: 'Canadian', language: 'French', client_type: 'individual', age: 42 },
  { first_name: 'Pierre', surname: 'Tremblay', advisor: 'Pierre Tremblay', nationality: 'Canadian', language: 'French', client_type: 'individual', age: 69 },
  { first_name: 'Marie', surname: 'Tremblay', advisor: 'Pierre Tremblay', nationality: 'Canadian', language: 'French', client_type: 'individual', age: 67 },
  { first_name: 'Louis Philippe', surname: 'Gagnon', advisor: 'Pierre Tremblay', nationality: 'Canadian', language: 'French', client_type: 'individual', age: 51 },
  { first_name: 'Isabelle Marie', surname: 'Côté', advisor: 'Pierre Tremblay', nationality: 'Canadian', language: 'French', client_type: 'individual', age: 44 },
  
  // Marie Bouchard's clients (MB)
  { first_name: 'David', surname: 'Wong', advisor: 'Marie Bouchard', nationality: 'Canadian', language: 'English', client_type: 'individual', age: 47 },
  { first_name: 'Jennifer', surname: 'Kim', advisor: 'Marie Bouchard', nationality: 'Canadian', language: 'English', client_type: 'individual', age: 39 },
  { first_name: 'Sophie', surname: 'Bouchard', advisor: 'Marie Bouchard', nationality: 'Canadian', language: 'French', client_type: 'individual', age: 58 },
  { first_name: 'Jacques', surname: 'Bouchard', advisor: 'Marie Bouchard', nationality: 'Canadian', language: 'French', client_type: 'individual', age: 71 },
  { first_name: 'Catherine Anne', surname: 'Leblanc', advisor: 'Marie Bouchard', nationality: 'Canadian', language: 'French', client_type: 'individual', age: 46 },
  { first_name: 'Michael James', surname: 'Thompson', advisor: 'Marie Bouchard', nationality: 'Canadian', language: 'English', client_type: 'individual', age: 53 },
  
  // James MacDonald's clients (JM)
  { first_name: 'Alexander', surname: 'Campbell', advisor: 'James MacDonald', nationality: 'Canadian', language: 'English', client_type: 'individual', age: 61 },
  { first_name: 'Kathleen', surname: "O'Brien", advisor: 'James MacDonald', nationality: 'Canadian', language: 'English', client_type: 'individual', age: 55 },
  { first_name: 'Marie-Claire', surname: 'Roy', advisor: 'James MacDonald', nationality: 'Canadian', language: 'French', client_type: 'individual', age: 48 },
  { first_name: 'Angus', surname: 'MacDonald', advisor: 'James MacDonald', nationality: 'Canadian', language: 'English', client_type: 'individual', age: 73 },
  { first_name: 'Elizabeth Rose', surname: 'Murray', advisor: 'James MacDonald', nationality: 'Canadian', language: 'English', client_type: 'individual', age: 59 },
  { first_name: 'Robert James', surname: 'Stewart', advisor: 'James MacDonald', nationality: 'Canadian', language: 'English', client_type: 'individual', age: 64 },
  
  // Sophie Gagnon's clients (SG)
  { first_name: 'Arun', surname: 'Patel', advisor: 'Sophie Gagnon', nationality: 'Canadian', language: 'English', client_type: 'individual', age: 44 },
  { first_name: 'Nathalie', surname: 'Leblanc', advisor: 'Sophie Gagnon', nationality: 'Canadian', language: 'French', client_type: 'individual', age: 52 },
  { first_name: 'Jean-Luc', surname: 'Gagnon', advisor: 'Sophie Gagnon', nationality: 'Canadian', language: 'French', client_type: 'individual', age: 68 },
  { first_name: 'François', surname: 'Gagnon', advisor: 'Sophie Gagnon', nationality: 'Canadian', language: 'French', client_type: 'individual', age: 41 },
  { first_name: 'Priya', surname: 'Sharma', advisor: 'Sophie Gagnon', nationality: 'Canadian', language: 'English', client_type: 'individual', age: 36 },
  
  // Robert Singh's clients (RS)
  { first_name: 'Harpreet', surname: 'Singh', advisor: 'Robert Singh', nationality: 'Canadian', language: 'English', client_type: 'individual', age: 49 },
  { first_name: 'Jacques', surname: 'Dumont', advisor: 'Robert Singh', nationality: 'Canadian', language: 'French', client_type: 'individual', age: 57 },
  { first_name: 'Robert', surname: 'Singh', advisor: 'Robert Singh', nationality: 'Canadian', language: 'English', client_type: 'individual', age: 72 },
  { first_name: 'Priya', surname: 'Singh', advisor: 'Robert Singh', nationality: 'Canadian', language: 'English', client_type: 'individual', age: 45 },
  { first_name: 'James William', surname: 'Fraser', advisor: 'Robert Singh', nationality: 'Canadian', language: 'English', client_type: 'individual', age: 63 },

  // ===== UNITED KINGDOM (GB) =====
  // William Smith's clients (WS)
  { first_name: 'The Royal', surname: 'Foundation', advisor: 'William Smith', nationality: 'British', language: 'English', client_type: 'business', age: null },
  { first_name: 'Richard', surname: 'Thompson', advisor: 'William Smith', nationality: 'British', language: 'English', client_type: 'individual', age: 58 },
  { first_name: 'Amir', surname: 'Khan', advisor: 'William Smith', nationality: 'British', language: 'English', client_type: 'individual', age: 45 },
  { first_name: 'William Arthur', surname: 'Smith', advisor: 'William Smith', nationality: 'British', language: 'English', client_type: 'individual', age: 71 },
  { first_name: 'Charlotte Emma', surname: 'Davies', advisor: 'William Smith', nationality: 'British', language: 'English', client_type: 'individual', age: 52 },
  { first_name: 'James Edward', surname: 'Wilson', advisor: 'William Smith', nationality: 'British', language: 'English', client_type: 'individual', age: 64 },
  { first_name: 'Victoria Anne', surname: 'Thompson', advisor: 'William Smith', nationality: 'British', language: 'English', client_type: 'individual', age: 47 },
  
  // Elizabeth Jones's clients (EJ)
  { first_name: 'William', surname: 'Smith', advisor: 'Elizabeth Jones', nationality: 'British', language: 'English', client_type: 'individual', age: 53 },
  { first_name: 'Meera', surname: 'Patel', advisor: 'Elizabeth Jones', nationality: 'British', language: 'English', client_type: 'individual', age: 41 },
  { first_name: 'Patrick', surname: "O'Sullivan", advisor: 'Elizabeth Jones', nationality: 'British', language: 'English', client_type: 'individual', age: 56 },
  { first_name: 'Elizabeth Mary', surname: 'Jones', advisor: 'Elizabeth Jones', nationality: 'British', language: 'English', client_type: 'individual', age: 74 },
  { first_name: 'George Henry', surname: 'Wilson', advisor: 'Elizabeth Jones', nationality: 'British', language: 'English', client_type: 'individual', age: 67 },
  { first_name: 'Sophie Catherine', surname: 'Brown', advisor: 'Elizabeth Jones', nationality: 'British', language: 'English', client_type: 'individual', age: 38 },
  
  // Thomas Williams's clients (TW)
  { first_name: 'Elizabeth', surname: 'Jones', advisor: 'Thomas Williams', nationality: 'British', language: 'English', client_type: 'individual', age: 49 },
  { first_name: 'Ciara', surname: 'Murphy', advisor: 'Thomas Williams', nationality: 'British', language: 'English', client_type: 'individual', age: 44 },
  { first_name: 'Chidi', surname: 'Okonkwo', advisor: 'Thomas Williams', nationality: 'British', language: 'English', client_type: 'individual', age: 51 },
  { first_name: 'Thomas Edward', surname: 'Williams', advisor: 'Thomas Williams', nationality: 'British', language: 'English', client_type: 'individual', age: 68 },
  { first_name: 'Amelia Rose', surname: 'Evans', advisor: 'Thomas Williams', nationality: 'British', language: 'English', client_type: 'individual', age: 35 },
  { first_name: 'Henry James', surname: 'Taylor', advisor: 'Thomas Williams', nationality: 'British', language: 'English', client_type: 'individual', age: 59 },
  
  // Victoria Brown's clients (VB)
  { first_name: 'Thomas', surname: 'Williams', advisor: 'Victoria Brown', nationality: 'British', language: 'English', client_type: 'individual', age: 55 },
  { first_name: 'Simran', surname: 'Kaur', advisor: 'Victoria Brown', nationality: 'British', language: 'English', client_type: 'individual', age: 38 },
  { first_name: 'Fiona', surname: 'Campbell', advisor: 'Victoria Brown', nationality: 'British', language: 'English', client_type: 'individual', age: 47 },
  { first_name: 'Victoria Anne', surname: 'Brown', advisor: 'Victoria Brown', nationality: 'British', language: 'English', client_type: 'individual', age: 72 },
  { first_name: 'Oliver Charles', surname: 'Thomas', advisor: 'Victoria Brown', nationality: 'British', language: 'English', client_type: 'individual', age: 43 },
  { first_name: 'Isabella Grace', surname: 'White', advisor: 'Victoria Brown', nationality: 'British', language: 'English', client_type: 'individual', age: 61 },
  
  // James Taylor's clients (JT)
  { first_name: 'James', surname: 'Taylor', advisor: 'James Taylor', nationality: 'British', language: 'English', client_type: 'individual', age: 58 },
  { first_name: 'Marta', surname: 'Kowalski', advisor: 'James Taylor', nationality: 'British', language: 'English', client_type: 'individual', age: 42 },
  { first_name: 'Fatima', surname: 'Ahmed', advisor: 'James Taylor', nationality: 'British', language: 'English', client_type: 'individual', age: 49 },
  { first_name: 'James Robert', surname: 'Taylor', advisor: 'James Taylor', nationality: 'British', language: 'English', client_type: 'individual', age: 76 },
  { first_name: 'Isabella Grace', surname: 'Roberts', advisor: 'James Taylor', nationality: 'British', language: 'English', client_type: 'individual', age: 34 },
  { first_name: 'Edward William', surname: 'Harris', advisor: 'James Taylor', nationality: 'British', language: 'English', client_type: 'individual', age: 65 },

  // ===== UNITED STATES (US) =====
  // Michael Johnson's clients (MJ)
  { first_name: "St. Mary's Hospital", surname: 'Foundation', advisor: 'Michael Johnson', nationality: 'American', language: 'English', client_type: 'business', age: null },
  { first_name: 'Wei', surname: 'Chen', advisor: 'Michael Johnson', nationality: 'American', language: 'English', client_type: 'individual', age: 47 },
  { first_name: 'Marcus', surname: 'Washington', advisor: 'Michael Johnson', nationality: 'American', language: 'English', client_type: 'individual', age: 52 },
  { first_name: 'Michael David', surname: 'Johnson', advisor: 'Michael Johnson', nationality: 'American', language: 'English', client_type: 'individual', age: 71 },
  { first_name: 'Patricia Ann', surname: 'Martinez', advisor: 'Michael Johnson', nationality: 'American', language: 'English', client_type: 'individual', age: 58 },
  { first_name: 'Robert James', surname: 'Williams', advisor: 'Michael Johnson', nationality: 'American', language: 'English', client_type: 'individual', age: 64 },
  { first_name: 'Jennifer Lynn', surname: 'Davis', advisor: 'Michael Johnson', nationality: 'American', language: 'English', client_type: 'individual', age: 45 },
  
  // Jennifer Williams's clients (JW)
  { first_name: 'Robert', surname: 'Johnson', advisor: 'Jennifer Williams', nationality: 'American', language: 'English', client_type: 'individual', age: 55 },
  { first_name: 'Carlos', surname: 'Hernandez', advisor: 'Jennifer Williams', nationality: 'American', language: 'English', client_type: 'individual', age: 48 },
  { first_name: 'Jennifer', surname: 'Kim', advisor: 'Jennifer Williams', nationality: 'American', language: 'English', client_type: 'individual', age: 41 },
  { first_name: 'Jennifer Marie', surname: 'Williams', advisor: 'Jennifer Williams', nationality: 'American', language: 'English', client_type: 'individual', age: 68 },
  { first_name: 'James Michael', surname: 'Wilson', advisor: 'Jennifer Williams', nationality: 'American', language: 'English', client_type: 'individual', age: 53 },
  { first_name: 'Maria Elena', surname: 'Rodriguez', advisor: 'Jennifer Williams', nationality: 'American', language: 'Spanish', client_type: 'individual', age: 44 },
  
  // Robert Brown's clients (RB)
  { first_name: 'Patricia', surname: 'Williams', advisor: 'Robert Brown', nationality: 'American', language: 'English', client_type: 'individual', age: 59 },
  { first_name: 'Vikram', surname: 'Patel', advisor: 'Robert Brown', nationality: 'American', language: 'English', client_type: 'individual', age: 46 },
  { first_name: 'Sean', surname: "O'Connor", advisor: 'Robert Brown', nationality: 'American', language: 'English', client_type: 'individual', age: 51 },
  { first_name: 'Robert James', surname: 'Brown', advisor: 'Robert Brown', nationality: 'American', language: 'English', client_type: 'individual', age: 74 },
  { first_name: 'Linda Sue', surname: 'Anderson', advisor: 'Robert Brown', nationality: 'American', language: 'English', client_type: 'individual', age: 62 },
  { first_name: 'William Thomas', surname: 'Miller', advisor: 'Robert Brown', nationality: 'American', language: 'English', client_type: 'individual', age: 57 },
  
  // Maria Garcia's clients (MG)
  { first_name: 'Miguel', surname: 'Garcia', advisor: 'Maria Garcia', nationality: 'American', language: 'Spanish', client_type: 'individual', age: 54 },
  { first_name: 'Angela', surname: 'Washington', advisor: 'Maria Garcia', nationality: 'American', language: 'English', client_type: 'individual', age: 47 },
  { first_name: 'Kenji', surname: 'Nakamura', advisor: 'Maria Garcia', nationality: 'American', language: 'English', client_type: 'individual', age: 43 },
  { first_name: 'Maria Elena', surname: 'Garcia', advisor: 'Maria Garcia', nationality: 'American', language: 'Spanish', client_type: 'individual', age: 69 },
  { first_name: 'David Lee', surname: 'Thompson', advisor: 'Maria Garcia', nationality: 'American', language: 'English', client_type: 'individual', age: 51 },
  { first_name: 'Jessica Ann', surname: 'Martinez', advisor: 'Maria Garcia', nationality: 'American', language: 'English', client_type: 'individual', age: 38 },
  
  // William Davis's clients (WD)
  { first_name: 'Isabella', surname: 'Martinez', advisor: 'William Davis', nationality: 'American', language: 'English', client_type: 'individual', age: 49 },
  { first_name: 'Sofia', surname: 'Rodriguez', advisor: 'William Davis', nationality: 'American', language: 'Spanish', client_type: 'individual', age: 42 },
  { first_name: 'Jamal', surname: 'Thompson', advisor: 'William Davis', nationality: 'American', language: 'English', client_type: 'individual', age: 55 },
  { first_name: 'William Thomas', surname: 'Davis', advisor: 'William Davis', nationality: 'American', language: 'English', client_type: 'individual', age: 73 },
  { first_name: 'Susan Marie', surname: 'Jackson', advisor: 'William Davis', nationality: 'American', language: 'English', client_type: 'individual', age: 61 },
  { first_name: 'Christopher John', surname: 'Lee', advisor: 'William Davis', nationality: 'American', language: 'English', client_type: 'individual', age: 46 },
]

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client with user's auth token
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Verify the user's token
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get existing client names for this user to avoid duplicates
    const { data: existingClients, error: existingError } = await supabase
      .from('clients')
      .select('first_name, surname')
      .eq('user_id', user.id)

    if (existingError) {
      console.error('Error fetching existing clients:', existingError)
      return new Response(
        JSON.stringify({ error: 'Failed to check existing clients' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create a Set of existing names for fast lookup (case-insensitive)
    const existingNames = new Set(
      (existingClients || []).map(c => `${c.first_name}|${c.surname}`.toLowerCase())
    )

    console.log(`User has ${existingClients?.length || 0} existing clients`)

    // Calculate date of birth from age
    const calculateDOB = (age: number | null): string | null => {
      if (age === null) return null
      const today = new Date()
      const birthYear = today.getFullYear() - age
      // Use June 15 as a middle-of-year approximation
      return `${birthYear}-06-15`
    }

    // Filter demo clients to only include those not already in database
    const clientsToInsert = demoClients
      .filter(client => {
        const nameKey = `${client.first_name}|${client.surname}`.toLowerCase()
        return !existingNames.has(nameKey)
      })
      .map(client => ({
        user_id: user.id,
        first_name: client.first_name,
        surname: client.surname,
        profile_state: 'Active',
        profile_type: 'Client',
        client_type: client.client_type,
        nationality: client.nationality,
        language: client.language,
        advisor: client.advisor,
        date_of_birth: calculateDOB(client.age),
      }))

    // If all demo clients already exist, return early
    if (clientsToInsert.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'All demo clients already exist', 
          seeded: false, 
          existingCount: existingClients?.length || 0 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Inserting ${clientsToInsert.length} new demo clients`)

    // Insert only the missing clients
    const { data: insertedClients, error: insertError } = await supabase
      .from('clients')
      .insert(clientsToInsert)
      .select('id')

    if (insertError) {
      console.error('Error inserting clients:', insertError)
      return new Response(
        JSON.stringify({ error: 'Failed to seed clients', details: insertError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ 
        message: 'Demo clients seeded successfully', 
        seeded: true, 
        count: insertedClients?.length || 0,
        existingCount: existingClients?.length || 0
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
