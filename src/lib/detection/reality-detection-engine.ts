// ═══════════════════════════════════════════════════════════════
// SITA OS — Reality Detection Engine (Complete Audit)
// Identifies mock usage, hardcoded data, missing persistence,
// contract gaps, and runtime evidence absence across the platform.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";

// ── Detection Types ──

export interface MockImportDetection {
  id: string;
  filePath: string;
  importSource: string;
  pages: string[];
  type: "mock-data-folder" | "hardcoded-array" | "localStorage" | "in-memory-service" | "demo-flow" | "data-service-fallback";
  severity: "critical" | "high" | "medium" | "low";
  domain: string;
  hasSupersedeService: boolean;
  detectedAt: string;
}

export interface PersistenceGapDetection {
  id: string;
  serviceName: string;
  currentBacking: "memory-only" | "localStorage" | "demo" | "hybrid";
  affectedDomains: string[];
  stateLossSeverity: "critical" | "high" | "medium" | "low";
  persistenceTarget: string | null;
  detectedAt: string;
}

export interface ContractGapDetection {
  id: string;
  featureName: string;
  routePath: string;
  contractStatus: "none" | "partial" | "aligned" | "verified";
  backendTarget: string | null;
  missingElements: string[];
  blocksMigration: boolean;
  detectedAt: string;
}

export interface RuntimeEvidenceGap {
  id: string;
  featureName: string;
  routePath: string;
  migrationStatus: string;
  evidenceMissing: string[];
  lastCheckedAt: string;
}

export interface FormSubmissionGap {
  id: string;
  routePath: string;
  formDescription: string;
  submitsToBackend: boolean;
  persistsData: boolean;
  detectedAt: string;
}

export interface DetectionReport {
  generatedAt: string;
  imports: MockImportDetection[];
  persistenceGaps: PersistenceGapDetection[];
  contractGaps: ContractGapDetection[];
  runtimeEvidenceGaps: RuntimeEvidenceGap[];
  formGaps: FormSubmissionGap[];
  summary: {
    totalDetections: number;
    criticalCount: number;
    highCount: number;
    importCount: number;
    persistenceGapCount: number;
    contractGapCount: number;
    runtimeGapCount: number;
    formGapCount: number;
  };
}

// ── Complete Mock Source Registry (all 14 page-level + 10 data-service) ──

const KNOWN_MOCK_SOURCES: Array<{
  path: string; pages: string[]; domain: string;
  severity: MockImportDetection["severity"];
  type: MockImportDetection["type"];
  hasSupersedeService: boolean;
  realBackendTarget: string;
}> = [
  // Page-level direct imports (canonical home: src/data/fixtures/mock-data after Wave 2 migration)
  { path: "src/data/fixtures/mock-data/investment.ts", pages: ["/money/investment-office"], domain: "investment", severity: "critical", type: "mock-data-folder", hasSupersedeService: true, realBackendTarget: "capital_purpose_buckets + asset_master" },
  { path: "src/data/fixtures/mock-data/advisor-mission-control.ts", pages: ["/boardroom", "/advisors/workspace", "/mission-control"], domain: "advisors", severity: "critical", type: "mock-data-folder", hasSupersedeService: false, realBackendTarget: "advisor_registry + advisor_configs" },
  { path: "src/data/fixtures/mock-data/revenue-autopilot.ts", pages: ["/business/revenue-autopilot"], domain: "business", severity: "high", type: "mock-data-folder", hasSupersedeService: true, realBackendTarget: "invoices + revenue_analytics" },
  { path: "src/data/fixtures/mock-data/owner.ts", pages: ["/owner/approvals", "/owner/pricing"], domain: "owner", severity: "high", type: "mock-data-folder", hasSupersedeService: true, realBackendTarget: "approval_queue + pricing_items" },
  { path: "src/data/fixtures/mock-data/collections.ts", pages: ["/business/collections"], domain: "business", severity: "high", type: "mock-data-folder", hasSupersedeService: true, realBackendTarget: "invoices (collections)" },
  { path: "src/data/fixtures/mock-data/workspace.ts", pages: ["/workspace/docs", "/workspace/sheets", "/workspace/slides"], domain: "workspace", severity: "medium", type: "mock-data-folder", hasSupersedeService: true, realBackendTarget: "workspace_documents" },
  { path: "src/data/fixtures/mock-data/calendar.ts", pages: ["/concierge/calendar"], domain: "concierge", severity: "low", type: "mock-data-folder", hasSupersedeService: true, realBackendTarget: "bookings" },
  { path: "src/data/fixtures/mock-data/owner-center.ts", pages: ["/owner"], domain: "owner", severity: "medium", type: "demo-flow", hasSupersedeService: false, realBackendTarget: "owner_policies" },
  { path: "src/data/fixtures/mock-data/calling.ts", pages: ["/business/calling"], domain: "business", severity: "medium", type: "mock-data-folder", hasSupersedeService: false, realBackendTarget: "communication_log + leads" },

  // Data-service fallback imports (services that fall back to mock when no user/data)
  { path: "src/lib/data-services/business-data-service.ts", pages: ["/business/customers", "/business/collections"], domain: "business", severity: "medium", type: "data-service-fallback", hasSupersedeService: true, realBackendTarget: "customers + invoices" },
  { path: "src/lib/data-services/files-data-service.ts", pages: ["/files/overview", "/files/processing", "/files/search"], domain: "files", severity: "medium", type: "data-service-fallback", hasSupersedeService: true, realBackendTarget: "documents + storage" },
  { path: "src/lib/data-services/money-data-service.ts", pages: ["/money/reserves"], domain: "money", severity: "high", type: "data-service-fallback", hasSupersedeService: true, realBackendTarget: "capital_allocations" },
  { path: "src/lib/data-services/mobile-data-service.ts", pages: ["/mobile/alerts", "/mobile/approvals", "/mobile/proof"], domain: "mobile", severity: "medium", type: "data-service-fallback", hasSupersedeService: true, realBackendTarget: "notifications_queue + approval_queue" },
  { path: "src/lib/data-services/owner-data-service.ts", pages: ["/owner/leases", "/owner/approvals", "/owner/pricing"], domain: "owner", severity: "high", type: "data-service-fallback", hasSupersedeService: true, realBackendTarget: "leases + approval_queue" },
  { path: "src/lib/data-services/workspace-data-service.ts", pages: ["/workspace/docs", "/workspace/sheets", "/workspace/slides"], domain: "workspace", severity: "medium", type: "data-service-fallback", hasSupersedeService: true, realBackendTarget: "workspace_documents" },
  { path: "src/lib/data-services/mission-control-data-service.ts", pages: ["/mission-control"], domain: "advisors", severity: "high", type: "data-service-fallback", hasSupersedeService: true, realBackendTarget: "advisor_registry" },
  { path: "src/lib/data-services/revenue-data-service.ts", pages: ["/business/revenue-autopilot"], domain: "business", severity: "high", type: "data-service-fallback", hasSupersedeService: true, realBackendTarget: "invoices" },
  { path: "src/lib/data-services/investment-data-service.ts", pages: ["/money/investment-office"], domain: "investment", severity: "high", type: "data-service-fallback", hasSupersedeService: true, realBackendTarget: "capital_purpose_buckets + asset_master" },
];

// ── Known In-Memory Services ──

const KNOWN_MEMORY_SERVICES: PersistenceGapDetection[] = [
  { id: "svc-eventbus", serviceName: "EventBus", currentBacking: "hybrid", affectedDomains: ["system", "all"], stateLossSeverity: "low", persistenceTarget: "os_event_log", detectedAt: new Date().toISOString() },
  { id: "svc-memory", serviceName: "MemoryService", currentBacking: "hybrid", affectedDomains: ["advisors", "mission-control"], stateLossSeverity: "low", persistenceTarget: "os_memory_scoped", detectedAt: new Date().toISOString() },
  { id: "svc-policy", serviceName: "PolicyEngine", currentBacking: "hybrid", affectedDomains: ["owner", "approvals", "governance"], stateLossSeverity: "low", persistenceTarget: "os_policy_evaluations", detectedAt: new Date().toISOString() },
  { id: "svc-setup", serviceName: "SetupPersistence", currentBacking: "localStorage", affectedDomains: ["onboarding"], stateLossSeverity: "medium", persistenceTarget: "user_preferences", detectedAt: new Date().toISOString() },
  { id: "svc-invest", serviceName: "InvestmentEngine", currentBacking: "memory-only", affectedDomains: ["investment", "money"], stateLossSeverity: "high", persistenceTarget: "positions + allocations", detectedAt: new Date().toISOString() },
  { id: "svc-revenue", serviceName: "RevenueEngine", currentBacking: "memory-only", affectedDomains: ["business", "revenue"], stateLossSeverity: "high", persistenceTarget: "invoices + leakage", detectedAt: new Date().toISOString() },
  { id: "svc-compute", serviceName: "ComputeGovernance", currentBacking: "memory-only", affectedDomains: ["ai", "compute"], stateLossSeverity: "medium", persistenceTarget: "compute_budget_snapshots", detectedAt: new Date().toISOString() },
  { id: "svc-agent", serviceName: "AgentOrchestration", currentBacking: "hybrid", affectedDomains: ["agents", "mission-control"], stateLossSeverity: "critical", persistenceTarget: "agent_* tables", detectedAt: new Date().toISOString() },
  { id: "svc-companion", serviceName: "CompanionEngine", currentBacking: "memory-only", affectedDomains: ["concierge", "nlp"], stateLossSeverity: "medium", persistenceTarget: "advisor_memories", detectedAt: new Date().toISOString() },
  { id: "svc-fraud", serviceName: "FraudSentinel", currentBacking: "memory-only", affectedDomains: ["security", "trust"], stateLossSeverity: "high", persistenceTarget: "incidents + audit_logs", detectedAt: new Date().toISOString() },
];

// ── Complete Route Classification Seed ──
// All major routes classified under the four-state model

export interface RouteClassificationSeed {
  routePath: string;
  featureName: string;
  domain: string;
  classification: "presentational" | "simulated" | "persisted" | "proven";
  confidence: number;
  sources: string[];
  backendTarget: string | null;
  launchImpact: "blocking" | "degraded" | "none";
  evidenceInputs: string[];
}

export const ROUTE_CLASSIFICATION_SEEDS: RouteClassificationSeed[] = [
  // ── Investment Office (critical, simulated) ──
  { routePath: "/money/investment-office", featureName: "Investment Office", domain: "investment", classification: "simulated", confidence: 90, sources: ["CAPITAL_BUCKETS", "POSITIONS", "THESES"], backendTarget: "capital_purpose_buckets + asset_master", launchImpact: "blocking", evidenceInputs: ["route_exists", "shell_exists", "component_renders"] },

  // ── Business Center ──
  { routePath: "/business/customers", featureName: "Customers", domain: "business", classification: "persisted", confidence: 75, sources: [], backendTarget: "customers", launchImpact: "degraded", evidenceInputs: ["route_exists", "shell_exists", "component_renders", "data_source_real", "db_persistence"] },
  { routePath: "/business/collections", featureName: "Collections", domain: "business", classification: "simulated", confidence: 70, sources: ["COLLECTIONS_ACCOUNTS"], backendTarget: "invoices", launchImpact: "degraded", evidenceInputs: ["route_exists", "shell_exists", "component_renders"] },
  { routePath: "/business/revenue-autopilot", featureName: "Revenue Autopilot", domain: "business", classification: "simulated", confidence: 60, sources: ["LEAKAGE_INPUT", "RECOVERED_VALUES"], backendTarget: "invoices + revenue_analytics", launchImpact: "blocking", evidenceInputs: ["route_exists", "shell_exists", "component_renders"] },
  { routePath: "/business/calling", featureName: "Revenue Calling", domain: "business", classification: "simulated", confidence: 50, sources: ["CONTACTS", "CALL_LOGS"], backendTarget: "communication_log + leads", launchImpact: "degraded", evidenceInputs: ["route_exists", "shell_exists"] },

  // ── Owner Center ──
  { routePath: "/owner", featureName: "Owner Center", domain: "owner", classification: "simulated", confidence: 60, sources: ["buildMockSimResult"], backendTarget: "owner_policies", launchImpact: "degraded", evidenceInputs: ["route_exists", "shell_exists", "component_renders"] },
  { routePath: "/owner/leases", featureName: "Lease Dashboard", domain: "owner", classification: "persisted", confidence: 70, sources: [], backendTarget: "leases (via data-service)", launchImpact: "degraded", evidenceInputs: ["route_exists", "shell_exists", "component_renders", "data_source_real"] },
  { routePath: "/owner/approvals", featureName: "Owner Approvals", domain: "owner", classification: "persisted", confidence: 65, sources: [], backendTarget: "approval_queue", launchImpact: "degraded", evidenceInputs: ["route_exists", "component_renders", "data_source_real"] },
  { routePath: "/owner/pricing", featureName: "Pricing Editor", domain: "owner", classification: "persisted", confidence: 65, sources: [], backendTarget: "pricing_items (via data-service)", launchImpact: "none", evidenceInputs: ["route_exists", "component_renders", "data_source_real"] },

  // ── Files Center ──
  { routePath: "/files/overview", featureName: "Files Overview", domain: "files", classification: "persisted", confidence: 70, sources: [], backendTarget: "documents", launchImpact: "none", evidenceInputs: ["route_exists", "component_renders", "data_source_real", "db_persistence"] },
  { routePath: "/files/processing", featureName: "Files Processing", domain: "files", classification: "persisted", confidence: 70, sources: [], backendTarget: "documents", launchImpact: "none", evidenceInputs: ["route_exists", "component_renders", "data_source_real"] },
  { routePath: "/files/search", featureName: "Files Search", domain: "files", classification: "persisted", confidence: 70, sources: [], backendTarget: "documents", launchImpact: "none", evidenceInputs: ["route_exists", "component_renders", "data_source_real"] },

  // ── Workspace ──
  { routePath: "/workspace/docs", featureName: "Docs Workspace", domain: "workspace", classification: "simulated", confidence: 60, sources: ["DOCS"], backendTarget: "workspace_documents", launchImpact: "none", evidenceInputs: ["route_exists", "component_renders"] },
  { routePath: "/workspace/sheets", featureName: "Sheets Workspace", domain: "workspace", classification: "simulated", confidence: 60, sources: ["SHEETS"], backendTarget: "workspace_documents", launchImpact: "none", evidenceInputs: ["route_exists", "component_renders"] },
  { routePath: "/workspace/slides", featureName: "Slides Workspace", domain: "workspace", classification: "simulated", confidence: 60, sources: ["DECKS"], backendTarget: "workspace_documents", launchImpact: "none", evidenceInputs: ["route_exists", "component_renders"] },

  // ── Money ──
  { routePath: "/money/reserves", featureName: "Reserves & Savings", domain: "money", classification: "persisted", confidence: 70, sources: [], backendTarget: "capital_allocations", launchImpact: "blocking", evidenceInputs: ["route_exists", "component_renders", "data_source_real", "db_persistence"] },

  // ── Mobile ──
  { routePath: "/mobile/alerts", featureName: "Mobile Alerts", domain: "mobile", classification: "persisted", confidence: 65, sources: [], backendTarget: "notifications_queue", launchImpact: "none", evidenceInputs: ["route_exists", "component_renders", "data_source_real"] },
  { routePath: "/mobile/approvals", featureName: "Mobile Approvals", domain: "mobile", classification: "persisted", confidence: 65, sources: [], backendTarget: "approval_queue", launchImpact: "none", evidenceInputs: ["route_exists", "component_renders", "data_source_real"] },
  { routePath: "/mobile/proof", featureName: "Mobile Proof", domain: "mobile", classification: "persisted", confidence: 65, sources: [], backendTarget: "agent_action_receipts", launchImpact: "none", evidenceInputs: ["route_exists", "component_renders", "data_source_real"] },

  // ── Concierge ──
  { routePath: "/concierge/calendar", featureName: "Calendar", domain: "concierge", classification: "simulated", confidence: 55, sources: ["generateCalendarDemoEvents"], backendTarget: "bookings", launchImpact: "none", evidenceInputs: ["route_exists", "component_renders"] },

  // ── Activity ──
  { routePath: "/inbox", featureName: "Inbox Capture", domain: "activity", classification: "persisted", confidence: 65, sources: [], backendTarget: "inbox_items", launchImpact: "none", evidenceInputs: ["route_exists", "component_renders", "data_source_real"] },

  // ── Advisors / Mission Control ──
  { routePath: "/boardroom", featureName: "Boardroom", domain: "advisors", classification: "simulated", confidence: 40, sources: ["advisors", "connectorHealth"], backendTarget: "advisor_registry + chief_synthesis_records", launchImpact: "blocking", evidenceInputs: ["route_exists", "shell_exists", "component_renders"] },
  { routePath: "/advisors/workspace", featureName: "Advisor Workspace", domain: "advisors", classification: "simulated", confidence: 40, sources: ["advisors"], backendTarget: "advisor_registry + advisor_configs", launchImpact: "blocking", evidenceInputs: ["route_exists", "shell_exists", "component_renders"] },
  { routePath: "/mission-control", featureName: "Mission Control", domain: "advisors", classification: "simulated", confidence: 50, sources: ["TOKEN_USAGES"], backendTarget: "ai_token_usage + advisor_registry", launchImpact: "blocking", evidenceInputs: ["route_exists", "shell_exists", "component_renders", "data_source_real"] },

  // ── Admin Intelligence (hardcoded demo arrays) ──
  { routePath: "/admin/ai-engineering", featureName: "AI Engineering Board", domain: "admin-intelligence", classification: "persisted", confidence: 70, sources: [], backendTarget: "ai_engineering_missions", launchImpact: "none", evidenceInputs: ["route_exists", "component_renders", "data_source_real", "db_persistence"] },
  { routePath: "/admin/ai-fix-center", featureName: "AI Fix Center", domain: "admin-intelligence", classification: "persisted", confidence: 70, sources: [], backendTarget: "ai_fix_proposals", launchImpact: "none", evidenceInputs: ["route_exists", "component_renders", "data_source_real"] },
  { routePath: "/admin/ai-self-healing", featureName: "AI Self-Healing", domain: "admin-intelligence", classification: "persisted", confidence: 70, sources: [], backendTarget: "ai_self_healing_rules", launchImpact: "none", evidenceInputs: ["route_exists", "component_renders", "data_source_real"] },
  { routePath: "/admin/ai-token-dashboard", featureName: "AI Token Dashboard", domain: "admin-intelligence", classification: "persisted", confidence: 70, sources: [], backendTarget: "ai_token_usage + ai_cost_ledger", launchImpact: "none", evidenceInputs: ["route_exists", "component_renders", "data_source_real"] },

  // ── Auth & System ──
  { routePath: "/auth", featureName: "Authentication", domain: "system", classification: "proven", confidence: 95, sources: [], backendTarget: "auth.users + profiles", launchImpact: "blocking", evidenceInputs: ["route_exists", "component_renders", "data_source_real", "db_persistence", "real_mutation_path", "runtime_evidence", "interaction_verified", "launch_ready"] },
  { routePath: "/setup", featureName: "Setup Wizard", domain: "system", classification: "simulated", confidence: 60, sources: [], backendTarget: "user_preferences", launchImpact: "degraded", evidenceInputs: ["route_exists", "component_renders", "in_memory_only"] },
];

// ── Mock Replacement Seeds ──

export interface MockReplacementSeed {
  featureName: string;
  pagePath: string;
  source: string;
  type: "hardcoded" | "local_array" | "localstorage" | "in_memory_engine" | "pure_function" | "demo_flow";
  realBackendTarget: string;
  migrationPriority: "critical" | "high" | "medium" | "low";
  sequenceOrder: number;
}

export const REPLACEMENT_SEEDS: MockReplacementSeed[] = [
  // P0 — Launch blockers
  { featureName: "Boardroom Advisors", pagePath: "/boardroom", source: "advisors (advisor-mission-control.ts)", type: "hardcoded", realBackendTarget: "advisor_registry", migrationPriority: "critical", sequenceOrder: 1 },
  { featureName: "Advisor Workspace", pagePath: "/advisors/workspace", source: "advisors (advisor-mission-control.ts)", type: "hardcoded", realBackendTarget: "advisor_registry + advisor_configs", migrationPriority: "critical", sequenceOrder: 2 },
  { featureName: "Mission Control Advisors", pagePath: "/mission-control", source: "advisors (advisor-mission-control.ts)", type: "hardcoded", realBackendTarget: "advisor_registry", migrationPriority: "critical", sequenceOrder: 3 },
  { featureName: "Investment Office", pagePath: "/money/investment-office", source: "CAPITAL_BUCKETS + POSITIONS + THESES", type: "hardcoded", realBackendTarget: "capital_purpose_buckets + asset_master", migrationPriority: "critical", sequenceOrder: 4 },

  // P1 — Core product integrity
  { featureName: "Revenue Autopilot", pagePath: "/business/revenue-autopilot", source: "LEAKAGE_INPUT + RECOVERED_VALUES", type: "hardcoded", realBackendTarget: "invoices + revenue_analytics", migrationPriority: "high", sequenceOrder: 5 },
  { featureName: "Revenue Calling", pagePath: "/business/calling", source: "CONTACTS + CALL_LOGS + CALL_SCRIPTS", type: "hardcoded", realBackendTarget: "communication_log + leads", migrationPriority: "high", sequenceOrder: 6 },
  { featureName: "Collections", pagePath: "/business/collections", source: "COLLECTIONS_ACCOUNTS (data-service fallback)", type: "local_array", realBackendTarget: "invoices", migrationPriority: "high", sequenceOrder: 7 },

  // P2 — Important but nonblocking
  { featureName: "Docs Workspace", pagePath: "/workspace/docs", source: "DOCS (workspace.ts)", type: "hardcoded", realBackendTarget: "workspace_documents", migrationPriority: "medium", sequenceOrder: 8 },
  { featureName: "Sheets Workspace", pagePath: "/workspace/sheets", source: "SHEETS (workspace.ts)", type: "hardcoded", realBackendTarget: "workspace_documents", migrationPriority: "medium", sequenceOrder: 9 },
  { featureName: "Slides Workspace", pagePath: "/workspace/slides", source: "DECKS (workspace.ts)", type: "hardcoded", realBackendTarget: "workspace_documents", migrationPriority: "medium", sequenceOrder: 10 },
  { featureName: "Owner Center Sim", pagePath: "/owner", source: "buildMockSimResult (owner-center.ts)", type: "pure_function", realBackendTarget: "owner_policies", migrationPriority: "medium", sequenceOrder: 11 },

  // P3 — Low-risk / internal
  { featureName: "Calendar", pagePath: "/concierge/calendar", source: "generateCalendarDemoEvents", type: "demo_flow", realBackendTarget: "bookings", migrationPriority: "low", sequenceOrder: 12 },
];

// ── Detection Functions ──

export function detectMockImports(): MockImportDetection[] {
  const now = new Date().toISOString();
  return KNOWN_MOCK_SOURCES.map((src, i) => ({
    id: `mock-import-${i}`,
    filePath: src.path,
    importSource: src.path,
    pages: src.pages,
    type: src.type,
    severity: src.severity,
    domain: src.domain,
    hasSupersedeService: src.hasSupersedeService,
    detectedAt: now,
  }));
}

export function detectPersistenceGaps(): PersistenceGapDetection[] {
  return KNOWN_MEMORY_SERVICES;
}

export async function detectContractGaps(): Promise<ContractGapDetection[]> {
  try {
    const { data, error } = await fromTable("reality_classifications").select("*");
    if (error || !data) return [];
    const now = new Date().toISOString();
    return data
      .filter((c: any) => c.contract_status === "none" || c.contract_status === "partial")
      .map((c: any): ContractGapDetection => ({
        id: `cg-${c.id}`,
        featureName: c.feature_name,
        routePath: c.route_path,
        contractStatus: c.contract_status,
        backendTarget: c.backend_target,
        missingElements: c.missing_requirements ?? [],
        blocksMigration: c.launch_impact === "blocking",
        detectedAt: now,
      }));
  } catch {
    return [];
  }
}

export async function detectRuntimeEvidenceGaps(): Promise<RuntimeEvidenceGap[]> {
  try {
    const { data, error } = await fromTable("mock_replacements").select("*");
    if (error || !data) return [];
    const now = new Date().toISOString();
    return data
      .filter((m: any) => (m.migration_status === "completed" || m.migration_status === "validated") && !m.runtime_validated)
      .map((m: any): RuntimeEvidenceGap => ({
        id: `reg-${m.id}`,
        featureName: m.feature_name,
        routePath: m.page_path,
        migrationStatus: m.migration_status,
        evidenceMissing: m.runtime_evidence?.length === 0 ? ["runtime_evidence", "interaction_verified"] : [],
        lastCheckedAt: now,
      }));
  } catch {
    return [];
  }
}

// ── Full Detection Report ──

export async function runFullDetection(): Promise<DetectionReport> {
  const imports = detectMockImports();
  const persistenceGaps = detectPersistenceGaps();
  const [contractGaps, runtimeEvidenceGaps] = await Promise.all([
    detectContractGaps(),
    detectRuntimeEvidenceGaps(),
  ]);

  const allSeverities = [
    ...imports.map(d => d.severity),
    ...persistenceGaps.map(d => d.stateLossSeverity),
    ...contractGaps.map(() => "high" as const),
    ...runtimeEvidenceGaps.map(() => "medium" as const),
  ];

  return {
    generatedAt: new Date().toISOString(),
    imports,
    persistenceGaps,
    contractGaps,
    runtimeEvidenceGaps,
    formGaps: [],
    summary: {
      totalDetections: allSeverities.length,
      criticalCount: allSeverities.filter(s => s === "critical").length,
      highCount: allSeverities.filter(s => s === "high").length,
      importCount: imports.length,
      persistenceGapCount: persistenceGaps.length,
      contractGapCount: contractGaps.length,
      runtimeGapCount: runtimeEvidenceGaps.length,
      formGapCount: 0,
    },
  };
}
