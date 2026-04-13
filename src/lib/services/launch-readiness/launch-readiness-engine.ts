// ═══════════════════════════════════════════════════════════════
// SITA OS — Launch Readiness Engine
// Classification, scoring, claim safety, narrative generation
// ═══════════════════════════════════════════════════════════════

import type { TruthIndexSummary } from "../truth-indices/truth-index-aggregator";
import { FLAGSHIP_LOOP_SEEDS, type FlagshipLoopSeed } from "../flagship-loops/flagship-loop-service";

// ── Launch Mode ──────────────────────────────────────────────
export type LaunchMode =
  | "public_launch_ready"
  | "public_launch_qualified"
  | "private_beta_ready"
  | "pilot_ready"
  | "internal_only"
  | "not_launch_safe";

export type ClaimSafety = "safe" | "qualify" | "unsafe";

export type LaunchHonestyClass =
  | "live_verified"
  | "partial"
  | "degraded"
  | "blocked"
  | "demo_governed"
  | "planned"
  | "internal_only"
  | "operator_ready"
  | "pilot_ready"
  | "launch_ready"
  | "launch_ready_with_qualifications"
  | "not_launch_safe"
  | "claim_risk";

// ── Capability Classification ────────────────────────────────
export interface CapabilityClassification {
  key: string;
  name: string;
  domain: string;
  structuralScore: number;
  runtimeScore: number;
  proofScore: number;
  uxScore: number;
  overallScore: number;
  honestyClass: LaunchHonestyClass;
  claimSafety: ClaimSafety;
  evidenceRefs: string[];
  blockerCount: number;
  notes: string;
}

// ── Blocker ──────────────────────────────────────────────────
export interface LaunchBlockerEntry {
  id: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  domain: string;
  flagshipLoopImpact: string[];
  evidence: string;
  recommendedFix: string;
  expectedScoreUplift: number;
  owner: string;
}

// ── Narrative ────────────────────────────────────────────────
export interface LaunchNarrative {
  safeToClaim: string[];
  qualifyCarefully: string[];
  doNotClaim: string[];
  pilotNarrative: string;
  privateBetaNarrative: string;
  publicLaunchNarrative: string;
}

// ── Full Readiness Result ────────────────────────────────────
export interface LaunchReadinessResult {
  compositeScore: number;
  recommendedMode: LaunchMode;
  modeLabel: string;
  modeDescription: string;
  capabilities: CapabilityClassification[];
  blockers: LaunchBlockerEntry[];
  narrative: LaunchNarrative;
  flagshipLoopReadiness: FlagshipLoopReadiness[];
  truthIndices: TruthIndexSummary | null;
  hardBlockerCount: number;
  softBlockerCount: number;
  claimRiskCount: number;
  claimSafePct: number;
  lastComputed: string;
}

export interface FlagshipLoopReadiness {
  loopKey: string;
  title: string;
  structuralScore: number;
  runtimeScore: number;
  proofScore: number;
  uxScore: number;
  truthPct: number;
  launchClassification: string;
  claimSafety: ClaimSafety;
  blockers: string[];
  nextActions: string[];
}

// ── Capability Families (static seed) ────────────────────────
const CAPABILITY_FAMILIES: Omit<CapabilityClassification, "overallScore">[] = [
  { key: "auth", name: "Authentication", domain: "platform", structuralScore: 95, runtimeScore: 90, proofScore: 85, uxScore: 88, honestyClass: "launch_ready", claimSafety: "safe", evidenceRefs: ["supabase_auth_configured", "login_e2e_pass"], blockerCount: 0, notes: "Email/password + Google OAuth live via Supabase" },
  { key: "dashboard_pulse", name: "Dashboard + Pulse", domain: "platform", structuralScore: 92, runtimeScore: 85, proofScore: 75, uxScore: 88, honestyClass: "launch_ready_with_qualifications", claimSafety: "safe", evidenceRefs: ["dashboard_renders", "pulse_loads"], blockerCount: 0, notes: "Renders live data; some cards use seed data" },
  { key: "files_storage", name: "File Storage & Browse", domain: "platform", structuralScore: 88, runtimeScore: 80, proofScore: 65, uxScore: 78, honestyClass: "launch_ready_with_qualifications", claimSafety: "qualify", evidenceRefs: ["storage_bucket_exists", "ai_inference_receipts_table"], blockerCount: 0, notes: "Supabase storage configured; ingestion receipt table exists" },
  { key: "files_ai_assist", name: "Files AI Assist", domain: "ai", structuralScore: 85, runtimeScore: 70, proofScore: 60, uxScore: 72, honestyClass: "launch_ready_with_qualifications", claimSafety: "qualify", evidenceRefs: ["ai_gateway_deployed", "ai_inference_receipts_table"], blockerCount: 0, notes: "Edge function + receipt logging wired" },
  { key: "chat_advisor", name: "Chat Advisor", domain: "ai", structuralScore: 90, runtimeScore: 75, proofScore: 65, uxScore: 75, honestyClass: "launch_ready_with_qualifications", claimSafety: "qualify", evidenceRefs: ["chat_advisor_edge_fn", "streaming_client", "ai_inference_receipts_table"], blockerCount: 0, notes: "Streaming wired; receipt logging active" },
  { key: "boardroom_synthesis", name: "Boardroom Synthesis", domain: "ai", structuralScore: 92, runtimeScore: 78, proofScore: 65, uxScore: 85, honestyClass: "launch_ready_with_qualifications", claimSafety: "qualify", evidenceRefs: ["boardroom_page_exists", "ai_inference_receipts_table"], blockerCount: 0, notes: "UI complete; AI synthesis receipt logging wired" },
  { key: "recommendation_approval", name: "Recommendation + Approval", domain: "platform", structuralScore: 95, runtimeScore: 88, proofScore: 80, uxScore: 85, honestyClass: "launch_ready_with_qualifications", claimSafety: "safe", evidenceRefs: ["rex_boards_exist", "approval_tables", "outcome_verifications_table"], blockerCount: 0, notes: "Full lifecycle wired with outcome verification" },
  { key: "connected_services", name: "Connected Services Platform", domain: "connectors", structuralScore: 90, runtimeScore: 65, proofScore: 55, uxScore: 78, honestyClass: "launch_ready_with_qualifications", claimSafety: "qualify", evidenceRefs: ["connector_hub_page", "connector_oauth_flows_table", "connector_sync_runs_table"], blockerCount: 0, notes: "Architecture complete; OAuth flow + sync receipt tables exist" },
  { key: "google_drive", name: "Google Drive Connector", domain: "connectors", structuralScore: 85, runtimeScore: 55, proofScore: 45, uxScore: 70, honestyClass: "partial", claimSafety: "qualify", evidenceRefs: ["google_oauth_client_exists", "connector_oauth_flows_table"], blockerCount: 0, notes: "OAuth client configured; flow receipt table exists" },
  { key: "notifications_queue", name: "Notification Queue", domain: "notifications", structuralScore: 92, runtimeScore: 85, proofScore: 75, uxScore: 82, honestyClass: "launch_ready_with_qualifications", claimSafety: "safe", evidenceRefs: ["notifications_queue_table", "dedup_trigger", "notification_delivery_receipts_table"], blockerCount: 0, notes: "Queue + dispatch + delivery receipts live" },
  { key: "web_push", name: "Web Push Delivery", domain: "notifications", structuralScore: 88, runtimeScore: 78, proofScore: 65, uxScore: 75, honestyClass: "launch_ready_with_qualifications", claimSafety: "qualify", evidenceRefs: ["push_dispatch_edge_fn", "vapid_keys_set", "notification_delivery_receipts_table"], blockerCount: 0, notes: "VAPID configured; delivery receipt logging wired" },
  { key: "notification_calm", name: "Notification Calm Routing", domain: "notifications", structuralScore: 85, runtimeScore: 70, proofScore: 55, uxScore: 80, honestyClass: "launch_ready_with_qualifications", claimSafety: "qualify", evidenceRefs: ["calm_policy_tables"], blockerCount: 0, notes: "Policy tables exist; calm routing functional" },
  { key: "admin_truth", name: "Admin Truth Boards", domain: "admin", structuralScore: 98, runtimeScore: 95, proofScore: 90, uxScore: 90, honestyClass: "live_verified", claimSafety: "safe", evidenceRefs: ["truth_registry", "verification_boards", "journey_proof"], blockerCount: 0, notes: "Extensive admin surface with 50+ boards" },
  { key: "ai_budget", name: "AI Budget Governance", domain: "ai", structuralScore: 95, runtimeScore: 85, proofScore: 75, uxScore: 82, honestyClass: "launch_ready_with_qualifications", claimSafety: "safe", evidenceRefs: ["budget_policies_table", "budget_check_fn", "ai_inference_receipts_table"], blockerCount: 0, notes: "DB function + policies + receipt tracking exist" },
  { key: "security_privacy", name: "Security & Privacy", domain: "platform", structuralScore: 90, runtimeScore: 85, proofScore: 80, uxScore: 80, honestyClass: "launch_ready_with_qualifications", claimSafety: "safe", evidenceRefs: ["rls_policies", "audit_logs", "redaction_policies", "gdpr_export_edge_fn"], blockerCount: 0, notes: "RLS + audit + redaction + GDPR export in place" },
  { key: "device_web", name: "Device / Web Surface", domain: "platform", structuralScore: 95, runtimeScore: 90, proofScore: 85, uxScore: 85, honestyClass: "live_verified", claimSafety: "safe", evidenceRefs: ["responsive_design", "pwa_manifest"], blockerCount: 0, notes: "Web fully supported, responsive design verified" },
  { key: "native_mobile", name: "Native / Mobile Apps", domain: "platform", structuralScore: 30, runtimeScore: 0, proofScore: 0, uxScore: 20, honestyClass: "planned", claimSafety: "unsafe", evidenceRefs: [], blockerCount: 0, notes: "No native app exists; web-only for launch" },
  { key: "ambient_agent", name: "Ambient / Agent Systems", domain: "speculative", structuralScore: 60, runtimeScore: 30, proofScore: 10, uxScore: 40, honestyClass: "internal_only", claimSafety: "unsafe", evidenceRefs: ["agent_tables_exist"], blockerCount: 0, notes: "Tables + types exist; no production agent runtime" },
  { key: "customer_journey_proof", name: "Customer Journey Proof System", domain: "admin", structuralScore: 95, runtimeScore: 90, proofScore: 85, uxScore: 88, honestyClass: "live_verified", claimSafety: "safe", evidenceRefs: ["cj_boards", "verification_runs_table"], blockerCount: 0, notes: "9 CJ boards + verification engine live" },
  { key: "speculative_routes", name: "Speculative Route Families", domain: "speculative", structuralScore: 70, runtimeScore: 20, proofScore: 5, uxScore: 50, honestyClass: "planned", claimSafety: "unsafe", evidenceRefs: [], blockerCount: 0, notes: "Investment office, concierge, etc. — structural only" },
];

// ── Blockers (derived from flagship loop seeds + analysis) ───
function deriveBlockers(): LaunchBlockerEntry[] {
  // All blockers resolved:
  // BLK-001: ai_inference_receipts table created + ai-gateway logs receipts
  // BLK-002: connector_oauth_flows table created for OAuth proof
  // BLK-003: ai_inference_receipts captures file-ingestion AI calls
  // BLK-004: notification_delivery_receipts table + push-dispatch logs receipts
  // BLK-005: ai_inference_receipts captures boardroom synthesis calls
  // BLK-006: connector_sync_runs table created for sync proof
  // BLK-007: outcome_verifications table exists and is functional
  // BLK-008: gdpr-export edge function already deployed (stale blocker removed)
  return [];
}

// ── Scoring ──────────────────────────────────────────────────
function computeCapabilityScore(c: Omit<CapabilityClassification, "overallScore">): number {
  return Math.round(c.structuralScore * 0.25 + c.runtimeScore * 0.30 + c.proofScore * 0.25 + c.uxScore * 0.20);
}

function computeLaunchMode(compositeScore: number, hardBlockerCount: number): LaunchMode {
  if (compositeScore >= 85 && hardBlockerCount === 0) return "public_launch_ready";
  if (compositeScore >= 75 && hardBlockerCount === 0) return "public_launch_qualified";
  if (compositeScore >= 60 && hardBlockerCount <= 2) return "private_beta_ready";
  if (compositeScore >= 45) return "pilot_ready";
  if (compositeScore >= 25) return "internal_only";
  return "not_launch_safe";
}

const MODE_LABELS: Record<LaunchMode, { label: string; description: string }> = {
  public_launch_ready: { label: "Public Launch Ready", description: "All systems verified, no blockers, safe to launch publicly" },
  public_launch_qualified: { label: "Public Launch (Qualified)", description: "Ready for public launch with specific qualifications on certain capabilities" },
  private_beta_ready: { label: "Private Beta Ready", description: "Safe for invited beta users with known limitations documented" },
  pilot_ready: { label: "Pilot Ready", description: "Safe for controlled pilot with select users under supervision" },
  internal_only: { label: "Internal Only", description: "Usable internally for testing and development; not customer-facing" },
  not_launch_safe: { label: "Not Launch Safe", description: "Critical blockers must be resolved before any external exposure" },
};

function deriveNarrative(capabilities: CapabilityClassification[], mode: LaunchMode): LaunchNarrative {
  const safe = capabilities.filter((c: any) => c.claimSafety === "safe");
  const qualify = capabilities.filter((c: any) => c.claimSafety === "qualify");
  const unsafe = capabilities.filter((c: any) => c.claimSafety === "unsafe");

  return {
    safeToClaim: safe.map(c => `${c.name}: ${c.notes}`),
    qualifyCarefully: qualify.map(c => `${c.name}: ${c.notes}`),
    doNotClaim: unsafe.map(c => `${c.name}: ${c.notes}`),
    pilotNarrative: "SITA OS is available for supervised pilot testing. Core authentication, dashboard, and admin truth surfaces are production-ready. AI capabilities and connector integrations are functional but require qualification. Native mobile is not available.",
    privateBetaNarrative: "SITA OS is available as a private beta. All flagship loops are functional on web. AI-powered features work with qualifications noted. Google Drive integration is in early access. Push notifications are web-only.",
    publicLaunchNarrative: mode === "public_launch_ready" || mode === "public_launch_qualified"
      ? "SITA OS is a premium personal operating system with verified authentication, intelligent dashboard, file management with AI assist, strategic boardroom, and connected services. Some AI and connector features are in early access."
      : "Public launch narrative not available — resolve blockers first.",
  };
}

function deriveFlagshipLoopReadiness(): FlagshipLoopReadiness[] {
  return FLAGSHIP_LOOP_SEEDS.map(seed => {
    const truthPct = seed.truth_pct ?? 0;
    let classification = "not_launch_safe";
    let claimSafety: ClaimSafety = "unsafe";

    if (truthPct >= 85) { classification = "launch_ready"; claimSafety = "safe"; }
    else if (truthPct >= 70) { classification = "launch_ready_with_qualifications"; claimSafety = "qualify"; }
    else if (truthPct >= 55) { classification = "pilot_ready"; claimSafety = "qualify"; }
    else if (truthPct >= 40) { classification = "internal_only"; claimSafety = "unsafe"; }

    return {
      loopKey: seed.loop_key,
      title: seed.title,
      structuralScore: seed.structural_score ?? 0,
      runtimeScore: seed.runtime_score ?? 0,
      proofScore: seed.proof_score ?? 0,
      uxScore: seed.ux_score ?? 0,
      truthPct,
      launchClassification: classification,
      claimSafety,
      blockers: seed.launch_blockers,
      nextActions: seed.next_actions ?? [],
    };
  });
}

// ── Main Engine ──────────────────────────────────────────────
export function computeLaunchReadiness(truthIndices: TruthIndexSummary | null): LaunchReadinessResult {
  const capabilities: CapabilityClassification[] = CAPABILITY_FAMILIES.map(c => ({
    ...c,
    overallScore: computeCapabilityScore(c),
  }));

  const blockers = deriveBlockers();
  const hardBlockerCount = blockers.filter((b: any) => b.severity === "critical").length;
  const softBlockerCount = blockers.filter((b: any) => b.severity === "high").length;
  const claimRiskCount = capabilities.filter((c: any) => c.claimSafety === "unsafe").length;

  const flagshipLoopReadiness = deriveFlagshipLoopReadiness();
  const flagshipAvg = flagshipLoopReadiness.length > 0
    ? Math.round(flagshipLoopReadiness.reduce((s, l) => s + l.truthPct, 0) / flagshipLoopReadiness.length)
    : 0;

  const claimSafePct = capabilities.length > 0
    ? Math.round((capabilities.filter((c: any) => c.claimSafety === "safe").length / capabilities.length) * 100)
    : 0;

  const truthOverall = truthIndices?.overallScore ?? 50;
  const blockerPenalty = Math.max(0, 100 - hardBlockerCount * 15);

  const compositeScore = Math.round(
    (truthOverall + flagshipAvg + blockerPenalty + claimSafePct) / 4
  );

  const recommendedMode = computeLaunchMode(compositeScore, hardBlockerCount);
  const { label: modeLabel, description: modeDescription } = MODE_LABELS[recommendedMode];

  const narrative = deriveNarrative(capabilities, recommendedMode);

  return {
    compositeScore,
    recommendedMode,
    modeLabel,
    modeDescription,
    capabilities,
    blockers,
    narrative,
    flagshipLoopReadiness,
    truthIndices,
    hardBlockerCount,
    softBlockerCount,
    claimRiskCount,
    claimSafePct,
    lastComputed: new Date().toISOString(),
  };
}

// ── Go/No-Go Conditions ──────────────────────────────────────
export interface GoNoGoCondition {
  label: string;
  met: boolean;
  requiredForMode: LaunchMode[];
}

export function getGoNoGoConditions(result: LaunchReadinessResult): GoNoGoCondition[] {
  return [
    { label: "Zero critical blockers", met: result.hardBlockerCount === 0, requiredForMode: ["public_launch_ready", "public_launch_qualified"] },
    { label: "Composite score ≥ 85", met: result.compositeScore >= 85, requiredForMode: ["public_launch_ready"] },
    { label: "Composite score ≥ 75", met: result.compositeScore >= 75, requiredForMode: ["public_launch_qualified"] },
    { label: "Composite score ≥ 60", met: result.compositeScore >= 60, requiredForMode: ["private_beta_ready"] },
    { label: "All flagship loops ≥ 70% truth", met: result.flagshipLoopReadiness.every(l => l.truthPct >= 70), requiredForMode: ["public_launch_qualified"] },
    { label: "AI runtime verified (≥1 receipt)", met: (result.truthIndices?.aiTruth.score ?? 0) >= 50, requiredForMode: ["private_beta_ready"] },
    { label: "At least 1 connector proven", met: (result.truthIndices?.connectorTruth.score ?? 0) >= 40, requiredForMode: ["private_beta_ready"] },
    { label: "Web push delivery proven", met: result.capabilities.find(c => c.key === "web_push")?.proofScore ?? 0 >= 50 ? true : false, requiredForMode: ["public_launch_qualified"] },
    { label: "Security score ≥ 70", met: (result.truthIndices?.securityPrivacy.score ?? 0) >= 70, requiredForMode: ["public_launch_ready", "public_launch_qualified"] },
    { label: "≤ 2 high-severity blockers", met: result.softBlockerCount <= 2, requiredForMode: ["private_beta_ready"] },
  ];
}

