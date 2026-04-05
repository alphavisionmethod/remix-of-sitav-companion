// SITA OS — Owner Data Service (Mode-Aware)
import { supabase } from "@/integrations/supabase/client";
import type { RealityModeKey } from "@/lib/dual-reality/reality-mode-registry";
import { resolveByMode, type ModeAwareResult } from "@/lib/hooks/useRealityProvider";

export interface OwnerApprovalItem {
  id: string; title: string; domain: string; requestedBy: string;
  riskTier: string; status: "pending" | "approved" | "rejected"; requestedAt: string;
}
export interface OwnerPricingItem {
  id: string; name: string; price: number; currency: string;
  category: string; status: string; lastUpdated: string;
}
export interface LeaseItem {
  id: string; tenant: string; unit: string; rent: number;
  start_date: string; end_date: string; status: string;
}

const DEMO_APPROVALS: OwnerApprovalItem[] = [
  { id: "a1", title: "Rebalance tech allocation to 35%", domain: "investment", requestedBy: "SITA Advisor", riskTier: "medium", status: "pending", requestedAt: "2026-04-04T10:00:00Z" },
  { id: "a2", title: "Execute Q2 tax harvesting strategy", domain: "money", requestedBy: "Tax Engine", riskTier: "low", status: "pending", requestedAt: "2026-04-03T14:00:00Z" },
  { id: "a3", title: "Send partnership agreement to Atlas Corp", domain: "business", requestedBy: "You", riskTier: "high", status: "pending", requestedAt: "2026-04-02T09:00:00Z" },
];
const DEMO_PRICING: OwnerPricingItem[] = [
  { id: "pr1", name: "Platform License — Standard", price: 2400, currency: "USD", category: "subscription", status: "active", lastUpdated: "2026-03-15" },
  { id: "pr2", name: "Consulting Retainer", price: 5000, currency: "USD", category: "service", status: "active", lastUpdated: "2026-04-01" },
];
const DEMO_LEASES: LeaseItem[] = [
  { id: "l1", tenant: "TechHub Co", unit: "Suite 401", rent: 4200, start_date: "2025-01-01", end_date: "2027-12-31", status: "active" },
  { id: "l2", tenant: "Design Studio", unit: "Suite 102", rent: 2800, start_date: "2025-06-01", end_date: "2026-05-31", status: "active" },
];

export async function fetchLeases(mode: RealityModeKey = "real"): Promise<ModeAwareResult<LeaseItem[]>> {
  if (mode !== "real") return resolveByMode({ mode, realData: null, demoData: DEMO_LEASES, emptyDefault: [] });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return resolveByMode({ mode, realData: null, demoData: DEMO_LEASES, emptyDefault: [] });
  const { data, error } = await supabase.from("deals").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
  const mapped = (!error && data && data.length > 0) ? data.map((d: any): LeaseItem => ({
    id: d.id, tenant: d.title || "Unknown", unit: d.stage || "N/A",
    rent: Number(d.value || 0), start_date: d.created_at,
    end_date: d.expected_close_date || d.created_at, status: d.status || "active",
  })) : null;
  return resolveByMode({ mode, realData: mapped, demoData: DEMO_LEASES, emptyDefault: [] });
}

export async function fetchOwnerApprovals(mode: RealityModeKey = "real"): Promise<ModeAwareResult<OwnerApprovalItem[]>> {
  if (mode !== "real") return resolveByMode({ mode, realData: null, demoData: DEMO_APPROVALS, emptyDefault: [] });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return resolveByMode({ mode, realData: null, demoData: DEMO_APPROVALS, emptyDefault: [] });
  const { data, error } = await supabase.from("approval_queue").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
  const mapped = (!error && data && data.length > 0) ? data.map((a: any): OwnerApprovalItem => ({
    id: a.id, title: a.action_summary, domain: a.action_type || "general",
    requestedBy: a.requested_by || "System", riskTier: "medium", status: a.status as any, requestedAt: a.created_at,
  })) : null;
  return resolveByMode({ mode, realData: mapped, demoData: DEMO_APPROVALS, emptyDefault: [] });
}

export async function fetchPricingItems(mode: RealityModeKey = "real"): Promise<ModeAwareResult<OwnerPricingItem[]>> {
  return resolveByMode({ mode, realData: null, demoData: DEMO_PRICING, emptyDefault: [] });
}
