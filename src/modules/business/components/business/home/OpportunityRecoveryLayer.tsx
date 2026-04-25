import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, RotateCcw, ArrowUpRight, Clock,
  Sparkles, DollarSign, ChevronRight, Zap,
  ShoppingCart, RefreshCw
} from "lucide-react";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { getIdentityLayer } from "@/domains/engines/business-identity-layers";

interface Opportunity {
  id: string;
  name: string;
  value: number;
  stage: string;
  momentum: "advancing" | "stalled" | "cooling";
  daysInStage: number;
  progress: number; // 0-1 stage progress
}

interface RecoveryCandidate {
  id: string;
  name: string;
  estimatedValue: number;
  signal: string;
  likelihood: number;
  type: "lead" | "cart" | "account" | "quote";
}

const MODE_OPPS: Record<string, Opportunity[]> = {
  service: [
    { id: "o1", name: "Atlas Corp Enterprise", value: 36000, stage: "Proposal Sent", momentum: "advancing", daysInStage: 2, progress: 0.75 },
    { id: "o2", name: "Meridian Annual Contract", value: 12000, stage: "Negotiation", momentum: "advancing", daysInStage: 4, progress: 0.85 },
    { id: "o3", name: "Apex Solutions Upgrade", value: 8400, stage: "Discovery", momentum: "stalled", daysInStage: 11, progress: 0.3 },
    { id: "o4", name: "Nova Digital Retainer", value: 24000, stage: "Proposal Review", momentum: "cooling", daysInStage: 8, progress: 0.6 },
  ],
  ecommerce: [
    { id: "o1", name: "Holiday Bundle Campaign", value: 28000, stage: "Live", momentum: "advancing", daysInStage: 3, progress: 0.9 },
    { id: "o2", name: "B2B Wholesale Channel", value: 45000, stage: "Setup", momentum: "advancing", daysInStage: 7, progress: 0.4 },
    { id: "o3", name: "Subscription Box Launch", value: 15000, stage: "Testing", momentum: "stalled", daysInStage: 14, progress: 0.55 },
    { id: "o4", name: "Loyalty Program Tier 2", value: 22000, stage: "Planning", momentum: "cooling", daysInStage: 21, progress: 0.2 },
  ],
  "employee-based": [
    { id: "o1", name: "Enterprise SLA Contract", value: 52000, stage: "Final Review", momentum: "advancing", daysInStage: 1, progress: 0.92 },
    { id: "o2", name: "Government RFP Response", value: 38000, stage: "Submission", momentum: "advancing", daysInStage: 5, progress: 0.7 },
    { id: "o3", name: "Consulting Engagement", value: 18000, stage: "Scoping", momentum: "stalled", daysInStage: 9, progress: 0.35 },
  ],
  "appointment-based": [
    { id: "o1", name: "Premium Package Upsell", value: 4800, stage: "Presented", momentum: "advancing", daysInStage: 2, progress: 0.65 },
    { id: "o2", name: "Corporate Wellness Contract", value: 18000, stage: "Proposal", momentum: "advancing", daysInStage: 5, progress: 0.55 },
    { id: "o3", name: "Group Booking Recurring", value: 12000, stage: "Negotiation", momentum: "stalled", daysInStage: 12, progress: 0.4 },
  ],
  agency: [
    { id: "o1", name: "TechForge Brand Refresh", value: 65000, stage: "Pitch Prep", momentum: "advancing", daysInStage: 3, progress: 0.3 },
    { id: "o2", name: "GreenCo Annual Retainer", value: 48000, stage: "Renewal", momentum: "advancing", daysInStage: 7, progress: 0.8 },
    { id: "o3", name: "StartupX Launch Campaign", value: 32000, stage: "Proposal Review", momentum: "cooling", daysInStage: 15, progress: 0.5 },
    { id: "o4", name: "CityBank Digital Ads", value: 28000, stage: "Discovery", momentum: "stalled", daysInStage: 18, progress: 0.2 },
  ],
};

const MODE_RECOVERY: Record<string, RecoveryCandidate[]> = {
  service: [
    { id: "r1", name: "Pinnacle Health Group", estimatedValue: 15000, signal: "Revisited pricing page 3x this week", likelihood: 0.72, type: "lead" },
    { id: "r2", name: "Metro Design Studio", estimatedValue: 6800, signal: "Replied to re-engagement email", likelihood: 0.58, type: "account" },
    { id: "r3", name: "Coastal Ventures", estimatedValue: 9200, signal: "Downloaded case study yesterday", likelihood: 0.45, type: "lead" },
  ],
  ecommerce: [
    { id: "r1", name: "Premium Cart — 3 items ($420)", estimatedValue: 420, signal: "Added to cart 2h ago, still active session", likelihood: 0.82, type: "cart" },
    { id: "r2", name: "Repeat Buyer — Sarah M.", estimatedValue: 280, signal: "90-day purchase cycle due, browsing today", likelihood: 0.71, type: "account" },
    { id: "r3", name: "Abandoned Checkout — $890", estimatedValue: 890, signal: "Payment failed yesterday, card on file", likelihood: 0.65, type: "cart" },
  ],
  "employee-based": [
    { id: "r1", name: "Dormant Client — TechForge", estimatedValue: 24000, signal: "New budget cycle started, previous champion promoted", likelihood: 0.55, type: "account" },
    { id: "r2", name: "Lost RFP — City Transit", estimatedValue: 35000, signal: "Winner failed delivery, re-bid likely", likelihood: 0.48, type: "lead" },
  ],
  "appointment-based": [
    { id: "r1", name: "Lapsed Client — Maria D.", estimatedValue: 1200, signal: "Visited website booking page twice this week", likelihood: 0.68, type: "account" },
    { id: "r2", name: "Cancelled Series — James K.", estimatedValue: 2400, signal: "Original cancellation reason resolved, re-engage opportunity", likelihood: 0.52, type: "account" },
  ],
  agency: [
    { id: "r1", name: "Lost Pitch — FinServ Co", estimatedValue: 42000, signal: "Winning agency dropped, client back in market", likelihood: 0.62, type: "lead" },
    { id: "r2", name: "Paused Project — RetailMax", estimatedValue: 28000, signal: "Budget freeze lifted, Q2 spending approved", likelihood: 0.55, type: "account" },
    { id: "r3", name: "Referral Lead — SaaS Startup", estimatedValue: 18000, signal: "Warm intro from existing client, perfect fit", likelihood: 0.72, type: "lead" },
  ],
};

const MOMENTUM_STYLES = {
  advancing: { color: "text-emerald-400", bg: "bg-emerald-500/10", barColor: "bg-emerald-400", label: "Advancing" },
  stalled: { color: "text-amber-400", bg: "bg-amber-500/10", barColor: "bg-amber-400", label: "Stalled" },
  cooling: { color: "text-red-400", bg: "bg-red-500/10", barColor: "bg-red-400", label: "Cooling" },
};

const TYPE_ICONS: Record<string, React.ElementType> = {
  lead: Zap, cart: ShoppingCart, account: RefreshCw, quote: DollarSign,
};

export function OpportunityRecoveryLayer() {
  const { primaryMode } = useBusinessProfile();
  const identity = getIdentityLayer(primaryMode);
  const opps = MODE_OPPS[primaryMode] || MODE_OPPS.service;
  const recovery = MODE_RECOVERY[primaryMode] || MODE_RECOVERY.service;

  const totalPipelineValue = opps.reduce((s, o) => s + o.value, 0);
  const totalRecoveryValue = recovery.reduce((s, r) => s + r.estimatedValue, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="grid grid-cols-1 lg:grid-cols-5 gap-4"
    >
      {/* Active Opportunities — 3/5 width */}
      <div className="lg:col-span-3 rounded-2xl p-5 border border-border/20" style={{ background: "hsl(var(--card) / 0.4)" }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp size={15} className="text-emerald-400" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-foreground/80">Opportunity Movement</h3>
              <span className="text-[10px] text-muted-foreground">{opps.length} active · {opps.filter(o => o.momentum === "advancing").length} advancing</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-lg font-bold font-mono text-emerald-400">${(totalPipelineValue / 1000).toFixed(0)}K</span>
            <p className="text-[9px] text-muted-foreground">pipeline value</p>
          </div>
        </div>

        <div className="space-y-2">
          {opps.map((opp, i) => {
            const m = MOMENTUM_STYLES[opp.momentum];
            return (
              <motion.div
                key={opp.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-card/30 border border-border/10 hover:border-border/25 transition-all cursor-pointer group"
              >
                {/* Progress ring */}
                <div className="relative w-9 h-9 shrink-0">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <circle cx="18" cy="18" r="15" fill="none" strokeWidth="2.5" className="stroke-muted/10" />
                    <circle
                      cx="18" cy="18" r="15" fill="none" strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeDasharray={`${opp.progress * 94.2} 94.2`}
                      style={{ stroke: `hsl(${m.color === "text-emerald-400" ? "152 55% 48%" : m.color === "text-amber-400" ? "38 85% 55%" : "0 72% 55%"})` }}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold font-mono text-foreground/50">
                    {Math.round(opp.progress * 100)}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-medium text-foreground/80 truncate">{opp.name}</p>
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${m.bg} ${m.color} font-medium`}>{m.label}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-muted-foreground">{opp.stage}</span>
                    <span className="text-[9px] text-muted-foreground/40">·</span>
                    <span className="text-[10px] text-muted-foreground">{opp.daysInStage}d in stage</span>
                  </div>
                </div>

                <span className="text-sm font-bold font-mono text-foreground/60">${(opp.value / 1000).toFixed(0)}K</span>
                <ChevronRight size={12} className="text-muted-foreground/20 group-hover:text-muted-foreground/50 transition-colors" />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Recovery Candidates — 2/5 width */}
      <div className="lg:col-span-2 rounded-2xl p-5 border border-border/20" style={{ background: "hsl(var(--card) / 0.4)" }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <RotateCcw size={15} className="text-violet-400" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-foreground/80">Recovery</h3>
              <span className="text-[10px] text-muted-foreground">{recovery.length} with signals</span>
            </div>
          </div>
          <span className="text-lg font-bold font-mono text-violet-400">
            ${totalRecoveryValue >= 1000 ? `${(totalRecoveryValue / 1000).toFixed(0)}K` : totalRecoveryValue.toLocaleString()}
          </span>
        </div>

        <div className="space-y-2">
          {recovery.map((rc, i) => {
            const TypeIcon = TYPE_ICONS[rc.type] || Zap;
            return (
              <motion.div
                key={rc.id}
                initial={{ opacity: 0, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.06 }}
                className="p-3 rounded-xl bg-card/30 border border-border/10 hover:border-violet-500/15 transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <TypeIcon size={11} className="text-violet-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-medium text-foreground/80">{rc.name}</p>
                      <span className="text-xs font-bold font-mono text-violet-400/80 shrink-0">
                        ${rc.estimatedValue >= 1000 ? `${(rc.estimatedValue / 1000).toFixed(1)}K` : rc.estimatedValue}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Sparkles size={9} className="text-violet-400/50 shrink-0" />
                      <p className="text-[9px] text-muted-foreground flex-1 line-clamp-1">{rc.signal}</p>
                    </div>
                    {/* Likelihood bar */}
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1 rounded-full bg-muted/15 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-violet-400/60"
                          initial={{ width: 0 }}
                          animate={{ width: `${rc.likelihood * 100}%` }}
                          transition={{ delay: 0.5 + i * 0.08, duration: 0.6 }}
                        />
                      </div>
                      <span className="text-[8px] font-mono text-violet-400/60">{Math.round(rc.likelihood * 100)}%</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Recovery insight */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-3 p-2.5 rounded-lg bg-violet-500/5 border border-violet-500/10"
        >
          <p className="text-[9px] text-violet-400/60">
            <span className="font-semibold">Insight:</span> Timely outreach on top candidates could recover{" "}
            <span className="font-bold text-violet-400/80">
              ${totalRecoveryValue >= 1000 ? `${(totalRecoveryValue * 0.6 / 1000).toFixed(0)}K` : Math.round(totalRecoveryValue * 0.6)}
            </span>{" "}in value.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
