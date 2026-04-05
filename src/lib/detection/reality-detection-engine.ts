// ═══════════════════════════════════════════════════════════════
// SITA OS — Reality Detection Engine
// Identifies mock usage, hardcoded data, missing persistence,
// contract gaps, and runtime evidence absence across the platform.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

// ── Detection Types ──

export interface MockImportDetection {
  id: string;
  filePath: string;
  importSource: string;
  mockType: "mock-data-folder" | "hardcoded-array" | "localStorage" | "in-memory-service" | "demo-flow";
  severity: "critical" | "high" | "medium" | "low";
  domain: string;
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
  mockImports: MockImportDetection[];
  persistenceGaps: PersistenceGapDetection[];
  contractGaps: ContractGapDetection[];
  runtimeEvidenceGaps: RuntimeEvidenceGap[];
  formGaps: FormSubmissionGap[];
  summary: {
    totalDetections: number;
    criticalCount: number;
    highCount: number;
    mockImportCount: number;
    persistenceGapCount: number;
    contractGapCount: number;
    runtimeGapCount: number;
    formGapCount: number;
  };
}

// ── Known Mock Sources (static registry) ──

const KNOWN_MOCK_SOURCES: Array<{ path: string; pages: string[]; domain: string; severity: MockImportDetection["severity"] }> = [
  { path: "src/lib/mock-data/investment.ts", pages: ["/money/investment-office"], domain: "investment", severity: "critical" },
  { path: "src/lib/mock-data/customers.ts", pages: ["/business/customers"], domain: "business", severity: "high" },
  { path: "src/lib/mock-data/owner.ts", pages: ["/owner/leases", "/owner/approvals", "/owner/pricing"], domain: "owner", severity: "high" },
  { path: "src/lib/mock-data/files.ts", pages: ["/files/overview", "/files/processing", "/files/search"], domain: "files", severity: "medium" },
  { path: "src/lib/mock-data/workspace.ts", pages: ["/workspace/docs", "/workspace/sheets", "/workspace/slides"], domain: "workspace", severity: "medium" },
  { path: "src/lib/mock-data/reserves.ts", pages: ["/money/reserves"], domain: "money", severity: "high" },
  { path: "src/lib/mock-data/mobile.ts", pages: ["/mobile/alerts", "/mobile/approvals", "/mobile/proof"], domain: "mobile", severity: "medium" },
  { path: "src/lib/mock-data/calendar.ts", pages: ["/concierge/calendar"], domain: "concierge", severity: "low" },
  { path: "src/lib/mock-data/inbox.ts", pages: ["/inbox"], domain: "activity", severity: "medium" },
  { path: "src/lib/mock-data/revenue-autopilot.ts", pages: ["/business/revenue-autopilot"], domain: "business", severity: "high" },
  { path: "src/lib/mock-data/advisor-mission-control.ts", pages: ["/mission-control"], domain: "advisors", severity: "high" },
];

// ── Known In-Memory Services ──

const KNOWN_MEMORY_SERVICES: PersistenceGapDetection[] = [
  { id: "svc-eventbus", serviceName: "EventBus", currentBacking: "memory-only", affectedDomains: ["system", "all"], stateLossSeverity: "high", persistenceTarget: "agent_signals", detectedAt: new Date().toISOString() },
  { id: "svc-memory", serviceName: "MemoryService", currentBacking: "memory-only", affectedDomains: ["advisors", "mission-control"], stateLossSeverity: "high", persistenceTarget: "advisor_memories", detectedAt: new Date().toISOString() },
  { id: "svc-policy", serviceName: "PolicyEngine", currentBacking: "memory-only", affectedDomains: ["owner", "approvals"], stateLossSeverity: "critical", persistenceTarget: "owner_policies", detectedAt: new Date().toISOString() },
  { id: "svc-setup", serviceName: "SetupPersistence", currentBacking: "localStorage", affectedDomains: ["onboarding"], stateLossSeverity: "medium", persistenceTarget: "user_preferences", detectedAt: new Date().toISOString() },
  { id: "svc-invest", serviceName: "InvestmentEngine", currentBacking: "memory-only", affectedDomains: ["investment", "money"], stateLossSeverity: "high", persistenceTarget: "positions + allocations", detectedAt: new Date().toISOString() },
  { id: "svc-revenue", serviceName: "RevenueEngine", currentBacking: "memory-only", affectedDomains: ["business", "revenue"], stateLossSeverity: "high", persistenceTarget: "invoices + leakage", detectedAt: new Date().toISOString() },
  { id: "svc-compute", serviceName: "ComputeGovernance", currentBacking: "memory-only", affectedDomains: ["ai", "compute"], stateLossSeverity: "medium", persistenceTarget: "compute_budget_snapshots", detectedAt: new Date().toISOString() },
  { id: "svc-agent", serviceName: "AgentOrchestration", currentBacking: "hybrid", affectedDomains: ["agents", "mission-control"], stateLossSeverity: "critical", persistenceTarget: "agent_* tables", detectedAt: new Date().toISOString() },
];

// ── Detection Functions ──

export function detectMockImports(): MockImportDetection[] {
  const now = new Date().toISOString();
  return KNOWN_MOCK_SOURCES.map((src, i) => ({
    id: `mock-import-${i}`,
    filePath: src.path,
    importSource: src.path,
    mockType: "mock-data-folder" as const,
    severity: src.severity,
    domain: src.domain,
    detectedAt: now,
  }));
}

export function detectPersistenceGaps(): PersistenceGapDetection[] {
  return KNOWN_MEMORY_SERVICES;
}

export async function detectContractGaps(): Promise<ContractGapDetection[]> {
  try {
    const { data, error } = await supabase.from("reality_classifications").select("*");
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
    const { data, error } = await supabase.from("mock_replacements").select("*");
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
  const mockImports = detectMockImports();
  const persistenceGaps = detectPersistenceGaps();
  const [contractGaps, runtimeEvidenceGaps] = await Promise.all([
    detectContractGaps(),
    detectRuntimeEvidenceGaps(),
  ]);

  const allDetections = [
    ...mockImports.map(d => d.severity),
    ...persistenceGaps.map(d => d.stateLossSeverity),
    ...contractGaps.map(() => "high" as const),
    ...runtimeEvidenceGaps.map(() => "medium" as const),
  ];

  return {
    generatedAt: new Date().toISOString(),
    mockImports,
    persistenceGaps,
    contractGaps,
    runtimeEvidenceGaps,
    formGaps: [], // Extended by runtime probes
    summary: {
      totalDetections: allDetections.length,
      criticalCount: allDetections.filter(s => s === "critical").length,
      highCount: allDetections.filter(s => s === "high").length,
      mockImportCount: mockImports.length,
      persistenceGapCount: persistenceGaps.length,
      contractGapCount: contractGaps.length,
      runtimeGapCount: runtimeEvidenceGaps.length,
      formGapCount: 0,
    },
  };
}
