import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
export type { AdvisorSummary, AdvisorRecommendation, MultiAdvisorSynthesis, ApprovalRequest, ProofHistoryItem };

export async function fetchAdvisorProfiles(): Promise<AdvisorSummary[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return advisors;

  const { data, error } = await fromTable("advisor_registry").select("*").eq("user_id", user.id).eq("active", true);
  if (error || !data || data.length === 0) return advisors;

  return data.map((a: any) => ({
    id: a.id, name: a.display_name, domain: a.domain as never,
    mission: "", specialAbility: "", confidence: a.trust_threshold,
    uncertainty: null, topMove: "", pendingApprovals: 0,
    availableSimulations: 0, recentActions: 0, memoryItems: 0,
    status: a.active ? "active" as const : "paused" as const, icon: "🤖",
  }));
}

export async function fetchRecommendations(): Promise<AdvisorRecommendation[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return recommendations;

  const { data, error } = await fromTable("advisor_responses").select("*, advisor_requests(intent, context)").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20);
  if (error || !data || data.length === 0) return recommendations;

  return data.map((r: any) => ({
    id: r.id, advisorId: r.request_id, advisorName: "Advisor",
    title: r.advisor_requests?.intent || "Recommendation",
    description: r.recommendation || "", reasoning: r.reasoning || "",
    confidence: r.confidence || 0.5, impact: "medium" as const,
    urgency: "medium" as const, sources: [], linkedEntities: [],
    requiresApproval: false, canSimulate: false,
    createdAt: r.created_at, category: "general",
  }));
}

export async function fetchSynthesis(): Promise<MultiAdvisorSynthesis[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return synthesis;

  const { data, error } = await fromTable("chief_synthesis_records").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10);
  if (error || !data || data.length === 0) return synthesis;

  return data.map((s: any): MultiAdvisorSynthesis => ({
    id: s.id, title: s.owner_type || "Synthesis",
    participants: Array.isArray(s.aligned_views) ? s.aligned_views.map((v: any) => ({ name: "Advisor", recommendation: String(v), confidence: 0.7 })) : [],
    primaryRecommendation: s.recommended_next_step || "",
    alternatePath: "", disagreements: [], overlap: [],
    assumptions: [], requiresApproval: false, canSimulate: false,
  }));
}

export async function fetchApprovals(): Promise<ApprovalRequest[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return approvals;

  const { data, error } = await fromTable("approval_queue").select("*").eq("user_id", user.id).eq("status", "pending").order("created_at", { ascending: false });
  if (error || !data || data.length === 0) return approvals;

  return data.map((a: any) => ({
    id: a.id, action: a.action_summary, advisors: [],
    reason: a.decision_reason || "", expectedImpact: "",
    ifDelayed: "", riskLevel: "medium" as const,
    policyRule: "", linkedEntities: [], proofWillExist: "",
    createdAt: a.created_at, expiresAt: "",
  }));
}

export async function fetchProofHistory(): Promise<ProofHistoryItem[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return proofHistory;

  const { data, error } = await fromTable("platform_proof_chains").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20);
  if (error || !data || data.length === 0) return proofHistory;

  return data.map((p: any) => ({
    id: p.id, type: "execution" as const, title: p.proof_type || "Proof",
    advisor: "system", outcome: "verified" as const,
    confidence: 0.9, receiptHash: p.proof_hash || "",
    whatChanged: "", createdAt: p.created_at,
  }));
}
