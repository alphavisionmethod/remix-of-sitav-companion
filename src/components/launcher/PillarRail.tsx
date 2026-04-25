// ════════════════════════════════════════════════════════════
// PillarRail — top-of-launcher row showing the 4 OS pillars
// in canonical priority order, plus the Trust Center entry.
// Drop into any launcher / home / dashboard surface.
// ════════════════════════════════════════════════════════════

import { Link } from "react-router-dom";
import { Briefcase, BellRing, Wallet, HeartPulse, Shield } from "lucide-react";
import { usePillarPriority } from "@/hooks/use-pillar-priority";
import { TRUST_LAYER } from "@/modules/_trust";
import { cn } from "@/lib/utils";

const PILLAR_ICON = {
  business: Briefcase,
  concierge: BellRing,
  finance: Wallet,
  health: HeartPulse,
} as const;

export function PillarRail({ className }: { className?: string }) {
  const { pillars } = usePillarPriority();
  return (
    <nav
      aria-label="SITA OS Pillars"
      className={cn("grid grid-cols-2 sm:grid-cols-5 gap-2", className)}
    >
      {pillars.map((p) => {
        const Icon = PILLAR_ICON[p.id];
        return (
          <Link
            key={p.id}
            to={p.routePrefix}
            className="group rounded-lg border bg-card p-3 hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-2">
              <Icon className="h-5 w-5 text-primary" />
              <span className="font-medium text-sm">{p.label}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{p.description}</p>
          </Link>
        );
      })}
      <Link
        to={TRUST_LAYER.routePrefix}
        className="group rounded-lg border bg-card p-3 hover:bg-accent transition-colors"
      >
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <span className="font-medium text-sm">{TRUST_LAYER.label}</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{TRUST_LAYER.description}</p>
      </Link>
    </nav>
  );
}