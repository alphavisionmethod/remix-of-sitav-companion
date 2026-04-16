// ═══════════════════════════════════════════════════════════════
// SITA OS — Context Dependency Map
// Directed edges between bounded contexts (data/event/rpc/ui/auth).
// ═══════════════════════════════════════════════════════════════

import type { BoundedContextDependencyEdge, BoundedContextId } from "./bounded-context-types";

export const CONTEXT_DEPENDENCY_EDGES: readonly BoundedContextDependencyEdge[] = [
  // Auth flows everywhere
  { from: "business-os", to: "setup-identity", kind: "auth", description: "All Business OS routes require authenticated session." },
  { from: "finance-os", to: "setup-identity", kind: "auth", description: "Finance OS gated by authenticated session + role." },
  { from: "concierge-os", to: "setup-identity", kind: "auth", description: "Concierge requires authenticated user." },
  { from: "admin", to: "setup-identity", kind: "auth", description: "Admin plane requires elevated session + MFA." },
  { from: "boardroom", to: "setup-identity", kind: "auth", description: "Boardroom requires owner-level session." },

  // Boardroom consumes intelligence from domain contexts
  { from: "boardroom", to: "business-os", kind: "data", description: "Boardroom items aggregate Business signals." },
  { from: "boardroom", to: "finance-os", kind: "data", description: "Boardroom items aggregate Finance signals." },
  { from: "boardroom", to: "concierge-os", kind: "data", description: "Boardroom items aggregate Concierge signals." },
  { from: "boardroom", to: "investment-office", kind: "data", description: "Boardroom items aggregate Investment signals." },

  // Mission Control surfaces intelligence to user
  { from: "mission-control", to: "boardroom", kind: "data", description: "Mission Control surfaces approved Boardroom items." },
  { from: "mission-control", to: "runtime-kernel", kind: "rpc", description: "Mission Control invokes intelligence APIs via kernel." },

  // Domain → integrations
  { from: "business-os", to: "integrations", kind: "rpc", description: "CRM sync via integrations layer." },
  { from: "finance-os", to: "integrations", kind: "rpc", description: "Stripe/Plaid via integrations layer." },
  { from: "concierge-os", to: "integrations", kind: "rpc", description: "Calendar/weather via integrations layer." },

  // Everything emits proofs
  { from: "business-os", to: "proof-trust", kind: "event", description: "Business mutations emit receipts." },
  { from: "finance-os", to: "proof-trust", kind: "event", description: "Finance mutations emit receipts (R3+)." },
  { from: "concierge-os", to: "proof-trust", kind: "event", description: "Concierge actions emit receipts." },
  { from: "boardroom", to: "proof-trust", kind: "event", description: "Boardroom decisions emit decision-receipts." },
  { from: "admin", to: "proof-trust", kind: "event", description: "All admin actions logged to audit + receipts." },

  // Runtime kernel powers AI everywhere
  { from: "boardroom", to: "runtime-kernel", kind: "rpc", description: "Boardroom uses ai-gateway for advisor inference." },
  { from: "business-os", to: "runtime-kernel", kind: "rpc", description: "Business advisors invoke kernel AI." },
  { from: "finance-os", to: "runtime-kernel", kind: "rpc", description: "Finance advisors invoke kernel AI." },
  { from: "concierge-os", to: "runtime-kernel", kind: "rpc", description: "Concierge advisors invoke kernel AI." },

  // Mobile delivers notifications
  { from: "mobile", to: "mission-control", kind: "ui", description: "Mobile shell renders Mission Control." },
  { from: "mobile", to: "runtime-kernel", kind: "rpc", description: "Mobile uses BFF gateway → kernel." },

  // Admin observes everything
  { from: "admin", to: "runtime-kernel", kind: "data", description: "Admin reads runtime telemetry." },
  { from: "admin", to: "proof-trust", kind: "data", description: "Admin reads audit + proof tables." },
  { from: "admin", to: "integrations", kind: "data", description: "Admin observes connector health." },
  { from: "admin", to: "cloud-control-plane", kind: "rpc", description: "Admin manages tenants/devices via cloud APIs." },

  // Cloud lifecycle
  { from: "cloud-control-plane", to: "setup-identity", kind: "data", description: "Cloud tenant provisioning seeds identity records." },
  { from: "cloud-control-plane", to: "proof-trust", kind: "event", description: "Cloud lifecycle events generate receipts." },
] as const;

export function getDependenciesFrom(contextId: BoundedContextId): readonly BoundedContextDependencyEdge[] {
  return CONTEXT_DEPENDENCY_EDGES.filter((e) => e.from === contextId);
}

export function getDependenciesTo(contextId: BoundedContextId): readonly BoundedContextDependencyEdge[] {
  return CONTEXT_DEPENDENCY_EDGES.filter((e) => e.to === contextId);
}

export function getDependencyGraph(): Record<string, string[]> {
  const graph: Record<string, string[]> = {};
  for (const edge of CONTEXT_DEPENDENCY_EDGES) {
    (graph[edge.from] ||= []).push(edge.to);
  }
  return graph;
}

export function detectCircularDependencies(): string[][] {
  const graph = getDependencyGraph();
  const cycles: string[][] = [];
  const visited = new Set<string>();
  const stack = new Set<string>();

  function dfs(node: string, path: string[]): void {
    if (stack.has(node)) {
      const idx = path.indexOf(node);
      if (idx !== -1) cycles.push(path.slice(idx).concat(node));
      return;
    }
    if (visited.has(node)) return;
    visited.add(node);
    stack.add(node);
    for (const next of graph[node] || []) dfs(next, [...path, node]);
    stack.delete(node);
  }

  for (const node of Object.keys(graph)) dfs(node, []);
  return cycles;
}
