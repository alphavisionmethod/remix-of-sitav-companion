// ═══════════════════════════════════════════════════════
// SITA OS — Full Surface & Interaction Registry
// Source of truth for every route, action, button, form
// ═══════════════════════════════════════════════════════

export type SurfaceShell = "public" | "user" | "admin" | "mobile" | "owner";
export type SurfaceClass = "page" | "tab" | "modal" | "drawer" | "card_action" | "button" | "form" | "form_field" | "table_action" | "ai_input" | "upload" | "toggle" | "navigation" | "redirect" | "keyboard_shortcut" | "command_palette";
export type ActionType = "navigation" | "submit" | "open_modal" | "open_drawer" | "close_modal" | "close_drawer" | "refresh" | "generate" | "upload" | "approve" | "reject" | "connect" | "disconnect" | "filter" | "search" | "expand" | "download" | "trigger_ai" | "copy" | "delete" | "edit" | "save" | "toggle" | "sign_in" | "sign_out" | "sign_up" | "keyboard_shortcut" | "command_action" | "redirect" | "focus_trap" | "escape";
export type TestPriority = "P0" | "P1" | "P2";
export type VerificationStatus = "untested" | "pass" | "fail" | "blocked" | "skipped";
export type LaunchHonestyClass = "real" | "demo_governed" | "simulated" | "structural" | "planned" | "unavailable";

export interface SurfaceEntry {
  routeKey: string;
  routePath: string;
  shell: SurfaceShell;
  surfaceClass: SurfaceClass;
  domain: string;
  componentName?: string;
  actionType: ActionType;
  actionLabel: string;
  actionSelector?: string;
  expectedResult: string;
  backendDependency?: string;
  supportedModes: string[];
  launchHonestyClass: LaunchHonestyClass;
  testPriority: TestPriority;
  owner?: string;
  // Extended fields for JVC boards
  redirectTarget?: string;
  formFields?: string[];
  focusTrapExpected?: boolean;
  shortcutKey?: string;
  shortcutConflicts?: string[];
  modalCleanupRequired?: boolean;
  expectedPersistence?: boolean;
  proofReceiptRequired?: boolean;
}

// ═══════════════════════════════════════════════════════
// P0 — LAUNCH CRITICAL SURFACES
// ═══════════════════════════════════════════════════════

const P0_AUTH: SurfaceEntry[] = [
  { routeKey: "auth.login", routePath: "/login", shell: "public", surfaceClass: "page", domain: "auth", actionType: "navigation", actionLabel: "Login Page", actionSelector: "[data-testid='login-page']", expectedResult: "Login form renders with email/password fields", supportedModes: ["real"], launchHonestyClass: "real", testPriority: "P0" },
  { routeKey: "auth.login.submit", routePath: "/login", shell: "public", surfaceClass: "form", domain: "auth", actionType: "sign_in", actionLabel: "Sign In", actionSelector: "[data-testid='login-submit']", expectedResult: "User authenticated, redirected to /", backendDependency: "supabase.auth.signInWithPassword", supportedModes: ["real"], launchHonestyClass: "real", testPriority: "P0" },
  { routeKey: "auth.signup", routePath: "/signup", shell: "public", surfaceClass: "page", domain: "auth", actionType: "navigation", actionLabel: "Signup Page", actionSelector: "[data-testid='signup-page']", expectedResult: "Signup form renders", supportedModes: ["real"], launchHonestyClass: "real", testPriority: "P0" },
  { routeKey: "auth.signup.submit", routePath: "/signup", shell: "public", surfaceClass: "form", domain: "auth", actionType: "sign_up", actionLabel: "Create Account", actionSelector: "[data-testid='signup-submit']", expectedResult: "Account created, verification email sent", backendDependency: "supabase.auth.signUp", supportedModes: ["real"], launchHonestyClass: "real", testPriority: "P0" },
  { routeKey: "auth.forgot_password", routePath: "/forgot-password", shell: "public", surfaceClass: "page", domain: "auth", actionType: "navigation", actionLabel: "Forgot Password", expectedResult: "Password reset form renders", supportedModes: ["real"], launchHonestyClass: "real", testPriority: "P0" },
  { routeKey: "auth.signout", routePath: "/", shell: "user", surfaceClass: "button", domain: "auth", actionType: "sign_out", actionLabel: "Sign Out", actionSelector: "[data-testid='sign-out-btn']", expectedResult: "User signed out, redirected to /login", backendDependency: "supabase.auth.signOut", supportedModes: ["real"], launchHonestyClass: "real", testPriority: "P0" },
];

const P0_NAVIGATION: SurfaceEntry[] = [
  { routeKey: "nav.home", routePath: "/", shell: "user", surfaceClass: "page", domain: "core", actionType: "navigation", actionLabel: "Daily Pulse", actionSelector: "[data-testid='nav-home']", expectedResult: "Daily Pulse page renders with data", supportedModes: ["real", "demo"], launchHonestyClass: "real", testPriority: "P0" },
  { routeKey: "nav.sidebar", routePath: "/", shell: "user", surfaceClass: "navigation", domain: "core", actionType: "navigation", actionLabel: "Sidebar Navigation", actionSelector: "[data-testid='sidebar-nav']", expectedResult: "Sidebar renders with all domain links", supportedModes: ["real", "demo"], launchHonestyClass: "real", testPriority: "P0" },
];

const P0_FILES: SurfaceEntry[] = [
  { routeKey: "files.page", routePath: "/files", shell: "user", surfaceClass: "page", domain: "files", actionType: "navigation", actionLabel: "Files Center", actionSelector: "[data-testid='files-page']", expectedResult: "Files page renders with file list", backendDependency: "storage.documents", supportedModes: ["real", "demo"], launchHonestyClass: "real", testPriority: "P0" },
  { routeKey: "files.upload", routePath: "/files", shell: "user", surfaceClass: "upload", domain: "files", actionType: "upload", actionLabel: "Upload File", actionSelector: "[data-testid='file-upload']", expectedResult: "File uploaded to storage, appears in list", backendDependency: "storage.documents.upload", supportedModes: ["real"], launchHonestyClass: "real", testPriority: "P0" },
];

const P0_BOARDROOM: SurfaceEntry[] = [
  { routeKey: "boardroom.page", routePath: "/boardroom", shell: "user", surfaceClass: "page", domain: "boardroom", actionType: "navigation", actionLabel: "Boardroom", actionSelector: "[data-testid='boardroom-page']", expectedResult: "Boardroom renders with summary cards", supportedModes: ["real", "demo"], launchHonestyClass: "real", testPriority: "P0" },
  { routeKey: "boardroom.refresh", routePath: "/boardroom", shell: "user", surfaceClass: "button", domain: "boardroom", actionType: "refresh", actionLabel: "Refresh Summary", actionSelector: "[data-testid='boardroom-refresh']", expectedResult: "Boardroom data refreshes", supportedModes: ["real", "demo"], launchHonestyClass: "real", testPriority: "P0" },
];

const P0_AI: SurfaceEntry[] = [
  { routeKey: "advisors.page", routePath: "/advisors", shell: "user", surfaceClass: "page", domain: "ai", actionType: "navigation", actionLabel: "Advisor Workspace", actionSelector: "[data-testid='advisors-page']", expectedResult: "Advisor list renders", supportedModes: ["real", "demo"], launchHonestyClass: "real", testPriority: "P0" },
  { routeKey: "advisors.chat.send", routePath: "/advisors/:advisorId", shell: "user", surfaceClass: "ai_input", domain: "ai", actionType: "trigger_ai", actionLabel: "Send AI Prompt", actionSelector: "[data-testid='advisor-chat-send']", expectedResult: "AI response received and displayed", backendDependency: "edge:ai-gateway", supportedModes: ["real", "demo"], launchHonestyClass: "real", testPriority: "P0" },
];

const P0_APPROVALS: SurfaceEntry[] = [
  { routeKey: "approvals.page", routePath: "/approvals", shell: "user", surfaceClass: "page", domain: "approvals", actionType: "navigation", actionLabel: "Approvals Center", actionSelector: "[data-testid='approvals-page']", expectedResult: "Approval queue renders", backendDependency: "approval_queue", supportedModes: ["real", "demo"], launchHonestyClass: "real", testPriority: "P0" },
  { routeKey: "approvals.approve", routePath: "/approvals", shell: "user", surfaceClass: "button", domain: "approvals", actionType: "approve", actionLabel: "Approve Item", actionSelector: "[data-testid='approval-approve-btn']", expectedResult: "Item status changes to approved", backendDependency: "approval_queue.update", supportedModes: ["real"], launchHonestyClass: "real", testPriority: "P0" },
  { routeKey: "approvals.reject", routePath: "/approvals", shell: "user", surfaceClass: "button", domain: "approvals", actionType: "reject", actionLabel: "Reject Item", actionSelector: "[data-testid='approval-reject-btn']", expectedResult: "Item status changes to rejected", backendDependency: "approval_queue.update", supportedModes: ["real"], launchHonestyClass: "real", testPriority: "P0" },
];

const P0_CONNECTORS: SurfaceEntry[] = [
  { routeKey: "connectors.page", routePath: "/connectors", shell: "user", surfaceClass: "page", domain: "connectors", actionType: "navigation", actionLabel: "Connector Hub", actionSelector: "[data-testid='connectors-page']", expectedResult: "Connectors page renders with available services", supportedModes: ["real", "demo"], launchHonestyClass: "real", testPriority: "P0" },
];

const P0_ADMIN: SurfaceEntry[] = [
  { routeKey: "admin.ai_runtime", routePath: "/admin/ai-runtime", shell: "admin", surfaceClass: "page", domain: "admin", actionType: "navigation", actionLabel: "AI Runtime Status", actionSelector: "[data-testid='admin-ai-runtime']", expectedResult: "Runtime status board renders with provider health", supportedModes: ["real"], launchHonestyClass: "real", testPriority: "P0" },
  { routeKey: "admin.team", routePath: "/admin/team", shell: "admin", surfaceClass: "page", domain: "admin", actionType: "navigation", actionLabel: "AI Team Management", actionSelector: "[data-testid='admin-team']", expectedResult: "Team registry renders with advisors", backendDependency: "advisor_registry", supportedModes: ["real"], launchHonestyClass: "real", testPriority: "P0" },
  { routeKey: "admin.approvals", routePath: "/admin/ai-approvals", shell: "admin", surfaceClass: "page", domain: "admin", actionType: "navigation", actionLabel: "AI Approval Desk", actionSelector: "[data-testid='admin-approvals']", expectedResult: "Approval desk renders", backendDependency: "approval_queue", supportedModes: ["real"], launchHonestyClass: "real", testPriority: "P0" },
];

// ═══════════════════════════════════════════════════════
// P1 — IMPORTANT SURFACES
// ═══════════════════════════════════════════════════════

const P1_BUSINESS: SurfaceEntry[] = [
  { routeKey: "business.page", routePath: "/business", shell: "user", surfaceClass: "page", domain: "business", actionType: "navigation", actionLabel: "Business Center", expectedResult: "Business overview renders", supportedModes: ["real", "demo"], launchHonestyClass: "real", testPriority: "P1" },
  { routeKey: "business.leads", routePath: "/business/leads", shell: "user", surfaceClass: "tab", domain: "business", actionType: "navigation", actionLabel: "Leads Tab", expectedResult: "Leads list renders", supportedModes: ["real", "demo"], launchHonestyClass: "real", testPriority: "P1" },
  { routeKey: "business.customers", routePath: "/business/customers", shell: "user", surfaceClass: "tab", domain: "business", actionType: "navigation", actionLabel: "Customers Tab", expectedResult: "Customers list renders", supportedModes: ["real", "demo"], launchHonestyClass: "real", testPriority: "P1" },
  { routeKey: "business.invoices", routePath: "/business/invoices", shell: "user", surfaceClass: "tab", domain: "business", actionType: "navigation", actionLabel: "Invoices Tab", expectedResult: "Invoices list renders", supportedModes: ["real", "demo"], launchHonestyClass: "real", testPriority: "P1" },
];

const P1_MONEY: SurfaceEntry[] = [
  { routeKey: "money.page", routePath: "/money", shell: "user", surfaceClass: "page", domain: "money", actionType: "navigation", actionLabel: "Money Center", expectedResult: "Money overview renders", supportedModes: ["real", "demo"], launchHonestyClass: "real", testPriority: "P1" },
  { routeKey: "money.bills", routePath: "/money/bills", shell: "user", surfaceClass: "tab", domain: "money", actionType: "navigation", actionLabel: "Bills Tab", expectedResult: "Bills list renders", supportedModes: ["real", "demo"], launchHonestyClass: "real", testPriority: "P1" },
  { routeKey: "money.subscriptions", routePath: "/money/subscriptions", shell: "user", surfaceClass: "tab", domain: "money", actionType: "navigation", actionLabel: "Subscriptions Tab", expectedResult: "Subscriptions render", supportedModes: ["real", "demo"], launchHonestyClass: "real", testPriority: "P1" },
];

const P1_SETTINGS: SurfaceEntry[] = [
  { routeKey: "settings.page", routePath: "/settings", shell: "user", surfaceClass: "page", domain: "settings", actionType: "navigation", actionLabel: "Settings Page", expectedResult: "Settings renders with tabs", supportedModes: ["real"], launchHonestyClass: "real", testPriority: "P1" },
  { routeKey: "settings.profile", routePath: "/settings/profile", shell: "user", surfaceClass: "tab", domain: "settings", actionType: "navigation", actionLabel: "Profile Settings", expectedResult: "Profile form renders", supportedModes: ["real"], launchHonestyClass: "real", testPriority: "P1" },
];

const P1_OWNER: SurfaceEntry[] = [
  { routeKey: "owner.page", routePath: "/owner", shell: "owner", surfaceClass: "page", domain: "owner", actionType: "navigation", actionLabel: "Owner Center", expectedResult: "Owner dashboard renders", supportedModes: ["real", "demo"], launchHonestyClass: "real", testPriority: "P1" },
  { routeKey: "owner.approvals", routePath: "/owner/approvals", shell: "owner", surfaceClass: "page", domain: "owner", actionType: "navigation", actionLabel: "Owner Approvals", expectedResult: "Owner approval queue renders", supportedModes: ["real"], launchHonestyClass: "real", testPriority: "P1" },
];

const P1_WORKFLOWS: SurfaceEntry[] = [
  { routeKey: "workflows.page", routePath: "/workflows", shell: "user", surfaceClass: "page", domain: "workflows", actionType: "navigation", actionLabel: "Workflows Center", expectedResult: "Workflows list renders", supportedModes: ["real", "demo"], launchHonestyClass: "real", testPriority: "P1" },
];

const P1_CONCIERGE: SurfaceEntry[] = [
  { routeKey: "concierge.page", routePath: "/concierge", shell: "user", surfaceClass: "page", domain: "concierge", actionType: "navigation", actionLabel: "Concierge Center", expectedResult: "Concierge overview renders", supportedModes: ["real", "demo"], launchHonestyClass: "real", testPriority: "P1" },
];

const P1_CALENDAR: SurfaceEntry[] = [
  { routeKey: "calendar.page", routePath: "/calendar", shell: "user", surfaceClass: "page", domain: "workspace", actionType: "navigation", actionLabel: "Calendar Workspace", expectedResult: "Calendar renders with events", supportedModes: ["real", "demo"], launchHonestyClass: "real", testPriority: "P1" },
];

const P1_INVESTMENTS: SurfaceEntry[] = [
  { routeKey: "investment.page", routePath: "/investment", shell: "user", surfaceClass: "page", domain: "investment", actionType: "navigation", actionLabel: "Investment Gate", expectedResult: "Investment dashboard renders", supportedModes: ["real", "demo"], launchHonestyClass: "real", testPriority: "P1" },
];

const P1_REVENUE: SurfaceEntry[] = [
  { routeKey: "revenue.page", routePath: "/revenue-office", shell: "user", surfaceClass: "page", domain: "revenue", actionType: "navigation", actionLabel: "Revenue Gate", expectedResult: "Revenue office renders", supportedModes: ["real", "demo"], launchHonestyClass: "real", testPriority: "P1" },
];

const P1_DIGITAL_PRESENCE: SurfaceEntry[] = [
  { routeKey: "digital_presence.page", routePath: "/digital-presence", shell: "user", surfaceClass: "page", domain: "digital_presence", actionType: "navigation", actionLabel: "Digital Presence Office", expectedResult: "Presence dashboard renders", supportedModes: ["real", "demo"], launchHonestyClass: "real", testPriority: "P1" },
];

// ═══════════════════════════════════════════════════════
// P2 — USEFUL BUT NON-BLOCKING
// ═══════════════════════════════════════════════════════

const P2_SURFACES: SurfaceEntry[] = [
  { routeKey: "life.page", routePath: "/life", shell: "user", surfaceClass: "page", domain: "life", actionType: "navigation", actionLabel: "Life Dashboard", expectedResult: "Life dashboard renders", supportedModes: ["real", "demo"], launchHonestyClass: "real", testPriority: "P2" },
  { routeKey: "search.page", routePath: "/search", shell: "user", surfaceClass: "page", domain: "core", actionType: "navigation", actionLabel: "Global Search", expectedResult: "Search page renders with input", supportedModes: ["real", "demo"], launchHonestyClass: "real", testPriority: "P2" },
  { routeKey: "notifications.page", routePath: "/notifications", shell: "user", surfaceClass: "page", domain: "core", actionType: "navigation", actionLabel: "Notification Center", expectedResult: "Notifications list renders", supportedModes: ["real", "demo"], launchHonestyClass: "real", testPriority: "P2" },
  { routeKey: "proof.page", routePath: "/proof", shell: "user", surfaceClass: "page", domain: "proof", actionType: "navigation", actionLabel: "Proof Center", expectedResult: "Proof receipts render", supportedModes: ["real", "demo"], launchHonestyClass: "real", testPriority: "P2" },
  { routeKey: "memory.page", routePath: "/memory", shell: "user", surfaceClass: "page", domain: "memory", actionType: "navigation", actionLabel: "Memory Center", expectedResult: "Memory categories render", supportedModes: ["real", "demo"], launchHonestyClass: "real", testPriority: "P2" },
  { routeKey: "automation.page", routePath: "/automation", shell: "user", surfaceClass: "page", domain: "automation", actionType: "navigation", actionLabel: "Automation Center", expectedResult: "Automation rules render", supportedModes: ["real", "demo"], launchHonestyClass: "real", testPriority: "P2" },
  { routeKey: "governance.page", routePath: "/governance", shell: "user", surfaceClass: "page", domain: "governance", actionType: "navigation", actionLabel: "Governance Dashboard", expectedResult: "Governance metrics render", supportedModes: ["real", "demo"], launchHonestyClass: "real", testPriority: "P2" },
  { routeKey: "enterprise.page", routePath: "/enterprise", shell: "user", surfaceClass: "page", domain: "enterprise", actionType: "navigation", actionLabel: "Enterprise Control Plane", expectedResult: "Enterprise dashboard renders", supportedModes: ["real", "demo"], launchHonestyClass: "real", testPriority: "P2" },
  { routeKey: "notes.page", routePath: "/notes", shell: "user", surfaceClass: "page", domain: "workspace", actionType: "navigation", actionLabel: "Notes Workspace", expectedResult: "Notes editor renders", supportedModes: ["real", "demo"], launchHonestyClass: "real", testPriority: "P2" },
  { routeKey: "personalization.page", routePath: "/personalization", shell: "user", surfaceClass: "page", domain: "settings", actionType: "navigation", actionLabel: "Personalization Studio", expectedResult: "Personalization options render", supportedModes: ["real"], launchHonestyClass: "real", testPriority: "P2" },
  // Mobile surfaces
  { routeKey: "mobile.home", routePath: "/mobile", shell: "mobile", surfaceClass: "page", domain: "mobile", actionType: "navigation", actionLabel: "Mobile Home", expectedResult: "Mobile home renders", supportedModes: ["real", "demo"], launchHonestyClass: "real", testPriority: "P2" },
  { routeKey: "mobile.approvals", routePath: "/mobile/approvals", shell: "mobile", surfaceClass: "page", domain: "mobile", actionType: "navigation", actionLabel: "Mobile Approvals", expectedResult: "Mobile approvals render", supportedModes: ["real", "demo"], launchHonestyClass: "real", testPriority: "P2" },
  // Admin governance surfaces
  { routeKey: "admin.aig.providers", routePath: "/admin/aig/providers", shell: "admin", surfaceClass: "page", domain: "admin.ai", actionType: "navigation", actionLabel: "AI Provider Registry", expectedResult: "Provider list renders", supportedModes: ["real"], launchHonestyClass: "real", testPriority: "P2" },
  { routeKey: "admin.aig.budget", routePath: "/admin/aig/budget", shell: "admin", surfaceClass: "page", domain: "admin.ai", actionType: "navigation", actionLabel: "AI Budget Center", expectedResult: "Budget policies render", supportedModes: ["real"], launchHonestyClass: "real", testPriority: "P2" },
  { routeKey: "admin.truth.behavioral", routePath: "/admin/truth/behavioral", shell: "admin", surfaceClass: "page", domain: "admin.truth", actionType: "navigation", actionLabel: "Behavioral Truth Overview", expectedResult: "Truth dashboard renders", supportedModes: ["real"], launchHonestyClass: "real", testPriority: "P2" },
];

// ═══════════════════════════════════════════════════════
// REDIRECT SURFACES
// ═══════════════════════════════════════════════════════

const REDIRECT_SURFACES: SurfaceEntry[] = [
  { routeKey: "redirect.auth.login_success", routePath: "/login", shell: "public", surfaceClass: "redirect", domain: "auth", actionType: "redirect", actionLabel: "Post-Login Redirect", expectedResult: "Redirects to / after successful sign-in", redirectTarget: "/", supportedModes: ["real"], launchHonestyClass: "real", testPriority: "P0" },
  { routeKey: "redirect.auth.signup_success", routePath: "/signup", shell: "public", surfaceClass: "redirect", domain: "auth", actionType: "redirect", actionLabel: "Post-Signup Redirect", expectedResult: "Redirects to / after account creation", redirectTarget: "/", supportedModes: ["real"], launchHonestyClass: "real", testPriority: "P0" },
  { routeKey: "redirect.auth.signout", routePath: "/", shell: "user", surfaceClass: "redirect", domain: "auth", actionType: "redirect", actionLabel: "Post-Signout Redirect", expectedResult: "Redirects to /login after sign-out", redirectTarget: "/login", supportedModes: ["real"], launchHonestyClass: "real", testPriority: "P0" },
  { routeKey: "redirect.auth.unauthed_guard", routePath: "/*", shell: "user", surfaceClass: "redirect", domain: "auth", actionType: "redirect", actionLabel: "Unauthed Guard Redirect", expectedResult: "Redirects unauthenticated users to /login", redirectTarget: "/login", supportedModes: ["real"], launchHonestyClass: "real", testPriority: "P0" },
  { routeKey: "redirect.approval.post_approve", routePath: "/approvals", shell: "user", surfaceClass: "redirect", domain: "approvals", actionType: "redirect", actionLabel: "Post-Approval Stay", expectedResult: "Stays on /approvals after approving", redirectTarget: "/approvals", supportedModes: ["real"], launchHonestyClass: "real", testPriority: "P1" },
  { routeKey: "redirect.settings.save", routePath: "/settings", shell: "user", surfaceClass: "redirect", domain: "settings", actionType: "redirect", actionLabel: "Post-Settings Save", expectedResult: "Stays on current settings tab after save", redirectTarget: "/settings", supportedModes: ["real"], launchHonestyClass: "real", testPriority: "P1" },
  { routeKey: "redirect.money.tab_switch", routePath: "/money", shell: "user", surfaceClass: "redirect", domain: "money", actionType: "redirect", actionLabel: "Money Tab Navigation", expectedResult: "Tab switch updates URL path", redirectTarget: "/money/*", supportedModes: ["real", "demo"], launchHonestyClass: "real", testPriority: "P1" },
  { routeKey: "redirect.forgot_password.submit", routePath: "/forgot-password", shell: "public", surfaceClass: "redirect", domain: "auth", actionType: "redirect", actionLabel: "Post Password Reset", expectedResult: "Shows confirmation or redirects to /login", redirectTarget: "/login", supportedModes: ["real"], launchHonestyClass: "real", testPriority: "P1" },
];

// ═══════════════════════════════════════════════════════
// FORM SURFACES
// ═══════════════════════════════════════════════════════

const FORM_SURFACES: SurfaceEntry[] = [
  { routeKey: "form.login", routePath: "/login", shell: "public", surfaceClass: "form", domain: "auth", actionType: "submit", actionLabel: "Login Form", actionSelector: "[data-testid='login-submit']", expectedResult: "Authenticates user", formFields: ["email", "password"], expectedPersistence: false, backendDependency: "supabase.auth.signInWithPassword", supportedModes: ["real"], launchHonestyClass: "real", testPriority: "P0" },
  { routeKey: "form.signup", routePath: "/signup", shell: "public", surfaceClass: "form", domain: "auth", actionType: "submit", actionLabel: "Signup Form", actionSelector: "[data-testid='signup-submit']", expectedResult: "Creates account", formFields: ["email", "password", "confirmPassword"], expectedPersistence: true, backendDependency: "supabase.auth.signUp", supportedModes: ["real"], launchHonestyClass: "real", testPriority: "P0" },
  { routeKey: "form.forgot_password", routePath: "/forgot-password", shell: "public", surfaceClass: "form", domain: "auth", actionType: "submit", actionLabel: "Forgot Password Form", expectedResult: "Sends password reset email", formFields: ["email"], expectedPersistence: false, supportedModes: ["real"], launchHonestyClass: "real", testPriority: "P0" },
  { routeKey: "form.settings.profile", routePath: "/settings/profile", shell: "user", surfaceClass: "form", domain: "settings", actionType: "save", actionLabel: "Profile Settings Form", actionSelector: "[data-testid='settings-save']", expectedResult: "Profile data persisted", formFields: ["displayName", "avatar"], expectedPersistence: true, backendDependency: "profiles.update", supportedModes: ["real"], launchHonestyClass: "real", testPriority: "P1" },
  { routeKey: "form.advisor.chat", routePath: "/advisors/:id", shell: "user", surfaceClass: "form", domain: "ai", actionType: "trigger_ai", actionLabel: "Advisor Chat Input", actionSelector: "[data-testid='advisor-chat-input']", expectedResult: "AI response generated", formFields: ["message"], expectedPersistence: true, backendDependency: "edge:ai-gateway", supportedModes: ["real", "demo"], launchHonestyClass: "real", testPriority: "P0" },
  { routeKey: "form.connector.config", routePath: "/connectors", shell: "user", surfaceClass: "form", domain: "connectors", actionType: "connect", actionLabel: "Connector Configuration", expectedResult: "Connector saved and tested", formFields: ["apiKey", "endpoint", "syncFrequency"], expectedPersistence: true, supportedModes: ["real"], launchHonestyClass: "real", testPriority: "P1" },
];

// ═══════════════════════════════════════════════════════
// MODAL / DRAWER SURFACES
// ═══════════════════════════════════════════════════════

const MODAL_DRAWER_SURFACES: SurfaceEntry[] = [
  { routeKey: "modal.command_palette", routePath: "/*", shell: "user", surfaceClass: "modal", domain: "core", actionType: "open_modal", actionLabel: "Command Palette", actionSelector: "[data-testid='command-palette']", expectedResult: "Command palette opens with search", focusTrapExpected: true, modalCleanupRequired: true, supportedModes: ["real", "demo"], launchHonestyClass: "real", testPriority: "P0" },
  { routeKey: "modal.keyboard_shortcuts", routePath: "/*", shell: "admin", surfaceClass: "modal", domain: "core", actionType: "open_modal", actionLabel: "Keyboard Shortcuts Overlay", expectedResult: "Shortcuts overlay renders all groups", focusTrapExpected: true, modalCleanupRequired: true, supportedModes: ["real", "demo"], launchHonestyClass: "real", testPriority: "P1" },
  { routeKey: "modal.approval_confirm", routePath: "/approvals", shell: "user", surfaceClass: "modal", domain: "approvals", actionType: "open_modal", actionLabel: "Approval Confirmation", expectedResult: "Confirmation dialog opens, action completes on confirm", focusTrapExpected: true, modalCleanupRequired: true, proofReceiptRequired: true, supportedModes: ["real"], launchHonestyClass: "real", testPriority: "P0" },
  { routeKey: "drawer.evidence_detail", routePath: "/admin/verification/evidence", shell: "admin", surfaceClass: "drawer", domain: "admin.verification", actionType: "open_drawer", actionLabel: "Evidence Detail Drawer", expectedResult: "Evidence detail panel opens with artifacts", focusTrapExpected: false, modalCleanupRequired: true, supportedModes: ["real"], launchHonestyClass: "real", testPriority: "P1" },
  { routeKey: "drawer.journey_detail", routePath: "/admin/customer-journey/detail", shell: "admin", surfaceClass: "drawer", domain: "admin.journey", actionType: "open_drawer", actionLabel: "Journey Step Drawer", expectedResult: "Step detail opens with assertions", focusTrapExpected: false, modalCleanupRequired: true, supportedModes: ["real"], launchHonestyClass: "real", testPriority: "P1" },
  { routeKey: "modal.file_preview", routePath: "/files", shell: "user", surfaceClass: "modal", domain: "files", actionType: "open_modal", actionLabel: "File Preview Modal", expectedResult: "File previews with download option", focusTrapExpected: true, modalCleanupRequired: true, supportedModes: ["real"], launchHonestyClass: "real", testPriority: "P1" },
  { routeKey: "drawer.money_advisor", routePath: "/money/*", shell: "user", surfaceClass: "drawer", domain: "money", actionType: "open_drawer", actionLabel: "Money Advisor Drawer", expectedResult: "Live advisor card opens with insights", focusTrapExpected: false, modalCleanupRequired: true, supportedModes: ["real", "demo"], launchHonestyClass: "real", testPriority: "P1" },
];

// ═══════════════════════════════════════════════════════
// KEYBOARD / COMMAND SURFACES
// ═══════════════════════════════════════════════════════

const KEYBOARD_COMMAND_SURFACES: SurfaceEntry[] = [
  { routeKey: "shortcut.command_palette", routePath: "/*", shell: "user", surfaceClass: "keyboard_shortcut", domain: "core", actionType: "keyboard_shortcut", actionLabel: "⌘K — Open Command Palette", shortcutKey: "⌘K", expectedResult: "Command palette opens", supportedModes: ["real", "demo"], launchHonestyClass: "real", testPriority: "P0" },
  { routeKey: "shortcut.shortcuts_overlay", routePath: "/*", shell: "admin", surfaceClass: "keyboard_shortcut", domain: "core", actionType: "keyboard_shortcut", actionLabel: "? — Show Shortcuts", shortcutKey: "?", expectedResult: "Shortcuts overlay opens", supportedModes: ["real"], launchHonestyClass: "real", testPriority: "P1" },
  { routeKey: "shortcut.go_home", routePath: "/*", shell: "admin", surfaceClass: "keyboard_shortcut", domain: "core", actionType: "keyboard_shortcut", actionLabel: "G H — Go to Mission Control", shortcutKey: "G H", expectedResult: "Navigates to /admin/mission-control", redirectTarget: "/admin/mission-control", supportedModes: ["real"], launchHonestyClass: "real", testPriority: "P1" },
  { routeKey: "shortcut.go_incidents", routePath: "/*", shell: "admin", surfaceClass: "keyboard_shortcut", domain: "core", actionType: "keyboard_shortcut", actionLabel: "G I — Go to Incidents", shortcutKey: "G I", expectedResult: "Navigates to /admin/incidents", redirectTarget: "/admin/incidents", supportedModes: ["real"], launchHonestyClass: "real", testPriority: "P1" },
  { routeKey: "shortcut.go_deployment", routePath: "/*", shell: "admin", surfaceClass: "keyboard_shortcut", domain: "core", actionType: "keyboard_shortcut", actionLabel: "G D — Go to Deployment", shortcutKey: "G D", expectedResult: "Navigates to /admin/deployment", redirectTarget: "/admin/deployment", supportedModes: ["real"], launchHonestyClass: "real", testPriority: "P1" },
  { routeKey: "shortcut.go_proof", routePath: "/*", shell: "admin", surfaceClass: "keyboard_shortcut", domain: "core", actionType: "keyboard_shortcut", actionLabel: "G P — Go to Proof Matrix", shortcutKey: "G P", expectedResult: "Navigates to /admin/proof-matrix", redirectTarget: "/admin/proof-matrix", supportedModes: ["real"], launchHonestyClass: "real", testPriority: "P1" },
  { routeKey: "shortcut.go_operations", routePath: "/*", shell: "admin", surfaceClass: "keyboard_shortcut", domain: "core", actionType: "keyboard_shortcut", actionLabel: "G O — Go to Operations", shortcutKey: "G O", expectedResult: "Navigates to /admin/operations", redirectTarget: "/admin/operations", supportedModes: ["real"], launchHonestyClass: "real", testPriority: "P1" },
  { routeKey: "shortcut.escape_close", routePath: "/*", shell: "user", surfaceClass: "keyboard_shortcut", domain: "core", actionType: "escape", actionLabel: "Esc — Close Overlay", shortcutKey: "Escape", expectedResult: "Closes current modal/drawer/overlay", supportedModes: ["real", "demo"], launchHonestyClass: "real", testPriority: "P0" },
  { routeKey: "command.navigate_home", routePath: "/*", shell: "user", surfaceClass: "command_palette", domain: "core", actionType: "command_action", actionLabel: "Command: Go Home", expectedResult: "Navigates to /", redirectTarget: "/", supportedModes: ["real", "demo"], launchHonestyClass: "real", testPriority: "P1" },
  { routeKey: "command.navigate_money", routePath: "/*", shell: "user", surfaceClass: "command_palette", domain: "core", actionType: "command_action", actionLabel: "Command: Open Money Office", expectedResult: "Navigates to /money", redirectTarget: "/money", supportedModes: ["real", "demo"], launchHonestyClass: "real", testPriority: "P1" },
  { routeKey: "command.navigate_settings", routePath: "/*", shell: "user", surfaceClass: "command_palette", domain: "core", actionType: "command_action", actionLabel: "Command: Open Settings", expectedResult: "Navigates to /settings", redirectTarget: "/settings", supportedModes: ["real", "demo"], launchHonestyClass: "real", testPriority: "P1" },
];

// ═══════════════════════════════════════════════════════
// FULL REGISTRY EXPORT
// ═══════════════════════════════════════════════════════

export const SURFACE_REGISTRY: SurfaceEntry[] = [
  ...P0_AUTH,
  ...P0_NAVIGATION,
  ...P0_FILES,
  ...P0_BOARDROOM,
  ...P0_AI,
  ...P0_APPROVALS,
  ...P0_CONNECTORS,
  ...P0_ADMIN,
  ...P1_BUSINESS,
  ...P1_MONEY,
  ...P1_SETTINGS,
  ...P1_OWNER,
  ...P1_WORKFLOWS,
  ...P1_CONCIERGE,
  ...P1_CALENDAR,
  ...P1_INVESTMENTS,
  ...P1_REVENUE,
  ...P1_DIGITAL_PRESENCE,
  ...P2_SURFACES,
  ...REDIRECT_SURFACES,
  ...FORM_SURFACES,
  ...MODAL_DRAWER_SURFACES,
  ...KEYBOARD_COMMAND_SURFACES,
];

// ═══════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════

export function getSurfacesByPriority(priority: TestPriority): SurfaceEntry[] {
  return SURFACE_REGISTRY.filter((s) => s.testPriority === priority);
}

export function getSurfacesByDomain(domain: string): SurfaceEntry[] {
  return SURFACE_REGISTRY.filter((s) => s.domain === domain);
}

export function getSurfacesByShell(shell: SurfaceShell): SurfaceEntry[] {
  return SURFACE_REGISTRY.filter((s) => s.shell === shell);
}

export function getP0Surfaces(): SurfaceEntry[] {
  return getSurfacesByPriority("P0");
}

export function getVerificationStats() {
  const total = SURFACE_REGISTRY.length;
  const p0 = getSurfacesByPriority("P0").length;
  const p1 = getSurfacesByPriority("P1").length;
  const p2 = getSurfacesByPriority("P2").length;
  const byShell = {
    public: getSurfacesByShell("public").length,
    user: getSurfacesByShell("user").length,
    admin: getSurfacesByShell("admin").length,
    mobile: getSurfacesByShell("mobile").length,
    owner: getSurfacesByShell("owner").length,
  };
  const domains = [...new Set(SURFACE_REGISTRY.map((s) => s.domain))];
  return { total, p0, p1, p2, byShell, domains };
}
