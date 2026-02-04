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
