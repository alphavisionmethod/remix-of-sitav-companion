// ═══════════════════════════════════════════════════════════════
// SITA OS — Digital Twin & Boardroom Intelligence Engine
// Business/Money/Household twins, boardroom sessions, scenarios
// ═══════════════════════════════════════════════════════════════

import type {
  DigitalTwin, TwinType, TwinSignal, TwinProjection, TwinBottleneck, TwinRisk,
  BoardroomSession, BoardroomType, BoardroomAgendaItem, BoardroomDecision,
  BoardroomAction, BoardroomTemplate, BoardroomPacket,
  ScenarioSimulation, ScenarioType, ScenarioOutcome, ScenarioTemplate,
} from "../types/digital-twin.types";

// ── Digital Twin Engine ─────────────────────────────────────────
export class DigitalTwinEngine {
  private twins: Map<string, DigitalTwin> = new Map();

  createTwin(type: TwinType, entityId: string): DigitalTwin {
    const twin: DigitalTwin = {
      id: `twin_${type}_${entityId}`,
      type,
      entityId,
      lastUpdated: new Date().toISOString(),
      healthScore: 75,
      signals: [],
      projections: [],
      bottlenecks: [],
      risks: [],
      opportunities: [],
    };
    this.twins.set(twin.id, twin);
    return twin;
  }

  getTwin(type: TwinType, entityId: string): DigitalTwin | undefined {
    return this.twins.get(`twin_${type}_${entityId}`);
  }

  addSignal(twinId: string, signal: Omit<TwinSignal, "id">): TwinSignal {
    const twin = this.twins.get(twinId);
    if (!twin) throw new Error(`Twin ${twinId} not found`);

    const s: TwinSignal = { ...signal, id: `signal_${Date.now()}_${Math.random().toString(36).slice(2, 6)}` };
    twin.signals.push(s);
    twin.lastUpdated = new Date().toISOString();
    this.recalculateHealth(twin);
    return s;
  }

  addProjection(twinId: string, projection: TwinProjection): void {
    const twin = this.twins.get(twinId);
    if (twin) {
      twin.projections = twin.projections.filter(p => p.metric !== projection.metric);
      twin.projections.push(projection);
      twin.lastUpdated = new Date().toISOString();
    }
  }

  addBottleneck(twinId: string, bottleneck: Omit<TwinBottleneck, "id">): TwinBottleneck {
    const twin = this.twins.get(twinId);
    if (!twin) throw new Error(`Twin ${twinId} not found`);

    const b: TwinBottleneck = { ...bottleneck, id: `bottleneck_${Date.now()}` };
    twin.bottlenecks.push(b);
    this.recalculateHealth(twin);
    return b;
  }

  getUnifiedView(entityId: string): { twins: DigitalTwin[]; aggregateHealth: number; topSignals: TwinSignal[]; topBottlenecks: TwinBottleneck[] } {
    const twins = Array.from(this.twins.values()).filter(t => t.entityId === entityId);
    const aggregateHealth = twins.length > 0 ? twins.reduce((s, t) => s + t.healthScore, 0) / twins.length : 0;
    const topSignals = twins.flatMap(t => t.signals).filter(s => s.severity !== "info").sort((a, b) => {
      const sev = { critical: 3, warning: 2, info: 1 };
      return (sev[b.severity] || 0) - (sev[a.severity] || 0);
    }).slice(0, 10);
    const topBottlenecks = twins.flatMap(t => t.bottlenecks).sort((a, b) => {
      const sev = { critical: 4, high: 3, medium: 2, low: 1 };
      return (sev[b.severity] || 0) - (sev[a.severity] || 0);
    }).slice(0, 5);

    return { twins, aggregateHealth, topSignals, topBottlenecks };
  }

  private recalculateHealth(twin: DigitalTwin): void {
    const criticalSignals = twin.signals.filter(s => s.severity === "critical").length;
    const warningSignals = twin.signals.filter(s => s.severity === "warning").length;
    const criticalBottlenecks = twin.bottlenecks.filter(b => b.severity === "critical").length;
    twin.healthScore = Math.max(0, 100 - criticalSignals * 20 - warningSignals * 5 - criticalBottlenecks * 15);
  }

  serialize(): Record<string, unknown> {
    return { twins: Array.from(this.twins.entries()) };
  }
  hydrate(state: Record<string, unknown>): void {
    if (state.twins) this.twins = new Map(state.twins as [string, unknown][]);
  }
}

// ── Boardroom Intelligence Engine ───────────────────────────────
export class BoardroomIntelligenceEngine {
  private sessions: Map<string, BoardroomSession> = new Map();
  private templates: BoardroomTemplate[] = [
    { id: "founder-weekly", type: "founder", name: "Founder Weekly Review", description: "Weekly pulse on business, money, and life", defaultAgenda: [
      { title: "Revenue & Pipeline Health", domain: "business", priority: "high", briefing: "", dataPoints: [], advisorRecommendations: [] },
      { title: "Cash Position & Burn", domain: "finance", priority: "high", briefing: "", dataPoints: [], advisorRecommendations: [] },
      { title: "Team & Capacity", domain: "business", priority: "medium", briefing: "", dataPoints: [], advisorRecommendations: [] },
      { title: "Risk & Compliance", domain: "risk", priority: "medium", briefing: "", dataPoints: [], advisorRecommendations: [] },
      { title: "Life Balance Check", domain: "concierge", priority: "low", briefing: "", dataPoints: [], advisorRecommendations: [] },
    ], suitableFor: ["founder", "solopreneur"], frequency: "weekly" },
    { id: "money-monthly", type: "money", name: "Monthly Money Review", description: "Deep dive into finances, savings, and investments", defaultAgenda: [
      { title: "Income vs Expenses", domain: "finance", priority: "high", briefing: "", dataPoints: [], advisorRecommendations: [] },
      { title: "Savings Opportunities", domain: "finance", priority: "high", briefing: "", dataPoints: [], advisorRecommendations: [] },
      { title: "Investment Performance", domain: "finance", priority: "medium", briefing: "", dataPoints: [], advisorRecommendations: [] },
      { title: "Subscription Audit", domain: "finance", priority: "medium", briefing: "", dataPoints: [], advisorRecommendations: [] },
    ], suitableFor: ["family", "founder"], frequency: "monthly" },
    { id: "family-weekly", type: "family", name: "Family Weekly Sync", description: "Household logistics and family coordination", defaultAgenda: [
      { title: "This Week's Schedule", domain: "concierge", priority: "high", briefing: "", dataPoints: [], advisorRecommendations: [] },
      { title: "Kids & School", domain: "concierge", priority: "high", briefing: "", dataPoints: [], advisorRecommendations: [] },
      { title: "Household Tasks", domain: "concierge", priority: "medium", briefing: "", dataPoints: [], advisorRecommendations: [] },
    ], suitableFor: ["family"], frequency: "weekly" },
  ];

  startSession(type: BoardroomType, entityId: string, templateId?: string): BoardroomSession {
    const template = templateId ? this.templates.find(t => t.id === templateId) : this.templates.find(t => t.type === type);

    const session: BoardroomSession = {
      id: `boardroom_${Date.now()}`,
      type,
      entityId,
      startedAt: new Date().toISOString(),
      agenda: (template?.defaultAgenda || []).map((a, i) => ({ ...a, id: `agenda_${i}` })),
      decisions: [],
      unresolvedCarryover: [],
      actionQueue: [],
      participatingAdvisors: [],
      memorySnapshot: "",
      confidence: 0.8,
    };

    this.sessions.set(session.id, session);
    return session;
  }

  addDecision(sessionId: string, decision: Omit<BoardroomDecision, "id" | "proofId">): BoardroomDecision {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);

    const d: BoardroomDecision = {
      ...decision,
      id: `decision_${Date.now()}`,
      proofId: `proof_boardroom_${Date.now()}`,
    };
    session.decisions.push(d);
    return d;
  }

  addAction(sessionId: string, action: Omit<BoardroomAction, "id" | "status">): BoardroomAction {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);

    const a: BoardroomAction = { ...action, id: `action_${Date.now()}`, status: "pending" };
    session.actionQueue.push(a);
    return a;
  }

  generatePacket(sessionId: string): BoardroomPacket {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);

    return {
      sessionId,
      preparedAt: new Date().toISOString(),
      summary: `${session.type} boardroom session with ${session.agenda.length} agenda items`,
      keyMetrics: session.agenda.flatMap(a => a.dataPoints.map(d => ({ label: d.label, value: d.value, trend: d.trend || "stable", alert: false }))),
      agenda: session.agenda,
      unresolved: session.unresolvedCarryover,
      recentDecisions: session.decisions.slice(-5),
      advisorBriefs: session.participatingAdvisors.map(id => ({ advisorId: id, brief: "" })),
    };
  }

  getTemplates(type?: BoardroomType): BoardroomTemplate[] {
    return type ? this.templates.filter(t => t.type === type) : this.templates;
  }

  getSession(id: string): BoardroomSession | undefined { return this.sessions.get(id); }
  getRecentSessions(entityId: string, limit: number = 10): BoardroomSession[] {
    return Array.from(this.sessions.values())
      .filter(s => s.entityId === entityId)
      .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
      .slice(0, limit);
  }

  serialize(): Record<string, unknown> {
    return { sessions: Array.from(this.sessions.entries()) };
  }
  hydrate(state: Record<string, unknown>): void {
    if (state.sessions) this.sessions = new Map(state.sessions as [string, unknown][]);
  }
}

// ── Scenario Intelligence Engine ────────────────────────────────
export class ScenarioIntelligenceEngine {
  private simulations: ScenarioSimulation[] = [];
  private templates: ScenarioTemplate[] = [
    { id: "price-change", type: "decision", name: "Price Change Impact", description: "What if we change pricing?", requiredInputs: [{ field: "newPrice", label: "New Price", type: "number" }, { field: "product", label: "Product", type: "string" }], domain: "business", suitableFor: ["founder", "operator"] },
    { id: "hire-decision", type: "tradeoff", name: "New Hire ROI", description: "Should we hire for this role?", requiredInputs: [{ field: "role", label: "Role", type: "string" }, { field: "salary", label: "Annual Salary", type: "number" }], domain: "business", suitableFor: ["founder"] },
    { id: "cash-stress", type: "stress_test", name: "Cash Runway Stress Test", description: "What if revenue drops?", requiredInputs: [{ field: "revenueDropPercent", label: "Revenue Drop %", type: "number" }], domain: "finance", suitableFor: ["founder", "family"] },
    { id: "market-expansion", type: "forecast", name: "Market Expansion Forecast", description: "What if we enter a new market?", requiredInputs: [{ field: "market", label: "Market", type: "string" }, { field: "investment", label: "Investment", type: "number" }], domain: "business", suitableFor: ["founder"] },
  ];

  simulate(input: Omit<ScenarioSimulation, "id" | "createdAt" | "outcomes"> & { outcomes: ScenarioOutcome[] }): ScenarioSimulation {
    const sim: ScenarioSimulation = {
      ...input,
      id: `scenario_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.simulations.push(sim);
    return sim;
  }

  getTemplates(type?: ScenarioType): ScenarioTemplate[] {
    return type ? this.templates.filter(t => t.type === type) : this.templates;
  }

  getSimulations(domain?: string): ScenarioSimulation[] {
    return domain ? this.simulations.filter(s => s.domain === domain) : this.simulations;
  }

  serialize(): Record<string, unknown> {
    return { simulations: this.simulations };
  }
  hydrate(state: Record<string, unknown>): void {
    if (state.simulations) this.simulations = state.simulations as never;
  }
}
