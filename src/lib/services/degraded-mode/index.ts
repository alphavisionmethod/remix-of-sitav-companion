// ═══════════════════════════════════════════════════════════════
// SITA OS — Degraded Mode Architecture
// Service health graph, graceful degradation FSM, feature
// availability calculator, user notification engine.
// ═══════════════════════════════════════════════════════════════

export type SystemOperatingMode = "full" | "degraded" | "minimal" | "emergency";

export type ServiceHealthStatus = "healthy" | "degraded" | "down" | "unknown";

export interface ServiceHealthNode {
  service_id: string;
  display_name: string;
  status: ServiceHealthStatus;
  dependencies: string[];
  last_check_at: string;
  error_rate_percent: number;
  latency_p99_ms: number;
}

export interface DegradedFeature {
  feature_id: string;
  display_name: string;
  available: boolean;
  degraded: boolean;
  reason?: string;
  fallback_behavior?: string;
  dependent_services: string[];
}

export interface DegradationNotification {
  id: string;
  mode: SystemOperatingMode;
  affected_features: string[];
  user_message: string;
  technical_detail: string;
  started_at: string;
  estimated_recovery_at?: string;
}

const MODE_TRANSITIONS: Record<SystemOperatingMode, SystemOperatingMode[]> = {
  full: ["degraded"],
  degraded: ["full", "minimal"],
  minimal: ["degraded", "emergency"],
  emergency: ["minimal"],
};

export class DegradedModeService {
  private services: Map<string, ServiceHealthNode> = new Map();
  private currentMode: SystemOperatingMode = "full";
  private featureMap: Map<string, DegradedFeature> = new Map();

  registerService(node: ServiceHealthNode): void {
    this.services.set(node.service_id, node);
  }

  registerFeature(feature: DegradedFeature): void {
    this.featureMap.set(feature.feature_id, feature);
  }

  updateServiceHealth(serviceId: string, status: ServiceHealthStatus, metrics?: { error_rate: number; latency_p99: number }): void {
    const svc = this.services.get(serviceId);
    if (!svc) return;
    svc.status = status;
    svc.last_check_at = new Date().toISOString();
    if (metrics) {
      svc.error_rate_percent = metrics.error_rate;
      svc.latency_p99_ms = metrics.latency_p99;
    }
    this.recalculateMode();
  }

  private recalculateMode(): void {
    const statuses = Array.from(this.services.values()).map(s => s.status);
    const downCount = statuses.filter(s => s === "down").length;
    const degradedCount = statuses.filter(s => s === "degraded").length;
    const total = statuses.length;

    let targetMode: SystemOperatingMode = "full";
    if (downCount > total * 0.5) targetMode = "emergency";
    else if (downCount > 0 || degradedCount > total * 0.3) targetMode = "minimal";
    else if (degradedCount > 0) targetMode = "degraded";

    if (targetMode !== this.currentMode && MODE_TRANSITIONS[this.currentMode]?.includes(targetMode)) {
      this.currentMode = targetMode;
    }
  }

  getFeatureAvailability(): DegradedFeature[] {
    return Array.from(this.featureMap.values()).map(feature => {
      const depStatuses = feature.dependent_services.map(id => this.services.get(id)?.status ?? "unknown");
      const anyDown = depStatuses.includes("down");
      const anyDegraded = depStatuses.includes("degraded");

      return {
        ...feature,
        available: !anyDown,
        degraded: anyDegraded,
        reason: anyDown ? "Required service unavailable" : anyDegraded ? "Dependent service degraded" : undefined,
      };
    });
  }

  getCurrentMode(): SystemOperatingMode { return this.currentMode; }

  getHealthSummary(): { mode: SystemOperatingMode; services: ServiceHealthNode[]; features: DegradedFeature[] } {
    return {
      mode: this.currentMode,
      services: Array.from(this.services.values()),
      features: this.getFeatureAvailability(),
    };
  }

  generateNotification(): DegradationNotification | null {
    if (this.currentMode === "full") return null;
    const affected = this.getFeatureAvailability().filter(f => !f.available || f.degraded);
    const messages: Record<SystemOperatingMode, string> = {
      full: "",
      degraded: "Some features may be slower than usual. We're working on it.",
      minimal: "Several features are temporarily unavailable. Core functionality remains active.",
      emergency: "System is operating in emergency mode. Only essential features are available.",
    };
    return {
      id: crypto.randomUUID(),
      mode: this.currentMode,
      affected_features: affected.map(f => f.feature_id),
      user_message: messages[this.currentMode],
      technical_detail: `${affected.length} features affected across ${this.services.size} services`,
      started_at: new Date().toISOString(),
    };
  }
}

export const degradedModeService = new DegradedModeService();
