// ═══════════════════════════════════════════════════════════════
// SITA OS — Specialized: Opportunity
// ═══════════════════════════════════════════════════════════════

import type { DomainId } from "../_contract-scaffold";

export interface Opportunity {
  id: string;
  title: string;
  domain: DomainId;
  type: "revenue" | "savings" | "efficiency" | "risk-mitigation";
  value?: number;
  confidence: number;
  description: string;
  advisorId: string;
  linkedWorkflows: string[];
  status: "identified" | "evaluating" | "approved" | "in-progress" | "realized" | "dismissed";
}
