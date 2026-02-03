export interface NewOpportunityClient {
  id: string;
  name: string;
  value: number;
  detail: string;
}

export interface NewOpportunityType {
  id: string;
  type: string;
  name: string;
  description: string;
  totalValue: number;
  clientCount: number;
  clients: NewOpportunityClient[];
}

export const sampleNewOpportunities: NewOpportunityType[] = [
  {
    id: "tlh-001",
    type: "tax-loss-harvesting",
    name: "Tax Loss Harvesting (TLH)",
    description: '"off-view" legacy funds that are dragging performance or increasing risk.',
    totalValue: 245000,
    clientCount: 12,
    clients: [
      { id: "c1", name: "John Smith", value: 45000, detail: "2 funds below benchmark by 15%+" },
      { id: "c2", name: "Mary Jones", value: 32000, detail: "3 legacy funds with unrealized losses" },
      { id: "c3", name: "Peter Williams", value: 28000, detail: "Old unit trusts underperforming by 12%" },
      { id: "c4", name: "Sarah Brown", value: 24000, detail: "2 funds with significant capital losses" },
      { id: "c5", name: "David Miller", value: 22000, detail: "Legacy balanced fund dragging returns" },
      { id: "c6", name: "Emma Davis", value: 20000, detail: "3 underperforming sector funds" },
      { id: "c7", name: "Michael Wilson", value: 18000, detail: "Old equity fund with poor risk metrics" },
      { id: "c8", name: "Lisa Anderson", value: 16000, detail: "2 bond funds below benchmark" },
      { id: "c9", name: "James Taylor", value: 14000, detail: "Mixed portfolio with legacy positions" },
      { id: "c10", name: "Jennifer Thomas", value: 12000, detail: "Offshore fund with currency drag" },
      { id: "c11", name: "Robert Jackson", value: 8000, detail: "Small cap fund underperforming" },
      { id: "c12", name: "Amanda White", value: 6000, detail: "Legacy income fund below expectations" },
    ],
  },
  {
    id: "legacy-001",
    type: "legacy-migration",
    name: "Legacy Fund Migration",
    description: "External platform funds underperforming house view by significant margin.",
    totalValue: 180000,
    clientCount: 8,
    clients: [
      { id: "c13", name: "Christopher Lee", value: 35000, detail: "External RA on competitor platform" },
      { id: "c14", name: "Patricia Martin", value: 30000, detail: "Old pension fund ready for consolidation" },
      { id: "c15", name: "Daniel Garcia", value: 28000, detail: "Multiple external unit trusts" },
      { id: "c16", name: "Michelle Robinson", value: 25000, detail: "Legacy endowment policy maturing" },
      { id: "c17", name: "Kevin Clark", value: 22000, detail: "Competitor TFSA with poor returns" },
      { id: "c18", name: "Nancy Lewis", value: 18000, detail: "External living annuity" },
      { id: "c19", name: "Mark Walker", value: 12000, detail: "Old employer pension fund" },
      { id: "c20", name: "Sandra Hall", value: 10000, detail: "Legacy preservation fund" },
    ],
  },
  {
    id: "fee-opt-001",
    type: "fee-optimization",
    name: "Fee Optimization",
    description: "High-fee products that could be replaced with lower-cost alternatives.",
    totalValue: 120000,
    clientCount: 6,
    clients: [
      { id: "c21", name: "Steven Allen", value: 32000, detail: "Actively managed funds with 2.5% TER" },
      { id: "c22", name: "Karen Young", value: 28000, detail: "Multiple wrap funds with high fees" },
      { id: "c23", name: "Brian King", value: 22000, detail: "Retail class units eligible for institutional" },
      { id: "c24", name: "Dorothy Wright", value: 18000, detail: "High-cost guaranteed products" },
      { id: "c25", name: "George Scott", value: 12000, detail: "Expensive offshore feeder funds" },
      { id: "c26", name: "Helen Green", value: 8000, detail: "Legacy products with outdated fee structure" },
    ],
  },
  {
    id: "contrib-001",
    type: "contribution-opportunities",
    name: "Contribution Opportunities",
    description: "Clients with available contribution room and capacity to invest more.",
    totalValue: 95000,
    clientCount: 5,
    clients: [
      { id: "c27", name: "Edward Adams", value: 30000, detail: "TFSA room available, high income" },
      { id: "c28", name: "Ruth Nelson", value: 25000, detail: "RA contribution room, tax benefit" },
      { id: "c29", name: "Frank Carter", value: 18000, detail: "Under-contributed to pension" },
      { id: "c30", name: "Virginia Mitchell", value: 14000, detail: "Bonus season, discretionary savings" },
      { id: "c31", name: "Raymond Perez", value: 8000, detail: "Annual contribution review due" },
    ],
  },
];
