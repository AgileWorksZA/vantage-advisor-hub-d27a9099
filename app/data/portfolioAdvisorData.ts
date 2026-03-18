// Per-advisor portfolio data for all jurisdictions
// Uses a seeded approach based on advisor initials to generate consistent, varied data

interface AdvisorPortfolioData {
  performance: Record<string, { labels: string[]; current: number[]; model: number[]; benchmark: number[] }>;
  fees: { current: number; model: number };
  allocation: { equities: { current: number; model: number }; bonds: { current: number; model: number }; property: { current: number; model: number }; cash: { current: number; model: number } };
}

// Simple seeded hash from string
function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

// Deterministic pseudo-random from seed
function seededRandom(seed: number, index: number): number {
  const x = Math.sin(seed + index * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

function generateAdvisorData(region: string, initials: string): AdvisorPortfolioData {
  const seed = hashStr(region + initials);
  const r = (i: number) => seededRandom(seed, i);

  // Fees: current 1.2-2.2, model 0.8-1.5
  const feeCurrent = 1.2 + r(0) * 1.0;
  const feeModel = 0.8 + r(1) * 0.7;

  // Allocation (must sum to 100 for each)
  const eqCurrent = 35 + Math.round(r(2) * 25);
  const bondsCurrent = 20 + Math.round(r(3) * 20);
  const propCurrent = Math.round(r(4) * 15) + 3;
  const cashCurrent = 100 - eqCurrent - bondsCurrent - propCurrent;

  const eqModel = 40 + Math.round(r(5) * 25);
  const bondsModel = 15 + Math.round(r(6) * 20);
  const propModel = Math.round(r(7) * 15) + 3;
  const cashModel = 100 - eqModel - bondsModel - propModel;

  // Performance lines – build from base with per-advisor offsets
  const buildLine = (base: number[], offsetSeed: number, scale: number) =>
    base.map((v, i) => +(v + (r(offsetSeed + i) - 0.5) * scale).toFixed(1));

  const perf6mBase = { current: [100, 101.2, 102.1, 102.8, 103.5, 104.2], model: [100, 102.1, 103.5, 105.2, 106.1, 106.8], benchmark: [100, 101.8, 102.9, 104.1, 105.0, 105.5] };
  const perf1yBase = { current: [100, 102.1, 104.5, 106.2, 107.5, 108.5], model: [100, 104.2, 107.8, 109.5, 111.2, 112.4], benchmark: [100, 103.5, 106.2, 108.1, 109.5, 110.2] };
  const perf3yBase = { current: [100, 108.2, 115.5, 120.8, 124.8], model: [100, 112.5, 125.2, 132.8, 138.2], benchmark: [100, 110.5, 120.2, 127.5, 132.1] };
  const perf5yBase = { current: [100, 108.5, 118.2, 130.5, 142.5], model: [100, 113.5, 132.2, 152.8, 168.4], benchmark: [100, 111.2, 125.5, 142.1, 155.8] };

  const performance: AdvisorPortfolioData['performance'] = {
    '6m': {
      labels: ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      current: buildLine(perf6mBase.current, 10, 2),
      model: buildLine(perf6mBase.model, 20, 2),
      benchmark: buildLine(perf6mBase.benchmark, 30, 1.5),
    },
    '1y': {
      labels: ["Jan", "Mar", "May", "Jul", "Sep", "Nov"],
      current: buildLine(perf1yBase.current, 40, 4),
      model: buildLine(perf1yBase.model, 50, 4),
      benchmark: buildLine(perf1yBase.benchmark, 60, 3),
    },
    '3y': {
      labels: ["Y1", "Y1.5", "Y2", "Y2.5", "Y3"],
      current: buildLine(perf3yBase.current, 70, 8),
      model: buildLine(perf3yBase.model, 80, 8),
      benchmark: buildLine(perf3yBase.benchmark, 90, 6),
    },
    '5y': {
      labels: ["Y1", "Y2", "Y3", "Y4", "Y5"],
      current: buildLine(perf5yBase.current, 100, 12),
      model: buildLine(perf5yBase.model, 110, 12),
      benchmark: buildLine(perf5yBase.benchmark, 120, 10),
    },
  };

  // Ensure first point is always 100
  for (const p of Object.values(performance)) {
    p.current[0] = 100;
    p.model[0] = 100;
    p.benchmark[0] = 100;
  }

  return {
    performance,
    fees: { current: +feeCurrent.toFixed(2), model: +feeModel.toFixed(2) },
    allocation: {
      equities: { current: eqCurrent, model: eqModel },
      bonds: { current: bondsCurrent, model: bondsModel },
      property: { current: propCurrent, model: propModel },
      cash: { current: Math.max(cashCurrent, 1), model: Math.max(cashModel, 1) },
    },
  };
}

// Cache generated data
const cache = new Map<string, AdvisorPortfolioData>();

function getAdvisorPortfolio(region: string, initials: string): AdvisorPortfolioData {
  const key = `${region}:${initials}`;
  if (!cache.has(key)) cache.set(key, generateAdvisorData(region, initials));
  return cache.get(key)!;
}

export interface BlendedPortfolioData {
  performance: Record<string, { labels: string[]; current: number[]; model: number[]; benchmark: number[] }>;
  fees: { current: number; model: number };
  allocation: Array<{ asset: string; current: number; model: number; color: string }>;
}

export function getBlendedPortfolioData(region: string, selectedAdvisors: string[]): BlendedPortfolioData {
  if (!selectedAdvisors || selectedAdvisors.length === 0) {
    // Fallback to a neutral default
    return getBlendedPortfolioData(region, ['__default']);
  }

  const datasets = selectedAdvisors.map(i => getAdvisorPortfolio(region, i));
  const n = datasets.length;

  // Average performance
  const periods = ['6m', '1y', '3y', '5y'] as const;
  const performance: BlendedPortfolioData['performance'] = {};

  for (const p of periods) {
    const first = datasets[0].performance[p];
    const len = first.current.length;
    const avg = (arr: number[][]) => Array.from({ length: len }, (_, i) =>
      +(arr.reduce((s, a) => s + a[i], 0) / n).toFixed(1)
    );
    performance[p] = {
      labels: first.labels,
      current: avg(datasets.map(d => d.performance[p].current)),
      model: avg(datasets.map(d => d.performance[p].model)),
      benchmark: avg(datasets.map(d => d.performance[p].benchmark)),
    };
  }

  // Average fees
  const fees = {
    current: +(datasets.reduce((s, d) => s + d.fees.current, 0) / n).toFixed(2),
    model: +(datasets.reduce((s, d) => s + d.fees.model, 0) / n).toFixed(2),
  };

  // Average allocation
  const allocationKeys = ['equities', 'bonds', 'property', 'cash'] as const;
  const colors = [
    "hsl(var(--brand-blue))",
    "hsl(var(--brand-orange))",
    "hsl(142, 76%, 36%)",
    "hsl(280, 65%, 60%)",
  ];
  const labels = ["Equities", "Bonds", "Property", "Cash"];

  const allocation = allocationKeys.map((key, idx) => ({
    asset: labels[idx],
    current: Math.round(datasets.reduce((s, d) => s + d.allocation[key].current, 0) / n),
    model: Math.round(datasets.reduce((s, d) => s + d.allocation[key].model, 0) / n),
    color: colors[idx],
  }));

  return { performance, fees, allocation };
}
