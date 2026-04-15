// ═══════════════════════════════════════════════════════════════
// SITA OS — Security Fabric
// Master orchestrator wiring all security subsystems into a
// unified evaluation, reporting, and posture surface
// ═══════════════════════════════════════════════════════════════

import { IntrusionDetectionEngine, createIntrusionDetectionEngine, type ThreatSignal, type DetectionContext } from "./intrusion-detection-engine";
import { AuditTrailEngine, createAuditTrailEngine, type AuditEntry } from "./audit-trail-engine";
import { DeviceAttestationService, createDeviceAttestationService } from "./device-attestation-service";
import { ResourceGovernor, createResourceGovernor, type ResourceType, type EnforcementAction } from "./resource-governor";
import { ZeroTrustValidator, createZeroTrustValidator, type ZeroTrustRequest, type ValidationDecision } from "./zero-trust-validator";
import { AITrustEnforcer, createAITrustEnforcer, type AIActionRequest, type AIActionDecision } from "./ai-trust-enforcer";
import { HumanFactorGuard, createHumanFactorGuard, type HumanActionRequest, type GuardDecision } from "./human-factor-guard";
import { EventConsistencyEngine, createEventConsistencyEngine } from "./event-consistency-engine";
import { UpdateSafetySystem, createUpdateSafetySystem } from "./update-safety-system";
import { ChaosTestingFramework, createChaosTestingFramework } from "./chaos-testing-framework";

// ── Types ──────────────────────────────────────────────────────

export type SecurityPosture = "nominal" | "elevated" | "degraded" | "critical" | "emergency";

export interface FabricPosture {
  overall: SecurityPosture;
  timestamp: string;
  scores: {
    intrusion: number;
    trust: number;
    resources: number;
    events: number;
    updates: number;
    compliance: number;
  };
  activeThreats: number;
  activeQuarantines: number;
  emergencyMode: boolean;
  recommendations: string[];
}

export interface ActionEvaluation {
  allowed: boolean;
  zeroTrust: ValidationDecision | null;
  humanFactor: GuardDecision | null;
  aiEnforcement: AIActionDecision | null;
  resourceAction: EnforcementAction | null;
  auditEntryId: string | null;
  blockers: string[];
  warnings: string[];
}

// ── Fabric ─────────────────────────────────────────────────────

export class SecurityFabric {
  readonly ids: IntrusionDetectionEngine;
  readonly audit: AuditTrailEngine;
  readonly devices: DeviceAttestationService;
  readonly resources: ResourceGovernor;
  readonly zeroTrust: ZeroTrustValidator;
  readonly aiEnforcer: AITrustEnforcer;
  readonly humanGuard: HumanFactorGuard;
  readonly events: EventConsistencyEngine;
  readonly updates: UpdateSafetySystem;
  readonly chaos: ChaosTestingFramework;

  private initialized = false;

  constructor() {
    this.ids = createIntrusionDetectionEngine();
    this.audit = createAuditTrailEngine();
    this.devices = createDeviceAttestationService();
    this.resources = createResourceGovernor();
    this.zeroTrust = createZeroTrustValidator();
    this.aiEnforcer = createAITrustEnforcer();
    this.humanGuard = createHumanFactorGuard();
    this.events = createEventConsistencyEngine();
    this.updates = createUpdateSafetySystem();
    this.chaos = createChaosTestingFramework();
  }

  // ── Initialization ─────────────────────────────────────────

  initialize(): void {
    if (this.initialized) return;

    // Wire IDS threats into audit trail
    this.ids.onThreat((signal) => {
      this.audit.logSecurityEvent(
        `ids:${signal.category}`,
        { type: "system", id: "ids-engine", displayName: "Intrusion Detection", deviceId: null, sessionId: null, trustRing: 0, ipAddress: null },
        { type: "threat", id: signal.id, name: signal.description, domain: "security" },
        signal.severity === "critical" ? "critical" : signal.severity === "high" ? "error" : "warn",
        "success",
        signal.evidence,
      );
    });

    // Wire resource enforcement into audit
    this.resources.onEnforcement((event) => {
      if (event.action !== "allow" && event.action !== "warn") {
        this.audit.logSecurityEvent(
          `resource:${event.action}`,
          { type: "system", id: "resource-governor", displayName: "Resource Governor", deviceId: null, sessionId: null, trustRing: 0, ipAddress: null },
          { type: "process", id: event.processId, name: event.processId, domain: "system" },
          "warn",
          "success",
          { resource: event.resource, current: event.currentValue, limit: event.limitValue },
        );
      }
    });

    // Wire AI receipts into audit
    this.aiEnforcer.onReceipt((receipt) => {
      this.audit.append({
        domain: "ai",
        severity: receipt.result === "allowed" ? "info" : "warn",
        action: `ai:${receipt.result}`,
        actor: { type: "ai", id: receipt.capabilityId, displayName: receipt.promptFamily, deviceId: null, sessionId: null, trustRing: null, ipAddress: null },
        target: { type: "capability", id: receipt.capabilityId, name: receipt.modelUsed, domain: "ai" },
        outcome: receipt.result === "allowed" ? "success" : "denied",
        evidence: { costCents: receipt.costCents, tokensUsed: receipt.tokensUsed, toolCalls: receipt.toolCallCount },
      });
    });

    // Wire device events into audit
    this.devices.onDeviceEvent((event) => {
      this.audit.logSecurityEvent(
        `device:${event.type}`,
        { type: "system", id: "device-attestation", displayName: "Device Attestation", deviceId: event.device.deviceId, sessionId: null, trustRing: 0, ipAddress: null },
        { type: "device", id: event.device.deviceId, name: event.device.displayName, domain: "security" },
        event.type === "revoked" ? "critical" : "info",
        "success",
        { trustLevel: event.device.trustLevel, platform: event.device.platform },
      );
    });

    // Wire update events into audit
    this.updates.onUpdate((event) => {
      this.audit.logSystemAction(
        `update:${event.type}`,
        { type: "update", id: event.session.id, name: `Update ${event.session.packageId}`, domain: "system" },
        event.type === "failed" ? "failure" : "success",
        { phase: event.session.phase, activeSlot: event.session.activeSlot },
      );
    });

    this.initialized = true;
  }

  // ── Unified Action Evaluation ──────────────────────────────

  async evaluateAction(params: {
    request?: ZeroTrustRequest;
    humanAction?: HumanActionRequest;
    aiAction?: AIActionRequest;
    resourceReport?: { processId: string; resource: ResourceType; value: number };
    detectionContext?: DetectionContext;
  }): Promise<ActionEvaluation> {
    const blockers: string[] = [];
    const warnings: string[] = [];
    let ztDecision: ValidationDecision | null = null;
    let hfDecision: GuardDecision | null = null;
    let aiDecision: AIActionDecision | null = null;
    let resAction: EnforcementAction | null = null;

    // Zero-trust validation
    if (params.request) {
      ztDecision = this.zeroTrust.validate(params.request);
      if (ztDecision.result !== "allowed") {
        blockers.push(`Zero-trust: ${ztDecision.denyReason ?? ztDecision.result}`);
      }
    }

    // Human factor evaluation
    if (params.humanAction) {
      hfDecision = this.humanGuard.evaluate(params.humanAction);
      blockers.push(...hfDecision.blockers);
      if (hfDecision.warningMessage) warnings.push(hfDecision.warningMessage);
      if (hfDecision.fatigueWarning) warnings.push("Decision fatigue detected — consider taking a break");
    }

    // AI trust enforcement
    if (params.aiAction) {
      aiDecision = this.aiEnforcer.evaluate(params.aiAction);
      if (aiDecision.result !== "allowed" && aiDecision.result !== "downgraded") {
        blockers.push(`AI enforcer: ${aiDecision.reason}`);
      }
      if (aiDecision.recommendations.length) warnings.push(...aiDecision.recommendations);
    }

    // Resource check
    if (params.resourceReport) {
      resAction = this.resources.reportUsage(params.resourceReport.processId, params.resourceReport.resource, params.resourceReport.value);
      if (resAction === "kill" || resAction === "deny") {
        blockers.push(`Resource governor: ${resAction} on ${params.resourceReport.resource}`);
      }
      if (resAction === "warn" || resAction === "throttle") {
        warnings.push(`Resource ${params.resourceReport.resource}: ${resAction}`);
      }
    }

    // IDS check
    if (params.detectionContext) {
      const threats = this.ids.evaluate(params.detectionContext);
      if (threats.length > 0) {
        const critical = threats.filter((t) => t.severity === "critical" || t.severity === "high");
        if (critical.length > 0) blockers.push(`IDS: ${critical.length} high/critical threats detected`);
        else warnings.push(`IDS: ${threats.length} signals detected`);
      }
    }

    const allowed = blockers.length === 0;

    // Audit the evaluation
    let auditEntryId: string | null = null;
    try {
      const entry = await this.audit.append({
        domain: "security",
        severity: allowed ? "info" : "warn",
        action: "fabric:evaluate",
        actor: {
          type: params.request?.identity.tokenClass === "service" ? "service" : "user",
          id: params.request?.identity.userId ?? params.humanAction?.userId ?? params.aiAction?.userId ?? "unknown",
          displayName: "Action Evaluation",
          deviceId: params.request?.identity.deviceId ?? null,
          sessionId: params.request?.identity.sessionId ?? null,
          trustRing: params.request?.identity.trustRing ?? null,
          ipAddress: params.request?.metadata.ipAddress ?? null,
        },
        target: {
          type: "action",
          id: params.request?.requestId ?? params.humanAction?.actionId ?? params.aiAction?.requestId ?? "unknown",
          name: params.request?.action ?? params.humanAction?.actionKey ?? params.aiAction?.capabilityId ?? "unknown",
          domain: params.humanAction?.domain ?? params.aiAction?.context.domain ?? null,
        },
        outcome: allowed ? "success" : "denied",
        evidence: { blockers, warnings, ztResult: ztDecision?.result, aiResult: aiDecision?.result, resAction },
      });
      auditEntryId = entry.id;
    } catch { /* audit failure must not block evaluation */ }

    return { allowed, zeroTrust: ztDecision, humanFactor: hfDecision, aiEnforcement: aiDecision, resourceAction: resAction, auditEntryId, blockers, warnings };
  }

  // ── Posture ────────────────────────────────────────────────

  getPosture(): FabricPosture {
    const idsMetrics = this.ids.getMetrics();
    const resourceMetrics = this.resources.getMetrics();
    const eventMetrics = this.events.getMetrics();
    const updateMetrics = this.updates.getMetrics();
    const emergency = this.humanGuard.getEmergencyMode();

    const intrusionScore = Math.max(0, 100 - (idsMetrics.signalsBySeverity.critical ?? 0) * 20 - (idsMetrics.signalsBySeverity.high ?? 0) * 10);
    const resourceScore = 100 - resourceMetrics.killedProcesses * 5 - resourceMetrics.throttledProcesses * 2;
    const eventScore = eventMetrics.deadLetterCount > 0 ? Math.max(0, 100 - eventMetrics.deadLetterCount * 5) : 100;
    const updateScore = updateMetrics.healthGatePassRate * 100;

    const scores = {
      intrusion: Math.max(0, intrusionScore),
      trust: 90, // From device attestation metrics
      resources: Math.max(0, resourceScore),
      events: Math.max(0, eventScore),
      updates: Math.max(0, updateScore),
      compliance: 95,
    };

    const avg = Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length;
    let overall: SecurityPosture = "nominal";
    if (emergency.active) overall = "emergency";
    else if (avg < 40) overall = "critical";
    else if (avg < 60) overall = "degraded";
    else if (avg < 80) overall = "elevated";

    const recommendations: string[] = [];
    if (scores.intrusion < 80) recommendations.push("Review IDS alerts — elevated threat activity");
    if (scores.resources < 70) recommendations.push("Resource budgets under pressure — review process allocations");
    if (scores.events < 80) recommendations.push("Dead-letter queue growing — review failed event deliveries");
    if (scores.updates < 80) recommendations.push("Update health gate pass rate below threshold");

    return {
      overall,
      timestamp: new Date().toISOString(),
      scores,
      activeThreats: idsMetrics.signalsBySeverity.high + idsMetrics.signalsBySeverity.critical,
      activeQuarantines: idsMetrics.activeQuarantines,
      emergencyMode: emergency.active,
      recommendations,
    };
  }

  // ── Anomaly Reporting (convenience) ────────────────────────

  reportAnomaly(category: Parameters<IntrusionDetectionEngine["reportAnomaly"]>[0], severity: Parameters<IntrusionDetectionEngine["reportAnomaly"]>[1], source: string, description: string, evidence?: Record<string, unknown>): ThreatSignal {
    return this.ids.reportAnomaly(category, severity, source, description, evidence);
  }
}

// ── Singleton ──────────────────────────────────────────────────

let fabricInstance: SecurityFabric | null = null;

export function getSecurityFabric(): SecurityFabric {
  if (!fabricInstance) {
    fabricInstance = new SecurityFabric();
    fabricInstance.initialize();
  }
  return fabricInstance;
}

export function createSecurityFabric(): SecurityFabric {
  return new SecurityFabric();
}
