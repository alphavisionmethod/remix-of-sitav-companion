// ═══════════════════════════════════════════════════════════════
// SITA OS — Flagship Loop Service
// Seeds and manages the 5 flagship product loops
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

export interface FlagshipLoopSeed {
  loop_key: string;
  title: string;
  owner: string;
  target_persona: string;
  routes: string[];
  capabilities: string[];
  primary_services: string[];
  cj_entries: string[];
  launch_blockers: string[];
  proof_status: string;
  ux_quality: string;
  launch_claim_status: string;
  demo_vs_real: string;
  // v5 extended fields
  description?: string;
  primary_persona?: string;
  launch_importance?: string;
  status?: string;
  owner_team?: string;
  ux_quality_target?: string;
  proof_required?: boolean;
  launch_honesty_class?: string;
}

export const FLAGSHIP_LOOP_SEEDS: FlagshipLoopSeed[] = [
  {
    loop_key: "sign-in-dashboard-pulse",
    title: "Sign In → Dashboard → Pulse",
    owner: "platform",
    target_persona: "user",
    routes: ["/login", "/signup", "/", "/daily-pulse"],
    capabilities: ["auth.email_password", "auth.google_oauth", "dashboard.pulse_render", "dashboard.summary_cards"],
    primary_services: ["auth-service", "dashboard-service", "pulse-service"],
    cj_entries: ["auth.sign_in", "auth.sign_up", "auth.logout", "dashboard.daily_pulse_view"],
    launch_blockers: ["auth_supabase_configured", "dashboard_renders_real_data"],
    proof_status: "partial",
    ux_quality: "beta",
    launch_claim_status: "claimable_with_qualifier",
    demo_vs_real: "mostly_real",
    description: "A user can authenticate, land in the product, and immediately feel the OS is alive, truthful, and useful.",
    primary_persona: "user",
    launch_importance: "launch_critical",
    status: "active",
    owner_team: "platform",
    ux_quality_target: "production",
    proof_required: true,
    launch_honesty_class: "claimable_with_qualifier",
  },
  {
    loop_key: "files-ai-assist",
    title: "Files → AI Assistance → Results",
    owner: "platform",
    target_persona: "user",
    routes: ["/files", "/advisor"],
    capabilities: ["files.upload", "files.browse", "ai.assistant_chat", "ai.document_analysis"],
    primary_services: ["file-service", "ai-gateway-service", "assistant-service"],
    cj_entries: ["files.upload_document", "files.browse_files", "assistant.send_message"],
    launch_blockers: ["storage_bucket_configured", "ai_provider_active"],
    proof_status: "partial",
    ux_quality: "beta",
    launch_claim_status: "claimable_with_qualifier",
    demo_vs_real: "hybrid",
    description: "A user can upload/access files and use AI help around them.",
    primary_persona: "user",
    launch_importance: "launch_critical",
    status: "needs_proof",
    owner_team: "platform",
    ux_quality_target: "production",
    proof_required: true,
    launch_honesty_class: "claimable_with_qualifier",
  },
  {
    loop_key: "boardroom-summary-decision",
    title: "Boardroom → Synthesis → Decision",
    owner: "platform",
    target_persona: "user",
    routes: ["/boardroom", "/boardroom/replay"],
    capabilities: ["boardroom.summary_generation", "boardroom.decision_tracking", "ai.strategic_synthesis"],
    primary_services: ["boardroom-service", "ai-gateway-service", "recommendation-service"],
    cj_entries: ["boardroom.open_session", "boardroom.review_recommendation"],
    launch_blockers: ["ai_provider_active", "boardroom_data_populated"],
    proof_status: "partial",
    ux_quality: "beta",
    launch_claim_status: "claimable_with_qualifier",
    demo_vs_real: "hybrid",
    description: "A user can open boardroom, receive strategic synthesis, and move toward a decision or action.",
    primary_persona: "user",
    launch_importance: "launch_critical",
    status: "needs_polish",
    owner_team: "platform",
    ux_quality_target: "production",
    proof_required: true,
    launch_honesty_class: "claimable_with_qualifier",
  },
  {
    loop_key: "connected-services-sync",
    title: "Connected Services → Connect → Health",
    owner: "platform",
    target_persona: "user",
    routes: ["/connector-hub", "/settings/google-accounts"],
    capabilities: ["connectors.google_drive", "connectors.oauth_flow", "connectors.health_check"],
    primary_services: ["connector-service", "oauth-service", "connector-health-service"],
    cj_entries: ["connectors.google_drive_connect", "connectors.google_drive_reauth_primary", "connectors.google_drive_disconnect_primary"],
    launch_blockers: ["google_oauth_client_configured", "connector_health_edge_function"],
    proof_status: "partial",
    ux_quality: "beta",
    launch_claim_status: "not_claimable",
    demo_vs_real: "mostly_demo",
    description: "A user can connect at least one real service (Google Drive first) and understand connection health.",
    primary_persona: "user",
    launch_importance: "important_to_launch",
    status: "active",
    owner_team: "platform",
    ux_quality_target: "beta",
    proof_required: true,
    launch_honesty_class: "not_claimable",
  },
  {
    loop_key: "admin-truth-recommendation-approval",
    title: "Admin Truth → Recommendation → Approval → Execute",
    owner: "platform",
    target_persona: "operator",
    routes: ["/admin/dashboard", "/admin/truth-registry", "/admin/ai-workforce"],
    capabilities: ["admin.truth_inspection", "admin.recommendation_review", "admin.approval_queue", "admin.execution_binding"],
    primary_services: ["admin-truth-service", "recommendation-loop-service", "approval-service"],
    cj_entries: ["admin.recommendation_approve_bind_execute", "admin.flagship_loop_inspect", "admin.outcome_verification_review"],
    launch_blockers: ["recommendation_lifecycle_wired", "approval_queue_functional"],
    proof_status: "partial",
    ux_quality: "beta",
    launch_claim_status: "internal_only",
    demo_vs_real: "mostly_real",
  },
];

export async function seedFlagshipLoops() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const results: Array<{ loop_key: string; status: string }> = [];

  for (const seed of FLAGSHIP_LOOP_SEEDS) {
    const { data: existing } = await (supabase as any)
      .from("flagship_loops")
      .select("id")
      .eq("loop_key", seed.loop_key)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) {
      results.push({ loop_key: seed.loop_key, status: "exists" });
      continue;
    }

    const { error } = await (supabase as any)
      .from("flagship_loops")
      .insert({ ...seed, user_id: user.id });

    results.push({ loop_key: seed.loop_key, status: error ? `error: ${error.message}` : "seeded" });
  }

  return results;
}

export async function fetchFlagshipLoops() {
  const { data, error } = await (supabase as any)
    .from("flagship_loops")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function updateFlagshipLoop(id: string, updates: Partial<FlagshipLoopSeed>) {
  const { error } = await (supabase as any)
    .from("flagship_loops")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}
