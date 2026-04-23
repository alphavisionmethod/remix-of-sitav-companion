import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
export async function fetchMobileAlerts() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [] as any[];

  const { data, error } = await fromTable("notifications_queue").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20);
  if (error || !data || data.length === 0) return [] as any[];

  return data.map((n: any) => ({
    id: n.id, severity: (n.urgency === "critical" ? "critical" : n.urgency === "high" ? "urgent" : n.urgency === "normal" ? "warning" : "info") as "critical" | "urgent" | "warning" | "info",
    title: n.title, message: n.body || "", domain: n.category || "general",
    createdAt: n.created_at, read: n.status === "read",
  }));
}

export async function fetchMobileApprovals() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [] as any[];

  const { data, error } = await fromTable("approval_queue").select("*").eq("user_id", user.id).eq("status", "pending").order("created_at", { ascending: false });
  if (error || !data || data.length === 0) return [] as any[];

  return data.map((a: any) => ({
    id: a.id, title: a.action_summary, domain: a.action_type || "general",
    urgency: "medium" as const, requestedAt: a.created_at,
    summary: a.action_summary, amountCents: undefined,
  }));
}

export async function fetchMobileProofs() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [] as any[];

  const { data, error } = await fromTable("platform_proof_chains").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20);
  if (error || !data || data.length === 0) return [] as any[];

  return data.map((p: any) => ({
    id: p.id, type: "receipt" as const, title: p.proof_type || "Proof",
    status: p.status === "verified" ? "verified" as const : "pending" as const,
    timestamp: p.created_at, domain: p.domain || "System", hash: p.proof_hash,
  }));
}

export async function fetchMobileWorkflowSteps() {
  // Workflow steps are contextual - use mock as default
  return [] as any[];
}
