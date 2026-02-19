import { generateProductFunds, type ProductFund } from "./performanceComparisonData";

export interface RebalancingGroup {
  id: string;
  name: string;
  rationale: string;
  rationaleType: "Fee Reduction" | "Performance Uplift" | "Risk Alignment" | "Tax Efficiency";
  clients: string[];
  portfolios: number;
  contracts: number;
  totalAUM: number;
  estimatedSaving: string;
  currentFunds: { name: string; allocation: number; value: number }[];
}

function seededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return function () {
    hash = (hash * 1103515245 + 12345) & 0x7fffffff;
    return hash / 0x7fffffff;
  };
}

const GROUP_TEMPLATES: { name: string; rationale: string; rationaleType: RebalancingGroup["rationaleType"] }[] = [
  { name: "High-Fee Equity Cluster", rationale: "Clients over-allocated to high-cost equity funds with cheaper alternatives available", rationaleType: "Fee Reduction" },
  { name: "Underperforming Balanced Mix", rationale: "Balanced funds trailing benchmark by >2% over 3 years", rationaleType: "Performance Uplift" },
  { name: "Offshore Overweight Group", rationale: "Clients exceeding recommended offshore allocation limits", rationaleType: "Risk Alignment" },
  { name: "Tax-Loss Harvesting Candidates", rationale: "Portfolios with unrealised losses that can offset capital gains", rationaleType: "Tax Efficiency" },
  { name: "Retirement Consolidation Set", rationale: "Multiple retirement products with overlapping funds, consolidation reduces fees", rationaleType: "Fee Reduction" },
  { name: "Growth Tilt Rebalance", rationale: "Portfolios drifted >5% from target growth allocation", rationaleType: "Risk Alignment" },
];

const CLIENT_NAMES: Record<string, string[]> = {
  ZA: ["Van der Merwe, Pieter", "Naidoo, Priya", "Botha, Jan", "Mokoena, Thabo", "Smith, Sarah", "Khumalo, Sipho", "Patel, Raj", "Du Plessis, Anriette", "Govender, Kavitha", "Malan, Hendrik"],
  AU: ["Thompson, James", "Chen, Wei", "O'Brien, Kate", "Nguyen, Linh", "Williams, Mark", "Patel, Anish", "Jones, Emma", "Lee, David", "Brown, Sarah", "Taylor, Michael"],
  CA: ["Tremblay, Marc", "Singh, Harpreet", "Martin, Claire", "Li, Xin", "Wilson, Robert", "Kim, Ji-yeon", "Campbell, Duncan", "Chen, Amy", "Roy, Jean-Pierre", "Anderson, Lisa"],
  GB: ["Ashworth, James", "Khan, Imran", "Taylor, Emma", "O'Connor, Sean", "Patel, Neha", "Williams, Gareth", "Brown, Charlotte", "Singh, Amarjit", "Davies, Owen", "Chen, Li"],
  US: ["Johnson, Michael", "Rodriguez, Maria", "Kim, David", "Patel, Sanjay", "Williams, Jennifer", "Chen, Andrew", "Martinez, Sofia", "Brown, Robert", "Lee, Michelle", "Taylor, James"],
};

const MOCK_PRODUCTS: Record<string, { product: string; amountValue: number }[]> = {
  ZA: [
    { product: "Allan Gray Balanced Fund", amountValue: 2500000 },
    { product: "Coronation Top 20", amountValue: 1800000 },
    { product: "Ninety One Equity Fund", amountValue: 1200000 },
  ],
  AU: [
    { product: "Magellan Global Fund", amountValue: 3200000 },
    { product: "Vanguard Growth Fund", amountValue: 2100000 },
    { product: "BetaShares ASX 200", amountValue: 1500000 },
  ],
  CA: [
    { product: "Mawer Balanced Fund", amountValue: 2800000 },
    { product: "RBC Select Growth", amountValue: 1900000 },
    { product: "TD Canadian Index", amountValue: 1400000 },
  ],
  GB: [
    { product: "Fundsmith Equity", amountValue: 3500000 },
    { product: "Vanguard LifeStrategy 60%", amountValue: 2200000 },
    { product: "Baillie Gifford Growth", amountValue: 1600000 },
  ],
  US: [
    { product: "Vanguard 500 Index", amountValue: 4000000 },
    { product: "Fidelity Contrafund", amountValue: 2600000 },
    { product: "PIMCO Income Fund", amountValue: 1800000 },
  ],
};

export function generateRebalancingGroups(jurisdiction: string): RebalancingGroup[] {
  const rng = seededRandom("rebal-groups-" + jurisdiction);
  const clientPool = CLIENT_NAMES[jurisdiction] || CLIENT_NAMES.ZA;
  const products = MOCK_PRODUCTS[jurisdiction] || MOCK_PRODUCTS.ZA;
  const numGroups = 4 + Math.floor(rng() * 2); // 4-5 groups

  return GROUP_TEMPLATES.slice(0, numGroups).map((template, idx) => {
    const numClients = 3 + Math.floor(rng() * 6); // 3-8 clients
    const shuffled = [...clientPool].sort(() => rng() - 0.5);
    const clients = shuffled.slice(0, numClients);
    const portfolios = numClients + Math.floor(rng() * numClients * 0.5);
    const contracts = portfolios + Math.floor(rng() * 5);
    const baseAUM = 5_000_000 + rng() * 25_000_000;
    const totalAUM = Math.round(baseAUM / 1000) * 1000;

    // Scale products proportionally
    const totalProductValue = products.reduce((s, p) => s + p.amountValue, 0);
    const scaledProducts = products.map(p => ({
      product: p.product,
      amountValue: Math.round((p.amountValue / totalProductValue) * totalAUM),
    }));

    const fundBreakdown = generateProductFunds(scaledProducts, jurisdiction, `group-${idx}`);
    
    // Consolidate funds
    const fundMap = new Map<string, { name: string; value: number }>();
    fundBreakdown.forEach(f => {
      const existing = fundMap.get(f.fundName);
      if (existing) existing.value += f.value;
      else fundMap.set(f.fundName, { name: f.fundName, value: f.value });
    });
    const totalVal = fundBreakdown.reduce((s, f) => s + f.value, 0);
    const currentFunds = Array.from(fundMap.values()).map(f => ({
      name: f.name,
      allocation: totalVal > 0 ? +((f.value / totalVal) * 100).toFixed(1) : 0,
      value: f.value,
    }));

    const savings = template.rationaleType === "Fee Reduction"
      ? `${(0.15 + rng() * 0.45).toFixed(2)}% fee reduction`
      : template.rationaleType === "Performance Uplift"
      ? `+${(1.2 + rng() * 2.8).toFixed(1)}% projected return`
      : template.rationaleType === "Tax Efficiency"
      ? `${Math.round(50000 + rng() * 200000).toLocaleString()} tax saving`
      : `${(2 + rng() * 6).toFixed(1)}% drift correction`;

    return {
      id: `group-${jurisdiction}-${idx}`,
      name: template.name,
      rationale: template.rationale,
      rationaleType: template.rationaleType,
      clients,
      portfolios,
      contracts,
      totalAUM,
      estimatedSaving: savings,
      currentFunds,
    };
  });
}
