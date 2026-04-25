// ═══════════════════════════════════════════════════════════════
// Cross-OS Quick Links Panel
// Shows contextual deep-links to other OS apps based on archetype
// ═══════════════════════════════════════════════════════════════

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  ArrowDownLeft, Clock, Calculator, PieChart, FlaskConical,
  Receipt, TrendingUp, AlertTriangle, LineChart, Calendar,
  ShoppingCart, Plane, Headphones, Activity, CreditCard,
  RefreshCw, Home, ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getCrossOSLinks, crossNavigate, type CrossOSLink } from "@/domains/engines/cross-os-integration";
import type { ProfileArchetype } from "@/domains/engines/business-profile-engine";

const ICON_MAP: Record<string, React.ElementType> = {
  ArrowDownLeft, Clock, Calculator, PieChart, FlaskConical,
  Receipt, TrendingUp, AlertTriangle, LineChart, Calendar,
  ShoppingCart, Plane, Headphones, Activity, CreditCard,
  RefreshCw, Home,
};

const APP_COLORS: Record<string, string> = {
  business: "hsl(210 60% 55%)",
  finance: "hsl(152 55% 48%)",
  concierge: "hsl(270 60% 55%)",
};

interface CrossOSLinksProps {
  sourceApp: "business" | "finance" | "concierge";
  primaryMode?: ProfileArchetype;
  compact?: boolean;
  maxLinks?: number;
}

export function CrossOSLinksPanel({ sourceApp, primaryMode, compact = false, maxLinks = 6 }: CrossOSLinksProps) {
  const links = useMemo(() => getCrossOSLinks(sourceApp, primaryMode).slice(0, maxLinks), [sourceApp, primaryMode, maxLinks]);

  if (links.length === 0) return null;

  return (
    <div className={cn("rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)]", compact ? "p-3" : "p-4")}>
      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[hsl(0_0%_100%/0.25)] mb-3 flex items-center gap-1.5">
        <ExternalLink size={9} />
        Quick Links — Other Apps
      </p>
      <div className={cn("grid gap-2", compact ? "grid-cols-2" : "grid-cols-3")}>
        {links.map((link) => (
          <CrossOSLinkButton key={link.id} link={link} compact={compact} />
        ))}
      </div>
    </div>
  );
}

function CrossOSLinkButton({ link, compact }: { link: CrossOSLink; compact: boolean }) {
  const Icon = ICON_MAP[link.icon] || ExternalLink;
  const color = APP_COLORS[link.targetApp];

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => {
        // Launch the target app window via OS event
        window.dispatchEvent(new CustomEvent("sita-launch-app", { detail: { appId: link.targetApp === "finance" ? "finance" : link.targetApp === "concierge" ? "concierge" : "business" } }));
        // Then navigate to the specific module
        setTimeout(() => crossNavigate(link.targetApp, link.targetModule), 200);
      }}
      className={cn(
        "flex items-center gap-2 rounded-lg border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] transition-all duration-200 text-left",
        "hover:bg-[hsl(0_0%_100%/0.06)] hover:border-[hsl(0_0%_100%/0.12)]",
        compact ? "p-2" : "p-3"
      )}
    >
      <div
        className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon size={13} style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-[hsl(0_0%_100%/0.75)] truncate">{link.label}</p>
        {!compact && (
          <p className="text-[9px] text-[hsl(0_0%_100%/0.35)] truncate">{link.description}</p>
        )}
      </div>
    </motion.button>
  );
}

// ── Inline Cross-OS Action Button ─────────────────────────
// Smaller, inline version for embedding in cards/rows

interface CrossOSActionProps {
  targetApp: "business" | "finance" | "concierge";
  targetModule: string;
  label: string;
  icon?: React.ElementType;
  className?: string;
}

export function CrossOSAction({ targetApp, targetModule, label, icon: Icon = ExternalLink, className }: CrossOSActionProps) {
  const color = APP_COLORS[targetApp];

  return (
    <button
      type="button"
      onClick={() => {
        window.dispatchEvent(new CustomEvent("sita-launch-app", { detail: { appId: targetApp } }));
        setTimeout(() => crossNavigate(targetApp, targetModule), 200);
      }}
      className={cn(
        "inline-flex items-center gap-1.5 text-[10px] font-medium rounded-md px-2 py-1 transition-all duration-150",
        "hover:bg-[hsl(0_0%_100%/0.06)]",
        className
      )}
      style={{ color }}
    >
      <Icon size={11} />
      {label}
      <ExternalLink size={8} className="opacity-40" />
    </button>
  );
}
