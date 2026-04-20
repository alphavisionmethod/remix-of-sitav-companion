// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin Information Architecture Registry
// Canonical hierarchy: Domain → Hub → Page
// ═══════════════════════════════════════════════════════════════

export interface AdminIANode {
  readonly id: string;
  readonly label: string;
  readonly domain: string;
  readonly hub: string;
  readonly route: string;
  readonly runbookRef?: string;
  readonly killSwitchRef?: string;
  readonly evidenceArtifact?: string;
}

export const ADMIN_IA_REGISTRY: readonly AdminIANode[] = [
  // AI Engineering Hub
  { id: "ai-dashboard", label: "AI Dashboard", domain: "ai", hub: "ai-engineering", route: "/admin/ai-engineering", evidenceArtifact: "generated/ai-capability-proof-matrix.json" },
  { id: "ai-models", label: "Model Registry", domain: "ai", hub: "ai-engineering", route: "/admin/ai-engineering/models", runbookRef: "RB-AI-001" },
  { id: "ai-prompts", label: "Prompt Families", domain: "ai", hub: "ai-engineering", route: "/admin/ai-engineering/prompts" },
  { id: "ai-budgets", label: "Budget & Cost", domain: "ai", hub: "ai-engineering", route: "/admin/ai-engineering/budgets", killSwitchRef: "KS-MODEL-PROVIDERS" },
  { id: "ai-advisors", label: "Advisor Registry", domain: "ai", hub: "ai-engineering", route: "/admin/ai-engineering/advisors" },
  // Operations Hub
  { id: "ops-kill-switches", label: "Kill Switches", domain: "operations", hub: "operations", route: "/admin/kill-switches", killSwitchRef: "ALL", runbookRef: "RB-OPS-001" },
  { id: "ops-runbooks", label: "Runbooks", domain: "operations", hub: "operations", route: "/admin/runbooks", evidenceArtifact: "generated/runbook-linkage-coverage.json" },
  { id: "ops-golden-paths", label: "Golden Paths", domain: "operations", hub: "operations", route: "/admin/golden-paths" },
  // Identity Hub
  { id: "identity-users", label: "User Management", domain: "identity", hub: "identity", route: "/admin/users", runbookRef: "RB-AUTH-001" },
  { id: "identity-roles", label: "Roles & Permissions", domain: "identity", hub: "identity", route: "/admin/roles" },
  // Integration Hub
  { id: "integrations-connectors", label: "Connectors", domain: "integrations", hub: "integrations", route: "/admin/integrations", killSwitchRef: "KS-CONNECTORS", evidenceArtifact: "generated/integration-health-matrix.json" },
  // System Hub
  { id: "system-edge-functions", label: "Edge Functions", domain: "system", hub: "system", route: "/admin/edge-functions", evidenceArtifact: "generated/edge-function-topology-v2.json" },
  { id: "system-db", label: "Database Health", domain: "system", hub: "system", route: "/admin/database", evidenceArtifact: "generated/db-authority-map.json" },
];

export function getAdminNodesByHub(hub: string): AdminIANode[] {
  return ADMIN_IA_REGISTRY.filter((n) => n.hub === hub);
}

export function getAdminNodesByDomain(domain: string): AdminIANode[] {
  return ADMIN_IA_REGISTRY.filter((n) => n.domain === domain);
}