import React from "react";
import { TrendingUp, ArrowRightLeft, Layers, Building2, Briefcase, Landmark, Receipt, Banknote, BarChart3 } from "lucide-react";

export interface OpportunityTypeConfig {
  label: string;
  color: string;
  icon: React.ReactNode;
}

export const opportunityTypeConfig: Record<string, OpportunityTypeConfig> = {
  "Upsell": { label: "Growth", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: React.createElement(TrendingUp, { className: "w-3.5 h-3.5" }) },
  "Cross-sell": { label: "Cross-sell", color: "bg-cyan-100 text-cyan-700 border-cyan-200", icon: React.createElement(ArrowRightLeft, { className: "w-3.5 h-3.5" }) },
  "Migration": { label: "Migration", color: "bg-violet-100 text-violet-700 border-violet-200", icon: React.createElement(Layers, { className: "w-3.5 h-3.5" }) },
  "Platform": { label: "Platform", color: "bg-orange-100 text-orange-700 border-orange-200", icon: React.createElement(Building2, { className: "w-3.5 h-3.5" }) },
  "New Business": { label: "New Business", color: "bg-blue-100 text-blue-700 border-blue-200", icon: React.createElement(Briefcase, { className: "w-3.5 h-3.5" }) },
  "Bank Scrape": { label: "Bank Scrape", color: "bg-amber-100 text-amber-700 border-amber-200", icon: React.createElement(Landmark, { className: "w-3.5 h-3.5" }) },
  "Tax Loss": { label: "Tax Loss", color: "bg-rose-100 text-rose-700 border-rose-200", icon: React.createElement(Receipt, { className: "w-3.5 h-3.5" }) },
  "Idle Cash": { label: "Idle Cash", color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: React.createElement(Banknote, { className: "w-3.5 h-3.5" }) },
  "Portfolio Review": { label: "Portfolio Review", color: "bg-indigo-100 text-indigo-700 border-indigo-200", icon: React.createElement(BarChart3, { className: "w-3.5 h-3.5" }) },
};

export const getOpportunityConfig = (type: string): OpportunityTypeConfig => {
  const key = Object.keys(opportunityTypeConfig).find(k => type.toLowerCase().includes(k.toLowerCase()));
  return key ? opportunityTypeConfig[key] : opportunityTypeConfig["Upsell"];
};

const DETECTION_RULES: { pattern: RegExp; type: string }[] = [
  { pattern: /\b(rebalance|allocation|drift|equity exposure|portfolio review|asset mix)\b/i, type: "Portfolio Review" },
  { pattern: /\b(tax|capital gains|harvesting|CGT|tax.?loss)\b/i, type: "Tax Loss" },
  { pattern: /\b(cross.?sell|insurance|risk cover|life cover|disability|dread disease)\b/i, type: "Cross-sell" },
  { pattern: /\b(contribution|top.?up|debit order|additional investment|RA\b|increase premium)\b/i, type: "Upsell" },
  { pattern: /\b(consolidat|platform|provider|switch fund|migration)\b/i, type: "Platform" },
  { pattern: /\b(beneficiary|estate|will|trust|new business|new product)\b/i, type: "New Business" },
  { pattern: /\b(bank scrape|bank feed|balance feed|linked account)\b/i, type: "Bank Scrape" },
  { pattern: /\b(idle cash|money market|call account|cash sweep|uninvested)\b/i, type: "Idle Cash" },
];

/**
 * Detect opportunity types from message text content.
 * Returns unique opportunity type keys matching the typeConfig.
 */
export function detectOpportunityTypes(text: string): string[] {
  if (!text) return [];
  const found = new Set<string>();
  for (const rule of DETECTION_RULES) {
    if (rule.pattern.test(text)) {
      found.add(rule.type);
    }
  }
  return Array.from(found);
}
