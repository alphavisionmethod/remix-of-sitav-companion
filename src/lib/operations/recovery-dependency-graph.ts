// ═══════════════════════════════════════════════════════════════
// SITA OS — Recovery Dependency Graph (Wave 21)
// Static directed graph of recovery dependencies per subsystem.
// ═══════════════════════════════════════════════════════════════

export interface RecoveryDependencyNode {
  readonly subsystem: string;
  readonly upstream: readonly string[];
  readonly downstream: readonly string[];
  readonly externalProviders: readonly string[];
  readonly killSwitchInteractions: readonly string[];
  readonly sequenceConstraints: readonly string[];
}

export const RECOVERY_DEPENDENCY_GRAPH: readonly RecoveryDependencyNode[] = [
  {
    subsystem: "auth",
    upstream: [],
    downstream: ["ai-providers", "connectors", "payments-auth", "approvals", "setup"],
    externalProviders: ["supabase-auth"],
    killSwitchInteractions: [],
    sequenceConstraints: ["Auth must recover before any downstream service can re-authenticate"],
  },
  {
    subsystem: "db",
    upstream: [],
    downstream: ["auth", "ai-providers", "connectors", "proof", "workflow", "release"],
    externalProviders: ["supabase-postgres"],
    killSwitchInteractions: [],
    sequenceConstraints: ["DB must be available before any dependent service can persist state"],
  },
  {
    subsystem: "ai-providers",
    upstream: ["auth", "db"],
    downstream: ["workflow"],
    externalProviders: ["openai", "google-ai", "anthropic"],
    killSwitchInteractions: ["KS-MODEL-PROVIDERS"],
    sequenceConstraints: ["Fallback chain activates before kill-switch"],
  },
  {
    subsystem: "connectors",
    upstream: ["auth", "db"],
    downstream: ["sync", "workflow"],
    externalProviders: ["google-oauth", "microsoft-oauth", "slack-oauth"],
    killSwitchInteractions: ["KS-CONNECTORS"],
    sequenceConstraints: ["Token refresh precedes sync resumption"],
  },
  {
    subsystem: "release",
    upstream: ["db"],
    downstream: ["desktop-host"],
    externalProviders: [],
    killSwitchInteractions: ["KS-RELEASE-ROLLOUT", "KS-APPLIANCE-UPDATE"],
    sequenceConstraints: ["Rollback completes before new deploy can proceed"],
  },
  {
    subsystem: "payments-auth",
    upstream: ["auth", "db"],
    downstream: ["proof"],
    externalProviders: ["stripe", "paddle"],
    killSwitchInteractions: ["KS-PAYMENTS-AUTH"],
    sequenceConstraints: ["Payment gateway health confirmed before retrying failed transactions"],
  },
  {
    subsystem: "rls",
    upstream: ["db"],
    downstream: ["auth", "proof"],
    externalProviders: [],
    killSwitchInteractions: [],
    sequenceConstraints: ["RLS policy fix must be verified before lifting read restrictions"],
  },
  {
    subsystem: "workflow",
    upstream: ["auth", "db", "ai-providers"],
    downstream: [],
    externalProviders: [],
    killSwitchInteractions: ["KS-WORKFLOW"],
    sequenceConstraints: ["Stuck workflow replay requires upstream services healthy"],
  },
  {
    subsystem: "sync",
    upstream: ["connectors", "db"],
    downstream: [],
    externalProviders: [],
    killSwitchInteractions: ["KS-SYNC"],
    sequenceConstraints: ["Connector tokens must be valid before sync resumes"],
  },
  {
    subsystem: "desktop-host",
    upstream: ["release"],
    downstream: [],
    externalProviders: ["electron"],
    killSwitchInteractions: ["KS-APPLIANCE-UPDATE"],
    sequenceConstraints: ["Safe-mode must be available as fallback during recovery"],
  },
  {
    subsystem: "proof",
    upstream: ["db"],
    downstream: [],
    externalProviders: [],
    killSwitchInteractions: [],
    sequenceConstraints: ["Proof integrity check runs before accepting new receipts"],
  },
  {
    subsystem: "ingress",
    upstream: [],
    downstream: ["auth", "ai-providers", "connectors"],
    externalProviders: ["cloudflare", "nginx"],
    killSwitchInteractions: [],
    sequenceConstraints: ["Ingress restoration precedes all application-layer recovery"],
  },
  {
    subsystem: "support-escalation",
    upstream: ["auth", "db"],
    downstream: [],
    externalProviders: [],
    killSwitchInteractions: ["KS-OUTBOUND"],
    sequenceConstraints: ["Escalation path requires auth and DB connectivity"],
  },
];

export function getDependenciesFor(subsystem: string): RecoveryDependencyNode | undefined {
  return RECOVERY_DEPENDENCY_GRAPH.find((n) => n.subsystem === subsystem);
}

export function getRecoveryOrder(): string[] {
  const visited = new Set<string>();
  const order: string[] = [];
  const nodes = new Map(RECOVERY_DEPENDENCY_GRAPH.map((n) => [n.subsystem, n]));

  function visit(id: string) {
    if (visited.has(id)) return;
    visited.add(id);
    const node = nodes.get(id);
    if (node) for (const up of node.upstream) visit(up);
    order.push(id);
  }

  for (const n of RECOVERY_DEPENDENCY_GRAPH) visit(n.subsystem);
  return order;
}