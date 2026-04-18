// ═══════════════════════════════════════════════════════════════
// SITA OS — Recovery Engine
// Degraded mode management, failure handling, safe defaults,
// service dependency ordering, recovery flows
// ═══════════════════════════════════════════════════════════════

import {
  type FailureMode, type FailureCategory, type DeviceSecurityPosture,
  type PostureLevel, FAILURE_MODE_REGISTRY, SERVICE_BOOT_ORDER,
} from "./types";
import { getAuditDaemon } from "./auditd";

// ── Active Degradation ──────────────────────────────────────

interface ActiveDegradation {
  failureId: string;
  category: FailureCategory;
  activeSince: number;
  recoveryAttempts: number;
  lastRecoveryAt?: number;
  resolved: boolean;
}

// ── Recovery Engine ─────────────────────────────────────────

export class RecoveryEngine {
  private activeDegradations: Map<string, ActiveDegradation> = new Map();
  private serviceStatus: Map<string, "running" | "degraded" | "failed" | "not_started"> = new Map();

  constructor() {
    for (const svc of SERVICE_BOOT_ORDER) {
      this.serviceStatus.set(svc.service, "not_started");
    }
  }

  // ── Report Failure ──────────────────────────────────────

  async reportFailure(failureId: string, context?: Record<string, unknown>): Promise<{
    action: "deny" | "degrade" | "continue";
    userMessage: string;
    recoveryHint: string;
  }> {
    const mode = FAILURE_MODE_REGISTRY.find(f => f.failureId === failureId);
    if (!mode) {
      return { action: "deny", userMessage: "An unknown error occurred.", recoveryHint: "Contact support" };
    }

    // Track degradation
    if (mode.degradedMode) {
      this.activeDegradations.set(failureId, {
        failureId, category: mode.category, activeSince: Date.now(),
        recoveryAttempts: 0, resolved: false,
      });
    }

    // Audit
    const auditd = getAuditDaemon();
    await auditd.record({
      actorUserId: "system", actorSessionId: "recovery-engine",
      action: `failure.${mode.category}`, resource: failureId,
      decision: mode.auditBehavior === "log_and_deny" ? "denied" : "allowed",
      severity: mode.severity,
      metadata: { failureName: mode.name, ...context },
    });

    const actionMap: Record<string, "deny" | "degrade" | "continue"> = {
      "log_and_deny": "deny",
      "log_and_degrade": "degrade",
      "log_and_continue": "continue",
    };

    return {
      action: actionMap[mode.auditBehavior],
      userMessage: mode.userMessage,
      recoveryHint: mode.fallbackPath,
    };
  }

  // ── Attempt Recovery ────────────────────────────────────

  async attemptRecovery(failureId: string): Promise<{ recovered: boolean; message: string }> {
    const degradation = this.activeDegradations.get(failureId);
    if (!degradation) return { recovered: false, message: "No active degradation found" };

    const mode = FAILURE_MODE_REGISTRY.find(f => f.failureId === failureId);
    if (!mode) return { recovered: false, message: "Unknown failure mode" };

    if (!mode.retryPolicy.retryable) {
      return { recovered: false, message: "This failure type is not auto-recoverable" };
    }

    if (degradation.recoveryAttempts >= mode.retryPolicy.maxRetries) {
      return { recovered: false, message: "Maximum recovery attempts reached" };
    }

    degradation.recoveryAttempts++;
    degradation.lastRecoveryAt = Date.now();

    // Simulate recovery attempt (in real OS, would re-initialize service)
    const recovered = Math.random() > 0.3; // Simulated
    if (recovered) {
      degradation.resolved = true;
      this.activeDegradations.delete(failureId);
    }

    return {
      recovered,
      message: recovered ? "Service recovered successfully" : `Recovery attempt ${degradation.recoveryAttempts}/${mode.retryPolicy.maxRetries} failed`,
    };
  }

  // ── Service Status ──────────────────────────────────────

  setServiceStatus(service: string, status: "running" | "degraded" | "failed"): void {
    this.serviceStatus.set(service, status);
  }

  getServiceStatus(): Map<string, string> {
    return new Map(this.serviceStatus);
  }

  getBootOrder() {
    return SERVICE_BOOT_ORDER.map(svc => ({
      ...svc,
      status: this.serviceStatus.get(svc.service) || "not_started",
    }));
  }

  // ── Posture Assessment ──────────────────────────────────

  assessPosture(): DeviceSecurityPosture {
    const hasDegradations = this.activeDegradations.size > 0;
    const tpmDegraded = this.activeDegradations.has("FM-004") || this.activeDegradations.has("FM-005");

    let postureLevel: PostureLevel = "hardware_backed";
    if (tpmDegraded) postureLevel = "software_protected";
    if (hasDegradations && this.activeDegradations.size > 2) postureLevel = "degraded";

    return {
      secureHwPresent: !tpmDegraded,
      secureBootEnabled: true,
      measuredBootOk: !this.activeDegradations.has("FM-004"),
      attestationSupported: !tpmDegraded,
      systemKeyringHardwareBacked: !tpmDegraded,
      userKeyringHardwareBacked: !tpmDegraded,
      deviceRootSealed: !tpmDegraded,
      hardwareRngAvailable: !tpmDegraded,
      nonExportableKeySlots: tpmDegraded ? 0 : 8,
      degradedReason: hasDegradations
        ? Array.from(this.activeDegradations.values()).map(d => d.category).join(", ")
        : undefined,
      postureLevel,
      lastVerifiedAt: Date.now(),
      pcrValues: {
        "PCR0": "a1b2c3d4e5f6",
        "PCR1": "f6e5d4c3b2a1",
        "PCR4": "1234567890ab",
        "PCR8": "abcdef012345",
        "PCR9": "567890abcdef",
        "PCR10": "0123456789ab",
      },
    };
  }

  // ── Query ───────────────────────────────────────────────

  getActiveDegradations(): ActiveDegradation[] {
    return Array.from(this.activeDegradations.values());
  }

  isHealthy(): boolean {
    return this.activeDegradations.size === 0;
  }

  getStats() {
    const services = this.getBootOrder();
    return {
      activeDegradations: this.activeDegradations.size,
      servicesRunning: services.filter(s => s.status === "running").length,
      servicesDegraded: services.filter(s => s.status === "degraded").length,
      servicesFailed: services.filter(s => s.status === "failed").length,
      overallHealthy: this.isHealthy(),
      postureLevel: this.assessPosture().postureLevel,
    };
  }
}

// ── Singleton ──────────────────────────────────────────────

let _recovery: RecoveryEngine | null = null;
export function getRecoveryEngine(): RecoveryEngine {
  if (!_recovery) _recovery = new RecoveryEngine();
  return _recovery;
}
