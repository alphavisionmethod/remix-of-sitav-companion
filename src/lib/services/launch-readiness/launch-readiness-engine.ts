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
  { key: "auth", name: "Authentication", domain: "platform", structuralScore: 95, runtimeScore: 90, proofScore: 70, uxScore: 88, honestyClass: "launch_ready_with_qualifications", claimSafety: "safe", evidenceRefs: ["supabase_auth_configured", "login_e2e_pass"], blockerCount: 0, notes: "Email/password + Google OAuth live via Supabase" },
  { key: "dashboard_pulse", name: "Dashboard + Pulse", domain: "platform", structuralScore: 92, runtimeScore: 85, proofScore: 60, uxScore: 88, honestyClass: "launch_ready_with_qualifications", claimSafety: "qualify", evidenceRefs: ["dashboard_renders", "pulse_loads"], blockerCount: 0, notes: "Renders live data; some cards use seed data" },
  { key: "files_storage", name: "File Storage & Browse", domain: "platform", structuralScore: 88, runtimeScore: 75, proofScore: 40, uxScore: 78, honestyClass: "partial", claimSafety: "qualify", evidenceRefs: ["storage_bucket_exists"], blockerCount: 1, notes: "Supabase storage configured; ingestion edge fn needs proof" },
  { key: "files_ai_assist", name: "Files AI Assist", domain: "ai", structuralScore: 85, runtimeScore: 55, proofScore: 30, uxScore: 72, honestyClass: "partial", claimSafety: "qualify", evidenceRefs: ["ai_gateway_deployed"], blockerCount: 2, notes: "Edge function exists; runtime proof incomplete" },
  { key: "chat_advisor", name: "Chat Advisor", domain: "ai", structuralScore: 90, runtimeScore: 60, proofScore: 35, uxScore: 75, honestyClass: "partial", claimSafety: "qualify", evidenceRefs: ["chat_advisor_edge_fn", "streaming_client"], blockerCount: 1, notes: "Streaming wired; needs live API key proof" },
  { key: "boardroom_synthesis", name: "Boardroom Synthesis", domain: "ai", structuralScore: 92, runtimeScore: 70, proofScore: 45, uxScore: 85, honestyClass: "partial", claimSafety: "qualify", evidenceRefs: ["boardroom_page_exists"], blockerCount: 1, notes: "UI complete; AI synthesis needs runtime verification" },
  { key: "recommendation_approval", name: "Recommendation + Approval", domain: "platform", structuralScore: 95, runtimeScore: 88, proofScore: 70, uxScore: 85, honestyClass: "launch_ready_with_qualifications", claimSafety: "qualify", evidenceRefs: ["rex_boards_exist", "approval_tables"], blockerCount: 0, notes: "Full lifecycle wired; outcome verification partial" },
  { key: "connected_services", name: "Connected Services Platform", domain: "connectors", structuralScore: 90, runtimeScore: 50, proofScore: 25, uxScore: 78, honestyClass: "partial", claimSafety: "qualify", evidenceRefs: ["connector_hub_page"], blockerCount: 2, notes: "Architecture complete; no proven OAuth flows yet" },
  { key: "google_drive", name: "Google Drive Connector", domain: "connectors", structuralScore: 85, runtimeScore: 40, proofScore: 15, uxScore: 70, honestyClass: "demo_governed", claimSafety: "unsafe", evidenceRefs: ["google_oauth_client_exists"], blockerCount: 3, notes: "OAuth client configured but unproven in production" },
  { key: "notifications_queue", name: "Notification Queue", domain: "notifications", structuralScore: 92, runtimeScore: 80, proofScore: 60, uxScore: 82, honestyClass: "launch_ready_with_qualifications", claimSafety: "qualify", evidenceRefs: ["notifications_queue_table", "dedup_trigger"], blockerCount: 0, notes: "Queue + dispatch trigger live" },
  { key: "web_push", name: "Web Push Delivery", domain: "notifications", structuralScore: 88, runtimeScore: 70, proofScore: 50, uxScore: 75, honestyClass: "partial", claimSafety: "qualify", evidenceRefs: ["push_dispatch_edge_fn", "vapid_keys_set"], blockerCount: 1, notes: "VAPID configured; needs end-to-end delivery proof" },
  { key: "notification_calm", name: "Notification Calm Routing", domain: "notifications", structuralScore: 85, runtimeScore: 65, proofScore: 40, uxScore: 80, honestyClass: "partial", claimSafety: "qualify", evidenceRefs: ["calm_policy_tables"], blockerCount: 0, notes: "Policy tables exist; behavioral proof incomplete" },
  { key: "admin_truth", name: "Admin Truth Boards", domain: "admin", structuralScore: 98, runtimeScore: 95, proofScore: 85, uxScore: 90, honestyClass: "live_verified", claimSafety: "safe", evidenceRefs: ["truth_registry", "verification_boards", "journey_proof"], blockerCount: 0, notes: "Extensive admin surface with 50+ boards" },
  { key: "ai_budget", name: "AI Budget Governance", domain: "ai", structuralScore: 95, runtimeScore: 85, proofScore: 65, uxScore: 82, honestyClass: "launch_ready_with_qualifications", claimSafety: "qualify", evidenceRefs: ["budget_policies_table", "budget_check_fn"], blockerCount: 0, notes: "DB function + policies exist; needs production load proof" },
  { key: "security_privacy", name: "Security & Privacy", domain: "platform", structuralScore: 90, runtimeScore: 85, proofScore: 70, uxScore: 80, honestyClass: "launch_ready_with_qualifications", claimSafety: "qualify", evidenceRefs: ["rls_policies", "audit_logs", "redaction_policies"], blockerCount: 0, notes: "RLS + audit + redaction in place; GDPR compliance partial" },
  { key: "device_web", name: "Device / Web Surface", domain: "platform", structuralScore: 95, runtimeScore: 90, proofScore: 80, uxScore: 85, honestyClass: "live_verified", claimSafety: "safe", evidenceRefs: ["responsive_design", "pwa_manifest"], blockerCount: 0, notes: "Web fully supported, responsive design verified" },
  { key: "native_mobile", name: "Native / Mobile Apps", domain: "platform", structuralScore: 30, runtimeScore: 0, proofScore: 0, uxScore: 20, honestyClass: "planned", claimSafety: "unsafe", evidenceRefs: [], blockerCount: 0, notes: "No native app exists; web-only for launch" },
  { key: "ambient_agent", name: "Ambient / Agent Systems", domain: "speculative", structuralScore: 60, runtimeScore: 30, proofScore: 10, uxScore: 40, honestyClass: "internal_only", claimSafety: "unsafe", evidenceRefs: ["agent_tables_exist"], blockerCount: 0, notes: "Tables + types exist; no production agent runtime" },
  { key: "customer_journey_proof", name: "Customer Journey Proof System", domain: "admin", structuralScore: 95, runtimeScore: 90, proofScore: 80, uxScore: 88, honestyClass: "live_verified", claimSafety: "safe", evidenceRefs: ["cj_boards", "verification_runs_table"], blockerCount: 0, notes: "9 CJ boards + verification engine live" },
  { key: "speculative_routes", name: "Speculative Route Families", domain: "speculative", structuralScore: 70, runtimeScore: 20, proofScore: 5, uxScore: 50, honestyClass: "planned", claimSafety: "unsafe", evidenceRefs: [], blockerCount: 0, notes: "Investment office, concierge, etc. — structural only" },
];

// ── Blockers (derived from flagship loop seeds + analysis) ───
function deriveBlockers(): LaunchBlockerEntry[] {
  return [
    { id: "BLK-001", title: "AI provider API key not proven in production", severity: "critical", domain: "ai", flagshipLoopImpact: ["files-ai-assist", "boardroom-summary-decision"], evidence: "No ai_inference_receipts with real tokens", recommendedFix: "Run one live AI call and verify receipt row", expectedScoreUplift: 8, owner: "platform" },
    { id: "BLK-002", title: "Google Drive OAuth flow unproven", severity: "critical", domain: "connectors", flagshipLoopImpact: ["connected-services-sync"], evidence: "No connector_oauth_flows with status=completed", recommendedFix: "Complete one real Google OAuth flow end-to-end", expectedScoreUplift: 6, owner: "platform" },
    { id: "BLK-003", title: "File ingestion edge function unproven", severity: "high", domain: "files", flagshipLoopImpact: ["files-ai-assist"], evidence: "No file-ingestion receipts", recommendedFix: "Upload a real file and verify processing receipt", expectedScoreUplift: 5, owner: "platform" },
    { id: "BLK-004", title: "Web push end-to-end delivery unproven", severity: "high", domain: "notifications", flagshipLoopImpact: ["sign-in-dashboard-pulse"], evidence: "No notification_delivery_receipts with status=delivered", recommendedFix: "Register push subscription and verify delivery receipt", expectedScoreUplift: 4, owner: "platform" },
    { id: "BLK-005", title: "Boardroom AI synthesis quality unverified", severity: "high", domain: "ai", flagshipLoopImpact: ["boardroom-summary-decision"], evidence: "No boardroom synthesis proof run", recommendedFix: "Run boardroom synthesis with live AI and verify quality", expectedScoreUplift: 5, owner: "platform" },
    { id: "BLK-006", title: "Connector sync produces no real data", severity: "medium", domain: "connectors", flagshipLoopImpact: ["connected-services-sync"], evidence: "No connector_sync_jobs with status=completed", recommendedFix: "Complete one Google Drive sync and verify synced records", expectedScoreUplift: 3, owner: "platform" },
    { id: "BLK-007", title: "Recommendation lifecycle outcome verification incomplete", severity: "medium", domain: "platform", flagshipLoopImpact: ["admin-truth-recommendation-approval"], evidence: "No outcome_verifications with status=verified", recommendedFix: "Complete one recommendation → approval → execution → verification cycle", expectedScoreUplift: 3, owner: "platform" },
    { id: "BLK-008", title: "GDPR data export/deletion not implemented", severity: "medium", domain: "security", flagshipLoopImpact: [], evidence: "No GDPR export endpoint", recommendedFix: "Implement user data export edge function", expectedScoreUplift: 2, owner: "platform" },
  ];
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
  const safe = capabilities.filter(c => c.claimSafety === "safe");
  const qualify = capabilities.filter(c => c.claimSafety === "qualify");
  const unsafe = capabilities.filter(c => c.claimSafety === "unsafe");

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
  const hardBlockerCount = blockers.filter(b => b.severity === "critical").length;
  const softBlockerCount = blockers.filter(b => b.severity === "high").length;
  const claimRiskCount = capabilities.filter(c => c.claimSafety === "unsafe").length;

  const flagshipLoopReadiness = deriveFlagshipLoopReadiness();
  const flagshipAvg = flagshipLoopReadiness.length > 0
    ? Math.round(flagshipLoopReadiness.reduce((s, l) => s + l.truthPct, 0) / flagshipLoopReadiness.length)
    : 0;

  const claimSafePct = capabilities.length > 0
    ? Math.round((capabilities.filter(c => c.claimSafety === "safe").length / capabilities.length) * 100)
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

