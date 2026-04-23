// ═══════════════════════════════════════════════════════════════
// SITA OS — Reality Conversion Program Registry
// 12-Screen System: Classification, Mock Replacement, Core Persistence,
// Runtime Truth Gate, Launch Honesty, Mock Inventory, Contract Readiness,
// Route Heatmap, Wave Planner, Progress Timeline, Feature Detail, Overview
// ═══════════════════════════════════════════════════════════════

export type RealityState = "presentational" | "simulated" | "persisted" | "proven";
export type LaunchCriticality = "P0" | "P1" | "P2";
export type PromiseSeverity = "critical" | "high" | "medium" | "low";
export type ScopeLevel = "route" | "page" | "feature" | "component_group" | "service" | "domain" | "workspace" | "office";
export type MockType = "hardcoded" | "local_array" | "localstorage" | "in_memory_engine" | "pure_function" | "demo_flow";
export type MigrationStatus = "identified" | "planned" | "in_progress" | "blocked" | "completed" | "validated";

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
  // Extended fields for RCP02+
  confidence: number; // 0-100
  scopeLevel: ScopeLevel;
  components: string[];
  services: string[];
  backingSourceTypes: string[];
  nextRequiredTransition: string;
  transitionBlockers: string[];
  owner: string | null;
}

export const FEATURE_REALITY_MATRIX: FeatureRealityRecord[] = [
  { id: "FR-001", featureId: "money-office", name: "Money Office / Boardroom", domain: "finance", route: "/money", realityState: "simulated", launchCriticality: "P0", promiseSeverity: "critical", runtimeEvidenceAvailable: false, contractComplete: true, interactionComplete: false, hasRealData: false, hasRealMutation: false, hasMockBacking: true, notes: "UI premium but data is mocked. No real account aggregation.", confidence: 85, scopeLevel: "office", components: ["MoneyDashboard", "AccountCards", "SpendingChart", "MoneyTwin"], services: ["AccountAggregationService", "TransactionEngine"], backingSourceTypes: ["in_memory_engine", "demo_flow"], nextRequiredTransition: "Wire to real account aggregation API", transitionBlockers: ["No account linking API", "No banking connector"], owner: "Finance Team" },
  { id: "FR-002", featureId: "spending-analytics", name: "Spending Analytics", domain: "finance", route: "/money/analytics", realityState: "presentational", launchCriticality: "P1", promiseSeverity: "high", runtimeEvidenceAvailable: false, contractComplete: false, interactionComplete: false, hasRealData: false, hasRealMutation: false, hasMockBacking: true, notes: "Charts render but no real data pipeline.", confidence: 90, scopeLevel: "page", components: ["SpendingCharts", "CategoryBreakdown"], services: ["TransactionAggregator"], backingSourceTypes: ["hardcoded"], nextRequiredTransition: "Create transaction aggregation views", transitionBlockers: ["No real transaction data source"], owner: null },
  { id: "FR-003", featureId: "bill-pay", name: "Bill Pay", domain: "finance", route: "/money/bills", realityState: "presentational", launchCriticality: "P0", promiseSeverity: "critical", runtimeEvidenceAvailable: false, contractComplete: false, interactionComplete: false, hasRealData: false, hasRealMutation: false, hasMockBacking: true, notes: "Critical money flow with no real backend.", confidence: 95, scopeLevel: "feature", components: ["BillList", "BillPayForm", "PaymentConfirmation"], services: ["BillPayService"], backingSourceTypes: ["hardcoded", "demo_flow"], nextRequiredTransition: "Implement payment processing service", transitionBlockers: ["No payment processor integration", "No bill storage"], owner: null },
  { id: "FR-004", featureId: "safe-to-spend", name: "Safe to Spend", domain: "finance", route: "/money/safe-to-spend", realityState: "simulated", launchCriticality: "P0", promiseSeverity: "critical", runtimeEvidenceAvailable: false, contractComplete: true, interactionComplete: false, hasRealData: false, hasRealMutation: false, hasMockBacking: true, notes: "Flagship claim with mock data.", confidence: 80, scopeLevel: "feature", components: ["SafeToSpendCard", "ProjectionChart", "BudgetGauge"], services: ["FinancialProjectionService"], backingSourceTypes: ["pure_function", "hardcoded"], nextRequiredTransition: "Connect to real account balances", transitionBlockers: ["No real balance API", "Projection model not validated"], owner: "Finance Team" },
  { id: "FR-005", featureId: "business-center", name: "Business Center", domain: "business", route: "/business", realityState: "simulated", launchCriticality: "P0", promiseSeverity: "critical", runtimeEvidenceAvailable: false, contractComplete: true, interactionComplete: false, hasRealData: false, hasRealMutation: false, hasMockBacking: true, notes: "Core product surface backed by mock data.", confidence: 85, scopeLevel: "office", components: ["BusinessDashboard", "EntityCards", "ContractManager"], services: ["BusinessEntityService", "ContractService"], backingSourceTypes: ["local_array", "demo_flow"], nextRequiredTransition: "Persist entities to Supabase", transitionBlockers: ["Schema migration needed"], owner: "Business Team" },
  { id: "FR-006", featureId: "investment-office", name: "Investment Office", domain: "business", route: "/investment", realityState: "presentational", launchCriticality: "P1", promiseSeverity: "high", runtimeEvidenceAvailable: false, contractComplete: false, interactionComplete: false, hasRealData: false, hasRealMutation: false, hasMockBacking: true, notes: "Premium charts with no real brokerage data.", confidence: 90, scopeLevel: "office", components: ["PortfolioDashboard", "HoldingsTable", "PerformanceChart"], services: ["MarketDataService", "PortfolioEngine"], backingSourceTypes: ["hardcoded"], nextRequiredTransition: "Integrate market data API", transitionBlockers: ["No brokerage connector", "No market data API key"], owner: null },
  { id: "FR-007", featureId: "concierge-chat", name: "Concierge Chat", domain: "concierge", route: "/concierge", realityState: "simulated", launchCriticality: "P0", promiseSeverity: "critical", runtimeEvidenceAvailable: false, contractComplete: true, interactionComplete: true, hasRealData: false, hasRealMutation: false, hasMockBacking: true, notes: "Chat UI wired but AI keys may be missing. Falls back to demo.", confidence: 70, scopeLevel: "feature", components: ["ChatInterface", "MessageList", "InputBar", "AdvisorPanel"], services: ["AIGateway", "ConversationService"], backingSourceTypes: ["demo_flow", "in_memory_engine"], nextRequiredTransition: "Verify AI Gateway keys and wire real responses", transitionBlockers: ["OPENAI key may be missing", "Demo fallback active"], owner: "AI Team" },
  { id: "FR-008", featureId: "advisor-council", name: "AI Advisor Council", domain: "ai", route: "/advisors", realityState: "simulated", launchCriticality: "P1", promiseSeverity: "high", runtimeEvidenceAvailable: false, contractComplete: true, interactionComplete: false, hasRealData: false, hasRealMutation: false, hasMockBacking: true, notes: "Advisor framework exists but advisors use demo mode.", confidence: 75, scopeLevel: "feature", components: ["AdvisorRegistry", "AdvisorChat", "CouncilBoard"], services: ["AdvisorService", "AIGateway"], backingSourceTypes: ["demo_flow", "in_memory_engine"], nextRequiredTransition: "Wire advisors to real AI inference", transitionBlockers: ["AI keys needed", "Advisor memory not persisted"], owner: "AI Team" },
  { id: "FR-009", featureId: "daily-pulse", name: "Daily Pulse", domain: "platform", route: "/pulse", realityState: "simulated", launchCriticality: "P0", promiseSeverity: "high", runtimeEvidenceAvailable: false, contractComplete: true, interactionComplete: true, hasRealData: false, hasRealMutation: false, hasMockBacking: true, notes: "Dashboard renders but aggregations are mock.", confidence: 80, scopeLevel: "page", components: ["PulseHero", "InsightCards", "ActivityFeed", "QuickActions"], services: ["PulseAggregator", "ActivityService"], backingSourceTypes: ["in_memory_engine", "hardcoded"], nextRequiredTransition: "Wire to real user activity and event bus", transitionBlockers: ["EventBus not persisted", "No real activity stream"], owner: "Platform Team" },
  { id: "FR-010", featureId: "mission-control", name: "Mission Control", domain: "platform", route: "/mission-control", realityState: "simulated", launchCriticality: "P0", promiseSeverity: "high", runtimeEvidenceAvailable: false, contractComplete: true, interactionComplete: true, hasRealData: false, hasRealMutation: false, hasMockBacking: true, notes: "Missions persist to Supabase but intelligence is mock.", confidence: 65, scopeLevel: "page", components: ["MissionBoard", "MissionDetail", "IntelligencePanel"], services: ["MissionService", "IntelligenceAggregator"], backingSourceTypes: ["demo_flow", "in_memory_engine"], nextRequiredTransition: "Wire intelligence to real AI analysis", transitionBlockers: ["Intelligence aggregator is in-memory", "No real telemetry pipeline"], owner: "Platform Team" },
  { id: "FR-011", featureId: "owner-center", name: "Owner Center", domain: "owner", route: "/owner", realityState: "presentational", launchCriticality: "P1", promiseSeverity: "high", runtimeEvidenceAvailable: false, contractComplete: false, interactionComplete: false, hasRealData: false, hasRealMutation: false, hasMockBacking: true, notes: "Owner workspace with no real team management.", confidence: 90, scopeLevel: "office", components: ["OwnerDashboard", "TeamPanel", "SettingsForm"], services: ["TeamService", "RoleService"], backingSourceTypes: ["hardcoded", "localstorage"], nextRequiredTransition: "Wire to user_roles and profiles", transitionBlockers: ["Role system not wired to UI"], owner: null },
  { id: "FR-012", featureId: "files-center", name: "Files Center", domain: "platform", route: "/files", realityState: "persisted", launchCriticality: "P1", promiseSeverity: "medium", runtimeEvidenceAvailable: true, contractComplete: true, interactionComplete: true, hasRealData: true, hasRealMutation: true, hasMockBacking: false, notes: "Uses Supabase storage. One of the more real features.", confidence: 90, scopeLevel: "feature", components: ["FileManager", "FileUpload", "FilePreview"], services: ["SupabaseStorage"], backingSourceTypes: ["db"], nextRequiredTransition: "Add runtime probes and E2E tests", transitionBlockers: [], owner: "Platform Team" },
  { id: "FR-013", featureId: "auth-system", name: "Authentication", domain: "platform", route: "/auth", realityState: "persisted", launchCriticality: "P0", promiseSeverity: "critical", runtimeEvidenceAvailable: true, contractComplete: true, interactionComplete: true, hasRealData: true, hasRealMutation: true, hasMockBacking: false, notes: "Supabase Auth is real. Demo bypass exists but can be gated.", confidence: 85, scopeLevel: "feature", components: ["AuthForm", "LoginPage", "SignupPage", "ResetPassword"], services: ["SupabaseAuth"], backingSourceTypes: ["db"], nextRequiredTransition: "Remove demo auth bypass, add E2E", transitionBlockers: ["Demo bypass still active"], owner: "Platform Team" },
  { id: "FR-014", featureId: "admin-intelligence", name: "Admin Intelligence", domain: "admin", route: "/admin/intelligence", realityState: "simulated", launchCriticality: "P1", promiseSeverity: "high", runtimeEvidenceAvailable: false, contractComplete: true, interactionComplete: true, hasRealData: false, hasRealMutation: false, hasMockBacking: true, notes: "Dashboards render but intelligence is hardcoded.", confidence: 85, scopeLevel: "page", components: ["IntelligenceDashboard", "MetricCards", "TrendCharts"], services: ["IntelligenceAggregator", "TelemetryService"], backingSourceTypes: ["hardcoded", "in_memory_engine"], nextRequiredTransition: "Wire to real telemetry tables", transitionBlockers: ["No real telemetry pipeline"], owner: "Admin Team" },
  { id: "FR-015", featureId: "implementation-truth", name: "Implementation Truth", domain: "admin", route: "/admin/implementation-truth", realityState: "simulated", launchCriticality: "P1", promiseSeverity: "medium", runtimeEvidenceAvailable: false, contractComplete: true, interactionComplete: true, hasRealData: false, hasRealMutation: false, hasMockBacking: true, notes: "In-memory registry — comprehensive but not persisted.", confidence: 80, scopeLevel: "page", components: ["ITCDashboard", "FeatureInventory", "TruthGate"], services: ["ImplementationTruthRegistry"], backingSourceTypes: ["in_memory_engine"], nextRequiredTransition: "Persist truth records to Supabase", transitionBlockers: ["Registry is in-memory only"], owner: "Admin Team" },
  { id: "FR-016", featureId: "platform-law", name: "Platform Law System", domain: "admin", route: "/admin/platform-law", realityState: "simulated", launchCriticality: "P1", promiseSeverity: "medium", runtimeEvidenceAvailable: false, contractComplete: true, interactionComplete: true, hasRealData: false, hasRealMutation: false, hasMockBacking: true, notes: "Full 10-screen system but all data in-memory.", confidence: 80, scopeLevel: "page", components: ["LawOverview", "LawRegistry", "CIGateMonitor", "ScaffoldRegistry"], services: ["PlatformLawRegistry"], backingSourceTypes: ["in_memory_engine"], nextRequiredTransition: "Persist law pack data to Supabase", transitionBlockers: ["All data is in-memory"], owner: "Admin Team" },
  { id: "FR-017", featureId: "workspace", name: "Workspace (Docs/Sheets/Slides)", domain: "platform", route: "/workspace", realityState: "presentational", launchCriticality: "P2", promiseSeverity: "medium", runtimeEvidenceAvailable: false, contractComplete: false, interactionComplete: false, hasRealData: false, hasRealMutation: false, hasMockBacking: true, notes: "Office suite UI exists but no collaborative editing.", confidence: 95, scopeLevel: "workspace", components: ["DocEditor", "SheetEditor", "SlideEditor"], services: [], backingSourceTypes: ["hardcoded"], nextRequiredTransition: "Implement document persistence", transitionBlockers: ["No editing engine", "No collaboration service"], owner: null },
  { id: "FR-018", featureId: "boardroom", name: "Boardroom", domain: "platform", route: "/boardroom", realityState: "simulated", launchCriticality: "P1", promiseSeverity: "high", runtimeEvidenceAvailable: false, contractComplete: true, interactionComplete: true, hasRealData: false, hasRealMutation: false, hasMockBacking: true, notes: "AI boardroom with demo intelligence data.", confidence: 75, scopeLevel: "page", components: ["BoardroomSlides", "StrategicBriefing", "DecisionBoard"], services: ["IntelligenceAggregator", "AIGateway"], backingSourceTypes: ["demo_flow", "hardcoded"], nextRequiredTransition: "Wire to real AI-generated intelligence", transitionBlockers: ["AI keys needed", "No real data aggregation"], owner: "AI Team" },
  { id: "FR-019", featureId: "approvals", name: "Approvals Center", domain: "platform", route: "/approvals", realityState: "persisted", launchCriticality: "P1", promiseSeverity: "medium", runtimeEvidenceAvailable: true, contractComplete: true, interactionComplete: true, hasRealData: true, hasRealMutation: true, hasMockBacking: false, notes: "Approval records persist to Supabase.", confidence: 85, scopeLevel: "feature", components: ["ApprovalList", "ApprovalDetail", "ApprovalForm"], services: ["ApprovalService"], backingSourceTypes: ["db"], nextRequiredTransition: "Add E2E tests and runtime probes", transitionBlockers: [], owner: "Platform Team" },
  { id: "FR-020", featureId: "connectors", name: "Connector Hub", domain: "platform", route: "/connectors", realityState: "presentational", launchCriticality: "P1", promiseSeverity: "high", runtimeEvidenceAvailable: false, contractComplete: true, interactionComplete: false, hasRealData: false, hasRealMutation: false, hasMockBacking: true, notes: "No real connector integrations yet.", confidence: 90, scopeLevel: "feature", components: ["ConnectorList", "ConnectorConfig", "SyncStatus"], services: ["ConnectorSyncService"], backingSourceTypes: ["hardcoded", "demo_flow"], nextRequiredTransition: "Implement first real OAuth connector", transitionBlockers: ["No OAuth client configured", "No real sync engine"], owner: null },
];

// ─── B. Mock Replacement Program ──────────────────────────────

export interface MockReplacementRecord {
  id: string;
  page: string;
  route: string;
  domain: string;
  source: string;
  realBackendTarget: string;
  contractStatus: "absent" | "draft" | "defined" | "implemented";
  migrationPriority: "P0" | "P1" | "P2";
  done: boolean;
  notes: string;
  // Extended fields
  type: MockType;
  owner: string | null;
  blockers: string[];
  migrationStatus: MigrationStatus;
  validationEvidence: string[];
  truthSeverity: PromiseSeverity;
  expectedContracts: string[];
  persistenceTarget: string;
  sequenceOrder: number;
  dependencies: string[];
}

export const REPLACEMENT_PROGRAM: MockReplacementRecord[] = [
  { id: "MR-001", page: "Money Office", route: "/money", domain: "finance", source: "In-memory demo data generators", realBackendTarget: "Supabase + account aggregation service", contractStatus: "defined", migrationPriority: "P0", done: false, notes: "Highest user-facing priority. Needs account linking API.", type: "in_memory_engine", owner: "Finance Team", blockers: ["No account linking API", "No banking connector"], migrationStatus: "planned", validationEvidence: [], truthSeverity: "critical", expectedContracts: ["AccountContract", "TransactionContract"], persistenceTarget: "Supabase accounts + transactions tables", sequenceOrder: 1, dependencies: [] },
  { id: "MR-002", page: "Safe to Spend", route: "/money/safe-to-spend", domain: "finance", source: "Hardcoded balance calculations", realBackendTarget: "financial-projection-service", contractStatus: "defined", migrationPriority: "P0", done: false, notes: "Flagship feature. Math must be real.", type: "pure_function", owner: "Finance Team", blockers: ["No real balance API", "Projection model not validated"], migrationStatus: "planned", validationEvidence: [], truthSeverity: "critical", expectedContracts: ["BalanceContract", "ProjectionContract"], persistenceTarget: "Supabase projections table", sequenceOrder: 2, dependencies: ["MR-001"] },
  { id: "MR-003", page: "Business Center", route: "/business", domain: "business", source: "Static business entity data", realBackendTarget: "Supabase business_entities + contracts", contractStatus: "defined", migrationPriority: "P0", done: false, notes: "Core product. Needs real entity persistence.", type: "local_array", owner: "Business Team", blockers: ["Schema migration needed"], migrationStatus: "in_progress", validationEvidence: [], truthSeverity: "critical", expectedContracts: ["BusinessEntityContract", "ContractContract"], persistenceTarget: "Supabase business_entities", sequenceOrder: 3, dependencies: [] },
  { id: "MR-004", page: "Investment Office", route: "/investment", domain: "business", source: "Hardcoded portfolio data", realBackendTarget: "Investment API + market data connector", contractStatus: "absent", migrationPriority: "P1", done: false, notes: "Requires external market data integration.", type: "hardcoded", owner: null, blockers: ["No brokerage connector", "No market data API"], migrationStatus: "identified", validationEvidence: [], truthSeverity: "high", expectedContracts: ["PortfolioContract", "MarketDataContract"], persistenceTarget: "Supabase portfolios + market cache", sequenceOrder: 7, dependencies: [] },
  { id: "MR-005", page: "Concierge Chat", route: "/concierge", domain: "concierge", source: "Demo AI responses", realBackendTarget: "AI Gateway (Lovable/OpenAI)", contractStatus: "implemented", migrationPriority: "P0", done: false, notes: "Keys exist. Needs wiring verification.", type: "demo_flow", owner: "AI Team", blockers: ["OPENAI key verification"], migrationStatus: "in_progress", validationEvidence: ["AI Gateway config exists"], truthSeverity: "critical", expectedContracts: ["InferenceContract"], persistenceTarget: "Supabase conversations + messages", sequenceOrder: 4, dependencies: [] },
  { id: "MR-006", page: "Admin Intelligence", route: "/admin/intelligence", domain: "admin", source: "Hardcoded dashboard metrics", realBackendTarget: "Supabase analytics views + edge functions", contractStatus: "draft", migrationPriority: "P1", done: false, notes: "Intelligence must come from real telemetry.", type: "hardcoded", owner: "Admin Team", blockers: ["No telemetry pipeline"], migrationStatus: "planned", validationEvidence: [], truthSeverity: "high", expectedContracts: ["TelemetryContract", "AnalyticsContract"], persistenceTarget: "Supabase analytics views", sequenceOrder: 8, dependencies: [] },
  { id: "MR-007", page: "Daily Pulse", route: "/pulse", domain: "platform", source: "Mock aggregation data", realBackendTarget: "Supabase views + real user activity", contractStatus: "defined", migrationPriority: "P0", done: false, notes: "Entry point. Must show real user state.", type: "in_memory_engine", owner: "Platform Team", blockers: ["EventBus not persisted", "No activity stream"], migrationStatus: "planned", validationEvidence: [], truthSeverity: "high", expectedContracts: ["ActivityContract", "PulseAggregationContract"], persistenceTarget: "Supabase activity_events", sequenceOrder: 5, dependencies: ["MR-001"] },
  { id: "MR-008", page: "Owner Center", route: "/owner", domain: "owner", source: "Static owner/team data", realBackendTarget: "Supabase profiles + user_roles", contractStatus: "draft", migrationPriority: "P1", done: false, notes: "Team management needs real role system.", type: "hardcoded", owner: null, blockers: ["Role system not wired"], migrationStatus: "identified", validationEvidence: [], truthSeverity: "high", expectedContracts: ["TeamContract", "RoleContract"], persistenceTarget: "Supabase user_roles + profiles", sequenceOrder: 9, dependencies: [] },
  { id: "MR-009", page: "Boardroom", route: "/boardroom", domain: "platform", source: "Demo intelligence briefs", realBackendTarget: "AI Gateway + real data aggregation", contractStatus: "defined", migrationPriority: "P1", done: false, notes: "Strategic intelligence surface.", type: "demo_flow", owner: "AI Team", blockers: ["AI keys needed", "No data aggregation"], migrationStatus: "identified", validationEvidence: [], truthSeverity: "high", expectedContracts: ["IntelligenceContract", "BriefingContract"], persistenceTarget: "Supabase intelligence_snapshots", sequenceOrder: 10, dependencies: ["MR-005"] },
  { id: "MR-010", page: "Connector Hub", route: "/connectors", domain: "platform", source: "Hardcoded connector list", realBackendTarget: "Real OAuth + API integrations", contractStatus: "draft", migrationPriority: "P1", done: false, notes: "First real connector will prove the model.", type: "hardcoded", owner: null, blockers: ["No OAuth client", "No sync engine"], migrationStatus: "identified", validationEvidence: [], truthSeverity: "high", expectedContracts: ["ConnectorContract", "SyncContract"], persistenceTarget: "Supabase connector_configs", sequenceOrder: 11, dependencies: [] },
  { id: "MR-011", page: "Spending Analytics", route: "/money/analytics", domain: "finance", source: "Static chart data", realBackendTarget: "Transaction aggregation service", contractStatus: "absent", migrationPriority: "P1", done: false, notes: "Charts look premium but data is fake.", type: "hardcoded", owner: null, blockers: ["No transaction data source"], migrationStatus: "identified", validationEvidence: [], truthSeverity: "high", expectedContracts: ["TransactionAggregationContract"], persistenceTarget: "Supabase transaction_aggregates", sequenceOrder: 12, dependencies: ["MR-001"] },
  { id: "MR-012", page: "Workspace Suite", route: "/workspace", domain: "platform", source: "No real editing engine", realBackendTarget: "Collaborative editing service (TBD)", contractStatus: "absent", migrationPriority: "P2", done: false, notes: "Large effort. Lower priority.", type: "hardcoded", owner: null, blockers: ["No editing engine", "No collaboration backend"], migrationStatus: "identified", validationEvidence: [], truthSeverity: "medium", expectedContracts: ["DocumentContract", "CollaborationContract"], persistenceTarget: "Supabase documents + CRDT", sequenceOrder: 13, dependencies: [] },
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
  // Extended fields for RCP06
  usageDomains: string[];
  stateLossSeverity: PromiseSeverity;
  dependsOn: string[];
}

export const CORE_SERVICE_PERSISTENCE: CoreServiceRecord[] = [
  { id: "CS-001", serviceName: "EventBus", currentState: "in-memory", persistenceTarget: "Supabase event_log table + pg_notify", eventModel: "Append-only event log with type, payload, timestamp, actor", projectionModel: "Materialized views per consumer domain", priority: "P0", blockerFor: ["Real-time state propagation", "Audit trail", "Cross-domain reactivity"], notes: "Most critical. Without persistent events, OS core is theatrical.", usageDomains: ["finance", "business", "platform", "admin", "concierge"], stateLossSeverity: "critical", dependsOn: [] },
  { id: "CS-002", serviceName: "MemoryService", currentState: "in-memory", persistenceTarget: "Supabase memory_store table + RLS", eventModel: "CRUD events with scope (user, session, agent, system)", projectionModel: "Key-value store with TTL and scope isolation", priority: "P0", blockerFor: ["AI context persistence", "Cross-session memory", "Agent state"], notes: "AI and advisor systems depend on this.", usageDomains: ["concierge", "ai", "platform"], stateLossSeverity: "critical", dependsOn: [] },
  { id: "CS-003", serviceName: "PolicyEngine", currentState: "in-memory", persistenceTarget: "Supabase policy_rules + policy_evaluations", eventModel: "Policy change events + evaluation receipts", projectionModel: "Active policy set + evaluation history", priority: "P0", blockerFor: ["Budget enforcement", "Permission gates", "Trust-weighted actions"], notes: "Security and governance depend on real policies.", usageDomains: ["finance", "admin", "platform"], stateLossSeverity: "critical", dependsOn: [] },
  { id: "CS-004", serviceName: "TrustWeightedActionService", currentState: "partially-persisted", persistenceTarget: "trust_weighted_actions table (exists)", eventModel: "Action lifecycle events (proposed, approved, executed, receipted)", projectionModel: "Action state machine with receipt chain", priority: "P1", blockerFor: ["Proof system", "Approval chain", "Audit compliance"], notes: "Table exists in Supabase. Needs full lifecycle wiring.", usageDomains: ["platform", "finance", "admin"], stateLossSeverity: "high", dependsOn: ["CS-001"] },
  { id: "CS-005", serviceName: "NotificationService", currentState: "partially-persisted", persistenceTarget: "notifications_queue table (exists)", eventModel: "Notification dispatch events + delivery receipts", projectionModel: "Unread count, delivery status, preference-filtered feed", priority: "P1", blockerFor: ["Real-time alerts", "Push notifications", "Incident awareness"], notes: "DB tables exist. Push dispatch trigger exists. Needs VAPID wiring.", usageDomains: ["platform", "admin"], stateLossSeverity: "high", dependsOn: ["CS-001"] },
  { id: "CS-006", serviceName: "SchedulerService", currentState: "in-memory", persistenceTarget: "Supabase agent_schedules table (exists)", eventModel: "Schedule CRUD + execution receipts", projectionModel: "Next-run queue + execution history", priority: "P1", blockerFor: ["Autonomous agents", "Background tasks", "Nightly audits"], notes: "Table exists but no real scheduler runs.", usageDomains: ["ai", "admin", "platform"], stateLossSeverity: "medium", dependsOn: ["CS-001"] },
  { id: "CS-007", serviceName: "ConnectorSyncService", currentState: "in-memory", persistenceTarget: "Supabase connector_sync_state + edge functions", eventModel: "Sync started, completed, failed, data_received", projectionModel: "Sync status per connector + data freshness", priority: "P1", blockerFor: ["Real integrations", "External data", "OS that orchestrates"], notes: "No real connector syncs yet.", usageDomains: ["platform", "business", "finance"], stateLossSeverity: "high", dependsOn: [] },
  { id: "CS-008", serviceName: "IntelligenceAggregator", currentState: "in-memory", persistenceTarget: "Supabase intelligence_snapshots + AI Gateway", eventModel: "Insight generated, validated, consumed, expired", projectionModel: "Current insights by domain + confidence + freshness", priority: "P2", blockerFor: ["Boardroom intelligence", "Strategic surfaces", "AI-driven recommendations"], notes: "Needs AI Gateway + real data to generate real insights.", usageDomains: ["ai", "admin", "platform"], stateLossSeverity: "medium", dependsOn: ["CS-002", "CS-006"] },
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
  // Extended fields for RCP12
  postMigrationVerified: boolean;
  driftDetected: boolean;
  lastValidatedAt: string | null;
  mutationPersistenceDetail: string;
  rolloutConfidence: number;
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

    const isPersisted = f.realityState === "persisted" || f.realityState === "proven";

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
      postMigrationVerified: isPersisted && f.runtimeEvidenceAvailable,
      driftDetected: false,
      lastValidatedAt: isPersisted ? "2026-04-08T12:00:00Z" : null,
      mutationPersistenceDetail: f.hasRealMutation ? "Mutations persist to Supabase" : "No real mutation path",
      rolloutConfidence: passCount * 20,
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
  // Extended fields for RCP09
  claimSeverity: "safe" | "caution" | "danger";
  promotionRisk: "none" | "low" | "medium" | "high";
  qualifierRequired: boolean;
}

export function computeLaunchHonestyBoard(): LaunchHonestyRecord[] {
  return FEATURE_REALITY_MATRIX.map(f => {
    const isProven = f.realityState === "proven";
    const isReal = f.realityState === "persisted" || isProven;
    const isPartial = f.realityState === "simulated";
    const isSimulated = f.realityState === "presentational" || f.realityState === "simulated";
    const allowedInLaunchClaims = isReal || isProven;

    let honestyNotes = "";
    let claimSeverity: "safe" | "caution" | "danger" = "danger";
    let promotionRisk: "none" | "low" | "medium" | "high" = "high";
    let qualifierRequired = true;

    if (isProven) { honestyNotes = "Fully proven. Safe for all claims."; claimSeverity = "safe"; promotionRisk = "none"; qualifierRequired = false; }
    else if (isReal) { honestyNotes = "Persisted and integrated. Can claim with qualifier."; claimSeverity = "caution"; promotionRisk = "low"; qualifierRequired = true; }
    else if (isPartial) { honestyNotes = "Simulated. Must not claim as working product."; claimSeverity = "danger"; promotionRisk = "high"; qualifierRequired = true; }
    else { honestyNotes = "Presentational only. Cannot appear in any launch claims."; claimSeverity = "danger"; promotionRisk = "high"; qualifierRequired = true; }

    return {
      id: `LH-${f.id}`,
      featureId: f.featureId,
      name: f.name,
      domain: f.domain,
      realityState: f.realityState,
      isReal, isPartial, isSimulated, isProven,
      allowedInLaunchClaims, honestyNotes,
      claimSeverity, promotionRisk, qualifierRequired,
    };
  });
}

// ─── F. Mock Source Inventory ─────────────────────────────────

export interface MockSourceRecord {
  id: string;
  sourcePath: string;
  sourceDescription: string;
  type: MockType;
  importedByPages: string[];
  domainsAffected: string[];
  usageCount: number;
  criticality: PromiseSeverity;
  allowed: boolean;
  forbidden: boolean;
  replacementTarget: string;
}

export const SOURCE_INVENTORY: MockSourceRecord[] = [
  { id: "MS-001", sourcePath: "src/data/fixtures/mock-data/finance-demo.ts", sourceDescription: "Demo account balances, transactions, spending categories", type: "hardcoded", importedByPages: ["/money", "/money/analytics", "/money/safe-to-spend", "/money/bills"], domainsAffected: ["finance"], usageCount: 12, criticality: "critical", allowed: false, forbidden: true, replacementTarget: "Supabase accounts + transaction tables" },
  { id: "MS-002", sourcePath: "src/data/fixtures/mock-data/business-entities.ts", sourceDescription: "Static business entities, contracts, team data", type: "local_array", importedByPages: ["/business", "/business/contracts"], domainsAffected: ["business"], usageCount: 8, criticality: "critical", allowed: false, forbidden: true, replacementTarget: "Supabase business_entities" },
  { id: "MS-003", sourcePath: "src/lib/demo-intelligence.ts", sourceDescription: "Hardcoded intelligence metrics, insights, briefs", type: "hardcoded", importedByPages: ["/admin/intelligence", "/boardroom", "/pulse"], domainsAffected: ["admin", "platform"], usageCount: 15, criticality: "high", allowed: false, forbidden: true, replacementTarget: "AI Gateway + analytics views" },
  { id: "MS-004", sourcePath: "src/lib/services/EventBus.ts", sourceDescription: "In-memory event bus — no persistence, lost on refresh", type: "in_memory_engine", importedByPages: ["/pulse", "/mission-control", "/admin/*"], domainsAffected: ["platform", "admin", "finance"], usageCount: 25, criticality: "critical", allowed: true, forbidden: false, replacementTarget: "Supabase event_log + pg_notify" },
  { id: "MS-005", sourcePath: "src/lib/services/MemoryService.ts", sourceDescription: "In-memory key-value store for AI context", type: "in_memory_engine", importedByPages: ["/concierge", "/advisors", "/boardroom"], domainsAffected: ["concierge", "ai"], usageCount: 10, criticality: "critical", allowed: true, forbidden: false, replacementTarget: "Supabase memory_store table" },
  { id: "MS-006", sourcePath: "src/lib/services/PolicyEngine.ts", sourceDescription: "In-memory policy rules and evaluation", type: "in_memory_engine", importedByPages: ["/admin/policies", "/approvals"], domainsAffected: ["admin", "platform"], usageCount: 8, criticality: "critical", allowed: true, forbidden: false, replacementTarget: "Supabase policy_rules + evaluations" },
  { id: "MS-007", sourcePath: "src/data/fixtures/mock-data/investment-demo.ts", sourceDescription: "Fake portfolio holdings, market data, returns", type: "hardcoded", importedByPages: ["/investment"], domainsAffected: ["business"], usageCount: 6, criticality: "high", allowed: false, forbidden: true, replacementTarget: "Investment API + market connector" },
  { id: "MS-008", sourcePath: "src/lib/demo-connectors.ts", sourceDescription: "Hardcoded connector list and fake sync states", type: "hardcoded", importedByPages: ["/connectors"], domainsAffected: ["platform"], usageCount: 4, criticality: "high", allowed: false, forbidden: true, replacementTarget: "Real OAuth connector configs" },
  { id: "MS-009", sourcePath: "src/data/fixtures/mock-data/owner-team.ts", sourceDescription: "Static team members, roles, permissions", type: "local_array", importedByPages: ["/owner", "/owner/team"], domainsAffected: ["owner"], usageCount: 5, criticality: "high", allowed: false, forbidden: true, replacementTarget: "Supabase profiles + user_roles" },
  { id: "MS-010", sourcePath: "src/lib/platform-law/platform-law-registry.ts", sourceDescription: "In-memory law packs, rules, validation runs", type: "in_memory_engine", importedByPages: ["/admin/platform-law/*"], domainsAffected: ["admin"], usageCount: 10, criticality: "medium", allowed: true, forbidden: false, replacementTarget: "Supabase law_packs + rules tables" },
  { id: "MS-011", sourcePath: "src/lib/implementation-truth/registry.ts", sourceDescription: "In-memory feature truth inventory", type: "in_memory_engine", importedByPages: ["/admin/implementation-truth/*"], domainsAffected: ["admin"], usageCount: 12, criticality: "medium", allowed: true, forbidden: false, replacementTarget: "Supabase feature_truth table" },
  { id: "MS-012", sourcePath: "src/lib/demo-ai-responses.ts", sourceDescription: "Canned AI responses and demo conversation flows", type: "demo_flow", importedByPages: ["/concierge", "/advisors"], domainsAffected: ["concierge", "ai"], usageCount: 6, criticality: "critical", allowed: false, forbidden: true, replacementTarget: "AI Gateway real inference" },
  { id: "MS-013", sourcePath: "src/data/fixtures/mock-data/workspace-docs.ts", sourceDescription: "Sample documents, sheets, slide decks", type: "hardcoded", importedByPages: ["/workspace"], domainsAffected: ["platform"], usageCount: 3, criticality: "low", allowed: true, forbidden: false, replacementTarget: "Document persistence service" },
  { id: "MS-014", sourcePath: "src/lib/demo-auth-bypass.ts", sourceDescription: "Demo authentication bypass for development", type: "demo_flow", importedByPages: ["/auth", "/*"], domainsAffected: ["platform"], usageCount: 2, criticality: "critical", allowed: false, forbidden: true, replacementTarget: "Gate behind env flag, remove for production" },
  { id: "MS-015", sourcePath: "src/data/fixtures/mock-data/activity-feed.ts", sourceDescription: "Fake activity events and notification data", type: "local_array", importedByPages: ["/pulse", "/inbox"], domainsAffected: ["platform"], usageCount: 7, criticality: "high", allowed: false, forbidden: true, replacementTarget: "Supabase activity_events table" },
];

// ─── G. Contract & Backend Readiness ──────────────────────────

export interface ContractReadinessRecord {
  id: string;
  contractName: string;
  domain: string;
  expectedFor: string[];
  contractExists: boolean;
  endpointExists: boolean;
  edgeFunctionExists: boolean;
  schemaExists: boolean;
  queryReady: boolean;
  mutationReady: boolean;
  gapDescription: string;
  blocksFeatures: string[];
}

export const CONTRACT_READINESS: ContractReadinessRecord[] = [
  { id: "CR-001", contractName: "AccountContract", domain: "finance", expectedFor: ["Money Office", "Safe to Spend"], contractExists: true, endpointExists: false, edgeFunctionExists: false, schemaExists: false, queryReady: false, mutationReady: false, gapDescription: "Contract defined but no backend implementation", blocksFeatures: ["FR-001", "FR-004"] },
  { id: "CR-002", contractName: "TransactionContract", domain: "finance", expectedFor: ["Money Office", "Spending Analytics"], contractExists: true, endpointExists: false, edgeFunctionExists: false, schemaExists: false, queryReady: false, mutationReady: false, gapDescription: "Needs transaction ingestion pipeline", blocksFeatures: ["FR-001", "FR-002"] },
  { id: "CR-003", contractName: "BusinessEntityContract", domain: "business", expectedFor: ["Business Center"], contractExists: true, endpointExists: false, edgeFunctionExists: false, schemaExists: true, queryReady: true, mutationReady: false, gapDescription: "Schema exists, needs mutation endpoints", blocksFeatures: ["FR-005"] },
  { id: "CR-004", contractName: "InferenceContract", domain: "concierge", expectedFor: ["Concierge Chat", "Advisor Council", "Boardroom"], contractExists: true, endpointExists: true, edgeFunctionExists: true, schemaExists: true, queryReady: true, mutationReady: true, gapDescription: "Implemented — needs key verification", blocksFeatures: ["FR-007", "FR-008"] },
  { id: "CR-005", contractName: "PulseAggregationContract", domain: "platform", expectedFor: ["Daily Pulse"], contractExists: true, endpointExists: false, edgeFunctionExists: false, schemaExists: false, queryReady: false, mutationReady: false, gapDescription: "Needs real event aggregation backend", blocksFeatures: ["FR-009"] },
  { id: "CR-006", contractName: "ConnectorContract", domain: "platform", expectedFor: ["Connector Hub"], contractExists: true, endpointExists: false, edgeFunctionExists: false, schemaExists: true, queryReady: false, mutationReady: false, gapDescription: "Schema exists, no OAuth implementation", blocksFeatures: ["FR-020"] },
  { id: "CR-007", contractName: "ApprovalContract", domain: "platform", expectedFor: ["Approvals Center"], contractExists: true, endpointExists: true, edgeFunctionExists: false, schemaExists: true, queryReady: true, mutationReady: true, gapDescription: "Fully implemented", blocksFeatures: [] },
  { id: "CR-008", contractName: "FileStorageContract", domain: "platform", expectedFor: ["Files Center"], contractExists: true, endpointExists: true, edgeFunctionExists: false, schemaExists: true, queryReady: true, mutationReady: true, gapDescription: "Fully implemented via Supabase Storage", blocksFeatures: [] },
  { id: "CR-009", contractName: "TelemetryContract", domain: "admin", expectedFor: ["Admin Intelligence"], contractExists: false, endpointExists: false, edgeFunctionExists: false, schemaExists: false, queryReady: false, mutationReady: false, gapDescription: "No telemetry pipeline exists", blocksFeatures: ["FR-014"] },
  { id: "CR-010", contractName: "TeamContract", domain: "owner", expectedFor: ["Owner Center"], contractExists: false, endpointExists: false, edgeFunctionExists: false, schemaExists: true, queryReady: false, mutationReady: false, gapDescription: "user_roles table exists but no team management API", blocksFeatures: ["FR-011"] },
  { id: "CR-011", contractName: "PortfolioContract", domain: "business", expectedFor: ["Investment Office"], contractExists: false, endpointExists: false, edgeFunctionExists: false, schemaExists: false, queryReady: false, mutationReady: false, gapDescription: "Needs external market data integration", blocksFeatures: ["FR-006"] },
  { id: "CR-012", contractName: "AuthContract", domain: "platform", expectedFor: ["Authentication"], contractExists: true, endpointExists: true, edgeFunctionExists: true, schemaExists: true, queryReady: true, mutationReady: true, gapDescription: "Fully implemented via Supabase Auth", blocksFeatures: [] },
];

// ─── H. Migration Wave Planner ────────────────────────────────

export interface MigrationWaveRecord {
  id: string;
  waveName: string;
  waveNumber: number;
  priority: "P0" | "P1" | "P2";
  domainGroup: string;
  features: string[];
  featureNames: string[];
  owner: string;
  effortEstimate: "small" | "medium" | "large" | "xlarge";
  readinessGainEstimate: number; // percentage points
  dependsOnWaves: string[];
  status: MigrationStatus;
  targetDate: string;
}

export const MIGRATION_WAVES: MigrationWaveRecord[] = [
  { id: "MW-001", waveName: "Wave 1 — Auth & Core Wiring", waveNumber: 1, priority: "P0", domainGroup: "Platform Core", features: ["FR-013", "FR-012", "FR-019"], featureNames: ["Authentication", "Files Center", "Approvals Center"], owner: "Platform Team", effortEstimate: "small", readinessGainEstimate: 15, dependsOnWaves: [], status: "in_progress", targetDate: "2026-04-20" },
  { id: "MW-002", waveName: "Wave 2 — Finance Reality", waveNumber: 2, priority: "P0", domainGroup: "Finance", features: ["FR-001", "FR-004", "FR-003", "FR-002"], featureNames: ["Money Office", "Safe to Spend", "Bill Pay", "Spending Analytics"], owner: "Finance Team", effortEstimate: "xlarge", readinessGainEstimate: 25, dependsOnWaves: ["MW-001"], status: "planned", targetDate: "2026-05-15" },
  { id: "MW-003", waveName: "Wave 3 — AI & Concierge", waveNumber: 3, priority: "P0", domainGroup: "AI/Concierge", features: ["FR-007", "FR-008", "FR-018"], featureNames: ["Concierge Chat", "AI Advisor Council", "Boardroom"], owner: "AI Team", effortEstimate: "large", readinessGainEstimate: 20, dependsOnWaves: ["MW-001"], status: "planned", targetDate: "2026-05-30" },
  { id: "MW-004", waveName: "Wave 4 — Business & OS Core", waveNumber: 4, priority: "P1", domainGroup: "Business + Platform", features: ["FR-005", "FR-009", "FR-010", "FR-011", "FR-020"], featureNames: ["Business Center", "Daily Pulse", "Mission Control", "Owner Center", "Connector Hub"], owner: "Business Team", effortEstimate: "xlarge", readinessGainEstimate: 30, dependsOnWaves: ["MW-002", "MW-003"], status: "identified", targetDate: "2026-06-30" },
];

// ─── I. Reality Transition Records ────────────────────────────

export interface RealityTransitionRecord {
  id: string;
  featureId: string;
  featureName: string;
  fromState: RealityState;
  toState: RealityState;
  transitionDate: string;
  evidence: string;
  transitionedBy: string;
}

export const REALITY_TRANSITIONS: RealityTransitionRecord[] = [
  { id: "RT-001", featureId: "FR-013", featureName: "Authentication", fromState: "simulated", toState: "persisted", transitionDate: "2026-02-15", evidence: "Supabase Auth fully integrated with email/password and Google OAuth", transitionedBy: "Platform Team" },
  { id: "RT-002", featureId: "FR-012", featureName: "Files Center", fromState: "presentational", toState: "persisted", transitionDate: "2026-03-01", evidence: "Supabase Storage integration with upload, download, preview", transitionedBy: "Platform Team" },
  { id: "RT-003", featureId: "FR-019", featureName: "Approvals Center", fromState: "simulated", toState: "persisted", transitionDate: "2026-03-10", evidence: "Approval records persist to Supabase with RLS policies", transitionedBy: "Platform Team" },
  { id: "RT-004", featureId: "FR-005", featureName: "Business Center", fromState: "presentational", toState: "simulated", transitionDate: "2026-03-20", evidence: "Business entity CRUD wired to local state management", transitionedBy: "Business Team" },
  { id: "RT-005", featureId: "FR-007", featureName: "Concierge Chat", fromState: "presentational", toState: "simulated", transitionDate: "2026-02-28", evidence: "Chat UI with demo AI responses and conversation flow", transitionedBy: "AI Team" },
];

// ─── J. Post-Migration Validation ─────────────────────────────

export interface PostMigrationValidation {
  id: string;
  featureId: string;
  featureName: string;
  dataLoadsFromReal: boolean;
  mutationPersists: boolean;
  interactionSucceeds: boolean;
  proofBehaviorWorks: boolean;
  noDriftDetected: boolean;
  validatedAt: string;
  validatedBy: string;
  notes: string;
}

export const POST_MIGRATION_VALIDATIONS: PostMigrationValidation[] = [
  { id: "PMV-001", featureId: "FR-013", featureName: "Authentication", dataLoadsFromReal: true, mutationPersists: true, interactionSucceeds: true, proofBehaviorWorks: true, noDriftDetected: true, validatedAt: "2026-04-05", validatedBy: "Platform Team", notes: "Auth flow fully verified. Demo bypass still present but gatable." },
  { id: "PMV-002", featureId: "FR-012", featureName: "Files Center", dataLoadsFromReal: true, mutationPersists: true, interactionSucceeds: true, proofBehaviorWorks: false, noDriftDetected: true, validatedAt: "2026-04-06", validatedBy: "Platform Team", notes: "File upload/download verified. No proof receipt generation yet." },
  { id: "PMV-003", featureId: "FR-019", featureName: "Approvals Center", dataLoadsFromReal: true, mutationPersists: true, interactionSucceeds: true, proofBehaviorWorks: true, noDriftDetected: true, validatedAt: "2026-04-07", validatedBy: "Platform Team", notes: "Approval lifecycle fully tested. Receipt chain verified." },
];

// ═══════════════════════════════════════════════════════════════
// Aggregate helpers
// ═══════════════════════════════════════════════════════════════

export function getRealityDistribution(): Record<RealityState, number> {
  const dist: Record<RealityState, number> = { presentational: 0, simulated: 0, persisted: 0, proven: 0 };
  FEATURE_REALITY_MATRIX.forEach(f => dist[f.realityState]++);
  return dist;
}

export function getDomainRealityRollups(): { domain: string; total: number; presentational: number; simulated: number; persisted: number; proven: number; healthPct: number }[] {
  const map = new Map<string, { total: number; presentational: number; simulated: number; persisted: number; proven: number }>();
  FEATURE_REALITY_MATRIX.forEach(f => {
    const d = map.get(f.domain) || { total: 0, presentational: 0, simulated: 0, persisted: 0, proven: 0 };
    d.total++;
    d[f.realityState]++;
    map.set(f.domain, d);
  });
  return Array.from(map.entries()).map(([domain, d]) => ({
    domain, ...d,
    healthPct: d.total > 0 ? Math.round(((d.persisted + d.proven) / d.total) * 100) : 0,
  })).sort((a, b) => a.healthPct - b.healthPct);
}

export function getMockReplacementProgress(): { total: number; done: number; p0Remaining: number; byStatus: Record<MigrationStatus, number> } {
  const total = REPLACEMENT_PROGRAM.length;
  const done = REPLACEMENT_PROGRAM.filter(m => m.done).length;
  const p0Remaining = REPLACEMENT_PROGRAM.filter(m => !m.done && m.migrationPriority === "P0").length;
  const byStatus: Record<MigrationStatus, number> = { identified: 0, planned: 0, in_progress: 0, blocked: 0, completed: 0, validated: 0 };
  REPLACEMENT_PROGRAM.forEach(m => byStatus[m.migrationStatus]++);
  return { total, done, p0Remaining, byStatus };
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

export function getMockSourceStats(): { total: number; forbidden: number; critical: number; totalUsage: number } {
  return {
    total: SOURCE_INVENTORY.length,
    forbidden: SOURCE_INVENTORY.filter(s => s.forbidden).length,
    critical: SOURCE_INVENTORY.filter(s => s.criticality === "critical").length,
    totalUsage: SOURCE_INVENTORY.reduce((sum, s) => sum + s.usageCount, 0),
  };
}

export function getContractReadinessStats(): { total: number; fullyReady: number; partiallyReady: number; notReady: number } {
  return {
    total: CONTRACT_READINESS.length,
    fullyReady: CONTRACT_READINESS.filter(c => c.contractExists && c.endpointExists && c.schemaExists && c.queryReady && c.mutationReady).length,
    partiallyReady: CONTRACT_READINESS.filter(c => c.contractExists && !c.mutationReady).length,
    notReady: CONTRACT_READINESS.filter(c => !c.contractExists).length,
  };
}

export function getRouteHeatmapData(): { domain: string; routes: { route: string; name: string; state: RealityState; criticality: LaunchCriticality; hasMock: boolean }[] }[] {
  const map = new Map<string, { route: string; name: string; state: RealityState; criticality: LaunchCriticality; hasMock: boolean }[]>();
  FEATURE_REALITY_MATRIX.forEach(f => {
    const existing = map.get(f.domain) || [];
    existing.push({ route: f.route, name: f.name, state: f.realityState, criticality: f.launchCriticality, hasMock: f.hasMockBacking });
    map.set(f.domain, existing);
  });
  return Array.from(map.entries()).map(([domain, routes]) => ({ domain, routes }));
}

export function getFeatureById(id: string): FeatureRealityRecord | undefined {
  return FEATURE_REALITY_MATRIX.find(f => f.id === id);
}

export function getMockReplacementsForFeature(featureId: string): MockReplacementRecord[] {
  const feature = FEATURE_REALITY_MATRIX.find(f => f.id === featureId);
  if (!feature) return [];
  return REPLACEMENT_PROGRAM.filter(m => m.route === feature.route || m.domain === feature.domain);
}

export function getProgressTimeline(): { date: string; event: string; type: "transition" | "milestone" | "migration"; detail: string }[] {
  const events: { date: string; event: string; type: "transition" | "milestone" | "migration"; detail: string }[] = [];

  REALITY_TRANSITIONS.forEach(t => {
    events.push({ date: t.transitionDate, event: `${t.featureName}: ${t.fromState} → ${t.toState}`, type: "transition", detail: t.evidence });
  });

  events.push({ date: "2026-01-15", event: "Reality Conversion Program launched", type: "milestone", detail: "Classification system deployed across all domains" });
  events.push({ date: "2026-02-01", event: "Mock Source Inventory completed", type: "milestone", detail: "15 mock sources identified and classified" });
  events.push({ date: "2026-04-01", event: "Wave 1 migration started", type: "migration", detail: "Auth, Files, Approvals targeted for full persistence" });

  return events.sort((a, b) => a.date.localeCompare(b.date));
}

export function getOverviewStats() {
  const dist = getRealityDistribution();
  const progress = getMockReplacementProgress();
  const serviceHealth = getCoreServiceHealth();
  const launchSummary = getLaunchHonestySummary();
  const runtimeSummary = getRuntimeTruthSummary();
  const sourceStats = getMockSourceStats();
  const contractStats = getContractReadinessStats();

  return {
    totalFeatures: FEATURE_REALITY_MATRIX.length,
    distribution: dist,
    progress,
    serviceHealth,
    launchSummary,
    runtimeSummary,
    sourceStats,
    contractStats,
    topSimulatedDomains: getDomainRealityRollups().filter(d => d.healthPct < 50),
    recentTransitions: REALITY_TRANSITIONS.slice(-3),
    launchBlockers: FEATURE_REALITY_MATRIX.filter(f => f.launchCriticality === "P0" && f.hasMockBacking),
  };
}
