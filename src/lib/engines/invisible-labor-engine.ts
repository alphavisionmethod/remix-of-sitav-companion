// ═══════════════════════════════════════════════════════════════
// SITA OS — Invisible Labor Equalization Engine
// Detects disproportionate invisible burden across households,
// teams, and principal/operator structures. Privacy-first,
// consent-gated, non-judgmental, and actionable.
// ═══════════════════════════════════════════════════════════════

import type {
  InvisibleLaborEvent, InvisibleLaborType, LaborBurdenScore,
  LaborEqualizationSuggestion, LaborTrackingConsent,
  DebtEvidence, GovernanceBoardroomSection,
} from "../types/meta-governance.types";
import type { OSDomain } from "../types/os-unified.types";

const LABOR_TYPE_LABELS: Record<InvisibleLaborType, string> = {
  reminder_origination: "Creating reminders",
  follow_up: "Following up",
  scheduling: "Scheduling & calendar management",
  planning: "Planning & preparation",
  coordination: "Coordinating across people",
  tracking: "Tracking tasks & progress",
  preparation: "Preparing materials & context",
  anticipation: "Anticipating needs",
};

export class InvisibleLaborEngine {
  private events: InvisibleLaborEvent[] = [];
  private consents: Map<string, LaborTrackingConsent> = new Map();
  private maxEvents = 10000;

  // ── Consent Management ──────────────────────────────────────

  /** Grant consent for labor tracking in a household/org */
  grantConsent(consent: Omit<LaborTrackingConsent, "id" | "revoked" | "revokedAt" | "revokedBy" | "auditTrail">): LaborTrackingConsent {
    const record: LaborTrackingConsent = {
      ...consent,
      id: `lc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      revoked: false,
      auditTrail: [{ timestamp: new Date().toISOString(), action: "consent_granted", by: consent.enabledBy }],
    };
    this.consents.set(record.id, record);
    return record;
  }

  /** Revoke consent */
  revokeConsent(consentId: string, revokedBy: string): boolean {
    const consent = this.consents.get(consentId);
    if (!consent) return false;
    consent.revoked = true;
    consent.revokedAt = new Date().toISOString();
    consent.revokedBy = revokedBy;
    consent.auditTrail.push({ timestamp: consent.revokedAt, action: "consent_revoked", by: revokedBy });
    return true;
  }

  /** Check if tracking is consented for a household */
  hasConsent(householdId: string, laborType?: InvisibleLaborType): boolean {
    return Array.from(this.consents.values()).some(c =>
      c.householdId === householdId && !c.revoked &&
      (!laborType || c.scope.includes(laborType))
    );
  }

  // ── Event Recording ─────────────────────────────────────────

  /** Record an invisible labor event (consent-gated) */
  recordEvent(input: {
    laborType: InvisibleLaborType;
    originatorId: string;
    targetEntityId?: string;
    householdId?: string;
    orgId?: string;
    domain: OSDomain;
    evidence: DebtEvidence[];
    correlationId?: string;
  }): InvisibleLaborEvent | null {
    // Consent gate
    const contextId = input.householdId ?? input.orgId;
    if (contextId && !this.hasConsent(contextId, input.laborType)) return null;

    const event: InvisibleLaborEvent = {
      id: `il_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      ...input,
      concentrationScore: 0, // Computed during analysis
      timestamp: new Date().toISOString(),
    };
    this.events.push(event);
    if (this.events.length > this.maxEvents) this.events = this.events.slice(-this.maxEvents);
    return event;
  }

  // ── Analysis ────────────────────────────────────────────────

  /** Compute burden distribution for a household/org */
  computeBurdenDistribution(contextId: string, contextType: "household" | "org"): LaborBurdenScore[] {
    const relevant = this.events.filter(e =>
      contextType === "household" ? e.householdId === contextId : e.orgId === contextId
    );
    if (relevant.length === 0) return [];

    const byEntity = new Map<string, { count: number; byType: Record<InvisibleLaborType, number> }>();
    for (const event of relevant) {
      const existing = byEntity.get(event.originatorId) ?? {
        count: 0,
        byType: Object.fromEntries(
          (["reminder_origination", "follow_up", "scheduling", "planning", "coordination", "tracking", "preparation", "anticipation"] as InvisibleLaborType[])
            .map(t => [t, 0])
        ) as Record<InvisibleLaborType, number>,
      };
      existing.count++;
      existing.byType[event.laborType]++;
      byEntity.set(event.originatorId, existing);
    }

    const totalEvents = relevant.length;
    const scores: LaborBurdenScore[] = Array.from(byEntity.entries()).map(([entityId, data]) => ({
      entityId,
      entityName: entityId, // Would be resolved from EntityRoleGraph in service layer
      totalBurden: data.count,
      byType: data.byType,
      trend: "stable" as const,
      percentOfTotal: (data.count / totalEvents) * 100,
    }));

    // Compute concentration scores on events
    for (const event of relevant) {
      const entityScore = scores.find(s => s.entityId === event.originatorId);
      if (entityScore) event.concentrationScore = entityScore.percentOfTotal / 100;
    }

    return scores.sort((a, b) => b.totalBurden - a.totalBurden);
  }

  /** Generate equalization suggestions */
  getEqualizationSuggestions(contextId: string, contextType: "household" | "org"): LaborEqualizationSuggestion[] {
    const distribution = this.computeBurdenDistribution(contextId, contextType);
    if (distribution.length < 2) return [];

    const suggestions: LaborEqualizationSuggestion[] = [];
    const avgBurden = distribution.reduce((s, d) => s + d.percentOfTotal, 0) / distribution.length;
    const overloaded = distribution.filter(d => d.percentOfTotal > avgBurden * 1.5);
    const underloaded = distribution.filter(d => d.percentOfTotal < avgBurden * 0.7);

    for (const heavy of overloaded) {
      const heaviestType = Object.entries(heavy.byType)
        .sort(([, a], [, b]) => b - a)[0];

      if (!heaviestType) continue;

      const laborType = heaviestType[0] as InvisibleLaborType;
      const lightTarget = underloaded[0];

      suggestions.push({
        id: `eq_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        description: `${LABOR_TYPE_LABELS[laborType]} is concentrated with one person`,
        fromEntityId: heavy.entityId,
        toEntityId: lightTarget?.entityId,
        laborType,
        estimatedReduction: heavy.percentOfTotal - avgBurden,
        effort: heaviestType[1] > 10 ? "medium" : "low",
        respectfulExplanation: `${LABOR_TYPE_LABELS[laborType]} tasks appear to fall disproportionately on one person (${heavy.percentOfTotal.toFixed(0)}% of total). Sharing this could help balance the load and reduce mental burden.`,
      });
    }

    return suggestions;
  }

  /** Boardroom section */
  getBoardroomSection(contextId: string, contextType: "household" | "org"): GovernanceBoardroomSection {
    const dist = this.computeBurdenDistribution(contextId, contextType);
    const maxConcentration = dist.length > 0 ? Math.max(...dist.map(d => d.percentOfTotal)) : 0;
    const suggestions = this.getEqualizationSuggestions(contextId, contextType);

    return {
      systemId: "invisible-labor",
      title: "Invisible Labor Balance",
      severity: maxConcentration > 70 ? "warning" : "info",
      summary: dist.length === 0
        ? "No invisible labor data tracked yet (requires consent)."
        : `Highest burden concentration: ${maxConcentration.toFixed(0)}% on one person. ${suggestions.length} equalization suggestions.`,
      metrics: dist.slice(0, 3).map(d => ({
        label: d.entityName,
        value: `${d.percentOfTotal.toFixed(0)}%`,
        trend: d.trend,
      })),
      actionItems: suggestions.slice(0, 2).map(s => ({
        description: s.respectfulExplanation.slice(0, 120),
        priority: "medium" as const,
      })),
      drilldownRoute: "/settings",
    };
  }
}
