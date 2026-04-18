// ═══════════════════════════════════════════════════════════════
// SITA OS — Dependency Resolver (Planning Layer)
// Resolves step dependencies within plans
// ═══════════════════════════════════════════════════════════════

import type { PlannedStep } from "../shared/orchestration-envelope";
import { DependencyResolutionError } from "../shared/orchestration-errors";

export interface DependencyGraph {
  nodes: string[];
  edges: Record<string, string[]>;
  executionOrder: string[];
  hasCycles: boolean;
}

export function resolveDependencies(steps: PlannedStep[]): DependencyGraph {
  const nodes = steps.map(s => s.stepId);
  const edges: Record<string, string[]> = {};

  for (const step of steps) {
    edges[step.stepId] = step.dependsOn.filter(dep => nodes.includes(dep));
  }

  // Topological sort
  const visited = new Set<string>();
  const visiting = new Set<string>();
  const order: string[] = [];
  let hasCycles = false;

  function visit(nodeId: string): void {
    if (visited.has(nodeId)) return;
    if (visiting.has(nodeId)) { hasCycles = true; return; }
    visiting.add(nodeId);
    for (const dep of (edges[nodeId] ?? [])) {
      visit(dep);
    }
    visiting.delete(nodeId);
    visited.add(nodeId);
    order.push(nodeId);
  }

  for (const node of nodes) visit(node);

  if (hasCycles) {
    const unresolved = nodes.filter(n => !visited.has(n));
    throw new DependencyResolutionError(
      "Circular dependency detected in plan steps",
      unresolved
    );
  }

  return { nodes, edges, executionOrder: order, hasCycles };
}
