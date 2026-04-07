// ═══════════════════════════════════════════════════════════════
// SITA OS — Flagship Loop Service
// Seeds and manages the 5 flagship product loops
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import { fromTable, fromDynamicTable, fromDynamicTable } from "@/lib/supabase-helpers";

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
  description?: string;
  primary_persona?: string;
  launch_importance?: string;
  status?: string;
  owner_team?: string;
  ux_quality_target?: string;
  proof_required?: boolean;
  launch_honesty_class?: string;
  truth_pct?: number;
  structural_score?: number;
  runtime_score?: number;
  proof_score?: number;
  ux_score?: number;
  next_actions?: string[];
}

// ── Truth Score Breakdown ────────────────────────────────────
// Each loop is scored across 4 dimensions (0-100), weighted:
//   structural (25%) + runtime (30%) + proof (25%) + ux (20%) = truth_pct
// ─────────────────────────────────────────────────────────────

export const FLAGSHIP_LOOP_SEEDS: FlagshipLoopSeed[] = [
  {
    loop_key: "sign-in-dashboard-pulse",
    title: "Auth + Dashboard + Pulse",
    owner: "platform",
    target_persona: "user",
    routes: ["/login", "/signup", "/", "/daily-pulse"],
    capabilities: ["auth.email_password", "auth.google_oauth", "dashboard.pulse_render", "dashboard.summary_cards"],
    primary_services: ["auth-service", "dashboard-service", "pulse-service"],
    cj_entries: ["auth.sign_in", "auth.sign_up", "auth.logout", "dashboard.daily_pulse_view"],
    launch_blockers: ["auth_supabase_configured", "dashboard_renders_real_data"],
    proof_status: "partial",
    ux_quality: "production",
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
    truth_pct: 85,
    structural_score: 95,
    runtime_score: 90,
    proof_score: 65,
    ux_score: 88,
    next_actions: [
      "Write Playwright E2E for full sign-in → dashboard → pulse flow",
      "Verify dashboard renders live Supabase data (not demo fallback)",
      "Add error boundary to DailyPulse page",
    ],
  },
  {
    loop_key: "files-ai-assist",
    title: "Files + AI Assist",
    owner: "platform",
    target_persona: "user",
    routes: ["/files", "/advisor"],
    capabilities: ["files.upload", "files.browse", "ai.assistant_chat", "ai.document_analysis"],
    primary_services: ["file-service", "ai-gateway-service", "assistant-service"],
    cj_entries: ["files.upload_document", "files.browse_files", "assistant.send_message"],
    launch_blockers: ["storage_bucket_configured", "ai_provider_active", "file_ingestion_proven"],
    proof_status: "unverified",
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
    truth_pct: 72,
    structural_score: 90,
    runtime_score: 70,
    proof_score: 40,
    ux_score: 78,
    next_actions: [
      "Verify file-ingestion edge function processes real uploads end-to-end",
      "Prove AI assistant returns live response (not demo fallback)",
      "Write Playwright test: upload → AI analysis → result displayed",
      "Polish empty state when no files exist",
    ],
  },
  {
    loop_key: "boardroom-summary-decision",
    title: "Boardroom + Summary + Decision",
    owner: "platform",
    target_persona: "user",
    routes: ["/boardroom", "/boardroom/replay", "/business/boardroom", "/money/boardroom"],
    capabilities: ["boardroom.summary_generation", "boardroom.decision_tracking", "ai.strategic_synthesis"],
    primary_services: ["boardroom-service", "ai-gateway-service", "recommendation-service"],
    cj_entries: ["boardroom.open_session", "boardroom.review_recommendation", "boardroom.commit_decision"],
    launch_blockers: ["ai_provider_active", "boardroom_data_populated", "synthesis_quality_verified"],
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
    truth_pct: 77,
    structural_score: 92,
    runtime_score: 75,
    proof_score: 50,
    ux_score: 85,
    next_actions: [
      "Verify boardroom AI synthesis produces real output with live key",
      "Polish decision-commit flow UX",
      "Write Playwright test: open boardroom → review synthesis → commit decision",
      "Add boardroom session replay proof",
    ],
  },
  {
    loop_key: "connected-services-sync",
    title: "Connected Services + Sync",
    owner: "platform",
    target_persona: "user",
    routes: ["/connector-hub", "/settings/google-accounts"],
    capabilities: ["connectors.google_drive", "connectors.oauth_flow", "connectors.health_check"],
    primary_services: ["connector-service", "oauth-service", "connector-health-service"],
    cj_entries: ["connectors.google_drive_connect", "connectors.google_drive_reauth_primary", "connectors.google_drive_disconnect_primary"],
    launch_blockers: ["google_oauth_client_configured", "connector_health_edge_function", "oauth_flow_proven"],
    proof_status: "unverified",
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
    truth_pct: 67,
    structural_score: 88,
    runtime_score: 55,
    proof_score: 30,
    ux_score: 80,
    next_actions: [
      "Complete one Google OAuth flow end-to-end with real credentials",
      "Verify connector-health edge function returns live data",
      "Prove sync produces real synced records in connector_sync_runs",
      "Write Playwright test: navigate to connector hub → initiate OAuth",
    ],
  },
  {
    loop_key: "admin-truth-recommendation-approval",
    title: "Admin Truth + Recommendation",
    owner: "platform",
    target_persona: "operator",
    routes: ["/admin/dashboard", "/admin/truth-registry", "/admin/ai-workforce", "/admin/fl01-flagship-loops", "/admin/rex01-recommendation-executive"],
    capabilities: ["admin.truth_inspection", "admin.recommendation_review", "admin.approval_queue", "admin.execution_binding"],
    primary_services: ["admin-truth-service", "recommendation-loop-service", "approval-service"],
    cj_entries: ["admin.recommendation_approve_bind_execute", "admin.flagship_loop_inspect", "admin.outcome_verification_review"],
    launch_blockers: ["recommendation_lifecycle_wired", "approval_queue_functional"],
    proof_status: "partial",
    ux_quality: "beta",
    launch_claim_status: "internal_only",
    demo_vs_real: "mostly_real",
    description: "An operator can inspect runtime truth, review recommendations, approve/bind work, and track execution and outcomes.",
    primary_persona: "operator",
    launch_importance: "operator_critical",
    status: "active",
    owner_team: "platform",
    ux_quality_target: "beta",
    proof_required: true,
    launch_honesty_class: "internal_only",
    truth_pct: 90,
    structural_score: 98,
    runtime_score: 92,
    proof_score: 75,
    ux_score: 88,
    next_actions: [
      "Verify recommendation → approval → execution chain produces receipts",
      "Write Playwright test for admin approval flow",
      "Add outcome verification tracking to recommendation lifecycle",
    ],
  },
];

export async function seedFlagshipLoops() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const results: Array<{ loop_key: string; status: string }> = [];

  for (const seed of FLAGSHIP_LOOP_SEEDS) {
    const { data: existing } = await fromDynamicTable("flagship_loops")
      .select("id")
      .eq("loop_key", seed.loop_key)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) {
      // Update existing with latest seed data
      await fromDynamicTable("flagship_loops")
        .update({
          title: seed.title,
          truth_pct: seed.truth_pct,
          structural_score: seed.structural_score,
          runtime_score: seed.runtime_score,
          proof_score: seed.proof_score,
          ux_score: seed.ux_score,
          status: seed.status,
          launch_importance: seed.launch_importance,
          next_actions: seed.next_actions,
          description: seed.description,
          routes: seed.routes,
          capabilities: seed.capabilities,
          primary_services: seed.primary_services,
          cj_entries: seed.cj_entries,
          launch_blockers: seed.launch_blockers,
          proof_status: seed.proof_status,
          ux_quality: seed.ux_quality,
          launch_claim_status: seed.launch_claim_status,
          demo_vs_real: seed.demo_vs_real,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
      results.push({ loop_key: seed.loop_key, status: "updated" });
      continue;
    }

    const { error } = await fromDynamicTable("flagship_loops")
      .insert({ ...seed, user_id: user.id });

    results.push({ loop_key: seed.loop_key, status: error ? `error: ${(error as Error)?.message ?? String(error)}` : "seeded" });
  }

  return results;
}

export async function fetchFlagshipLoops() {
  const { data, error } = await fromDynamicTable("flagship_loops")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function updateFlagshipLoop(id: string, updates: Partial<FlagshipLoopSeed>) {
  const { error } = await fromDynamicTable("flagship_loops")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

// ── Computed helpers ─────────────────────────────────────────

export function getOverallTruthScore(loops: any[]): number {
  if (!loops.length) return 0;
  const total = loops.reduce((s: number, l: any) => s + (l.truth_pct || 0), 0);
  return Math.round(total / loops.length);
}

export function getLoopGrade(pct: number): { grade: string; color: string } {
  if (pct >= 90) return { grade: "A", color: "text-emerald-400" };
  if (pct >= 80) return { grade: "B+", color: "text-emerald-400" };
  if (pct >= 70) return { grade: "B", color: "text-amber-400" };
  if (pct >= 60) return { grade: "C+", color: "text-amber-400" };
  if (pct >= 50) return { grade: "C", color: "text-orange-400" };
  return { grade: "D", color: "text-destructive" };
}

export function getImportanceBadge(importance: string): { label: string; color: string; icon: string } {
  switch (importance) {
    case "launch_critical": return { label: "Launch Critical", color: "bg-destructive/15 text-destructive border-destructive/30", icon: "🔴" };
    case "important_to_launch": return { label: "Important", color: "bg-amber-500/15 text-amber-400 border-amber-500/30", icon: "🟡" };
    case "operator_critical": return { label: "Operator Critical", color: "bg-orange-500/15 text-orange-400 border-orange-500/30", icon: "🟠" };
    default: return { label: importance || "Unknown", color: "bg-muted text-muted-foreground", icon: "⚪" };
  }
}

export function getStatusBadge(status: string): { label: string; color: string } {
  switch (status) {
    case "active": return { label: "Active", color: "bg-emerald-500/15 text-emerald-400" };
    case "needs_proof": return { label: "Needs Proof", color: "bg-amber-500/15 text-amber-400" };
    case "needs_polish": return { label: "Needs Polish", color: "bg-blue-500/15 text-blue-400" };
    case "blocked": return { label: "Blocked", color: "bg-destructive/15 text-destructive" };
    default: return { label: status || "Unknown", color: "bg-muted text-muted-foreground" };
  }
}

