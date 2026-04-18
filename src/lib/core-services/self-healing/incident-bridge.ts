// ═══════════════════════════════════════════════════════════════
// SITA OS — Self-Healing ↔ Incident Management Bridge
// Auto-declares incidents via IncidentManagementService when
// FleetHealthService detects service degradation.
// ═══════════════════════════════════════════════════════════════

import type { FleetHealthService } from "./fleet-health";
import type { SelfHealingService } from "./service";
import type { IncidentManagementService, IncidentSeverity } from "../../services/incident-management";
import type { ServiceHealthStatus, ServiceMetrics, SelfHealingIncidentSeverity, RootCauseCategory } from "./types";

// ── Severity Mapping ────────────────────────────────────────────

function healthStatusToIncidentSeverity(status: ServiceHealthStatus, healthScore: number): IncidentSeverity {
  if (status === "unhealthy" && healthScore < 20) return "critical";
  if (status === "unhealthy") return "high";
  if (status === "degraded" && healthScore < 40) return "high";
  return "medium";
}

function healthStatusToSelfHealingSeverity(status: ServiceHealthStatus, healthScore: number): SelfHealingIncidentSeverity {
  if (status === "unhealthy" && healthScore < 20) return "P0";
  if (status === "unhealthy") return "P1";
  if (status === "degraded" && healthScore < 40) return "P2";
  return "P3";
}

function inferRootCause(metrics: ServiceMetrics): RootCauseCategory {
  if (metrics.errorRate > 50) return "dependency-failure";
  if (metrics.p99LatencyMs > 5000) return "resource-exhaustion";
  if (metrics.errorRate > 20) return "connector-failure";
  if (metrics.uptimePercent < 90) return "dependency-failure";
  return "unknown";
}

// ── Deduplication ───────────────────────────────────────────────

const recentIncidents = new Map<string, number>();
const DEDUP_WINDOW_MS = 5 * 60_000; // 5 minutes

function shouldDeduplicate(serviceId: string): boolean {
  const lastDeclared = recentIncidents.get(serviceId);
  if (lastDeclared && Date.now() - lastDeclared < DEDUP_WINDOW_MS) return true;
  return false;
}

function markDeclared(serviceId: string): void {
  recentIncidents.set(serviceId, Date.now());
  // Cleanup old entries
  for (const [id, ts] of recentIncidents) {
    if (Date.now() - ts > DEDUP_WINDOW_MS * 2) recentIncidents.delete(id);
  }
}

// ── Bridge Wiring ───────────────────────────────────────────────

export interface IncidentBridgeOptions {
  fleetHealth: FleetHealthService;
  selfHealing: SelfHealingService;
  incidentManagement: IncidentManagementService;
}

/**
 * Wires FleetHealthService → IncidentManagementService + SelfHealingService.
 * When a service health check fails:
 * 1. Auto-declares an incident in IncidentManagementService
 * 2. Triggers the self-healing pipeline for auto-remediation
 * 3. Links the incident management record to the self-healing incident
 */
export function wireIncidentBridge(options: IncidentBridgeOptions): void {
  const { fleetHealth, selfHealing, incidentManagement } = options;

  fleetHealth.onHealthDegraded((serviceId, status, healthScore, metrics) => {
    // Deduplicate: don't re-declare for same service within window
    if (shouldDeduplicate(serviceId)) return;
    markDeclared(serviceId);

    const incidentSeverity = healthStatusToIncidentSeverity(status, healthScore);
    const selfHealingSeverity = healthStatusToSelfHealingSeverity(status, healthScore);
    const rootCause = inferRootCause(metrics);

    // 1. Declare in IncidentManagementService (ops-level tracking)
    const managedIncident = incidentManagement.declareIncident(
      incidentSeverity,
      `Service degradation: ${serviceId}`,
      `Service ${serviceId} entered ${status} state (healthScore=${healthScore}). ` +
      `errorRate=${metrics.errorRate}%, p99=${metrics.p99LatencyMs}ms, uptime=${metrics.uptimePercent}%`,
      {
        impactScope: status === "unhealthy" ? "service-wide" : "partial",
        affectedServices: [serviceId],
        tags: ["auto-declared", "fleet-health", rootCause],
      }
    );

    // 2. Auto-triage the managed incident
    incidentManagement.triageIncident(managedIncident.id, "self-healing-service", managedIncident.priority);

    // 3. Run self-healing pipeline (detect → classify → triage → plan → heal)
    const pipelineResult = selfHealing.runPipeline({
      title: `Auto-heal: ${serviceId} ${status}`,
      description: `Fleet health detected ${status} for ${serviceId}. Initiating auto-remediation.`,
      severity: selfHealingSeverity,
      rootCause,
      affectedServices: [serviceId],
      evidence: [{
        source: "fleet-health",
        healthScore,
        status,
        metrics,
        managedIncidentId: managedIncident.id,
        timestamp: Date.now(),
      }],
    });

    // 4. Add cross-reference to managed incident timeline
    incidentManagement.addTimelineEntry(managedIncident.id, {
      author: "self-healing-bridge",
      type: "action",
      content: pipelineResult.autoHealed
        ? `Self-healing pipeline auto-healed (incident ${pipelineResult.incident.id})`
        : `Self-healing pipeline created plan, awaiting approval (incident ${pipelineResult.incident.id})`,
      metadata: {
        selfHealingIncidentId: pipelineResult.incident.id,
        autoHealed: pipelineResult.autoHealed,
        planId: pipelineResult.plan?.id,
      },
    });
  });
}

export function createIncidentBridge(options: IncidentBridgeOptions): void {
  wireIncidentBridge(options);
}
