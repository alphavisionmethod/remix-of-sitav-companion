// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin Domain Sidebar Navigation
// Contextual sidebar that shows sub-pages for the active domain
// ═══════════════════════════════════════════════════════════════

import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

export type AdminDomain =
  | "home"
  | "intelligence"
  | "governance"
  | "launch"
  | "security"
  | "operations"
  | "support"
  | "strategic";

interface NavItem {
  label: string;
  path: string;
  group?: string;
}

const DOMAIN_NAV_ITEMS: Record<AdminDomain, NavItem[]> = {
  home: [
    { label: "Dashboard", path: "/admin/dashboard" },
    { label: "Ecosystem Command", path: "/admin/ecosystem" },
    { label: "System Intelligence", path: "/admin/system-intelligence" },
    { label: "Generated Truth", path: "/admin/generated-truth" },
    { label: "Communication Hub", path: "/admin/communication-hub" },
  ],
  intelligence: [
    { label: "Provider Registry", path: "/admin/ai-gateway/providers", group: "AI Gateway" },
    { label: "Model Registry", path: "/admin/ai-gateway/models", group: "AI Gateway" },
    { label: "Routing Matrix", path: "/admin/ai-gateway/routing", group: "AI Gateway" },
    { label: "Budget Center", path: "/admin/ai-gateway/budget", group: "AI Gateway" },
    { label: "Receipts Explorer", path: "/admin/ai-gateway/receipts", group: "AI Gateway" },
    { label: "Launch Truth", path: "/admin/ai-gateway/launch-truth", group: "AI Gateway" },
    { label: "Reuse Overview", path: "/admin/intelligence/reuse", group: "Intelligence" },
    { label: "Asset Library", path: "/admin/intelligence/assets", group: "Intelligence" },
    { label: "Efficiency Scoreboard", path: "/admin/intelligence/efficiency", group: "Intelligence" },
    { label: "Escalation Control", path: "/admin/intelligence/escalation", group: "Intelligence" },
    { label: "Pattern Learning", path: "/admin/intelligence/patterns", group: "Intelligence" },
    { label: "AI Tokens", path: "/admin/ai-tokens", group: "Workforce" },
    { label: "AI Control", path: "/admin/mc/ai-control", group: "Workforce" },
    { label: "Advisor Catalog", path: "/admin/advisor-board/catalog", group: "Advisors" },
    { label: "Advisor Recommendations", path: "/admin/advisor-board/recommendations", group: "Advisors" },
    { label: "Advisor Actions", path: "/admin/advisor-board/actions", group: "Advisors" },
    { label: "Advisor Autonomy", path: "/admin/advisor-board/autonomy", group: "Advisors" },
  ],
  governance: [
    { label: "Architecture Dashboard", path: "/admin/mc/architecture", group: "Architecture" },
    { label: "Feature Ownership", path: "/admin/mc/feature-ownership", group: "Architecture" },
    { label: "Command Routing", path: "/admin/mc/command-routing", group: "Architecture" },
    { label: "Approval Flow", path: "/admin/mc/approval-flow", group: "Architecture" },
    { label: "Event Routing", path: "/admin/mc/event-routing", group: "Architecture" },
    { label: "Architecture Tests", path: "/admin/mc/architecture-tests", group: "Architecture" },
    { label: "Authority Matrix", path: "/admin/mc/authority-matrix", group: "Authority" },
    { label: "Control Receipts", path: "/admin/mc/control-receipts", group: "Authority" },
    { label: "State Authority", path: "/admin/mc/state-authority", group: "Authority" },
    { label: "Policies & Flags", path: "/admin/mc/policies", group: "Policy" },
    { label: "Platform Adaptation", path: "/admin/mc/platform-adaptation", group: "Policy" },
    { label: "AI Governance", path: "/admin/ai-governance", group: "Policy" },
  ],
  launch: [
    { label: "Launch Readiness", path: "/admin/launch-readiness", group: "Readiness" },
    { label: "Verification Center", path: "/admin/verification", group: "Readiness" },
    { label: "Simulation Center", path: "/admin/simulation-center", group: "Testing" },
    { label: "Release Engineering", path: "/admin/release-engineering", group: "Release" },
    { label: "Releases & Updates", path: "/admin/mc/releases", group: "Release" },
    { label: "Version Intelligence", path: "/admin/engineering/version-intel", group: "Release" },
  ],
  security: [
    { label: "Security Foundation", path: "/admin/security", group: "Security" },
    { label: "Session Secrets", path: "/admin/session-secrets", group: "Security" },
    { label: "Trust & Security", path: "/admin/mc/trust-security", group: "Trust" },
    { label: "Emergency Authority", path: "/admin/mc/emergency", group: "Trust" },
    { label: "Costs & AI Budgets", path: "/admin/mc/costs", group: "Audit" },
    { label: "Logs & Audit", path: "/admin/mc/logs", group: "Audit" },
  ],
  operations: [
    { label: "Fleet Health", path: "/admin/fleet-health", group: "Fleet" },
    { label: "OS Platform", path: "/admin/os-platform", group: "Platform" },
    { label: "Cloud Backbone", path: "/admin/cloud-backbone", group: "Platform" },
    { label: "Devices", path: "/admin/mc/devices", group: "Resources" },
    { label: "Storage", path: "/admin/mc/storage", group: "Resources" },
    { label: "Users", path: "/admin/mc/users", group: "Resources" },
    { label: "Workspaces", path: "/admin/mc/workspaces", group: "Resources" },
    { label: "Sync & Cloud", path: "/admin/mc/sync-cloud", group: "Resources" },
    { label: "Jobs & Maintenance", path: "/admin/mc/jobs", group: "Resources" },
    { label: "System Health", path: "/admin/mc/system-health", group: "Health" },
    { label: "Graph Intelligence", path: "/admin/graph-intelligence", group: "Health" },
  ],
  support: [
    { label: "Support Center", path: "/admin/mc/support", group: "Support" },
    { label: "Incidents", path: "/admin/mc/incidents", group: "Support" },
    { label: "Knowledge Base", path: "/admin/mc/knowledge", group: "Support" },
    { label: "Failure Recovery", path: "/admin/mc/failure-recovery", group: "Recovery" },
    { label: "Chaos Testing", path: "/admin/engineering/chaos", group: "Recovery" },
    { label: "Auto Rollback", path: "/admin/engineering/rollback", group: "Recovery" },
  ],
  strategic: [
    { label: "Founder Command", path: "/admin/founder/command", group: "FCC" },
    { label: "Task Decomposition", path: "/admin/founder/tasks", group: "FCC" },
    { label: "CI/CD Pipeline", path: "/admin/founder/cicd", group: "FCC" },
    { label: "Runbooks", path: "/admin/founder/runbooks", group: "FCC" },
    { label: "Founder Dashboard", path: "/admin/founder/dashboard", group: "FCC" },
    { label: "Program Management", path: "/admin/founder/programs", group: "FCC" },
    { label: "Platform Cost", path: "/admin/founder/cost", group: "FCC" },
    { label: "Sync/Storage Ops", path: "/admin/founder/sync-ops", group: "FCC" },
    { label: "Security & Risk", path: "/admin/founder/security", group: "FCC" },
    { label: "Human Oversight", path: "/admin/founder/oversight", group: "FCC" },
    { label: "Incident Response", path: "/admin/founder/incidents", group: "FCC" },
    { label: "Knowledge & Memory", path: "/admin/founder/knowledge", group: "FCC" },
    { label: "Validation Center", path: "/admin/engineering/validation", group: "SRE" },
    { label: "Builder-Critic Console", path: "/admin/engineering/builder-critic", group: "SRE" },
    { label: "Simulation Lab", path: "/admin/engineering/simulation", group: "SRE" },
    { label: "Code Standards", path: "/admin/engineering/standards", group: "SRE" },
    { label: "Self-Optimization", path: "/admin/engineering/optimization", group: "SRE" },
  ],
};

interface AdminDomainNavProps {
  activeDomain: AdminDomain;
  collapsed: boolean;
  currentPath: string;
}

export function AdminDomainNav({ activeDomain, collapsed, currentPath }: AdminDomainNavProps) {
  const navigate = useNavigate();
  const items = DOMAIN_NAV_ITEMS[activeDomain] ?? [];

  if (collapsed) {
    return (
      <aside className="w-0 transition-all duration-200 overflow-hidden border-r border-border/30" />
    );
  }

  // Group items
  const groups: Record<string, NavItem[]> = {};
  for (const item of items) {
    const g = item.group ?? "General";
    (groups[g] ??= []).push(item);
  }

  return (
    <aside className="w-56 shrink-0 border-r border-border/50 bg-card/20 transition-all duration-200">
      <ScrollArea className="h-[calc(100vh-7rem)]">
        <div className="p-3 space-y-4">
          {Object.entries(groups).map(([groupName, groupItems]) => (
            <div key={groupName}>
              <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-2 mb-1">
                {groupName}
              </p>
              <div className="space-y-0.5">
                {groupItems.map((item) => {
                  const active = currentPath === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className={cn(
                        "w-full text-left px-2 py-1.5 rounded text-[11px] transition-colors",
                        active
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
                      )}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
}
