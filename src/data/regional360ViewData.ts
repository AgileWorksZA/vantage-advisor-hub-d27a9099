// Regional 360 View Data Configuration and Generation
// Provides dynamic, jurisdiction-specific product data for client 360 views

export interface OnPlatformProduct {
  investmentHouse: string;
  product: string;
  number: string;
  amount: string;
  amountValue: number;
  income: string;
  contribution: string;
  date: string;
  advisor: string;
  expandable: boolean;
  details?: { label: string; amount: string }[];
}

export interface ExternalProduct {
  provider: string;
  product: string;
  contract: string;
  amount: string;
  amountValue: number;
  income: string;
  contribution: string;
  updated: string;
  source: string;
}

export interface PlatformCashAccount {
  name: string;
  dateOpened: string;
  beneficiary: string;
  accountNumber: string;
  amount: string;
  amountValue: number;
  source: string;
  dateClosed: string;
}

export interface WillData {
  hasWill: string;
  dateOfWill: string;
  placeKept: string;
  receiptNumber: string;
  executors: string;
  lastReview: string;
  notes: string;
}

export interface ShortTermProduct {
  insurer: string;
  policyType: string;
  totalPremium: string;
  reviewDate: string;
  broker: string;
  dataDate: string;
  source: string;
}

export interface RiskProduct {
  holdingName: string;
  policyNumber: string;
  effectiveDate: string;
  terminationDate: string;
  paymentAmount: string;
  paidToDate: string;
  paymentDueDate: string;
  notes: string;
}

export interface MedicalAid {
  schemeName: string;
  planName: string;
  membershipNumber: string;
  policyActive: string;
  premium: string;
  dateReceived: string;
  notes: string;
}

export interface Client360Data {
  onPlatformProducts: OnPlatformProduct[];
  externalProducts: ExternalProduct[];
  platformCashAccounts: PlatformCashAccount[];
  willData: WillData[];
  shortTermProducts: ShortTermProduct[];
  riskProducts: RiskProduct[];
  medicalAid: MedicalAid[];
  currencySymbol: string;
  currencyCode: string;
}

interface JurisdictionConfig {
  currencySymbol: string;
  currencyCode: string;
  locale: string;
  platformCashBank: string;
  boardOfExecutors: string;
  onPlatformProducts: string[];
  externalProviders: string[];
  externalProductTypes: string[];
  riskProviders: string[];
  shortTermProviders: string[];
  shortTermPolicies: string[];
  medicalProviders: { scheme: string; plans: string[] }[];
}

const jurisdictionConfigs: Record<string, JurisdictionConfig> = {
  ZA: {
    currencySymbol: "R",
    currencyCode: "ZAR",
    locale: "en-ZA",
    platformCashBank: "Investec",
    boardOfExecutors: "VantageBOE",
    onPlatformProducts: ["Investment Plan", "Retirement Annuity Fund", "Living Annuity", "Preservation Fund", "Endowment"],
    externalProviders: ["Ninety One", "Old Mutual International", "Allan Gray", "Sanlam Glacier"],
    externalProductTypes: ["Investment Plan", "Balanced Fund", "Equity Fund", "Growth Fund", "Preservation Fund"],
    riskProviders: ["Hollard Life", "Old Mutual", "Liberty", "Sanlam", "Discovery Life"],
    shortTermProviders: ["Santam", "Outsurance", "MiWay", "Hollard"],
    shortTermPolicies: ["Household Contents", "Vehicle Insurance", "Home Owners", "All Risk"],
    medicalProviders: [
      { scheme: "Discovery Health", plans: ["Coastal Core", "Classic Smart", "Executive", "KeyCare Plus"] },
      { scheme: "PPS", plans: ["Provider Plus", "Professional Core", "Professional Plus"] },
      { scheme: "Momentum Health", plans: ["Evolve", "Summit", "Custom"] },
      { scheme: "Bonitas", plans: ["Primary", "BonFit", "Standard"] },
    ],
  },
  AU: {
    currencySymbol: "A$",
    currencyCode: "AUD",
    locale: "en-AU",
    platformCashBank: "Macquarie",
    boardOfExecutors: "Vantage Trust",
    onPlatformProducts: ["Superannuation", "SMSF", "Pension Phase", "Investment Account", "Retirement Savings"],
    externalProviders: ["Macquarie Wrap", "AMP North", "BT Wrap", "Colonial First State", "Hub24"],
    externalProductTypes: ["Super Fund", "Investment Account", "Managed Fund", "Pension", "Growth Portfolio"],
    riskProviders: ["TAL", "AIA", "Zurich", "OnePath", "MLC"],
    shortTermProviders: ["NRMA", "AAMI", "Allianz", "QBE"],
    shortTermPolicies: ["Home & Contents", "Motor Vehicle", "Landlord Insurance", "Personal Liability"],
    medicalProviders: [
      { scheme: "Medibank Private", plans: ["Hospital Cover", "Extras Cover", "Comprehensive", "Budget"] },
      { scheme: "Bupa", plans: ["Gold Hospital", "Silver Plus", "Top Extras"] },
      { scheme: "HCF", plans: ["Hospital Basic", "Top Cover", "Multi Cover"] },
      { scheme: "NIB", plans: ["Premium Hospital", "Core Extras", "Everyday"] },
    ],
  },
  CA: {
    currencySymbol: "C$",
    currencyCode: "CAD",
    locale: "en-CA",
    platformCashBank: "RBC",
    boardOfExecutors: "Vantage Est.",
    onPlatformProducts: ["RRSP", "TFSA", "RRIF", "Non-Registered Account", "RESP"],
    externalProviders: ["RBC Dominion", "TD Wealth Private", "CIBC Wood Gundy", "BMO Nesbitt Burns"],
    externalProductTypes: ["RRSP Fund", "TFSA Account", "Balanced Portfolio", "Income Fund", "Growth Fund"],
    riskProviders: ["Manulife", "Sun Life", "Canada Life", "Desjardins", "Industrial Alliance"],
    shortTermProviders: ["Intact", "Aviva", "RSA", "Economical"],
    shortTermPolicies: ["Home Insurance", "Auto Insurance", "Condo Insurance", "Tenant Insurance"],
    medicalProviders: [
      { scheme: "Sun Life", plans: ["Extended Health", "Dental Plus", "Vision Care"] },
      { scheme: "Manulife", plans: ["FlexCare", "FollowMe", "Health Spending"] },
      { scheme: "Great-West Life", plans: ["GroupNet", "Personal Health", "Advantage"] },
      { scheme: "Green Shield", plans: ["Essential", "Enhanced", "Premium"] },
    ],
  },
  GB: {
    currencySymbol: "£",
    currencyCode: "GBP",
    locale: "en-GB",
    platformCashBank: "Barclays",
    boardOfExecutors: "Vantage Exec",
    onPlatformProducts: ["SIPP", "Stocks & Shares ISA", "General Investment Account", "Junior ISA", "Lifetime ISA"],
    externalProviders: ["Hargreaves Lansdown", "AJ Bell", "Interactive Investor", "Fidelity"],
    externalProductTypes: ["ISA Portfolio", "Pension Fund", "Investment Account", "Income Fund", "Growth Fund"],
    riskProviders: ["Aviva", "Legal & General", "Zurich", "Royal London", "Scottish Widows"],
    shortTermProviders: ["Aviva", "Direct Line", "Admiral", "LV="],
    shortTermPolicies: ["Buildings Insurance", "Contents Insurance", "Motor Insurance", "Travel Insurance"],
    medicalProviders: [
      { scheme: "Bupa", plans: ["Comprehensive", "Treatment & Care", "By You"] },
      { scheme: "AXA Health", plans: ["Personal Health", "Health On Line", "Corporate"] },
      { scheme: "Vitality", plans: ["Core Cover", "Business", "Life Cover"] },
      { scheme: "Cigna", plans: ["Individual", "Family Plus", "Global"] },
    ],
  },
  US: {
    currencySymbol: "$",
    currencyCode: "USD",
    locale: "en-US",
    platformCashBank: "JPMorgan Chase",
    boardOfExecutors: "Vantage Trust",
    onPlatformProducts: ["401(k)", "Traditional IRA", "Roth IRA", "Brokerage Account", "529 Plan"],
    externalProviders: ["Fidelity Investments", "Charles Schwab", "Vanguard", "TD Ameritrade"],
    externalProductTypes: ["Mutual Fund", "Index Fund", "ETF Portfolio", "Managed Account", "Target Date Fund"],
    riskProviders: ["MetLife", "Prudential", "Northwestern Mutual", "New York Life", "Lincoln Financial"],
    shortTermProviders: ["State Farm", "Geico", "Progressive", "Allstate"],
    shortTermPolicies: ["Homeowners Insurance", "Auto Insurance", "Renters Insurance", "Umbrella Policy"],
    medicalProviders: [
      { scheme: "UnitedHealthcare", plans: ["Choice Plus", "Options PPO", "Navigate"] },
      { scheme: "Aetna", plans: ["Open Access", "Managed Choice", "Select"] },
      { scheme: "Cigna", plans: ["Open Access Plus", "LocalPlus", "Connect"] },
      { scheme: "Blue Cross Blue Shield", plans: ["PPO", "HMO", "HSA Compatible"] },
    ],
  },
};

// Seeded random number generator for consistent client-based randomization
function seededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return function() {
    hash = (hash * 1103515245 + 12345) & 0x7fffffff;
    return hash / 0x7fffffff;
  };
}

// Map nationality to jurisdiction code
export function mapNationalityToJurisdiction(nationality: string | null, countryOfIssue?: string | null): string {
  // Try nationality first
  if (nationality) {
    const lower = nationality.toLowerCase();
    if (lower.includes("south african") || lower === "za") return "ZA";
    if (lower.includes("australian") || lower === "au") return "AU";
    if (lower.includes("canadian") || lower === "ca") return "CA";
    if (lower.includes("british") || lower.includes("english") || lower.includes("scottish") || lower.includes("welsh") || lower === "uk" || lower === "gb") return "GB";
    if (lower.includes("american") || lower.includes("us citizen") || lower === "usa" || lower === "us" || lower.includes("united states")) return "US";
  }

  // Fallback to country_of_issue
  if (countryOfIssue) {
    const country = countryOfIssue.toLowerCase();
    if (country.includes("south africa")) return "ZA";
    if (country.includes("australia")) return "AU";
    if (country.includes("canada")) return "CA";
    if (country.includes("united kingdom")) return "GB";
    if (country.includes("united states")) return "US";
  }

  return "ZA"; // Default fallback
}

// Format currency based on jurisdiction
function formatCurrency(value: number, config: JurisdictionConfig): string {
  return `${config.currencySymbol} ${value.toLocaleString(config.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Generate a random date within a range
function generateRandomDate(random: () => number, yearsBack: number = 3): string {
  const now = new Date();
  const daysBack = Math.floor(random() * yearsBack * 365);
  const date = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
}

// Generate a future date
function generateFutureDate(random: () => number, monthsAhead: number = 12): string {
  const now = new Date();
  const daysAhead = Math.floor(random() * monthsAhead * 30);
  const date = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
}

// Generate policy/account number
function generatePolicyNumber(random: () => number, prefix: string): string {
  const num = Math.floor(random() * 900000000) + 100000000;
  return `${prefix}${num}`;
}

// Generate client 360 view data
export function generateClient360Data(clientId: string, nationality: string | null, countryOfIssue?: string | null): Client360Data {
  const jurisdiction = mapNationalityToJurisdiction(nationality, countryOfIssue);
  const config = jurisdictionConfigs[jurisdiction];
  const random = seededRandom(clientId);
  
  // Generate on-platform products (1-3 products)
  const numOnPlatform = Math.floor(random() * 3) + 1;
  const onPlatformProducts: OnPlatformProduct[] = [];
  
  for (let i = 0; i < numOnPlatform; i++) {
    const productType = config.onPlatformProducts[Math.floor(random() * config.onPlatformProducts.length)];
    const baseAmount = (random() * 1500000) + 50000;
    const hasDetails = random() > 0.5 && i === 0; // First product may have expandable details
    
    const product: OnPlatformProduct = {
      investmentHouse: "Vantage",
      product: productType,
      number: generatePolicyNumber(random, "VAN"),
      amount: formatCurrency(baseAmount, config),
      amountValue: baseAmount,
      income: formatCurrency(0, config),
      contribution: formatCurrency(random() > 0.7 ? random() * 5000 : 0, config),
      date: generateRandomDate(random, 1),
      advisor: "Primary Advisor",
      expandable: hasDetails,
    };
    
    if (hasDetails) {
      const total = baseAmount;
      const nonVested = total * (0.6 + random() * 0.2);
      const retirement = total * (random() * 0.1);
      const savings = total * (random() * 0.05);
      const vested = total - nonVested - retirement - savings;
      
      product.details = [
        { label: "Non-vested", amount: formatCurrency(nonVested, config) },
        { label: "Retirement", amount: formatCurrency(retirement, config) },
        { label: "Savings", amount: formatCurrency(savings, config) },
        { label: "Vested", amount: formatCurrency(Math.max(0, vested), config) },
      ];
    }
    
    onPlatformProducts.push(product);
  }
  
  // Generate external products (2-4 products)
  const numExternal = Math.floor(random() * 3) + 2;
  const externalProducts: ExternalProduct[] = [];
  const usedProviders = new Set<string>();
  
  for (let i = 0; i < numExternal; i++) {
    let provider = config.externalProviders[Math.floor(random() * config.externalProviders.length)];
    // Avoid duplicate providers
    while (usedProviders.has(provider) && usedProviders.size < config.externalProviders.length) {
      provider = config.externalProviders[Math.floor(random() * config.externalProviders.length)];
    }
    usedProviders.add(provider);
    
    const productType = config.externalProductTypes[Math.floor(random() * config.externalProductTypes.length)];
    const amount = (random() * 450000) + 50000;
    
    externalProducts.push({
      provider,
      product: productType,
      contract: generatePolicyNumber(random, "EXT"),
      amount: formatCurrency(amount, config),
      amountValue: amount,
      income: formatCurrency(0, config),
      contribution: formatCurrency(random() > 0.8 ? random() * 2000 : 0, config),
      updated: generateRandomDate(random, 1),
      source: "Manual",
    });
  }
  
  // Generate platform cash account
  const cashAmount = (random() * 90000) + 10000;
  const platformCashAccounts: PlatformCashAccount[] = [
    {
      name: `${config.platformCashBank} Account`,
      dateOpened: generateRandomDate(random, 2),
      beneficiary: "",
      accountNumber: generatePolicyNumber(random, "").slice(0, 9),
      amount: formatCurrency(cashAmount, config),
      amountValue: cashAmount,
      source: "",
      dateClosed: "",
    },
  ];
  
  // Generate will data (70% have wills)
  const hasWill = random() > 0.3;
  const willData: WillData[] = [
    {
      hasWill: hasWill ? "Yes" : "No",
      dateOfWill: hasWill ? generateRandomDate(random, 3) : "",
      placeKept: hasWill ? config.boardOfExecutors : "",
      receiptNumber: hasWill ? Math.floor(random() * 9000 + 1000).toString() : "",
      executors: hasWill ? config.boardOfExecutors : "",
      lastReview: hasWill ? generateRandomDate(random, 1) : "",
      notes: "",
    },
  ];
  
  // Generate short term products (60% have short term)
  const shortTermProducts: ShortTermProduct[] = [];
  if (random() > 0.4) {
    const numShortTerm = Math.floor(random() * 2) + 1;
    for (let i = 0; i < numShortTerm; i++) {
      const provider = config.shortTermProviders[Math.floor(random() * config.shortTermProviders.length)];
      const policyType = config.shortTermPolicies[Math.floor(random() * config.shortTermPolicies.length)];
      const premium = (random() * 800) + 200;
      
      shortTermProducts.push({
        insurer: provider,
        policyType,
        totalPremium: formatCurrency(premium, config),
        reviewDate: generateFutureDate(random, 12),
        broker: "Vantage",
        dataDate: generateRandomDate(random, 0.5),
        source: "Provider Feed",
      });
    }
  }
  
  // Generate risk products (1-2 products)
  const numRisk = Math.floor(random() * 2) + 1;
  const riskProducts: RiskProduct[] = [];
  
  for (let i = 0; i < numRisk; i++) {
    const provider = config.riskProviders[Math.floor(random() * config.riskProviders.length)];
    const premium = (random() * 8000) + 1500;
    const prefix = provider.substring(0, 2).toUpperCase();
    
    riskProducts.push({
      holdingName: provider,
      policyNumber: generatePolicyNumber(random, prefix),
      effectiveDate: generateRandomDate(random, 2),
      terminationDate: "",
      paymentAmount: formatCurrency(premium, config).replace(config.currencySymbol + " ", ""),
      paidToDate: "",
      paymentDueDate: "",
      notes: "",
    });
  }
  
  // Generate medical aid (80% have medical)
  const medicalAid: MedicalAid[] = [];
  if (random() > 0.2) {
    const medProvider = config.medicalProviders[Math.floor(random() * config.medicalProviders.length)];
    const plan = medProvider.plans[Math.floor(random() * medProvider.plans.length)];
    const premium = (random() * 4000) + 1500;
    
    medicalAid.push({
      schemeName: medProvider.scheme,
      planName: plan,
      membershipNumber: generatePolicyNumber(random, "").slice(0, 8),
      policyActive: "Yes",
      premium: premium.toFixed(2),
      dateReceived: "",
      notes: "",
    });
  }
  
  return {
    onPlatformProducts,
    externalProducts,
    platformCashAccounts,
    willData,
    shortTermProducts,
    riskProducts,
    medicalAid,
    currencySymbol: config.currencySymbol,
    currencyCode: config.currencyCode,
  };
}

// Jurisdiction-specific products for Quote and New Business wizards
const quoteProductsByJurisdiction: Record<string, string[]> = {
  ZA: ["Tax Free Plan", "Pension Preservation Fund", "Living Annuity", "Provident Preservation Fund", "Investment Plan", "Retirement Annuity Fund"],
  AU: ["Superannuation Fund", "Self-Managed Super Fund (SMSF)", "Retirement Income Stream", "Investment Account", "Insurance Bond"],
  CA: ["RRSP", "TFSA", "RRIF", "Non-Registered Account", "RESP", "Locked-In Retirement Account"],
  GB: ["SIPP", "Stocks and Shares ISA", "General Investment Account", "Junior ISA", "Lifetime ISA", "Offshore Bond"],
  US: ["401(k) Rollover", "Traditional IRA", "Roth IRA", "Brokerage Account", "529 Education Plan", "SEP IRA"],
};

export function getQuoteProducts(jurisdiction: string): string[] {
  return quoteProductsByJurisdiction[jurisdiction] || quoteProductsByJurisdiction.ZA;
}

// Helper to format totals
export function formatTotal(value: number, currencySymbol: string): string {
  return `${currencySymbol} ${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
