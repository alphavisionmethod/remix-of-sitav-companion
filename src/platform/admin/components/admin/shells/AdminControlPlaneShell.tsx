// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin Control Plane Shell (Phase 2 — Registry Driven)
// Composes: PrimaryNav (top) + DomainNav (sidebar) + Breadcrumbs
// + content. The active canonical domain is resolved entirely from
// `admin-route-registry`, eliminating the prior duplicated path map.
// ═══════════════════════════════════════════════════════════════

import { ReactNode, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { AdminPrimaryNav, resolveActiveDomain } from "./AdminPrimaryNav";
import { AdminDomainNav } from "./AdminDomainNav";
import { AdminBreadcrumbs } from "./AdminBreadcrumbs";
import { OwnerWorkflowSwitcher } from "./OwnerWorkflowSwitcher";
import { TrustRibbon } from "@/components/sita/admin/TrustRibbon";
import { RolloutStatusBanner } from "./RolloutStatusBanner";
import { EmergencyBanner } from "@/components/admin/kill-switches/EmergencyBanner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Maximize2,
  Minimize2,
  AlertTriangle,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";

type LayoutDensity = "default" | "dense" | "comfortable";
const DENSITY_CLASSES: Record<LayoutDensity, string> = {
  default: "space-y-4",
  dense: "space-y-2",
  comfortable: "space-y-6",
};

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

  const activeDomain = useMemo(
    () => resolveActiveDomain(location.pathname),
    [location.pathname],
  );

  const cycleDensity = () =>
    setDensity((d) =>
      d === "dense" ? "comfortable" : d === "comfortable" ? "default" : "dense",
    );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── Active kill switch emergency banner ──────────── */}
      <EmergencyBanner />

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

      {/* ── Owner workflow switcher (Daily/Weekly/Support/…) ── */}
      <OwnerWorkflowSwitcher />

      {/* ── Primary top nav (12 canonical domains) ────────── */}
      <AdminPrimaryNav activeDomain={activeDomain} />

      {/* ── Utility bar ────────────────────────────────────── */}
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

      {/* ── Main body: domain sidebar + content ─────────────── */}
      <div className="flex flex-1 overflow-hidden">
        <AdminDomainNav
          activeDomain={activeDomain}
          collapsed={sidebarCollapsed}
          currentPath={location.pathname}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="px-6 pt-3">
            <RolloutStatusBanner />
          </div>

          <div className="px-6 pt-2 pb-1">
            <AdminBreadcrumbs />
          </div>

          <div className={cn("px-6 pb-6 pt-1", DENSITY_CLASSES[density])}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
