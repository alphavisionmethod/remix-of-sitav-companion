import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle, DollarSign, Clock, UserX, FileText,
  ArrowRight, PhoneCall, Send, Gavel, Eye, ChevronRight,
  TrendingDown, Zap
} from "lucide-react";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { getIdentityLayer } from "@/lib/engines/business-identity-layers";
import { Button } from "@/components/ui/button";

interface PriorityItem {
  id: string;
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
  amount?: number;
  daysOverdue?: number;
  confidence: number;
  source: string;
  action: { label: string; icon: React.ElementType };
}

const SEVERITY_STYLES = {
  critical: { bar: "bg-red-500", bg: "bg-red-500/5", border: "border-red-500/15", text: "text-red-400", glow: "0 72% 51%" },
  warning: { bar: "bg-amber-500", bg: "bg-amber-500/5", border: "border-amber-500/15", text: "text-amber-400", glow: "38 85% 58%" },
  info: { bar: "bg-blue-400", bg: "bg-blue-400/5", border: "border-blue-400/15", text: "text-blue-400", glow: "217 80% 55%" },
};

const DEMO_PRIORITIES: PriorityItem[] = [
  {
    id: "p1", severity: "critical",
    title: "$18,400 in proposal value at risk",
    description: "No response across 3 high-value opportunities for 5+ days. Win rate drops 40% after day 7.",
    amount: 18400, daysOverdue: 5, confidence: 0.88, source: "Pipeline Analysis",
    action: { label: "Review Proposals", icon: FileText },
  },
  {
    id: "p2", severity: "critical",
    title: "2 overdue client follow-ups",
    description: "Tied to accounts with recent buying intent. Silence risks losing warm momentum.",
    daysOverdue: 3, confidence: 0.92, source: "Follow-Through Engine",
    action: { label: "Follow Up Now", icon: Send },
  },
  {
    id: "p3", severity: "warning",
    title: "Collections risk rising on 4 invoices",
    description: "Past expected payment timing by 8–15 days. Combined exposure: $12,600.",
    amount: 12600, daysOverdue: 12, confidence: 0.78, source: "Collections Monitor",
    action: { label: "Chase Payments", icon: PhoneCall },
  },
  {
    id: "p4", severity: "warning",
    title: "Strategic account showing relationship drift",
    description: "Atlas Corp engagement dropped 40% over 3 weeks. Health score declining.",
    confidence: 0.71, source: "Relationship Intelligence",
    action: { label: "Review Account", icon: Eye },
  },
  {
    id: "p5", severity: "info",
    title: "Support escalation becoming Boardroom-worthy",
    description: "Recurring issue affecting 3 high-value accounts. Retention risk if unresolved.",
    confidence: 0.65, source: "Support Analysis",
    action: { label: "Escalate", icon: Gavel },
  },
];

export function WhatMattersNowHero() {
  const { primaryMode } = useBusinessProfile();
  const identity = getIdentityLayer(primaryMode);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const priorities = DEMO_PRIORITIES;

  const criticalCount = priorities.filter(p => p.severity === "critical").length;
  const totalRisk = priorities.reduce((s, p) => s + (p.amount || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: `linear-gradient(160deg, hsl(${identity.accentColor} / 0.06) 0%, rgba(18,18,30,0.95) 40%)`,
        border: `1px solid hsl(${identity.accentColor} / 0.1)`,
      }}
    >
      {/* Ambient hero glow */}
      <div className="absolute top-0 left-0 w-full h-1 opacity-60" style={{ background: `linear-gradient(90deg, hsl(${identity.accentColor} / 0.6), transparent)` }} />
      <div className="absolute -top-32 -left-32 w-64 h-64 rounded-full blur-[100px] opacity-10 pointer-events-none" style={{ background: `hsl(${identity.accentColor})` }} />

      <div className="relative p-6 space-y-5">
        {/* Hero header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap size={14} className="text-foreground/60" />
              <span className="text-[10px] uppercase tracking-[0.15em] font-semibold text-foreground/40">What Matters Now</span>
            </div>
            <h2 className="text-xl font-bold text-foreground/95 font-[Space_Grotesk]">
              {criticalCount > 0
                ? `${criticalCount} critical item${criticalCount > 1 ? "s" : ""} need${criticalCount === 1 ? "s" : ""} attention`
                : "Business operating smoothly"
              }
            </h2>
          </div>
          {totalRisk > 0 && (
            <div className="flex flex-col items-end gap-0.5 shrink-0">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Total at Risk</span>
              <span className="text-2xl font-bold font-mono text-red-400/90">
                ${totalRisk.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* Priority items */}
        <div className="space-y-2">
          {priorities.map((item, idx) => {
            const style = SEVERITY_STYLES[item.severity];
            const isExpanded = expandedId === item.id;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + idx * 0.06 }}
                className={`group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-200 ${style.bg} border ${style.border}`}
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
              >
                {/* Severity bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${style.bar}`} />

                <div className="pl-4 pr-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-sm font-semibold ${style.text}`}>{item.title}</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-1">{item.description}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.daysOverdue && (
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Clock size={10} /> {item.daysOverdue}d
                        </span>
                      )}
                      <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-muted/30">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: `hsl(${style.glow})` }} />
                        <span className="text-[9px] font-mono text-muted-foreground">{Math.round(item.confidence * 100)}%</span>
                      </div>
                      <ChevronRight size={14} className={`text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                    </div>
                  </div>

                  {/* Expanded detail */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-3 mt-2 border-t border-border/10 flex items-end justify-between gap-4">
                          <div className="space-y-1.5">
                            <p className="text-xs text-muted-foreground">{item.description}</p>
                            <span className="inline-flex items-center gap-1 text-[9px] text-muted-foreground/60">
                              Source: {item.source}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            className="shrink-0 text-xs gap-1.5"
                            style={{
                              background: `hsl(${identity.accentColor} / 0.15)`,
                              color: `hsl(${identity.accentColor})`,
                              border: `1px solid hsl(${identity.accentColor} / 0.2)`,
                            }}
                          >
                            <item.action.icon size={12} />
                            {item.action.label}
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Prepared actions strip */}
        <div className="flex items-center gap-2 pt-1 flex-wrap">
          <span className="text-[9px] text-muted-foreground/50 uppercase tracking-wider mr-1">Quick:</span>
          {[
            { label: "Follow Up", icon: Send },
            { label: "Review Pipeline", icon: TrendingDown },
            { label: "Chase Payments", icon: DollarSign },
            { label: "Ask Advisor", icon: Zap },
          ].map(a => (
            <button
              key={a.label}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all hover:brightness-125"
              style={{
                background: `hsl(${identity.accentColor} / 0.06)`,
                color: `hsl(${identity.accentColor} / 0.7)`,
                border: `1px solid hsl(${identity.accentColor} / 0.08)`,
              }}
            >
              <a.icon size={10} />
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
