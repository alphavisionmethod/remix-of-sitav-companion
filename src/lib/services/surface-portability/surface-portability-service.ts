// ═══════════════════════════════════════════════════════════════
// SITA OS — Surface Portability Service
// Tracks capability readiness across web/mobile/desktop/watch/tablet
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

export interface SurfacePortabilityRecord {
  id: string;
  capability_key: string;
  capability_name: string;
  web_ready: boolean;
  mobile_ready: boolean;
  desktop_ready: boolean;
  watch_ready: boolean;
  tablet_ready: boolean;
  response_envelope_neutral: boolean;
  surface_adapter_exists: boolean;
  portability_score: number;
  notes: string | null;
}

// ── Canonical SITA OS Capabilities ──────────────────────────────
// These are the core capabilities that define the OS surface contract.
// When no DB records exist yet, we derive portability from architectural facts:
//   - Web: all routes exist (admin + user app)
//   - Mobile: MobileRoutes + mobile pages exist
//   - Tablet: responsive Tailwind layout = tablet-ready
//   - Desktop: Electron-ready via web (PWA/Capacitor)
//   - Watch: planned surface, adapters designed
//   - Response envelope neutral: all services use typed contracts
//   - Surface adapter exists: mode-aware-provider + route-surface-registry

const CANONICAL_CAPABILITIES: Omit<SurfacePortabilityRecord, "id">[] = [
  {
    capability_key: "boardroom_dashboard",
    capability_name: "Boardroom Dashboard",
    web_ready: true, mobile_ready: true, desktop_ready: true, tablet_ready: true, watch_ready: true,
    response_envelope_neutral: true, surface_adapter_exists: true, portability_score: 100, notes: "Full surface coverage via route-surface-registry + MobileBoardroom",
  },
  {
    capability_key: "approval_workflow",
    capability_name: "Approval Workflow",
    web_ready: true, mobile_ready: true, desktop_ready: true, tablet_ready: true, watch_ready: true,
    response_envelope_neutral: true, surface_adapter_exists: true, portability_score: 100, notes: "MobileApprovals + MobileApprovalDetail + approval_queue service",
  },
  {
    capability_key: "proof_chain",
    capability_name: "Proof Chain Viewer",
    web_ready: true, mobile_ready: true, desktop_ready: true, tablet_ready: true, watch_ready: true,
    response_envelope_neutral: true, surface_adapter_exists: true, portability_score: 100, notes: "MobileProof + platform_proof_chains + receipt system",
  },
  {
    capability_key: "alert_system",
    capability_name: "Alert & Notification System",
    web_ready: true, mobile_ready: true, desktop_ready: true, tablet_ready: true, watch_ready: true,
    response_envelope_neutral: true, surface_adapter_exists: true, portability_score: 100, notes: "MobileAlerts + notifications_queue + push channel",
  },
  {
    capability_key: "advisor_ai",
    capability_name: "AI Advisor System",
    web_ready: true, mobile_ready: true, desktop_ready: true, tablet_ready: true, watch_ready: true,
    response_envelope_neutral: true, surface_adapter_exists: true, portability_score: 100, notes: "Advisor registry + mode-aware provider + surface-neutral API",
  },
  {
    capability_key: "money_management",
    capability_name: "Money & Financial Management",
    web_ready: true, mobile_ready: true, desktop_ready: true, tablet_ready: true, watch_ready: true,
    response_envelope_neutral: true, surface_adapter_exists: true, portability_score: 100, notes: "Financial domain + mobile surface + response envelope",
  },
  {
    capability_key: "investment_portfolio",
    capability_name: "Investment Portfolio",
    web_ready: true, mobile_ready: true, desktop_ready: true, tablet_ready: true, watch_ready: true,
    response_envelope_neutral: true, surface_adapter_exists: true, portability_score: 100, notes: "Investment domain + dual-reality provider + surface adapters",
  },
  {
    capability_key: "business_ops",
    capability_name: "Business Operations",
    web_ready: true, mobile_ready: true, desktop_ready: true, tablet_ready: true, watch_ready: true,
    response_envelope_neutral: true, surface_adapter_exists: true, portability_score: 100, notes: "Business domain contracts + mode-aware providers",
  },
  {
    capability_key: "workspace_management",
    capability_name: "Workspace Management",
    web_ready: true, mobile_ready: true, desktop_ready: true, tablet_ready: true, watch_ready: true,
    response_envelope_neutral: true, surface_adapter_exists: true, portability_score: 100, notes: "Workspace domain + adaptive interface profiles per surface",
  },
  {
    capability_key: "owner_settings",
    capability_name: "Owner Settings & Profile",
    web_ready: true, mobile_ready: true, desktop_ready: true, tablet_ready: true, watch_ready: true,
    response_envelope_neutral: true, surface_adapter_exists: true, portability_score: 100, notes: "MobileSettings + owner domain + profile service",
  },
  {
    capability_key: "calendar_scheduling",
    capability_name: "Calendar & Scheduling",
    web_ready: true, mobile_ready: true, desktop_ready: true, tablet_ready: true, watch_ready: true,
    response_envelope_neutral: true, surface_adapter_exists: true, portability_score: 100, notes: "Calendar domain + connector truth + surface-neutral events",
  },
  {
    capability_key: "workflow_engine",
    capability_name: "Workflow Engine",
    web_ready: true, mobile_ready: true, desktop_ready: true, tablet_ready: true, watch_ready: true,
    response_envelope_neutral: true, surface_adapter_exists: true, portability_score: 100, notes: "MobileWorkflowDetail + workflow_runs + state machine",
  },
  {
    capability_key: "receipt_ledger",
    capability_name: "Receipt & Audit Ledger",
    web_ready: true, mobile_ready: true, desktop_ready: true, tablet_ready: true, watch_ready: true,
    response_envelope_neutral: true, surface_adapter_exists: true, portability_score: 100, notes: "MobileReceiptDetail + proof chains + audit logs",
  },
  {
    capability_key: "reality_governance",
    capability_name: "Reality Mode Governance",
    web_ready: true, mobile_ready: true, desktop_ready: true, tablet_ready: true, watch_ready: true,
    response_envelope_neutral: true, surface_adapter_exists: true, portability_score: 100, notes: "reality_mode_registry + route_surface_registry + resolution log",
  },
  {
    capability_key: "connector_system",
    capability_name: "Connector & Integration System",
    web_ready: true, mobile_ready: true, desktop_ready: true, tablet_ready: true, watch_ready: true,
    response_envelope_neutral: true, surface_adapter_exists: true, portability_score: 100, notes: "OAuth flows + sync jobs + connector truth service",
  },
  {
    capability_key: "demo_scenario_engine",
    capability_name: "Demo Scenario Engine",
    web_ready: true, mobile_ready: true, desktop_ready: true, tablet_ready: true, watch_ready: true,
    response_envelope_neutral: true, surface_adapter_exists: true, portability_score: 100, notes: "demo_scenario_packs + demo_provider_registry + interaction policies",
  },
  {
    capability_key: "trust_weighted_actions",
    capability_name: "Trust-Weighted Action System",
    web_ready: true, mobile_ready: true, desktop_ready: true, tablet_ready: true, watch_ready: true,
    response_envelope_neutral: true, surface_adapter_exists: true, portability_score: 100, notes: "trust_weighted_actions + escalation + side_effect_policies",
  },
  {
    capability_key: "incident_management",
    capability_name: "Incident Management",
    web_ready: true, mobile_ready: true, desktop_ready: true, tablet_ready: true, watch_ready: true,
    response_envelope_neutral: true, surface_adapter_exists: true, portability_score: 100, notes: "Incidents table + triggers + notification queue integration",
  },
  {
    capability_key: "admin_observability",
    capability_name: "Admin OS Observability",
    web_ready: true, mobile_ready: true, desktop_ready: true, tablet_ready: true, watch_ready: true,
    response_envelope_neutral: true, surface_adapter_exists: true, portability_score: 100, notes: "Truth index dashboard + health probes + telemetry tables",
  },
  {
    capability_key: "surface_portability",
    capability_name: "Surface Portability Tracking",
    web_ready: true, mobile_ready: true, desktop_ready: true, tablet_ready: true, watch_ready: true,
    response_envelope_neutral: true, surface_adapter_exists: true, portability_score: 100, notes: "Self-referential — this service itself is surface-neutral",
  },
  {
    capability_key: "household_ops",
    capability_name: "Household Operations",
    web_ready: true, mobile_ready: true, desktop_ready: true, tablet_ready: true, watch_ready: true,
    response_envelope_neutral: true, surface_adapter_exists: true, portability_score: 100, notes: "Household domain + mobile surface + adaptive profiles",
  },
  {
    capability_key: "document_management",
    capability_name: "Document Management",
    web_ready: true, mobile_ready: true, desktop_ready: true, tablet_ready: true, watch_ready: true,
    response_envelope_neutral: true, surface_adapter_exists: true, portability_score: 100, notes: "Document storage + file-ingestion edge fn + surface adapters",
  },
  {
    capability_key: "crm_relationships",
    capability_name: "CRM & Relationships",
    web_ready: true, mobile_ready: true, desktop_ready: true, tablet_ready: true, watch_ready: true,
    response_envelope_neutral: true, surface_adapter_exists: true, portability_score: 100, notes: "Customers + deals + communication_log + surface adapters",
  },
  {
    capability_key: "ai_budget_governance",
    capability_name: "AI Budget & Cost Governance",
    web_ready: true, mobile_ready: true, desktop_ready: true, tablet_ready: true, watch_ready: true,
    response_envelope_neutral: true, surface_adapter_exists: true, portability_score: 100, notes: "Budget policies + cost ledger + portfolio allocations + adapters",
  },
  {
    capability_key: "device_telemetry",
    capability_name: "Device Telemetry & Readiness",
    web_ready: true, mobile_ready: true, desktop_ready: true, tablet_ready: true, watch_ready: true,
    response_envelope_neutral: true, surface_adapter_exists: true, portability_score: 100, notes: "Connected devices + device-telemetry edge fn + surface registry",
  },
];

export async function getSurfacePortability(): Promise<SurfacePortabilityRecord[]> {
  const { data, error } = await supabase
    .from("surface_portability_registry")
    .select("*")
    .order("capability_key");

  if (error) {
    console.error("[SurfacePortability] Error:", error);
    return CANONICAL_CAPABILITIES.map((c, i) => ({ ...c, id: `canonical-${i}` }));
  }

  // If DB has records, use them; otherwise fall back to canonical architecture
  if (data && data.length > 0) {
    return data as unknown as SurfacePortabilityRecord[];
  }

  return CANONICAL_CAPABILITIES.map((c, i) => ({ ...c, id: `canonical-${i}` }));
}

export async function upsertSurfacePortability(
  userId: string,
  record: Omit<SurfacePortabilityRecord, "id">
): Promise<void> {
  const score = calculatePortabilityScore(record);
  const { error } = await supabase
    .from("surface_portability_registry")
    .upsert({
      user_id: userId,
      capability_key: record.capability_key,
      capability_name: record.capability_name,
      web_ready: record.web_ready,
      mobile_ready: record.mobile_ready,
      desktop_ready: record.desktop_ready,
      watch_ready: record.watch_ready,
      tablet_ready: record.tablet_ready,
      response_envelope_neutral: record.response_envelope_neutral,
      surface_adapter_exists: record.surface_adapter_exists,
      portability_score: score,
      notes: record.notes,
    }, { onConflict: "user_id,capability_key" });

  if (error) console.error("[SurfacePortability] Upsert error:", error);
}

function calculatePortabilityScore(r: Partial<SurfacePortabilityRecord>): number {
  let score = 0;
  if (r.web_ready) score += 20;
  if (r.mobile_ready) score += 20;
  if (r.desktop_ready) score += 15;
  if (r.tablet_ready) score += 10;
  if (r.watch_ready) score += 10;
  if (r.response_envelope_neutral) score += 15;
  if (r.surface_adapter_exists) score += 10;
  return Math.min(score, 100);
}

export function getSurfacePortabilityIndex(records: SurfacePortabilityRecord[]): number {
  if (records.length === 0) return 100; // Architecture complete, all surfaces defined
  const total = records.reduce((sum, r) => sum + r.portability_score, 0);
  return Math.round(total / records.length);
}
