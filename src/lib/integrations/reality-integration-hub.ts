// ═══════════════════════════════════════════════════════════════
// SITA OS — Reality Integration Hub (Part 10)
// Wires detection results into all operator surfaces and
// connects with existing platform truth/governance systems.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import { fromTable, fromDynamicTable } from "@/lib/supabase-helpers";
import { runFullDetection, type DetectionReport } from "@/lib/detection/reality-detection-engine";
import type {
  LaunchHonestyRecord,
  RouteRealityRecord,
  CoreServiceRealityRecord,
} from "@/lib/reality-records/canonical-records";

// ── Integration Points ──

export interface IntegrationStatus {
  system: string;
  connected: boolean;
  lastSync: string | null;
  dataPoints: number;
}

// ── Route Inventory Integration ──

export async function fetchRouteInventory(): Promise<RouteRealityRecord[]> {
  const { data: classifications } = await fromDynamicTable("reality_classifications").select("*");
  const { data: mockReplacements } = await fromDynamicTable("mock_replacements").select("*");

  if (!classifications) return [];

  const mockPages = new Set((mockReplacements ?? []).map((m: any) => m.page_path));

  return classifications.map((c: any): RouteRealityRecord => ({
    id: c.id,
    routePath: c.route_path,
    domain: c.domain,
    classification: c.classification,
    hasMockImports: mockPages.has(c.route_path) || (c.mock_sources?.length ?? 0) > 0,
    hasRealDataSource: c.classification === "persisted" || c.classification === "proven",
    hasFormSubmission: c.evidence_inputs?.includes("real_mutation_path") ?? false,
    formPersists: c.evidence_inputs?.includes("db_persistence") ?? false,
    launchImpact: c.launch_impact,
    criticality: c.launch_impact === "blocking" ? "critical" : "medium",
    updatedAt: c.updated_at,
  }));
}

// ── Launch Honesty Integration ──

export async function computeLaunchHonesty(): Promise<LaunchHonestyRecord[]> {
  const { data: classifications } = await fromDynamicTable("reality_classifications").select("*");
  const { data: mockReplacements } = await fromDynamicTable("mock_replacements").select("*");

  if (!classifications) return [];

  const domainMap = new Map<string, LaunchHonestyRecord>();

  for (const c of classifications as Array<Record<string, unknown>>) {
    const d = domainMap.get(c.domain as string) ?? {
      id: `lh-${c.domain}`,
      domain: c.domain as string,
      totalFeatures: 0,
      provenCount: 0,
      simulatedCount: 0,
      provenPercentage: 0,
      truthRisk: "low" as const,
      claimSeverity: "safe" as const,
      blockers: [],
      criticalMocksRemaining: 0,
      updatedAt: new Date().toISOString(),
    };
    d.totalFeatures++;
    if (c.classification === "proven") d.provenCount++;
    if (c.classification === "simulated") d.simulatedCount++;
    if (c.launch_impact === "blocking" && c.classification !== "proven") d.blockers.push(c.feature_name as string);
    domainMap.set(c.domain as string, d);
  }

  // Count critical mocks remaining per domain
  for (const m of (mockReplacements ?? []) as never[]) {
    const domain = m.page_path?.split("/")[1] || "root";
    const d = domainMap.get(domain);
    if (d && m.migration_priority === "critical" && m.migration_status !== "validated" && m.migration_status !== "completed") {
      d.criticalMocksRemaining++;
    }
  }

  // Compute derived fields
  for (const d of domainMap.values()) {
    d.provenPercentage = d.totalFeatures > 0 ? Math.round((d.provenCount / d.totalFeatures) * 100) : 0;
    d.truthRisk = d.simulatedCount > d.provenCount ? "high" : d.simulatedCount > 0 ? "medium" : "low";
    d.claimSeverity = d.provenPercentage >= 80 ? "safe" : d.provenPercentage >= 50 ? "caution" : "danger";
  }

  return [...domainMap.values()];
}

// ── Core Service Reality Integration ──

export function getCoreServiceReality(): CoreServiceRealityRecord[] {
  return [
    { id: "svc-eventbus", serviceName: "EventBus", currentBacking: "memory-only", usageDomains: ["system"], persistenceTarget: "agent_signals", stateLossSeverity: "high", migrationStatus: "not_started", owner: "Platform", updatedAt: new Date().toISOString() },
    { id: "svc-memory", serviceName: "MemoryService", currentBacking: "memory-only", usageDomains: ["advisors"], persistenceTarget: "advisor_memories", stateLossSeverity: "high", migrationStatus: "planned", owner: "AI Team", updatedAt: new Date().toISOString() },
    { id: "svc-policy", serviceName: "PolicyEngine", currentBacking: "memory-only", usageDomains: ["owner", "approvals"], persistenceTarget: "owner_policies", stateLossSeverity: "critical", migrationStatus: "not_started", owner: "Platform", updatedAt: new Date().toISOString() },
    { id: "svc-invest", serviceName: "InvestmentEngine", currentBacking: "memory-only", usageDomains: ["investment"], persistenceTarget: "positions", stateLossSeverity: "high", migrationStatus: "not_started", owner: "Finance", updatedAt: new Date().toISOString() },
    { id: "svc-revenue", serviceName: "RevenueEngine", currentBacking: "memory-only", usageDomains: ["business"], persistenceTarget: "invoices", stateLossSeverity: "high", migrationStatus: "in_progress", owner: "Business", updatedAt: new Date().toISOString() },
    { id: "svc-agent", serviceName: "AgentOrchestration", currentBacking: "hybrid", usageDomains: ["agents"], persistenceTarget: "agent_* tables", stateLossSeverity: "critical", migrationStatus: "in_progress", owner: "Platform", updatedAt: new Date().toISOString() },
  ];
}

// ── Integration Status Dashboard ──

export async function getIntegrationStatuses(): Promise<IntegrationStatus[]> {
  const now = new Date().toISOString();

  const [classifications, mockReplacements, auditLogs, incidents] = await Promise.all([
    fromDynamicTable("reality_classifications").select("id", { count: "exact", head: true }),
    fromDynamicTable("mock_replacements").select("id", { count: "exact", head: true }),
    fromDynamicTable("audit_logs").select("id", { count: "exact", head: true }),
    fromDynamicTable("incidents").select("id", { count: "exact", head: true }),
  ]);

  return [
    { system: "Reality Classification Matrix", connected: true, lastSync: now, dataPoints: classifications.count ?? 0 },
    { system: "Mock Replacement Board", connected: true, lastSync: now, dataPoints: mockReplacements.count ?? 0 },
    { system: "Audit & Traceability", connected: true, lastSync: now, dataPoints: auditLogs.count ?? 0 },
    { system: "Incident Command", connected: true, lastSync: now, dataPoints: incidents.count ?? 0 },
    { system: "Contract Registry", connected: (classifications.count ?? 0) > 0, lastSync: now, dataPoints: classifications.count ?? 0 },
    { system: "Edge Function Inventory", connected: true, lastSync: now, dataPoints: 0 },
    { system: "DB/Schema Registry", connected: true, lastSync: now, dataPoints: 0 },
    { system: "Launch Readiness", connected: true, lastSync: now, dataPoints: classifications.count ?? 0 },
    { system: "CI/Static Validation", connected: true, lastSync: null, dataPoints: 0 },
    { system: "Runtime Probes", connected: false, lastSync: null, dataPoints: 0 },
  ];
}

// ── Full Integration Report ──

export async function runIntegrationReport() {
  const [detection, launchHonesty, routeInventory, integrations] = await Promise.all([
    runFullDetection(),
    computeLaunchHonesty(),
    fetchRouteInventory(),
    getIntegrationStatuses(),
  ]);

  return {
    detection,
    launchHonesty,
    routeInventory,
    coreServices: getCoreServiceReality(),
    integrations,
    generatedAt: new Date().toISOString(),
  };
}
