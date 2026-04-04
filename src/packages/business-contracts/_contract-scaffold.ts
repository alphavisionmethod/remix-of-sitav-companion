// ═══════════════════════════════════════════════════════════════
// SITA OS — Business Contracts: Shared Primitives
// ═══════════════════════════════════════════════════════════════

export type BusinessDomainId = "crm" | "sales" | "marketing" | "support" | "operations" | "billing";

export type BusinessEntityType =
  | "lead" | "contact" | "account" | "opportunity" | "quote"
  | "invoice" | "booking" | "task" | "campaign" | "ticket";

export type CurrencyCode = "USD" | "EUR" | "GBP" | "CAD" | "AUD" | "JPY" | "CHF";

export interface MonetaryAmount {
  valueCents: number;
  currency: CurrencyCode;
}

export type BusinessPriority = "critical" | "high" | "medium" | "low" | "none";

export interface BusinessMetadata {
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  source: "manual" | "import" | "api" | "automation" | "advisor";
}
