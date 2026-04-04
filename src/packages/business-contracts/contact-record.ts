// ═══════════════════════════════════════════════════════════════
// SITA OS — Business Contracts: Contact Record (Enriched)
// Richer canonical version of CRMContact — backward compat kept
// ═══════════════════════════════════════════════════════════════

export type CommunicationPreference = "email" | "phone" | "sms" | "in-app" | "do-not-contact";

export interface ContactRecord {
  id: string;
  accountId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  role: string;
  title?: string;
  tags: string[];
  lastInteraction: string;
  communicationPreference: CommunicationPreference;
  timezone?: string;
  linkedInUrl?: string;
  notes?: string;
  source: "manual" | "import" | "api" | "enrichment";
  createdAt: string;
  updatedAt: string;
}
