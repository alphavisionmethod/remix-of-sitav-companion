// ============================================================
// SITA OS — Domain Truth Boundary Declarations
// Fields that must NEVER come from free-form LLM output
// ============================================================

import type { TruthBoundaryRule } from "./types";

export const FINANCE_TRUTH_BOUNDARIES: TruthBoundaryRule[] = [
  { domain: "finance", field: "balance", requiredSource: "deterministic", neverFromLLM: true, description: "Account balances must come from verified sources" },
  { domain: "finance", field: "price", requiredSource: "verified-external", neverFromLLM: true, description: "Asset/security prices must come from market feeds" },
  { domain: "finance", field: "exposure", requiredSource: "deterministic", neverFromLLM: true, description: "Risk exposure must be calculated deterministically" },
  { domain: "finance", field: "reserve_sufficiency", requiredSource: "deterministic", neverFromLLM: true, description: "Reserve adequacy must be formula-driven" },
  { domain: "finance", field: "obligation", requiredSource: "canonical-record", neverFromLLM: true, description: "Obligations must come from stored records" },
  { domain: "finance", field: "arithmetic", requiredSource: "deterministic", neverFromLLM: true, description: "All calculations must be deterministic" },
  { domain: "finance", field: "risk_calculation", requiredSource: "deterministic", neverFromLLM: true, description: "Risk scores must use verified formulas" },
  { domain: "finance", field: "approval_threshold", requiredSource: "canonical-record", neverFromLLM: true, description: "Approval limits come from policy records" },
  { domain: "finance", field: "execution_readiness", requiredSource: "deterministic", neverFromLLM: true, description: "Execution state must be verified" },
  { domain: "finance", field: "verification_result", requiredSource: "deterministic", neverFromLLM: true, description: "Verification outcomes are deterministic" },
];

export const BUSINESS_TRUTH_BOUNDARIES: TruthBoundaryRule[] = [
  { domain: "business", field: "lead_state", requiredSource: "canonical-record", neverFromLLM: true, description: "Lead status comes from CRM records" },
  { domain: "business", field: "customer_state", requiredSource: "canonical-record", neverFromLLM: true, description: "Customer status from canonical store" },
  { domain: "business", field: "invoice_state", requiredSource: "canonical-record", neverFromLLM: true, description: "Invoice status from accounting records" },
  { domain: "business", field: "quote_status", requiredSource: "canonical-record", neverFromLLM: true, description: "Quote/proposal state from records" },
  { domain: "business", field: "followup_due_date", requiredSource: "canonical-record", neverFromLLM: true, description: "Due dates from stored schedules" },
  { domain: "business", field: "payment_state", requiredSource: "canonical-record", neverFromLLM: true, description: "Payment status from payment provider" },
  { domain: "business", field: "workflow_state", requiredSource: "canonical-record", neverFromLLM: true, description: "Workflow status from execution engine" },
  { domain: "business", field: "proof_of_outreach", requiredSource: "canonical-record", neverFromLLM: true, description: "Outreach proof from activity logs" },
];

export const CONCIERGE_TRUTH_BOUNDARIES: TruthBoundaryRule[] = [
  { domain: "concierge", field: "reminder", requiredSource: "canonical-record", neverFromLLM: true, description: "Reminders from stored records" },
  { domain: "concierge", field: "calendar_time", requiredSource: "canonical-record", neverFromLLM: true, description: "Calendar entries from canonical calendar" },
  { domain: "concierge", field: "booking_status", requiredSource: "verified-external", neverFromLLM: true, description: "Booking state from provider APIs" },
  { domain: "concierge", field: "itinerary_state", requiredSource: "canonical-record", neverFromLLM: true, description: "Itinerary from stored records" },
  { domain: "concierge", field: "task_state", requiredSource: "canonical-record", neverFromLLM: true, description: "Task status from task store" },
  { domain: "concierge", field: "household_visibility", requiredSource: "canonical-record", neverFromLLM: true, description: "Visibility rules from access control" },
  { domain: "concierge", field: "sensitive_document_access", requiredSource: "canonical-record", neverFromLLM: true, description: "Document ACLs from policy store" },
];

export const TRUST_TRUTH_BOUNDARIES: TruthBoundaryRule[] = [
  { domain: "trust", field: "policy_decision", requiredSource: "deterministic", neverFromLLM: true, description: "Policy outcomes from policy engine" },
  { domain: "trust", field: "approval_state", requiredSource: "canonical-record", neverFromLLM: true, description: "Approval status from approval queue" },
  { domain: "trust", field: "execution_state", requiredSource: "canonical-record", neverFromLLM: true, description: "Execution state from executor service" },
  { domain: "trust", field: "receipt", requiredSource: "canonical-record", neverFromLLM: true, description: "Receipts from receipt service" },
  { domain: "trust", field: "proof_availability", requiredSource: "canonical-record", neverFromLLM: true, description: "Proof from verification service" },
  { domain: "trust", field: "verification", requiredSource: "deterministic", neverFromLLM: true, description: "Verification results are deterministic" },
  { domain: "trust", field: "rollback_state", requiredSource: "canonical-record", neverFromLLM: true, description: "Rollback state from execution log" },
  { domain: "trust", field: "permissions", requiredSource: "canonical-record", neverFromLLM: true, description: "Permissions from access control" },
];

export const ALL_TRUTH_BOUNDARIES: TruthBoundaryRule[] = [
  ...FINANCE_TRUTH_BOUNDARIES,
  ...BUSINESS_TRUTH_BOUNDARIES,
  ...CONCIERGE_TRUTH_BOUNDARIES,
  ...TRUST_TRUTH_BOUNDARIES,
];

export function getTruthBoundary(domain: string, field: string): TruthBoundaryRule | undefined {
  return ALL_TRUTH_BOUNDARIES.find(r => r.domain === domain && r.field === field);
}

export function isDeterministicField(domain: string, field: string): boolean {
  const rule = getTruthBoundary(domain, field);
  return rule?.neverFromLLM ?? false;
}

export function getDomainBoundaries(domain: string): TruthBoundaryRule[] {
  return ALL_TRUTH_BOUNDARIES.filter(r => r.domain === domain);
}
