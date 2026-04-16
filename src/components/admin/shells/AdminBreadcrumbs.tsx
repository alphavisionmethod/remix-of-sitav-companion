// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin Breadcrumbs
// Auto-generates breadcrumb trail from current pathname
// ═══════════════════════════════════════════════════════════════

import { useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Human-readable labels for known path segments ──────────────
const SEGMENT_LABELS: Record<string, string> = {
  admin: "Admin",
  dashboard: "Dashboard",
  "ai-gateway": "AI Gateway",
  providers: "Provider Registry",
  models: "Model Registry",
  routing: "Routing Matrix",
  budget: "Budget Center",
  receipts: "Receipts Explorer",
  "launch-truth": "Launch Truth",
  intelligence: "Intelligence",
  reuse: "Reuse Overview",
  assets: "Asset Library",
  efficiency: "Efficiency Scoreboard",
  escalation: "Escalation Control",
  patterns: "Pattern Learning",
  architecture: "Architecture",
  governance: "Governance",
  "platform-law": "Platform Law",
  fip: "Feature Integration",
  launch: "Launch",
  "launch-readiness": "Launch Readiness",
  verification: "Verification",
  security: "Security",
  "reality-audit": "Reality Audit",
  "session-secrets": "Session Secrets",
  fleet: "Fleet",
  "fleet-health": "Fleet Health",
  cloud: "Cloud",
  "cloud-backbone": "Cloud Backbone",
  "os-platform": "OS Platform",
  support: "Support",
  mc: "Mission Control",
  devices: "Devices",
  storage: "Storage",
  users: "Users",
  workspaces: "Workspaces",
  "sync-cloud": "Sync & Cloud",
  jobs: "Jobs & Maintenance",
  "trust-security": "Trust & Security",
  releases: "Releases",
  "ai-control": "AI Control",
  incidents: "Incidents",
  policies: "Policies & Flags",
  costs: "Costs & AI Budgets",
  logs: "Logs & Audit",
  knowledge: "Knowledge Base",
  "system-health": "System Health",
  "authority-matrix": "Authority Matrix",
  "control-receipts": "Control Receipts",
  emergency: "Emergency Authority",
  "platform-adaptation": "Platform Adaptation",
  "state-authority": "State Authority",
  "feature-ownership": "Feature Ownership",
  "command-routing": "Command Routing",
  "approval-flow": "Approval Flow",
  "failure-recovery": "Failure Recovery",
  "event-routing": "Event Routing",
  "architecture-tests": "Architecture Tests",
  founder: "Founder",
  command: "Command Console",
  tasks: "Task Decomposition",
  cicd: "CI/CD Pipeline",
  runbooks: "Runbooks",
  programs: "Program Management",
  cost: "Platform Cost",
  "sync-ops": "Sync/Storage Ops",
  oversight: "Human Oversight",
  engineering: "Engineering",
  validation: "Validation Center",
  "builder-critic": "Builder-Critic Console",
  simulation: "Simulation Lab",
  standards: "Code Standards",
  chaos: "Chaos Testing",
  rollback: "Auto Rollback",
  "version-intel": "Version Intelligence",
  optimization: "Self-Optimization",
  "advisor-board": "Advisor Board",
  catalog: "Catalog",
  recommendations: "Recommendations",
  actions: "Actions",
  memory: "Memory Inspector",
  autonomy: "Autonomy Policy",
  profitability: "Profitability",
  "ai-tokens": "AI Tokens",
  "generated-truth": "Generated Truth",
  ecosystem: "Ecosystem Command",
  "system-intelligence": "System Intelligence",
  "communication-hub": "Communication Hub",
  "release-engineering": "Release Engineering",
  "graph-intelligence": "Graph Intelligence",
  "ai-governance": "AI Governance",
  "simulation-center": "Simulation Center",
  communications: "Communications",
  apps: "App Management",
  settings: "Settings",
};

interface Crumb {
  label: string;
  path: string;
  isLast: boolean;
}

export function AdminBreadcrumbs() {
  const { pathname } = useLocation();

  const crumbs = useMemo<Crumb[]>(() => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) return [];

    const result: Crumb[] = [];
    let accumulated = "";

    for (let i = 0; i < segments.length; i++) {
      accumulated += `/${segments[i]}`;
      const label = SEGMENT_LABELS[segments[i]] ?? segments[i].replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      // Skip "admin" as first crumb — use home icon instead
      if (i === 0 && segments[i] === "admin") continue;
      result.push({
        label,
        path: accumulated,
        isLast: i === segments.length - 1,
      });
    }
    return result;
  }, [pathname]);

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[11px]">
      <Link
        to="/admin/dashboard"
        className="text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Admin Home"
      >
        <Home className="h-3 w-3" />
      </Link>

      {crumbs.map((crumb) => (
        <span key={crumb.path} className="flex items-center gap-1">
          <ChevronRight className="h-3 w-3 text-muted-foreground/40" />
          {crumb.isLast ? (
            <span className="text-foreground font-medium">{crumb.label}</span>
          ) : (
            <Link
              to={crumb.path}
              className={cn(
                "text-muted-foreground hover:text-foreground transition-colors"
              )}
            >
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
