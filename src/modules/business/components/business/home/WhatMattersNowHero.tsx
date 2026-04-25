import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign, Clock, FileText, PhoneCall, Send, Gavel,
  Eye, ChevronRight, Zap, ShoppingCart, Users, Calendar,
  AlertTriangle, Package, RotateCcw
} from "lucide-react";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { getIdentityLayer } from "@/domains/engines/business-identity-layers";
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
  sparkline?: number[];
}

const SEVERITY_STYLES = {
  critical: { bar: "bg-red-500", bg: "bg-red-500/5", border: "border-red-500/15", text: "text-red-400", glow: "0 72% 51%" },
  warning: { bar: "bg-amber-500", bg: "bg-amber-500/5", border: "border-amber-500/15", text: "text-amber-400", glow: "38 85% 58%" },
  info: { bar: "bg-blue-400", bg: "bg-blue-400/5", border: "border-blue-400/15", text: "text-blue-400", glow: "217 80% 55%" },
};

const MODE_PRIORITIES: Record<string, PriorityItem[]> = {
  service: [
    { id: "p1", severity: "critical", title: "$18,400 in proposal value at risk", description: "No response across 3 high-value opportunities for 5+ days. Win rate drops 40% after day 7.", amount: 18400, daysOverdue: 5, confidence: 0.88, source: "Pipeline Analysis", action: { label: "Review Proposals", icon: FileText }, sparkline: [100, 95, 88, 80, 72, 65] },
    { id: "p2", severity: "critical", title: "2 overdue client follow-ups", description: "Tied to accounts with recent buying intent. Silence risks losing warm momentum.", daysOverdue: 3, confidence: 0.92, source: "Follow-Through Engine", action: { label: "Follow Up Now", icon: Send } },
    { id: "p3", severity: "warning", title: "Collections risk rising on 4 invoices", description: "Past expected payment timing by 8–15 days. Combined exposure: $12,600.", amount: 12600, daysOverdue: 12, confidence: 0.78, source: "Collections Monitor", action: { label: "Chase Payments", icon: PhoneCall }, sparkline: [20, 30, 40, 55, 65, 68] },
    { id: "p4", severity: "warning", title: "Strategic account showing drift", description: "Atlas Corp engagement dropped 40% over 3 weeks. Health score declining.", confidence: 0.71, source: "Relationship Intelligence", action: { label: "Review Account", icon: Eye }, sparkline: [85, 78, 70, 62, 55, 50] },
    { id: "p5", severity: "info", title: "Support escalation nearing Boardroom threshold", description: "Recurring issue affecting 3 high-value accounts. Retention risk if unresolved.", confidence: 0.65, source: "Support Analysis", action: { label: "Escalate", icon: Gavel } },
  ],
  ecommerce: [
    { id: "p1", severity: "critical", title: "3 high-value carts abandoned ($1,290)", description: "Premium bundle carts from returning customers. Recovery window closing in 4 hours.", amount: 1290, confidence: 0.85, source: "Cart Intelligence", action: { label: "Recover Carts", icon: ShoppingCart }, sparkline: [10, 8, 6, 5, 3, 2] },
    { id: "p2", severity: "warning", title: "Support queue elevated — 8 pending", description: "4 tickets from repeat buyers. Response delay risks negative reviews.", confidence: 0.79, source: "Support Monitor", action: { label: "Clear Queue", icon: AlertTriangle }, sparkline: [3, 4, 5, 6, 7, 8] },
    { id: "p3", severity: "warning", title: "Repeat purchase opportunity for 12 customers", description: "90-day purchase cycle customers due for re-engagement. Combined LTV: $4,200.", amount: 4200, confidence: 0.72, source: "Lifecycle Engine", action: { label: "Send Campaign", icon: Send } },
    { id: "p4", severity: "info", title: "Inventory alert: 3 SKUs below threshold", description: "Best-selling items approaching stockout. Reorder recommended within 48h.", confidence: 0.88, source: "Inventory Watch", action: { label: "Review Stock", icon: Package } },
  ],
  "employee-based": [
    { id: "p1", severity: "critical", title: "6 assignments overdue across 3 team members", description: "Jordan T. is at 95% capacity with 3 overdue items. Risk of cascade delays.", daysOverdue: 3, confidence: 0.91, source: "Workload Monitor", action: { label: "Rebalance", icon: Users }, sparkline: [2, 3, 4, 5, 5, 6] },
    { id: "p2", severity: "critical", title: "2 blocked handoffs in delivery pipeline", description: "Client deliverables waiting on internal approval. SLA at risk.", daysOverdue: 2, confidence: 0.87, source: "Handoff Tracker", action: { label: "Clear Blockers", icon: Zap } },
    { id: "p3", severity: "warning", title: "Team utilization at 92% — capacity risk", description: "Approaching threshold. New intake should be paused or distributed.", confidence: 0.82, source: "Capacity Planner", action: { label: "Review Load", icon: Eye }, sparkline: [78, 82, 85, 88, 90, 92] },
    { id: "p4", severity: "info", title: "Performance review due for 2 team members", description: "Quarterly review cycle. Prep materials available.", confidence: 0.95, source: "HR Calendar", action: { label: "Start Review", icon: Calendar } },
  ],
  "brick-and-mortar": [
    { id: "p1", severity: "warning", title: "Tomorrow's evening shift has 1 coverage gap", description: "No confirmed staff for 5-9 PM. Foot traffic forecast is 20% above average.", confidence: 0.82, source: "Schedule Intelligence", action: { label: "Fill Shift", icon: Calendar }, sparkline: [90, 92, 88, 94, 91, 85] },
    { id: "p2", severity: "warning", title: "3 inventory items approaching stockout", description: "High-demand SKUs need reorder within 48h to avoid lost sales.", confidence: 0.88, source: "Inventory Monitor", action: { label: "Reorder", icon: Package } },
    { id: "p3", severity: "info", title: "Walk-in conversion up 12% this week", description: "Staff training initiative showing results. Consider expanding to other locations.", confidence: 0.75, source: "Performance Tracker", action: { label: "View Details", icon: Eye } },
  ],
  "appointment-based": [
    { id: "p1", severity: "warning", title: "2 high-risk no-show slots tomorrow", description: "Clients with prior no-show history booked for premium time slots. Confirmation pending.", confidence: 0.78, source: "Schedule Intelligence", action: { label: "Send Reminder", icon: Send }, sparkline: [5, 6, 8, 10, 11, 12] },
    { id: "p2", severity: "warning", title: "Complex appointment needs advance prep", description: "Multi-service booking tomorrow requires 30min setup. Prep materials not yet reviewed.", daysOverdue: 1, confidence: 0.85, source: "Prep Monitor", action: { label: "Review Prep", icon: FileText } },
    { id: "p3", severity: "info", title: "Booking momentum 15% above weekly average", description: "Strong demand trend — consider opening additional availability windows.", confidence: 0.72, source: "Booking Analytics", action: { label: "View Trends", icon: Eye } },
  ],
  agency: [
    { id: "p1", severity: "critical", title: "Acme project 40% over scope — profitability at risk", description: "Scope creep has pushed the project beyond profitable range. Client conversation needed urgently.", amount: 28000, confidence: 0.88, source: "Project Analytics", action: { label: "Review Scope", icon: FileText }, sparkline: [100, 110, 118, 125, 132, 140] },
    { id: "p2", severity: "warning", title: "2 client renewals approaching — no outreach started", description: "Combined revenue exposure: $85K. Both clients have received competitive pitches.", amount: 85000, confidence: 0.82, source: "Account Intelligence", action: { label: "Start Outreach", icon: Send } },
    { id: "p3", severity: "warning", title: "Creative team utilization approaching fragile zone", description: "At 88% with pending new pitch. Adding work without resolving Acme will overshoot.", confidence: 0.79, source: "Capacity Monitor", action: { label: "Review Load", icon: Users }, sparkline: [72, 76, 80, 83, 86, 88] },
    { id: "p4", severity: "info", title: "New pitch opportunity from networking event", description: "Warm lead from industry event — fits agency sweet spot. Early discovery call recommended.", confidence: 0.65, source: "Business Development", action: { label: "Schedule Call", icon: PhoneCall } },
  ],
};

function MiniDecayLine({ values, color }: { values: number[]; color: string }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const w = 48;
  const h = 18;
  const points = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");

  // Fill area
  const fillPoints = `0,${h} ${points} ${w},${h}`;

  return (
    <svg width={w} height={h} className="shrink-0">
      <polygon fill={`hsl(${color} / 0.08)`} points={fillPoints} />
      <polyline fill="none" stroke={`hsl(${color})`} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  );
}

export function WhatMattersNowHero() {
  const { primaryMode } = useBusinessProfile();
  const identity = getIdentityLayer(primaryMode);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const priorities = MODE_PRIORITIES[primaryMode] || MODE_PRIORITIES.service;

  const criticalCount = priorities.filter(p => p.severity === "critical").length;
  const totalRisk = priorities.reduce((s, p) => s + (p.amount || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="relative rounded-2xl overflow-hidden h-full"
      style={{
        background: `linear-gradient(160deg, hsl(${identity.accentColor} / 0.05) 0%, hsl(var(--card) / 0.5) 40%)`,
        border: `1px solid hsl(${identity.accentColor} / 0.1)`,
      }}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 w-full h-[2px]" style={{ background: `linear-gradient(90deg, hsl(${identity.accentColor} / 0.5), transparent 70%)` }} />
      {/* Corner glow */}
      <div className="absolute -top-24 -left-24 w-56 h-56 rounded-full blur-[80px] opacity-8 pointer-events-none" style={{ background: `hsl(${identity.accentColor})` }} />

      <div className="relative p-5 space-y-4">
        {/* Hero header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap size={13} style={{ color: `hsl(${identity.accentColor} / 0.6)` }} />
              <span className="text-[10px] uppercase tracking-[0.15em] font-semibold text-foreground/35">What Matters Now</span>
            </div>
            <h2 className="text-lg font-bold text-foreground/90 font-[Space_Grotesk]">
              {criticalCount > 0
                ? `${criticalCount} critical item${criticalCount > 1 ? "s" : ""} need${criticalCount === 1 ? "s" : ""} attention`
                : "Business operating smoothly"
              }
            </h2>
          </div>
          {totalRisk > 0 && (
            <div className="flex flex-col items-end gap-0.5 shrink-0 p-2.5 rounded-xl bg-red-500/5 border border-red-500/10">
              <span className="text-[8px] text-red-400/60 uppercase tracking-wider">At Risk</span>
              <span className="text-xl font-bold font-mono text-red-400/90">${totalRisk.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Priority items */}
        <div className="space-y-1.5">
          {priorities.map((item, idx) => {
            const style = SEVERITY_STYLES[item.severity];
            const isExpanded = expandedId === item.id;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + idx * 0.05 }}
                className={`group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-200 ${style.bg} border ${style.border} hover:brightness-110`}
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
              >
                <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${style.bar}`} />

                <div className="pl-4 pr-3 py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <span className={`text-[12px] font-semibold leading-tight ${style.text}`}>{item.title}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.sparkline && <MiniDecayLine values={item.sparkline} color={style.glow} />}
                      {item.daysOverdue && (
                        <span className="flex items-center gap-0.5 text-[9px] text-muted-foreground/60">
                          <Clock size={9} /> {item.daysOverdue}d
                        </span>
                      )}
                      <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-foreground/5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: `hsl(${style.glow})` }} />
                        <span className="text-[8px] font-mono text-muted-foreground/60">{Math.round(item.confidence * 100)}%</span>
                      </div>
                      <ChevronRight size={12} className={`text-muted-foreground/30 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-2.5 mt-2 border-t border-border/10 flex items-end justify-between gap-3">
                          <div className="space-y-1">
                            <p className="text-[11px] text-muted-foreground leading-relaxed">{item.description}</p>
                            <span className="text-[9px] text-muted-foreground/40">Source: {item.source}</span>
                          </div>
                          <Button
                            size="sm"
                            className="shrink-0 text-[10px] gap-1.5 h-7"
                            style={{
                              background: `hsl(${identity.accentColor} / 0.12)`,
                              color: `hsl(${identity.accentColor})`,
                              border: `1px solid hsl(${identity.accentColor} / 0.2)`,
                            }}
                          >
                            <item.action.icon size={11} />
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
      </div>
    </motion.div>
  );
}
