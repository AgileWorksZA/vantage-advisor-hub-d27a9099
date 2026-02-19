// Centralized list of document types used throughout the CRM
// Used in: AttachmentLinkDialog, ClientDocumentsTab, TaskDetailSheet

export const DOCUMENT_TYPES = [
  "Addition",
  "Additional Contribution",
  "Annuity review",
  "Application form",
  "Beneficiary change",
  "Beneficiary risk rating and sanction list",
  "Client pack",
  "Client review",
  "Company documents(CIPC)",
  "Confirmation letter",
  "Death certificate",
  "Disclosure / Incorporation Certificate",
  "Disclosure/Incorporation Certificate",
  "Dividends Tax Declaration Form",
  "Email",
  "Fee form",
  "Fund switch or rebalance",
  "Guardian consent form",
  "Income change",
  "Instruction form",
  "Intermediary appointment",
  "Letter of authority",
  "Letter Of Authority",
  "Letter of Consent",
  "Letter of Introduction",
  "Mandate",
  "Marriage certification",
  "Migrated Compliance Document",
  "Minutes",
  "New Business",
  "Online authorisation form",
  "Other",
  "Ownership and Control Structure",
  "Partnership Agreement",
  "Planning document",
  "Policy form",
  "Proof of address",
  "Proof of Address (Operating)",
  "Proof of Address (Registered)",
  "Proof of bank",
  "Proof of ID",
  "Proof of payment",
  "Quote",
  "Rebalance",
  "Record of advice",
  "Reduced Tax Declaration Form",
  "Required actions form",
  "Resolution",
  "Resolution of authority",
  "Risk assessment form",
  "Sanction list",
  "Self certification",
  "Source of Funds",
  "Static detail change",
  "Switch",
  "Tax certificate",
  "Trust Deed",
  "Trust Resolution",
  "Unabridged Birth Certificate",
  "Will",
  "Withdrawal",
] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number];

// Helper function to filter document types based on search query
export const filterDocumentTypes = (query: string): string[] => {
  if (!query.trim()) return [...DOCUMENT_TYPES];
  const lowerQuery = query.toLowerCase();
  return DOCUMENT_TYPES.filter((type) =>
    type.toLowerCase().includes(lowerQuery)
  );
};

// --- Regional Outstanding Documents ---

export interface OutstandingDoc {
  document: string;
  workflow: string;
  status: "Overdue" | "Pending" | "Due Soon";
  daysOverdue: number; // positive = overdue, negative = days until due
  priority: "High" | "Medium" | "Low";
}

export const REGIONAL_OUTSTANDING_DOCS: Record<string, OutstandingDoc[]> = {
  ZA: [
    { document: "FICA - Proof of Address", workflow: "FICA - Individual", status: "Overdue", daysOverdue: 5, priority: "High" },
    { document: "FICA - Proof of Identity", workflow: "FICA - Individual", status: "Overdue", daysOverdue: 3, priority: "High" },
    { document: "FAIS Record of Advice", workflow: "Advice Cycle", status: "Due Soon", daysOverdue: -4, priority: "Medium" },
    { document: "Tax Directive", workflow: "Annual Review", status: "Overdue", daysOverdue: 7, priority: "High" },
    { document: "SARS Tax Certificate", workflow: "Tax Year-End", status: "Pending", daysOverdue: -14, priority: "Medium" },
    { document: "BEE Certificate", workflow: "Compliance Review", status: "Pending", daysOverdue: -21, priority: "Low" },
    { document: "Trust Deed", workflow: "Estate Planning", status: "Due Soon", daysOverdue: -3, priority: "Medium" },
    { document: "CIPC Registration Certificate", workflow: "Entity Onboarding", status: "Overdue", daysOverdue: 10, priority: "High" },
    { document: "Risk Profile Questionnaire", workflow: "Advice Cycle", status: "Due Soon", daysOverdue: -5, priority: "Medium" },
    { document: "Proof of Bank Account", workflow: "FICA - Individual", status: "Pending", daysOverdue: -10, priority: "Low" },
    { document: "Source of Funds Declaration", workflow: "FICA - Individual", status: "Overdue", daysOverdue: 2, priority: "High" },
    { document: "Intermediary Appointment Letter", workflow: "New Business", status: "Pending", daysOverdue: -7, priority: "Low" },
  ],
  AU: [
    { document: "AML/CTF Identity Verification", workflow: "Client Onboarding", status: "Overdue", daysOverdue: 4, priority: "High" },
    { document: "ASIC Compliance Declaration", workflow: "Annual Compliance", status: "Due Soon", daysOverdue: -6, priority: "Medium" },
    { document: "Superannuation Statement", workflow: "Retirement Review", status: "Pending", daysOverdue: -15, priority: "Medium" },
    { document: "Medicare Card Copy", workflow: "Client Onboarding", status: "Overdue", daysOverdue: 8, priority: "High" },
    { document: "ABN Registration Certificate", workflow: "Entity Onboarding", status: "Pending", daysOverdue: -20, priority: "Low" },
    { document: "Tax File Number Declaration", workflow: "Tax Compliance", status: "Due Soon", daysOverdue: -3, priority: "High" },
    { document: "Financial Services Guide Acknowledgement", workflow: "Advice Cycle", status: "Pending", daysOverdue: -12, priority: "Low" },
    { document: "Statement of Advice (SoA)", workflow: "Advice Cycle", status: "Overdue", daysOverdue: 6, priority: "High" },
    { document: "Insurance Needs Analysis", workflow: "Risk Review", status: "Due Soon", daysOverdue: -5, priority: "Medium" },
    { document: "SMSF Trust Deed", workflow: "SMSF Setup", status: "Pending", daysOverdue: -18, priority: "Low" },
    { document: "Proof of Address (Utility Bill)", workflow: "AML/CTF Verification", status: "Overdue", daysOverdue: 3, priority: "High" },
  ],
  GB: [
    { document: "KYC - Proof of Address", workflow: "Client Onboarding", status: "Overdue", daysOverdue: 6, priority: "High" },
    { document: "KYC - Proof of Identity", workflow: "Client Onboarding", status: "Due Soon", daysOverdue: -2, priority: "High" },
    { document: "FCA Suitability Report", workflow: "Advice Cycle", status: "Overdue", daysOverdue: 4, priority: "High" },
    { document: "HMRC Self-Assessment Return", workflow: "Tax Year-End", status: "Pending", daysOverdue: -30, priority: "Medium" },
    { document: "National Insurance Letter", workflow: "Client Onboarding", status: "Pending", daysOverdue: -10, priority: "Low" },
    { document: "Companies House Certificate", workflow: "Entity Onboarding", status: "Due Soon", daysOverdue: -5, priority: "Medium" },
    { document: "Pension Transfer Analysis", workflow: "Pension Review", status: "Overdue", daysOverdue: 9, priority: "High" },
    { document: "ISA Transfer Form", workflow: "Investment Transfer", status: "Pending", daysOverdue: -14, priority: "Low" },
    { document: "Anti-Money Laundering Declaration", workflow: "AML Compliance", status: "Due Soon", daysOverdue: -4, priority: "Medium" },
    { document: "Client Agreement Letter", workflow: "New Business", status: "Pending", daysOverdue: -8, priority: "Low" },
    { document: "Power of Attorney", workflow: "Estate Planning", status: "Overdue", daysOverdue: 12, priority: "High" },
  ],
  US: [
    { document: "W-9 Tax Form", workflow: "Account Opening", status: "Overdue", daysOverdue: 3, priority: "High" },
    { document: "W-8BEN (Non-Resident Alien)", workflow: "International Account", status: "Due Soon", daysOverdue: -7, priority: "Medium" },
    { document: "SEC Form ADV Acknowledgement", workflow: "Advisory Agreement", status: "Pending", daysOverdue: -14, priority: "Low" },
    { document: "IRS 1099 Statement", workflow: "Tax Year-End", status: "Overdue", daysOverdue: 5, priority: "High" },
    { document: "Social Security Verification", workflow: "Client Onboarding", status: "Due Soon", daysOverdue: -3, priority: "High" },
    { document: "FinCEN SAR Filing", workflow: "AML Compliance", status: "Pending", daysOverdue: -21, priority: "Medium" },
    { document: "Investment Policy Statement", workflow: "Advice Cycle", status: "Overdue", daysOverdue: 8, priority: "High" },
    { document: "Beneficiary Designation Form", workflow: "Estate Planning", status: "Pending", daysOverdue: -10, priority: "Low" },
    { document: "Proof of Address (Utility Bill)", workflow: "KYC Verification", status: "Due Soon", daysOverdue: -4, priority: "Medium" },
    { document: "ERISA Compliance Certificate", workflow: "Retirement Plan", status: "Pending", daysOverdue: -18, priority: "Low" },
    { document: "State Business Registration", workflow: "Entity Onboarding", status: "Overdue", daysOverdue: 6, priority: "High" },
  ],
  CA: [
    { document: "KYC - SIN Verification", workflow: "Client Onboarding", status: "Overdue", daysOverdue: 4, priority: "High" },
    { document: "KYC - Proof of Identity", workflow: "Client Onboarding", status: "Due Soon", daysOverdue: -3, priority: "High" },
    { document: "CRA Tax Assessment (NOA)", workflow: "Tax Year-End", status: "Pending", daysOverdue: -20, priority: "Medium" },
    { document: "FINTRAC Compliance Declaration", workflow: "AML Compliance", status: "Overdue", daysOverdue: 7, priority: "High" },
    { document: "Provincial Business License", workflow: "Entity Onboarding", status: "Pending", daysOverdue: -15, priority: "Low" },
    { document: "RRSP/TFSA Contribution Statement", workflow: "Retirement Review", status: "Due Soon", daysOverdue: -5, priority: "Medium" },
    { document: "Know Your Client Form", workflow: "Advice Cycle", status: "Overdue", daysOverdue: 3, priority: "High" },
    { document: "MFDA/IIROC Suitability Report", workflow: "Compliance Review", status: "Due Soon", daysOverdue: -6, priority: "Medium" },
    { document: "Anti-Money Laundering Attestation", workflow: "AML Compliance", status: "Pending", daysOverdue: -12, priority: "Low" },
    { document: "Power of Attorney", workflow: "Estate Planning", status: "Overdue", daysOverdue: 10, priority: "High" },
    { document: "Proof of Address", workflow: "KYC Verification", status: "Pending", daysOverdue: -8, priority: "Low" },
  ],
};

/**
 * Deterministically selects 4-7 outstanding documents for a given client
 * from the regional pool, using a seeded random based on clientId.
 */
export const getOutstandingDocsForRegion = (region: string, clientId: string): OutstandingDoc[] => {
  const pool = REGIONAL_OUTSTANDING_DOCS[region] || REGIONAL_OUTSTANDING_DOCS["ZA"];

  // Simple seeded random
  let hash = 0;
  const seed = clientId + region;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const rand = () => {
    hash = ((hash << 13) ^ hash) - (hash >> 21);
    hash = hash & 0x7fffffff;
    return (hash % 10000) / 10000;
  };

  // Pick 4-7 documents
  const count = 4 + Math.floor(rand() * 4); // 4 to 7
  const shuffled = [...pool].sort(() => rand() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
};
