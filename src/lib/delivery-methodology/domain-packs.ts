// ═══════════════════════════════════════════════════════════════
// SITA Delivery OS — Domain Methodology Packs
// Per-domain discipline definitions
// ═══════════════════════════════════════════════════════════════

export interface DomainPack {
  domainKey: string;
  displayName: string;
  description: string;
  expectedRoutes: string[];
  requiredShells: string[];
  requiredBoards: string[];
  requiredContracts: string[];
  expectedEvents: string[];
  expectedInteractions: string[];
  requiredProofs: string[];
  verificationFlows: string[];
  readinessRules: string[];
  maturityTarget: "presentational" | "simulated" | "persisted" | "proven";
}

export const CANONICAL_DOMAIN_PACKS: DomainPack[] = [
  {
    domainKey: "money-office",
    displayName: "Money Office",
    description: "Financial management, accounts, bills, budgets, transactions, net worth",
    expectedRoutes: ["/money-office", "/money-office/accounts", "/money-office/bills", "/money-office/budgets", "/money-office/transactions"],
    requiredShells: ["office-shell"],
    requiredBoards: ["financial-overview-board", "cash-flow-board"],
    requiredContracts: ["account-contract", "transaction-contract", "bill-contract", "budget-contract"],
    expectedEvents: ["transaction.created", "bill.paid", "budget.threshold-reached"],
    expectedInteractions: ["add-transaction", "pay-bill", "set-budget", "reconcile-account"],
    requiredProofs: ["transaction-receipt", "payment-proof", "reconciliation-proof"],
    verificationFlows: ["transaction-creates-persists", "bill-payment-completes", "budget-tracks-correctly"],
    readinessRules: ["all-accounts-persist", "transactions-survive-refresh", "receipts-linked"],
    maturityTarget: "proven",
  },
  {
    domainKey: "revenue-office",
    displayName: "Revenue Office",
    description: "Revenue engine, leads, pipeline, opportunities, customers, invoicing",
    expectedRoutes: ["/revenue-office", "/revenue-office/pipeline", "/revenue-office/leads", "/revenue-office/customers", "/revenue-office/invoices"],
    requiredShells: ["office-shell"],
    requiredBoards: ["revenue-overview-board", "pipeline-board", "forecast-board"],
    requiredContracts: ["lead-contract", "opportunity-contract", "invoice-contract", "customer-contract"],
    expectedEvents: ["lead.created", "opportunity.won", "invoice.sent", "payment.received"],
    expectedInteractions: ["create-lead", "advance-stage", "send-invoice", "mark-paid"],
    requiredProofs: ["invoice-sent-proof", "payment-received-proof"],
    verificationFlows: ["lead-to-customer-journey", "invoice-to-payment-journey"],
    readinessRules: ["pipeline-persists", "invoices-persist", "receipts-linked"],
    maturityTarget: "proven",
  },
  {
    domainKey: "digital-presence",
    displayName: "Digital Presence",
    description: "Brand, website builder, content, SEO, social presence",
    expectedRoutes: ["/digital-presence", "/digital-presence/sites", "/digital-presence/brand", "/digital-presence/content"],
    requiredShells: ["office-shell"],
    requiredBoards: ["presence-overview-board", "brand-health-board"],
    requiredContracts: ["site-contract", "brand-kit-contract", "content-contract"],
    expectedEvents: ["site.published", "content.created", "brand.updated"],
    expectedInteractions: ["create-site", "edit-page", "publish-site", "update-brand"],
    requiredProofs: ["publish-proof", "deployment-proof"],
    verificationFlows: ["site-create-publish-journey", "brand-update-propagates"],
    readinessRules: ["sites-persist", "brand-kits-persist", "publish-works"],
    maturityTarget: "persisted",
  },
  {
    domainKey: "ai-engineering",
    displayName: "AI Engineering",
    description: "Agent management, compute governance, intelligence architecture, model routing",
    expectedRoutes: ["/admin/ai-engineering", "/admin/compute-governance", "/admin/intelligence-library"],
    requiredShells: ["admin-shell"],
    requiredBoards: ["ai-overview-board", "compute-budget-board", "agent-health-board"],
    requiredContracts: ["agent-contract", "compute-budget-contract", "intelligence-contract"],
    expectedEvents: ["agent.executed", "compute.budget-used", "intelligence.generated"],
    expectedInteractions: ["deploy-agent", "set-budget", "review-intelligence"],
    requiredProofs: ["compute-usage-proof", "agent-execution-receipt"],
    verificationFlows: ["agent-deploy-execute-journey", "budget-tracks-usage"],
    readinessRules: ["agents-persist", "budgets-track", "intelligence-artifacts-durable"],
    maturityTarget: "proven",
  },
  {
    domainKey: "admin-control",
    displayName: "Admin Control Plane",
    description: "System governance, policies, audit, approvals, truth enforcement",
    expectedRoutes: ["/admin", "/admin/policies", "/admin/audit", "/admin/approvals", "/admin/truth-enforcement"],
    requiredShells: ["admin-shell"],
    requiredBoards: ["system-health-board", "policy-board", "audit-board"],
    requiredContracts: ["policy-contract", "approval-contract", "audit-contract"],
    expectedEvents: ["policy.evaluated", "approval.decided", "audit.recorded"],
    expectedInteractions: ["create-policy", "review-approval", "investigate-audit"],
    requiredProofs: ["policy-evaluation-proof", "approval-receipt", "audit-trail-proof"],
    verificationFlows: ["policy-create-evaluate-journey", "approval-request-review-journey"],
    readinessRules: ["policies-persist", "approvals-persist", "audit-immutable"],
    maturityTarget: "proven",
  },
  {
    domainKey: "trust-proof",
    displayName: "Trust & Proof",
    description: "Receipts, evidence bundles, verification, attestation, lineage",
    expectedRoutes: ["/admin/action-lineage", "/admin/replay-console", "/admin/ai-evidence-bundles"],
    requiredShells: ["admin-shell"],
    requiredBoards: ["trust-overview-board", "lineage-board"],
    requiredContracts: ["receipt-contract", "evidence-contract", "attestation-contract"],
    expectedEvents: ["receipt.created", "evidence.verified", "attestation.signed"],
    expectedInteractions: ["view-receipt", "verify-evidence", "sign-attestation"],
    requiredProofs: ["receipt-chain", "evidence-bundle", "attestation-proof"],
    verificationFlows: ["action-to-receipt-journey", "evidence-verification-journey"],
    readinessRules: ["receipts-immutable", "evidence-linked", "attestations-valid"],
    maturityTarget: "proven",
  },
  {
    domainKey: "connector",
    displayName: "Connector & Integration",
    description: "External system integration, sync, health monitoring",
    expectedRoutes: ["/connectors", "/connectors/setup", "/connectors/health"],
    requiredShells: ["default-shell"],
    requiredBoards: ["connector-health-board"],
    requiredContracts: ["connector-auth-contract", "sync-contract", "health-contract"],
    expectedEvents: ["connector.connected", "sync.completed", "connector.error"],
    expectedInteractions: ["connect-service", "configure-sync", "view-health"],
    requiredProofs: ["connection-proof", "sync-receipt"],
    verificationFlows: ["connect-configure-sync-journey"],
    readinessRules: ["connections-persist", "sync-runs", "health-monitors"],
    maturityTarget: "persisted",
  },
];

export function getDomainPack(domainKey: string): DomainPack | undefined {
  return CANONICAL_DOMAIN_PACKS.find(p => p.domainKey === domainKey);
}

export function getAllDomainKeys(): string[] {
  return CANONICAL_DOMAIN_PACKS.map(p => p.domainKey);
}
