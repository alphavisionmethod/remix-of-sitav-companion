import { supabase } from "@/integrations/supabase/client";
import {
  mockAdvisors, mockRecommendations, mockSynthesis, mockApprovals, mockProofHistory,
  mockMissions, mockAgents, mockMetrics, mockDebates, type AdvisorProfile,
  type AdvisorRecommendation, type SynthesisRecord, type ApprovalItem, type ProofRecord,
} from "@/lib/mock-data/advisor-mission-control";

export type { AdvisorProfile, AdvisorRecommendation, SynthesisRecord, ApprovalItem, ProofRecord };

export async function fetchAdvisorProfiles(): Promise<AdvisorProfile[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return mockAdvisors;

  const { data, error } = await supabase.from("advisor_registry").select("*").eq("user_id", user.id).eq("active", true);
  if (error || !data || data.length === 0) return mockAdvisors;

  return data.map((a: any) => ({
    id: a.id, name: a.display_name, domain: a.domain, type: a.advisor_type,
    trustLevel: a.trust_threshold >= 0.8 ? "high" : a.trust_threshold >= 0.5 ? "medium" : "low",
    status: a.active ? "active" : "inactive", avatar: undefined,
    specialties: Array.isArray(a.capabilities) ? a.capabilities.map((c: any) => typeof c === "string" ? c : c.name || "") : [],
  }));
}

export async function fetchRecommendations(): Promise<AdvisorRecommendation[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return mockRecommendations;

  const { data, error } = await supabase.from("advisor_responses").select("*, advisor_requests(intent, context)").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20);
  if (error || !data || data.length === 0) return mockRecommendations;

  return data.map((r: any) => ({
    id: r.id, advisorId: r.request_id, title: r.advisor_requests?.intent || "Recommendation",
    recommendation: r.recommendation || "", confidence: r.confidence || 0.5,
    actions: Array.isArray(r.actions) ? r.actions : [], reasoning: r.reasoning || "",
    createdAt: r.created_at, status: "pending",
  }));
}

export async function fetchSynthesis(): Promise<SynthesisRecord[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return mockSynthesis;

  const { data, error } = await supabase.from("chief_synthesis_records").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10);
  if (error || !data || data.length === 0) return mockSynthesis;

  return data.map((s: any) => ({
    id: s.id, ownerType: s.owner_type, strongestRisk: s.strongest_risk,
    strongestOpportunity: s.strongest_opportunity, recommendedNextStep: s.recommended_next_step,
    alignedViews: s.aligned_views || [], divergentViews: s.divergent_views || [],
    confidenceSummary: s.confidence_summary || {}, createdAt: s.created_at,
  }));
}

export async function fetchApprovals(): Promise<ApprovalItem[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return mockApprovals;

  const { data, error } = await supabase.from("approval_queue").select("*").eq("user_id", user.id).eq("status", "pending").order("created_at", { ascending: false });
  if (error || !data || data.length === 0) return mockApprovals;

  return data.map((a: any) => ({
    id: a.id, title: a.action_summary, type: a.action_type || "action",
    urgency: "medium", requestedAt: a.created_at, summary: a.action_summary,
    status: a.status,
  }));
}

export async function fetchProofHistory(): Promise<ProofRecord[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return mockProofHistory;

  const { data, error } = await supabase.from("platform_proof_chains").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20);
  if (error || !data || data.length === 0) return mockProofHistory;

  return data.map((p: any) => ({
    id: p.id, type: p.proof_type || "receipt", title: p.proof_type || "Proof",
    status: p.status || "verified", timestamp: p.created_at,
    domain: p.domain || "System", hash: p.proof_hash,
  }));
}

export { mockMissions, mockAgents, mockMetrics, mockDebates };
