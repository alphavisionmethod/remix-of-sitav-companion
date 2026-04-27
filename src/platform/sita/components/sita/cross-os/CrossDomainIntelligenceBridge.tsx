// ═══════════════════════════════════════════════════════════════
// Cross-Domain Intelligence Bridge
// Embeddable widget that surfaces relevant insights from other
// OS domains inline within the current app context
// ═══════════════════════════════════════════════════════════════

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, Briefcase, DollarSign, Headphones, ChevronRight,
  TrendingUp, AlertTriangle, ArrowRight, ExternalLink, Eye, X,
  Clock, Target, Receipt, Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useBusinessProfile } from "@/modules/business/hooks/useBusinessProfile";
import {
  getActiveSignals, crossNavigate,
  getFinanceAdaptation, getConciergeAdaptation,
  type CrossDomainSignal,
} from "@/domains/engines/cross-os-integration";
import type { LucideIcon } from "lucide-react";

const APP_STYLES: Record<string, { color: string; icon: LucideIcon; label: string }> = {
  business: { color: "hsl(265 55% 58%)", icon: Briefcase, label: "Business OS" },
  finance: { color: "hsl(152 55% 48%)", icon: DollarSign, label: "Finance OS" },
  concierge: { color: "hsl(285 55% 55%)", icon: Headphones, label: "Concierge OS" },
};

interface IntelligenceInsight {
  id: string;
  title: string;
  body: string;
  sourceApp: "business" | "finance" | "concierge";
  targetApp: "business" | "finance" | "concierge";
  targetModule: string;
  severity: "info" | "warning" | "critical";
  icon: LucideIcon;
  actionLabel: string;
}

function generateInsights(
  currentApp: "business" | "finance" | "concierge",
  primaryMode: string
): IntelligenceInsight[] {
  const insights: IntelligenceInsight[] = [];

  if (currentApp === "business") {
    insights.push(
      { id: "bi-1", title: "Cash stress in 12 days", body: "Payroll + rent overlap — review cash timing", sourceApp: "finance", targetApp: "finance", targetModule: "cash-timing", severity: "warning", icon: AlertTriangle, actionLabel: "View in Finance" },
      { id: "bi-2", title: "Client meeting tomorrow", body: "Dentist prep docs needed — flagged in Concierge", sourceApp: "concierge", targetApp: "concierge", targetModule: "appointments", severity: "info", icon: Clock, actionLabel: "View in Concierge" },
      { id: "bi-3", title: "Tax estimate due", body: "Quarterly payment of $4,200 due Apr 15", sourceApp: "finance", targetApp: "finance", targetModule: "tax", severity: "warning", icon: Receipt, actionLabel: "View in Finance" },
    );
  } else if (currentApp === "finance") {
    insights.push(
      { id: "fi-1", title: "Large deal closing", body: "$45K deal in final stage — expect inflow", sourceApp: "business", targetApp: "business", targetModule: "opportunities", severity: "info", icon: TrendingUp, actionLabel: "View in Business" },
      { id: "fi-2", title: "2 invoices overdue 90+ days", body: "Affects client health scores in CRM", sourceApp: "business", targetApp: "business", targetModule: "collections", severity: "critical", icon: AlertTriangle, actionLabel: "View in Business" },
      { id: "fi-3", title: "New leads converting", body: "3 leads scored 80+ this week — revenue incoming", sourceApp: "business", targetApp: "business", targetModule: "leads", severity: "info", icon: Target, actionLabel: "View in Business" },
    );
  } else {
    insights.push(
      { id: "ci-1", title: "Follow-ups overdue", body: "2 business contacts need attention", sourceApp: "business", targetApp: "business", targetModule: "follow-through", severity: "warning", icon: Users, actionLabel: "View in Business" },
      { id: "ci-2", title: "Subscription waste detected", body: "3 unused subscriptions costing $127/mo", sourceApp: "finance", targetApp: "finance", targetModule: "subscriptions", severity: "info", icon: DollarSign, actionLabel: "View in Finance" },
    );
  }

  return insights;
}

interface Props {
  currentApp: "business" | "finance" | "concierge";
  compact?: boolean;
  className?: string;
}

export function CrossDomainIntelligenceBridge({ currentApp, compact = false, className }: Props) {
  const { primaryMode } = useBusinessProfile();
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState(!compact);

  const insights = useMemo(() => generateInsights(currentApp, primaryMode), [currentApp, primaryMode]);
  const visible = insights.filter(i => !dismissedIds.has(i.id));

  if (visible.length === 0) return null;

  const criticalCount = visible.filter(i => i.severity === "critical").length;
  const warningCount = visible.filter(i => i.severity === "warning").length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-xl border border-[hsl(210_60%_55%/0.12)] bg-[hsl(210_60%_55%/0.03)]",
        className
      )}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[hsl(210_60%_55%/0.12)] flex items-center justify-center">
            <Zap size={12} className="text-[hsl(210_60%_65%)]" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-[hsl(0_0%_100%/0.7)]">Cross-Domain Intelligence</p>
            <p className="text-[9px] text-[hsl(0_0%_100%/0.3)]">
              {criticalCount > 0 ? `${criticalCount} critical` : warningCount > 0 ? `${warningCount} warnings` : `${visible.length} insights`} from other apps
            </p>
          </div>
        </div>
        <ChevronRight
          size={12}
          className={cn("text-[hsl(0_0%_100%/0.25)] transition-transform duration-200", expanded && "rotate-90")}
        />
      </button>

      {/* Insights */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-1.5">
              {visible.map(insight => {
                const source = APP_STYLES[insight.sourceApp];
                return (
                  <motion.div
                    key={insight.id}
                    layout
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    className={cn(
                      "group flex items-start gap-3 p-3 rounded-lg transition-all duration-150",
                      "hover:bg-[hsl(0_0%_100%/0.03)] cursor-pointer",
                      insight.severity === "critical" && "border border-[hsl(0_70%_55%/0.2)] bg-[hsl(0_70%_55%/0.03)]",
                      insight.severity === "warning" && "border border-[hsl(38_85%_58%/0.15)] bg-[hsl(38_85%_58%/0.02)]"
                    )}
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent("sita-launch-app", { detail: { appId: insight.targetApp } }));
                      setTimeout(() => crossNavigate(insight.targetApp, insight.targetModule), 200);
                    }}
                  >
                    {/* Source badge */}
                    <div
                      className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5"
                      style={{ backgroundColor: `${source.color}15` }}
                    >
                      <insight.icon size={13} style={{ color: source.color }} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: source.color }}>
                          from {insight.sourceApp}
                        </span>
                        {insight.severity !== "info" && (
                          <span className={cn(
                            "text-[8px] font-bold uppercase px-1 py-0.5 rounded",
                            insight.severity === "critical" ? "bg-[hsl(0_70%_55%/0.15)] text-[hsl(0_70%_60%)]" : "bg-[hsl(38_85%_58%/0.15)] text-[hsl(38_85%_62%)]"
                          )}>
                            {insight.severity}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-semibold text-[hsl(0_0%_100%/0.8)]">{insight.title}</p>
                      <p className="text-[10px] text-[hsl(0_0%_100%/0.4)] mt-0.5">{insight.body}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[9px] font-medium flex items-center gap-0.5" style={{ color: APP_STYLES[insight.targetApp].color }}>
                          <ExternalLink size={8} />
                          {insight.actionLabel}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => { e.stopPropagation(); setDismissedIds(prev => new Set([...prev, insight.id])); }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-[hsl(0_0%_100%/0.06)]"
                    >
                      <X size={10} className="text-[hsl(0_0%_100%/0.3)]" />
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default CrossDomainIntelligenceBridge;
