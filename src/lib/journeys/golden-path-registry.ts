// ═══════════════════════════════════════════════════════════════
// SITA OS — Golden Path Registry
// 11 critical user journeys with screen→API→DB→test evidence
// ═══════════════════════════════════════════════════════════════

export type JourneyStatus = "verified" | "partial" | "simulated" | "untested";
export type JourneyPriority = "P0" | "P1" | "P2" | "P3";

export interface JourneyStep {
  readonly order: number;
  readonly action: string;
  readonly surface: string;
  readonly route: string | null;
  readonly edgeFunction: string | null;
  readonly dbTables: readonly string[];
  readonly uiComponent: string | null;
  readonly verified: boolean;
}

export interface GoldenPathEntry {
  readonly journeyId: string;
  readonly title: string;
  readonly description: string;
  readonly priority: JourneyPriority;
  readonly status: JourneyStatus;
  readonly domain: string;
  readonly persona: string;
  readonly steps: readonly JourneyStep[];
  readonly entryPoint: string;
  readonly successCriteria: string;
  readonly failureMode: string;
  readonly e2eTestRef: string | null;
  readonly flagshipLoop: string | null;
}

export const GOLDEN_PATH_REGISTRY: readonly GoldenPathEntry[] = [
  {
    journeyId: "GP-001", title: "First Boot / Onboarding", description: "New user completes signup, onboarding ceremony, and reaches dashboard",
    priority: "P0", status: "verified", domain: "platform", persona: "new-owner",
    steps: [
      { order: 1, action: "User visits landing page", surface: "web", route: "/", edgeFunction: null, dbTables: [], uiComponent: "LandingPage", verified: true },
      { order: 2, action: "Clicks sign up", surface: "web", route: "/auth", edgeFunction: null, dbTables: [], uiComponent: "AuthPage", verified: true },
      { order: 3, action: "Completes registration form", surface: "web", route: "/auth", edgeFunction: null, dbTables: ["profiles"], uiComponent: "AuthPage", verified: true },
      { order: 4, action: "Email verification (if enabled)", surface: "web", route: "/auth", edgeFunction: "send-notification", dbTables: [], uiComponent: null, verified: true },
      { order: 5, action: "Onboarding ceremony starts", surface: "app", route: "/onboarding", edgeFunction: null, dbTables: ["business_onboarding"], uiComponent: "OnboardingFlow", verified: true },
      { order: 6, action: "Business profile setup", surface: "app", route: "/onboarding", edgeFunction: null, dbTables: ["business_onboarding"], uiComponent: "OnboardingFlow", verified: true },
      { order: 7, action: "Reaches main dashboard", surface: "app", route: "/dashboard", edgeFunction: null, dbTables: ["business_health_scores"], uiComponent: "Dashboard", verified: true },
    ],
    entryPoint: "/", successCriteria: "User sees populated dashboard with health scores",
    failureMode: "Auth failure, onboarding skip, empty dashboard", e2eTestRef: "tests/e2e/onboarding.spec.ts", flagshipLoop: "auth-pulse"
  },
  {
    journeyId: "GP-002", title: "Sign-In & Session Restore", description: "Returning user signs in and restores previous session state",
    priority: "P0", status: "verified", domain: "platform", persona: "returning-owner",
    steps: [
      { order: 1, action: "User visits app", surface: "web", route: "/", edgeFunction: null, dbTables: [], uiComponent: null, verified: true },
      { order: 2, action: "Redirected to auth if no session", surface: "web", route: "/auth", edgeFunction: null, dbTables: [], uiComponent: "AuthPage", verified: true },
      { order: 3, action: "Enters credentials or uses Google OAuth", surface: "web", route: "/auth", edgeFunction: null, dbTables: ["profiles"], uiComponent: "AuthPage", verified: true },
      { order: 4, action: "Session created, redirected to dashboard", surface: "app", route: "/dashboard", edgeFunction: null, dbTables: ["admin_sessions"], uiComponent: "Dashboard", verified: true },
    ],
    entryPoint: "/auth", successCriteria: "User sees dashboard with data from previous session",
    failureMode: "Auth loop, stale session, empty state", e2eTestRef: "tests/e2e/auth.spec.ts", flagshipLoop: "auth-pulse"
  },
  {
    journeyId: "GP-003", title: "Connect CRM Integration", description: "Owner connects a CRM connector via OAuth and triggers first sync",
    priority: "P0", status: "partial", domain: "integration", persona: "owner",
    steps: [
      { order: 1, action: "Navigate to connectors page", surface: "app", route: "/connectors", edgeFunction: null, dbTables: [], uiComponent: "ConnectorsPage", verified: true },
      { order: 2, action: "Select CRM provider", surface: "app", route: "/connectors", edgeFunction: null, dbTables: [], uiComponent: "ConnectorCard", verified: true },
      { order: 3, action: "OAuth authorization flow", surface: "app", route: null, edgeFunction: "connector-auth-callback", dbTables: ["connector_oauth_flows"], uiComponent: null, verified: true },
      { order: 4, action: "Initial data sync triggered", surface: "app", route: "/connectors", edgeFunction: "connector-sync", dbTables: ["connector_sync_runs"], uiComponent: "SyncStatus", verified: false },
      { order: 5, action: "Contacts and data appear in business view", surface: "app", route: "/business", edgeFunction: null, dbTables: ["clients"], uiComponent: "ClientList", verified: false },
    ],
    entryPoint: "/connectors", successCriteria: "External CRM data visible in business module",
    failureMode: "OAuth failure, sync timeout, data mapping errors", e2eTestRef: null, flagshipLoop: "connectors"
  },
  {
    journeyId: "GP-004", title: "Recover Lost Leads", description: "AI identifies and recovers leads from connected data sources",
    priority: "P1", status: "simulated", domain: "business", persona: "owner",
    steps: [
      { order: 1, action: "Advisor detects lead recovery opportunity", surface: "system", route: null, edgeFunction: "advisor-orchestrate", dbTables: ["advisor_board_recommendations"], uiComponent: null, verified: true },
      { order: 2, action: "Recommendation surfaces in dashboard", surface: "app", route: "/dashboard", edgeFunction: null, dbTables: ["advisor_board_recommendations"], uiComponent: "RecommendationCard", verified: true },
      { order: 3, action: "Owner reviews and approves recommendation", surface: "app", route: "/boardroom", edgeFunction: null, dbTables: ["advisor_board_actions"], uiComponent: "ApprovalGate", verified: true },
      { order: 4, action: "System executes lead recovery action", surface: "system", route: null, edgeFunction: "advisor-orchestrate", dbTables: ["advisor_board_tool_executions"], uiComponent: null, verified: false },
      { order: 5, action: "Proof receipt generated", surface: "system", route: null, edgeFunction: null, dbTables: ["advisor_board_actions"], uiComponent: "ProofReceipt", verified: true },
    ],
    entryPoint: "/dashboard", successCriteria: "Lost leads recovered with proof receipt",
    failureMode: "No leads detected, approval timeout, execution failure", e2eTestRef: null, flagshipLoop: null
  },
  {
    journeyId: "GP-005", title: "Approve Outbound Communication", description: "Owner reviews and approves AI-drafted client communication",
    priority: "P1", status: "simulated", domain: "business", persona: "owner",
    steps: [
      { order: 1, action: "Advisor drafts communication", surface: "system", route: null, edgeFunction: "advisor-chat", dbTables: ["advisor_board_actions"], uiComponent: null, verified: true },
      { order: 2, action: "Draft appears in approval queue", surface: "app", route: "/approvals", edgeFunction: null, dbTables: ["advisor_board_actions"], uiComponent: "ApprovalQueue", verified: true },
      { order: 3, action: "Owner reviews and edits draft", surface: "app", route: "/approvals", edgeFunction: null, dbTables: [], uiComponent: "DraftEditor", verified: true },
      { order: 4, action: "Owner approves send", surface: "app", route: "/approvals", edgeFunction: "send-notification", dbTables: ["notification_delivery_receipts"], uiComponent: "ApprovalGate", verified: false },
    ],
    entryPoint: "/approvals", successCriteria: "Communication sent with delivery receipt",
    failureMode: "Draft quality low, approval timeout, delivery failure", e2eTestRef: null, flagshipLoop: null
  },
  {
    journeyId: "GP-006", title: "Review Proof Receipt", description: "Owner inspects a proof receipt for a completed AI action",
    priority: "P1", status: "verified", domain: "platform", persona: "owner",
    steps: [
      { order: 1, action: "Navigate to proof/audit section", surface: "app", route: "/admin/audit", edgeFunction: null, dbTables: ["admin_action_audit"], uiComponent: "AuditLog", verified: true },
      { order: 2, action: "Select specific proof receipt", surface: "app", route: "/admin/audit", edgeFunction: null, dbTables: ["ai_inference_receipts", "advisor_board_actions"], uiComponent: "ProofReceipt", verified: true },
      { order: 3, action: "View evidence chain and hash", surface: "app", route: "/admin/audit", edgeFunction: null, dbTables: ["boardroom_evidence"], uiComponent: "EvidenceChain", verified: true },
    ],
    entryPoint: "/admin/audit", successCriteria: "Full proof chain viewable with hash verification",
    failureMode: "Missing receipts, broken hash chain", e2eTestRef: null, flagshipLoop: "admin-truth"
  },
  {
    journeyId: "GP-007", title: "Mobile Quick Approval", description: "Owner approves a pending action from mobile device",
    priority: "P1", status: "partial", domain: "platform", persona: "owner-mobile",
    steps: [
      { order: 1, action: "Push notification received on mobile", surface: "mobile", route: null, edgeFunction: "send-push-notification", dbTables: ["push_subscriptions"], uiComponent: null, verified: false },
      { order: 2, action: "Open mobile approval view", surface: "mobile", route: "/mobile/approvals", edgeFunction: null, dbTables: ["advisor_board_actions"], uiComponent: "MobileApprovalList", verified: true },
      { order: 3, action: "Review and approve action", surface: "mobile", route: "/mobile/approvals", edgeFunction: null, dbTables: ["advisor_board_actions", "approval_decisions"], uiComponent: "MobileApprovalCard", verified: true },
    ],
    entryPoint: "push notification", successCriteria: "Action approved and executed from mobile",
    failureMode: "Push not received, mobile auth failure", e2eTestRef: null, flagshipLoop: null
  },
  {
    journeyId: "GP-008", title: "Admin Intervention", description: "Admin performs safety-classified action with dual approval",
    priority: "P0", status: "partial", domain: "admin", persona: "admin",
    steps: [
      { order: 1, action: "Admin navigates to control panel", surface: "admin", route: "/admin/safety", edgeFunction: null, dbTables: ["admin_safety_actions"], uiComponent: "SafetyDashboard", verified: true },
      { order: 2, action: "Selects action requiring confirmation", surface: "admin", route: "/admin/safety", edgeFunction: null, dbTables: ["admin_action_confirmations"], uiComponent: "ConfirmationDialog", verified: true },
      { order: 3, action: "Provides justification", surface: "admin", route: "/admin/safety", edgeFunction: null, dbTables: ["admin_action_confirmations"], uiComponent: "JustificationForm", verified: true },
      { order: 4, action: "Dry run executed (if required)", surface: "admin", route: "/admin/safety", edgeFunction: null, dbTables: ["admin_action_confirmations"], uiComponent: "DryRunResult", verified: true },
      { order: 5, action: "Action executed with audit trail", surface: "admin", route: "/admin/safety", edgeFunction: null, dbTables: ["admin_action_audit"], uiComponent: "AuditEntry", verified: true },
    ],
    entryPoint: "/admin/safety", successCriteria: "Action completed with full audit trail and justification",
    failureMode: "Insufficient permissions, dual approval not met", e2eTestRef: null, flagshipLoop: "admin-truth"
  },
  {
    journeyId: "GP-009", title: "Boardroom Decision Session", description: "Full boardroom session with evidence, deliberation, and decision receipt",
    priority: "P0", status: "verified", domain: "admin", persona: "owner",
    steps: [
      { order: 1, action: "Open boardroom session", surface: "app", route: "/boardroom", edgeFunction: null, dbTables: ["boardroom_sessions"], uiComponent: "BoardroomView", verified: true },
      { order: 2, action: "Review agenda items with evidence", surface: "app", route: "/boardroom", edgeFunction: null, dbTables: ["boardroom_items", "boardroom_evidence"], uiComponent: "BoardroomItemCard", verified: true },
      { order: 3, action: "Advisor council provides recommendations", surface: "app", route: "/boardroom", edgeFunction: "advisor-orchestrate", dbTables: ["boardroom_recommendations"], uiComponent: "AdvisorPanel", verified: true },
      { order: 4, action: "Owner makes decision", surface: "app", route: "/boardroom", edgeFunction: null, dbTables: ["boardroom_decision_receipts"], uiComponent: "DecisionGate", verified: true },
      { order: 5, action: "Decision receipt generated with proof", surface: "app", route: "/boardroom", edgeFunction: null, dbTables: ["boardroom_decision_receipts"], uiComponent: "ProofReceipt", verified: true },
    ],
    entryPoint: "/boardroom", successCriteria: "Decision made with full evidence trail and proof receipt",
    failureMode: "Insufficient evidence, advisor timeout", e2eTestRef: "tests/e2e/boardroom.spec.ts", flagshipLoop: "boardroom"
  },
  {
    journeyId: "GP-010", title: "Workflow Replay & Debug", description: "Operator replays a failed workflow to diagnose and fix issues",
    priority: "P2", status: "simulated", domain: "admin", persona: "operator",
    steps: [
      { order: 1, action: "Navigate to workflow history", surface: "admin", route: "/admin/workflows", edgeFunction: null, dbTables: ["advisor_board_actions"], uiComponent: "WorkflowHistory", verified: true },
      { order: 2, action: "Select failed workflow", surface: "admin", route: "/admin/workflows", edgeFunction: null, dbTables: ["advisor_board_tool_executions"], uiComponent: "WorkflowDetail", verified: true },
      { order: 3, action: "View step-by-step execution log", surface: "admin", route: "/admin/workflows", edgeFunction: null, dbTables: ["advisor_board_tool_executions"], uiComponent: "ExecutionTimeline", verified: true },
      { order: 4, action: "Trigger replay from failure point", surface: "admin", route: "/admin/workflows", edgeFunction: "execute-workflow", dbTables: ["advisor_board_tool_executions"], uiComponent: "ReplayControls", verified: false },
    ],
    entryPoint: "/admin/workflows", successCriteria: "Workflow successfully replayed past failure point",
    failureMode: "State corruption, dependency changed", e2eTestRef: null, flagshipLoop: null
  },
  {
    journeyId: "GP-011", title: "Release Readiness Review", description: "Admin verifies deployment readiness across all proof dimensions",
    priority: "P1", status: "verified", domain: "admin", persona: "admin",
    steps: [
      { order: 1, action: "Navigate to launch readiness dashboard", surface: "admin", route: "/admin/launch-readiness", edgeFunction: null, dbTables: [], uiComponent: "LaunchReadinessDashboard", verified: true },
      { order: 2, action: "Review all proof dimensions", surface: "admin", route: "/admin/launch-readiness", edgeFunction: null, dbTables: ["ai_inference_receipts", "connector_oauth_flows", "notification_delivery_receipts", "connector_sync_runs"], uiComponent: "ProofDimensionCard", verified: true },
      { order: 3, action: "Check blocker resolution status", surface: "admin", route: "/admin/launch-readiness", edgeFunction: null, dbTables: [], uiComponent: "BlockerList", verified: true },
      { order: 4, action: "Confirm deployment safety score", surface: "admin", route: "/admin/launch-readiness", edgeFunction: null, dbTables: [], uiComponent: "SafetyScore", verified: true },
    ],
    entryPoint: "/admin/launch-readiness", successCriteria: "All proof dimensions green, safety score ≥ 95",
    failureMode: "Missing proofs, unresolved blockers", e2eTestRef: null, flagshipLoop: "admin-truth"
  },
] as const;

// ── Query Functions ────────────────────────────────────────────

export function getJourney(id: string): GoldenPathEntry | undefined {
  return GOLDEN_PATH_REGISTRY.find((j) => j.journeyId === id);
}

export function getJourneysByPriority(priority: JourneyPriority): readonly GoldenPathEntry[] {
  return GOLDEN_PATH_REGISTRY.filter((j) => j.priority === priority);
}

export function getJourneysByStatus(status: JourneyStatus): readonly GoldenPathEntry[] {
  return GOLDEN_PATH_REGISTRY.filter((j) => j.status === status);
}

export function getJourneysByDomain(domain: string): readonly GoldenPathEntry[] {
  return GOLDEN_PATH_REGISTRY.filter((j) => j.domain === domain);
}

export function getJourneysForFlagshipLoop(loop: string): readonly GoldenPathEntry[] {
  return GOLDEN_PATH_REGISTRY.filter((j) => j.flagshipLoop === loop);
}

export function getUnverifiedSteps(): Array<{ journeyId: string; step: JourneyStep }> {
  const results: Array<{ journeyId: string; step: JourneyStep }> = [];
  for (const j of GOLDEN_PATH_REGISTRY) {
    for (const s of j.steps) {
      if (!s.verified) results.push({ journeyId: j.journeyId, step: s });
    }
  }
  return results;
}

export function getJourneyCoverage(): { total: number; verified: number; partial: number; simulated: number; untested: number } {
  return {
    total: GOLDEN_PATH_REGISTRY.length,
    verified: GOLDEN_PATH_REGISTRY.filter((j) => j.status === "verified").length,
    partial: GOLDEN_PATH_REGISTRY.filter((j) => j.status === "partial").length,
    simulated: GOLDEN_PATH_REGISTRY.filter((j) => j.status === "simulated").length,
    untested: GOLDEN_PATH_REGISTRY.filter((j) => j.status === "untested").length,
  };
}

export function getTablesUsedInJourneys(): string[] {
  const tables = new Set<string>();
  for (const j of GOLDEN_PATH_REGISTRY) {
    for (const s of j.steps) {
      for (const t of s.dbTables) tables.add(t);
    }
  }
  return [...tables].sort();
}

export function getEdgeFunctionsUsedInJourneys(): string[] {
  const fns = new Set<string>();
  for (const j of GOLDEN_PATH_REGISTRY) {
    for (const s of j.steps) {
      if (s.edgeFunction) fns.add(s.edgeFunction);
    }
  }
  return [...fns].sort();
}
