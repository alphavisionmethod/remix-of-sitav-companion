// ═══════════════════════════════════════════════════════════════
// SITA OS — Self-Healing Service
// Core healing engine: detect → classify → triage → plan → heal → verify → close
// ═══════════════════════════════════════════════════════════════

import type {
  Incident, IncidentSeverity, IncidentState, RootCauseCategory,
  HealingCapability, HealingAction, HealingPlan, CircuitBreakerState,
  DiagnosticBundle, EscalationRule, IncidentTimelineEntry,
} from "./types";
import {
  ESCALATION_RULES, ROOT_CAUSE_HEALING_MAP, AUTO_ALLOWED_ACTIONS,
  HEALING_CAPABILITY_MAP,
} from "./types";
import type { EventBus } from "../event-bus";
import type { ReceiptService } from "../receipt-service";

// ── Constants ───────────────────────────────────────────────────

const MAX_HEAL_ATTEMPTS = 3;
const COOLDOWN_MS = 30_000;
const CIRCUIT_WINDOW_MS = 30 * 60_000; // 30 minutes

// ── Self-Healing Service ────────────────────────────────────────

export class SelfHealingService {
  private incidents = new Map<string, Incident>();
  private circuitBreakers = new Map<string, CircuitBreakerState>();
  private eventBus?: EventBus;
  private receiptService?: ReceiptService;

  constructor(options?: { eventBus?: EventBus; receiptService?: ReceiptService }) {
    this.eventBus = options?.eventBus;
    this.receiptService = options?.receiptService;
  }

  // ── Detection ───────────────────────────────────────────────

  detect(signal: {
    title: string;
    description: string;
    severity: IncidentSeverity;
    rootCause: RootCauseCategory;
    affectedServices: string[];
    affectedEntities?: string[];
    evidence?: Record<string, unknown>[];
  }): Incident {
    const id = crypto.randomUUID();
    const correlationId = crypto.randomUUID();
    const now = Date.now();

    const incident: Incident = {
      id,
      correlationId,
      title: signal.title,
      description: signal.description,
      severity: signal.severity,
      state: "detected",
      rootCause: signal.rootCause,
      affectedServices: signal.affectedServices,
      affectedEntities: signal.affectedEntities ?? [],
      healAttempts: 0,
      maxHealAttempts: MAX_HEAL_ATTEMPTS,
      timeline: [{
        timestamp: now,
        state: "detected",
        message: `Incident detected: ${signal.title}`,
        actor: "self-healing-service",
        data: { severity: signal.severity, rootCause: signal.rootCause },
      }],
      evidence: signal.evidence ?? [],
      createdAt: now,
      updatedAt: now,
    };

    this.incidents.set(id, incident);
    this.emitEvent("self-healing.detected", { incidentId: id, severity: signal.severity, rootCause: signal.rootCause }, correlationId);
    return incident;
  }

  // ── Classification ──────────────────────────────────────────

  classify(incidentId: string): Incident | null {
    const incident = this.incidents.get(incidentId);
    if (!incident) return null;

    const updated = this.transition(incident, "classified", `Root cause classified as ${incident.rootCause}`);
    this.emitEvent("self-healing.classified", { incidentId, rootCause: incident.rootCause }, incident.correlationId);
    return updated;
  }

  // ── Triage ──────────────────────────────────────────────────

  triage(incidentId: string): { incident: Incident; escalationRule: EscalationRule } | null {
    const incident = this.incidents.get(incidentId);
    if (!incident) return null;

    const rule = this.getEscalationRule(incident.severity);
    const updated = this.transition(incident, "triaging",
      `Severity ${incident.severity}: autoHeal=${rule.autoHeal}, autonomy=${rule.autonomyLevel}`
    );

    this.emitEvent("self-healing.triaged", {
      incidentId,
      severity: incident.severity,
      autoHeal: rule.autoHeal,
      escalationTarget: rule.escalationTarget,
    }, incident.correlationId);

    return { incident: updated, escalationRule: rule };
  }

  // ── Planning ────────────────────────────────────────────────

  plan(incidentId: string): HealingPlan | null {
    const incident = this.incidents.get(incidentId);
    if (!incident) return null;

    const rule = this.getEscalationRule(incident.severity);
    const capabilities = ROOT_CAUSE_HEALING_MAP[incident.rootCause] ?? ["circuit-breaker"];

    const actions: HealingAction[] = capabilities.map((cap, i) => {
      const mapping = HEALING_CAPABILITY_MAP.find(m => m.capability === cap);
      return {
        id: `${incidentId}-action-${i}`,
        capability: cap,
        targetService: incident.affectedServices[0] ?? "unknown",
        description: `Apply ${cap} to ${incident.affectedServices[0] ?? "unknown"}`,
        autonomyRequired: mapping?.autonomyLevel ?? "L3",
        reversible: !["rollback"].includes(cap),
        simulationRequired: !AUTO_ALLOWED_ACTIONS.includes(cap),
        status: "planned" as const,
      };
    });

    const healingPlan: HealingPlan = {
      id: crypto.randomUUID(),
      incidentId,
      actions,
      strategy: actions.length > 1 ? "sequential" : "single",
      approvalRequired: rule.requiresHumanApproval || rule.requiresCouncilQuorum,
      approvalSource: rule.requiresHumanApproval ? "human" : rule.requiresCouncilQuorum ? "council" : "auto",
      confidence: this.calculatePlanConfidence(incident.rootCause, capabilities),
      createdAt: Date.now(),
    };

    const updated: Incident = {
      ...incident,
      state: "planning",
      healingPlan: healingPlan,
      timeline: [...incident.timeline, {
        timestamp: Date.now(),
        state: "planning",
        message: `Healing plan created with ${actions.length} action(s): ${capabilities.join(", ")}`,
        actor: "self-healing-service",
        data: { planId: healingPlan.id, capabilities },
      }],
      updatedAt: Date.now(),
    };
    this.incidents.set(incidentId, updated);

    this.emitEvent("self-healing.planned", {
      incidentId,
      planId: healingPlan.id,
      actionCount: actions.length,
      capabilities,
    }, incident.correlationId);

    return healingPlan;
  }

  // ── Healing Execution ───────────────────────────────────────

  heal(incidentId: string): Incident | null {
    const incident = this.incidents.get(incidentId);
    if (!incident || !incident.healingPlan) return null;

    // Check circuit breaker
    const cbKey = `${incident.affectedServices[0] ?? "unknown"}:${incidentId}`;
    const cb = this.getOrCreateCircuitBreaker(cbKey, incidentId, incident.affectedServices[0] ?? "unknown");

    if (cb.state === "open") {
      const elapsed = Date.now() - (cb.openedAt ?? cb.lastAttemptAt);
      if (elapsed < CIRCUIT_WINDOW_MS) {
        // Circuit is open, escalate
        return this.escalate(incidentId, "Circuit breaker open — max attempts exhausted");
      }
      // Window expired, reset to half-open
      this.circuitBreakers.set(cbKey, { ...cb, state: "half-open" });
    }

    // Check cooldown
    if (cb.lastAttemptAt > 0 && Date.now() - cb.lastAttemptAt < COOLDOWN_MS) {
      return incident; // Still in cooldown, return current state
    }

    // Check max attempts
    if (incident.healAttempts >= MAX_HEAL_ATTEMPTS) {
      this.circuitBreakers.set(cbKey, { ...cb, state: "open", openedAt: Date.now() });
      return this.escalate(incidentId, `Max ${MAX_HEAL_ATTEMPTS} heal attempts exhausted`);
    }

    // Execute healing
    const newAttempts = incident.healAttempts + 1;
    const updated: Incident = {
      ...incident,
      state: "healing",
      healAttempts: newAttempts,
      timeline: [...incident.timeline, {
        timestamp: Date.now(),
        state: "healing",
        message: `Healing attempt ${newAttempts}/${MAX_HEAL_ATTEMPTS}`,
        actor: "self-healing-service",
        data: { attempt: newAttempts },
      }],
      updatedAt: Date.now(),
    };
    this.incidents.set(incidentId, updated);

    // Update circuit breaker
    this.circuitBreakers.set(cbKey, {
      ...cb,
      attempts: cb.attempts + 1,
      lastAttemptAt: Date.now(),
    });

    this.emitEvent("self-healing.healing", {
      incidentId,
      attempt: newAttempts,
      maxAttempts: MAX_HEAL_ATTEMPTS,
    }, incident.correlationId);

    // Generate receipt for the healing action
    this.generateReceipt(incident.correlationId, "execution-summary", {
      type: "self-healing",
      incidentId,
      attempt: newAttempts,
      actions: incident.healingPlan.actions.map(a => a.capability),
    });

    return updated;
  }

  // ── Verification ────────────────────────────────────────────

  verify(incidentId: string, healthCheckPassed: boolean): Incident | null {
    const incident = this.incidents.get(incidentId);
    if (!incident) return null;

    if (healthCheckPassed) {
      const resolved = this.transition(incident, "verifying", "Post-heal health check passed");
      return this.resolve(incidentId, "Health check verified recovery");
    }

    // Health check failed
    const updated = this.transition(incident, "verifying", "Post-heal health check FAILED — will retry or escalate");
    this.emitEvent("self-healing.verify-failed", { incidentId }, incident.correlationId);

    // Try healing again if attempts remain
    if (incident.healAttempts < MAX_HEAL_ATTEMPTS) {
      return updated;
    }

    return this.escalate(incidentId, "Health check failed after all heal attempts");
  }

  // ── Resolution ──────────────────────────────────────────────

  resolve(incidentId: string, reason: string): Incident | null {
    const incident = this.incidents.get(incidentId);
    if (!incident) return null;

    const resolved: Incident = {
      ...incident,
      state: "resolved",
      resolvedAt: Date.now(),
      timeline: [...incident.timeline, {
        timestamp: Date.now(),
        state: "resolved",
        message: reason,
        actor: "self-healing-service",
      }],
      updatedAt: Date.now(),
    };
    this.incidents.set(incidentId, resolved);

    this.emitEvent("self-healing.resolved", { incidentId, reason }, incident.correlationId);
    this.generateReceipt(incident.correlationId, "execution-summary", {
      type: "self-healing-resolved",
      incidentId,
      healAttempts: incident.healAttempts,
      resolution: reason,
    });

    return resolved;
  }

  // ── Escalation ──────────────────────────────────────────────

  escalate(incidentId: string, reason: string): Incident | null {
    const incident = this.incidents.get(incidentId);
    if (!incident) return null;

    const rule = this.getEscalationRule(incident.severity);
    const escalated: Incident = {
      ...incident,
      state: "escalated",
      escalatedTo: rule.escalationTarget || "sup-reliability",
      timeline: [...incident.timeline, {
        timestamp: Date.now(),
        state: "escalated",
        message: `Escalated: ${reason}`,
        actor: "self-healing-service",
        data: { escalationTarget: rule.escalationTarget },
      }],
      updatedAt: Date.now(),
    };
    this.incidents.set(incidentId, escalated);

    this.emitEvent("self-healing.escalated", {
      incidentId,
      reason,
      escalationTarget: rule.escalationTarget,
      severity: incident.severity,
    }, incident.correlationId);

    return escalated;
  }

  // ── Diagnostic Bundle Generation ────────────────────────────

  generateDiagnosticBundle(incidentId: string): DiagnosticBundle | null {
    const incident = this.incidents.get(incidentId);
    if (!incident) return null;

    const bundle: DiagnosticBundle = {
      id: crypto.randomUUID(),
      incidentId,
      correlationId: incident.correlationId,
      classification: incident.rootCause,
      timestamps: {
        detected: incident.createdAt,
        classified: incident.timeline.find(t => t.state === "classified")?.timestamp ?? incident.createdAt,
        bundleGenerated: Date.now(),
      },
      evidence: incident.evidence,
      affectedServices: incident.affectedServices,
      affectedEntities: incident.affectedEntities,
      probableCause: `${incident.rootCause}: ${incident.description}`,
      recommendedActions: (ROOT_CAUSE_HEALING_MAP[incident.rootCause] ?? []).map(c => `Apply ${c}`),
      confidenceLevel: this.calculatePlanConfidence(incident.rootCause, ROOT_CAUSE_HEALING_MAP[incident.rootCause] ?? []),
      supportReadable: true,
    };

    // Update incident with bundle reference
    const updated: Incident = {
      ...incident,
      diagnosticBundleId: bundle.id,
      updatedAt: Date.now(),
    };
    this.incidents.set(incidentId, updated);

    return bundle;
  }

  // ── Full Pipeline ───────────────────────────────────────────

  runPipeline(signal: {
    title: string;
    description: string;
    severity: IncidentSeverity;
    rootCause: RootCauseCategory;
    affectedServices: string[];
    evidence?: Record<string, unknown>[];
  }): { incident: Incident; plan: HealingPlan | null; autoHealed: boolean } {
    // 1. Detect
    const incident = this.detect(signal);

    // 2. Classify
    this.classify(incident.id);

    // 3. Triage
    const triageResult = this.triage(incident.id);
    if (!triageResult) return { incident, plan: null, autoHealed: false };

    const { escalationRule } = triageResult;

    // 4. P4 = log only
    if (signal.severity === "P4") {
      return { incident: this.getIncident(incident.id)!, plan: null, autoHealed: false };
    }

    // 5. Plan
    const plan = this.plan(incident.id);

    // 6. P3 = draft only, needs approval
    if (signal.severity === "P3") {
      return { incident: this.getIncident(incident.id)!, plan, autoHealed: false };
    }

    // 7. Auto-heal for P0-P2
    if (escalationRule.autoHeal) {
      this.heal(incident.id);
      return { incident: this.getIncident(incident.id)!, plan, autoHealed: true };
    }

    return { incident: this.getIncident(incident.id)!, plan, autoHealed: false };
  }

  // ── Queries ─────────────────────────────────────────────────

  getIncident(id: string): Incident | null {
    return this.incidents.get(id) ?? null;
  }

  getAllIncidents(): Incident[] {
    return Array.from(this.incidents.values());
  }

  getIncidentsByState(state: IncidentState): Incident[] {
    return Array.from(this.incidents.values()).filter(i => i.state === state);
  }

  getIncidentsBySeverity(severity: IncidentSeverity): Incident[] {
    return Array.from(this.incidents.values()).filter(i => i.severity === severity);
  }

  getActiveIncidents(): Incident[] {
    return Array.from(this.incidents.values()).filter(i =>
      i.state !== "resolved" && i.state !== "escalated"
    );
  }

  getCircuitBreakerStates(): CircuitBreakerState[] {
    return Array.from(this.circuitBreakers.values());
  }

  getStats(): {
    total: number; active: number; resolved: number; escalated: number;
    bySeverity: Record<IncidentSeverity, number>;
    byState: Record<IncidentState, number>;
  } {
    const incidents = Array.from(this.incidents.values());
    const bySeverity = { P0: 0, P1: 0, P2: 0, P3: 0, P4: 0 };
    const byState: Record<IncidentState, number> = {
      detected: 0, classified: 0, triaging: 0, planning: 0,
      healing: 0, verifying: 0, resolved: 0, escalated: 0,
    };
    for (const i of incidents) {
      bySeverity[i.severity]++;
      byState[i.state]++;
    }
    return {
      total: incidents.length,
      active: incidents.filter(i => i.state !== "resolved" && i.state !== "escalated").length,
      resolved: incidents.filter(i => i.state === "resolved").length,
      escalated: incidents.filter(i => i.state === "escalated").length,
      bySeverity,
      byState,
    };
  }

  // ── Private ─────────────────────────────────────────────────

  private transition(incident: Incident, newState: IncidentState, message: string): Incident {
    const entry: IncidentTimelineEntry = {
      timestamp: Date.now(),
      state: newState,
      message,
      actor: "self-healing-service",
    };
    const updated: Incident = {
      ...incident,
      state: newState,
      timeline: [...incident.timeline, entry],
      updatedAt: Date.now(),
    };
    this.incidents.set(incident.id, updated);
    return updated;
  }

  private getEscalationRule(severity: IncidentSeverity): EscalationRule {
    return ESCALATION_RULES.find(r => r.severity === severity) ?? ESCALATION_RULES[ESCALATION_RULES.length - 1];
  }

  private calculatePlanConfidence(rootCause: RootCauseCategory, capabilities: HealingCapability[]): number {
    if (capabilities.length === 0) return 0.1;
    const knownPatterns: RootCauseCategory[] = [
      "connector-failure", "workflow-stuck", "cache-failure", "queue-pressure",
      "rate-limiting", "model-routing",
    ];
    const base = knownPatterns.includes(rootCause) ? 0.85 : 0.5;
    return Math.min(1, base + capabilities.length * 0.03);
  }

  private getOrCreateCircuitBreaker(key: string, incidentId: string, serviceId: string): CircuitBreakerState {
    if (!this.circuitBreakers.has(key)) {
      this.circuitBreakers.set(key, {
        serviceId,
        incidentId,
        attempts: 0,
        maxAttempts: MAX_HEAL_ATTEMPTS,
        lastAttemptAt: 0,
        cooldownMs: COOLDOWN_MS,
        windowResetMs: CIRCUIT_WINDOW_MS,
        state: "closed",
      });
    }
    return this.circuitBreakers.get(key)!;
  }

  private emitEvent(topic: string, payload: Record<string, unknown>, correlationId: string): void {
    this.eventBus?.publish(topic, payload, { source: "self-healing-service", correlationId });
  }

  private generateReceipt(correlationId: string, type: "execution-summary" | "refusal", data: Record<string, unknown>): void {
    this.receiptService?.createReceipt(correlationId, type, data);
  }
}

// ── Factory ─────────────────────────────────────────────────────

export function createSelfHealingService(options?: {
  eventBus?: EventBus;
  receiptService?: ReceiptService;
}): SelfHealingService {
  return new SelfHealingService(options);
}
