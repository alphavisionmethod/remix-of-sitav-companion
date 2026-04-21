// ═══════════════════════════════════════════════════════════════
// SITA OS — Target Admin Information Architecture
// Defines the redesigned admin structure (~15 top-level sections)
// ═══════════════════════════════════════════════════════════════

export interface AdminSectionDef {
  id: string;
  label: string;
  icon: string;
  description: string;
  tabs: string[];
  estimatedPages: number;
  priority: "p0" | "p1" | "p2";
}

export const ADMIN_IA_TARGET: readonly AdminSectionDef[] = [
  {
    id: "overview",
    label: "Founder Command",
    icon: "LayoutDashboard",
    description: "Executive overview: key metrics, action items, system health at a glance",
    tabs: ["Dashboard", "Quick Actions", "Recent Activity"],
    estimatedPages: 3,
    priority: "p0",
  },
  {
    id: "crm-contacts",
    label: "CRM / Contacts",
    icon: "Users",
    description: "Contact management, account linking, activity timelines",
    tabs: ["All Contacts", "Accounts", "Activities", "Segments"],
    estimatedPages: 5,
    priority: "p0",
  },
  {
    id: "investors",
    label: "Investors",
    icon: "Briefcase",
    description: "Investor requests, deal rooms, document management, access control",
    tabs: ["Pipeline", "Deal Rooms", "Documents", "Access Log"],
    estimatedPages: 5,
    priority: "p0",
  },
  {
    id: "backers-crowdfund",
    label: "Backers / Crowdfund",
    icon: "Heart",
    description: "Crowdfunding campaigns, pledges, rewards, donor management",
    tabs: ["Campaigns", "Pledges", "Rewards", "Donors"],
    estimatedPages: 5,
    priority: "p1",
  },
  {
    id: "waitlist-beta",
    label: "Waitlist / Beta",
    icon: "Clock",
    description: "Waitlist submissions, beta applications, invites, activation tracking",
    tabs: ["Waitlist", "Applications", "Invites", "Activation"],
    estimatedPages: 4,
    priority: "p0",
  },
  {
    id: "campaigns",
    label: "Campaigns",
    icon: "Send",
    description: "Email/notification campaigns, audience targeting, delivery tracking",
    tabs: ["All Campaigns", "Templates", "Audiences", "Delivery"],
    estimatedPages: 5,
    priority: "p1",
  },
  {
    id: "workflows",
    label: "Workflows",
    icon: "GitBranch",
    description: "Automation workflows, triggers, execution history, error handling",
    tabs: ["All Workflows", "Runs", "Triggers", "Errors"],
    estimatedPages: 5,
    priority: "p1",
  },
  {
    id: "advisory-boardroom",
    label: "Advisory / Boardroom",
    icon: "Brain",
    description: "Advisor management, boardroom analytics, recommendation tracking",
    tabs: ["Advisors", "Sessions", "Recommendations", "Performance"],
    estimatedPages: 5,
    priority: "p0",
  },
  {
    id: "launchpad-builds",
    label: "Launchpad / Builds",
    icon: "Rocket",
    description: "Build artifacts, release management, download tracking, checksums",
    tabs: ["Builds", "Releases", "Downloads", "Verification"],
    estimatedPages: 4,
    priority: "p1",
  },
  {
    id: "website-content",
    label: "Website / Content",
    icon: "Globe",
    description: "Website content state, SEO, media assets, page management",
    tabs: ["Pages", "Media", "SEO", "Content State"],
    estimatedPages: 4,
    priority: "p1",
  },
  {
    id: "trust-audit",
    label: "Trust / Audit",
    icon: "Shield",
    description: "Receipts, audit trail, consent management, compliance, kill switches",
    tabs: ["Receipts", "Audit Log", "Consent", "Kill Switches", "Drills"],
    estimatedPages: 6,
    priority: "p0",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: "BarChart3",
    description: "Attribution, funnel analytics, event tracking, cohort analysis",
    tabs: ["Overview", "Funnels", "Events", "Cohorts", "Attribution"],
    estimatedPages: 6,
    priority: "p1",
  },
  {
    id: "settings-integrations",
    label: "Settings / Integrations",
    icon: "Settings",
    description: "System settings, AI runtime, connectors, permissions, API keys",
    tabs: ["General", "AI Runtime", "Connectors", "Permissions", "API Keys"],
    estimatedPages: 6,
    priority: "p1",
  },
  {
    id: "platform-health",
    label: "Platform Health",
    icon: "Activity",
    description: "System health, alerts, SLOs, performance, cost, remediation tracking",
    tabs: ["Health", "Alerts", "SLOs", "Performance", "Cost", "Remediation"],
    estimatedPages: 7,
    priority: "p0",
  },
  {
    id: "security",
    label: "Security",
    icon: "Lock",
    description: "Security overview, RLS audit, role management, session management",
    tabs: ["Overview", "Roles", "Sessions", "Policies"],
    estimatedPages: 4,
    priority: "p0",
  },
] as const;

export function getTargetPageCount(): number {
  return ADMIN_IA_TARGET.reduce((sum, s) => sum + s.estimatedPages, 0);
}