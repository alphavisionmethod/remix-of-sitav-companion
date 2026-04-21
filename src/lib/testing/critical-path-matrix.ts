// ═══════════════════════════════════════════════════════════════
// SITA OS — Critical Path Test Matrix
// Maps highest-risk user journeys to behavioral test requirements
// ═══════════════════════════════════════════════════════════════

export type CoverageStatus = "covered" | "partial" | "uncovered" | "structural-only";
export type TestType = "behavioral" | "e2e" | "integration" | "unit" | "structural" | "workflow" | "safety-permission";
export type RiskLevel = "critical" | "high" | "medium" | "low";

export interface CriticalPathEntry {
  id: string;
  feature: string;
  primaryFlow: string;
  expectedBehavior: string;
  edgeCases: string[];
  dataDependencies: string[];
  failureModes: string[];
  owner: string;
  testType: TestType;
  currentCoverage: CoverageStatus;
  riskLevel: RiskLevel;
}

export const CRITICAL_PATH_MATRIX: readonly CriticalPathEntry[] = [
  {
    id: "CPM-001",
    feature: "Homepage Load",
    primaryFlow: "User navigates to / → page renders with all critical sections",
    expectedBehavior: "Page loads within 3s, hero renders, navigation works, no console errors",
    edgeCases: ["slow network", "JS disabled", "mobile viewport", "cached vs fresh"],
    dataDependencies: [],
    failureModes: ["blank page", "hydration mismatch", "missing assets", "route 404"],
    owner: "platform",
    testType: "e2e",
    currentCoverage: "partial",
    riskLevel: "critical",
  },
  {
    id: "CPM-002",
    feature: "Waitlist Submit",
    primaryFlow: "User fills email → submits → sees confirmation → record persisted",
    expectedBehavior: "Form validates, submits to backend, shows success, email stored in DB",
    edgeCases: ["duplicate email", "invalid email", "network timeout", "rate limiting"],
    dataDependencies: ["waitlist_submissions table"],
    failureModes: ["silent failure", "no confirmation", "duplicate insert error shown to user"],
    owner: "growth",
    testType: "behavioral",
    currentCoverage: "uncovered",
    riskLevel: "critical",
  },
  {
    id: "CPM-003",
    feature: "Beta Apply & Invite",
    primaryFlow: "User applies → admin reviews → invite sent → user activates",
    expectedBehavior: "Application stored, admin sees it, invite email fires, activation works",
    edgeCases: ["already applied", "expired invite", "invite revoked"],
    dataDependencies: ["beta_applications", "invites"],
    failureModes: ["invite not sent", "activation link broken", "role not granted"],
    owner: "growth",
    testType: "workflow",
    currentCoverage: "uncovered",
    riskLevel: "high",
  },
  {
    id: "CPM-004",
    feature: "Crowdfund Pledge",
    primaryFlow: "User selects tier → enters payment → pledge confirmed → receipt emitted",
    expectedBehavior: "Tier selected, payment processed, pledge recorded, receipt created",
    edgeCases: ["payment declined", "tier sold out", "duplicate pledge", "refund request"],
    dataDependencies: ["crowdfund_pledges", "receipts", "payment_provider"],
    failureModes: ["payment charged but pledge not recorded", "no receipt", "amount mismatch"],
    owner: "growth",
    testType: "behavioral",
    currentCoverage: "uncovered",
    riskLevel: "critical",
  },
  {
    id: "CPM-005",
    feature: "Investor Request & Gated Access",
    primaryFlow: "Investor requests access → admin approves → deal room opens",
    expectedBehavior: "Request stored, admin notified, approval grants access, documents visible",
    edgeCases: ["request denied", "access expired", "NDA required first"],
    dataDependencies: ["investor_requests", "deal_room_access", "documents"],
    failureModes: ["access granted without approval", "documents leak to unapproved user"],
    owner: "growth",
    testType: "behavioral",
    currentCoverage: "uncovered",
    riskLevel: "critical",
  },
  {
    id: "CPM-006",
    feature: "Deal Room View & Download",
    primaryFlow: "Approved investor opens deal room → views documents → downloads",
    expectedBehavior: "Access verified, documents listed, download tracked, watermarked if applicable",
    edgeCases: ["expired access", "revoked access mid-session", "large file download"],
    dataDependencies: ["deal_room_access", "documents", "download_audit"],
    failureModes: ["unauthorized access", "download not logged", "broken file link"],
    owner: "growth",
    testType: "behavioral",
    currentCoverage: "uncovered",
    riskLevel: "high",
  },
  {
    id: "CPM-007",
    feature: "Boardroom Demo",
    primaryFlow: "User opens boardroom → multi-advisor session starts → recommendations shown",
    expectedBehavior: "Session created, advisors respond, consensus view renders, no hallucination",
    edgeCases: ["AI provider down", "budget exceeded", "empty context"],
    dataDependencies: ["advisor_registry", "boardroom_sessions", "ai_model_registry"],
    failureModes: ["session hangs", "advisor fails silently", "incoherent recommendation"],
    owner: "intelligence",
    testType: "behavioral",
    currentCoverage: "partial",
    riskLevel: "high",
  },
  {
    id: "CPM-008",
    feature: "Launchpad / Download Path",
    primaryFlow: "User selects platform → downloads correct build → install instructions shown",
    expectedBehavior: "Platform detected or selected, correct artifact linked, checksum shown",
    edgeCases: ["unsupported platform", "build not ready", "checksum mismatch"],
    dataDependencies: ["build_registry", "release_artifacts"],
    failureModes: ["wrong build for platform", "dead download link", "no checksum"],
    owner: "platform",
    testType: "e2e",
    currentCoverage: "structural-only",
    riskLevel: "high",
  },
  {
    id: "CPM-009",
    feature: "AI Chat (Grounded Answer)",
    primaryFlow: "User sends prompt → AI responds → answer grounded with evidence → receipt logged",
    expectedBehavior: "Response within 3s p95, grounded not hallucinated, receipt in ledger, budget checked",
    edgeCases: ["budget exceeded", "provider timeout", "harmful prompt", "empty context"],
    dataDependencies: ["ai_invocations", "ai_usage_ledger", "ai_capability_routing"],
    failureModes: ["no receipt", "hallucinated answer", "budget bypass", "provider leak"],
    owner: "intelligence",
    testType: "behavioral",
    currentCoverage: "partial",
    riskLevel: "critical",
  },
  {
    id: "CPM-010",
    feature: "CRM Record Create & Link",
    primaryFlow: "User creates contact → links to account → activity logged",
    expectedBehavior: "Contact persisted, linked to account, activity visible in timeline",
    edgeCases: ["duplicate contact", "orphan link", "missing required fields"],
    dataDependencies: ["contacts", "accounts", "activities"],
    failureModes: ["create succeeds but link fails", "no activity log", "duplicate not caught"],
    owner: "product",
    testType: "integration",
    currentCoverage: "uncovered",
    riskLevel: "medium",
  },
  {
    id: "CPM-011",
    feature: "Workflow Trigger Execution",
    primaryFlow: "Event fires → workflow triggered → steps execute → outcome recorded",
    expectedBehavior: "Trigger matches, steps run in order, errors handled, receipt emitted",
    edgeCases: ["step failure mid-chain", "timeout", "circular trigger", "disabled workflow"],
    dataDependencies: ["workflows", "workflow_runs", "workflow_steps"],
    failureModes: ["trigger not matched", "step fails silently", "no outcome recorded"],
    owner: "platform",
    testType: "workflow",
    currentCoverage: "structural-only",
    riskLevel: "high",
  },
  {
    id: "CPM-012",
    feature: "Consent / Suppression Enforcement",
    primaryFlow: "User opts out → suppression enforced → no further contact → audit logged",
    expectedBehavior: "Opt-out stored, all channels suppressed, violation blocked, audit trail",
    edgeCases: ["partial opt-out", "re-consent", "suppression during active campaign"],
    dataDependencies: ["consent_records", "suppression_lists", "campaigns"],
    failureModes: ["message sent after opt-out", "no audit", "suppression not propagated"],
    owner: "trust",
    testType: "behavioral",
    currentCoverage: "uncovered",
    riskLevel: "critical",
  },
  {
    id: "CPM-013",
    feature: "Receipt Creation (Meaningful Actions)",
    primaryFlow: "Action occurs → receipt emitted → persisted → verifiable",
    expectedBehavior: "Receipt contains action hash, timestamp, actor, payload summary; stored immutably",
    edgeCases: ["DB down during receipt write", "duplicate receipt", "large payload"],
    dataDependencies: ["receipts", "ai_action_receipts"],
    failureModes: ["action succeeds but receipt missing", "receipt corrupt", "no hash"],
    owner: "trust",
    testType: "behavioral",
    currentCoverage: "partial",
    riskLevel: "critical",
  },
  {
    id: "CPM-014",
    feature: "Kill Switch Actuation",
    primaryFlow: "Operator triggers kill switch → feature disabled → audit logged → rollback available",
    expectedBehavior: "Feature stops within 30s, audit entry created, rollback path clear",
    edgeCases: ["switch already active", "concurrent triggers", "rollback fails"],
    dataDependencies: ["kill_switch_state", "kill_switch_audit_log"],
    failureModes: ["feature not actually disabled", "no audit", "rollback breaks state"],
    owner: "platform",
    testType: "behavioral",
    currentCoverage: "structural-only",
    riskLevel: "critical",
  },
  {
    id: "CPM-015",
    feature: "OAuth Sign-in (Google)",
    primaryFlow: "User clicks Google sign-in → redirected → authenticated → session created",
    expectedBehavior: "Redirect works, token exchanged, profile created/updated, session active",
    edgeCases: ["user cancels", "token expired", "account already exists with email"],
    dataDependencies: ["auth.users", "profiles"],
    failureModes: ["redirect loop", "profile not created", "session not established"],
    owner: "platform",
    testType: "e2e",
    currentCoverage: "uncovered",
    riskLevel: "critical",
  },
  {
    id: "CPM-016",
    feature: "Campaign Send",
    primaryFlow: "Admin creates campaign → selects audience → sends → delivery tracked",
    expectedBehavior: "Campaign queued, suppressions applied, messages sent, opens/clicks tracked",
    edgeCases: ["empty audience", "all suppressed", "provider failure mid-send"],
    dataDependencies: ["campaigns", "campaign_sends", "suppression_lists"],
    failureModes: ["sent to suppressed user", "no delivery tracking", "partial send not flagged"],
    owner: "growth",
    testType: "workflow",
    currentCoverage: "uncovered",
    riskLevel: "high",
  },
  {
    id: "CPM-017",
    feature: "AI Budget Enforcement",
    primaryFlow: "AI call requested → budget checked → allowed/denied → ledger updated",
    expectedBehavior: "Budget gate blocks over-limit calls, fallback model used, decision receipted",
    edgeCases: ["exactly at limit", "concurrent requests", "budget reset timing"],
    dataDependencies: ["ai_user_hard_ceilings", "ai_usage_ledger", "ai_budget_decision_receipts"],
    failureModes: ["budget bypassed", "no fallback", "ledger not updated"],
    owner: "intelligence",
    testType: "behavioral",
    currentCoverage: "partial",
    riskLevel: "critical",
  },
  {
    id: "CPM-018",
    feature: "Admin Role Gate",
    primaryFlow: "Non-admin tries admin route → blocked → admin accesses → allowed",
    expectedBehavior: "Role checked server-side, unauthorized redirected, admin sees content",
    edgeCases: ["role removed mid-session", "multiple roles", "expired session"],
    dataDependencies: ["user_roles"],
    failureModes: ["admin page visible to non-admin", "client-only role check"],
    owner: "platform",
    testType: "safety-permission",
    currentCoverage: "structural-only",
    riskLevel: "critical",
  },
  {
    id: "CPM-019",
    feature: "AI Fallback Chain",
    primaryFlow: "Primary model fails → fallback model tried → result returned → event logged",
    expectedBehavior: "Fallback triggers automatically, user sees result, fallback event recorded",
    edgeCases: ["all models down", "fallback also fails", "timeout vs error"],
    dataDependencies: ["ai_capability_routing", "ai_fallback_events"],
    failureModes: ["no fallback tried", "user sees raw error", "fallback not logged"],
    owner: "intelligence",
    testType: "behavioral",
    currentCoverage: "partial",
    riskLevel: "high",
  },
  {
    id: "CPM-020",
    feature: "Account Deletion Request",
    primaryFlow: "User requests deletion → grace period → data purged → confirmation",
    expectedBehavior: "Request stored, grace period enforced, data removed, confirmation sent",
    edgeCases: ["cancellation during grace", "re-registration after deletion", "partial purge"],
    dataDependencies: ["account_deletion_requests"],
    failureModes: ["data not purged", "no grace period", "cancellation ignored"],
    owner: "trust",
    testType: "workflow",
    currentCoverage: "uncovered",
    riskLevel: "high",
  },
] as const;

export function getCriticalPaths(riskLevel?: RiskLevel): readonly CriticalPathEntry[] {
  if (!riskLevel) return CRITICAL_PATH_MATRIX;
  return CRITICAL_PATH_MATRIX.filter((e) => e.riskLevel === riskLevel);
}

export function getUncoveredCriticalPaths(): readonly CriticalPathEntry[] {
  return CRITICAL_PATH_MATRIX.filter((e) => e.currentCoverage === "uncovered");
}

export function getCoverageScore(): number {
  const weights: Record<CoverageStatus, number> = {
    covered: 1,
    partial: 0.5,
    "structural-only": 0.15,
    uncovered: 0,
  };
  const total = CRITICAL_PATH_MATRIX.reduce((sum, e) => sum + weights[e.currentCoverage], 0);
  return Math.round((total / CRITICAL_PATH_MATRIX.length) * 100);
}