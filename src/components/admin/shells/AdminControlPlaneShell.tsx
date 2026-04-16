// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin Control Plane Shell
// Top-level layout wrapper for all /admin/* routes.
// Composes: PrimaryNav (top) + DomainNav (sidebar) + Breadcrumbs + content
// ═══════════════════════════════════════════════════════════════

import { ReactNode, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { AdminPrimaryNav } from "./AdminPrimaryNav";
import { AdminDomainNav, type AdminDomain } from "./AdminDomainNav";
import { AdminBreadcrumbs } from "./AdminBreadcrumbs";
import { TrustRibbon } from "@/components/sita/admin/TrustRibbon";
import { RolloutStatusBanner } from "../RolloutStatusBanner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Maximize2,
  Minimize2,
  AlertTriangle,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";

// ── Domain inference from pathname ─────────────────────────────
const DOMAIN_PATH_MAP: Record<string, AdminDomain> = {
  "intelligence": "intelligence",
  "ai-gateway": "intelligence",
  "ai-workforce": "intelligence",
  "advisor-board": "intelligence",
  "architecture": "governance",
  "governance": "governance",
  "platform-law": "governance",
  "fip": "governance",
  "mc/architecture": "governance",
  "launch": "launch",
  "verification": "launch",
  "implementation-truth": "launch",
  "security": "security",
  "reality-audit": "security",
  "sec": "security",
  "fleet": "operations",
  "cloud": "operations",
  "os-platform": "operations",
  "connector": "operations",
  "sync": "operations",
  "mc/devices": "operations",
  "mc/storage": "operations",
  "mc/sync": "operations",
  "mc/jobs": "operations",
  "mc/releases": "operations",
  "mc/system-health": "operations",
  "support": "support",
  "mc/support": "support",
  "mc/incidents": "support",
  "mc/knowledge": "support",
  "founder": "strategic",
  "engineering": "strategic",
  "strategic": "strategic",
  "eco": "home",
  "dashboard": "home",
  "communication": "operations",
};

function inferDomain(pathname: string): AdminDomain {
  const rel = pathname.replace("/admin/", "").replace("/admin", "");
  // Check longest matches first
  const sorted = Object.keys(DOMAIN_PATH_MAP).sort((a, b) => b.length - a.length);
  for (const prefix of sorted) {
    if (rel.startsWith(prefix)) return DOMAIN_PATH_MAP[prefix];
  }
  return "home";
}

// ── Layout density ─────────────────────────────────────────────
type LayoutDensity = "default" | "dense" | "comfortable";
const DENSITY_CLASSES: Record<LayoutDensity, string> = {
  default: "space-y-4",
  dense: "space-y-2",
  comfortable: "space-y-6",
};

// ── Props ──────────────────────────────────────────────────────
export interface AdminControlPlaneShellProps {
  children: ReactNode;
  contextScope?: string;
  showDegradedBanner?: boolean;
  degradedMessage?: string;
}

export function AdminControlPlaneShell({
  children,
  contextScope,
  showDegradedBanner = false,
  degradedMessage,
}: AdminControlPlaneShellProps) {
  const location = useLocation();
  const [density, setDensity] = useState<LayoutDensity>("default");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const activeDomain = useMemo(() => inferDomain(location.pathname), [location.pathname]);

  const cycleDensity = () =>
    setDensity((d) =>
      d === "dense" ? "comfortable" : d === "comfortable" ? "default" : "dense"
    );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── Degraded-state banner ──────────────────────────── */}
      {showDegradedBanner && (
        <div className="bg-destructive/5 border-b border-destructive/20 px-4 py-2 flex items-center gap-2 text-[11px] text-destructive">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          <span className="font-medium">
            {degradedMessage ||
              "Some platform services are operating in degraded mode. Truth state may be incomplete."}
          </span>
        </div>
      )}

      {/* ── Primary top nav ────────────────────────────────── */}
      <AdminPrimaryNav activeDomain={activeDomain} />

      {/* ── Utility bar (trust ribbon + density toggle) ───── */}
      <div className="border-b border-border/50 px-6 py-1.5 flex items-center justify-between bg-card/30">
        <div className="flex items-center gap-3">
          <TrustRibbon />
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setSidebarCollapsed((c) => !c)}
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? (
              <PanelLeft className="h-3.5 w-3.5" />
            ) : (
              <PanelLeftClose className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {contextScope && (
            <Badge variant="outline" className="text-[9px] h-5">
              {contextScope}
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-[10px] px-2"
            onClick={cycleDensity}
          >
            {density === "dense" ? (
              <Maximize2 className="h-3 w-3" />
            ) : (
              <Minimize2 className="h-3 w-3" />
            )}
            <span className="ml-1 capitalize">{density}</span>
          </Button>
        </div>
      </div>

      {/* ── Main body: sidebar + content ───────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Domain sidebar */}
        <AdminDomainNav
          activeDomain={activeDomain}
          collapsed={sidebarCollapsed}
          currentPath={location.pathname}
        />

        {/* Content area */}
        <main className="flex-1 overflow-y-auto">
          {/* Rollout banner */}
          <div className="px-6 pt-3">
            <RolloutStatusBanner />
          </div>

          {/* Breadcrumbs */}
          <div className="px-6 pt-2 pb-1">
            <AdminBreadcrumbs />
          </div>

          {/* Page content */}
          <div className={cn("px-6 pb-6 pt-1", DENSITY_CLASSES[density])}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
