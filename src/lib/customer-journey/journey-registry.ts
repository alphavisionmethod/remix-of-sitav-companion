// ═══════════════════════════════════════════════════════════════
// SITA OS — Customer Journey Registry
// Complete inventory of every human clickthrough journey
// ═══════════════════════════════════════════════════════════════

export interface JourneyStep {
  order: number;
  name: string;
  expectedBehavior: string;
}

export interface JourneyDefinition {
  journeyKey: string;
  displayName: string;
  persona: "user" | "operator" | "admin" | "internal_test";
  domain: string;
  routeFamily: string;
  surfaceClass?: string;
  primaryModes: string[];
  steps: JourneyStep[];
  expectedOutcome: string;
  launchImportance: "launch_blocker" | "pilot_blocker" | "claim_risk" | "important_non_blocker" | "non_blocking";
  dependencies: string[];
  owner: string;
}

export type JourneyStatus = "working" | "partial" | "demo_governed" | "degraded_usable" | "broken" | "planned" | "internal_only";
export type LaunchImpact = "launch_blocker" | "pilot_blocker" | "claim_risk" | "important_non_blocker" | "non_blocking";
export type ProofConfidence = "verified_e2e" | "verified_interaction" | "verified_component_only" | "manually_confirmed" | "unverified";

export const CUSTOMER_JOURNEY_REGISTRY: JourneyDefinition[] = [
  // ── A. Entry / Auth Journeys ──
  {
    journeyKey: "auth.sign_in",
    displayName: "Sign In (Email/Password)",
    persona: "user",
    domain: "auth",
    routeFamily: "/login",
    primaryModes: ["real"],
    steps: [
      { order: 1, name: "Navigate to /login", expectedBehavior: "Login page renders with email/password fields" },
      { order: 2, name: "Enter credentials", expectedBehavior: "Fields accept input, validation runs" },
      { order: 3, name: "Click sign in", expectedBehavior: "Auth request sent, loading state shown" },
      { order: 4, name: "Redirect to dashboard", expectedBehavior: "User lands on / with session active" },
    ],
    expectedOutcome: "User is authenticated and sees the dashboard",
    launchImportance: "launch_blocker",
    dependencies: ["supabase_auth"],
    owner: "platform",
  },
  {
    journeyKey: "auth.sign_up",
    displayName: "Sign Up (New Account)",
    persona: "user",
    domain: "auth",
    routeFamily: "/signup",
    primaryModes: ["real"],
    steps: [
      { order: 1, name: "Navigate to /signup", expectedBehavior: "Signup page renders" },
      { order: 2, name: "Enter email + password", expectedBehavior: "Fields accept input" },
      { order: 3, name: "Click create account", expectedBehavior: "Account created, confirmation sent or auto-login" },
      { order: 4, name: "Arrive at onboarding or dashboard", expectedBehavior: "New user flow begins" },
    ],
    expectedOutcome: "New account created and user enters the app",
    launchImportance: "launch_blocker",
    dependencies: ["supabase_auth"],
    owner: "platform",
  },
  {
    journeyKey: "auth.logout",
    displayName: "Logout",
    persona: "user",
    domain: "auth",
    routeFamily: "/",
    primaryModes: ["real"],
    steps: [
      { order: 1, name: "Click logout in settings/sidebar", expectedBehavior: "Logout action triggered" },
      { order: 2, name: "Session cleared", expectedBehavior: "Redirected to /login" },
    ],
    expectedOutcome: "User is logged out and redirected to login",
    launchImportance: "launch_blocker",
    dependencies: ["supabase_auth"],
    owner: "platform",
  },
  {
    journeyKey: "auth.session_persistence",
    displayName: "Session Persistence (Refresh)",
    persona: "user",
    domain: "auth",
    routeFamily: "/",
    primaryModes: ["real"],
    steps: [
      { order: 1, name: "Sign in successfully", expectedBehavior: "Session token stored" },
      { order: 2, name: "Refresh the page", expectedBehavior: "Session restored, no login redirect" },
    ],
    expectedOutcome: "User remains authenticated after page refresh",
    launchImportance: "launch_blocker",
    dependencies: ["supabase_auth"],
    owner: "platform",
  },
  {
    journeyKey: "auth.forgot_password",
    displayName: "Forgot Password Flow",
    persona: "user",
    domain: "auth",
    routeFamily: "/forgot-password",
    primaryModes: ["real"],
    steps: [
      { order: 1, name: "Navigate to /forgot-password", expectedBehavior: "Reset form renders" },
      { order: 2, name: "Enter email", expectedBehavior: "Field accepts input" },
      { order: 3, name: "Click send reset", expectedBehavior: "Email sent confirmation shown" },
    ],
    expectedOutcome: "Password reset email sent to user",
    launchImportance: "pilot_blocker",
    dependencies: ["supabase_auth"],
    owner: "platform",
  },

  // ── B. Core User App Journeys ──
  {
    journeyKey: "dashboard.load",
    displayName: "Dashboard Load",
    persona: "user",
    domain: "core",
    routeFamily: "/",
    primaryModes: ["real", "demo"],
    steps: [
      { order: 1, name: "Navigate to /", expectedBehavior: "Dashboard page loads" },
      { order: 2, name: "Widgets render", expectedBehavior: "Key cards, metrics, summaries visible" },
      { order: 3, name: "Data populates", expectedBehavior: "Mode-appropriate data shown (real or demo)" },
    ],
    expectedOutcome: "Dashboard loads with accurate data for current mode",
    launchImportance: "launch_blocker",
    dependencies: ["supabase_db"],
    owner: "core",
  },
  {
    journeyKey: "navigation.sidebar",
    displayName: "Sidebar Navigation",
    persona: "user",
    domain: "core",
    routeFamily: "/",
    primaryModes: ["real", "demo"],
    steps: [
      { order: 1, name: "View sidebar links", expectedBehavior: "All nav items visible" },
      { order: 2, name: "Click each primary link", expectedBehavior: "Navigates to correct route" },
      { order: 3, name: "Active state updates", expectedBehavior: "Current route highlighted" },
    ],
    expectedOutcome: "All sidebar navigation links work correctly",
    launchImportance: "launch_blocker",
    dependencies: [],
    owner: "core",
  },
  {
    journeyKey: "files.browse",
    displayName: "Browse Files",
    persona: "user",
    domain: "files",
    routeFamily: "/files",
    primaryModes: ["real", "demo"],
    steps: [
      { order: 1, name: "Navigate to /files", expectedBehavior: "Files page loads" },
      { order: 2, name: "File list renders", expectedBehavior: "Uploaded files or empty state shown" },
      { order: 3, name: "Filter/sort if available", expectedBehavior: "List updates accordingly" },
    ],
    expectedOutcome: "User can browse their files",
    launchImportance: "launch_blocker",
    dependencies: ["supabase_storage"],
    owner: "files",
  },
  {
    journeyKey: "files.upload",
    displayName: "Upload File",
    persona: "user",
    domain: "files",
    routeFamily: "/files",
    primaryModes: ["real"],
    steps: [
      { order: 1, name: "Click upload button", expectedBehavior: "File picker opens" },
      { order: 2, name: "Select file", expectedBehavior: "File selected" },
      { order: 3, name: "Upload completes", expectedBehavior: "Progress shown, file appears in list" },
      { order: 4, name: "File persists after refresh", expectedBehavior: "File still visible" },
    ],
    expectedOutcome: "File is uploaded and persisted in storage",
    launchImportance: "launch_blocker",
    dependencies: ["supabase_storage"],
    owner: "files",
  },
  {
    journeyKey: "boardroom.open",
    displayName: "Boardroom Load",
    persona: "user",
    domain: "boardroom",
    routeFamily: "/boardroom",
    primaryModes: ["real", "demo"],
    steps: [
      { order: 1, name: "Navigate to /boardroom", expectedBehavior: "Boardroom page loads" },
      { order: 2, name: "Summary content renders", expectedBehavior: "Briefing or summary shown" },
    ],
    expectedOutcome: "Boardroom loads with relevant content",
    launchImportance: "pilot_blocker",
    dependencies: ["ai_provider"],
    owner: "boardroom",
  },
  {
    journeyKey: "boardroom.refresh",
    displayName: "Boardroom Refresh/Generate",
    persona: "user",
    domain: "boardroom",
    routeFamily: "/boardroom",
    primaryModes: ["real", "demo"],
    steps: [
      { order: 1, name: "Click refresh/generate", expectedBehavior: "Loading state shown" },
      { order: 2, name: "New content generates", expectedBehavior: "Updated summary appears" },
    ],
    expectedOutcome: "Boardroom content refreshes with new data",
    launchImportance: "pilot_blocker",
    dependencies: ["ai_provider"],
    owner: "boardroom",
  },
  {
    journeyKey: "assistant.open",
    displayName: "Open AI Assistant",
    persona: "user",
    domain: "ai",
    routeFamily: "/advisors",
    primaryModes: ["real", "demo"],
    steps: [
      { order: 1, name: "Navigate to advisor/assistant", expectedBehavior: "Chat interface loads" },
      { order: 2, name: "Chat input visible", expectedBehavior: "Message input ready" },
    ],
    expectedOutcome: "AI assistant chat is ready for interaction",
    launchImportance: "launch_blocker",
    dependencies: ["ai_provider"],
    owner: "ai",
  },
  {
    journeyKey: "assistant.send_message",
    displayName: "Send Assistant Message",
    persona: "user",
    domain: "ai",
    routeFamily: "/advisors",
    primaryModes: ["real", "demo"],
    steps: [
      { order: 1, name: "Type message", expectedBehavior: "Input accepts text" },
      { order: 2, name: "Click send", expectedBehavior: "Message sent, loading indicator" },
      { order: 3, name: "Response received", expectedBehavior: "AI response appears in chat" },
    ],
    expectedOutcome: "AI responds to user message",
    launchImportance: "launch_blocker",
    dependencies: ["ai_provider"],
    owner: "ai",
  },
  {
    journeyKey: "approvals.open",
    displayName: "Open Approvals",
    persona: "user",
    domain: "approvals",
    routeFamily: "/approvals",
    primaryModes: ["real", "demo"],
    steps: [
      { order: 1, name: "Navigate to /approvals", expectedBehavior: "Approvals page loads" },
      { order: 2, name: "Pending items render", expectedBehavior: "List of approvals or empty state" },
    ],
    expectedOutcome: "Approval queue is visible",
    launchImportance: "important_non_blocker",
    dependencies: ["supabase_db"],
    owner: "approvals",
  },
  {
    journeyKey: "approvals.decision",
    displayName: "Approve/Reject Decision",
    persona: "user",
    domain: "approvals",
    routeFamily: "/approvals",
    primaryModes: ["real"],
    steps: [
      { order: 1, name: "Select an approval item", expectedBehavior: "Detail/action panel opens" },
      { order: 2, name: "Click approve or reject", expectedBehavior: "Status updates, record persists" },
      { order: 3, name: "Confirmation shown", expectedBehavior: "Toast or status change visible" },
    ],
    expectedOutcome: "Approval decision is recorded and reflected",
    launchImportance: "important_non_blocker",
    dependencies: ["supabase_db"],
    owner: "approvals",
  },
  {
    journeyKey: "connectors.open",
    displayName: "Open Connected Services",
    persona: "user",
    domain: "connectors",
    routeFamily: "/connector-hub",
    primaryModes: ["real", "demo"],
    steps: [
      { order: 1, name: "Navigate to /connector-hub", expectedBehavior: "Connector hub loads" },
      { order: 2, name: "Available connectors shown", expectedBehavior: "List of services rendered" },
    ],
    expectedOutcome: "Connected services page loads with available integrations",
    launchImportance: "important_non_blocker",
    dependencies: [],
    owner: "connectors",
  },
  {
    journeyKey: "connectors.connect_entry",
    displayName: "Connector Connect Flow Entry",
    persona: "user",
    domain: "connectors",
    routeFamily: "/connector-hub",
    primaryModes: ["real"],
    steps: [
      { order: 1, name: "Click connect on a service", expectedBehavior: "OAuth or config flow starts" },
      { order: 2, name: "Complete auth/config", expectedBehavior: "Connection established" },
      { order: 3, name: "Status updates", expectedBehavior: "Connected state shown" },
    ],
    expectedOutcome: "Connector successfully connected",
    launchImportance: "pilot_blocker",
    dependencies: ["oauth_provider"],
    owner: "connectors",
  },
  {
    journeyKey: "settings.account",
    displayName: "Account Settings",
    persona: "user",
    domain: "settings",
    routeFamily: "/settings",
    primaryModes: ["real"],
    steps: [
      { order: 1, name: "Navigate to /settings", expectedBehavior: "Settings page loads" },
      { order: 2, name: "Profile fields visible", expectedBehavior: "Name, email, preferences shown" },
      { order: 3, name: "Edit and save", expectedBehavior: "Changes persist after refresh" },
    ],
    expectedOutcome: "User can view and update account settings",
    launchImportance: "important_non_blocker",
    dependencies: ["supabase_db"],
    owner: "settings",
  },

  // ── C. AI Journeys ──
  {
    journeyKey: "ai.degraded_state",
    displayName: "AI Degraded State Handling",
    persona: "user",
    domain: "ai",
    routeFamily: "/advisors",
    primaryModes: ["real"],
    steps: [
      { order: 1, name: "AI provider unavailable", expectedBehavior: "Degraded notice shown" },
      { order: 2, name: "User sees honest message", expectedBehavior: "No silent failure or fake response" },
    ],
    expectedOutcome: "User is honestly informed when AI is degraded",
    launchImportance: "launch_blocker",
    dependencies: ["ai_provider"],
    owner: "ai",
  },
  {
    journeyKey: "ai.missing_provider_honesty",
    displayName: "Missing AI Provider Honesty",
    persona: "user",
    domain: "ai",
    routeFamily: "/advisors",
    primaryModes: ["real"],
    steps: [
      { order: 1, name: "No API key configured", expectedBehavior: "Clear message about missing provider" },
      { order: 2, name: "No fake responses generated", expectedBehavior: "System refuses rather than fabricates" },
    ],
    expectedOutcome: "System honestly reports missing AI capability",
    launchImportance: "launch_blocker",
    dependencies: [],
    owner: "ai",
  },

  // ── D. Admin/Operator Journeys ──
  {
    journeyKey: "admin.runtime_truth",
    displayName: "Admin Runtime Truth Board",
    persona: "operator",
    domain: "admin",
    routeFamily: "/admin",
    primaryModes: ["real"],
    steps: [
      { order: 1, name: "Navigate to admin truth board", expectedBehavior: "Board loads with real metrics" },
      { order: 2, name: "Service statuses visible", expectedBehavior: "Green/yellow/red indicators" },
    ],
    expectedOutcome: "Operator sees real runtime truth",
    launchImportance: "important_non_blocker",
    dependencies: ["supabase_db"],
    owner: "admin",
  },
  {
    journeyKey: "admin.approval_queue",
    displayName: "Admin Approval Queue",
    persona: "operator",
    domain: "admin",
    routeFamily: "/owner",
    primaryModes: ["real"],
    steps: [
      { order: 1, name: "Navigate to owner center", expectedBehavior: "Approval queue visible" },
      { order: 2, name: "Review and act on items", expectedBehavior: "Approve/reject works" },
    ],
    expectedOutcome: "Operator can manage approvals",
    launchImportance: "important_non_blocker",
    dependencies: ["supabase_db"],
    owner: "admin",
  },
  {
    journeyKey: "admin.launch_readiness",
    displayName: "Launch Readiness Board",
    persona: "operator",
    domain: "admin",
    routeFamily: "/admin/launch-readiness",
    primaryModes: ["real"],
    steps: [
      { order: 1, name: "Navigate to launch readiness", expectedBehavior: "Board loads" },
      { order: 2, name: "Domain scores visible", expectedBehavior: "Launch status per domain shown" },
    ],
    expectedOutcome: "Operator sees launch readiness status",
    launchImportance: "important_non_blocker",
    dependencies: [],
    owner: "admin",
  },

  // ── E. Demo Mode Journeys ──
  {
    journeyKey: "demo.dashboard",
    displayName: "Demo Dashboard Experience",
    persona: "user",
    domain: "demo",
    routeFamily: "/",
    primaryModes: ["demo"],
    steps: [
      { order: 1, name: "Switch to demo mode", expectedBehavior: "Mode indicator updates" },
      { order: 2, name: "Dashboard loads demo data", expectedBehavior: "Scenario data populates" },
      { order: 3, name: "Demo label visible", expectedBehavior: "User knows they are in demo" },
    ],
    expectedOutcome: "Demo dashboard works with clearly labeled demo data",
    launchImportance: "important_non_blocker",
    dependencies: [],
    owner: "platform",
  },
  {
    journeyKey: "demo.assistant",
    displayName: "Demo AI Assistant",
    persona: "user",
    domain: "demo",
    routeFamily: "/advisors",
    primaryModes: ["demo"],
    steps: [
      { order: 1, name: "Open assistant in demo mode", expectedBehavior: "Chat loads with demo context" },
      { order: 2, name: "Send message", expectedBehavior: "Demo response generated" },
    ],
    expectedOutcome: "AI assistant works in demo mode with appropriate labeling",
    launchImportance: "non_blocking",
    dependencies: [],
    owner: "ai",
  },

  // ── F. Onboarding ──
  {
    journeyKey: "onboarding.new_user",
    displayName: "New User Onboarding",
    persona: "user",
    domain: "onboarding",
    routeFamily: "/onboarding",
    primaryModes: ["real"],
    steps: [
      { order: 1, name: "Arrive at onboarding", expectedBehavior: "Onboarding flow starts" },
      { order: 2, name: "Complete steps", expectedBehavior: "Progress through onboarding" },
      { order: 3, name: "Land on dashboard", expectedBehavior: "Onboarding complete, dashboard shown" },
    ],
    expectedOutcome: "New user successfully completes onboarding",
    launchImportance: "pilot_blocker",
    dependencies: ["supabase_auth", "supabase_db"],
    owner: "platform",
  },

  // ── G. Search ──
  {
    journeyKey: "search.global",
    displayName: "Global Search",
    persona: "user",
    domain: "core",
    routeFamily: "/search",
    primaryModes: ["real", "demo"],
    steps: [
      { order: 1, name: "Open search", expectedBehavior: "Search UI appears" },
      { order: 2, name: "Type query", expectedBehavior: "Results populate" },
      { order: 3, name: "Click result", expectedBehavior: "Navigates to target" },
    ],
    expectedOutcome: "User can search and navigate to results",
    launchImportance: "important_non_blocker",
    dependencies: [],
    owner: "core",
  },

  // ── H. Money ──
  {
    journeyKey: "money.overview",
    displayName: "Money Center Overview",
    persona: "user",
    domain: "finance",
    routeFamily: "/money",
    primaryModes: ["real", "demo"],
    steps: [
      { order: 1, name: "Navigate to /money", expectedBehavior: "Money center loads" },
      { order: 2, name: "Financial data renders", expectedBehavior: "Balances, transactions, or empty state" },
    ],
    expectedOutcome: "Money center loads with appropriate data",
    launchImportance: "pilot_blocker",
    dependencies: ["supabase_db"],
    owner: "finance",
  },

  // ── I. Business Center ──
  {
    journeyKey: "business.overview",
    displayName: "Business Center Overview",
    persona: "user",
    domain: "business",
    routeFamily: "/business",
    primaryModes: ["real", "demo"],
    steps: [
      { order: 1, name: "Navigate to /business", expectedBehavior: "Business center loads" },
      { order: 2, name: "CRM/client data renders", expectedBehavior: "Customer list or empty state" },
    ],
    expectedOutcome: "Business center loads with data",
    launchImportance: "important_non_blocker",
    dependencies: ["supabase_db"],
    owner: "business",
  },

  // ── J. Connector + Notification Journeys ──
  {
    journeyKey: "connectors.google_drive_connect_entry",
    displayName: "Google Drive Connect (OAuth)",
    persona: "user",
    domain: "connectors",
    routeFamily: "/connectors",
    primaryModes: ["real"],
    steps: [
      { order: 1, name: "Click Connect on Google Drive", expectedBehavior: "OAuth initiation request sent" },
      { order: 2, name: "Google consent screen opens", expectedBehavior: "Authorization URL opens in popup" },
      { order: 3, name: "User grants consent", expectedBehavior: "Callback received with auth code" },
      { order: 4, name: "Token exchange completes", expectedBehavior: "Tokens stored, account connected" },
    ],
    expectedOutcome: "Google Drive connector is connected with real OAuth tokens",
    launchImportance: "pilot_blocker",
    dependencies: ["google_oauth_client"],
    owner: "connectors",
  },
  {
    journeyKey: "notifications.permission_enable_web",
    displayName: "Enable Web Push Permission",
    persona: "user",
    domain: "notifications",
    routeFamily: "/settings",
    primaryModes: ["real"],
    steps: [
      { order: 1, name: "Navigate to notification settings", expectedBehavior: "Push permission UI visible" },
      { order: 2, name: "Click enable push", expectedBehavior: "Browser permission prompt appears" },
      { order: 3, name: "Grant permission", expectedBehavior: "Subscription created and persisted" },
    ],
    expectedOutcome: "Web push subscription is active and stored",
    launchImportance: "important_non_blocker",
    dependencies: ["vapid_keys"],
    owner: "notifications",
  },
  {
    journeyKey: "notifications.push_subscription_primary",
    displayName: "Push Subscription Persistence",
    persona: "user",
    domain: "notifications",
    routeFamily: "/settings",
    primaryModes: ["real"],
    steps: [
      { order: 1, name: "Enable push notifications", expectedBehavior: "Subscription created" },
      { order: 2, name: "Refresh page", expectedBehavior: "Subscription still active" },
      { order: 3, name: "Token in device_push_tokens", expectedBehavior: "DB record persists" },
    ],
    expectedOutcome: "Push subscription survives page refresh",
    launchImportance: "important_non_blocker",
    dependencies: ["vapid_keys", "supabase_db"],
    owner: "notifications",
  },
  {
    journeyKey: "notifications.receive_web_push_primary",
    displayName: "Receive Web Push Notification",
    persona: "user",
    domain: "notifications",
    routeFamily: "/",
    primaryModes: ["real"],
    steps: [
      { order: 1, name: "Event triggers notification", expectedBehavior: "Row inserted in notifications_queue" },
      { order: 2, name: "Push dispatch fires", expectedBehavior: "Web push sent via VAPID" },
      { order: 3, name: "Browser shows notification", expectedBehavior: "System notification appears" },
      { order: 4, name: "Delivery receipt written", expectedBehavior: "notification_delivery_receipts row created" },
    ],
    expectedOutcome: "User receives a real browser push notification",
    launchImportance: "important_non_blocker",
    dependencies: ["vapid_keys", "push_dispatch"],
    owner: "notifications",
  },
];

// ── Helpers ──
export function getJourneysByDomain(domain: string) {
  return CUSTOMER_JOURNEY_REGISTRY.filter((j) => j.domain === domain);
}

export function getJourneysByImportance(importance: LaunchImpact) {
  return CUSTOMER_JOURNEY_REGISTRY.filter((j) => j.launchImportance === importance);
}

export function getJourneysByPersona(persona: string) {
  return CUSTOMER_JOURNEY_REGISTRY.filter((j) => j.persona === persona);
}

export function getLaunchBlockerJourneys() {
  return CUSTOMER_JOURNEY_REGISTRY.filter(
    (j) => j.launchImportance === "launch_blocker" || j.launchImportance === "pilot_blocker"
  );
}

export const JOURNEY_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  working: { label: "Working", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  partial: { label: "Partial", color: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  demo_governed: { label: "Demo Only", color: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  degraded_usable: { label: "Degraded", color: "bg-orange-500/15 text-orange-400 border-orange-500/30" },
  broken: { label: "Broken", color: "bg-destructive/15 text-destructive border-destructive/30" },
  planned: { label: "Planned", color: "bg-muted text-muted-foreground border-border" },
  internal_only: { label: "Internal", color: "bg-purple-500/15 text-purple-400 border-purple-500/30" },
  unverified: { label: "Unverified", color: "bg-muted text-muted-foreground border-border" },
};

export const LAUNCH_IMPACT_CONFIG: Record<string, { label: string; color: string }> = {
  launch_blocker: { label: "Launch Blocker", color: "bg-destructive/15 text-destructive" },
  pilot_blocker: { label: "Pilot Blocker", color: "bg-orange-500/15 text-orange-400" },
  claim_risk: { label: "Claim Risk", color: "bg-amber-500/15 text-amber-400" },
  important_non_blocker: { label: "Important", color: "bg-blue-500/15 text-blue-400" },
  non_blocking: { label: "Non-Blocking", color: "bg-muted text-muted-foreground" },
};
