// ═══════════════════════════════════════════════════════════════
// AdminOperationsHub — UI catalog (Wave 9.2)
//
// Authored ops catalog: service health, queue topology, SLOs,
// runbooks, action log. Live alerts and incidents come from the
// `alerts` and `incidents` tables via useQuery hooks in the page.
// ═══════════════════════════════════════════════════════════════

export type ServiceStatus = "healthy" | "warning" | "degraded" | "critical";
export type QueuePressure = "normal" | "elevated" | "high";
export type IncidentSeverity = "high" | "medium" | "low";

export interface OpsService {
  name: string;
  status: ServiceStatus;
  latency: number;
  errorRate: number;
  uptime: number;
}

export interface OpsQueue {
  name: string;
  depth: number;
  avgWait: string;
  owner: string;
  pressure: QueuePressure;
}

export interface OpsIncident {
  id: string;
  title: string;
  severity: IncidentSeverity;
  status: string;
  startedAt: string;
  assignee: string;
}

export interface OpsActionLogEntry {
  time: string;
  actor: string;
  action: string;
  surface: string;
}

export interface OpsSLO {
  name: string;
  burnRate: number;
  target: number;
  current: number;
  unit?: string;
}

export interface OpsRunbook {
  id: string;
  name: string;
  steps: number;
  avgTime: string;
  lastUsed: string;
}

export const SERVICE_STATUS_BADGE: Record<ServiceStatus, string> = {
  healthy: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  warning: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  degraded: "text-orange-500 bg-orange-500/10 border-orange-500/20",
  critical: "text-red-500 bg-red-500/10 border-red-500/20",
};

export const QUEUE_PRESSURE_COLOR: Record<QueuePressure, string> = {
  normal: "text-emerald-500",
  elevated: "text-amber-500",
  high: "text-red-500",
};

export const SEVERITY_COLOR: Record<IncidentSeverity, string> = {
  high: "text-red-500",
  medium: "text-amber-500",
  low: "text-blue-500",
};

export const OPS_SERVICES: OpsService[] = [
  { name: "brain-core", status: "healthy", latency: 12, errorRate: 0, uptime: 99.99 },
  { name: "approval-service", status: "healthy", latency: 8, errorRate: 0, uptime: 99.98 },
  { name: "workflow-engine", status: "warning", latency: 185, errorRate: 0.2, uptime: 99.91 },
  { name: "connector-gateway", status: "degraded", latency: 450, errorRate: 1.5, uptime: 99.42 },
  { name: "event-bus", status: "healthy", latency: 3, errorRate: 0, uptime: 99.99 },
  { name: "projection-worker", status: "warning", latency: 95, errorRate: 0.1, uptime: 99.88 },
  { name: "notification-center", status: "healthy", latency: 22, errorRate: 0, uptime: 99.97 },
  { name: "receipt-service", status: "healthy", latency: 5, errorRate: 0, uptime: 100 },
];

export const OPS_QUEUES: OpsQueue[] = [
  { name: "Approval Queue", depth: 12, avgWait: "3.2m", owner: "approval-service", pressure: "normal" },
  { name: "Event Bus Consumer", depth: 2847, avgWait: "1.1s", owner: "event-bus", pressure: "normal" },
  { name: "Projection Rebuild", depth: 3, avgWait: "45s", owner: "projection-worker", pressure: "elevated" },
  { name: "Notification Dispatch", depth: 0, avgWait: "0s", owner: "notification-center", pressure: "normal" },
  { name: "Workflow Retry", depth: 7, avgWait: "12m", owner: "workflow-engine", pressure: "high" },
];

export const OPS_INCIDENT_FALLBACK: OpsIncident[] = [
  { id: "inc-1", title: "Connector Slack sync delay >15m", severity: "high", status: "investigating", startedAt: "2026-04-05T10:05:00Z", assignee: "ops-team" },
  { id: "inc-2", title: "Workflow engine p99 latency spike", severity: "medium", status: "open", startedAt: "2026-04-05T09:50:00Z", assignee: "platform-eng" },
];

export const OPS_ACTION_LOG: OpsActionLogEntry[] = [
  { time: "10:22", actor: "ops-team", action: "Acknowledged incident inc-1", surface: "IncidentCommand" },
  { time: "10:18", actor: "admin@sita.os", action: "Launched runbook: Connector Resync", surface: "RunbookLauncher" },
  { time: "10:15", actor: "system", action: "Auto-scaled projection-worker to 3 replicas", surface: "AutoScaler" },
  { time: "10:10", actor: "admin@sita.os", action: "Suppressed alert: Event bus rebalance", surface: "AlertTriage" },
  { time: "10:05", actor: "monitor-agent", action: "Detected connector lag anomaly", surface: "AnomalyDetector" },
];

export const OPS_SLOS: OpsSLO[] = [
  { name: "API availability", burnRate: 0.2, target: 99.9, current: 99.97 },
  { name: "p95 latency", burnRate: 0.6, target: 250, current: 185, unit: "ms" },
  { name: "Error budget", burnRate: 0.4, target: 0.1, current: 0.07, unit: "%" },
  { name: "Workflow completion", burnRate: 1.2, target: 99.5, current: 98.8 },
];

export const OPS_RUNBOOKS: OpsRunbook[] = [
  { id: "rb-1", name: "Connector Resync", steps: 6, avgTime: "8m", lastUsed: "10:18 today" },
  { id: "rb-2", name: "Projection Rebuild", steps: 4, avgTime: "12m", lastUsed: "yesterday" },
  { id: "rb-3", name: "Workflow Engine Restart", steps: 3, avgTime: "3m", lastUsed: "3 days ago" },
  { id: "rb-4", name: "Cache Flush — AI Digest", steps: 2, avgTime: "1m", lastUsed: "1 hour ago" },
];