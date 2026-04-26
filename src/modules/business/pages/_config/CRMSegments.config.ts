// ═══════════════════════════════════════════════════════════════
// SITA OS — CRMSegments page configuration constants
// Extracted to keep the page file free of fixture-shaped arrays.
// ═══════════════════════════════════════════════════════════════

export interface FilterFieldDef {
  key: string;
  label: string;
  type: "text" | "number" | "select";
  options?: string[];
}

export const SEGMENT_FILTER_FIELDS: FilterFieldDef[] = [
  { key: "lifecycle_stage", label: "Lifecycle Stage", type: "select", options: ["new", "lead", "contacted", "engaged", "qualified", "opportunity", "active_opportunity", "proposal_sent", "negotiation", "won", "customer", "dormant", "at_risk", "lost", "churned", "reactivation", "support_sensitive", "collections_sensitive"] },
  { key: "status", label: "Status", type: "select", options: ["active", "inactive", "archived"] },
  { key: "health_score", label: "Health Score", type: "number" },
  { key: "source", label: "Source", type: "text" },
  { key: "city", label: "City", type: "text" },
  { key: "country", label: "Country", type: "text" },
  { key: "last_contacted_days", label: "Days Since Contact", type: "number" },
  { key: "tags", label: "Has Tag", type: "text" },
  { key: "owner", label: "Owner", type: "text" },
];

export const SEGMENT_OPERATORS: Record<string, { key: string; label: string }[]> = {
  text: [{ key: "eq", label: "equals" }, { key: "contains", label: "contains" }],
  number: [{ key: "eq", label: "=" }, { key: "gt", label: ">" }, { key: "lt", label: "<" }, { key: "gte", label: "≥" }, { key: "lte", label: "≤" }],
  select: [{ key: "eq", label: "is" }, { key: "neq", label: "is not" }],
};