// ═══════════════════════════════════════════════════════════════
// SITA OS — Launch Gate Service
// Feature-level launch readiness with honest gate checks
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
const db = supabase as any;

export type LaunchStatus = "live" | "beta" | "demo_only" | "scaffold" | "unavailable";
export type HonestyClass = "truthful" | "demo_backed" | "scaffold" | "unavailable";

export interface LaunchGateRecord {
  id: string;
  feature_key: string;
  feature_name: string;
  domain: string;
  status: LaunchStatus;
  honesty_class: HonestyClass;
  has_real_backend: boolean;
  has_real_data: boolean;
  has_real_auth: boolean;
  has_tests: boolean;
  has_error_handling: boolean;
  demo_available: boolean;
  gate_score: number;
  blockers: string[];
  evidence: Record<string, unknown>;
  last_verified_at: string | null;
  notes: string | null;
}

export interface GateCheckRecord {
  id: string;
  gate_id: string;
  check_name: string;
  check_type: string;
  passed: boolean;
  evidence: string | null;
  checked_at: string;
  checked_by: string;
}

export async function getLaunchGates(): Promise<LaunchGateRecord[]> {
  const { data, error } = await db.from("launch_gates")
    .select("*")
    .order("domain");

  if (error) {
    console.error("[LaunchGate] Error:", error);
    return [];
  }
  return (data ?? []).map(d => ({
    id: d.id,
    feature_key: d.feature_key ?? d.name ?? "",
    feature_name: d.feature_name ?? d.name ?? "",
    domain: d.domain ?? "general",
    status: (d.status ?? d.state ?? "scaffold") as LaunchStatus,
    honesty_class: (d.honesty_class ?? "scaffold") as HonestyClass,
    has_real_backend: d.has_real_backend ?? false,
    has_real_data: d.has_real_data ?? false,
    has_real_auth: d.has_real_auth ?? false,
    has_tests: d.has_tests ?? false,
    has_error_handling: d.has_error_handling ?? false,
    demo_available: d.demo_available ?? false,
    gate_score: d.gate_score ?? 0,
    blockers: d.blockers ?? [],
    evidence: (d.evidence ?? {}) as Record<string, unknown>,
    last_verified_at: d.last_verified_at,
    notes: d.notes,
  }));
}

export async function getGateChecks(gateId: string): Promise<GateCheckRecord[]> {
  const { data, error } = await db.from("launch_gate_checks")
    .select("*")
    .eq("gate_id", gateId)
    .order("checked_at", { ascending: false });

  if (error) {
    console.error("[LaunchGate] Checks error:", error);
    return [];
  }
  return (data ?? []) as never as GateCheckRecord[];
}

export function calculateGateScore(gate: Partial<LaunchGateRecord>): number {
  let score = 0;
  if (gate.has_real_backend) score += 20;
  if (gate.has_real_data) score += 20;
  if (gate.has_real_auth) score += 15;
  if (gate.has_tests) score += 15;
  if (gate.has_error_handling) score += 15;
  if (gate.demo_available) score += 5;
  if (!gate.blockers?.length) score += 10;
  return Math.min(score, 100);
}

export function deriveHonestyClass(gate: Partial<LaunchGateRecord>): HonestyClass {
  const score = calculateGateScore(gate);
  if (score >= 85) return "truthful";
  if (score >= 50 && gate.demo_available) return "demo_backed";
  if (score > 0) return "scaffold";
  return "unavailable";
}

export function getLaunchHonestyIndex(gates: LaunchGateRecord[]): number {
  if (gates.length === 0) return 0;
  const total = gates.reduce((sum, g) => sum + g.gate_score, 0);
  return Math.round(total / gates.length);
}

