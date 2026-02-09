import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Demo clients data with comprehensive information
interface DemoClient {
  first_name: string;
  surname: string;
  advisor: string;
  nationality: string;
  language: string;
  client_type: string;
  age: number | null;
  gender: string | null;
  title: string;
  email: string;
  cell_number: string;
  work_number: string | null;
  home_number: string | null;
  occupation: string;
  employer: string | null;
  industry: string;
  id_number: string;
  tax_number: string | null;
  country_of_issue: string;
  tax_resident_country: string;
  preferred_contact: string;
  initials: string;
}

// ==================== ID NUMBER GENERATORS ====================

// South African ID: YYMMDDGSSSCAZ (13 digits)
function generateZAId(seq: number, age: number, gender: string | null): string {
  const birthYear = new Date().getFullYear() - age
  const yy = String(birthYear).slice(-2)
  const mm = String(1 + (seq % 12)).padStart(2, '0')
  const dd = String(10 + (seq % 19)).padStart(2, '0')
  const g = (gender === 'Female') ? 0 : 5
  const sss = String(g * 100 + seq).padStart(4, '0')
  const c = 0 // SA citizen
  const a = 8
  // simple check digit
  const partial = `${yy}${mm}${dd}${sss}${c}${a}`
  const z = seq % 10
  return `${partial}${z}`
}

// Australian TFN: 9 digits
function generateAUId(seq: number): string {
  const base = 100000000 + seq * 7 + 3
  return String(base).slice(0, 9)
}

// Canadian SIN: 9 digits
function generateCAId(seq: number): string {
  const base = 200000000 + seq * 11 + 7
  return String(base).slice(0, 9)
}

// UK NI Number: XX 99 99 99 X
function generateGBId(seq: number): string {
  const letters1 = 'ABCDEFGHJKLMNOPQRSTVWXYZ'
  const letters2 = 'ABCD'
  const a = letters1[seq % letters1.length]
  const b = letters1[(seq * 3 + 7) % letters1.length]
  const n1 = String(10 + (seq % 90)).padStart(2, '0')
  const n2 = String(10 + ((seq * 7) % 90)).padStart(2, '0')
  const n3 = String(10 + ((seq * 13) % 90)).padStart(2, '0')
  const c = letters2[seq % letters2.length]
  return `${a}${b} ${n1} ${n2} ${n3} ${c}`
}

// US SSN: 9 digits (XXX-XX-XXXX stored as digits)
function generateUSId(seq: number): string {
  const area = String(100 + (seq % 800)).padStart(3, '0')
  const group = String(10 + (seq % 89)).padStart(2, '0')
  const serial = String(1000 + seq).padStart(4, '0')
  return `${area}${group}${serial}`
}

function generateIdForJurisdiction(jurisdiction: string, seq: number, age: number, gender: string | null): string {
  switch (jurisdiction) {
    case 'ZA': return generateZAId(seq, age || 40, gender)
    case 'AU': return generateAUId(seq)
    case 'CA': return generateCAId(seq)
    case 'GB': return generateGBId(seq)
    case 'US': return generateUSId(seq)
    default: return generateZAId(seq, age || 40, gender)
  }
}

// ==================== ADVISOR DEFINITIONS BY JURISDICTION ====================

const advisorsByJurisdiction: Record<string, string[]> = {
  ZA: ['Johan Botha', 'Sarah Mostert', 'Pieter Naudé', 'Linda van Wyk', 'David Greenberg'],
  AU: ['James Mitchell', 'Sarah Thompson', "Michael O'Brien", 'Emily Anderson', 'Thomas Murphy'],
  CA: ['Pierre Tremblay', 'Marie Bouchard', 'James MacDonald', 'Sophie Gagnon', 'Robert Singh'],
  GB: ['William Smith', 'Elizabeth Jones', 'Thomas Williams', 'Victoria Brown', 'James Taylor'],
  US: ['Michael Johnson', 'Jennifer Williams', 'Robert Brown', 'Maria Garcia', 'William Davis'],
}

// Orphan advisors to reassign to ZA advisors
const orphanAdvisors = ['Christo van Zyl', 'Dale Harding', 'Emile Wegner', 'Ihan Nel']

// Map advisor name to jurisdiction
function getJurisdictionForAdvisor(advisorName: string): string {
  for (const [jurisdiction, advisors] of Object.entries(advisorsByJurisdiction)) {
    if (advisors.includes(advisorName)) return jurisdiction
  }
  return 'ZA' // default
}

// Map country_of_issue to jurisdiction code
function countryToJurisdiction(country: string | null): string {
  if (!country) return 'ZA'
  const map: Record<string, string> = {
    'South Africa': 'ZA',
    'Australia': 'AU',
    'Canada': 'CA',
    'United Kingdom': 'GB',
    'United States': 'US',
  }
  return map[country] || 'ZA'
}

// ==================== STATIC DEMO CLIENTS ====================

const demoClients: DemoClient[] = [
  // ===== SOUTH AFRICA (ZA) =====
  // Johan Botha's clients (JB)
  { first_name: 'NG Kerk Sinode', surname: 'Oos-Kaapland', advisor: 'Johan Botha', nationality: 'South African', language: 'Afrikaans', client_type: 'business', age: null, gender: null, title: '', email: 'admin@ngksinode.org.za', cell_number: '+27 82 100 1001', work_number: '+27 41 555 1001', home_number: null, occupation: 'Religious Organization', employer: null, industry: 'Religious', id_number: '9900000001001', tax_number: '9000000001', country_of_issue: 'South Africa', tax_resident_country: 'South Africa', preferred_contact: 'Email', initials: 'NGK' },
  { first_name: 'Marthinus', surname: 'Van Niekerk', advisor: 'Johan Botha', nationality: 'South African', language: 'Afrikaans', client_type: 'individual', age: 55, gender: 'Male', title: 'Mr', email: 'marthinus.vanniekerk@gmail.com', cell_number: '+27 82 123 4567', work_number: '+27 11 555 1234', home_number: '+27 21 555 9876', occupation: 'Civil Engineer', employer: 'Murray & Roberts', industry: 'Construction', id_number: '6908155012081', tax_number: '1234567890', country_of_issue: 'South Africa', tax_resident_country: 'South Africa', preferred_contact: 'Cell', initials: 'MVN' },
  { first_name: 'Isabella', surname: 'Venter', advisor: 'Johan Botha', nationality: 'South African', language: 'Afrikaans', client_type: 'individual', age: 48, gender: 'Female', title: 'Mrs', email: 'isabella.venter@outlook.com', cell_number: '+27 83 234 5678', work_number: '+27 21 555 2345', home_number: null, occupation: 'Marketing Director', employer: 'Woolworths Holdings', industry: 'Retail', id_number: '7604120045082', tax_number: '2345678901', country_of_issue: 'South Africa', tax_resident_country: 'South Africa', preferred_contact: 'Cell', initials: 'IV' },
  { first_name: 'Andre Thomas', surname: 'Coetzer', advisor: 'Johan Botha', nationality: 'South African', language: 'English', client_type: 'individual', age: 42, gender: 'Male', title: 'Mr', email: 'andre.coetzer@gmail.com', cell_number: '+27 84 345 6789', work_number: '+27 11 555 3456', home_number: null, occupation: 'Investment Banker', employer: 'FirstRand Bank', industry: 'Financial Services', id_number: '8203155078085', tax_number: '3456789012', country_of_issue: 'South Africa', tax_resident_country: 'South Africa', preferred_contact: 'Email', initials: 'ATC' },
  { first_name: 'Esther Amanda', surname: 'Nieman', advisor: 'Johan Botha', nationality: 'South African', language: 'Afrikaans', client_type: 'individual', age: 74, gender: 'Female', title: 'Mrs', email: 'esther.nieman@vodamail.co.za', cell_number: '+27 82 456 7890', work_number: null, home_number: '+27 21 555 4567', occupation: 'Retired Teacher', employer: null, industry: 'Education', id_number: '5001120098084', tax_number: '4567890123', country_of_issue: 'South Africa', tax_resident_country: 'South Africa', preferred_contact: 'Home', initials: 'EAN' },
  { first_name: 'Petrus Jacobus', surname: 'Botha', advisor: 'Johan Botha', nationality: 'South African', language: 'Afrikaans', client_type: 'individual', age: 58, gender: 'Male', title: 'Mr', email: 'pj.botha@telkomsa.net', cell_number: '+27 83 567 8901', work_number: null, home_number: '+27 51 555 5678', occupation: 'Farmer', employer: 'Self-employed', industry: 'Agriculture', id_number: '6607155015083', tax_number: '5678901234', country_of_issue: 'South Africa', tax_resident_country: 'South Africa', preferred_contact: 'Cell', initials: 'PJB' },
  { first_name: 'Maria Susanna', surname: 'van Zyl', advisor: 'Johan Botha', nationality: 'South African', language: 'Afrikaans', client_type: 'individual', age: 65, gender: 'Female', title: 'Mrs', email: 'maria.vanzyl@gmail.com', cell_number: '+27 84 678 9012', work_number: null, home_number: '+27 21 555 6789', occupation: 'Retired Nurse', employer: null, industry: 'Healthcare', id_number: '5909120065086', tax_number: '6789012345', country_of_issue: 'South Africa', tax_resident_country: 'South Africa', preferred_contact: 'Cell', initials: 'MSvZ' },
  
  // Sarah Mostert's clients (SM)
  { first_name: 'Jean', surname: 'De Villiers', advisor: 'Sarah Mostert', nationality: 'South African', language: 'Afrikaans', client_type: 'individual', age: 52, gender: 'Male', title: 'Dr', email: 'jean.devilliers@discovery.co.za', cell_number: '+27 82 789 0123', work_number: '+27 21 555 7890', home_number: null, occupation: 'Medical Doctor', employer: 'Netcare', industry: 'Healthcare', id_number: '7205155023087', tax_number: '7890123456', country_of_issue: 'South Africa', tax_resident_country: 'South Africa', preferred_contact: 'Email', initials: 'JDV' },
  { first_name: 'Francois', surname: 'Joubert', advisor: 'Sarah Mostert', nationality: 'South African', language: 'Afrikaans', client_type: 'individual', age: 45, gender: 'Male', title: 'Mr', email: 'francois.joubert@gmail.com', cell_number: '+27 83 890 1234', work_number: '+27 11 555 8901', home_number: null, occupation: 'Architect', employer: 'Self-employed', industry: 'Architecture', id_number: '7908155032089', tax_number: '8901234567', country_of_issue: 'South Africa', tax_resident_country: 'South Africa', preferred_contact: 'Cell', initials: 'FJ' },
  { first_name: 'Chanelle', surname: 'Steyn', advisor: 'Sarah Mostert', nationality: 'South African', language: 'Afrikaans', client_type: 'individual', age: 38, gender: 'Female', title: 'Ms', email: 'chanelle.steyn@icloud.com', cell_number: '+27 84 901 2345', work_number: '+27 11 555 9012', home_number: null, occupation: 'HR Manager', employer: 'Discovery Limited', industry: 'Financial Services', id_number: '8603120041080', tax_number: '9012345678', country_of_issue: 'South Africa', tax_resident_country: 'South Africa', preferred_contact: 'Cell', initials: 'CS' },
  { first_name: 'Elsie Sophia', surname: 'Lourens', advisor: 'Sarah Mostert', nationality: 'South African', language: 'Afrikaans', client_type: 'individual', age: 71, gender: 'Female', title: 'Mrs', email: 'elsie.lourens@mweb.co.za', cell_number: '+27 82 012 3456', work_number: null, home_number: '+27 21 555 0123', occupation: 'Retired', employer: null, industry: 'Retired', id_number: '5307120076088', tax_number: '0123456789', country_of_issue: 'South Africa', tax_resident_country: 'South Africa', preferred_contact: 'Home', initials: 'ESL' },
  { first_name: 'Melia Nocwaka', surname: 'Malgas', advisor: 'Sarah Mostert', nationality: 'South African', language: 'Xhosa', client_type: 'individual', age: 52, gender: 'Female', title: 'Mrs', email: 'melia.malgas@gmail.com', cell_number: '+27 73 123 4567', work_number: '+27 41 555 1234', home_number: null, occupation: 'School Principal', employer: 'Eastern Cape DoE', industry: 'Education', id_number: '7206120055089', tax_number: '1234509876', country_of_issue: 'South Africa', tax_resident_country: 'South Africa', preferred_contact: 'Cell', initials: 'MNM' },
  { first_name: 'Hendrik Willem', surname: 'Venter', advisor: 'Sarah Mostert', nationality: 'South African', language: 'Afrikaans', client_type: 'individual', age: 48, gender: 'Male', title: 'Mr', email: 'hendrik.venter@absa.co.za', cell_number: '+27 82 234 5678', work_number: '+27 11 555 2345', home_number: null, occupation: 'Bank Manager', employer: 'Absa Bank', industry: 'Financial Services', id_number: '7604155018082', tax_number: '2345098765', country_of_issue: 'South Africa', tax_resident_country: 'South Africa', preferred_contact: 'Email', initials: 'HWV' },
  { first_name: 'Anna Elizabeth', surname: 'Joubert', advisor: 'Sarah Mostert', nationality: 'South African', language: 'Afrikaans', client_type: 'individual', age: 63, gender: 'Female', title: 'Mrs', email: 'anna.joubert@telkomsa.net', cell_number: '+27 83 345 6789', work_number: null, home_number: '+27 21 555 3456', occupation: 'Retired Accountant', employer: null, industry: 'Accounting', id_number: '6108120067081', tax_number: '3450987654', country_of_issue: 'South Africa', tax_resident_country: 'South Africa', preferred_contact: 'Cell', initials: 'AEJ' },
  
  // Pieter Naudé's clients (PN)
  { first_name: 'Rudolph', surname: 'Louw', advisor: 'Pieter Naudé', nationality: 'South African', language: 'Afrikaans', client_type: 'individual', age: 60, gender: 'Male', title: 'Mr', email: 'rudolph.louw@gmail.com', cell_number: '+27 82 456 7891', work_number: null, home_number: '+27 21 555 4567', occupation: 'Wine Estate Owner', employer: 'Self-employed', industry: 'Agriculture', id_number: '6409155025084', tax_number: '4560987654', country_of_issue: 'South Africa', tax_resident_country: 'South Africa', preferred_contact: 'Cell', initials: 'RL' },
  { first_name: 'Werner', surname: 'Le Roux', advisor: 'Pieter Naudé', nationality: 'South African', language: 'Afrikaans', client_type: 'individual', age: 47, gender: 'Male', title: 'Mr', email: 'werner.leroux@psg.co.za', cell_number: '+27 83 567 8912', work_number: '+27 21 555 5678', home_number: null, occupation: 'Financial Advisor', employer: 'PSG Wealth', industry: 'Financial Services', id_number: '7711155034086', tax_number: '5670987654', country_of_issue: 'South Africa', tax_resident_country: 'South Africa', preferred_contact: 'Email', initials: 'WLR' },
  { first_name: 'Annika', surname: 'Marais', advisor: 'Pieter Naudé', nationality: 'South African', language: 'Afrikaans', client_type: 'individual', age: 35, gender: 'Female', title: 'Ms', email: 'annika.marais@outlook.com', cell_number: '+27 84 678 9123', work_number: '+27 21 555 6789', home_number: null, occupation: 'Software Developer', employer: 'Takealot', industry: 'Technology', id_number: '8909120043088', tax_number: '6780987654', country_of_issue: 'South Africa', tax_resident_country: 'South Africa', preferred_contact: 'Cell', initials: 'AM' },
  { first_name: 'Samuel', surname: 'de Jager', advisor: 'Pieter Naudé', nationality: 'South African', language: 'Afrikaans', client_type: 'individual', age: 29, gender: 'Male', title: 'Mr', email: 'samuel.dejager@gmail.com', cell_number: '+27 76 789 0234', work_number: '+27 21 555 7890', home_number: null, occupation: 'Data Scientist', employer: 'Naspers', industry: 'Technology', id_number: '9503155052085', tax_number: '7890987654', country_of_issue: 'South Africa', tax_resident_country: 'South Africa', preferred_contact: 'Cell', initials: 'SdJ' },
  { first_name: 'Denise', surname: 'Thiart', advisor: 'Pieter Naudé', nationality: 'South African', language: 'Afrikaans', client_type: 'individual', age: 44, gender: 'Female', title: 'Mrs', email: 'denise.thiart@yahoo.com', cell_number: '+27 82 890 1345', work_number: '+27 21 555 8901', home_number: null, occupation: 'Attorney', employer: 'Webber Wentzel', industry: 'Legal', id_number: '8004120061087', tax_number: '8900987654', country_of_issue: 'South Africa', tax_resident_country: 'South Africa', preferred_contact: 'Cell', initials: 'DT' },
  { first_name: 'Gideon Francois', surname: 'Steyn', advisor: 'Pieter Naudé', nationality: 'South African', language: 'Afrikaans', client_type: 'individual', age: 56, gender: 'Male', title: 'Mr', email: 'gideon.steyn@sasol.com', cell_number: '+27 83 901 2456', work_number: '+27 17 555 9012', home_number: null, occupation: 'Chemical Engineer', employer: 'Sasol', industry: 'Energy', id_number: '6812155029083', tax_number: '9010987654', country_of_issue: 'South Africa', tax_resident_country: 'South Africa', preferred_contact: 'Email', initials: 'GFS' },
  { first_name: 'Catharina Maria', surname: 'le Roux', advisor: 'Pieter Naudé', nationality: 'South African', language: 'Afrikaans', client_type: 'individual', age: 68, gender: 'Female', title: 'Mrs', email: 'catharina.leroux@mweb.co.za', cell_number: '+27 84 012 3567', work_number: null, home_number: '+27 21 555 0123', occupation: 'Retired Teacher', employer: null, industry: 'Education', id_number: '5605120072080', tax_number: '0120987654', country_of_issue: 'South Africa', tax_resident_country: 'South Africa', preferred_contact: 'Home', initials: 'CMlR' },
  
  // Linda van Wyk's clients (LV)
  { first_name: 'Daan', surname: 'Van Der Sijde', advisor: 'Linda van Wyk', nationality: 'South African', language: 'Afrikaans', client_type: 'individual', age: 53, gender: 'Male', title: 'Mr', email: 'daan.vandersijde@gmail.com', cell_number: '+27 82 123 4678', work_number: '+27 11 555 1234', home_number: null, occupation: 'Mining Executive', employer: 'Anglo American', industry: 'Mining', id_number: '7103155038086', tax_number: '1230876543', country_of_issue: 'South Africa', tax_resident_country: 'South Africa', preferred_contact: 'Cell', initials: 'DVdS' },
  { first_name: 'Johannes', surname: 'Pretorius', advisor: 'Linda van Wyk', nationality: 'South African', language: 'Afrikaans', client_type: 'individual', age: 61, gender: 'Male', title: 'Mr', email: 'johannes.pretorius@sanlam.co.za', cell_number: '+27 83 234 5789', work_number: '+27 21 555 2345', home_number: null, occupation: 'Insurance Executive', employer: 'Sanlam', industry: 'Insurance', id_number: '6307155047082', tax_number: '2340876543', country_of_issue: 'South Africa', tax_resident_country: 'South Africa', preferred_contact: 'Email', initials: 'JP' },
  { first_name: 'Lizelle', surname: 'Du Toit', advisor: 'Linda van Wyk', nationality: 'South African', language: 'Afrikaans', client_type: 'individual', age: 42, gender: 'Female', title: 'Mrs', email: 'lizelle.dutoit@outlook.com', cell_number: '+27 84 345 6890', work_number: '+27 21 555 3456', home_number: null, occupation: 'Pharmacist', employer: 'Clicks Group', industry: 'Healthcare', id_number: '8206120056081', tax_number: '3450876543', country_of_issue: 'South Africa', tax_resident_country: 'South Africa', preferred_contact: 'Cell', initials: 'LDT' },
  { first_name: 'Elana', surname: 'Wasmuth', advisor: 'Linda van Wyk', nationality: 'South African', language: 'Afrikaans', client_type: 'individual', age: 38, gender: 'Female', title: 'Ms', email: 'elana.wasmuth@gmail.com', cell_number: '+27 72 456 7901', work_number: '+27 21 555 4567', home_number: null, occupation: 'Graphic Designer', employer: 'Self-employed', industry: 'Creative', id_number: '8603120068089', tax_number: '4560876543', country_of_issue: 'South Africa', tax_resident_country: 'South Africa', preferred_contact: 'Cell', initials: 'EW' },
  { first_name: 'Elizabeth', surname: 'Saunders', advisor: 'Linda van Wyk', nationality: 'South African', language: 'English', client_type: 'individual', age: 55, gender: 'Female', title: 'Mrs', email: 'elizabeth.saunders@nedbank.co.za', cell_number: '+27 82 567 8012', work_number: '+27 11 555 5678', home_number: null, occupation: 'Private Banker', employer: 'Nedbank', industry: 'Financial Services', id_number: '6909120079083', tax_number: '5670876543', country_of_issue: 'South Africa', tax_resident_country: 'South Africa', preferred_contact: 'Email', initials: 'ES' },
  { first_name: 'Barend Johannes', surname: 'Marais', advisor: 'Linda van Wyk', nationality: 'South African', language: 'Afrikaans', client_type: 'individual', age: 72, gender: 'Male', title: 'Mr', email: 'barend.marais@telkomsa.net', cell_number: '+27 83 678 9123', work_number: null, home_number: '+27 21 555 6789', occupation: 'Retired Judge', employer: null, industry: 'Legal', id_number: '5205155083085', tax_number: '6780876543', country_of_issue: 'South Africa', tax_resident_country: 'South Africa', preferred_contact: 'Home', initials: 'BJM' },
  { first_name: 'Susanna Petronella', surname: 'du Toit', advisor: 'Linda van Wyk', nationality: 'South African', language: 'Afrikaans', client_type: 'individual', age: 49, gender: 'Female', title: 'Mrs', email: 'susanna.dutoit@gmail.com', cell_number: '+27 84 789 0234', work_number: '+27 21 555 7890', home_number: null, occupation: 'Veterinarian', employer: 'Self-employed', industry: 'Veterinary', id_number: '7508120092087', tax_number: '7890876543', country_of_issue: 'South Africa', tax_resident_country: 'South Africa', preferred_contact: 'Cell', initials: 'SPdT' },
  
  // David Greenberg's clients (DG)
  { first_name: 'Philippus', surname: 'Koon', advisor: 'David Greenberg', nationality: 'South African', language: 'Afrikaans', client_type: 'individual', age: 58, gender: 'Male', title: 'Mr', email: 'philippus.koon@gmail.com', cell_number: '+27 82 890 1345', work_number: null, home_number: '+27 51 555 8901', occupation: 'Cattle Farmer', employer: 'Self-employed', industry: 'Agriculture', id_number: '6604155091084', tax_number: '8900765432', country_of_issue: 'South Africa', tax_resident_country: 'South Africa', preferred_contact: 'Cell', initials: 'PK' },
  { first_name: 'Hendrik', surname: 'Coetzee', advisor: 'David Greenberg', nationality: 'South African', language: 'Afrikaans', client_type: 'individual', age: 64, gender: 'Male', title: 'Mr', email: 'hendrik.coetzee@oldmutual.co.za', cell_number: '+27 83 901 2456', work_number: '+27 21 555 9012', home_number: null, occupation: 'Actuary', employer: 'Old Mutual', industry: 'Insurance', id_number: '6011155102081', tax_number: '9010765432', country_of_issue: 'South Africa', tax_resident_country: 'South Africa', preferred_contact: 'Email', initials: 'HC' },
  { first_name: 'Marlene', surname: 'Jacobs', advisor: 'David Greenberg', nationality: 'South African', language: 'Afrikaans', client_type: 'individual', age: 51, gender: 'Female', title: 'Mrs', email: 'marlene.jacobs@outlook.com', cell_number: '+27 84 012 3567', work_number: '+27 11 555 0123', home_number: null, occupation: 'Corporate Lawyer', employer: 'ENSafrica', industry: 'Legal', id_number: '7307120111086', tax_number: '0120765432', country_of_issue: 'South Africa', tax_resident_country: 'South Africa', preferred_contact: 'Cell', initials: 'MJ' },
  { first_name: 'Angeline Loraine', surname: 'Mostert', advisor: 'David Greenberg', nationality: 'South African', language: 'Afrikaans', client_type: 'individual', age: 67, gender: 'Female', title: 'Mrs', email: 'angeline.mostert@mweb.co.za', cell_number: '+27 82 123 4789', work_number: null, home_number: '+27 21 555 1234', occupation: 'Retired Psychologist', employer: null, industry: 'Healthcare', id_number: '5709120120082', tax_number: '1230765432', country_of_issue: 'South Africa', tax_resident_country: 'South Africa', preferred_contact: 'Home', initials: 'ALM' },
  { first_name: 'Zonwabele Harry', surname: 'Molefe', advisor: 'David Greenberg', nationality: 'South African', language: 'Zulu', client_type: 'individual', age: 45, gender: 'Male', title: 'Mr', email: 'zonwabele.molefe@standardbank.co.za', cell_number: '+27 73 234 5890', work_number: '+27 11 555 2345', home_number: null, occupation: 'Corporate Executive', employer: 'Standard Bank', industry: 'Financial Services', id_number: '7905155129088', tax_number: '2340765432', country_of_issue: 'South Africa', tax_resident_country: 'South Africa', preferred_contact: 'Email', initials: 'ZHM' },
  { first_name: 'Willem Adriaan', surname: 'Coetzee', advisor: 'David Greenberg', nationality: 'South African', language: 'Afrikaans', client_type: 'individual', age: 59, gender: 'Male', title: 'Mr', email: 'willem.coetzee@investec.co.za', cell_number: '+27 82 345 6901', work_number: '+27 11 555 3456', home_number: null, occupation: 'Portfolio Manager', employer: 'Investec', industry: 'Financial Services', id_number: '6508155138085', tax_number: '3450765432', country_of_issue: 'South Africa', tax_resident_country: 'South Africa', preferred_contact: 'Email', initials: 'WAC' },
  { first_name: 'Johanna Cornelia', surname: 'Jacobs', advisor: 'David Greenberg', nationality: 'South African', language: 'Afrikaans', client_type: 'individual', age: 76, gender: 'Female', title: 'Mrs', email: 'johanna.jacobs@telkomsa.net', cell_number: '+27 83 456 7012', work_number: null, home_number: '+27 21 555 4567', occupation: 'Retired', employer: null, industry: 'Retired', id_number: '4804120147084', tax_number: '4560765432', country_of_issue: 'South Africa', tax_resident_country: 'South Africa', preferred_contact: 'Home', initials: 'JCJ' },
  // ZA Trust client
  { first_name: 'Van Niekerk Family', surname: 'Trust', advisor: 'Johan Botha', nationality: 'South African', language: 'Afrikaans', client_type: 'trust', age: null, gender: null, title: '', email: 'admin@vanniekerk-trust.co.za', cell_number: '+27 82 700 1001', work_number: '+27 21 700 1001', home_number: null, occupation: 'Trust', employer: null, industry: 'Estate Planning', id_number: '9900000007001', tax_number: '7000000001', country_of_issue: 'South Africa', tax_resident_country: 'South Africa', preferred_contact: 'Email', initials: 'VNT' },

  // ===== AUSTRALIA (AU) =====
  // James Mitchell's clients (JM)
  { first_name: 'Melbourne Grammar School', surname: 'Foundation', advisor: 'James Mitchell', nationality: 'Australian', language: 'English', client_type: 'business', age: null, gender: null, title: '', email: 'foundation@mgs.edu.au', cell_number: '+61 4 0000 1001', work_number: '+61 3 9865 7555', home_number: null, occupation: 'Educational Foundation', employer: null, industry: 'Education', id_number: '100000001', tax_number: '12345678901', country_of_issue: 'Australia', tax_resident_country: 'Australia', preferred_contact: 'Email', initials: 'MGS' },
  { first_name: 'Konstantinos', surname: 'Papadopoulos', advisor: 'James Mitchell', nationality: 'Australian', language: 'English', client_type: 'individual', age: 52, gender: 'Male', title: 'Mr', email: 'kon.papadopoulos@gmail.com', cell_number: '+61 4 1234 5678', work_number: '+61 3 9555 1234', home_number: null, occupation: 'Restaurant Owner', employer: 'Self-employed', industry: 'Hospitality', id_number: '100000008', tax_number: '23456789012', country_of_issue: 'Australia', tax_resident_country: 'Australia', preferred_contact: 'Cell', initials: 'KP' },
  { first_name: 'David', surname: 'Nguyen', advisor: 'James Mitchell', nationality: 'Australian', language: 'English', client_type: 'individual', age: 45, gender: 'Male', title: 'Mr', email: 'david.nguyen@outlook.com', cell_number: '+61 4 2345 6789', work_number: '+61 3 9555 2345', home_number: null, occupation: 'IT Consultant', employer: 'Deloitte', industry: 'Consulting', id_number: '100000015', tax_number: '34567890123', country_of_issue: 'Australia', tax_resident_country: 'Australia', preferred_contact: 'Email', initials: 'DN' },
  { first_name: 'William James', surname: 'Mitchell', advisor: 'James Mitchell', nationality: 'Australian', language: 'English', client_type: 'individual', age: 68, gender: 'Male', title: 'Mr', email: 'william.mitchell@bigpond.com', cell_number: '+61 4 3456 7890', work_number: null, home_number: '+61 3 9555 3456', occupation: 'Retired Executive', employer: null, industry: 'Mining', id_number: '100000022', tax_number: '45678901234', country_of_issue: 'Australia', tax_resident_country: 'Australia', preferred_contact: 'Home', initials: 'WJM' },
  { first_name: 'Charlotte Grace', surname: 'Wilson', advisor: 'James Mitchell', nationality: 'Australian', language: 'English', client_type: 'individual', age: 55, gender: 'Female', title: 'Mrs', email: 'charlotte.wilson@gmail.com', cell_number: '+61 4 4567 8901', work_number: '+61 3 9555 4567', home_number: null, occupation: 'Barrister', employer: 'Victorian Bar', industry: 'Legal', id_number: '100000029', tax_number: '56789012345', country_of_issue: 'Australia', tax_resident_country: 'Australia', preferred_contact: 'Cell', initials: 'CGW' },
  { first_name: 'Mai Linh', surname: 'Nguyen', advisor: 'James Mitchell', nationality: 'Australian', language: 'English', client_type: 'individual', age: 42, gender: 'Female', title: 'Dr', email: 'mai.nguyen@medical.com.au', cell_number: '+61 4 5678 9012', work_number: '+61 3 9555 5678', home_number: null, occupation: 'Surgeon', employer: 'Royal Melbourne Hospital', industry: 'Healthcare', id_number: '100000036', tax_number: '67890123456', country_of_issue: 'Australia', tax_resident_country: 'Australia', preferred_contact: 'Email', initials: 'MLN' },
  { first_name: 'Oliver James', surname: 'Taylor', advisor: 'James Mitchell', nationality: 'Australian', language: 'English', client_type: 'individual', age: 38, gender: 'Male', title: 'Mr', email: 'oliver.taylor@atlassian.com', cell_number: '+61 4 6789 0123', work_number: '+61 2 9555 6789', home_number: null, occupation: 'Software Engineer', employer: 'Atlassian', industry: 'Technology', id_number: '100000043', tax_number: '78901234567', country_of_issue: 'Australia', tax_resident_country: 'Australia', preferred_contact: 'Cell', initials: 'OJT' },
  
  // Sarah Thompson's clients (ST)
  { first_name: 'Michael', surname: "O'Connor", advisor: 'Sarah Thompson', nationality: 'Australian', language: 'English', client_type: 'individual', age: 58, gender: 'Male', title: 'Mr', email: 'michael.oconnor@gmail.com', cell_number: '+61 4 7890 1234', work_number: null, home_number: '+61 3 9555 7890', occupation: 'Building Contractor', employer: 'Self-employed', industry: 'Construction', id_number: '100000050', tax_number: '89012345678', country_of_issue: 'Australia', tax_resident_country: 'Australia', preferred_contact: 'Cell', initials: "MO'C" },
  { first_name: 'Giuseppe', surname: 'Romano', advisor: 'Sarah Thompson', nationality: 'Australian', language: 'English', client_type: 'individual', age: 62, gender: 'Male', title: 'Mr', email: 'giuseppe.romano@outlook.com', cell_number: '+61 4 8901 2345', work_number: '+61 3 9555 8901', home_number: null, occupation: 'Importer', employer: 'Romano Imports', industry: 'Trade', id_number: '100000057', tax_number: '90123456789', country_of_issue: 'Australia', tax_resident_country: 'Australia', preferred_contact: 'Cell', initials: 'GR' },
  { first_name: 'William', surname: 'Chen', advisor: 'Sarah Thompson', nationality: 'Australian', language: 'English', client_type: 'individual', age: 47, gender: 'Male', title: 'Mr', email: 'william.chen@pwc.com', cell_number: '+61 4 9012 3456', work_number: '+61 3 9555 9012', home_number: null, occupation: 'Partner', employer: 'PwC Australia', industry: 'Consulting', id_number: '100000064', tax_number: '01234567890', country_of_issue: 'Australia', tax_resident_country: 'Australia', preferred_contact: 'Email', initials: 'WC' },
  { first_name: 'Sarah Elizabeth', surname: 'Thompson', advisor: 'Sarah Thompson', nationality: 'Australian', language: 'English', client_type: 'individual', age: 71, gender: 'Female', title: 'Mrs', email: 'sarah.thompson@bigpond.com', cell_number: '+61 4 0123 4567', work_number: null, home_number: '+61 3 9555 0123', occupation: 'Retired Nurse', employer: null, industry: 'Healthcare', id_number: '100000071', tax_number: '12340567890', country_of_issue: 'Australia', tax_resident_country: 'Australia', preferred_contact: 'Home', initials: 'SET' },
  { first_name: 'Thomas Edward', surname: 'Murphy', advisor: 'Sarah Thompson', nationality: 'Australian', language: 'English', client_type: 'individual', age: 52, gender: 'Male', title: 'Mr', email: 'tom.murphy@bhp.com', cell_number: '+61 4 1234 5679', work_number: '+61 3 9555 1235', home_number: null, occupation: 'Mining Engineer', employer: 'BHP', industry: 'Mining', id_number: '100000078', tax_number: '23450678901', country_of_issue: 'Australia', tax_resident_country: 'Australia', preferred_contact: 'Email', initials: 'TEM' },
  { first_name: 'Sophia', surname: 'Chen', advisor: 'Sarah Thompson', nationality: 'Australian', language: 'English', client_type: 'individual', age: 34, gender: 'Female', title: 'Ms', email: 'sophia.chen@gmail.com', cell_number: '+61 4 2345 6780', work_number: '+61 3 9555 2346', home_number: null, occupation: 'Product Manager', employer: 'Canva', industry: 'Technology', id_number: '100000085', tax_number: '34560789012', country_of_issue: 'Australia', tax_resident_country: 'Australia', preferred_contact: 'Cell', initials: 'SC' },
  { first_name: 'Emma Louise', surname: 'Brown', advisor: 'Sarah Thompson', nationality: 'Australian', language: 'English', client_type: 'individual', age: 45, gender: 'Female', title: 'Mrs', email: 'emma.brown@westpac.com.au', cell_number: '+61 4 3456 7891', work_number: '+61 2 9555 3457', home_number: null, occupation: 'Wealth Manager', employer: 'Westpac', industry: 'Financial Services', id_number: '100000092', tax_number: '45670890123', country_of_issue: 'Australia', tax_resident_country: 'Australia', preferred_contact: 'Email', initials: 'ELB' },
  
  // Michael O'Brien's clients (MO)
  { first_name: 'Sarah', surname: 'Thompson', advisor: "Michael O'Brien", nationality: 'Australian', language: 'English', client_type: 'individual', age: 49, gender: 'Female', title: 'Ms', email: 'sarah.thompson2@gmail.com', cell_number: '+61 4 4567 8902', work_number: '+61 3 9555 4568', home_number: null, occupation: 'Real Estate Agent', employer: 'Ray White', industry: 'Real Estate', id_number: '100000099', tax_number: '56780901234', country_of_issue: 'Australia', tax_resident_country: 'Australia', preferred_contact: 'Cell', initials: 'ST' },
  { first_name: 'Brendan', surname: 'Kelly', advisor: "Michael O'Brien", nationality: 'Australian', language: 'English', client_type: 'individual', age: 55, gender: 'Male', title: 'Mr', email: 'brendan.kelly@outlook.com', cell_number: '+61 4 5678 9013', work_number: null, home_number: '+61 3 9555 5679', occupation: 'Pub Owner', employer: 'Self-employed', industry: 'Hospitality', id_number: '100000106', tax_number: '67890012345', country_of_issue: 'Australia', tax_resident_country: 'Australia', preferred_contact: 'Cell', initials: 'BK' },
  { first_name: 'Rajesh', surname: 'Patel', advisor: "Michael O'Brien", nationality: 'Australian', language: 'English', client_type: 'individual', age: 43, gender: 'Male', title: 'Dr', email: 'rajesh.patel@gmail.com', cell_number: '+61 4 6789 0124', work_number: '+61 3 9555 6790', home_number: null, occupation: 'Cardiologist', employer: 'Alfred Hospital', industry: 'Healthcare', id_number: '100000113', tax_number: '78900123456', country_of_issue: 'Australia', tax_resident_country: 'Australia', preferred_contact: 'Email', initials: 'RP' },
  { first_name: 'James Robert', surname: "O'Brien", advisor: "Michael O'Brien", nationality: 'Australian', language: 'English', client_type: 'individual', age: 74, gender: 'Male', title: 'Mr', email: 'james.obrien@bigpond.com', cell_number: '+61 4 7890 1235', work_number: null, home_number: '+61 3 9555 7891', occupation: 'Retired Police Officer', employer: null, industry: 'Government', id_number: '100000120', tax_number: '89010234567', country_of_issue: 'Australia', tax_resident_country: 'Australia', preferred_contact: 'Home', initials: "JRO'B" },
  { first_name: 'Olivia Jane', surname: 'Campbell', advisor: "Michael O'Brien", nationality: 'Australian', language: 'English', client_type: 'individual', age: 48, gender: 'Female', title: 'Mrs', email: 'olivia.campbell@anz.com', cell_number: '+61 4 8901 2346', work_number: '+61 3 9555 8902', home_number: null, occupation: 'Bank Manager', employer: 'ANZ Bank', industry: 'Financial Services', id_number: '100000127', tax_number: '90120345678', country_of_issue: 'Australia', tax_resident_country: 'Australia', preferred_contact: 'Email', initials: 'OJC' },
  { first_name: 'Priya', surname: 'Patel', advisor: "Michael O'Brien", nationality: 'Australian', language: 'English', client_type: 'individual', age: 39, gender: 'Female', title: 'Ms', email: 'priya.patel@kpmg.com.au', cell_number: '+61 4 9012 3457', work_number: '+61 3 9555 9013', home_number: null, occupation: 'Tax Consultant', employer: 'KPMG', industry: 'Consulting', id_number: '100000134', tax_number: '01230456789', country_of_issue: 'Australia', tax_resident_country: 'Australia', preferred_contact: 'Cell', initials: 'PP' },
  { first_name: 'Alexander John', surname: 'McDonald', advisor: "Michael O'Brien", nationality: 'Australian', language: 'English', client_type: 'individual', age: 61, gender: 'Male', title: 'Mr', email: 'alex.mcdonald@gmail.com', cell_number: '+61 4 0123 4568', work_number: '+61 3 9555 0124', home_number: null, occupation: 'Property Developer', employer: 'McDonald Properties', industry: 'Real Estate', id_number: '100000141', tax_number: '12340567891', country_of_issue: 'Australia', tax_resident_country: 'Australia', preferred_contact: 'Cell', initials: 'AJM' },
  
  // Emily Anderson's clients (EA)
  { first_name: 'David', surname: 'Williams', advisor: 'Emily Anderson', nationality: 'Australian', language: 'English', client_type: 'individual', age: 57, gender: 'Male', title: 'Mr', email: 'david.williams@rio.com', cell_number: '+61 4 1234 5680', work_number: '+61 8 9555 1236', home_number: null, occupation: 'Mining Executive', employer: 'Rio Tinto', industry: 'Mining', id_number: '100000148', tax_number: '23450678902', country_of_issue: 'Australia', tax_resident_country: 'Australia', preferred_contact: 'Email', initials: 'DW' },
  { first_name: 'Helena', surname: 'Stavros', advisor: 'Emily Anderson', nationality: 'Australian', language: 'English', client_type: 'individual', age: 51, gender: 'Female', title: 'Mrs', email: 'helena.stavros@outlook.com', cell_number: '+61 4 2345 6781', work_number: '+61 3 9555 2347', home_number: null, occupation: 'Event Planner', employer: 'Self-employed', industry: 'Events', id_number: '100000155', tax_number: '34560789013', country_of_issue: 'Australia', tax_resident_country: 'Australia', preferred_contact: 'Cell', initials: 'HS' },
  { first_name: 'Andrew', surname: 'Morrison', advisor: 'Emily Anderson', nationality: 'Australian', language: 'English', client_type: 'individual', age: 44, gender: 'Male', title: 'Mr', email: 'andrew.morrison@macquarie.com', cell_number: '+61 4 3456 7892', work_number: '+61 2 9555 3458', home_number: null, occupation: 'Investment Banker', employer: 'Macquarie Group', industry: 'Financial Services', id_number: '100000162', tax_number: '45670890124', country_of_issue: 'Australia', tax_resident_country: 'Australia', preferred_contact: 'Email', initials: 'AM' },
  { first_name: 'Emily Rose', surname: 'Anderson', advisor: 'Emily Anderson', nationality: 'Australian', language: 'English', client_type: 'individual', age: 66, gender: 'Female', title: 'Mrs', email: 'emily.anderson@bigpond.com', cell_number: '+61 4 4567 8903', work_number: null, home_number: '+61 3 9555 4569', occupation: 'Retired Teacher', employer: null, industry: 'Education', id_number: '100000169', tax_number: '56780901235', country_of_issue: 'Australia', tax_resident_country: 'Australia', preferred_contact: 'Home', initials: 'ERA' },
  { first_name: 'Henry William', surname: 'Scott', advisor: 'Emily Anderson', nationality: 'Australian', language: 'English', client_type: 'individual', age: 53, gender: 'Male', title: 'Mr', email: 'henry.scott@nab.com.au', cell_number: '+61 4 5678 9014', work_number: '+61 3 9555 5680', home_number: null, occupation: 'Chief Risk Officer', employer: 'NAB', industry: 'Financial Services', id_number: '100000176', tax_number: '67890012346', country_of_issue: 'Australia', tax_resident_country: 'Australia', preferred_contact: 'Email', initials: 'HWS' },
  { first_name: 'Isabella Grace', surname: 'Davis', advisor: 'Emily Anderson', nationality: 'Australian', language: 'English', client_type: 'individual', age: 37, gender: 'Female', title: 'Ms', email: 'isabella.davis@gmail.com', cell_number: '+61 4 6789 0125', work_number: '+61 3 9555 6791', home_number: null, occupation: 'Marketing Director', employer: 'Telstra', industry: 'Telecommunications', id_number: '100000183', tax_number: '78900123457', country_of_issue: 'Australia', tax_resident_country: 'Australia', preferred_contact: 'Cell', initials: 'IGD' },
  
  // Thomas Murphy's clients (TM)
  { first_name: 'Jennifer', surname: 'Brown', advisor: 'Thomas Murphy', nationality: 'Australian', language: 'English', client_type: 'individual', age: 48, gender: 'Female', title: 'Mrs', email: 'jennifer.brown@gmail.com', cell_number: '+61 4 7890 1236', work_number: '+61 3 9555 7892', home_number: null, occupation: 'University Professor', employer: 'Monash University', industry: 'Education', id_number: '100000190', tax_number: '89010234568', country_of_issue: 'Australia', tax_resident_country: 'Australia', preferred_contact: 'Email', initials: 'JB' },
  { first_name: 'Benjamin', surname: 'Lee', advisor: 'Thomas Murphy', nationality: 'Australian', language: 'English', client_type: 'individual', age: 41, gender: 'Male', title: 'Mr', email: 'benjamin.lee@google.com', cell_number: '+61 4 8901 2347', work_number: '+61 2 9555 8903', home_number: null, occupation: 'Software Engineer', employer: 'Google', industry: 'Technology', id_number: '100000197', tax_number: '90120345679', country_of_issue: 'Australia', tax_resident_country: 'Australia', preferred_contact: 'Cell', initials: 'BL' },
  { first_name: 'Catherine', surname: 'Walsh', advisor: 'Thomas Murphy', nationality: 'Australian', language: 'English', client_type: 'individual', age: 59, gender: 'Female', title: 'Mrs', email: 'catherine.walsh@outlook.com', cell_number: '+61 4 9012 3458', work_number: null, home_number: '+61 3 9555 9014', occupation: 'Artist', employer: 'Self-employed', industry: 'Arts', id_number: '100000204', tax_number: '01230456790', country_of_issue: 'Australia', tax_resident_country: 'Australia', preferred_contact: 'Cell', initials: 'CW' },
  { first_name: 'Michael Patrick', surname: 'Kelly', advisor: 'Thomas Murphy', nationality: 'Australian', language: 'English', client_type: 'individual', age: 72, gender: 'Male', title: 'Mr', email: 'michael.kelly@bigpond.com', cell_number: '+61 4 0123 4569', work_number: null, home_number: '+61 3 9555 0125', occupation: 'Retired Farmer', employer: null, industry: 'Agriculture', id_number: '100000211', tax_number: '12340567892', country_of_issue: 'Australia', tax_resident_country: 'Australia', preferred_contact: 'Home', initials: 'MPK' },
  { first_name: 'Sophie Anne', surname: 'Martin', advisor: 'Thomas Murphy', nationality: 'Australian', language: 'English', client_type: 'individual', age: 35, gender: 'Female', title: 'Ms', email: 'sophie.martin@sportsbet.com.au', cell_number: '+61 4 1234 5681', work_number: '+61 3 9555 1237', home_number: null, occupation: 'Digital Marketing Manager', employer: 'Sportsbet', industry: 'Gaming', id_number: '100000218', tax_number: '23450678903', country_of_issue: 'Australia', tax_resident_country: 'Australia', preferred_contact: 'Cell', initials: 'SAM' },
  // AU Trust client
  { first_name: 'Papadopoulos Family', surname: 'Trust', advisor: 'James Mitchell', nationality: 'Australian', language: 'English', client_type: 'trust', age: null, gender: null, title: '', email: 'admin@papadopoulos-trust.com.au', cell_number: '+61 4 7000 1001', work_number: '+61 3 7000 1001', home_number: null, occupation: 'Trust', employer: null, industry: 'Estate Planning', id_number: '100700001', tax_number: '70000000001', country_of_issue: 'Australia', tax_resident_country: 'Australia', preferred_contact: 'Email', initials: 'PFT' },

  // ===== CANADA (CA) =====
  // Pierre Tremblay's clients (PT)
  { first_name: 'Toronto General Hospital', surname: 'Foundation', advisor: 'Pierre Tremblay', nationality: 'Canadian', language: 'English', client_type: 'business', age: null, gender: null, title: '', email: 'foundation@tgh.ca', cell_number: '+1 416 100 1001', work_number: '+1 416 555 1001', home_number: null, occupation: 'Healthcare Foundation', employer: null, industry: 'Healthcare', id_number: '200000001', tax_number: '100000001', country_of_issue: 'Canada', tax_resident_country: 'Canada', preferred_contact: 'Email', initials: 'TGH' },
  { first_name: 'Jean-François', surname: 'Lavoie', advisor: 'Pierre Tremblay', nationality: 'Canadian', language: 'French', client_type: 'individual', age: 54, gender: 'Male', title: 'M.', email: 'jf.lavoie@videotron.ca', cell_number: '+1 514 123 4567', work_number: '+1 514 555 1234', home_number: null, occupation: 'Media Executive', employer: 'Québecor', industry: 'Media', id_number: '200000008', tax_number: '100000002', country_of_issue: 'Canada', tax_resident_country: 'Canada', preferred_contact: 'Cell', initials: 'JFL' },
  { first_name: 'Émilie', surname: 'Bergeron', advisor: 'Pierre Tremblay', nationality: 'Canadian', language: 'French', client_type: 'individual', age: 42, gender: 'Female', title: 'Mme', email: 'emilie.bergeron@desjardins.com', cell_number: '+1 514 234 5678', work_number: '+1 514 555 2345', home_number: null, occupation: 'Financial Analyst', employer: 'Desjardins', industry: 'Financial Services', id_number: '200000015', tax_number: '100000003', country_of_issue: 'Canada', tax_resident_country: 'Canada', preferred_contact: 'Email', initials: 'ÉB' },
  { first_name: 'Pierre', surname: 'Tremblay', advisor: 'Pierre Tremblay', nationality: 'Canadian', language: 'French', client_type: 'individual', age: 69, gender: 'Male', title: 'M.', email: 'pierre.tremblay@bell.ca', cell_number: '+1 514 345 6789', work_number: null, home_number: '+1 514 555 3456', occupation: 'Retired Professor', employer: null, industry: 'Education', id_number: '200000022', tax_number: '100000004', country_of_issue: 'Canada', tax_resident_country: 'Canada', preferred_contact: 'Home', initials: 'PT' },
  { first_name: 'Marie', surname: 'Tremblay', advisor: 'Pierre Tremblay', nationality: 'Canadian', language: 'French', client_type: 'individual', age: 67, gender: 'Female', title: 'Mme', email: 'marie.tremblay@gmail.com', cell_number: '+1 514 456 7890', work_number: null, home_number: '+1 514 555 4567', occupation: 'Retired Doctor', employer: null, industry: 'Healthcare', id_number: '200000029', tax_number: '100000005', country_of_issue: 'Canada', tax_resident_country: 'Canada', preferred_contact: 'Home', initials: 'MT' },
  { first_name: 'Louis Philippe', surname: 'Gagnon', advisor: 'Pierre Tremblay', nationality: 'Canadian', language: 'French', client_type: 'individual', age: 51, gender: 'Male', title: 'M.', email: 'lp.gagnon@bombardier.com', cell_number: '+1 514 567 8901', work_number: '+1 514 555 5678', home_number: null, occupation: 'Aerospace Engineer', employer: 'Bombardier', industry: 'Aerospace', id_number: '200000036', tax_number: '100000006', country_of_issue: 'Canada', tax_resident_country: 'Canada', preferred_contact: 'Email', initials: 'LPG' },
  { first_name: 'Isabelle Marie', surname: 'Côté', advisor: 'Pierre Tremblay', nationality: 'Canadian', language: 'French', client_type: 'individual', age: 44, gender: 'Female', title: 'Mme', email: 'isabelle.cote@hydroquebec.com', cell_number: '+1 514 678 9012', work_number: '+1 514 555 6789', home_number: null, occupation: 'Energy Executive', employer: 'Hydro-Québec', industry: 'Energy', id_number: '200000043', tax_number: '100000007', country_of_issue: 'Canada', tax_resident_country: 'Canada', preferred_contact: 'Cell', initials: 'IMC' },
  
  // Marie Bouchard's clients (MB)
  { first_name: 'David', surname: 'Wong', advisor: 'Marie Bouchard', nationality: 'Canadian', language: 'English', client_type: 'individual', age: 47, gender: 'Male', title: 'Mr', email: 'david.wong@shopify.com', cell_number: '+1 613 789 0123', work_number: '+1 613 555 7890', home_number: null, occupation: 'Software Architect', employer: 'Shopify', industry: 'Technology', id_number: '200000050', tax_number: '100000008', country_of_issue: 'Canada', tax_resident_country: 'Canada', preferred_contact: 'Email', initials: 'DW' },
  { first_name: 'Jennifer', surname: 'Kim', advisor: 'Marie Bouchard', nationality: 'Canadian', language: 'English', client_type: 'individual', age: 39, gender: 'Female', title: 'Ms', email: 'jennifer.kim@google.ca', cell_number: '+1 416 890 1234', work_number: '+1 416 555 8901', home_number: null, occupation: 'Data Scientist', employer: 'Google Canada', industry: 'Technology', id_number: '200000057', tax_number: '100000009', country_of_issue: 'Canada', tax_resident_country: 'Canada', preferred_contact: 'Cell', initials: 'JK' },
  { first_name: 'Sophie', surname: 'Bouchard', advisor: 'Marie Bouchard', nationality: 'Canadian', language: 'French', client_type: 'individual', age: 58, gender: 'Female', title: 'Mme', email: 'sophie.bouchard@outlook.com', cell_number: '+1 514 901 2345', work_number: '+1 514 555 9012', home_number: null, occupation: 'Interior Designer', employer: 'Self-employed', industry: 'Design', id_number: '200000064', tax_number: '100000010', country_of_issue: 'Canada', tax_resident_country: 'Canada', preferred_contact: 'Cell', initials: 'SB' },
  { first_name: 'Jacques', surname: 'Bouchard', advisor: 'Marie Bouchard', nationality: 'Canadian', language: 'French', client_type: 'individual', age: 71, gender: 'Male', title: 'M.', email: 'jacques.bouchard@bell.ca', cell_number: '+1 514 012 3456', work_number: null, home_number: '+1 514 555 0123', occupation: 'Retired Businessman', employer: null, industry: 'Retail', id_number: '200000071', tax_number: '100000011', country_of_issue: 'Canada', tax_resident_country: 'Canada', preferred_contact: 'Home', initials: 'JB' },
  { first_name: 'Catherine Anne', surname: 'Leblanc', advisor: 'Marie Bouchard', nationality: 'Canadian', language: 'French', client_type: 'individual', age: 46, gender: 'Female', title: 'Mme', email: 'catherine.leblanc@nbc.ca', cell_number: '+1 514 123 4568', work_number: '+1 514 555 1235', home_number: null, occupation: 'Portfolio Manager', employer: 'National Bank', industry: 'Financial Services', id_number: '200000078', tax_number: '100000012', country_of_issue: 'Canada', tax_resident_country: 'Canada', preferred_contact: 'Email', initials: 'CAL' },
  { first_name: 'Michael James', surname: 'Thompson', advisor: 'Marie Bouchard', nationality: 'Canadian', language: 'English', client_type: 'individual', age: 53, gender: 'Male', title: 'Mr', email: 'michael.thompson@rbc.com', cell_number: '+1 416 234 5679', work_number: '+1 416 555 2346', home_number: null, occupation: 'VP Commercial Banking', employer: 'RBC', industry: 'Financial Services', id_number: '200000085', tax_number: '100000013', country_of_issue: 'Canada', tax_resident_country: 'Canada', preferred_contact: 'Email', initials: 'MJT' },
  
  // James MacDonald's clients (JM)
  { first_name: 'Alexander', surname: 'Campbell', advisor: 'James MacDonald', nationality: 'Canadian', language: 'English', client_type: 'individual', age: 61, gender: 'Male', title: 'Mr', email: 'alex.campbell@suncor.com', cell_number: '+1 403 345 6780', work_number: '+1 403 555 3457', home_number: null, occupation: 'Energy Executive', employer: 'Suncor', industry: 'Energy', id_number: '200000092', tax_number: '100000014', country_of_issue: 'Canada', tax_resident_country: 'Canada', preferred_contact: 'Email', initials: 'AC' },
  { first_name: 'Kathleen', surname: "O'Brien", advisor: 'James MacDonald', nationality: 'Canadian', language: 'English', client_type: 'individual', age: 55, gender: 'Female', title: 'Mrs', email: 'kathleen.obrien@gmail.com', cell_number: '+1 416 456 7891', work_number: '+1 416 555 4568', home_number: null, occupation: 'Corporate Lawyer', employer: 'Blake Cassels', industry: 'Legal', id_number: '200000099', tax_number: '100000015', country_of_issue: 'Canada', tax_resident_country: 'Canada', preferred_contact: 'Cell', initials: "KO'B" },
  { first_name: 'Marie-Claire', surname: 'Roy', advisor: 'James MacDonald', nationality: 'Canadian', language: 'French', client_type: 'individual', age: 48, gender: 'Female', title: 'Mme', email: 'mc.roy@cirquedusoleil.com', cell_number: '+1 514 567 8902', work_number: '+1 514 555 5679', home_number: null, occupation: 'Creative Director', employer: 'Cirque du Soleil', industry: 'Entertainment', id_number: '200000106', tax_number: '100000016', country_of_issue: 'Canada', tax_resident_country: 'Canada', preferred_contact: 'Cell', initials: 'MCR' },
  { first_name: 'Angus', surname: 'MacDonald', advisor: 'James MacDonald', nationality: 'Canadian', language: 'English', client_type: 'individual', age: 73, gender: 'Male', title: 'Mr', email: 'angus.macdonald@shaw.ca', cell_number: '+1 604 678 9013', work_number: null, home_number: '+1 604 555 6790', occupation: 'Retired Fisherman', employer: null, industry: 'Fishing', id_number: '200000113', tax_number: '100000017', country_of_issue: 'Canada', tax_resident_country: 'Canada', preferred_contact: 'Home', initials: 'AM' },
  { first_name: 'Elizabeth Rose', surname: 'Murray', advisor: 'James MacDonald', nationality: 'Canadian', language: 'English', client_type: 'individual', age: 59, gender: 'Female', title: 'Mrs', email: 'elizabeth.murray@scotiabank.com', cell_number: '+1 416 789 0124', work_number: '+1 416 555 7891', home_number: null, occupation: 'SVP Wealth Management', employer: 'Scotiabank', industry: 'Financial Services', id_number: '200000120', tax_number: '100000018', country_of_issue: 'Canada', tax_resident_country: 'Canada', preferred_contact: 'Email', initials: 'ERM' },
  { first_name: 'Robert James', surname: 'Stewart', advisor: 'James MacDonald', nationality: 'Canadian', language: 'English', client_type: 'individual', age: 64, gender: 'Male', title: 'Mr', email: 'robert.stewart@cn.ca', cell_number: '+1 514 890 1235', work_number: '+1 514 555 8902', home_number: null, occupation: 'Railway Executive', employer: 'CN Rail', industry: 'Transportation', id_number: '200000127', tax_number: '100000019', country_of_issue: 'Canada', tax_resident_country: 'Canada', preferred_contact: 'Email', initials: 'RJS' },
  
  // Sophie Gagnon's clients (SG)
  { first_name: 'Arun', surname: 'Patel', advisor: 'Sophie Gagnon', nationality: 'Canadian', language: 'English', client_type: 'individual', age: 44, gender: 'Male', title: 'Mr', email: 'arun.patel@amazon.ca', cell_number: '+1 604 901 2346', work_number: '+1 604 555 9013', home_number: null, occupation: 'Operations Manager', employer: 'Amazon Canada', industry: 'Technology', id_number: '200000134', tax_number: '100000020', country_of_issue: 'Canada', tax_resident_country: 'Canada', preferred_contact: 'Email', initials: 'AP' },
  { first_name: 'Nathalie', surname: 'Leblanc', advisor: 'Sophie Gagnon', nationality: 'Canadian', language: 'French', client_type: 'individual', age: 52, gender: 'Female', title: 'Mme', email: 'nathalie.leblanc@uqam.ca', cell_number: '+1 514 012 3457', work_number: '+1 514 555 0124', home_number: null, occupation: 'University Professor', employer: 'UQAM', industry: 'Education', id_number: '200000141', tax_number: '100000021', country_of_issue: 'Canada', tax_resident_country: 'Canada', preferred_contact: 'Email', initials: 'NL' },
  { first_name: 'Jean-Luc', surname: 'Gagnon', advisor: 'Sophie Gagnon', nationality: 'Canadian', language: 'French', client_type: 'individual', age: 68, gender: 'Male', title: 'M.', email: 'jl.gagnon@videotron.ca', cell_number: '+1 514 123 4569', work_number: null, home_number: '+1 514 555 1236', occupation: 'Retired Engineer', employer: null, industry: 'Engineering', id_number: '200000148', tax_number: '100000022', country_of_issue: 'Canada', tax_resident_country: 'Canada', preferred_contact: 'Home', initials: 'JLG' },
  { first_name: 'François', surname: 'Gagnon', advisor: 'Sophie Gagnon', nationality: 'Canadian', language: 'French', client_type: 'individual', age: 41, gender: 'Male', title: 'M.', email: 'francois.gagnon@cgi.com', cell_number: '+1 514 234 5680', work_number: '+1 514 555 2347', home_number: null, occupation: 'IT Director', employer: 'CGI', industry: 'Technology', id_number: '200000155', tax_number: '100000023', country_of_issue: 'Canada', tax_resident_country: 'Canada', preferred_contact: 'Cell', initials: 'FG' },
  { first_name: 'Priya', surname: 'Sharma', advisor: 'Sophie Gagnon', nationality: 'Canadian', language: 'English', client_type: 'individual', age: 36, gender: 'Female', title: 'Ms', email: 'priya.sharma@lululemon.com', cell_number: '+1 604 345 6781', work_number: '+1 604 555 3458', home_number: null, occupation: 'VP Marketing', employer: 'Lululemon', industry: 'Retail', id_number: '200000162', tax_number: '100000024', country_of_issue: 'Canada', tax_resident_country: 'Canada', preferred_contact: 'Cell', initials: 'PS' },
  
  // Robert Singh's clients (RS)
  { first_name: 'Harpreet', surname: 'Singh', advisor: 'Robert Singh', nationality: 'Canadian', language: 'English', client_type: 'individual', age: 49, gender: 'Male', title: 'Mr', email: 'harpreet.singh@telus.com', cell_number: '+1 604 456 7892', work_number: '+1 604 555 4569', home_number: null, occupation: 'Telecom Executive', employer: 'Telus', industry: 'Telecommunications', id_number: '200000169', tax_number: '100000025', country_of_issue: 'Canada', tax_resident_country: 'Canada', preferred_contact: 'Email', initials: 'HS' },
  { first_name: 'Jacques', surname: 'Dumont', advisor: 'Robert Singh', nationality: 'Canadian', language: 'French', client_type: 'individual', age: 57, gender: 'Male', title: 'M.', email: 'jacques.dumont@pwc.ca', cell_number: '+1 514 567 8903', work_number: '+1 514 555 5680', home_number: null, occupation: 'Partner', employer: 'PwC Canada', industry: 'Consulting', id_number: '200000176', tax_number: '100000026', country_of_issue: 'Canada', tax_resident_country: 'Canada', preferred_contact: 'Email', initials: 'JD' },
  { first_name: 'Robert', surname: 'Singh', advisor: 'Robert Singh', nationality: 'Canadian', language: 'English', client_type: 'individual', age: 72, gender: 'Male', title: 'Mr', email: 'robert.singh@gmail.com', cell_number: '+1 604 678 9014', work_number: null, home_number: '+1 604 555 6791', occupation: 'Retired Physician', employer: null, industry: 'Healthcare', id_number: '200000183', tax_number: '100000027', country_of_issue: 'Canada', tax_resident_country: 'Canada', preferred_contact: 'Home', initials: 'RS' },
  { first_name: 'Priya', surname: 'Singh', advisor: 'Robert Singh', nationality: 'Canadian', language: 'English', client_type: 'individual', age: 45, gender: 'Female', title: 'Mrs', email: 'priya.singh@bmo.com', cell_number: '+1 416 789 0125', work_number: '+1 416 555 7892', home_number: null, occupation: 'Investment Advisor', employer: 'BMO', industry: 'Financial Services', id_number: '200000190', tax_number: '100000028', country_of_issue: 'Canada', tax_resident_country: 'Canada', preferred_contact: 'Cell', initials: 'PS' },
  { first_name: 'James William', surname: 'Fraser', advisor: 'Robert Singh', nationality: 'Canadian', language: 'English', client_type: 'individual', age: 63, gender: 'Male', title: 'Mr', email: 'james.fraser@imperial.ca', cell_number: '+1 403 890 1236', work_number: '+1 403 555 8903', home_number: null, occupation: 'Oil & Gas Executive', employer: 'Imperial Oil', industry: 'Energy', id_number: '200000197', tax_number: '100000029', country_of_issue: 'Canada', tax_resident_country: 'Canada', preferred_contact: 'Email', initials: 'JWF' },
  // CA Trust client
  { first_name: 'Lavoie Family', surname: 'Trust', advisor: 'Pierre Tremblay', nationality: 'Canadian', language: 'French', client_type: 'trust', age: null, gender: null, title: '', email: 'admin@lavoie-trust.ca', cell_number: '+1 514 700 1001', work_number: '+1 514 700 1002', home_number: null, occupation: 'Trust', employer: null, industry: 'Estate Planning', id_number: '200700001', tax_number: '700000001', country_of_issue: 'Canada', tax_resident_country: 'Canada', preferred_contact: 'Email', initials: 'LFT' },

  // ===== UNITED KINGDOM (GB) =====
  // William Smith's clients (WS)
  { first_name: 'The Royal', surname: 'Foundation', advisor: 'William Smith', nationality: 'British', language: 'English', client_type: 'business', age: null, gender: null, title: '', email: 'enquiries@royalfoundation.org.uk', cell_number: '+44 7700 100001', work_number: '+44 20 7555 1001', home_number: null, occupation: 'Charitable Foundation', employer: null, industry: 'Charity', id_number: 'AA 10 20 30 A', tax_number: '1000000001', country_of_issue: 'United Kingdom', tax_resident_country: 'United Kingdom', preferred_contact: 'Email', initials: 'TRF' },
  { first_name: 'Richard', surname: 'Thompson', advisor: 'William Smith', nationality: 'British', language: 'English', client_type: 'individual', age: 58, gender: 'Male', title: 'Mr', email: 'richard.thompson@hsbc.co.uk', cell_number: '+44 7712 345678', work_number: '+44 20 7555 1234', home_number: null, occupation: 'Investment Director', employer: 'HSBC', industry: 'Financial Services', id_number: 'AB 12 34 56 A', tax_number: '1000000002', country_of_issue: 'United Kingdom', tax_resident_country: 'United Kingdom', preferred_contact: 'Email', initials: 'RT' },
  { first_name: 'Amir', surname: 'Khan', advisor: 'William Smith', nationality: 'British', language: 'English', client_type: 'individual', age: 45, gender: 'Male', title: 'Mr', email: 'amir.khan@deloitte.co.uk', cell_number: '+44 7723 456789', work_number: '+44 20 7555 2345', home_number: null, occupation: 'Partner', employer: 'Deloitte UK', industry: 'Consulting', id_number: 'CD 23 45 67 B', tax_number: '1000000003', country_of_issue: 'United Kingdom', tax_resident_country: 'United Kingdom', preferred_contact: 'Cell', initials: 'AK' },
  { first_name: 'William Arthur', surname: 'Smith', advisor: 'William Smith', nationality: 'British', language: 'English', client_type: 'individual', age: 71, gender: 'Male', title: 'Mr', email: 'william.smith@btinternet.com', cell_number: '+44 7734 567890', work_number: null, home_number: '+44 20 7555 3456', occupation: 'Retired Banker', employer: null, industry: 'Financial Services', id_number: 'EF 34 56 78 C', tax_number: '1000000004', country_of_issue: 'United Kingdom', tax_resident_country: 'United Kingdom', preferred_contact: 'Home', initials: 'WAS' },
  { first_name: 'Charlotte Emma', surname: 'Davies', advisor: 'William Smith', nationality: 'British', language: 'English', client_type: 'individual', age: 52, gender: 'Female', title: 'Mrs', email: 'charlotte.davies@bbc.co.uk', cell_number: '+44 7745 678901', work_number: '+44 20 7555 4567', home_number: null, occupation: 'TV Producer', employer: 'BBC', industry: 'Media', id_number: 'GH 45 67 89 D', tax_number: '1000000005', country_of_issue: 'United Kingdom', tax_resident_country: 'United Kingdom', preferred_contact: 'Cell', initials: 'CED' },
  { first_name: 'James Edward', surname: 'Wilson', advisor: 'William Smith', nationality: 'British', language: 'English', client_type: 'individual', age: 64, gender: 'Male', title: 'Mr', email: 'james.wilson@rbs.co.uk', cell_number: '+44 7756 789012', work_number: '+44 20 7555 5678', home_number: null, occupation: 'Chief Risk Officer', employer: 'NatWest', industry: 'Financial Services', id_number: 'IJ 56 78 90 E', tax_number: '1000000006', country_of_issue: 'United Kingdom', tax_resident_country: 'United Kingdom', preferred_contact: 'Email', initials: 'JEW' },
  { first_name: 'Victoria Anne', surname: 'Thompson', advisor: 'William Smith', nationality: 'British', language: 'English', client_type: 'individual', age: 47, gender: 'Female', title: 'Mrs', email: 'victoria.thompson@lloyds.com', cell_number: '+44 7767 890123', work_number: '+44 20 7555 6789', home_number: null, occupation: 'Underwriter', employer: "Lloyd's of London", industry: 'Insurance', id_number: 'KL 67 89 01 F', tax_number: '1000000007', country_of_issue: 'United Kingdom', tax_resident_country: 'United Kingdom', preferred_contact: 'Cell', initials: 'VAT' },
  
  // Elizabeth Jones's clients (EJ)
  { first_name: 'William', surname: 'Smith', advisor: 'Elizabeth Jones', nationality: 'British', language: 'English', client_type: 'individual', age: 53, gender: 'Male', title: 'Mr', email: 'w.smith@kpmg.co.uk', cell_number: '+44 7778 901234', work_number: '+44 20 7555 7890', home_number: null, occupation: 'Partner', employer: 'KPMG UK', industry: 'Consulting', id_number: 'MN 78 90 12 G', tax_number: '1000000008', country_of_issue: 'United Kingdom', tax_resident_country: 'United Kingdom', preferred_contact: 'Email', initials: 'WS' },
  { first_name: 'Meera', surname: 'Patel', advisor: 'Elizabeth Jones', nationality: 'British', language: 'English', client_type: 'individual', age: 41, gender: 'Female', title: 'Dr', email: 'meera.patel@nhs.net', cell_number: '+44 7789 012345', work_number: '+44 20 7555 8901', home_number: null, occupation: 'Consultant Surgeon', employer: 'NHS', industry: 'Healthcare', id_number: 'OP 89 01 23 H', tax_number: '1000000009', country_of_issue: 'United Kingdom', tax_resident_country: 'United Kingdom', preferred_contact: 'Cell', initials: 'MP' },
  { first_name: 'Patrick', surname: "O'Sullivan", advisor: 'Elizabeth Jones', nationality: 'British', language: 'English', client_type: 'individual', age: 56, gender: 'Male', title: 'Mr', email: 'patrick.osullivan@barratt.co.uk', cell_number: '+44 7790 123456', work_number: '+44 20 7555 9012', home_number: null, occupation: 'Property Developer', employer: 'Barratt Homes', industry: 'Real Estate', id_number: 'QR 90 12 34 I', tax_number: '1000000010', country_of_issue: 'United Kingdom', tax_resident_country: 'United Kingdom', preferred_contact: 'Cell', initials: "PO'S" },
  { first_name: 'Elizabeth Mary', surname: 'Jones', advisor: 'Elizabeth Jones', nationality: 'British', language: 'English', client_type: 'individual', age: 74, gender: 'Female', title: 'Mrs', email: 'elizabeth.jones@btinternet.com', cell_number: '+44 7701 234567', work_number: null, home_number: '+44 20 7555 0123', occupation: 'Retired Civil Servant', employer: null, industry: 'Government', id_number: 'ST 01 23 45 J', tax_number: '1000000011', country_of_issue: 'United Kingdom', tax_resident_country: 'United Kingdom', preferred_contact: 'Home', initials: 'EMJ' },
  { first_name: 'George Henry', surname: 'Wilson', advisor: 'Elizabeth Jones', nationality: 'British', language: 'English', client_type: 'individual', age: 67, gender: 'Male', title: 'Mr', email: 'george.wilson@sky.com', cell_number: '+44 7802 345678', work_number: null, home_number: '+44 20 7555 1235', occupation: 'Retired Judge', employer: null, industry: 'Legal', id_number: 'UV 12 34 56 K', tax_number: '1000000012', country_of_issue: 'United Kingdom', tax_resident_country: 'United Kingdom', preferred_contact: 'Home', initials: 'GHW' },
  { first_name: 'Sophie Catherine', surname: 'Brown', advisor: 'Elizabeth Jones', nationality: 'British', language: 'English', client_type: 'individual', age: 38, gender: 'Female', title: 'Ms', email: 'sophie.brown@google.co.uk', cell_number: '+44 7813 456789', work_number: '+44 20 7555 2346', home_number: null, occupation: 'Product Manager', employer: 'Google UK', industry: 'Technology', id_number: 'WX 23 45 67 L', tax_number: '1000000013', country_of_issue: 'United Kingdom', tax_resident_country: 'United Kingdom', preferred_contact: 'Cell', initials: 'SCB' },
  
  // Thomas Williams's clients (TW)
  { first_name: 'Elizabeth', surname: 'Jones', advisor: 'Thomas Williams', nationality: 'British', language: 'English', client_type: 'individual', age: 49, gender: 'Female', title: 'Mrs', email: 'e.jones@ey.com', cell_number: '+44 7824 567890', work_number: '+44 20 7555 3457', home_number: null, occupation: 'Director', employer: 'EY', industry: 'Consulting', id_number: 'YZ 34 56 78 M', tax_number: '1000000014', country_of_issue: 'United Kingdom', tax_resident_country: 'United Kingdom', preferred_contact: 'Email', initials: 'EJ' },
  { first_name: 'Ciara', surname: 'Murphy', advisor: 'Thomas Williams', nationality: 'British', language: 'English', client_type: 'individual', age: 44, gender: 'Female', title: 'Mrs', email: 'ciara.murphy@unilever.com', cell_number: '+44 7835 678901', work_number: '+44 20 7555 4568', home_number: null, occupation: 'Brand Manager', employer: 'Unilever', industry: 'Consumer Goods', id_number: 'AB 45 67 89 N', tax_number: '1000000015', country_of_issue: 'United Kingdom', tax_resident_country: 'United Kingdom', preferred_contact: 'Cell', initials: 'CM' },
  { first_name: 'Chidi', surname: 'Okonkwo', advisor: 'Thomas Williams', nationality: 'British', language: 'English', client_type: 'individual', age: 51, gender: 'Male', title: 'Mr', email: 'chidi.okonkwo@bp.com', cell_number: '+44 7846 789012', work_number: '+44 20 7555 5679', home_number: null, occupation: 'Energy Analyst', employer: 'BP', industry: 'Energy', id_number: 'CD 56 78 90 O', tax_number: '1000000016', country_of_issue: 'United Kingdom', tax_resident_country: 'United Kingdom', preferred_contact: 'Email', initials: 'CO' },
  { first_name: 'Thomas Edward', surname: 'Williams', advisor: 'Thomas Williams', nationality: 'British', language: 'English', client_type: 'individual', age: 68, gender: 'Male', title: 'Mr', email: 'thomas.williams@virgin.net', cell_number: '+44 7857 890123', work_number: null, home_number: '+44 20 7555 6790', occupation: 'Retired Architect', employer: null, industry: 'Architecture', id_number: 'EF 67 89 01 P', tax_number: '1000000017', country_of_issue: 'United Kingdom', tax_resident_country: 'United Kingdom', preferred_contact: 'Home', initials: 'TEW' },
  { first_name: 'Amelia Rose', surname: 'Evans', advisor: 'Thomas Williams', nationality: 'British', language: 'English', client_type: 'individual', age: 35, gender: 'Female', title: 'Ms', email: 'amelia.evans@revolut.com', cell_number: '+44 7868 901234', work_number: '+44 20 7555 7891', home_number: null, occupation: 'Fintech Director', employer: 'Revolut', industry: 'Financial Services', id_number: 'GH 78 90 12 Q', tax_number: '1000000018', country_of_issue: 'United Kingdom', tax_resident_country: 'United Kingdom', preferred_contact: 'Cell', initials: 'ARE' },
  { first_name: 'Henry James', surname: 'Taylor', advisor: 'Thomas Williams', nationality: 'British', language: 'English', client_type: 'individual', age: 59, gender: 'Male', title: 'Mr', email: 'henry.taylor@shell.com', cell_number: '+44 7879 012345', work_number: '+44 20 7555 8902', home_number: null, occupation: 'VP Operations', employer: 'Shell', industry: 'Energy', id_number: 'IJ 89 01 23 R', tax_number: '1000000019', country_of_issue: 'United Kingdom', tax_resident_country: 'United Kingdom', preferred_contact: 'Email', initials: 'HJT' },
  
  // Victoria Brown's clients (VB)
  { first_name: 'Thomas', surname: 'Williams', advisor: 'Victoria Brown', nationality: 'British', language: 'English', client_type: 'individual', age: 55, gender: 'Male', title: 'Mr', email: 't.williams@barclays.co.uk', cell_number: '+44 7880 123456', work_number: '+44 20 7555 9013', home_number: null, occupation: 'Managing Director', employer: 'Barclays', industry: 'Financial Services', id_number: 'KL 90 12 34 S', tax_number: '1000000020', country_of_issue: 'United Kingdom', tax_resident_country: 'United Kingdom', preferred_contact: 'Email', initials: 'TW' },
  { first_name: 'Simran', surname: 'Kaur', advisor: 'Victoria Brown', nationality: 'British', language: 'English', client_type: 'individual', age: 38, gender: 'Female', title: 'Ms', email: 'simran.kaur@amazon.co.uk', cell_number: '+44 7891 234567', work_number: '+44 20 7555 0124', home_number: null, occupation: 'Senior Manager', employer: 'Amazon UK', industry: 'Technology', id_number: 'MN 01 23 45 T', tax_number: '1000000021', country_of_issue: 'United Kingdom', tax_resident_country: 'United Kingdom', preferred_contact: 'Cell', initials: 'SK' },
  { first_name: 'Fiona', surname: 'Campbell', advisor: 'Victoria Brown', nationality: 'British', language: 'English', client_type: 'individual', age: 47, gender: 'Female', title: 'Mrs', email: 'fiona.campbell@diageo.com', cell_number: '+44 7902 345678', work_number: '+44 20 7555 1236', home_number: null, occupation: 'Brand Director', employer: 'Diageo', industry: 'Consumer Goods', id_number: 'OP 12 34 56 U', tax_number: '1000000022', country_of_issue: 'United Kingdom', tax_resident_country: 'United Kingdom', preferred_contact: 'Cell', initials: 'FC' },
  { first_name: 'Victoria Anne', surname: 'Brown', advisor: 'Victoria Brown', nationality: 'British', language: 'English', client_type: 'individual', age: 72, gender: 'Female', title: 'Mrs', email: 'victoria.brown@talktalk.net', cell_number: '+44 7913 456789', work_number: null, home_number: '+44 20 7555 2347', occupation: 'Retired Headmistress', employer: null, industry: 'Education', id_number: 'QR 23 45 67 V', tax_number: '1000000023', country_of_issue: 'United Kingdom', tax_resident_country: 'United Kingdom', preferred_contact: 'Home', initials: 'VAB' },
  { first_name: 'Oliver Charles', surname: 'Thomas', advisor: 'Victoria Brown', nationality: 'British', language: 'English', client_type: 'individual', age: 43, gender: 'Male', title: 'Mr', email: 'oliver.thomas@jpmorgam.com', cell_number: '+44 7924 567890', work_number: '+44 20 7555 3458', home_number: null, occupation: 'Vice President', employer: 'JP Morgan', industry: 'Financial Services', id_number: 'ST 34 56 78 W', tax_number: '1000000024', country_of_issue: 'United Kingdom', tax_resident_country: 'United Kingdom', preferred_contact: 'Email', initials: 'OCT' },
  { first_name: 'Isabella Grace', surname: 'White', advisor: 'Victoria Brown', nationality: 'British', language: 'English', client_type: 'individual', age: 61, gender: 'Female', title: 'Mrs', email: 'isabella.white@astrazeneca.com', cell_number: '+44 7935 678901', work_number: '+44 20 7555 4569', home_number: null, occupation: 'Chief Medical Officer', employer: 'AstraZeneca', industry: 'Pharmaceutical', id_number: 'UV 45 67 89 X', tax_number: '1000000025', country_of_issue: 'United Kingdom', tax_resident_country: 'United Kingdom', preferred_contact: 'Email', initials: 'IGW' },
  
  // James Taylor's clients (JT)
  { first_name: 'James', surname: 'Taylor', advisor: 'James Taylor', nationality: 'British', language: 'English', client_type: 'individual', age: 58, gender: 'Male', title: 'Mr', email: 'j.taylor@pwc.co.uk', cell_number: '+44 7946 789012', work_number: '+44 20 7555 5680', home_number: null, occupation: 'Partner', employer: 'PwC UK', industry: 'Consulting', id_number: 'WX 56 78 90 Y', tax_number: '1000000026', country_of_issue: 'United Kingdom', tax_resident_country: 'United Kingdom', preferred_contact: 'Email', initials: 'JT' },
  { first_name: 'Marta', surname: 'Kowalski', advisor: 'James Taylor', nationality: 'British', language: 'English', client_type: 'individual', age: 42, gender: 'Female', title: 'Mrs', email: 'marta.kowalski@gsk.com', cell_number: '+44 7957 890123', work_number: '+44 20 7555 6791', home_number: null, occupation: 'Research Director', employer: 'GSK', industry: 'Pharmaceutical', id_number: 'YZ 67 89 01 Z', tax_number: '1000000027', country_of_issue: 'United Kingdom', tax_resident_country: 'United Kingdom', preferred_contact: 'Cell', initials: 'MK' },
  { first_name: 'Fatima', surname: 'Ahmed', advisor: 'James Taylor', nationality: 'British', language: 'English', client_type: 'individual', age: 49, gender: 'Female', title: 'Mrs', email: 'fatima.ahmed@standard.co.uk', cell_number: '+44 7968 901234', work_number: '+44 20 7555 7892', home_number: null, occupation: 'Chief Compliance Officer', employer: 'Standard Chartered', industry: 'Financial Services', id_number: 'AB 78 90 12 A', tax_number: '1000000028', country_of_issue: 'United Kingdom', tax_resident_country: 'United Kingdom', preferred_contact: 'Email', initials: 'FA' },
  { first_name: 'James Robert', surname: 'Taylor', advisor: 'James Taylor', nationality: 'British', language: 'English', client_type: 'individual', age: 76, gender: 'Male', title: 'Mr', email: 'jrobert.taylor@btinternet.com', cell_number: '+44 7979 012345', work_number: null, home_number: '+44 20 7555 8903', occupation: 'Retired Solicitor', employer: null, industry: 'Legal', id_number: 'CD 89 01 23 B', tax_number: '1000000029', country_of_issue: 'United Kingdom', tax_resident_country: 'United Kingdom', preferred_contact: 'Home', initials: 'JRT' },
  { first_name: 'Isabella Grace', surname: 'Roberts', advisor: 'James Taylor', nationality: 'British', language: 'English', client_type: 'individual', age: 34, gender: 'Female', title: 'Ms', email: 'isabella.roberts@deliveroo.co.uk', cell_number: '+44 7980 123456', work_number: '+44 20 7555 9014', home_number: null, occupation: 'VP Operations', employer: 'Deliveroo', industry: 'Technology', id_number: 'EF 90 12 34 C', tax_number: '1000000030', country_of_issue: 'United Kingdom', tax_resident_country: 'United Kingdom', preferred_contact: 'Cell', initials: 'IGR' },
  { first_name: 'Edward William', surname: 'Harris', advisor: 'James Taylor', nationality: 'British', language: 'English', client_type: 'individual', age: 65, gender: 'Male', title: 'Mr', email: 'edward.harris@rolls-royce.com', cell_number: '+44 7991 234567', work_number: '+44 20 7555 0125', home_number: null, occupation: 'Engineering Director', employer: 'Rolls-Royce', industry: 'Aerospace', id_number: 'GH 01 23 45 D', tax_number: '1000000031', country_of_issue: 'United Kingdom', tax_resident_country: 'United Kingdom', preferred_contact: 'Email', initials: 'EWH' },
  // GB Trust client
  { first_name: 'Anderson Family', surname: 'Trust', advisor: 'William Smith', nationality: 'British', language: 'English', client_type: 'trust', age: null, gender: null, title: '', email: 'admin@anderson-trust.co.uk', cell_number: '+44 7700 700001', work_number: '+44 20 7700 1001', home_number: null, occupation: 'Trust', employer: null, industry: 'Estate Planning', id_number: 'TT 70 00 01 A', tax_number: '7000000001', country_of_issue: 'United Kingdom', tax_resident_country: 'United Kingdom', preferred_contact: 'Email', initials: 'AFT' },

  // ===== UNITED STATES (US) =====
  // Michael Johnson's clients (MJ)
  { first_name: "St. Mary's Hospital", surname: 'Foundation', advisor: 'Michael Johnson', nationality: 'American', language: 'English', client_type: 'business', age: null, gender: null, title: '', email: 'foundation@stmarys.org', cell_number: '+1 212 100 1001', work_number: '+1 212 555 1001', home_number: null, occupation: 'Healthcare Foundation', employer: null, industry: 'Healthcare', id_number: '300101001', tax_number: '900000001', country_of_issue: 'United States', tax_resident_country: 'United States', preferred_contact: 'Email', initials: 'SMH' },
  { first_name: 'Wei', surname: 'Chen', advisor: 'Michael Johnson', nationality: 'American', language: 'English', client_type: 'individual', age: 47, gender: 'Male', title: 'Mr', email: 'wei.chen@meta.com', cell_number: '+1 650 123 4567', work_number: '+1 650 555 1234', home_number: null, occupation: 'Engineering Director', employer: 'Meta', industry: 'Technology', id_number: '300111002', tax_number: '900000002', country_of_issue: 'United States', tax_resident_country: 'United States', preferred_contact: 'Email', initials: 'WC' },
  { first_name: 'Marcus', surname: 'Washington', advisor: 'Michael Johnson', nationality: 'American', language: 'English', client_type: 'individual', age: 52, gender: 'Male', title: 'Mr', email: 'marcus.washington@goldman.com', cell_number: '+1 212 234 5678', work_number: '+1 212 555 2345', home_number: null, occupation: 'Managing Director', employer: 'Goldman Sachs', industry: 'Financial Services', id_number: '300121003', tax_number: '900000003', country_of_issue: 'United States', tax_resident_country: 'United States', preferred_contact: 'Email', initials: 'MW' },
  { first_name: 'Michael David', surname: 'Johnson', advisor: 'Michael Johnson', nationality: 'American', language: 'English', client_type: 'individual', age: 71, gender: 'Male', title: 'Mr', email: 'michael.johnson@aol.com', cell_number: '+1 212 345 6789', work_number: null, home_number: '+1 212 555 3456', occupation: 'Retired Surgeon', employer: null, industry: 'Healthcare', id_number: '300131004', tax_number: '900000004', country_of_issue: 'United States', tax_resident_country: 'United States', preferred_contact: 'Home', initials: 'MDJ' },
  { first_name: 'Patricia Ann', surname: 'Martinez', advisor: 'Michael Johnson', nationality: 'American', language: 'English', client_type: 'individual', age: 58, gender: 'Female', title: 'Mrs', email: 'patricia.martinez@jpmorgan.com', cell_number: '+1 212 456 7890', work_number: '+1 212 555 4567', home_number: null, occupation: 'SVP Private Banking', employer: 'JP Morgan', industry: 'Financial Services', id_number: '300141005', tax_number: '900000005', country_of_issue: 'United States', tax_resident_country: 'United States', preferred_contact: 'Email', initials: 'PAM' },
  { first_name: 'Robert James', surname: 'Williams', advisor: 'Michael Johnson', nationality: 'American', language: 'English', client_type: 'individual', age: 64, gender: 'Male', title: 'Mr', email: 'robert.williams@pfizer.com', cell_number: '+1 212 567 8901', work_number: '+1 212 555 5678', home_number: null, occupation: 'Chief Medical Officer', employer: 'Pfizer', industry: 'Pharmaceutical', id_number: '300151006', tax_number: '900000006', country_of_issue: 'United States', tax_resident_country: 'United States', preferred_contact: 'Email', initials: 'RJW' },
  { first_name: 'Jennifer Lynn', surname: 'Davis', advisor: 'Michael Johnson', nationality: 'American', language: 'English', client_type: 'individual', age: 45, gender: 'Female', title: 'Mrs', email: 'jennifer.davis@blackrock.com', cell_number: '+1 212 678 9012', work_number: '+1 212 555 6789', home_number: null, occupation: 'Portfolio Manager', employer: 'BlackRock', industry: 'Financial Services', id_number: '300161007', tax_number: '900000007', country_of_issue: 'United States', tax_resident_country: 'United States', preferred_contact: 'Cell', initials: 'JLD' },
  
  // Jennifer Williams's clients (JW)
  { first_name: 'Robert', surname: 'Johnson', advisor: 'Jennifer Williams', nationality: 'American', language: 'English', client_type: 'individual', age: 55, gender: 'Male', title: 'Mr', email: 'robert.johnson@citi.com', cell_number: '+1 212 789 0123', work_number: '+1 212 555 7890', home_number: null, occupation: 'Chief Investment Officer', employer: 'Citibank', industry: 'Financial Services', id_number: '300171008', tax_number: '900000008', country_of_issue: 'United States', tax_resident_country: 'United States', preferred_contact: 'Email', initials: 'RJ' },
  { first_name: 'Carlos', surname: 'Hernandez', advisor: 'Jennifer Williams', nationality: 'American', language: 'English', client_type: 'individual', age: 48, gender: 'Male', title: 'Mr', email: 'carlos.hernandez@deloitte.com', cell_number: '+1 213 890 1234', work_number: '+1 213 555 8901', home_number: null, occupation: 'Partner', employer: 'Deloitte', industry: 'Consulting', id_number: '300181009', tax_number: '900000009', country_of_issue: 'United States', tax_resident_country: 'United States', preferred_contact: 'Cell', initials: 'CH' },
  { first_name: 'Jennifer', surname: 'Kim', advisor: 'Jennifer Williams', nationality: 'American', language: 'English', client_type: 'individual', age: 41, gender: 'Female', title: 'Ms', email: 'jennifer.kim@apple.com', cell_number: '+1 408 901 2345', work_number: '+1 408 555 9012', home_number: null, occupation: 'VP Engineering', employer: 'Apple', industry: 'Technology', id_number: '300191010', tax_number: '900000010', country_of_issue: 'United States', tax_resident_country: 'United States', preferred_contact: 'Email', initials: 'JK' },
  { first_name: 'Jennifer Marie', surname: 'Williams', advisor: 'Jennifer Williams', nationality: 'American', language: 'English', client_type: 'individual', age: 68, gender: 'Female', title: 'Mrs', email: 'jennifer.williams@yahoo.com', cell_number: '+1 212 012 3456', work_number: null, home_number: '+1 212 555 0123', occupation: 'Retired Judge', employer: null, industry: 'Legal', id_number: '300201011', tax_number: '900000011', country_of_issue: 'United States', tax_resident_country: 'United States', preferred_contact: 'Home', initials: 'JMW' },
  { first_name: 'James Michael', surname: 'Wilson', advisor: 'Jennifer Williams', nationality: 'American', language: 'English', client_type: 'individual', age: 53, gender: 'Male', title: 'Mr', email: 'james.wilson@bofa.com', cell_number: '+1 704 123 4568', work_number: '+1 704 555 1235', home_number: null, occupation: 'Chief Risk Officer', employer: 'Bank of America', industry: 'Financial Services', id_number: '300211012', tax_number: '900000012', country_of_issue: 'United States', tax_resident_country: 'United States', preferred_contact: 'Email', initials: 'JMW' },
  { first_name: 'Maria Elena', surname: 'Rodriguez', advisor: 'Jennifer Williams', nationality: 'American', language: 'Spanish', client_type: 'individual', age: 44, gender: 'Female', title: 'Mrs', email: 'maria.rodriguez@univision.com', cell_number: '+1 305 234 5679', work_number: '+1 305 555 2346', home_number: null, occupation: 'News Director', employer: 'Univision', industry: 'Media', id_number: '300221013', tax_number: '900000013', country_of_issue: 'United States', tax_resident_country: 'United States', preferred_contact: 'Cell', initials: 'MER' },
  
  // Robert Brown's clients (RB)
  { first_name: 'Patricia', surname: 'Williams', advisor: 'Robert Brown', nationality: 'American', language: 'English', client_type: 'individual', age: 59, gender: 'Female', title: 'Mrs', email: 'patricia.williams@wellsfargo.com', cell_number: '+1 415 345 6780', work_number: '+1 415 555 3457', home_number: null, occupation: 'EVP Commercial Banking', employer: 'Wells Fargo', industry: 'Financial Services', id_number: '300231014', tax_number: '900000014', country_of_issue: 'United States', tax_resident_country: 'United States', preferred_contact: 'Email', initials: 'PW' },
  { first_name: 'Vikram', surname: 'Patel', advisor: 'Robert Brown', nationality: 'American', language: 'English', client_type: 'individual', age: 46, gender: 'Male', title: 'Dr', email: 'vikram.patel@stanford.edu', cell_number: '+1 650 456 7891', work_number: '+1 650 555 4568', home_number: null, occupation: 'Professor of Medicine', employer: 'Stanford University', industry: 'Education', id_number: '300241015', tax_number: '900000015', country_of_issue: 'United States', tax_resident_country: 'United States', preferred_contact: 'Email', initials: 'VP' },
  { first_name: 'Sean', surname: "O'Connor", advisor: 'Robert Brown', nationality: 'American', language: 'English', client_type: 'individual', age: 51, gender: 'Male', title: 'Mr', email: 'sean.oconnor@kkr.com', cell_number: '+1 212 567 8902', work_number: '+1 212 555 5679', home_number: null, occupation: 'Managing Director', employer: 'KKR', industry: 'Private Equity', id_number: '300251016', tax_number: '900000016', country_of_issue: 'United States', tax_resident_country: 'United States', preferred_contact: 'Email', initials: "SO'C" },
  { first_name: 'Robert James', surname: 'Brown', advisor: 'Robert Brown', nationality: 'American', language: 'English', client_type: 'individual', age: 74, gender: 'Male', title: 'Mr', email: 'robert.brown@gmail.com', cell_number: '+1 312 678 9013', work_number: null, home_number: '+1 312 555 6790', occupation: 'Retired CEO', employer: null, industry: 'Manufacturing', id_number: '300261017', tax_number: '900000017', country_of_issue: 'United States', tax_resident_country: 'United States', preferred_contact: 'Home', initials: 'RJB' },
  { first_name: 'Linda Sue', surname: 'Anderson', advisor: 'Robert Brown', nationality: 'American', language: 'English', client_type: 'individual', age: 62, gender: 'Female', title: 'Mrs', email: 'linda.anderson@merck.com', cell_number: '+1 908 789 0124', work_number: '+1 908 555 7891', home_number: null, occupation: 'VP Research', employer: 'Merck', industry: 'Pharmaceutical', id_number: '300271018', tax_number: '900000018', country_of_issue: 'United States', tax_resident_country: 'United States', preferred_contact: 'Email', initials: 'LSA' },
  { first_name: 'William Thomas', surname: 'Miller', advisor: 'Robert Brown', nationality: 'American', language: 'English', client_type: 'individual', age: 57, gender: 'Male', title: 'Mr', email: 'william.miller@exxon.com', cell_number: '+1 713 890 1235', work_number: '+1 713 555 8902', home_number: null, occupation: 'VP Operations', employer: 'ExxonMobil', industry: 'Energy', id_number: '300281019', tax_number: '900000019', country_of_issue: 'United States', tax_resident_country: 'United States', preferred_contact: 'Email', initials: 'WTM' },
  
  // Maria Garcia's clients (MG)
  { first_name: 'Miguel', surname: 'Garcia', advisor: 'Maria Garcia', nationality: 'American', language: 'Spanish', client_type: 'individual', age: 54, gender: 'Male', title: 'Mr', email: 'miguel.garcia@telemundo.com', cell_number: '+1 305 901 2346', work_number: '+1 305 555 9013', home_number: null, occupation: 'Producer', employer: 'Telemundo', industry: 'Media', id_number: '300291020', tax_number: '900000020', country_of_issue: 'United States', tax_resident_country: 'United States', preferred_contact: 'Cell', initials: 'MG' },
  { first_name: 'Angela', surname: 'Washington', advisor: 'Maria Garcia', nationality: 'American', language: 'English', client_type: 'individual', age: 47, gender: 'Female', title: 'Mrs', email: 'angela.washington@nike.com', cell_number: '+1 503 012 3457', work_number: '+1 503 555 0124', home_number: null, occupation: 'VP Marketing', employer: 'Nike', industry: 'Retail', id_number: '300301021', tax_number: '900000021', country_of_issue: 'United States', tax_resident_country: 'United States', preferred_contact: 'Cell', initials: 'AW' },
  { first_name: 'Kenji', surname: 'Nakamura', advisor: 'Maria Garcia', nationality: 'American', language: 'English', client_type: 'individual', age: 43, gender: 'Male', title: 'Mr', email: 'kenji.nakamura@sony.com', cell_number: '+1 310 123 4569', work_number: '+1 310 555 1236', home_number: null, occupation: 'VP Product', employer: 'Sony', industry: 'Technology', id_number: '300311022', tax_number: '900000022', country_of_issue: 'United States', tax_resident_country: 'United States', preferred_contact: 'Email', initials: 'KN' },
  { first_name: 'Maria Elena', surname: 'Garcia', advisor: 'Maria Garcia', nationality: 'American', language: 'Spanish', client_type: 'individual', age: 69, gender: 'Female', title: 'Mrs', email: 'maria.garcia@att.net', cell_number: '+1 305 234 5680', work_number: null, home_number: '+1 305 555 2347', occupation: 'Retired Businesswoman', employer: null, industry: 'Retail', id_number: '300321023', tax_number: '900000023', country_of_issue: 'United States', tax_resident_country: 'United States', preferred_contact: 'Home', initials: 'MEG' },
  { first_name: 'David Lee', surname: 'Thompson', advisor: 'Maria Garcia', nationality: 'American', language: 'English', client_type: 'individual', age: 51, gender: 'Male', title: 'Mr', email: 'david.thompson@microsoft.com', cell_number: '+1 425 345 6781', work_number: '+1 425 555 3458', home_number: null, occupation: 'VP Cloud Services', employer: 'Microsoft', industry: 'Technology', id_number: '300331024', tax_number: '900000024', country_of_issue: 'United States', tax_resident_country: 'United States', preferred_contact: 'Email', initials: 'DLT' },
  { first_name: 'Jessica Ann', surname: 'Martinez', advisor: 'Maria Garcia', nationality: 'American', language: 'English', client_type: 'individual', age: 38, gender: 'Female', title: 'Ms', email: 'jessica.martinez@netflix.com', cell_number: '+1 310 456 7892', work_number: '+1 310 555 4569', home_number: null, occupation: 'Content Director', employer: 'Netflix', industry: 'Entertainment', id_number: '300341025', tax_number: '900000025', country_of_issue: 'United States', tax_resident_country: 'United States', preferred_contact: 'Cell', initials: 'JAM' },
  
  // William Davis's clients (WD)
  { first_name: 'Isabella', surname: 'Martinez', advisor: 'William Davis', nationality: 'American', language: 'English', client_type: 'individual', age: 49, gender: 'Female', title: 'Mrs', email: 'isabella.martinez@disney.com', cell_number: '+1 818 567 8903', work_number: '+1 818 555 5680', home_number: null, occupation: 'VP Entertainment', employer: 'Disney', industry: 'Entertainment', id_number: '300351026', tax_number: '900000026', country_of_issue: 'United States', tax_resident_country: 'United States', preferred_contact: 'Email', initials: 'IM' },
  { first_name: 'Sofia', surname: 'Rodriguez', advisor: 'William Davis', nationality: 'American', language: 'Spanish', client_type: 'individual', age: 42, gender: 'Female', title: 'Mrs', email: 'sofia.rodriguez@warner.com', cell_number: '+1 818 678 9014', work_number: '+1 818 555 6791', home_number: null, occupation: 'Film Producer', employer: 'Warner Bros', industry: 'Entertainment', id_number: '300361027', tax_number: '900000027', country_of_issue: 'United States', tax_resident_country: 'United States', preferred_contact: 'Cell', initials: 'SR' },
  { first_name: 'Jamal', surname: 'Thompson', advisor: 'William Davis', nationality: 'American', language: 'English', client_type: 'individual', age: 55, gender: 'Male', title: 'Mr', email: 'jamal.thompson@united.com', cell_number: '+1 312 789 0125', work_number: '+1 312 555 7892', home_number: null, occupation: 'Chief Commercial Officer', employer: 'United Airlines', industry: 'Aviation', id_number: '300371028', tax_number: '900000028', country_of_issue: 'United States', tax_resident_country: 'United States', preferred_contact: 'Email', initials: 'JT' },
  { first_name: 'William Thomas', surname: 'Davis', advisor: 'William Davis', nationality: 'American', language: 'English', client_type: 'individual', age: 73, gender: 'Male', title: 'Mr', email: 'william.davis@verizon.net', cell_number: '+1 212 890 1236', work_number: null, home_number: '+1 212 555 8903', occupation: 'Retired Attorney', employer: null, industry: 'Legal', id_number: '300381029', tax_number: '900000029', country_of_issue: 'United States', tax_resident_country: 'United States', preferred_contact: 'Home', initials: 'WTD' },
  { first_name: 'Susan Marie', surname: 'Jackson', advisor: 'William Davis', nationality: 'American', language: 'English', client_type: 'individual', age: 61, gender: 'Female', title: 'Mrs', email: 'susan.jackson@jnj.com', cell_number: '+1 732 901 2347', work_number: '+1 732 555 9014', home_number: null, occupation: 'VP Regulatory Affairs', employer: 'Johnson & Johnson', industry: 'Pharmaceutical', id_number: '300391030', tax_number: '900000030', country_of_issue: 'United States', tax_resident_country: 'United States', preferred_contact: 'Email', initials: 'SMJ' },
  { first_name: 'Christopher John', surname: 'Lee', advisor: 'William Davis', nationality: 'American', language: 'English', client_type: 'individual', age: 46, gender: 'Male', title: 'Mr', email: 'christopher.lee@oracle.com', cell_number: '+1 650 012 3458', work_number: '+1 650 555 0125', home_number: null, occupation: 'VP Sales', employer: 'Oracle', industry: 'Technology', id_number: '300401031', tax_number: '900000031', country_of_issue: 'United States', tax_resident_country: 'United States', preferred_contact: 'Cell', initials: 'CJL' },
  // US Trust client
  { first_name: 'Johnson Family', surname: 'Trust', advisor: 'Michael Johnson', nationality: 'American', language: 'English', client_type: 'trust', age: null, gender: null, title: '', email: 'admin@johnson-trust.com', cell_number: '+1 212 700 1001', work_number: '+1 212 700 1002', home_number: null, occupation: 'Trust', employer: null, industry: 'Estate Planning', id_number: '300700001', tax_number: '700000001', country_of_issue: 'United States', tax_resident_country: 'United States', preferred_contact: 'Email', initials: 'JFT' },
]

// ==================== PROGRAMMATIC CLIENT GENERATOR ====================

interface NamePool {
  firstNames: { name: string; gender: string; title: string }[];
  lastNames: string[];
  nationality: string;
  language: string;
  country_of_issue: string;
  tax_resident_country: string;
  occupations: { occupation: string; employer: string | null; industry: string }[];
}

const namePools: Record<string, NamePool> = {
  ZA: {
    firstNames: [
      { name: 'Jacobus', gender: 'Male', title: 'Mr' }, { name: 'Kobus', gender: 'Male', title: 'Mr' },
      { name: 'Pieter', gender: 'Male', title: 'Mr' }, { name: 'Thabo', gender: 'Male', title: 'Mr' },
      { name: 'Sipho', gender: 'Male', title: 'Mr' }, { name: 'Charl', gender: 'Male', title: 'Mr' },
      { name: 'Riaan', gender: 'Male', title: 'Mr' }, { name: 'Andries', gender: 'Male', title: 'Mr' },
      { name: 'Hennie', gender: 'Male', title: 'Mr' }, { name: 'Bongani', gender: 'Male', title: 'Mr' },
      { name: 'Fanie', gender: 'Male', title: 'Mr' }, { name: 'Tshepo', gender: 'Male', title: 'Mr' },
      { name: 'Marietjie', gender: 'Female', title: 'Mrs' }, { name: 'Annelie', gender: 'Female', title: 'Mrs' },
      { name: 'Nomsa', gender: 'Female', title: 'Mrs' }, { name: 'Lindiwe', gender: 'Female', title: 'Ms' },
      { name: 'Sonja', gender: 'Female', title: 'Ms' }, { name: 'Hannelie', gender: 'Female', title: 'Mrs' },
      { name: 'Christa', gender: 'Female', title: 'Mrs' }, { name: 'Marike', gender: 'Female', title: 'Ms' },
      { name: 'Zanele', gender: 'Female', title: 'Ms' }, { name: 'Refilwe', gender: 'Female', title: 'Ms' },
      { name: 'Elize', gender: 'Female', title: 'Mrs' }, { name: 'Pulane', gender: 'Female', title: 'Ms' },
    ],
    lastNames: ['Vermeulen', 'Swanepoel', 'Erasmus', 'Cilliers', 'Fourie', 'Barnard', 'Booysen', 'Kruger', 'Nkosi', 'Dlamini', 'Ndlovu', 'Potgieter', 'Brink', 'Grobler', 'Wessels', 'Rautenbach', 'Malan', 'Mokoena', 'Viljoen', 'Sithole'],
    nationality: 'South African', language: 'Afrikaans', country_of_issue: 'South Africa', tax_resident_country: 'South Africa',
    occupations: [
      { occupation: 'Chartered Accountant', employer: 'Deloitte SA', industry: 'Accounting' },
      { occupation: 'General Practitioner', employer: 'Private Practice', industry: 'Healthcare' },
      { occupation: 'Civil Engineer', employer: 'AECOM SA', industry: 'Engineering' },
      { occupation: 'Quantity Surveyor', employer: 'Self-employed', industry: 'Construction' },
      { occupation: 'IT Manager', employer: 'Dimension Data', industry: 'Technology' },
      { occupation: 'HR Director', employer: 'Shoprite Holdings', industry: 'Retail' },
      { occupation: 'Winemaker', employer: 'Self-employed', industry: 'Agriculture' },
      { occupation: 'Retired', employer: null, industry: 'Retired' },
    ],
  },
  AU: {
    firstNames: [
      { name: 'Liam', gender: 'Male', title: 'Mr' }, { name: 'Noah', gender: 'Male', title: 'Mr' },
      { name: 'Ethan', gender: 'Male', title: 'Mr' }, { name: 'Lucas', gender: 'Male', title: 'Mr' },
      { name: 'Mason', gender: 'Male', title: 'Mr' }, { name: 'Jack', gender: 'Male', title: 'Mr' },
      { name: 'Hamish', gender: 'Male', title: 'Mr' }, { name: 'Angus', gender: 'Male', title: 'Mr' },
      { name: 'Darcy', gender: 'Male', title: 'Mr' }, { name: 'Flynn', gender: 'Male', title: 'Mr' },
      { name: 'Archie', gender: 'Male', title: 'Mr' }, { name: 'Callum', gender: 'Male', title: 'Mr' },
      { name: 'Chloe', gender: 'Female', title: 'Ms' }, { name: 'Mia', gender: 'Female', title: 'Ms' },
      { name: 'Isla', gender: 'Female', title: 'Mrs' }, { name: 'Grace', gender: 'Female', title: 'Mrs' },
      { name: 'Harper', gender: 'Female', title: 'Ms' }, { name: 'Zoe', gender: 'Female', title: 'Mrs' },
      { name: 'Ruby', gender: 'Female', title: 'Mrs' }, { name: 'Willow', gender: 'Female', title: 'Ms' },
      { name: 'Matilda', gender: 'Female', title: 'Ms' }, { name: 'Piper', gender: 'Female', title: 'Ms' },
      { name: 'Imogen', gender: 'Female', title: 'Mrs' }, { name: 'Sienna', gender: 'Female', title: 'Ms' },
    ],
    lastNames: ['Harris', 'Robinson', 'Walker', 'Young', 'Hall', 'Allen', 'King', 'Wright', 'Lopez', 'Hill', 'Green', 'Adams', 'Baker', 'Clarke', 'Stewart', 'Murray', 'Palmer', 'Bennett', 'Cox', 'Mills'],
    nationality: 'Australian', language: 'English', country_of_issue: 'Australia', tax_resident_country: 'Australia',
    occupations: [
      { occupation: 'Accountant', employer: 'EY Australia', industry: 'Accounting' },
      { occupation: 'Dentist', employer: 'Private Practice', industry: 'Healthcare' },
      { occupation: 'Civil Engineer', employer: 'Lendlease', industry: 'Construction' },
      { occupation: 'Physiotherapist', employer: 'Self-employed', industry: 'Healthcare' },
      { occupation: 'Data Analyst', employer: 'Atlassian', industry: 'Technology' },
      { occupation: 'Nurse Manager', employer: 'Royal Melbourne Hospital', industry: 'Healthcare' },
      { occupation: 'Electrician', employer: 'Self-employed', industry: 'Trades' },
      { occupation: 'Retired', employer: null, industry: 'Retired' },
    ],
  },
  CA: {
    firstNames: [
      { name: 'Liam', gender: 'Male', title: 'Mr' }, { name: 'Étienne', gender: 'Male', title: 'M.' },
      { name: 'Noah', gender: 'Male', title: 'Mr' }, { name: 'Guillaume', gender: 'Male', title: 'M.' },
      { name: 'Raj', gender: 'Male', title: 'Mr' }, { name: 'Owen', gender: 'Male', title: 'Mr' },
      { name: 'Sébastien', gender: 'Male', title: 'M.' }, { name: 'Connor', gender: 'Male', title: 'Mr' },
      { name: 'Xavier', gender: 'Male', title: 'Mr' }, { name: 'Harpreet', gender: 'Male', title: 'Mr' },
      { name: 'Mathieu', gender: 'Male', title: 'M.' }, { name: 'Declan', gender: 'Male', title: 'Mr' },
      { name: 'Olivia', gender: 'Female', title: 'Ms' }, { name: 'Chloé', gender: 'Female', title: 'Mme' },
      { name: 'Amara', gender: 'Female', title: 'Ms' }, { name: 'Geneviève', gender: 'Female', title: 'Mme' },
      { name: 'Meera', gender: 'Female', title: 'Ms' }, { name: 'Brigitte', gender: 'Female', title: 'Mme' },
      { name: 'Lindsay', gender: 'Female', title: 'Mrs' }, { name: 'Priyanka', gender: 'Female', title: 'Ms' },
      { name: 'Émilie', gender: 'Female', title: 'Mme' }, { name: 'Nadia', gender: 'Female', title: 'Ms' },
      { name: 'Jasmine', gender: 'Female', title: 'Ms' }, { name: 'Valérie', gender: 'Female', title: 'Mme' },
    ],
    lastNames: ['Martin', 'Bernard', 'Dubois', 'Moreau', 'Lefebvre', 'Girard', 'Fortin', 'Gauthier', 'Li', 'Kumar', 'Nguyen', 'Morrison', 'Ross', 'Cameron', 'Henderson', 'Douglas', 'Pelletier', 'Sharma', 'Côté', 'Lavoie'],
    nationality: 'Canadian', language: 'English', country_of_issue: 'Canada', tax_resident_country: 'Canada',
    occupations: [
      { occupation: 'Software Developer', employer: 'Shopify', industry: 'Technology' },
      { occupation: 'Family Physician', employer: 'Private Practice', industry: 'Healthcare' },
      { occupation: 'Mining Engineer', employer: 'Barrick Gold', industry: 'Mining' },
      { occupation: 'University Lecturer', employer: 'McGill University', industry: 'Education' },
      { occupation: 'Financial Planner', employer: 'TD Bank', industry: 'Financial Services' },
      { occupation: 'Marketing Manager', employer: 'Canadian Tire', industry: 'Retail' },
      { occupation: 'Pilot', employer: 'Air Canada', industry: 'Aviation' },
      { occupation: 'Retired', employer: null, industry: 'Retired' },
    ],
  },
  GB: {
    firstNames: [
      { name: 'Oliver', gender: 'Male', title: 'Mr' }, { name: 'George', gender: 'Male', title: 'Mr' },
      { name: 'Arthur', gender: 'Male', title: 'Mr' }, { name: 'Muhammad', gender: 'Male', title: 'Mr' },
      { name: 'Raj', gender: 'Male', title: 'Mr' }, { name: 'Liam', gender: 'Male', title: 'Mr' },
      { name: 'Callum', gender: 'Male', title: 'Mr' }, { name: 'Declan', gender: 'Male', title: 'Mr' },
      { name: 'Sebastian', gender: 'Male', title: 'Mr' }, { name: 'Alistair', gender: 'Male', title: 'Mr' },
      { name: 'Hamza', gender: 'Male', title: 'Mr' }, { name: 'Rupert', gender: 'Male', title: 'Mr' },
      { name: 'Amelia', gender: 'Female', title: 'Mrs' }, { name: 'Isla', gender: 'Female', title: 'Ms' },
      { name: 'Ava', gender: 'Female', title: 'Mrs' }, { name: 'Priya', gender: 'Female', title: 'Ms' },
      { name: 'Freya', gender: 'Female', title: 'Ms' }, { name: 'Florence', gender: 'Female', title: 'Mrs' },
      { name: 'Sienna', gender: 'Female', title: 'Mrs' }, { name: 'Fatima', gender: 'Female', title: 'Mrs' },
      { name: 'Imogen', gender: 'Female', title: 'Ms' }, { name: 'Harriet', gender: 'Female', title: 'Mrs' },
      { name: 'Poppy', gender: 'Female', title: 'Ms' }, { name: 'Anika', gender: 'Female', title: 'Ms' },
    ],
    lastNames: ['Anderson', 'Clark', 'Wright', 'Hill', 'Turner', 'Collins', 'Morris', 'Ward', 'Cooper', 'Shah', 'Khan', 'Scott', 'Stewart', 'Marshall', 'Hughes', 'Russell', 'Patel', 'Ellis', 'Dixon', 'Gibson'],
    nationality: 'British', language: 'English', country_of_issue: 'United Kingdom', tax_resident_country: 'United Kingdom',
    occupations: [
      { occupation: 'Solicitor', employer: 'Clifford Chance', industry: 'Legal' },
      { occupation: 'GP', employer: 'NHS', industry: 'Healthcare' },
      { occupation: 'Chartered Surveyor', employer: 'CBRE', industry: 'Real Estate' },
      { occupation: 'Civil Servant', employer: 'HM Treasury', industry: 'Government' },
      { occupation: 'Software Engineer', employer: 'ARM Holdings', industry: 'Technology' },
      { occupation: 'Teacher', employer: 'Eton College', industry: 'Education' },
      { occupation: 'Actuary', employer: 'Aviva', industry: 'Insurance' },
      { occupation: 'Retired', employer: null, industry: 'Retired' },
    ],
  },
  US: {
    firstNames: [
      { name: 'James', gender: 'Male', title: 'Mr' }, { name: 'Benjamin', gender: 'Male', title: 'Mr' },
      { name: 'Ethan', gender: 'Male', title: 'Mr' }, { name: 'Alexander', gender: 'Male', title: 'Mr' },
      { name: 'Diego', gender: 'Male', title: 'Mr' }, { name: 'Tyler', gender: 'Male', title: 'Mr' },
      { name: 'Kwame', gender: 'Male', title: 'Mr' }, { name: 'Ryan', gender: 'Male', title: 'Mr' },
      { name: 'Marcus', gender: 'Male', title: 'Mr' }, { name: 'Javier', gender: 'Male', title: 'Mr' },
      { name: 'Andre', gender: 'Male', title: 'Mr' }, { name: 'Caleb', gender: 'Male', title: 'Mr' },
      { name: 'Emily', gender: 'Female', title: 'Mrs' }, { name: 'Sophia', gender: 'Female', title: 'Ms' },
      { name: 'Ava', gender: 'Female', title: 'Ms' }, { name: 'Mia', gender: 'Female', title: 'Mrs' },
      { name: 'Luna', gender: 'Female', title: 'Ms' }, { name: 'Camila', gender: 'Female', title: 'Mrs' },
      { name: 'Aisha', gender: 'Female', title: 'Ms' }, { name: 'Hannah', gender: 'Female', title: 'Mrs' },
      { name: 'Jasmine', gender: 'Female', title: 'Ms' }, { name: 'Aaliyah', gender: 'Female', title: 'Ms' },
      { name: 'Savannah', gender: 'Female', title: 'Mrs' }, { name: 'Valentina', gender: 'Female', title: 'Ms' },
    ],
    lastNames: ['Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Garcia', 'Clark', 'Lewis', 'Walker', 'Hall', 'Young', 'Allen', 'King', 'Wright', 'Lopez', 'Scott', 'Adams', 'Nelson', 'Carter'],
    nationality: 'American', language: 'English', country_of_issue: 'United States', tax_resident_country: 'United States',
    occupations: [
      { occupation: 'Attorney', employer: 'Skadden', industry: 'Legal' },
      { occupation: 'Dermatologist', employer: 'Private Practice', industry: 'Healthcare' },
      { occupation: 'Data Scientist', employer: 'Google', industry: 'Technology' },
      { occupation: 'CPA', employer: 'KPMG', industry: 'Accounting' },
      { occupation: 'Civil Engineer', employer: 'Bechtel', industry: 'Engineering' },
      { occupation: 'Nurse Practitioner', employer: 'Mayo Clinic', industry: 'Healthcare' },
      { occupation: 'Marketing Director', employer: 'Procter & Gamble', industry: 'Consumer Goods' },
      { occupation: 'Retired', employer: null, industry: 'Retired' },
    ],
  },
}

// Phone formatters per jurisdiction
function generatePhone(jurisdiction: string, seq: number): string {
  switch (jurisdiction) {
    case 'ZA': return `+27 ${70 + (seq % 15)} ${String(100 + seq).slice(-3)} ${String(1000 + seq * 7).slice(-4)}`
    case 'AU': return `+61 4 ${String(1000 + seq).slice(-4)} ${String(2000 + seq * 3).slice(-4)}`
    case 'CA': return `+1 ${String(416 + (seq % 200)).slice(-3)} ${String(100 + seq).slice(-3)} ${String(1000 + seq * 11).slice(-4)}`
    case 'GB': return `+44 7${String(100 + seq).slice(-3)} ${String(100000 + seq * 13).slice(-6)}`
    case 'US': return `+1 ${String(212 + (seq % 400)).slice(-3)} ${String(100 + seq).slice(-3)} ${String(1000 + seq * 9).slice(-4)}`
    default: return `+27 ${70 + (seq % 15)} ${String(100 + seq).slice(-3)} ${String(1000 + seq * 7).slice(-4)}`
  }
}

function generateAdditionalClients(
  existingDbNames: Set<string>,
  existingDbIds: Set<string>,
  dbCountsByAdvisor: Record<string, number>,
  targetPerAdvisor: number = 24,
): DemoClient[] {
  const additionalClients: DemoClient[] = []
  // Start sequence high to avoid collisions with previous seeds
  let globalSeq = 2000

  // Collect all known names for dedup: static + DB
  const usedNamesGlobal = new Set<string>()
  demoClients.forEach(dc => {
    usedNamesGlobal.add(`${dc.first_name}|${dc.surname}`.toLowerCase())
  })
  existingDbNames.forEach(name => usedNamesGlobal.add(name))

  for (const [jurisdiction, advisors] of Object.entries(advisorsByJurisdiction)) {
    const pool = namePools[jurisdiction]
    if (!pool) continue

    // Global name index for this jurisdiction - increments across all advisors
    let nameIdx = 0
    const totalPoolSize = pool.firstNames.length * pool.lastNames.length

    // Generate to reach target per advisor using ACTUAL DB counts
    for (let advIdx = 0; advIdx < advisors.length; advIdx++) {
      const advisor = advisors[advIdx]
      const actualCount = dbCountsByAdvisor[advisor] || 0
      const needed = Math.max(0, targetPerAdvisor - actualCount)

      if (needed === 0) {
        continue // don't advance nameIdx unnecessarily
      }

      let generated = 0
      let attempts = 0
      const maxAttempts = totalPoolSize // try every combo in the pool if needed

      while (generated < needed && attempts < maxAttempts) {
        attempts++
        const fnEntry = pool.firstNames[nameIdx % pool.firstNames.length]
        const lastName = pool.lastNames[Math.floor(nameIdx / pool.firstNames.length) % pool.lastNames.length]
        nameIdx++

        const nameKey = `${fnEntry.name}|${lastName}`.toLowerCase()
        if (usedNamesGlobal.has(nameKey)) {
          continue // skip duplicate name combo
        }
        usedNamesGlobal.add(nameKey)

        // Find a globalSeq that produces a non-colliding id_number
        let idNumber: string
        do {
          globalSeq++
          idNumber = generateIdForJurisdiction(jurisdiction, globalSeq, 40, fnEntry.gender)
        } while (existingDbIds.has(idNumber.toLowerCase()))
        existingDbIds.add(idNumber.toLowerCase())

        const occ = pool.occupations[(advIdx + generated) % pool.occupations.length]
        const age = 28 + ((advIdx * 7 + generated * 3) % 45)
        // Re-generate with correct age
        const finalIdNumber = generateIdForJurisdiction(jurisdiction, globalSeq, age, fnEntry.gender)
        existingDbIds.add(finalIdNumber.toLowerCase())

        const email = `${fnEntry.name.toLowerCase().replace(/[^a-z]/g, '')}.${lastName.toLowerCase().replace(/[^a-z]/g, '')}${globalSeq}@email.com`
        const initials = `${fnEntry.name[0]}${lastName[0]}`

        additionalClients.push({
          first_name: fnEntry.name,
          surname: lastName,
          advisor,
          nationality: pool.nationality,
          language: pool.language,
          client_type: 'individual',
          age,
          gender: fnEntry.gender,
          title: fnEntry.title,
          email,
          cell_number: generatePhone(jurisdiction, globalSeq),
          work_number: (generated % 3 === 0) ? generatePhone(jurisdiction, globalSeq + 1000) : null,
          home_number: null,
          occupation: occ.occupation,
          employer: occ.employer,
          industry: occ.industry,
          id_number: finalIdNumber,
          tax_number: `GEN${String(globalSeq).padStart(8, '0')}`,
          country_of_issue: pool.country_of_issue,
          tax_resident_country: pool.tax_resident_country,
          preferred_contact: (generated % 2 === 0) ? 'Email' : 'Cell',
          initials,
        })
        generated++
      }
      console.log(`${advisor}: actual=${actualCount}, needed=${needed}, generated=${generated}`)
    }
  }

  return additionalClients
}

// ==================== MAIN FUNCTION ====================

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

    // Create Supabase client with service role key
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

    // Get existing clients (handle >1000 with pagination)
    let existingClients: Array<{id: string, first_name: string, surname: string, email: string | null, cell_number: string | null, id_number: string | null, advisor: string | null, country_of_issue: string | null, created_at: string}> = []
    let page = 0
    const pageSize = 1000
    while (true) {
      const { data: batch, error: batchError } = await supabase
        .from('clients')
        .select('id, first_name, surname, email, cell_number, id_number, advisor, country_of_issue, created_at')
        .eq('user_id', user.id)
        .range(page * pageSize, (page + 1) * pageSize - 1)
        .order('created_at', { ascending: true })
      
      if (batchError) {
        console.error('Error fetching existing clients:', batchError)
        return new Response(
          JSON.stringify({ error: 'Failed to check existing clients' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      existingClients = existingClients.concat(batch || [])
      if (!batch || batch.length < pageSize) break
      page++
    }

    console.log(`User has ${existingClients.length} existing clients`)

    // Calculate date of birth from age
    const calculateDOB = (age: number | null): string | null => {
      if (age === null) return null
      const today = new Date()
      const birthYear = today.getFullYear() - age
      return `${birthYear}-06-15`
    }

    // Map preferred_contact values to allowed check constraint values
    const mapPreferredContact = (val: string): string => {
      const mapping: Record<string, string> = {
        'Cell': 'Phone',
        'Home': 'Phone',
        'Mobile': 'Phone',
      }
      return mapping[val] || val
    }

    // Create a Set of existing names for fast lookup (case-insensitive)
    const existingNames = new Set(
      existingClients.map(c => `${c.first_name}|${c.surname}`.toLowerCase())
    )

    // ==================== COMPUTE PER-ADVISOR DB COUNTS ====================
    const TARGET_PER_ADVISOR = 24
    const dbCountsByAdvisor: Record<string, number> = {}
    for (const advisors of Object.values(advisorsByJurisdiction)) {
      advisors.forEach(a => { dbCountsByAdvisor[a] = 0 })
    }
    existingClients.forEach(c => {
      if (c.advisor && dbCountsByAdvisor[c.advisor] !== undefined) {
        dbCountsByAdvisor[c.advisor]++
      }
    })
    console.log('Per-advisor DB counts:', JSON.stringify(dbCountsByAdvisor))

    // ==================== STEP 0: Trim advisors with >TARGET clients ====================
    let trimmedCount = 0
    for (const [advisor, count] of Object.entries(dbCountsByAdvisor)) {
      if (count > TARGET_PER_ADVISOR) {
        const excess = count - TARGET_PER_ADVISOR
        // Get the newest excess clients for this advisor (keep oldest)
        const advisorClients = existingClients
          .filter(c => c.advisor === advisor)
          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        
        const toDelete = advisorClients.slice(TARGET_PER_ADVISOR).map(c => c.id)
        if (toDelete.length > 0) {
          console.log(`Trimming ${toDelete.length} excess clients from ${advisor}`)
          
          // Delete child records first (all dependent tables)
          const childTables = [
            'task_clients', 'client_notes', 'client_products', 'client_relationships',
            'client_contacts', 'client_assets', 'client_income', 'client_expenses',
            'client_liabilities', 'client_goals', 'calendar_events', 'advice_workflows',
            'client_communications', 'client_documents', 'client_compliance_items',
            'project_opportunities', 'commissions', 'financial_planning_workflows',
            'portfolios', 'portfolio_holdings', 'tlh_opportunities', 'tlh_trade_history',
          ]
          
          for (const table of childTables) {
            const { error: childErr } = await supabase
              .from(table)
              .delete()
              .in('client_id', toDelete)
            if (childErr && !childErr.message?.includes('does not exist')) {
              console.error(`Error deleting from ${table}:`, childErr.message)
            }
          }
          
          // Delete the excess clients
          const { error: delErr } = await supabase
            .from('clients')
            .delete()
            .in('id', toDelete)
          
          if (delErr) {
            console.error(`Error trimming ${advisor}:`, delErr)
          } else {
            trimmedCount += toDelete.length
            dbCountsByAdvisor[advisor] = TARGET_PER_ADVISOR
            // Remove trimmed names from existingNames so new ones can be inserted if needed
            toDelete.forEach(id => {
              const client = existingClients.find(c => c.id === id)
              if (client) {
                existingNames.delete(`${client.first_name}|${client.surname}`.toLowerCase())
              }
            })
          }
        }
      }
    }
    if (trimmedCount > 0) {
      console.log(`Trimmed ${trimmedCount} excess clients total`)
    }

    // Build set of existing id_numbers for collision avoidance
    const existingIdNumbers = new Set(
      existingClients.filter(c => c.id_number).map(c => c.id_number!.toLowerCase())
    )

    // Generate additional clients based on ACTUAL DB counts
    const generatedClients = generateAdditionalClients(existingNames, existingIdNumbers, dbCountsByAdvisor, TARGET_PER_ADVISOR)
    const allDemoClients = [...demoClients, ...generatedClients]
    console.log(`Total demo clients defined: ${allDemoClients.length} (${demoClients.length} static + ${generatedClients.length} generated)`)

    // ==================== STEP 1: Reassign orphan advisor clients ====================
    const orphanClients = (existingClients || []).filter(ec =>
      ec.advisor && orphanAdvisors.includes(ec.advisor) || !ec.advisor
    )
    
    let reassignedCount = 0
    if (orphanClients.length > 0) {
      const zaAdvisors = advisorsByJurisdiction['ZA']
      console.log(`Reassigning ${orphanClients.length} orphan advisor clients to ZA advisors`)
      
      for (let i = 0; i < orphanClients.length; i++) {
        const newAdvisor = zaAdvisors[i % zaAdvisors.length]
        const { error: reassignError } = await supabase
          .from('clients')
          .update({ advisor: newAdvisor })
          .eq('id', orphanClients[i].id)
        
        if (!reassignError) {
          reassignedCount++
        } else {
          console.error(`Error reassigning client ${orphanClients[i].id}:`, reassignError)
        }
      }
    }

    // ==================== STEP 2: Update existing clients missing data ====================
    const clientsToUpdate = (existingClients || []).filter(ec => !ec.email || !ec.cell_number || !ec.id_number)
    let updatedCount = 0
    let idBackfillCount = 0

    if (clientsToUpdate.length > 0) {
      console.log(`Updating ${clientsToUpdate.length} existing clients with missing data`)
      
      for (const existingClient of clientsToUpdate) {
        const demoClient = allDemoClients.find(dc => 
          dc.first_name.toLowerCase() === existingClient.first_name?.toLowerCase() &&
          dc.surname.toLowerCase() === existingClient.surname?.toLowerCase()
        )
        
        if (demoClient) {
          const updateData: Record<string, unknown> = {}
          
          // Always update these fields if demo data has them
          if (!existingClient.email && demoClient.email) updateData.email = demoClient.email
          if (!existingClient.cell_number && demoClient.cell_number) updateData.cell_number = demoClient.cell_number
          if (!existingClient.id_number && demoClient.id_number) updateData.id_number = demoClient.id_number
          
          // If no specific missing fields, do a full update
          if (Object.keys(updateData).length === 0) {
            updateData.id_number = demoClient.id_number
          }
          
          // Also update other fields
          updateData.work_number = demoClient.work_number
          updateData.home_number = demoClient.home_number
          updateData.preferred_contact = mapPreferredContact(demoClient.preferred_contact)
          updateData.gender = demoClient.gender
          updateData.title = demoClient.title || null
          updateData.initials = demoClient.initials
          updateData.occupation = demoClient.occupation
          updateData.employer = demoClient.employer
          updateData.industry = demoClient.industry
          updateData.tax_number = demoClient.tax_number
          updateData.country_of_issue = demoClient.country_of_issue
          updateData.tax_resident_country = demoClient.tax_resident_country
          
          const { error: updateError } = await supabase
            .from('clients')
            .update(updateData)
            .eq('id', existingClient.id)
          
          if (!updateError) {
            updatedCount++
            if (!existingClient.id_number) idBackfillCount++
          } else {
            console.error(`Error updating client ${existingClient.id}:`, updateError)
          }
        } else if (!existingClient.id_number) {
          // Client not in demo data but missing id_number - generate one
          const jurisdiction = countryToJurisdiction(existingClient.country_of_issue)
          const backfillSeq = 900 + idBackfillCount
          const generatedId = generateIdForJurisdiction(jurisdiction, backfillSeq, 40, null)
          
          const { error: backfillError } = await supabase
            .from('clients')
            .update({ id_number: generatedId })
            .eq('id', existingClient.id)
          
          if (!backfillError) {
            idBackfillCount++
          } else {
            console.error(`Error backfilling id_number for ${existingClient.id}:`, backfillError)
          }
        }
      }
    }

    // ==================== STEP 3: Insert new clients ====================
    const clientsToInsert = allDemoClients
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
        email: client.email,
        cell_number: client.cell_number,
        work_number: client.work_number,
        home_number: client.home_number,
        preferred_contact: mapPreferredContact(client.preferred_contact),
        gender: client.gender,
        title: client.title || null,
        initials: client.initials,
        id_number: client.id_number,
        occupation: client.occupation,
        employer: client.employer,
        industry: client.industry,
        tax_number: client.tax_number,
        country_of_issue: client.country_of_issue,
        tax_resident_country: client.tax_resident_country,
      }))

    let insertedCount = 0
    
    if (clientsToInsert.length > 0) {
      console.log(`Inserting ${clientsToInsert.length} new clients`)

      // Insert in small batches of 10 to minimize impact of individual id_number collisions
      const batchSize = 10
      for (let i = 0; i < clientsToInsert.length; i += batchSize) {
        const batch = clientsToInsert.slice(i, i + batchSize)
        const { data: insertedClients, error: insertError } = await supabase
          .from('clients')
          .insert(batch)
          .select('id')

        if (insertError) {
          console.error(`Error inserting batch ${Math.floor(i / batchSize) + 1}:`, insertError)
          // Fall back to individual inserts for this batch
          for (const client of batch) {
            const { data: singleInsert, error: singleError } = await supabase
              .from('clients')
              .insert(client)
              .select('id')
            if (singleError) {
              console.error(`Error inserting ${client.first_name} ${client.surname}: ${singleError.message}`)
            } else {
              insertedCount += 1
            }
          }
          continue
        }
        
        insertedCount += insertedClients?.length || 0
        console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}: ${insertedClients?.length || 0} clients`)
      }
    }

    // If nothing to do
    if (clientsToInsert.length === 0 && updatedCount === 0 && reassignedCount === 0 && trimmedCount === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'All demo clients already exist with full data', 
          seeded: false, 
          existingCount: existingClients.length
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Re-count final total
    const { count: finalCount } = await supabase
      .from('clients')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)

    return new Response(
      JSON.stringify({ 
        message: 'Demo clients seeded/updated successfully', 
        seeded: true, 
        insertedCount,
        trimmedCount,
        updatedCount,
        reassignedCount,
        idBackfillCount,
        previousCount: existingClients.length,
        finalCount: finalCount || 0,
        totalDemoClients: allDemoClients.length,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
