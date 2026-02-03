export interface ProviderData {
  name: string;
  bookPercent: string;
  value: string;
}

export interface TopAccountData {
  investor: string;
  bookPercent: string;
  value: string;
}

export interface BirthdayData {
  name: string;
  nextBirthday: string;
  age: number;
}

export interface ProductData {
  name: string;
  value: number;
  color: string;
}

export interface ClientsByValueData {
  range: string;
  value: string;
  investors: number;
}

export interface AdvisorData {
  initials: string;
  name: string;
}

export interface RegionalData {
  currencySymbol: string;
  totalAUM: string;
  providers: ProviderData[];
  topAccounts: TopAccountData[];
  birthdays: BirthdayData[];
  products: ProductData[];
  clientsByValue: ClientsByValueData[];
  advisors: AdvisorData[];
}

const southAfricaData: RegionalData = {
  currencySymbol: "R",
  totalAUM: "3,667,726,572.38",
  providers: [
    { name: "Ninety One", bookPercent: "55.3 %", value: "R 2,026,539,331" },
    { name: "Old Mutual International", bookPercent: "10.6 %", value: "R 387,751,193" },
    { name: "Allan Gray", bookPercent: "9.5 %", value: "R 348,470,019" },
    { name: "Sanlam Glacier", bookPercent: "4.9 %", value: "R 178,833,622" },
    { name: "Investec Corporate Cash", bookPercent: "3.8 %", value: "R 139,656,065" },
  ],
  topAccounts: [
    { investor: "NG Kerk Sinode Oos-Kaapland", bookPercent: "1.1 %", value: "R 41,926,359.70" },
    { investor: "De Villiers, Jean", bookPercent: "1.0 %", value: "R 36,258,037.37" },
    { investor: "Louw, Rudolph", bookPercent: "0.9 %", value: "R 34,277,493.78" },
    { investor: "Daan Van Der Sijde", bookPercent: "0.9 %", value: "R 31,913,925.69" },
    { investor: "Philippus Koon", bookPercent: "0.8 %", value: "R 28,160,599.60" },
  ],
  birthdays: [
    { name: "Andre Thomas Coetzer", nextBirthday: "28 January", age: 42 },
    { name: "Elsie Sophia Lourens", nextBirthday: "28 January", age: 65 },
    { name: "Samuel de Jager", nextBirthday: "28 January", age: 69 },
    { name: "Elana Wasmuth", nextBirthday: "28 January", age: 34 },
    { name: "Angeline Loraine Mostert", nextBirthday: "28 January", age: 63 },
    { name: "Esther Amanda Nieman", nextBirthday: "28 January", age: 74 },
    { name: "Melia Nocwaka Malgas", nextBirthday: "28 January", age: 73 },
    { name: "Denise Thiart", nextBirthday: "28 January", age: 69 },
    { name: "Elizabeth Saunders", nextBirthday: "28 January", age: 77 },
    { name: "Zonwabele Harry Molefe", nextBirthday: "28 January", age: 64 },
  ],
  products: [
    { name: "Cash Management", value: 12.2, color: "hsl(210, 70%, 40%)" },
    { name: "Endowment", value: 14.0, color: "hsl(142, 76%, 36%)" },
    { name: "Investment Plan", value: 5.8, color: "hsl(45, 93%, 47%)" },
    { name: "Living Annuity", value: 21.2, color: "hsl(280, 65%, 50%)" },
    { name: "Other", value: 1.3, color: "hsl(0, 0%, 60%)" },
    { name: "Pension Preservation Fund", value: 5.9, color: "hsl(210, 100%, 50%)" },
    { name: "Preservation Fund", value: 39.1, color: "hsl(160, 60%, 45%)" },
    { name: "Provident Preservation Fund", value: 0.5, color: "hsl(18, 86%, 56%)" },
  ],
  clientsByValue: [
    { range: "R0 – R100 000", value: "R 15,579,983", investors: 468 },
    { range: "R100 001 – R1M", value: "R 371,511,255", investors: 850 },
    { range: "R1 000 001 – R3M", value: "R 831,330,967", investors: 469 },
    { range: "R3 000 001 – R10M", value: "R 1,501,814,056", investors: 286 },
    { range: "> R10M", value: "R 947,490,312", investors: 52 },
  ],
  advisors: [
    { initials: "CZ", name: "Christo van Zyl" },
    { initials: "DH", name: "Dale Harding" },
    { initials: "EW", name: "Emile Wegner" },
    { initials: "IN", name: "Ihan Nel" },
    { initials: "RS", name: "Riaan Swart" },
  ],
};

const australiaData: RegionalData = {
  currencySymbol: "A$",
  totalAUM: "4,389,625,872.00",
  providers: [
    { name: "Macquarie Wrap", bookPercent: "42.1 %", value: "A$ 1,847,293,441" },
    { name: "AMP North", bookPercent: "18.3 %", value: "A$ 803,156,229" },
    { name: "BT Wrap", bookPercent: "15.7 %", value: "A$ 689,321,847" },
    { name: "Colonial First State", bookPercent: "12.4 %", value: "A$ 544,871,203" },
    { name: "Hub24", bookPercent: "11.5 %", value: "A$ 504,983,152" },
  ],
  topAccounts: [
    { investor: "Melbourne Grammar School Foundation", bookPercent: "1.3 %", value: "A$ 57,182,341.50" },
    { investor: "O'Connor, Michael", bookPercent: "1.1 %", value: "A$ 48,347,892.30" },
    { investor: "Thompson, Sarah", bookPercent: "0.9 %", value: "A$ 39,506,632.85" },
    { investor: "Williams, David", bookPercent: "0.8 %", value: "A$ 35,117,007.00" },
    { investor: "Brown, Jennifer", bookPercent: "0.7 %", value: "A$ 30,727,381.10" },
  ],
  birthdays: [
    { name: "William James Mitchell", nextBirthday: "3 February", age: 58 },
    { name: "Sarah Elizabeth Thompson", nextBirthday: "3 February", age: 44 },
    { name: "James Robert O'Brien", nextBirthday: "4 February", age: 52 },
    { name: "Emily Rose Anderson", nextBirthday: "4 February", age: 37 },
    { name: "Michael Patrick Kelly", nextBirthday: "5 February", age: 61 },
    { name: "Charlotte Grace Wilson", nextBirthday: "5 February", age: 55 },
    { name: "Thomas Edward Murphy", nextBirthday: "6 February", age: 48 },
    { name: "Olivia Jane Campbell", nextBirthday: "6 February", age: 42 },
    { name: "Henry William Scott", nextBirthday: "7 February", age: 67 },
    { name: "Sophie Anne Martin", nextBirthday: "7 February", age: 39 },
  ],
  products: [
    { name: "Superannuation", value: 35.2, color: "hsl(210, 70%, 40%)" },
    { name: "SMSF", value: 22.8, color: "hsl(142, 76%, 36%)" },
    { name: "Pension Phase", value: 18.4, color: "hsl(45, 93%, 47%)" },
    { name: "Investment Bond", value: 12.1, color: "hsl(280, 65%, 50%)" },
    { name: "Managed Fund", value: 6.8, color: "hsl(0, 0%, 60%)" },
    { name: "Direct Shares", value: 3.2, color: "hsl(210, 100%, 50%)" },
    { name: "Term Deposit", value: 1.5, color: "hsl(160, 60%, 45%)" },
  ],
  clientsByValue: [
    { range: "A$0 – A$100,000", value: "A$ 18,947,231", investors: 512 },
    { range: "A$100,001 – A$500K", value: "A$ 284,127,582", investors: 723 },
    { range: "A$500,001 – A$1M", value: "A$ 567,834,291", investors: 682 },
    { range: "A$1M – A$5M", value: "A$ 1,892,471,038", investors: 518 },
    { range: "> A$5M", value: "A$ 1,626,245,730", investors: 89 },
  ],
  advisors: [
    { initials: "JM", name: "James Mitchell" },
    { initials: "ST", name: "Sarah Thompson" },
    { initials: "MO", name: "Michael O'Brien" },
    { initials: "EA", name: "Emily Anderson" },
    { initials: "TM", name: "Thomas Murphy" },
  ],
};

const canadaData: RegionalData = {
  currencySymbol: "C$",
  totalAUM: "5,572,649,990.00",
  providers: [
    { name: "RBC Dominion Securities", bookPercent: "32.4 %", value: "C$ 1,805,538,597" },
    { name: "TD Wealth Private", bookPercent: "24.8 %", value: "C$ 1,382,016,998" },
    { name: "CIBC Wood Gundy", bookPercent: "18.2 %", value: "C$ 1,014,222,298" },
    { name: "BMO Nesbitt Burns", bookPercent: "14.1 %", value: "C$ 785,743,649" },
    { name: "National Bank Financial", bookPercent: "10.5 %", value: "C$ 585,128,449" },
  ],
  topAccounts: [
    { investor: "Toronto General Hospital Foundation", bookPercent: "1.4 %", value: "C$ 78,017,100.00" },
    { investor: "Tremblay, Pierre", bookPercent: "1.2 %", value: "C$ 66,871,800.00" },
    { investor: "Roy, Marie-Claire", bookPercent: "1.0 %", value: "C$ 55,726,500.00" },
    { investor: "Gagnon, Jean-Luc", bookPercent: "0.9 %", value: "C$ 50,153,850.00" },
    { investor: "MacDonald, Angus", bookPercent: "0.8 %", value: "C$ 44,581,200.00" },
  ],
  birthdays: [
    { name: "Pierre Antoine Tremblay", nextBirthday: "4 February", age: 56 },
    { name: "Marie-Claire Bouchard", nextBirthday: "4 February", age: 48 },
    { name: "James William MacDonald", nextBirthday: "5 February", age: 63 },
    { name: "Sophie Anne Gagnon", nextBirthday: "5 February", age: 41 },
    { name: "Robert Michael Singh", nextBirthday: "6 February", age: 54 },
    { name: "Catherine Marie Roy", nextBirthday: "6 February", age: 67 },
    { name: "David Chen Wong", nextBirthday: "7 February", age: 45 },
    { name: "Elizabeth Anne Thompson", nextBirthday: "7 February", age: 59 },
    { name: "François Xavier Leblanc", nextBirthday: "8 February", age: 72 },
    { name: "Jennifer Mary O'Brien", nextBirthday: "8 February", age: 38 },
  ],
  products: [
    { name: "RRSP", value: 28.4, color: "hsl(210, 70%, 40%)" },
    { name: "TFSA", value: 19.2, color: "hsl(142, 76%, 36%)" },
    { name: "RRIF", value: 16.8, color: "hsl(45, 93%, 47%)" },
    { name: "Non-Registered", value: 14.5, color: "hsl(280, 65%, 50%)" },
    { name: "RESP", value: 8.3, color: "hsl(0, 0%, 60%)" },
    { name: "LIRA", value: 7.2, color: "hsl(210, 100%, 50%)" },
    { name: "Corporate Account", value: 5.6, color: "hsl(160, 60%, 45%)" },
  ],
  clientsByValue: [
    { range: "C$0 – C$100,000", value: "C$ 22,290,600", investors: 534 },
    { range: "C$100,001 – C$500K", value: "C$ 334,358,999", investors: 812 },
    { range: "C$500,001 – C$1M", value: "C$ 668,717,999", investors: 756 },
    { range: "C$1M – C$5M", value: "C$ 2,229,059,996", investors: 623 },
    { range: "> C$5M", value: "C$ 2,318,222,396", investors: 142 },
  ],
  advisors: [
    { initials: "PT", name: "Pierre Tremblay" },
    { initials: "MB", name: "Marie Bouchard" },
    { initials: "JM", name: "James MacDonald" },
    { initials: "SG", name: "Sophie Gagnon" },
    { initials: "RS", name: "Robert Singh" },
  ],
};

const unitedKingdomData: RegionalData = {
  currencySymbol: "£",
  totalAUM: "2,847,392,156.00",
  providers: [
    { name: "Hargreaves Lansdown", bookPercent: "36.2 %", value: "£ 1,030,755,960" },
    { name: "AJ Bell Youinvest", bookPercent: "22.4 %", value: "£ 637,815,843" },
    { name: "Interactive Investor", bookPercent: "17.8 %", value: "£ 506,835,644" },
    { name: "Fidelity Personal Investing", bookPercent: "13.1 %", value: "£ 373,008,372" },
    { name: "Vanguard UK", bookPercent: "10.5 %", value: "£ 298,976,176" },
  ],
  topAccounts: [
    { investor: "The Royal Foundation", bookPercent: "1.5 %", value: "£ 42,710,882.34" },
    { investor: "Smith, William", bookPercent: "1.2 %", value: "£ 34,168,706.00" },
    { investor: "Jones, Elizabeth", bookPercent: "1.0 %", value: "£ 28,473,922.00" },
    { investor: "Williams, Thomas", bookPercent: "0.9 %", value: "£ 25,626,529.00" },
    { investor: "Taylor, James", bookPercent: "0.8 %", value: "£ 22,779,137.00" },
  ],
  birthdays: [
    { name: "William Arthur Smith", nextBirthday: "5 February", age: 64 },
    { name: "Elizabeth Mary Jones", nextBirthday: "5 February", age: 52 },
    { name: "Thomas Edward Williams", nextBirthday: "6 February", age: 47 },
    { name: "Victoria Anne Brown", nextBirthday: "6 February", age: 58 },
    { name: "James Robert Taylor", nextBirthday: "7 February", age: 71 },
    { name: "Charlotte Emma Davies", nextBirthday: "7 February", age: 43 },
    { name: "George Henry Wilson", nextBirthday: "8 February", age: 66 },
    { name: "Amelia Rose Evans", nextBirthday: "8 February", age: 39 },
    { name: "Oliver Charles Thomas", nextBirthday: "9 February", age: 55 },
    { name: "Isabella Grace Roberts", nextBirthday: "9 February", age: 48 },
  ],
  products: [
    { name: "Stocks & Shares ISA", value: 31.5, color: "hsl(210, 70%, 40%)" },
    { name: "SIPP", value: 24.8, color: "hsl(142, 76%, 36%)" },
    { name: "General Investment Account", value: 18.2, color: "hsl(45, 93%, 47%)" },
    { name: "Junior ISA", value: 8.7, color: "hsl(280, 65%, 50%)" },
    { name: "Cash ISA", value: 7.4, color: "hsl(0, 0%, 60%)" },
    { name: "Lifetime ISA", value: 5.2, color: "hsl(210, 100%, 50%)" },
    { name: "Offshore Bond", value: 4.2, color: "hsl(160, 60%, 45%)" },
  ],
  clientsByValue: [
    { range: "£0 – £50,000", value: "£ 14,236,961", investors: 423 },
    { range: "£50,001 – £250K", value: "£ 199,317,451", investors: 687 },
    { range: "£250,001 – £500K", value: "£ 398,634,902", investors: 542 },
    { range: "£500,001 – £2M", value: "£ 1,138,956,862", investors: 398 },
    { range: "> £2M", value: "£ 1,096,245,980", investors: 76 },
  ],
  advisors: [
    { initials: "WS", name: "William Smith" },
    { initials: "EJ", name: "Elizabeth Jones" },
    { initials: "TW", name: "Thomas Williams" },
    { initials: "VB", name: "Victoria Brown" },
    { initials: "JT", name: "James Taylor" },
  ],
};

const unitedStatesData: RegionalData = {
  currencySymbol: "$",
  totalAUM: "5,572,649,990.00",
  providers: [
    { name: "Fidelity Investments", bookPercent: "38.7 %", value: "$ 2,156,595,346" },
    { name: "Charles Schwab", bookPercent: "24.2 %", value: "$ 1,348,581,298" },
    { name: "Vanguard", bookPercent: "19.8 %", value: "$ 1,103,384,498" },
    { name: "TD Ameritrade", bookPercent: "10.1 %", value: "$ 562,837,649" },
    { name: "E*TRADE", bookPercent: "7.2 %", value: "$ 401,250,719" },
  ],
  topAccounts: [
    { investor: "St. Mary's Hospital Foundation", bookPercent: "1.4 %", value: "$ 78,017,100.00" },
    { investor: "Johnson, Robert", bookPercent: "1.2 %", value: "$ 66,871,800.00" },
    { investor: "Williams, Patricia", bookPercent: "1.0 %", value: "$ 55,726,500.00" },
    { investor: "Garcia, Miguel", bookPercent: "0.9 %", value: "$ 50,153,850.00" },
    { investor: "Martinez, Isabella", bookPercent: "0.8 %", value: "$ 44,581,200.00" },
  ],
  birthdays: [
    { name: "Michael David Johnson", nextBirthday: "5 February", age: 52 },
    { name: "Jennifer Marie Williams", nextBirthday: "5 February", age: 47 },
    { name: "Robert James Brown", nextBirthday: "6 February", age: 61 },
    { name: "Maria Elena Garcia", nextBirthday: "6 February", age: 44 },
    { name: "William Thomas Davis", nextBirthday: "7 February", age: 58 },
    { name: "Patricia Ann Martinez", nextBirthday: "7 February", age: 53 },
    { name: "James Michael Wilson", nextBirthday: "8 February", age: 67 },
    { name: "Linda Sue Anderson", nextBirthday: "8 February", age: 49 },
    { name: "David Lee Thompson", nextBirthday: "9 February", age: 72 },
    { name: "Susan Marie Jackson", nextBirthday: "9 February", age: 56 },
  ],
  products: [
    { name: "401(k)", value: 32.1, color: "hsl(210, 70%, 40%)" },
    { name: "Traditional IRA", value: 24.3, color: "hsl(142, 76%, 36%)" },
    { name: "Roth IRA", value: 18.9, color: "hsl(45, 93%, 47%)" },
    { name: "Brokerage Account", value: 12.4, color: "hsl(280, 65%, 50%)" },
    { name: "529 Plan", value: 6.8, color: "hsl(0, 0%, 60%)" },
    { name: "SEP IRA", value: 3.2, color: "hsl(210, 100%, 50%)" },
    { name: "HSA", value: 2.3, color: "hsl(160, 60%, 45%)" },
  ],
  clientsByValue: [
    { range: "$0 – $100,000", value: "$ 22,290,600", investors: 498 },
    { range: "$100,001 – $500K", value: "$ 334,358,999", investors: 756 },
    { range: "$500,001 – $1M", value: "$ 668,717,999", investors: 684 },
    { range: "$1M – $5M", value: "$ 2,229,059,996", investors: 547 },
    { range: "> $5M", value: "$ 2,318,222,396", investors: 118 },
  ],
  advisors: [
    { initials: "MJ", name: "Michael Johnson" },
    { initials: "JW", name: "Jennifer Williams" },
    { initials: "RB", name: "Robert Brown" },
    { initials: "MG", name: "Maria Garcia" },
    { initials: "WD", name: "William Davis" },
  ],
};

const regionalDataMap: Record<string, RegionalData> = {
  ZA: southAfricaData,
  AU: australiaData,
  CA: canadaData,
  GB: unitedKingdomData,
  US: unitedStatesData,
};

export function getRegionalData(regionCode: string): RegionalData {
  return regionalDataMap[regionCode] || southAfricaData;
}

// Regional Opportunity Data for AI Assistant
export interface RegionalOpportunity {
  clientId: string;
  clientName: string;
  currentValue: number;
  opportunityType: "upsell" | "cross-sell" | "migration" | "platform";
  potentialRevenue: number;
  confidence: number;
  reasoning: string;
  suggestedAction: string;
}

const southAfricaOpportunities: RegionalOpportunity[] = [
  {
    clientId: "za-1",
    clientName: "Johan van der Merwe",
    currentValue: 2500000,
    opportunityType: "upsell",
    potentialRevenue: 125000,
    reasoning: "Client has excess liquidity in low-yield savings. Strong candidate for Living Annuity expansion.",
    suggestedAction: "Recommend diversified Living Annuity portfolio",
    confidence: 85,
  },
  {
    clientId: "za-2",
    clientName: "Thandi Nkosi",
    currentValue: 4200000,
    opportunityType: "migration",
    potentialRevenue: 210000,
    reasoning: "Preservation Fund with external manager underperforming by 3.2%. Ready for house view migration.",
    suggestedAction: "Present house view performance comparison",
    confidence: 92,
  },
  {
    clientId: "za-3",
    clientName: "Pieter du Plessis",
    currentValue: 1800000,
    opportunityType: "cross-sell",
    potentialRevenue: 45000,
    reasoning: "No life cover despite dependents. Gap analysis shows significant protection need.",
    suggestedAction: "Schedule protection needs analysis",
    confidence: 78,
  },
  {
    clientId: "za-4",
    clientName: "Nomvula Dlamini",
    currentValue: 3600000,
    opportunityType: "platform",
    potentialRevenue: 180000,
    reasoning: "Assets spread across 4 providers. Consolidation to Ninety One would reduce fees.",
    suggestedAction: "Propose platform consolidation strategy",
    confidence: 88,
  },
  {
    clientId: "za-5",
    clientName: "Willem Botha",
    currentValue: 890000,
    opportunityType: "upsell",
    potentialRevenue: 35000,
    reasoning: "Recent inheritance not yet invested. Conservative profile but open to Endowment products.",
    suggestedAction: "Discuss balanced Endowment approach",
    confidence: 72,
  },
];

const australiaOpportunities: RegionalOpportunity[] = [
  {
    clientId: "au-1",
    clientName: "James Mitchell",
    currentValue: 3200000,
    opportunityType: "upsell",
    potentialRevenue: 160000,
    reasoning: "Superannuation balance well below contribution cap. Strong salary supports additional contributions.",
    suggestedAction: "Recommend salary sacrifice strategy for Super",
    confidence: 87,
  },
  {
    clientId: "au-2",
    clientName: "Sarah Thompson",
    currentValue: 5100000,
    opportunityType: "migration",
    potentialRevenue: 255000,
    reasoning: "Industry super fund underperforming. SMSF setup would provide better control and returns.",
    suggestedAction: "Present SMSF establishment proposal",
    confidence: 91,
  },
  {
    clientId: "au-3",
    clientName: "Michael O'Brien",
    currentValue: 2100000,
    opportunityType: "cross-sell",
    potentialRevenue: 52500,
    reasoning: "No income protection despite high earning role. Risk assessment shows coverage gap.",
    suggestedAction: "Schedule income protection review",
    confidence: 76,
  },
  {
    clientId: "au-4",
    clientName: "Emily Anderson",
    currentValue: 4400000,
    opportunityType: "platform",
    potentialRevenue: 220000,
    reasoning: "Assets across multiple wrap platforms. Macquarie Wrap consolidation would streamline.",
    suggestedAction: "Propose wrap platform consolidation",
    confidence: 84,
  },
  {
    clientId: "au-5",
    clientName: "David Wilson",
    currentValue: 1200000,
    opportunityType: "upsell",
    potentialRevenue: 48000,
    reasoning: "Approaching preservation age. Pension phase transition opportunity.",
    suggestedAction: "Discuss transition to pension strategy",
    confidence: 79,
  },
];

const canadaOpportunities: RegionalOpportunity[] = [
  {
    clientId: "ca-1",
    clientName: "Pierre Tremblay",
    currentValue: 2800000,
    opportunityType: "upsell",
    potentialRevenue: 140000,
    reasoning: "RRSP contribution room unused for 3 years. Tax optimization opportunity significant.",
    suggestedAction: "Recommend RRSP catch-up strategy",
    confidence: 88,
  },
  {
    clientId: "ca-2",
    clientName: "Marie-Claire Bouchard",
    currentValue: 4600000,
    opportunityType: "migration",
    potentialRevenue: 230000,
    reasoning: "Portfolio with bank advisor underperforming. Independent management would improve returns.",
    suggestedAction: "Present fee and performance comparison",
    confidence: 90,
  },
  {
    clientId: "ca-3",
    clientName: "James MacDonald",
    currentValue: 1900000,
    opportunityType: "cross-sell",
    potentialRevenue: 47500,
    reasoning: "TFSA not maximized. Children approaching university age - RESP opportunity.",
    suggestedAction: "Schedule RESP and TFSA optimization review",
    confidence: 81,
  },
  {
    clientId: "ca-4",
    clientName: "Sophie Gagnon",
    currentValue: 3800000,
    opportunityType: "platform",
    potentialRevenue: 190000,
    reasoning: "Accounts spread across RBC, TD, and CIBC. Consolidation would reduce complexity.",
    suggestedAction: "Propose single-platform consolidation",
    confidence: 86,
  },
  {
    clientId: "ca-5",
    clientName: "Robert Singh",
    currentValue: 950000,
    opportunityType: "upsell",
    potentialRevenue: 38000,
    reasoning: "Recent business sale proceeds in high-interest savings. Investment planning needed.",
    suggestedAction: "Discuss corporate investment structure",
    confidence: 74,
  },
];

const unitedKingdomOpportunities: RegionalOpportunity[] = [
  {
    clientId: "gb-1",
    clientName: "William Smith",
    currentValue: 2200000,
    opportunityType: "upsell",
    potentialRevenue: 110000,
    reasoning: "ISA allowance underutilized for 4 years. Significant tax-free growth opportunity.",
    suggestedAction: "Recommend ISA maximization strategy",
    confidence: 86,
  },
  {
    clientId: "gb-2",
    clientName: "Elizabeth Jones",
    currentValue: 4800000,
    opportunityType: "migration",
    potentialRevenue: 240000,
    reasoning: "SIPP with high-fee provider. Transfer to lower-cost platform would save significantly.",
    suggestedAction: "Present SIPP transfer analysis",
    confidence: 93,
  },
  {
    clientId: "gb-3",
    clientName: "Thomas Williams",
    currentValue: 1600000,
    opportunityType: "cross-sell",
    potentialRevenue: 40000,
    reasoning: "No Junior ISA for children despite high net worth. Intergenerational planning gap.",
    suggestedAction: "Schedule family wealth planning session",
    confidence: 77,
  },
  {
    clientId: "gb-4",
    clientName: "Victoria Brown",
    currentValue: 3400000,
    opportunityType: "platform",
    potentialRevenue: 170000,
    reasoning: "Assets across Hargreaves, AJ Bell, and II. Single platform would improve oversight.",
    suggestedAction: "Propose platform consolidation",
    confidence: 85,
  },
  {
    clientId: "gb-5",
    clientName: "James Taylor",
    currentValue: 780000,
    opportunityType: "upsell",
    potentialRevenue: 31200,
    reasoning: "Lifetime ISA not utilized. First-time buyer or retirement savings opportunity.",
    suggestedAction: "Discuss LISA benefits and strategy",
    confidence: 71,
  },
];

const unitedStatesOpportunities: RegionalOpportunity[] = [
  {
    clientId: "us-1",
    clientName: "Michael Johnson",
    currentValue: 2900000,
    opportunityType: "upsell",
    potentialRevenue: 145000,
    reasoning: "401(k) not maxed despite high income. Catch-up contributions available at 50+.",
    suggestedAction: "Recommend 401(k) maximization strategy",
    confidence: 89,
  },
  {
    clientId: "us-2",
    clientName: "Patricia Williams",
    currentValue: 5200000,
    opportunityType: "migration",
    potentialRevenue: 260000,
    reasoning: "Old employer 401(k) with limited options. IRA rollover would expand investment choices.",
    suggestedAction: "Present IRA rollover benefits",
    confidence: 94,
  },
  {
    clientId: "us-3",
    clientName: "Robert Brown",
    currentValue: 2000000,
    opportunityType: "cross-sell",
    potentialRevenue: 50000,
    reasoning: "No 529 Plan despite children approaching college age. Tax-advantaged savings gap.",
    suggestedAction: "Schedule 529 Plan consultation",
    confidence: 80,
  },
  {
    clientId: "us-4",
    clientName: "Maria Garcia",
    currentValue: 4000000,
    opportunityType: "platform",
    potentialRevenue: 200000,
    reasoning: "Accounts at Fidelity, Schwab, and Vanguard. Consolidation would simplify management.",
    suggestedAction: "Propose brokerage consolidation",
    confidence: 87,
  },
  {
    clientId: "us-5",
    clientName: "David Martinez",
    currentValue: 850000,
    opportunityType: "upsell",
    potentialRevenue: 34000,
    reasoning: "Roth IRA conversion opportunity during lower income year. Tax planning potential.",
    suggestedAction: "Discuss Roth conversion strategy",
    confidence: 73,
  },
];

const regionalOpportunitiesMap: Record<string, RegionalOpportunity[]> = {
  ZA: southAfricaOpportunities,
  AU: australiaOpportunities,
  CA: canadaOpportunities,
  GB: unitedKingdomOpportunities,
  US: unitedStatesOpportunities,
};

export function getRegionalOpportunities(regionCode: string): RegionalOpportunity[] {
  return regionalOpportunitiesMap[regionCode] || southAfricaOpportunities;
}
