// ═══════════════════════════════════════════════════════════════
// SITA OS — Dependency Chain Map
// Inter-unit dependencies for deployment ordering
// ═══════════════════════════════════════════════════════════════

import { DEPLOYMENT_UNITS } from "./deployment-unit-registry";

export interface DependencyChain {
  unitId: string;
  directDependencies: string[];
  transitiveDependencies: string[];
  deploymentOrder: number;
  isLeaf: boolean;
  isRoot: boolean;
}

/** Compute full dependency chains including transitive deps */
export function computeDependencyChains(): DependencyChain[] {
  const chains: DependencyChain[] = [];
  const depMap = new Map<string, string[]>();

  for (const unit of DEPLOYMENT_UNITS) {
    depMap.set(unit.id, [...unit.dependencies]);
  }

  function getTransitive(unitId: string, visited = new Set<string>()): string[] {
    if (visited.has(unitId)) return [];
    visited.add(unitId);
    const direct = depMap.get(unitId) || [];
    const transitive = new Set<string>();
    for (const dep of direct) {
      transitive.add(dep);
      for (const t of getTransitive(dep, visited)) {
        transitive.add(t);
      }
    }
    return Array.from(transitive);
  }

  // Compute deployment order via topological depth
  function getDepth(unitId: string, visited = new Set<string>()): number {
    if (visited.has(unitId)) return 0;
    visited.add(unitId);
    const deps = depMap.get(unitId) || [];
    if (deps.length === 0) return 0;
    return 1 + Math.max(...deps.map((d) => getDepth(d, visited)));
  }

  const dependedOn = new Set<string>();
  for (const unit of DEPLOYMENT_UNITS) {
    for (const dep of unit.dependencies) {
      dependedOn.add(dep);
    }
  }

  for (const unit of DEPLOYMENT_UNITS) {
    const transitive = getTransitive(unit.id);
    chains.push({
      unitId: unit.id,
      directDependencies: [...unit.dependencies],
      transitiveDependencies: transitive.filter((t) => !unit.dependencies.includes(t)),
      deploymentOrder: getDepth(unit.id),
      isLeaf: !dependedOn.has(unit.id),
      isRoot: unit.dependencies.length === 0,
    });
  }

  return chains.sort((a, b) => a.deploymentOrder - b.deploymentOrder);
}

/** Get deployment order (roots first) */
export function getDeploymentOrder(): string[] {
  return computeDependencyChains().map((c) => c.unitId);
}
