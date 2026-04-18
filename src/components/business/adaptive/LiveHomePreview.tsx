// ═══════════════════════════════════════════════════════════════
// Live Home Preview — Miniature Business Home that updates
// in real-time as profile settings change
// ═══════════════════════════════════════════════════════════════

import React from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, Users, Calendar, BarChart3, Zap,
  ShoppingCart, Receipt, Phone, Activity, Target,
  Heart, FileText, Bot,
} from "lucide-react";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { getIdentityLayer, getTimeAwareGreeting } from "@/domains/engines/business-identity-layers";
import { getTopWidgets } from "./BusinessHomeWidgetRegistry";
import { getStatCardsForProfile, getQuickActionsForProfile } from "./AdaptiveCRMConfig";

const ICON_MAP: Record<string, React.ElementType> = {
  TrendingUp, ShoppingCart, BarChart3, Users, Calendar, Receipt, Phone, Activity, Target, Heart, FileText, Bot, Zap,
};

export default function LiveHomePreview() {
  const { weights, primaryMode, adaptations } = useBusinessProfile();
  const identity = getIdentityLayer(primaryMode);
  const greeting = getTimeAwareGreeting(primaryMode);
  const topWidgets = getTopWidgets(weights as unknown as Record<string, number>, 4);
  const statCards = getStatCardsForProfile(primaryMode);
  const quickActions = getQuickActionsForProfile(primaryMode, 3);

  return (
    <div className="h-full overflow-y-auto bg-[hsl(0_0%_4%)]">
      <div className="p-3 space-y-3">
        {/* Preview label */}
        <div className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-[hsl(var(--sita-purple))]/8 border border-[hsl(var(--sita-purple))]/15">
          <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--trust-safe))] animate-pulse" />
          <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-[hsl(var(--sita-purple))]">Live Preview</span>
        </div>

        {/* Mini header */}
        <motion.div key={`header-${primaryMode}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="text-[10px] font-bold text-foreground/70 truncate">{greeting}</p>
          <p className="text-[8px] mt-0.5 truncate" style={{ color: `hsl(${identity.accentColor})` }}>{identity.tagline}</p>
        </motion.div>

        {/* Quick actions */}
        <div className="flex gap-1">
          {quickActions.map(a => {
            const Icon = ICON_MAP[a.icon] || Zap;
            return (
              <div key={a.id} className="flex items-center gap-1 px-2 py-1 rounded-md border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.03)] text-[7px] text-foreground/40">
                <Icon size={8} />
                {a.label}
              </div>
            );
          })}
        </div>

        {/* Stat cards */}
        <motion.div key={`stats-${primaryMode}`} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-1.5">
          {statCards.slice(0, 4).map(card => (
            <div key={card.id} className="rounded-lg border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-2">
              <p className="text-[7px] font-bold uppercase tracking-wider text-foreground/25 truncate">{card.label}</p>
              <p className="text-[14px] font-bold text-foreground/70 leading-none mt-0.5">{card.value}</p>
              <p className={`text-[7px] font-semibold ${card.changeType === "positive" ? "text-[hsl(var(--trust-safe))]" : card.changeType === "negative" ? "text-[hsl(var(--destructive))]" : "text-foreground/30"}`}>
                {card.change}
              </p>
            </div>
          ))}
        </motion.div>

        {/* KPIs */}
        <div className="flex flex-wrap gap-1">
          {adaptations.kpis.slice(0, 4).map(kpi => (
            <span key={kpi} className="text-[7px] px-1.5 py-0.5 rounded-full bg-[hsl(var(--sita-purple))]/8 text-[hsl(var(--sita-purple))]">{kpi}</span>
          ))}
        </div>

        {/* Mini widgets */}
        <motion.div key={`widgets-${primaryMode}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 gap-1.5">
          {topWidgets.map(w => {
            const Icon = ICON_MAP[w.icon] || Activity;
            return (
              <div key={w.id} className="rounded-lg border border-[hsl(0_0%_100%/0.05)] bg-[hsl(0_0%_100%/0.02)] p-2">
                <Icon size={10} className="text-foreground/25 mb-1" />
                <p className="text-[8px] font-semibold text-foreground/50 truncate">{w.label}</p>
                <p className="text-[7px] text-foreground/20 truncate">{w.description}</p>
              </div>
            );
          })}
        </motion.div>

        {/* Advisors preview */}
        <div className="rounded-lg border border-[hsl(0_0%_100%/0.05)] bg-[hsl(0_0%_100%/0.02)] p-2">
          <p className="text-[7px] font-bold uppercase tracking-wider text-foreground/20 mb-1.5">Advisors</p>
          <div className="flex -space-x-1">
            {adaptations.advisors.slice(0, 5).map(adv => (
              <div
                key={adv.id}
                className="w-5 h-5 rounded-full border border-[hsl(0_0%_6%)] flex items-center justify-center text-[6px] font-bold"
                style={{ backgroundColor: `hsl(${adv.accent} / 0.2)`, color: `hsl(${adv.accent})` }}
              >
                {adv.name[0]}
              </div>
            ))}
            {adaptations.advisors.length > 5 && (
              <div className="w-5 h-5 rounded-full border border-[hsl(0_0%_6%)] bg-foreground/5 flex items-center justify-center text-[6px] text-foreground/30">
                +{adaptations.advisors.length - 5}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
