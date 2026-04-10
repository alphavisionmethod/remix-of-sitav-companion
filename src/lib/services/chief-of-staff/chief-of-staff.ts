// ═══════════════════════════════════════════════════════════════
// SITA OS — Personal Chief-of-Staff Layer
// Coordinated role personas acting as one support team
// ═══════════════════════════════════════════════════════════════

import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
import type { DomainId } from "@/packages/contracts/_contract-scaffold";

// ── Types ────────────────────────────────────────────────────────

export type StaffRole =
  | "chief_of_staff" | "executive_assistant" | "operator"
  | "strategist" | "money_sentinel" | "wellness_sentinel"
  | "relationship_sentinel";

export type InterventionUrgency = "proactive" | "timely" | "urgent" | "critical";

export interface StaffPersona {
  role: StaffRole;
  displayName: string;
  scope: DomainId[];
  tone: "formal" | "warm" | "direct" | "calm";
  triggerConditions: TriggerCondition[];
  proactiveBehaviors: ProactiveBehavior[];
  escalationRules: EscalationRule[];
  active: boolean;
  priority: number;             // higher = speaks first when multiple trigger
}

export interface TriggerCondition {
  id: string;
  type: "threshold" | "pattern" | "schedule" | "event" | "absence";
  parameter: string;
  value: unknown;
  description: string;
}

export interface ProactiveBehavior {
  id: string;
  trigger: string;
  action: string;
  cooldownMinutes: number;
  lastTriggered?: string;
}

export interface EscalationRule {
  id: string;
  condition: string;
  escalateTo: StaffRole;
  reason: string;
}

export interface StaffIntervention {
  id: string;
  role: StaffRole;
  type: "nudge" | "briefing" | "alert" | "suggestion" | "question" | "summary" | "celebration";
  urgency: InterventionUrgency;
  title: string;
  message: string;
  context: Record<string, unknown>;
  suggestedActions: { label: string; action: string }[];
  timestamp: string;
  acknowledged: boolean;
  suppressedUntil?: string;
}

export interface CoordinationDecision {
  requestedRoles: StaffRole[];
  selectedRole: StaffRole;
  reason: string;
  alternativeRole?: StaffRole;
}

// ── Default Personas ─────────────────────────────────────────────

const DEFAULT_PERSONAS: StaffPersona[] = [
  {
    role: "chief_of_staff", displayName: "Chief of Staff", scope: ["platform", "cross-domain"], tone: "direct", priority: 100, active: true,
    triggerConditions: [
      { id: "cos-1", type: "threshold", parameter: "cognitiveLoad", value: 75, description: "User is overloaded" },
      { id: "cos-2", type: "pattern", parameter: "ignoredItems", value: 3, description: "Items ignored 3+ times" },
    ],
    proactiveBehaviors: [
      { id: "cos-p1", trigger: "morning_start", action: "daily_briefing", cooldownMinutes: 720 },
      { id: "cos-p2", trigger: "context_switch", action: "transition_summary", cooldownMinutes: 30 },
    ],
    escalationRules: [{ id: "cos-e1", condition: "critical_financial", escalateTo: "money_sentinel", reason: "Financial matter" }],
  },
  {
    role: "executive_assistant", displayName: "Executive Assistant", scope: ["concierge"], tone: "warm", priority: 90, active: true,
    triggerConditions: [
      { id: "ea-1", type: "schedule", parameter: "nextMeeting", value: 15, description: "Meeting in 15 minutes" },
      { id: "ea-2", type: "event", parameter: "newEmail", value: "vip", description: "VIP email received" },
    ],
    proactiveBehaviors: [
      { id: "ea-p1", trigger: "meeting_approach", action: "meeting_prep", cooldownMinutes: 60 },
      { id: "ea-p2", trigger: "travel_day", action: "travel_brief", cooldownMinutes: 480 },
    ],
    escalationRules: [{ id: "ea-e1", condition: "scheduling_conflict", escalateTo: "chief_of_staff", reason: "Scheduling conflict" }],
  },
  {
    role: "operator", displayName: "Operator", scope: ["business"], tone: "direct", priority: 80, active: true,
    triggerConditions: [
      { id: "op-1", type: "threshold", parameter: "pipelineRisk", value: 50, description: "Pipeline risk high" },
      { id: "op-2", type: "event", parameter: "dealStage", value: "stalled", description: "Deal stalled" },
    ],
    proactiveBehaviors: [
      { id: "op-p1", trigger: "revenue_anomaly", action: "revenue_alert", cooldownMinutes: 120 },
    ],
    escalationRules: [{ id: "op-e1", condition: "large_deal_risk", escalateTo: "strategist", reason: "Strategic deal at risk" }],
  },
  {
    role: "strategist", displayName: "Strategist", scope: ["business", "finance"], tone: "formal", priority: 70, active: true,
    triggerConditions: [
      { id: "st-1", type: "pattern", parameter: "opportunityWindow", value: true, description: "Strategic opportunity detected" },
    ],
    proactiveBehaviors: [
      { id: "st-p1", trigger: "weekly_review", action: "strategy_brief", cooldownMinutes: 10080 },
    ],
    escalationRules: [],
  },
  {
    role: "money_sentinel", displayName: "Money Sentinel", scope: ["finance"], tone: "calm", priority: 95, active: true,
    triggerConditions: [
      { id: "ms-1", type: "threshold", parameter: "unusualSpend", value: 500, description: "Unusual spending detected" },
      { id: "ms-2", type: "threshold", parameter: "cashReserve", value: 20, description: "Cash reserve below 20%" },
    ],
    proactiveBehaviors: [
      { id: "ms-p1", trigger: "bill_due", action: "bill_reminder", cooldownMinutes: 1440 },
      { id: "ms-p2", trigger: "budget_deviation", action: "budget_alert", cooldownMinutes: 240 },
    ],
    escalationRules: [{ id: "ms-e1", condition: "fraud_suspected", escalateTo: "chief_of_staff", reason: "Possible fraud" }],
  },
  {
    role: "wellness_sentinel", displayName: "Wellness Sentinel", scope: ["concierge"], tone: "calm", priority: 60, active: true,
    triggerConditions: [
      { id: "ws-1", type: "threshold", parameter: "stressScore", value: 80, description: "Stress level high" },
      { id: "ws-2", type: "absence", parameter: "breakTime", value: 180, description: "No break in 3 hours" },
    ],
    proactiveBehaviors: [
      { id: "ws-p1", trigger: "fatigue_detected", action: "rest_suggestion", cooldownMinutes: 120 },
    ],
    escalationRules: [],
  },
  {
    role: "relationship_sentinel", displayName: "Relationship Sentinel", scope: ["concierge", "business"], tone: "warm", priority: 65, active: true,
    triggerConditions: [
      { id: "rs-1", type: "threshold", parameter: "neglectedContacts", value: 5, description: "5+ neglected contacts" },
      { id: "rs-2", type: "event", parameter: "keyDate", value: "approaching", description: "Key date approaching" },
    ],
    proactiveBehaviors: [
      { id: "rs-p1", trigger: "birthday_approaching", action: "birthday_reminder", cooldownMinutes: 1440 },
      { id: "rs-p2", trigger: "followup_overdue", action: "followup_nudge", cooldownMinutes: 240 },
    ],
    escalationRules: [],
  },
];

// ── Service ──────────────────────────────────────────────────────

export class ChiefOfStaffService {
  private personas: Map<StaffRole, StaffPersona> = new Map();
  private interventions: StaffIntervention[] = [];
  private counter = 0;

  constructor() {
    for (const p of DEFAULT_PERSONAS) this.personas.set(p.role, p);
  }

  // ── Coordination ───────────────────────────────────────────

  selectRole(domain: DomainId, context: Record<string, unknown>): CoordinationDecision {
    const candidates = [...this.personas.values()]
      .filter(p => p.active && (p.scope.includes(domain) || p.scope.includes("cross-domain" as DomainId)))
      .sort((a, b) => b.priority - a.priority);

    if (candidates.length === 0) {
      return { requestedRoles: [], selectedRole: "chief_of_staff", reason: "Fallback to Chief of Staff", alternativeRole: undefined };
    }

    // Context-based selection
    if (context.financial) {
      const ms = candidates.find(c => c.role === "money_sentinel");
      if (ms) return { requestedRoles: candidates.map(c => c.role), selectedRole: "money_sentinel", reason: "Financial context detected", alternativeRole: "chief_of_staff" };
    }

    if (context.meeting || context.schedule) {
      const ea = candidates.find(c => c.role === "executive_assistant");
      if (ea) return { requestedRoles: candidates.map(c => c.role), selectedRole: "executive_assistant", reason: "Scheduling context", alternativeRole: "chief_of_staff" };
    }

    if (context.stress || context.fatigue) {
      const ws = candidates.find(c => c.role === "wellness_sentinel");
      if (ws) return { requestedRoles: candidates.map(c => c.role), selectedRole: "wellness_sentinel", reason: "Wellness context", alternativeRole: "chief_of_staff" };
    }

    return { requestedRoles: candidates.map(c => c.role), selectedRole: candidates[0].role, reason: `Highest priority for domain ${domain}`, alternativeRole: candidates[1]?.role };
  }

  // ── Intervention Creation ──────────────────────────────────

  createIntervention(role: StaffRole, type: StaffIntervention["type"], urgency: InterventionUrgency, title: string, message: string, context: Record<string, unknown> = {}, actions: { label: string; action: string }[] = []): StaffIntervention {
    const intervention: StaffIntervention = {
      id: `staff-${++this.counter}`, role, type, urgency, title, message,
      context, suggestedActions: actions,
      timestamp: new Date().toISOString(), acknowledged: false,
    };
    this.interventions.push(intervention);
    if (this.interventions.length > 300) this.interventions.shift();
    this._persist();
    return intervention;
  }

  // ── Proactive Check ────────────────────────────────────────

  runProactiveCheck(signals: Record<string, unknown>): StaffIntervention[] {
    const created: StaffIntervention[] = [];

    for (const persona of this.personas.values()) {
      if (!persona.active) continue;

      for (const behavior of persona.proactiveBehaviors) {
        if (behavior.lastTriggered) {
          const elapsed = Date.now() - new Date(behavior.lastTriggered).getTime();
          if (elapsed < behavior.cooldownMinutes * 60_000) continue;
        }

        if (signals[behavior.trigger]) {
          behavior.lastTriggered = new Date().toISOString();
          const intervention = this.createIntervention(
            persona.role, "nudge", "proactive",
            `${persona.displayName}: ${behavior.action.replace(/_/g, " ")}`,
            `Triggered by ${behavior.trigger}`,
            { trigger: behavior.trigger, ...signals },
          );
          created.push(intervention);
        }
      }
    }
    return created;
  }

  // ── Queries ────────────────────────────────────────────────

  acknowledgeIntervention(id: string): void {
    const i = this.interventions.find(x => x.id === id);
    if (i) { i.acknowledged = true; this._persist(); }
  }

  suppressRole(role: StaffRole, minutes: number): void {
    const persona = this.personas.get(role);
    if (persona) persona.active = false;
    setTimeout(() => { if (persona) persona.active = true; }, minutes * 60_000);
  }

  getActiveInterventions(): StaffIntervention[] { return this.interventions.filter(i => !i.acknowledged); }
  getInterventionsByRole(role: StaffRole): StaffIntervention[] { return this.interventions.filter(i => i.role === role); }
  getPersona(role: StaffRole): StaffPersona | undefined { return this.personas.get(role); }
  listPersonas(): StaffPersona[] { return [...this.personas.values()]; }
  togglePersona(role: StaffRole, active: boolean): void { const p = this.personas.get(role); if (p) p.active = active; }

  getStats(): { totalInterventions: number; byRole: Record<string, number>; acknowledgementRate: number } {
    const byRole: Record<string, number> = {};
    for (const i of this.interventions) byRole[i.role] = (byRole[i.role] ?? 0) + 1;
    const acked = this.interventions.filter(i => i.acknowledged).length;
    return { totalInterventions: this.interventions.length, byRole, acknowledgementRate: this.interventions.length > 0 ? Math.round((acked / this.interventions.length) * 100) : 0 };
  }

  // ── Persistence ────────────────────────────────────────────

  private _persist = () => debouncedSaveServiceState("chief-of-staff", this.serialize());
  serialize(): Record<string, unknown> { return { personas: Array.from(this.personas.entries()), interventions: this.interventions.slice(-200), counter: this.counter }; }
  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.personas) this.personas = new Map(state.personas as [StaffRole, StaffPersona][]);
    if (state.interventions) this.interventions = state.interventions as StaffIntervention[];
    if (state.counter) this.counter = state.counter as number;
  }
  async loadPersistedState(): Promise<void> { const s = await loadServiceState("chief-of-staff"); if (s) this.hydrate(s as Record<string, unknown>); }
}

export const createChiefOfStaff = () => new ChiefOfStaffService();
