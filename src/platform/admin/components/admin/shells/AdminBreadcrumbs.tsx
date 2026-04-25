// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin Breadcrumbs (Phase 2 — Registry-aware)
// Prefers the canonical breadcrumb chain from admin-route-registry,
// falls back to humanised path-segment labels for unmapped routes.
// ═══════════════════════════════════════════════════════════════

import { useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getRouteEntry,
  DOMAIN_HUB_PATHS,
  DOMAIN_LABELS,
  type AdminDomain,
} from "@/platform/architecture/admin-route-registry";
import { resolveActiveDomain } from "./AdminPrimaryNav";

// ── Fallback labels for path segments not represented in the registry ──
const SEGMENT_LABELS: Record<string, string> = {
  admin: "Admin",
  dashboard: "Dashboard",
  "ai-gateway": "AI Gateway",
  providers: "Providers",
  models: "Models",
  routing: "Routing",
  budget: "Budget",
  receipts: "Receipts",
  intelligence: "Intelligence",
  reuse: "Reuse",
  assets: "Assets",
  efficiency: "Efficiency",
  escalation: "Escalation",
  patterns: "Patterns",
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
  "fleet-health": "Fleet Health",
  "cloud-backbone": "Cloud Backbone",
  "os-platform": "OS Platform",
  support: "Support",
  mc: "Mission Control",
  devices: "Devices",
  storage: "Storage",
  users: "Users",
  workspaces: "Workspaces",
  "sync-cloud": "Sync & Cloud",
  jobs: "Jobs",
  "trust-security": "Trust & Security",
  releases: "Releases",
  "ai-control": "AI Control",
  incidents: "Incidents",
  policies: "Policies",
  costs: "Costs",
  logs: "Logs",
  knowledge: "Knowledge",
  "system-health": "System Health",
  "authority-matrix": "Authority Matrix",
  "control-receipts": "Control Receipts",
  emergency: "Emergency",
  "platform-adaptation": "Platform Adaptation",
  "state-authority": "State Authority",
  "feature-ownership": "Feature Ownership",
  "command-routing": "Command Routing",
  "approval-flow": "Approval Flow",
  "failure-recovery": "Failure Recovery",
  "event-routing": "Event Routing",
  "architecture-tests": "Architecture Tests",
  founder: "Founder",
  command: "Command",
  tasks: "Tasks",
  cicd: "CI/CD",
  runbooks: "Runbooks",
  programs: "Programs",
  cost: "Cost",
  "sync-ops": "Sync Ops",
  oversight: "Oversight",
  engineering: "Engineering",
  validation: "Validation",
  "builder-critic": "Builder/Critic",
  simulation: "Simulation",
  standards: "Standards",
  chaos: "Chaos",
  rollback: "Rollback",
  "version-intel": "Version Intel",
  optimization: "Optimization",
  "advisor-board": "Advisors",
  catalog: "Catalog",
  recommendations: "Recommendations",
  actions: "Actions",
  memory: "Memory",
  autonomy: "Autonomy",
  profitability: "Profitability",
  "ai-tokens": "AI Tokens",
  "generated-truth": "Generated Truth",
  ecosystem: "Ecosystem",
  "system-intelligence": "System Intelligence",
  "communication-hub": "Communications",
  "release-engineering": "Release Engineering",
  "graph-intelligence": "Graph Intelligence",
  "ai-governance": "AI Governance",
  "simulation-center": "Simulation Center",
  apps: "Apps",
  settings: "Settings",
  approvals: "Approvals",
  alerts: "Alerts",
  environments: "Environments",
  health: "Health",
  config: "Config",
  overview: "Overview",
  "ai-runtime": "AI Runtime",
  "ai-team": "AI Team",
  "approval-queue": "Approval Queue",
  "launch-truth": "Launch Truth",
  diagnostics: "Diagnostics",
  honesty: "Honesty",
  cai: "CAI",
  graph: "Graph",
  intent: "Intent",
  attention: "Attention",
  continuity: "Continuity",
  "trust-actions": "Trust Actions",
  "chief-of-staff": "Chief of Staff",
  timing: "Timing",
  relationships: "Relationships",
  digest: "Digest",
  modes: "Modes",
  interface: "Interface",
  opportunities: "Opportunities",
  boundaries: "Boundaries",
  signature: "Signature",
  strategic: "Strategic",
  capital: "Capital",
  "cost-confidence": "Cost/Confidence",
  "quality-floor": "Quality Floor",
  insurance: "Insurance",
  market: "Market",
  "time-to-truth": "Time to Truth",
  "reasoning-replay": "Reasoning Replay",
  decay: "Decay",
  portfolio: "Portfolio",
  benchmark: "Benchmark",
  "value-risk": "Value/Risk",
  "operator-taste": "Operator Taste",
  "mobile-parity": "Mobile Parity",
  team: "Teams",
  system: "System",
  "backend-topology": "Backend Topology",
  "truth-indices": "Truth Indices",
  "runtime-tier-governance": "Runtime Tier",
  "intelligence-efficiency": "Intelligence Efficiency",
};

interface Crumb {
  label: string;
  path: string;
  isLast: boolean;
}

function humanise(seg: string): string {
  return SEGMENT_LABELS[seg] ?? seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function AdminBreadcrumbs() {
  const { pathname } = useLocation();

  const crumbs = useMemo<Crumb[]>(() => {
    if (!pathname.startsWith("/admin")) return [];
    const entry = getRouteEntry(pathname);

    // Preferred path: registry-provided canonical chain.
    if (entry) {
      const domain = entry.domain as AdminDomain;
      const chain = entry.breadcrumb;
      const result: Crumb[] = [];
      // First: domain hub link
      result.push({
        label: chain[0] ?? DOMAIN_LABELS[domain],
        path: DOMAIN_HUB_PATHS[domain],
        isLast: chain.length === 1 && pathname === DOMAIN_HUB_PATHS[domain],
      });
      // Remaining segments anchor to the actual route path on the last node.
      for (let i = 1; i < chain.length; i++) {
        result.push({
          label: chain[i],
          path: i === chain.length - 1 ? entry.path : DOMAIN_HUB_PATHS[domain],
          isLast: i === chain.length - 1,
        });
      }
      return result;
    }

    // Fallback: humanised segments + inferred domain root.
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) return [];
    const inferredDomain = resolveActiveDomain(pathname);
    const result: Crumb[] = [
      {
        label: DOMAIN_LABELS[inferredDomain],
        path: DOMAIN_HUB_PATHS[inferredDomain],
        isLast: false,
      },
    ];
    let acc = "";
    for (let i = 0; i < segments.length; i++) {
      acc += `/${segments[i]}`;
      if (segments[i] === "admin") continue;
      result.push({
        label: humanise(segments[i]),
        path: acc,
        isLast: i === segments.length - 1,
      });
    }
    return result;
  }, [pathname]);

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[11px] flex-wrap">
      <Link
        to="/admin/overview"
        className="text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Admin Home"
      >
        <Home className="h-3 w-3" />
      </Link>

      {crumbs.map((crumb, idx) => (
        <span key={`${crumb.path}-${idx}`} className="flex items-center gap-1">
          <ChevronRight className="h-3 w-3 text-muted-foreground/40" />
          {crumb.isLast ? (
            <span className="text-foreground font-medium">{crumb.label}</span>
          ) : (
            <Link
              to={crumb.path}
              className={cn("text-muted-foreground hover:text-foreground transition-colors")}
            >
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
