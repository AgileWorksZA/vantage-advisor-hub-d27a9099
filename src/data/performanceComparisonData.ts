// Performance Comparison Data Generation Utilities
// Deterministic data generation using seeded random for consistent demo values

export interface FeeRow {
  instrument: string;
  investmentMgmtFee: number;
  adminFee: number;
  advisorFee: number;
  otherFee: number;
  totalCost: number;
  allocation: number;
}

export interface EACRow {
  category: string;
  year1: number;
  year3: number;
  year5: number;
  year10: number;
}

export interface PerformanceReturn {
  period: string;
  currentReturn: number;
  comparisonReturn: number;
}

export interface HistoricalPoint {
  date: string;
  current: number;
  comparison: number;
}

export interface HoldingItem {
  name: string;
  percentage: number;
}

export interface AssetAllocationRow {
  assetClass: string;
  local: number;
  offshore: number;
  overall: number;
}

const JURISDICTION_EXCHANGES: Record<string, string[]> = {
  ZA: ['JSE'],
  AU: ['ASX'],
  CA: ['TSX'],
  GB: ['LSE'],
  US: ['NYSE', 'NASDAQ'],
};

export function getExchangesForJurisdiction(jurisdiction: string): string[] {
  return JURISDICTION_EXCHANGES[jurisdiction] || ['JSE'];
}

// Seeded random number generator
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

export function generateFees(
  items: { name: string; allocation: number }[],
  seedPrefix: string
): FeeRow[] {
  return items.map((item) => {
    const rng = seededRandom(seedPrefix + item.name);
    const investmentMgmtFee = 0.4 + rng() * 1.2;
    const adminFee = 0.1 + rng() * 0.5;
    const advisorFee = 0.3 + rng() * 0.7;
    const otherFee = rng() * 0.3;
    const totalCost = investmentMgmtFee + adminFee + advisorFee + otherFee;
    return {
      instrument: item.name,
      investmentMgmtFee: +investmentMgmtFee.toFixed(2),
      adminFee: +adminFee.toFixed(2),
      advisorFee: +advisorFee.toFixed(2),
      otherFee: +otherFee.toFixed(2),
      totalCost: +totalCost.toFixed(2),
      allocation: item.allocation,
    };
  });
}

export function generateEAC(fees: FeeRow[]): EACRow[] {
  const weightedTotal = fees.reduce((acc, f) => acc + f.totalCost * (f.allocation / 100), 0);
  const weightedAdmin = fees.reduce((acc, f) => acc + f.adminFee * (f.allocation / 100), 0);
  const weightedAdvice = fees.reduce((acc, f) => acc + f.advisorFee * (f.allocation / 100), 0);
  const weightedInvMgmt = fees.reduce((acc, f) => acc + f.investmentMgmtFee * (f.allocation / 100), 0);
  const weightedOther = fees.reduce((acc, f) => acc + f.otherFee * (f.allocation / 100), 0);

  const scale = (base: number, years: number) => +(base * (1 + years * 0.02)).toFixed(2);

  return [
    { category: 'Administration', year1: +weightedAdmin.toFixed(2), year3: scale(weightedAdmin, 3), year5: scale(weightedAdmin, 5), year10: scale(weightedAdmin, 10) },
    { category: 'Advice', year1: +weightedAdvice.toFixed(2), year3: scale(weightedAdvice, 3), year5: scale(weightedAdvice, 5), year10: scale(weightedAdvice, 10) },
    { category: 'Investment Mgmt', year1: +weightedInvMgmt.toFixed(2), year3: scale(weightedInvMgmt, 3), year5: scale(weightedInvMgmt, 5), year10: scale(weightedInvMgmt, 10) },
    { category: 'Other', year1: +weightedOther.toFixed(2), year3: scale(weightedOther, 3), year5: scale(weightedOther, 5), year10: scale(weightedOther, 10) },
    { category: 'Total', year1: +weightedTotal.toFixed(2), year3: scale(weightedTotal, 3), year5: scale(weightedTotal, 5), year10: scale(weightedTotal, 10) },
  ];
}

export function generatePerformanceReturns(
  currentItems: { name: string }[],
  comparisonItems: { name: string }[]
): PerformanceReturn[] {
  const periods = ['6M', '1Y', '3Y', '5Y', '7Y', '10Y'];
  const currentSeed = currentItems.map((i) => i.name).join('|');
  const compSeed = comparisonItems.map((i) => i.name).join('|');
  const rngC = seededRandom('perf-current-' + currentSeed);
  const rngComp = seededRandom('perf-comp-' + compSeed);

  return periods.map((period) => ({
    period,
    currentReturn: +(rngC() * 25 - 5).toFixed(1),
    comparisonReturn: +(rngComp() * 25 - 5).toFixed(1),
  }));
}

export function generateHistoricalPerformance(
  currentItems: { name: string }[],
  comparisonItems: { name: string }[],
  months: number = 60
): HistoricalPoint[] {
  const currentSeed = currentItems.map((i) => i.name).join('|');
  const compSeed = comparisonItems.map((i) => i.name).join('|');
  const rngC = seededRandom('hist-' + currentSeed);
  const rngComp = seededRandom('hist-' + compSeed);

  const points: HistoricalPoint[] = [];
  let currentVal = 100;
  let compVal = 100;
  const now = new Date();

  for (let i = months; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    currentVal *= 1 + (rngC() * 0.08 - 0.03);
    compVal *= 1 + (rngComp() * 0.08 - 0.03);
    points.push({
      date: d.toISOString().slice(0, 7),
      current: +currentVal.toFixed(2),
      comparison: +compVal.toFixed(2),
    });
  }
  return points;
}

export function generateHoldings(items: { name: string }[], seed: string): HoldingItem[] {
  const rng = seededRandom('holdings-' + seed);
  const holdingNames = [
    'Naspers', 'BHP Group', 'Apple Inc', 'Microsoft', 'Alphabet', 'Amazon',
    'Samsung', 'TSMC', 'Nestlé', 'ASML', 'Novo Nordisk', 'LVMH',
    'Anglo American', 'Richemont', 'Prosus', 'Tencent', 'Alibaba',
    'FirstRand', 'Standard Bank', 'Capitec',
  ];
  const shuffled = [...holdingNames].sort(() => rng() - 0.5);
  let remaining = 100;
  return shuffled.slice(0, 10).map((name, i) => {
    const pct = i < 9 ? +(rng() * (remaining / (10 - i)) * 1.5).toFixed(1) : +remaining.toFixed(1);
    const capped = Math.min(pct, remaining);
    remaining -= capped;
    return { name, percentage: Math.max(capped, 0.5) };
  });
}

export function generateAssetAllocation(items: { name: string }[], seed: string): AssetAllocationRow[] {
  const rng = seededRandom('alloc-' + seed);
  const classes = ['Equity', 'Property', 'Bonds', 'Cash', 'Other'];
  let localRem = 100;
  let offshoreRem = 100;

  return classes.map((cls, i) => {
    const isLast = i === classes.length - 1;
    const local = isLast ? localRem : +(rng() * (localRem / (5 - i)) * 1.8).toFixed(1);
    const offshore = isLast ? offshoreRem : +(rng() * (offshoreRem / (5 - i)) * 1.8).toFixed(1);
    const lCapped = Math.min(local, localRem);
    const oCapped = Math.min(offshore, offshoreRem);
    localRem -= lCapped;
    offshoreRem -= oCapped;
    return {
      assetClass: cls,
      local: +Math.max(lCapped, 0).toFixed(1),
      offshore: +Math.max(oCapped, 0).toFixed(1),
      overall: +((lCapped + oCapped) / 2).toFixed(1),
    };
  });
}

// ===== Fund-level breakdown per product =====

export interface ProductFund {
  productName: string;
  fundName: string;
  allocation: number;
  value: number;
}

const JURISDICTION_FUND_POOLS: Record<string, string[]> = {
  ZA: [
    'Allan Gray Equity Fund', 'Coronation Balanced Plus', 'Nedgroup Investments Core Diversified',
    'Prescient Income Provider', 'Ninety One Opportunity Fund', 'Sanlam Investment Management Balanced',
    'Old Mutual Global Equity', 'Absa Bond Fund', 'Investec Property Equity', 'Stanlib Income Fund',
    'PSG Flexible Fund', 'Discovery Balanced Fund', 'Momentum Diversified Income',
  ],
  AU: [
    'Magellan Global Fund', 'Vanguard Diversified Growth', 'BetaShares Australia 200 ETF',
    'Platinum International Fund', 'Colonial First State Growth', 'AMP Capital Dynamic Markets',
    'Macquarie Income Opportunities', 'Pendal Sustainable Future', 'Fidelity Australian Equities',
    'Janus Henderson Global NR', 'PIMCO Australian Bond', 'IFM Australian Infrastructure',
  ],
  CA: [
    'Mawer Balanced Fund', 'RBC Select Conservative Portfolio', 'TD e-Series Canadian Index',
    'Fidelity NorthStar Fund', 'CI Canadian Investment Fund', 'BMO Aggregate Bond Index ETF',
    'Mackenzie Canadian Growth', 'Dynamic Power Canadian Growth', 'iShares Core S&P/TSX',
    'CIBC Balanced Fund', 'Scotia Canadian Equity', 'AGF Global Select Fund',
  ],
  GB: [
    'Fundsmith Equity Fund', 'Baillie Gifford Positive Change', 'Vanguard LifeStrategy 60%',
    'Jupiter Income Trust', 'Lindsell Train UK Equity', 'Rathbone Global Opportunities',
    'Troy Trojan Fund', 'M&G Optimal Income', 'HSBC FTSE All-World Index',
    'Fidelity Index World', 'Scottish Mortgage Investment', 'BlackRock UK Special Situations',
  ],
  US: [
    'Vanguard 500 Index Fund', 'Fidelity Contrafund', 'T. Rowe Price Blue Chip Growth',
    'PIMCO Income Fund', 'Dodge & Cox Stock Fund', 'American Funds Growth Fund',
    'iShares Core S&P 500 ETF', 'Schwab Total Stock Market Index', 'Capital Group New Perspective',
    'JPMorgan Equity Income', 'BlackRock Global Allocation', 'Templeton Global Bond',
  ],
};

export function generateProductFunds(
  products: { product: string; amountValue: number }[],
  jurisdiction: string,
  seed: string
): ProductFund[] {
  const fundPool = JURISDICTION_FUND_POOLS[jurisdiction] || JURISDICTION_FUND_POOLS['ZA'];
  const rng = seededRandom('prod-funds-' + seed);
  const results: ProductFund[] = [];
  let poolIdx = 0;

  for (const product of products) {
    const numFunds = 2 + Math.floor(rng() * 4); // 2-5 funds
    let remaining = 100;
    const funds: { name: string; pct: number }[] = [];

    for (let i = 0; i < numFunds; i++) {
      const fundName = fundPool[(poolIdx++) % fundPool.length];
      const isLast = i === numFunds - 1;
      const pct = isLast ? remaining : +(rng() * (remaining / (numFunds - i)) * 1.6).toFixed(1);
      const capped = Math.min(Math.max(pct, 2), remaining);
      remaining -= capped;
      funds.push({ name: fundName, pct: +capped.toFixed(1) });
    }

    // Normalize to 100
    const totalPct = funds.reduce((s, f) => s + f.pct, 0);
    for (const f of funds) {
      const alloc = totalPct > 0 ? +(f.pct / totalPct * 100).toFixed(1) : 0;
      const value = totalPct > 0 ? +(product.amountValue * f.pct / totalPct) : 0;
      results.push({
        productName: product.product,
        fundName: f.name,
        allocation: alloc,
        value: +value.toFixed(0),
      });
    }
  }

  return results;
}
