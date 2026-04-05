// ═══════════════════════════════════════════════════════════════
// SITA OS — Agent Health Monitor
// Continuous health scoring, auto-restart, auto-demote,
// heartbeat tracking, self-healing integration
// ═══════════════════════════════════════════════════════════════

export type AgentHealthStatus = "healthy" | "degraded" | "critical" | "unresponsive" | "restarting";
type MutableHealthStatus = AgentHealthStatus;

export interface AgentHealthSnapshot {
  agentId: string;
  status: AgentHealthStatus;
  healthScore: number;            // 0-100
  errorRate: number;              // 0-1 rolling window
  avgLatencyMs: number;
  taskSuccessRatio: number;       // 0-1
  costDriftPercent: number;       // deviation from budget
  lastHeartbeat: string;
  consecutiveFailures: number;
  restartCount: number;
  lastRestartAt?: string;
  demotionCount: number;
  lastDemotionAt?: string;
  uptimeMs: number;
  staleSinceMs: number;
}

export interface HealthIncident {
  id: string;
  agentId: string;
  type: "error_spike" | "latency_spike" | "heartbeat_lost" | "cost_overrun" | "task_failure_streak";
  severity: "warning" | "critical";
  detectedAt: string;
  resolvedAt?: string;
  autoAction?: string;
  details: Record<string, unknown>;
}

interface AgentMetricWindow {
  errors: number[];
  latencies: number[];
  successes: number[];
  failures: number[];
  costs: number[];
  heartbeats: number[];   // timestamps
  startedAt: number;
}

const WINDOW_SIZE = 100;
const HEARTBEAT_STALE_MS = 60_000;
const MAX_CONSECUTIVE_FAILURES = 5;
const ERROR_RATE_THRESHOLD = 0.3;
const LATENCY_SPIKE_MS = 5000;
const COST_DRIFT_THRESHOLD = 0.5; // 50% over budget
const RESTART_BACKOFF_BASE_MS = 5000;
const MAX_RESTART_BACKOFF_MS = 300_000;
const MAX_RESTARTS_PER_HOUR = 5;

export class AgentHealthMonitorService {
  private metrics = new Map<string, AgentMetricWindow>();
  private snapshots = new Map<string, AgentHealthSnapshot>();
  private incidents: HealthIncident[] = [];
  private incidentCounter = 0;
  private restartTimestamps = new Map<string, number[]>();
  private budgets = new Map<string, number>(); // agentId → hourly budget cents

  // ── Registration ──────────────────────────────────────────────

  registerAgent(agentId: string, hourlyBudgetCents?: number): void {
    if (!this.metrics.has(agentId)) {
      this.metrics.set(agentId, {
        errors: [], latencies: [], successes: [], failures: [],
        costs: [], heartbeats: [Date.now()], startedAt: Date.now(),
      });
      this.snapshots.set(agentId, {
        agentId, status: "healthy", healthScore: 100,
        errorRate: 0, avgLatencyMs: 0, taskSuccessRatio: 1,
        costDriftPercent: 0, lastHeartbeat: new Date().toISOString(),
        consecutiveFailures: 0, restartCount: 0, demotionCount: 0,
        uptimeMs: 0, staleSinceMs: 0,
      });
    }
    if (hourlyBudgetCents !== undefined) {
      this.budgets.set(agentId, hourlyBudgetCents);
    }
  }

  // ── Metric Ingestion ──────────────────────────────────────────

  recordHeartbeat(agentId: string): void {
    const m = this.ensureMetrics(agentId);
    m.heartbeats.push(Date.now());
    if (m.heartbeats.length > WINDOW_SIZE) m.heartbeats.shift();
    this.recomputeHealth(agentId);
  }

  recordTaskSuccess(agentId: string, latencyMs: number, costCents: number): void {
    const m = this.ensureMetrics(agentId);
    m.successes.push(1);
    m.failures.push(0);
    m.latencies.push(latencyMs);
    m.costs.push(costCents);
    this.trimWindow(m);
    this.recomputeHealth(agentId);
  }

  recordTaskFailure(agentId: string, latencyMs: number, costCents: number): void {
    const m = this.ensureMetrics(agentId);
    m.successes.push(0);
    m.failures.push(1);
    m.errors.push(1);
    m.latencies.push(latencyMs);
    m.costs.push(costCents);
    this.trimWindow(m);

    const snap = this.snapshots.get(agentId);
    if (snap) {
      snap.consecutiveFailures++;
      if (snap.consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
        this.createIncident(agentId, "task_failure_streak", "critical", {
          consecutiveFailures: snap.consecutiveFailures,
        });
        this.autoRestart(agentId);
      }
    }
    this.recomputeHealth(agentId);
  }

  recordError(agentId: string): void {
    const m = this.ensureMetrics(agentId);
    m.errors.push(1);
    if (m.errors.length > WINDOW_SIZE) m.errors.shift();
    this.recomputeHealth(agentId);
  }

  // ── Health Computation ────────────────────────────────────────

  private recomputeHealth(agentId: string): void {
    const m = this.metrics.get(agentId);
    const snap = this.snapshots.get(agentId);
    if (!m || !snap) return;

    const now = Date.now();
    const totalTasks = m.successes.length;
    const successCount = m.successes.reduce((a, b) => a + b, 0);
    const failCount = m.failures.reduce((a, b) => a + b, 0);

    // Error rate (rolling)
    snap.errorRate = totalTasks > 0 ? failCount / totalTasks : 0;

    // Average latency
    snap.avgLatencyMs = m.latencies.length > 0
      ? m.latencies.reduce((a, b) => a + b, 0) / m.latencies.length : 0;

    // Task success ratio
    snap.taskSuccessRatio = totalTasks > 0 ? successCount / totalTasks : 1;

    // Cost drift
    const budget = this.budgets.get(agentId) ?? 100;
    const totalCost = m.costs.reduce((a, b) => a + b, 0);
    const elapsed = Math.max(now - m.startedAt, 1);
    const hoursElapsed = elapsed / 3_600_000;
    const expectedCost = budget * Math.max(hoursElapsed, 0.01);
    snap.costDriftPercent = expectedCost > 0 ? (totalCost - expectedCost) / expectedCost : 0;

    // Heartbeat staleness
    const lastHb = m.heartbeats.length > 0 ? m.heartbeats[m.heartbeats.length - 1] : m.startedAt;
    snap.lastHeartbeat = new Date(lastHb).toISOString();
    snap.staleSinceMs = now - lastHb;
    snap.uptimeMs = now - m.startedAt;

    // Composite health score (weighted)
    const errorPenalty = snap.errorRate * 40;         // max 40pt penalty
    const latencyPenalty = Math.min(snap.avgLatencyMs / LATENCY_SPIKE_MS, 1) * 20; // max 20pt
    const costPenalty = Math.max(snap.costDriftPercent, 0) * 20; // max 20pt if 100%+ over
    const stalePenalty = snap.staleSinceMs > HEARTBEAT_STALE_MS ? 20 : 0;

    snap.healthScore = Math.max(0, Math.round(100 - errorPenalty - latencyPenalty - costPenalty - stalePenalty));

    // Determine status
    if (snap.staleSinceMs > HEARTBEAT_STALE_MS * 3) {
      snap.status = "unresponsive";
      this.createIncident(agentId, "heartbeat_lost", "critical", { staleSinceMs: snap.staleSinceMs });
    } else if (snap.healthScore < 20) {
      snap.status = "critical";
    } else if (snap.healthScore < 60) {
      snap.status = "degraded";
    } else {
      snap.status = "healthy";
      snap.consecutiveFailures = 0; // reset on healthy
    }

    // Auto-detect incidents
    if (snap.errorRate > ERROR_RATE_THRESHOLD && snap.status !== "restarting") {
      this.createIncident(agentId, "error_spike", "warning", { errorRate: snap.errorRate });
    }
    if (snap.avgLatencyMs > LATENCY_SPIKE_MS) {
      this.createIncident(agentId, "latency_spike", "warning", { avgLatencyMs: snap.avgLatencyMs });
    }
    if (snap.costDriftPercent > COST_DRIFT_THRESHOLD) {
      this.createIncident(agentId, "cost_overrun", "critical", {
        costDriftPercent: snap.costDriftPercent,
        totalSpent: totalCost,
        budget,
      });
    }
  }

  // ── Auto-Recovery ─────────────────────────────────────────────

  private autoRestart(agentId: string): boolean {
    const snap = this.snapshots.get(agentId);
    if (!snap) return false;

    // Rate-limit restarts
    const now = Date.now();
    const timestamps = this.restartTimestamps.get(agentId) ?? [];
    const recentRestarts = timestamps.filter(t => now - t < 3_600_000);
    if (recentRestarts.length >= MAX_RESTARTS_PER_HOUR) {
      this.autoDemote(agentId, "Max restarts exceeded — demoting");
      return false;
    }

    // Exponential backoff
    const backoff = Math.min(
      RESTART_BACKOFF_BASE_MS * Math.pow(2, snap.restartCount),
      MAX_RESTART_BACKOFF_MS
    );
    const lastRestart = snap.lastRestartAt ? new Date(snap.lastRestartAt).getTime() : 0;
    if (now - lastRestart < backoff) return false;

    snap.status = "restarting";
    snap.restartCount++;
    snap.lastRestartAt = new Date().toISOString();
    snap.consecutiveFailures = 0;
    recentRestarts.push(now);
    this.restartTimestamps.set(agentId, recentRestarts);

    // Reset metrics window
    const m = this.metrics.get(agentId);
    if (m) {
      m.errors = [];
      m.latencies = [];
      m.successes = [];
      m.failures = [];
      m.costs = [];
      m.heartbeats = [now];
      m.startedAt = now;
    }

    // After "restart" mark healthy
    snap.status = "healthy";
    snap.healthScore = 80; // start slightly below 100
    return true;
  }

  private autoDemote(agentId: string, reason: string): void {
    const snap = this.snapshots.get(agentId);
    if (!snap) return;
    snap.demotionCount++;
    snap.lastDemotionAt = new Date().toISOString();
    snap.status = "degraded";
    this.createIncident(agentId, "task_failure_streak", "critical", {
      action: "auto-demoted",
      reason,
      demotionCount: snap.demotionCount,
    });
  }

  // ── Incident Management ───────────────────────────────────────

  private createIncident(
    agentId: string,
    type: HealthIncident["type"],
    severity: HealthIncident["severity"],
    details: Record<string, unknown>
  ): HealthIncident {
    // Deduplicate: don't create if same type+agent is already open
    const existing = this.incidents.find(
      i => i.agentId === agentId && i.type === type && !i.resolvedAt
    );
    if (existing) return existing;

    const incident: HealthIncident = {
      id: `ahm-${++this.incidentCounter}`,
      agentId, type, severity,
      detectedAt: new Date().toISOString(),
      details,
    };
    this.incidents.push(incident);
    return incident;
  }

  resolveIncident(id: string): boolean {
    const inc = this.incidents.find(i => i.id === id);
    if (!inc || inc.resolvedAt) return false;
    inc.resolvedAt = new Date().toISOString();
    return true;
  }

  // ── Queries ───────────────────────────────────────────────────

  getSnapshot(agentId: string): AgentHealthSnapshot | null {
    return this.snapshots.get(agentId) ?? null;
  }

  getAllSnapshots(): AgentHealthSnapshot[] {
    return Array.from(this.snapshots.values());
  }

  getFleetHealthScore(): number {
    const snaps = this.getAllSnapshots();
    if (snaps.length === 0) return 100;
    return Math.round(snaps.reduce((s, a) => s + a.healthScore, 0) / snaps.length);
  }

  getUnhealthyAgents(): AgentHealthSnapshot[] {
    return this.getAllSnapshots().filter(s => s.status !== "healthy");
  }

  getActiveIncidents(): HealthIncident[] {
    return this.incidents.filter(i => !i.resolvedAt);
  }

  getIncidentHistory(): HealthIncident[] {
    return [...this.incidents];
  }

  getFleetSummary(): {
    totalAgents: number;
    healthy: number;
    degraded: number;
    critical: number;
    unresponsive: number;
    restarting: number;
    avgHealthScore: number;
    totalRestarts: number;
    totalDemotions: number;
    activeIncidents: number;
  } {
    const snaps = this.getAllSnapshots();
    return {
      totalAgents: snaps.length,
      healthy: snaps.filter(s => s.status === "healthy").length,
      degraded: snaps.filter(s => s.status === "degraded").length,
      critical: snaps.filter(s => s.status === "critical").length,
      unresponsive: snaps.filter(s => s.status === "unresponsive").length,
      restarting: snaps.filter(s => s.status === "restarting").length,
      avgHealthScore: this.getFleetHealthScore(),
      totalRestarts: snaps.reduce((s, a) => s + a.restartCount, 0),
      totalDemotions: snaps.reduce((s, a) => s + a.demotionCount, 0),
      activeIncidents: this.getActiveIncidents().length,
    };
  }

  // ── Internals ─────────────────────────────────────────────────

  private ensureMetrics(agentId: string): AgentMetricWindow {
    if (!this.metrics.has(agentId)) {
      this.registerAgent(agentId);
    }
    return this.metrics.get(agentId)!;
  }

  private trimWindow(m: AgentMetricWindow): void {
    if (m.errors.length > WINDOW_SIZE) m.errors.shift();
    if (m.latencies.length > WINDOW_SIZE) m.latencies.shift();
    if (m.successes.length > WINDOW_SIZE) m.successes.shift();
    if (m.failures.length > WINDOW_SIZE) m.failures.shift();
    if (m.costs.length > WINDOW_SIZE) m.costs.shift();
  }
}

export function createAgentHealthMonitor(): AgentHealthMonitorService {
  return new AgentHealthMonitorService();
}
