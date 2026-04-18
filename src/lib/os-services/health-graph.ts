// ═══════════════════════════════════════════════════════════════
// SITA OS — Health Dependency Graph
// DAG-based service health with cascading failure analysis
// ═══════════════════════════════════════════════════════════════

export type HealthState = 'ready' | 'live' | 'degraded' | 'failed' | 'restarting' | 'blocked' | 'unsafe' | 'unknown';

export interface ServiceHealthNode {
  serviceId: string;
  state: HealthState;
  dependencies: string[];
  lastError?: string;
  restartCount: number;
  degradedReason?: string;
  lastHeartbeat: number;
  upSince?: number;
}

export interface CascadeResult {
  affected: string[];
  safeToRun: string[];
  mustDisable: string[];
  requiresRollback: string[];
}

class HealthDependencyGraph {
  private nodes = new Map<string, ServiceHealthNode>();

  register(node: ServiceHealthNode): void {
    this.nodes.set(node.serviceId, node);
  }

  updateState(serviceId: string, state: HealthState, reason?: string): void {
    const node = this.nodes.get(serviceId);
    if (!node) return;
    node.state = state;
    if (state === 'degraded') node.degradedReason = reason;
    if (state === 'failed') node.lastError = reason;
    if (state === 'restarting') node.restartCount++;
    node.lastHeartbeat = Date.now();
  }

  heartbeat(serviceId: string): void {
    const node = this.nodes.get(serviceId);
    if (node) node.lastHeartbeat = Date.now();
  }

  getNode(serviceId: string): ServiceHealthNode | undefined {
    return this.nodes.get(serviceId);
  }

  /** Get all direct dependents of a service */
  getDependents(serviceId: string): string[] {
    return [...this.nodes.values()]
      .filter(n => n.dependencies.includes(serviceId))
      .map(n => n.serviceId);
  }

  /** Cascade failure analysis: what breaks if serviceId fails? */
  analyzeCascade(failedServiceId: string): CascadeResult {
    const affected = new Set<string>();
    const queue = [failedServiceId];

    while (queue.length > 0) {
      const current = queue.shift()!;
      const dependents = this.getDependents(current);
      for (const dep of dependents) {
        if (!affected.has(dep)) {
          affected.add(dep);
          queue.push(dep);
        }
      }
    }

    const allServices = [...this.nodes.keys()];
    const affectedArr = [...affected];
    const safeToRun = allServices.filter(s => s !== failedServiceId && !affected.has(s));
    const mustDisable = affectedArr.filter(s => {
      const node = this.nodes.get(s);
      return node?.dependencies.every(d => d === failedServiceId || affected.has(d));
    });
    const requiresRollback = affectedArr.filter(s => {
      const node = this.nodes.get(s);
      return (node?.restartCount ?? 0) > 3;
    });

    return { affected: affectedArr, safeToRun, mustDisable, requiresRollback };
  }

  /** Check if all dependencies of a service are healthy */
  areDependenciesHealthy(serviceId: string): boolean {
    const node = this.nodes.get(serviceId);
    if (!node) return false;
    return node.dependencies.every(dep => {
      const depNode = this.nodes.get(dep);
      return depNode && (depNode.state === 'ready' || depNode.state === 'live');
    });
  }

  /** Get overall system health */
  systemHealth(): { total: number; healthy: number; degraded: number; failed: number; score: number } {
    const nodes = [...this.nodes.values()];
    const healthy = nodes.filter(n => n.state === 'ready' || n.state === 'live').length;
    const degraded = nodes.filter(n => n.state === 'degraded').length;
    const failed = nodes.filter(n => n.state === 'failed' || n.state === 'unsafe').length;
    return {
      total: nodes.length, healthy, degraded, failed,
      score: nodes.length > 0 ? Math.round((healthy / nodes.length) * 100) : 0,
    };
  }

  allNodes(): ServiceHealthNode[] { return [...this.nodes.values()]; }

  /** Topological sort for boot ordering */
  bootOrder(): string[] {
    const visited = new Set<string>();
    const order: string[] = [];
    const visit = (id: string) => {
      if (visited.has(id)) return;
      visited.add(id);
      const node = this.nodes.get(id);
      node?.dependencies.forEach(visit);
      order.push(id);
    };
    this.nodes.forEach((_, id) => visit(id));
    return order;
  }
}

export const healthGraph = new HealthDependencyGraph();

// Pre-register core service dependencies
const CORE_DEPS: [string, string[]][] = [
  ['secretsd', []],
  ['policyd', ['secretsd']],
  ['authd', ['secretsd', 'policyd']],
  ['sessiond', ['authd', 'policyd']],
  ['settingsd', []],
  ['healthd', []],
  ['crashd', ['healthd']],
  ['timed', []],
  ['accessibilityd', ['settingsd']],
  ['networkd', []],
  ['wifid', ['networkd']],
  ['btd', ['networkd']],
  ['powerd', ['settingsd']],
  ['shieldd', ['policyd', 'networkd', 'secretsd']],
  ['updated', ['networkd', 'healthd']],
  ['audiod', ['settingsd']],
  ['deviced', ['settingsd']],
  ['ipc-bus', []],
];

CORE_DEPS.forEach(([id, deps]) => {
  healthGraph.register({
    serviceId: id, state: 'ready', dependencies: deps,
    restartCount: 0, lastHeartbeat: Date.now(), upSince: Date.now(),
  });
});
