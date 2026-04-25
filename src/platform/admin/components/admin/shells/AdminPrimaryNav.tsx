// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin Primary Navigation Bar (Phase 2 — Registry Driven)
// Renders the 12 canonical owner-workflow domains, sourced from
// admin-route-registry.ts. No domain may be added here directly —
// add it to ADMIN_DOMAINS in the registry and it will appear.
// ═══════════════════════════════════════════════════════════════

import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Home,
  AlertTriangle,
  CheckSquare,
  Users,
  Brain,
  Plug,
  ShieldCheck,
  Activity,
  Rocket,
  FileSearch,
  Settings,
  LifeBuoy,
  Search,
  Bell,
} from "lucide-react";
import {
  ADMIN_DOMAINS,
  DOMAIN_HUB_PATHS,
  DOMAIN_LABELS,
  DOMAIN_DESCRIPTIONS,
  type AdminDomain,
} from "@/platform/architecture/admin-route-registry";

const DOMAIN_ICONS: Record<AdminDomain, React.ElementType> = {
  overview: Home,
  alerts: AlertTriangle,
  approvals: CheckSquare,
  environments: Users,
  "ai-runtime": Brain,
  integrations: Plug,
  "trust-security": ShieldCheck,
  health: Activity,
  releases: Rocket,
  verification: FileSearch,
  config: Settings,
  support: LifeBuoy,
};

interface AdminPrimaryNavProps {
  /** Optional override; otherwise derived from current pathname. */
  activeDomain?: AdminDomain;
}

/** Resolve the active canonical domain from the current pathname. */
export function resolveActiveDomain(pathname: string): AdminDomain {
  // Direct hub match
  for (const d of ADMIN_DOMAINS) {
    if (pathname === DOMAIN_HUB_PATHS[d] || pathname.startsWith(DOMAIN_HUB_PATHS[d] + "/")) {
      return d;
    }
  }
  // Legacy path inference — keeps deep links highlighting the right tab
  // until Phase 7 cleans them up. Order matters: longest prefix first.
  const legacy: ReadonlyArray<readonly [string, AdminDomain]> = ([
    ["/admin/ai-team", "ai-runtime"],
    ["/admin/ai-gateway", "ai-runtime"],
    ["/admin/ai-tokens", "ai-runtime"],
    ["/admin/ai-governance", "ai-runtime"],
    ["/admin/advisor-board", "ai-runtime"],
    ["/admin/cai/", "ai-runtime"],
    ["/admin/intelligence", "ai-runtime"],
    ["/admin/strategic", "ai-runtime"],
    ["/admin/graph-intelligence", "ai-runtime"],
    ["/admin/simulation-center", "ai-runtime"],
    ["/admin/mc/ai-control", "ai-runtime"],
    ["/admin/mc/costs", "ai-runtime"],
    ["/admin/cloud-backbone", "integrations"],
    ["/admin/mc/sync-cloud", "integrations"],
    ["/admin/security", "trust-security"],
    ["/admin/session-secrets", "trust-security"],
    ["/admin/mc/trust-security", "trust-security"],
    ["/admin/mc/policies", "trust-security"],
    ["/admin/mc/authority-matrix", "trust-security"],
    ["/admin/mc/control-receipts", "trust-security"],
    ["/admin/mc/state-authority", "trust-security"],
    ["/admin/mc/emergency", "trust-security"],
    ["/admin/fleet-health", "health"],
    ["/admin/backend-topology", "health"],
    ["/admin/mc/system-health", "health"],
    ["/admin/mc/storage", "health"],
    ["/admin/mc/jobs", "health"],
    ["/admin/mc/event-routing", "health"],
    ["/admin/mc/failure-recovery", "health"],
    ["/admin/mc/incidents", "health"],
    ["/admin/mc/workspaces", "health"],
    ["/admin/mc/platform-adaptation", "health"],
    ["/admin/release-engineering", "releases"],
    ["/admin/mc/releases", "releases"],
    ["/admin/mobile-parity", "releases"],
    ["/admin/launch-readiness", "releases"],
    ["/admin/mc/architecture", "verification"],
    ["/admin/mc/feature-ownership", "verification"],
    ["/admin/mc/command-routing", "verification"],
    ["/admin/mc/approval-flow", "verification"],
    ["/admin/engineering", "verification"],
    ["/admin/implementation-truth", "verification"],
    ["/admin/reality-audit", "verification"],
    ["/admin/platform-law", "verification"],
    ["/admin/verification", "verification"],
    ["/admin/mc/knowledge", "config"],
    ["/admin/founder/programs", "config"],
    ["/admin/founder/knowledge", "config"],
    ["/admin/mc/support", "support"],
    ["/admin/mc/logs", "support"],
    ["/admin/founder", "support"],
    ["/admin/users", "environments"],
    ["/admin/team", "environments"],
    ["/admin/system", "environments"],
    ["/admin/mc/devices", "environments"],
    ["/admin/mc/users", "environments"],
    ["/admin/ai-team/approvals", "approvals"],
    ["/admin/advisor-board/actions", "approvals"],
    ["/admin/dashboard", "overview"],
    ["/admin/generated-truth", "overview"],
    ["/admin/truth-indices", "overview"],
    ["/admin/runtime-tier-governance", "overview"],
    ["/admin/system-intelligence", "overview"],
    ["/admin/ecosystem", "overview"],
    ["/admin/os-platform", "overview"],
    ["/admin/communication-hub", "overview"],
  ] as const).slice().sort((a, b) => b[0].length - a[0].length);

  for (const [prefix, domain] of legacy) {
    if (pathname.startsWith(prefix)) return domain;
  }
  return "overview";
}

export function AdminPrimaryNav({ activeDomain }: AdminPrimaryNavProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const active = activeDomain ?? resolveActiveDomain(pathname);

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 h-11">
        {/* Left: SITA admin logo + 12 canonical domain tabs */}
        <div className="flex items-center gap-1 overflow-x-auto">
          <span className="text-xs font-bold tracking-wider text-primary mr-4 select-none whitespace-nowrap">
            SITA <span className="text-muted-foreground font-normal">Control Plane</span>
          </span>

          {ADMIN_DOMAINS.map((domain) => {
            const Icon = DOMAIN_ICONS[domain];
            const isActive = active === domain;
            return (
              <button
                key={domain}
                onClick={() => navigate(DOMAIN_HUB_PATHS[domain])}
                title={DOMAIN_DESCRIPTIONS[domain]}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden xl:inline">{DOMAIN_LABELS[domain]}</span>
              </button>
            );
          })}
        </div>

        {/* Right: global actions */}
        <div className="flex items-center gap-1 shrink-0 ml-2">
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" aria-label="Search">
            <Search className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" aria-label="Notifications">
            <Bell className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
