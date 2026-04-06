// ═══════════════════════════════════════════════════════════════
// SITA OS — Route-to-Service Inventory
// Maps important routes to canonical service paths for traceability
// ═══════════════════════════════════════════════════════════════

export interface RouteAction {
  actionKey: string;
  actionLabel: string;
  actionType: "read" | "write" | "navigate" | "connect" | "approve" | "execute";
  handlerLocation: string;
  primaryServiceKey: string;
  secondaryServiceKeys: string[];
  providerDependencies: string[];
  dbDependencies: string[];
  customerJourneyKeys: string[];
  launchCriticality: "critical" | "high" | "medium" | "low";
  isCanonical: boolean;
  notes: string;
}

export interface RouteInventoryEntry {
  routeKey: string;
  routePath: string;
  surfaceClass: "desktop" | "mobile" | "admin" | "settings" | "universal";
  domainFamily: string;
  flagshipLoopKey: string | null;
  primaryPersona: "user" | "operator" | "admin";
  actions: RouteAction[];
  ownerTeam: string;
  canonicalPathConfidence: "high" | "medium" | "low";
  shadowServiceRisk: "low" | "medium" | "high";
}

export const ROUTE_SERVICE_INVENTORY: RouteInventoryEntry[] = [
  // ── Flagship Loop 1: Auth + Dashboard + Pulse ──
  {
    routeKey: "login",
    routePath: "/login",
    surfaceClass: "universal",
    domainFamily: "auth",
    flagshipLoopKey: "sign-in-dashboard-pulse",
    primaryPersona: "user",
    ownerTeam: "platform",
    canonicalPathConfidence: "high",
    shadowServiceRisk: "low",
    actions: [
      {
        actionKey: "sign_in_email",
        actionLabel: "Sign In with Email",
        actionType: "write",
        handlerLocation: "src/contexts/AuthContext.tsx",
        primaryServiceKey: "supabase-auth",
        secondaryServiceKeys: ["profile-service"],
        providerDependencies: ["supabase"],
        dbDependencies: ["auth.users", "profiles"],
        customerJourneyKeys: ["auth.sign_in"],
        launchCriticality: "critical",
        isCanonical: true,
        notes: "Single canonical path via AuthContext",
      },
      {
        actionKey: "sign_in_google",
        actionLabel: "Sign In with Google",
        actionType: "connect",
        handlerLocation: "src/contexts/AuthContext.tsx",
        primaryServiceKey: "supabase-auth",
        secondaryServiceKeys: ["google-identity-service"],
        providerDependencies: ["supabase", "google-oauth"],
        dbDependencies: ["auth.users", "profiles"],
        customerJourneyKeys: ["auth.sign_in"],
        launchCriticality: "critical",
        isCanonical: true,
        notes: "OAuth via Supabase provider",
      },
    ],
  },
  {
    routeKey: "dashboard",
    routePath: "/",
    surfaceClass: "desktop",
    domainFamily: "dashboard",
    flagshipLoopKey: "sign-in-dashboard-pulse",
    primaryPersona: "user",
    ownerTeam: "platform",
    canonicalPathConfidence: "medium",
    shadowServiceRisk: "medium",
    actions: [
      {
        actionKey: "load_dashboard",
        actionLabel: "Load Dashboard",
        actionType: "read",
        handlerLocation: "src/pages/Index.tsx",
        primaryServiceKey: "dashboard-service",
        secondaryServiceKeys: ["pulse-service", "summary-card-service"],
        providerDependencies: ["supabase"],
        dbDependencies: ["multiple"],
        customerJourneyKeys: ["dashboard.daily_pulse_view"],
        launchCriticality: "critical",
        isCanonical: true,
        notes: "Multiple card/summary patterns — consolidation opportunity",
      },
    ],
  },
  {
    routeKey: "daily-pulse",
    routePath: "/daily-pulse",
    surfaceClass: "desktop",
    domainFamily: "dashboard",
    flagshipLoopKey: "sign-in-dashboard-pulse",
    primaryPersona: "user",
    ownerTeam: "platform",
    canonicalPathConfidence: "medium",
    shadowServiceRisk: "medium",
    actions: [
      {
        actionKey: "view_pulse",
        actionLabel: "View Daily Pulse",
        actionType: "read",
        handlerLocation: "src/pages/DailyPulse.tsx",
        primaryServiceKey: "pulse-service",
        secondaryServiceKeys: ["dashboard-service"],
        providerDependencies: ["supabase"],
        dbDependencies: ["multiple"],
        customerJourneyKeys: ["dashboard.daily_pulse_view"],
        launchCriticality: "high",
        isCanonical: true,
        notes: "Pulse data aggregation service",
      },
    ],
  },

  // ── Flagship Loop 2: Files + AI Assist ──
  {
    routeKey: "files",
    routePath: "/files",
    surfaceClass: "desktop",
    domainFamily: "files",
    flagshipLoopKey: "files-ai-assist",
    primaryPersona: "user",
    ownerTeam: "platform",
    canonicalPathConfidence: "high",
    shadowServiceRisk: "low",
    actions: [
      {
        actionKey: "upload_file",
        actionLabel: "Upload File",
        actionType: "write",
        handlerLocation: "src/pages/Files.tsx",
        primaryServiceKey: "file-service",
        secondaryServiceKeys: ["storage-adapter"],
        providerDependencies: ["supabase-storage"],
        dbDependencies: ["storage.objects", "documents"],
        customerJourneyKeys: ["files.upload_document"],
        launchCriticality: "high",
        isCanonical: true,
        notes: "Clean path via Supabase storage",
      },
      {
        actionKey: "browse_files",
        actionLabel: "Browse Files",
        actionType: "read",
        handlerLocation: "src/pages/Files.tsx",
        primaryServiceKey: "file-service",
        secondaryServiceKeys: [],
        providerDependencies: ["supabase"],
        dbDependencies: ["documents"],
        customerJourneyKeys: ["files.browse_files"],
        launchCriticality: "high",
        isCanonical: true,
        notes: "",
      },
    ],
  },
  {
    routeKey: "advisor",
    routePath: "/advisor",
    surfaceClass: "desktop",
    domainFamily: "assistant",
    flagshipLoopKey: "files-ai-assist",
    primaryPersona: "user",
    ownerTeam: "platform",
    canonicalPathConfidence: "medium",
    shadowServiceRisk: "medium",
    actions: [
      {
        actionKey: "send_assistant_prompt",
        actionLabel: "Send Assistant Prompt",
        actionType: "write",
        handlerLocation: "src/pages/AdvisorChat.tsx",
        primaryServiceKey: "ai-gateway-service",
        secondaryServiceKeys: ["advisor-service", "prompt-family-service", "receipt-service"],
        providerDependencies: ["openai", "anthropic"],
        dbDependencies: ["advisor_requests", "advisor_responses", "ai_inference_receipts"],
        customerJourneyKeys: ["assistant.send_message"],
        launchCriticality: "high",
        isCanonical: true,
        notes: "Gateway is canonical entry. Multiple advisor patterns exist.",
      },
    ],
  },

  // ── Flagship Loop 3: Boardroom + Summary + Decision ──
  {
    routeKey: "boardroom",
    routePath: "/boardroom",
    surfaceClass: "desktop",
    domainFamily: "boardroom",
    flagshipLoopKey: "boardroom-summary-decision",
    primaryPersona: "user",
    ownerTeam: "platform",
    canonicalPathConfidence: "high",
    shadowServiceRisk: "low",
    actions: [
      {
        actionKey: "generate_boardroom",
        actionLabel: "Generate Boardroom Report",
        actionType: "execute",
        handlerLocation: "src/pages/BoardroomPage.tsx",
        primaryServiceKey: "boardroom-service",
        secondaryServiceKeys: ["ai-gateway-service"],
        providerDependencies: ["openai", "anthropic", "supabase"],
        dbDependencies: ["boardroom_sessions", "boardroom_reports"],
        customerJourneyKeys: ["boardroom.open_session"],
        launchCriticality: "high",
        isCanonical: true,
        notes: "Clean domain via brain-generate-boardroom edge fn",
      },
    ],
  },

  // ── Flagship Loop 4: Connected Services ──
  {
    routeKey: "connector-hub",
    routePath: "/connector-hub",
    surfaceClass: "desktop",
    domainFamily: "connectors",
    flagshipLoopKey: "connected-services-sync",
    primaryPersona: "user",
    ownerTeam: "platform",
    canonicalPathConfidence: "medium",
    shadowServiceRisk: "medium",
    actions: [
      {
        actionKey: "connect_google_drive",
        actionLabel: "Connect Google Drive",
        actionType: "connect",
        handlerLocation: "src/pages/ConnectorHub.tsx",
        primaryServiceKey: "connector-service",
        secondaryServiceKeys: ["oauth-service", "consent-service"],
        providerDependencies: ["google-oauth", "supabase"],
        dbDependencies: ["connector_configs", "connector_tokens", "consent_ledger"],
        customerJourneyKeys: ["connectors.google_drive_connect"],
        launchCriticality: "high",
        isCanonical: true,
        notes: "Real OAuth via connector-oauth edge function",
      },
    ],
  },
  {
    routeKey: "settings-notifications",
    routePath: "/settings/notifications",
    surfaceClass: "settings",
    domainFamily: "notifications",
    flagshipLoopKey: null,
    primaryPersona: "user",
    ownerTeam: "platform",
    canonicalPathConfidence: "high",
    shadowServiceRisk: "low",
    actions: [
      {
        actionKey: "update_notification_prefs",
        actionLabel: "Update Notification Preferences",
        actionType: "write",
        handlerLocation: "src/pages/settings/NotificationPreferences.tsx",
        primaryServiceKey: "notification-service",
        secondaryServiceKeys: ["preference-service"],
        providerDependencies: ["supabase"],
        dbDependencies: ["notification_preferences"],
        customerJourneyKeys: [],
        launchCriticality: "medium",
        isCanonical: true,
        notes: "Clean single entry point",
      },
    ],
  },

  // ── Flagship Loop 5: Admin Truth + Recommendation + Approval ──
  {
    routeKey: "admin-rex-intelligence",
    routePath: "/admin/rex/intelligence",
    surfaceClass: "admin",
    domainFamily: "recommendation-execution",
    flagshipLoopKey: "admin-truth-recommendation-approval",
    primaryPersona: "operator",
    ownerTeam: "platform",
    canonicalPathConfidence: "high",
    shadowServiceRisk: "low",
    actions: [
      {
        actionKey: "review_recommendations",
        actionLabel: "Review Recommendations",
        actionType: "read",
        handlerLocation: "src/pages/admin/REX01RecommendationIntelligence.tsx",
        primaryServiceKey: "recommendation-loop-service",
        secondaryServiceKeys: [],
        providerDependencies: ["supabase"],
        dbDependencies: ["ai_workforce_recommendations", "ai_workforce_recommendation_scores"],
        customerJourneyKeys: ["admin.recommendation_approve_bind_execute"],
        launchCriticality: "high",
        isCanonical: true,
        notes: "",
      },
    ],
  },
  {
    routeKey: "admin-rex-execution",
    routePath: "/admin/rex/execution",
    surfaceClass: "admin",
    domainFamily: "recommendation-execution",
    flagshipLoopKey: "admin-truth-recommendation-approval",
    primaryPersona: "operator",
    ownerTeam: "platform",
    canonicalPathConfidence: "high",
    shadowServiceRisk: "low",
    actions: [
      {
        actionKey: "bind_recommendation",
        actionLabel: "Bind Recommendation to Execution",
        actionType: "execute",
        handlerLocation: "src/pages/admin/REX03RecommendationExecution.tsx",
        primaryServiceKey: "recommendation-loop-service",
        secondaryServiceKeys: ["approval-service"],
        providerDependencies: ["supabase"],
        dbDependencies: ["recommendation_execution_bindings", "recommendation_execution_events"],
        customerJourneyKeys: ["admin.recommendation_approve_bind_execute"],
        launchCriticality: "high",
        isCanonical: true,
        notes: "New execution binding tables",
      },
    ],
  },
  {
    routeKey: "admin-rex-outcomes",
    routePath: "/admin/rex/outcomes",
    surfaceClass: "admin",
    domainFamily: "recommendation-execution",
    flagshipLoopKey: "admin-truth-recommendation-approval",
    primaryPersona: "operator",
    ownerTeam: "platform",
    canonicalPathConfidence: "high",
    shadowServiceRisk: "low",
    actions: [
      {
        actionKey: "verify_outcome",
        actionLabel: "Verify Execution Outcome",
        actionType: "approve",
        handlerLocation: "src/pages/admin/REX05OutcomeVerification.tsx",
        primaryServiceKey: "recommendation-loop-service",
        secondaryServiceKeys: ["outcome-verification-service"],
        providerDependencies: ["supabase"],
        dbDependencies: ["recommendation_outcome_verifications", "recommendation_learning_signals"],
        customerJourneyKeys: ["admin.outcome_verification_review"],
        launchCriticality: "high",
        isCanonical: true,
        notes: "",
      },
    ],
  },
  {
    routeKey: "admin-truth-registry",
    routePath: "/admin/truth-registry",
    surfaceClass: "admin",
    domainFamily: "admin-truth",
    flagshipLoopKey: "admin-truth-recommendation-approval",
    primaryPersona: "operator",
    ownerTeam: "platform",
    canonicalPathConfidence: "high",
    shadowServiceRisk: "medium",
    actions: [
      {
        actionKey: "inspect_truth",
        actionLabel: "Inspect Runtime Truth",
        actionType: "read",
        handlerLocation: "src/pages/admin/TruthIndexDashboard.tsx",
        primaryServiceKey: "admin-truth-service",
        secondaryServiceKeys: ["launch-readiness-service"],
        providerDependencies: ["supabase"],
        dbDependencies: ["multiple"],
        customerJourneyKeys: ["admin.runtime_truth.open_primary"],
        launchCriticality: "high",
        isCanonical: true,
        notes: "Multiple truth boards exist — this is the executive view",
      },
    ],
  },
  {
    routeKey: "admin-services-ownership",
    routePath: "/admin/services/ownership",
    surfaceClass: "admin",
    domainFamily: "admin-truth",
    flagshipLoopKey: "admin-truth-recommendation-approval",
    primaryPersona: "operator",
    ownerTeam: "platform",
    canonicalPathConfidence: "high",
    shadowServiceRisk: "low",
    actions: [
      {
        actionKey: "audit_services",
        actionLabel: "Audit Service Ownership",
        actionType: "read",
        handlerLocation: "src/pages/admin/SERV01ServiceOwnership.tsx",
        primaryServiceKey: "service-ownership-registry",
        secondaryServiceKeys: [],
        providerDependencies: [],
        dbDependencies: [],
        customerJourneyKeys: ["admin.service_traceability_audit"],
        launchCriticality: "medium",
        isCanonical: true,
        notes: "Static registry — no DB dependency",
      },
    ],
  },
  {
    routeKey: "admin-flagship-executive",
    routePath: "/admin/flagship/executive",
    surfaceClass: "admin",
    domainFamily: "admin-truth",
    flagshipLoopKey: "admin-truth-recommendation-approval",
    primaryPersona: "operator",
    ownerTeam: "platform",
    canonicalPathConfidence: "high",
    shadowServiceRisk: "low",
    actions: [
      {
        actionKey: "review_flagship_loops",
        actionLabel: "Review Flagship Loops",
        actionType: "read",
        handlerLocation: "src/pages/admin/FL01FlagshipLoopsExecutive.tsx",
        primaryServiceKey: "flagship-loop-service",
        secondaryServiceKeys: [],
        providerDependencies: ["supabase"],
        dbDependencies: ["flagship_loops"],
        customerJourneyKeys: ["admin.flagship_loop_inspect"],
        launchCriticality: "high",
        isCanonical: true,
        notes: "",
      },
    ],
  },
];

// ── Helpers ──

export function getRoutesByFlagshipLoop(loopKey: string): RouteInventoryEntry[] {
  return ROUTE_SERVICE_INVENTORY.filter((r) => r.flagshipLoopKey === loopKey);
}

export function getRouteByKey(routeKey: string): RouteInventoryEntry | undefined {
  return ROUTE_SERVICE_INVENTORY.find((r) => r.routeKey === routeKey);
}

export function getRoutesWithShadowRisk(): RouteInventoryEntry[] {
  return ROUTE_SERVICE_INVENTORY.filter((r) => r.shadowServiceRisk !== "low");
}

export function getRoutesWithLowConfidence(): RouteInventoryEntry[] {
  return ROUTE_SERVICE_INVENTORY.filter((r) => r.canonicalPathConfidence === "low");
}

export function getAllActions(): Array<RouteAction & { routeKey: string; routePath: string }> {
  return ROUTE_SERVICE_INVENTORY.flatMap((r) =>
    r.actions.map((a) => ({ ...a, routeKey: r.routeKey, routePath: r.routePath }))
  );
}

export function getDuplicateActionPatterns(): Array<{ actionKey: string; count: number; routes: string[] }> {
  const actionMap = new Map<string, string[]>();
  for (const route of ROUTE_SERVICE_INVENTORY) {
    for (const action of route.actions) {
      const existing = actionMap.get(action.primaryServiceKey) || [];
      existing.push(route.routeKey);
      actionMap.set(action.primaryServiceKey, existing);
    }
  }
  return Array.from(actionMap.entries())
    .filter(([, routes]) => routes.length > 1)
    .map(([actionKey, routes]) => ({ actionKey, count: routes.length, routes }));
}
