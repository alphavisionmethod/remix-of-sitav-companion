// ═══════════════════════════════════════════════════════════════
// SITA OS — Reality Audit & Classification Registry
// 5 Active Systems: Classification, Mock Replacement, Core Persistence,
// Runtime Truth Gate, Launch Honesty Board
// ═══════════════════════════════════════════════════════════════

export type RealityState = "presentational" | "simulated" | "persisted" | "proven";
export type LaunchCriticality = "P0" | "P1" | "P2";
export type PromiseSeverity = "critical" | "high" | "medium" | "low";

// ─── A. Reality Classification Matrix ─────────────────────────

export interface FeatureRealityRecord {
  id: string;
  featureId: string;
  name: string;
  domain: string;
  route: string;
  realityState: RealityState;
  launchCriticality: LaunchCriticality;
  promiseSeverity: PromiseSeverity;
  runtimeEvidenceAvailable: boolean;
  contractComplete: boolean;
  interactionComplete: boolean;
  hasRealData: boolean;
  hasRealMutation: boolean;
  hasMockBacking: boolean;
  notes: string;
}

export const FEATURE_REALITY_MATRIX: FeatureRealityRecord[] = [
  // Finance domain
  { id: "FR-001", featureId: "money-office", name: "Money Office / Boardroom", domain: "finance", route: "/money", realityState: "simulated", launchCriticality: "P0", promiseSeverity: "critical", runtimeEvidenceAvailable: false, contractComplete: true, interactionComplete: false, hasRealData: false, hasRealMutation: false, hasMockBacking: true, notes: "UI premium but data is mocked. No real account aggregation." },
  { id: "FR-002", featureId: "spending-analytics", name: "Spending Analytics", domain: "finance", route: "/money/analytics", realityState: "presentational", launchCriticality: "P1", promiseSeverity: "high", runtimeEvidenceAvailable: false, contractComplete: false, interactionComplete: false, hasRealData: false, hasRealMutation: false, hasMockBacking: true, notes: "Charts render but no real data pipeline." },
  { id: "FR-003", featureId: "bill-pay", name: "Bill Pay", domain: "finance", route: "/money/bills", realityState: "presentational", launchCriticality: "P0", promiseSeverity: "critical", runtimeEvidenceAvailable: false, contractComplete: false, interactionComplete: false, hasRealData: false, hasRealMutation: false, hasMockBacking: true, notes: "Critical money flow with no real backend." },
  { id: "FR-004", featureId: "safe-to-spend", name: "Safe to Spend", domain: "finance", route: "/money/safe-to-spend", realityState: "simulated", launchCriticality: "P0", promiseSeverity: "critical", runtimeEvidenceAvailable: false, contractComplete: true, interactionComplete: false, hasRealData: false, hasRealMutation: false, hasMockBacking: true, notes: "Flagship claim with mock data." },
  // Business domain
  { id: "FR-005", featureId: "business-center", name: "Business Center", domain: "business", route: "/business", realityState: "simulated", launchCriticality: "P0", promiseSeverity: "critical", runtimeEvidenceAvailable: false, contractComplete: true, interactionComplete: false, hasRealData: false, hasRealMutation: false, hasMockBacking: true, notes: "Core product surface backed by mock data." },
  { id: "FR-006", featureId: "investment-office", name: "Investment Office", domain: "business", route: "/investment", realityState: "presentational", launchCriticality: "P1", promiseSeverity: "high", runtimeEvidenceAvailable: false, contractComplete: false, interactionComplete: false, hasRealData: false, hasRealMutation: false, hasMockBacking: true, notes: "Premium charts with no real brokerage data." },
  // Concierge / AI domain
  { id: "FR-007", featureId: "concierge-chat", name: "Concierge Chat", domain: "concierge", route: "/concierge", realityState: "simulated", launchCriticality: "P0", promiseSeverity: "critical", runtimeEvidenceAvailable: false, contractComplete: true, interactionComplete: true, hasRealData: false, hasRealMutation: false, hasMockBacking: true, notes: "Chat UI wired but AI keys may be missing. Falls back to demo." },
  { id: "FR-008", featureId: "advisor-council", name: "AI Advisor Council", domain: "ai", route: "/advisors", realityState: "simulated", launchCriticality: "P1", promiseSeverity: "high", runtimeEvidenceAvailable: false, contractComplete: true, interactionComplete: false, hasRealData: false, hasRealMutation: false, hasMockBacking: true, notes: "Advisor framework exists but advisors use demo mode." },
  // Platform domain
  { id: "FR-009", featureId: "daily-pulse", name: "Daily Pulse", domain: "platform", route: "/pulse", realityState: "simulated", launchCriticality: "P0", promiseSeverity: "high", runtimeEvidenceAvailable: false, contractComplete: true, interactionComplete: true, hasRealData: false, hasRealMutation: false, hasMockBacking: true, notes: "Dashboard renders but aggregations are mock." },
  { id: "FR-010", featureId: "mission-control", name: "Mission Control", domain: "platform", route: "/mission-control", realityState: "simulated", launchCriticality: "P0", promiseSeverity: "high", runtimeEvidenceAvailable: false, contractComplete: true, interactionComplete: true, hasRealData: false, hasRealMutation: false, hasMockBacking: true, notes: "Missions persist to Supabase but intelligence is mock." },
  // Owner domain
  { id: "FR-011", featureId: "owner-center", name: "Owner Center", domain: "owner", route: "/owner", realityState: "presentational", launchCriticality: "P1", promiseSeverity: "high", runtimeEvidenceAvailable: false, contractComplete: false, interactionComplete: false, hasRealData: false, hasRealMutation: false, hasMockBacking: true, notes: "Owner workspace with no real team management." },
  { id: "FR-012", featureId: "files-center", name: "Files Center", domain: "platform", route: "/files", realityState: "simulated", launchCriticality: "P1", promiseSeverity: "medium", runtimeEvidenceAvailable: true, contractComplete: true, interactionComplete: true, hasRealData: true, hasRealMutation: true, hasMockBacking: false, notes: "Uses Supabase storage. One of the more real features." },
  // Auth
  { id: "FR-013", featureId: "auth-system", name: "Authentication", domain: "platform", route: "/auth", realityState: "persisted", launchCriticality: "P0", promiseSeverity: "critical", runtimeEvidenceAvailable: true, contractComplete: true, interactionComplete: true, hasRealData: true, hasRealMutation: true, hasMockBacking: false, notes: "Supabase Auth is real. Demo bypass exists but can be gated." },
  // Admin
  { id: "FR-014", featureId: "admin-intelligence", name: "Admin Intelligence", domain: "admin", route: "/admin/intelligence", realityState: "simulated", launchCriticality: "P1", promiseSeverity: "high", runtimeEvidenceAvailable: false, contractComplete: true, interactionComplete: true, hasRealData: false, hasRealMutation: false, hasMockBacking: true, notes: "Dashboards render but intelligence is hardcoded." },
  { id: "FR-015", featureId: "implementation-truth", name: "Implementation Truth", domain: "admin", route: "/admin/implementation-truth", realityState: "simulated", launchCriticality: "P1", promiseSeverity: "medium", runtimeEvidenceAvailable: false, contractComplete: true, interactionComplete: true, hasRealData: false, hasRealMutation: false, hasMockBacking: true, notes: "In-memory registry — comprehensive but not persisted." },
  { id: "FR-016", featureId: "platform-law", name: "Platform Law System", domain: "admin", route: "/admin/platform-law", realityState: "simulated", launchCriticality: "P1", promiseSeverity: "medium", runtimeEvidenceAvailable: false, contractComplete: true, interactionComplete: true, hasRealData: false, hasRealMutation: false, hasMockBacking: true, notes: "Full 10-screen system but all data in-memory." },
  // Workspace
  { id: "FR-017", featureId: "workspace", name: "Workspace (Docs/Sheets/Slides)", domain: "platform", route: "/workspace", realityState: "presentational", launchCriticality: "P2", promiseSeverity: "medium", runtimeEvidenceAvailable: false, contractComplete: false, interactionComplete: false, hasRealData: false, hasRealMutation: false, hasMockBacking: true, notes: "Office suite UI exists but no collaborative editing." },
  { id: "FR-018", featureId: "boardroom", name: "Boardroom", domain: "platform", route: "/boardroom", realityState: "simulated", launchCriticality: "P1", promiseSeverity: "high", runtimeEvidenceAvailable: false, contractComplete: true, interactionComplete: true, hasRealData: false, hasRealMutation: false, hasMockBacking: true, notes: "AI boardroom with demo intelligence data." },
  { id: "FR-019", featureId: "approvals", name: "Approvals Center", domain: "platform", route: "/approvals", realityState: "persisted", launchCriticality: "P1", promiseSeverity: "medium", runtimeEvidenceAvailable: true, contractComplete: true, interactionComplete: true, hasRealData: true, hasRealMutation: true, hasMockBacking: false, notes: "Approval records persist to Supabase." },
  { id: "FR-020", featureId: "connectors", name: "Connector Hub", domain: "platform", route: "/connectors", realityState: "presentational", launchCriticality: "P1", promiseSeverity: "high", runtimeEvidenceAvailable: false, contractComplete: true, interactionComplete: false, hasRealData: false, hasRealMutation: false, hasMockBacking: true, notes: "No real connector integrations yet." },
];

// ─── B. Mock Replacement Program ──────────────────────────────

export interface MockReplacementRecord {
  id: string;
  page: string;
  route: string;
  domain: string;
  mockSource: string;
  realBackendTarget: string;
  contractStatus: "absent" | "draft" | "defined" | "implemented";
  migrationPriority: "P0" | "P1" | "P2";
  done: boolean;
  notes: string;
}

export const MOCK_REPLACEMENT_PROGRAM: MockReplacementRecord[] = [
  { id: "MR-001", page: "Money Office", route: "/money", domain: "finance", mockSource: "In-memory demo data generators", realBackendTarget: "Supabase + account aggregation service", contractStatus: "defined", migrationPriority: "P0", done: false, notes: "Highest user-facing priority. Needs account linking API." },
  { id: "MR-002", page: "Safe to Spend", route: "/money/safe-to-spend", domain: "finance", mockSource: "Hardcoded balance calculations", realBackendTarget: "financial-projection-service", contractStatus: "defined", migrationPriority: "P0", done: false, notes: "Flagship feature. Math must be real." },
  { id: "MR-003", page: "Business Center", route: "/business", domain: "business", mockSource: "Static business entity data", realBackendTarget: "Supabase business_entities + contracts", contractStatus: "defined", migrationPriority: "P0", done: false, notes: "Core product. Needs real entity persistence." },
  { id: "MR-004", page: "Investment Office", route: "/investment", domain: "business", mockSource: "Hardcoded portfolio data", realBackendTarget: "Investment API + market data connector", contractStatus: "absent", migrationPriority: "P1", done: false, notes: "Requires external market data integration." },
  { id: "MR-005", page: "Concierge Chat", route: "/concierge", domain: "concierge", mockSource: "Demo AI responses", realBackendTarget: "AI Gateway (Lovable/OpenAI)", contractStatus: "implemented", migrationPriority: "P0", done: false, notes: "Keys exist. Needs wiring verification." },
  { id: "MR-006", page: "Admin Intelligence", route: "/admin/intelligence", domain: "admin", mockSource: "Hardcoded dashboard metrics", realBackendTarget: "Supabase analytics views + edge functions", contractStatus: "draft", migrationPriority: "P1", done: false, notes: "Intelligence must come from real telemetry." },
  { id: "MR-007", page: "Daily Pulse", route: "/pulse", domain: "platform", mockSource: "Mock aggregation data", realBackendTarget: "Supabase views + real user activity", contractStatus: "defined", migrationPriority: "P0", done: false, notes: "Entry point. Must show real user state." },
  { id: "MR-008", page: "Owner Center", route: "/owner", domain: "owner", mockSource: "Static owner/team data", realBackendTarget: "Supabase profiles + user_roles", contractStatus: "draft", migrationPriority: "P1", done: false, notes: "Team management needs real role system." },
  { id: "MR-009", page: "Boardroom", route: "/boardroom", domain: "platform", mockSource: "Demo intelligence briefs", realBackendTarget: "AI Gateway + real data aggregation", contractStatus: "defined", migrationPriority: "P1", done: false, notes: "Strategic intelligence surface." },
  { id: "MR-010", page: "Connector Hub", route: "/connectors", domain: "platform", mockSource: "Hardcoded connector list", realBackendTarget: "Real OAuth + API integrations", contractStatus: "draft", migrationPriority: "P1", done: false, notes: "First real connector will prove the model." },
  { id: "MR-011", page: "Spending Analytics", route: "/money/analytics", domain: "finance", mockSource: "Static chart data", realBackendTarget: "Transaction aggregation service", contractStatus: "absent", migrationPriority: "P1", done: false, notes: "Charts look premium but data is fake." },
  { id: "MR-012", page: "Workspace Suite", route: "/workspace", domain: "platform", mockSource: "No real editing engine", realBackendTarget: "Collaborative editing service (TBD)", contractStatus: "absent", migrationPriority: "P2", done: false, notes: "Large effort. Lower priority." },
];

// ─── C. Core Service Persistence Program ──────────────────────

export interface CoreServiceRecord {
  id: string;
  serviceName: string;
  currentState: "in-memory" | "partially-persisted" | "fully-persisted";
  persistenceTarget: string;
  eventModel: string;
  projectionModel: string;
  priority: "P0" | "P1" | "P2";
  blockerFor: string[];
  notes: string;
}

export const CORE_SERVICE_PERSISTENCE: CoreServiceRecord[] = [
  { id: "CS-001", serviceName: "EventBus", currentState: "in-memory", persistenceTarget: "Supabase event_log table + pg_notify", eventModel: "Append-only event log with type, payload, timestamp, actor", projectionModel: "Materialized views per consumer domain", priority: "P0", blockerFor: ["Real-time state propagation", "Audit trail", "Cross-domain reactivity"], notes: "Most critical. Without persistent events, OS core is theatrical." },
  { id: "CS-002", serviceName: "MemoryService", currentState: "in-memory", persistenceTarget: "Supabase memory_store table + RLS", eventModel: "CRUD events with scope (user, session, agent, system)", projectionModel: "Key-value store with TTL and scope isolation", priority: "P0", blockerFor: ["AI context persistence", "Cross-session memory", "Agent state"], notes: "AI and advisor systems depend on this." },
  { id: "CS-003", serviceName: "PolicyEngine", currentState: "in-memory", persistenceTarget: "Supabase policy_rules + policy_evaluations", eventModel: "Policy change events + evaluation receipts", projectionModel: "Active policy set + evaluation history", priority: "P0", blockerFor: ["Budget enforcement", "Permission gates", "Trust-weighted actions"], notes: "Security and governance depend on real policies." },
  { id: "CS-004", serviceName: "TrustWeightedActionService", currentState: "partially-persisted", persistenceTarget: "trust_weighted_actions table (exists)", eventModel: "Action lifecycle events (proposed, approved, executed, receipted)", projectionModel: "Action state machine with receipt chain", priority: "P1", blockerFor: ["Proof system", "Approval chain", "Audit compliance"], notes: "Table exists in Supabase. Needs full lifecycle wiring." },
  { id: "CS-005", serviceName: "NotificationService", currentState: "partially-persisted", persistenceTarget: "notifications_queue table (exists)", eventModel: "Notification dispatch events + delivery receipts", projectionModel: "Unread count, delivery status, preference-filtered feed", priority: "P1", blockerFor: ["Real-time alerts", "Push notifications", "Incident awareness"], notes: "DB tables exist. Push dispatch trigger exists. Needs VAPID wiring." },
  { id: "CS-006", serviceName: "SchedulerService", currentState: "in-memory", persistenceTarget: "Supabase agent_schedules table (exists)", eventModel: "Schedule CRUD + execution receipts", projectionModel: "Next-run queue + execution history", priority: "P1", blockerFor: ["Autonomous agents", "Background tasks", "Nightly audits"], notes: "Table exists but no real scheduler runs." },
  { id: "CS-007", serviceName: "ConnectorSyncService", currentState: "in-memory", persistenceTarget: "Supabase connector_sync_state + edge functions", eventModel: "Sync started, completed, failed, data_received", projectionModel: "Sync status per connector + data freshness", priority: "P1", blockerFor: ["Real integrations", "External data", "OS that orchestrates"], notes: "No real connector syncs yet." },
  { id: "CS-008", serviceName: "IntelligenceAggregator", currentState: "in-memory", persistenceTarget: "Supabase intelligence_snapshots + AI Gateway", eventModel: "Insight generated, validated, consumed, expired", projectionModel: "Current insights by domain + confidence + freshness", priority: "P2", blockerFor: ["Boardroom intelligence", "Strategic surfaces", "AI-driven recommendations"], notes: "Needs AI Gateway + real data to generate real insights." },
];

// ─── D. Runtime Truth Gate ────────────────────────────────────

export interface RuntimeTruthCheck {
  id: string;
  featureId: string;
  featureName: string;
  realDataLoads: boolean;
  realMutationPersists: boolean;
  runtimeEvidenceExists: boolean;
  criticalInteractionWorks: boolean;
  noMockBackingForLaunch: boolean;
  gateStatus: "pass" | "fail" | "partial";
  failReasons: string[];
}

export function computeRuntimeTruthGate(): RuntimeTruthCheck[] {
  return FEATURE_REALITY_MATRIX.filter(f => f.launchCriticality !== "P2").map(f => {
    const checks = [f.hasRealData, f.hasRealMutation, f.runtimeEvidenceAvailable, f.interactionComplete, !f.hasMockBacking];
    const passCount = checks.filter(Boolean).length;
    const failReasons: string[] = [];
    if (!f.hasRealData) failReasons.push("No real data loading");
    if (!f.hasRealMutation) failReasons.push("No real mutation persistence");
    if (!f.runtimeEvidenceAvailable) failReasons.push("No runtime evidence");
    if (!f.interactionComplete) failReasons.push("Critical interactions incomplete");
    if (f.hasMockBacking) failReasons.push("Mock backing still present");

    return {
      id: `RTG-${f.id}`,
      featureId: f.featureId,
      featureName: f.name,
      realDataLoads: f.hasRealData,
      realMutationPersists: f.hasRealMutation,
      runtimeEvidenceExists: f.runtimeEvidenceAvailable,
      criticalInteractionWorks: f.interactionComplete,
      noMockBackingForLaunch: !f.hasMockBacking,
      gateStatus: passCount === 5 ? "pass" : passCount >= 3 ? "partial" : "fail",
      failReasons,
    };
  });
}

// ─── E. Launch Honesty Board ──────────────────────────────────

export interface LaunchHonestyRecord {
  id: string;
  featureId: string;
  name: string;
  domain: string;
  realityState: RealityState;
  isReal: boolean;
  isPartial: boolean;
  isSimulated: boolean;
  isProven: boolean;
  allowedInLaunchClaims: boolean;
  honestyNotes: string;
}

export function computeLaunchHonestyBoard(): LaunchHonestyRecord[] {
  return FEATURE_REALITY_MATRIX.map(f => {
    const isProven = f.realityState === "proven";
    const isReal = f.realityState === "persisted" || isProven;
    const isPartial = f.realityState === "simulated";
    const isSimulated = f.realityState === "presentational" || f.realityState === "simulated";
    const allowedInLaunchClaims = isReal || isProven;

    let honestyNotes = "";
    if (isProven) honestyNotes = "Fully proven. Safe for all claims.";
    else if (isReal) honestyNotes = "Persisted and integrated. Can claim with qualifier.";
    else if (isPartial) honestyNotes = "Simulated. Must not claim as working product.";
    else honestyNotes = "Presentational only. Cannot appear in any launch claims.";

    return {
      id: `LH-${f.id}`,
      featureId: f.featureId,
      name: f.name,
      domain: f.domain,
      realityState: f.realityState,
      isReal,
      isPartial,
      isSimulated,
      isProven,
      allowedInLaunchClaims,
      honestyNotes,
    };
  });
}

// ─── Aggregate helpers ────────────────────────────────────────

export function getRealityDistribution(): Record<RealityState, number> {
  const dist: Record<RealityState, number> = { presentational: 0, simulated: 0, persisted: 0, proven: 0 };
  FEATURE_REALITY_MATRIX.forEach(f => dist[f.realityState]++);
  return dist;
}

export function getMockReplacementProgress(): { total: number; done: number; p0Remaining: number } {
  const total = MOCK_REPLACEMENT_PROGRAM.length;
  const done = MOCK_REPLACEMENT_PROGRAM.filter(m => m.done).length;
  const p0Remaining = MOCK_REPLACEMENT_PROGRAM.filter(m => !m.done && m.migrationPriority === "P0").length;
  return { total, done, p0Remaining };
}

export function getCoreServiceHealth(): { total: number; persisted: number; inMemory: number; p0Blockers: number } {
  const total = CORE_SERVICE_PERSISTENCE.length;
  const persisted = CORE_SERVICE_PERSISTENCE.filter(s => s.currentState === "fully-persisted").length;
  const inMemory = CORE_SERVICE_PERSISTENCE.filter(s => s.currentState === "in-memory").length;
  const p0Blockers = CORE_SERVICE_PERSISTENCE.filter(s => s.priority === "P0" && s.currentState !== "fully-persisted").length;
  return { total, persisted, inMemory, p0Blockers };
}

export function getRuntimeTruthSummary(): { total: number; passing: number; failing: number; partial: number } {
  const gates = computeRuntimeTruthGate();
  return {
    total: gates.length,
    passing: gates.filter(g => g.gateStatus === "pass").length,
    failing: gates.filter(g => g.gateStatus === "fail").length,
    partial: gates.filter(g => g.gateStatus === "partial").length,
  };
}

export function getLaunchHonestySummary(): { total: number; claimable: number; blocked: number; proven: number } {
  const records = computeLaunchHonestyBoard();
  return {
    total: records.length,
    claimable: records.filter(r => r.allowedInLaunchClaims).length,
    blocked: records.filter(r => !r.allowedInLaunchClaims).length,
    proven: records.filter(r => r.isProven).length,
  };
}
