import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, DollarSign, Users, TrendingUp, TrendingDown, AlertTriangle, MessageCircle } from "lucide-react";
import { ConfidenceBar, AdvisorAvatar } from "@/components/sita/primitives";
import { useBoardroomData } from "@/hooks/use-boardroom-data";
import { getAdvisorRoster } from "@/domains/advisors/topology";
import { SparklineChart } from "@/components/sita/SparklineChart";
import { AnimatedProgressRing } from "@/components/sita/AnimatedProgressRing";
import { useCountUpFormatted } from "@/hooks/useCountUp";

interface Props {
  scope: "global" | "business" | "finance" | "concierge";
  onNavigate: (module: string) => void;
}

type PulseDomain = "business" | "finance" | "concierge";

const DOMAIN_TABS: { id: PulseDomain; label: string; icon: typeof Briefcase }[] = [
  { id: "business", label: "Business", icon: Briefcase },
  { id: "finance", label: "Finance", icon: DollarSign },
  { id: "concierge", label: "Concierge", icon: Users },
];

const DOMAIN_HEALTH: Record<PulseDomain, number> = {
  business: 62,
  finance: 54,
  concierge: 78,
};

const DOMAIN_HEALTH_COLORS: Record<PulseDomain, string> = {
  business: "hsl(var(--hud-ring-active))",
  finance: "hsl(var(--hud-gauge-start))",
  concierge: "hsl(var(--hud-gauge-consensus-start))",
};

const PULSE_DATA: Record<PulseDomain, {
  metrics: { label: string; value: string; trend: "up" | "down" | "flat"; sparkData: number[] }[];
  priorities: { title: string; confidence: number; urgency: string }[];
  advisors: { name: string; domain: "business" | "money" | "concierge"; stance: string; confidence: number }[];
}> = {
  business: {
    metrics: [
      { label: "Pipeline Value", value: "$48,200", trend: "down", sparkData: [52000, 51200, 50100, 49800, 49200, 48800, 48200] },
      { label: "Active Deals", value: "7", trend: "flat", sparkData: [6, 7, 8, 7, 6, 7, 7] },
      { label: "Win Rate (30d)", value: "34%", trend: "up", sparkData: [28, 29, 30, 31, 32, 33, 34] },
    ],
    priorities: [
      { title: "Follow up on 3 stalled deals before Friday", confidence: 78, urgency: "high" },
      { title: "Send revised quote to TechCorp", confidence: 85, urgency: "medium" },
      { title: "Review support ticket backlog", confidence: 62, urgency: "low" },
    ],
    advisors: [
      { name: "Revenue Advisor", domain: "business", stance: "Prioritize collections — $18.5K at risk", confidence: 72 },
      { name: "CRM Advisor", domain: "business", stance: "Focus on relationship preservation over speed", confidence: 68 },
    ],
  },
  finance: {
    metrics: [
      { label: "Cash Reserves", value: "$7,200", trend: "down", sparkData: [9800, 9200, 8600, 8100, 7800, 7500, 7200] },
      { label: "Monthly Burn", value: "$4,800", trend: "flat", sparkData: [4600, 4700, 4800, 4750, 4800, 4850, 4800] },
      { label: "Receivables", value: "$18,500", trend: "up", sparkData: [12000, 13500, 15200, 16100, 17000, 17800, 18500] },
    ],
    priorities: [
      { title: "Address reserve shortfall — $2,800 below target", confidence: 65, urgency: "high" },
      { title: "Review AWS billing spike", confidence: 74, urgency: "medium" },
      { title: "Q2 tax preparation", confidence: 90, urgency: "low" },
    ],
    advisors: [
      { name: "Obligations Advisor", domain: "money", stance: "Defer $342/mo in non-essential subscriptions", confidence: 78 },
      { name: "Reserve Advisor", domain: "money", stance: "Accelerate receivables collection to restore buffer", confidence: 65 },
    ],
  },
  concierge: {
    metrics: [
      { label: "Overdue Tasks", value: "2", trend: "flat", sparkData: [3, 2, 3, 2, 1, 2, 2] },
      { label: "Upcoming Prep", value: "3 items", trend: "up", sparkData: [1, 1, 2, 2, 2, 3, 3] },
      { label: "Automation Rate", value: "68%", trend: "up", sparkData: [58, 60, 62, 63, 65, 66, 68] },
    ],
    priorities: [
      { title: "Complete travel prep for NYC visit", confidence: 88, urgency: "medium" },
      { title: "School enrollment decision overdue", confidence: 55, urgency: "high" },
      { title: "Grocery run optimization", confidence: 92, urgency: "low" },
    ],
    advisors: [
      { name: "Travel Advisor", domain: "concierge", stance: "All logistics confirmed — ready to approve", confidence: 88 },
      { name: "Life Admin Advisor", domain: "concierge", stance: "School enrollment needs immediate attention", confidence: 55 },
    ],
  },
};

const trendIcon = (t: "up" | "down" | "flat") => {
  if (t === "up") return <TrendingUp size={13} className="text-[hsl(var(--trust-safe))]" />;
  if (t === "down") return <TrendingDown size={13} className="text-[hsl(var(--destructive))]" />;
  return <span className="text-[10px] text-muted-foreground">—</span>;
};

const urgBadge: Record<string, string> = {
  high: "bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))]",
  medium: "bg-[hsl(var(--sita-gold))]/10 text-[hsl(var(--sita-gold))]",
  low: "bg-[hsl(var(--trust-safe))]/10 text-[hsl(var(--trust-safe))]",
};

export function BoardroomPulseView({ scope, onNavigate }: Props) {
  const [domain, setDomain] = useState<PulseDomain>("business");
  const [flashKey, setFlashKey] = useState(0);
  const data = PULSE_DATA[domain];
  const { overdueTasks } = useBoardroomData();

  useEffect(() => {
    if (scope === "business" || scope === "finance" || scope === "concierge") {
      setDomain(scope);
    }
  }, [scope]);

  // Flash metrics on domain change
  useEffect(() => {
    setFlashKey((k) => k + 1);
  }, [domain]);

  return (
    <div className="p-6 space-y-6">
      {/* Domain tabs + Health Ring */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {DOMAIN_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setDomain(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold transition-all",
                domain === tab.id
                  ? "bg-hud-ring-active/10 text-hud-ring-active border border-hud-ring-active/20"
                  : "text-hud-text-muted hover:text-hud-text-secondary border border-transparent",
              )}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
        <AnimatedProgressRing
          value={DOMAIN_HEALTH[domain]}
          size={56}
          strokeWidth={5}
          label={`${domain.charAt(0).toUpperCase() + domain.slice(1)} Health`}
          color={DOMAIN_HEALTH_COLORS[domain]}
        />
      </div>

      {/* Metrics with sparklines and flash */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <AnimatePresence mode="wait">
          {data.metrics.map((m, i) => (
            <motion.div
              key={`${domain}-${m.label}-${flashKey}`}
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-4 backdrop-blur-sm relative overflow-hidden"
            >
              {/* Flash highlight on change */}
              <motion.div
                className="absolute inset-0 bg-[hsl(280_50%_50%/0.08)] pointer-events-none"
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
              />
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-medium text-[hsl(0_0%_100%/0.4)] uppercase tracking-wider">{m.label}</span>
                {trendIcon(m.trend)}
              </div>
              <div className="flex items-end justify-between gap-2">
                <p className="text-xl font-bold text-[hsl(0_0%_100%/0.9)] tabular-nums">
                  {useCountUpFormatted(m.value, 800)}
                </p>
                <SparklineChart data={m.sparkData} width={60} height={20} positive={m.trend === "up"} />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Priorities */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[hsl(280_50%_65%/0.5)] mb-3">
          Top Priorities
        </p>
        <div className="space-y-2">
          {data.priorities.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.05 }}
              className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-4 flex items-center gap-4"
            >
              <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0", urgBadge[p.urgency])}>
                {p.urgency}
              </span>
              <p className="text-[13px] font-medium text-[hsl(0_0%_100%/0.8)] flex-1">{p.title}</p>
              <ConfidenceBar value={p.confidence} size="sm" className="w-20 shrink-0" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Advisor stances — speech bubble style */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[hsl(280_50%_65%/0.5)] mb-3">
          Advisor Stances
        </p>
        <div className="space-y-2">
          {(() => {
            const roster = getAdvisorRoster(domain);
            return roster.advisors.slice(0, 4).map((topAdv, i) => {
              const stance = data.advisors.find(a => a.name === topAdv.name)?.stance
                || data.advisors[i % data.advisors.length]?.stance
                || topAdv.specialty;
              const conf = data.advisors.find(a => a.name === topAdv.name)?.confidence
                || data.advisors[i % data.advisors.length]?.confidence
                || 70;
              return (
                <motion.button
                  key={topAdv.id}
                  type="button"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  onClick={() => onNavigate("synthesis")}
                  className="w-full rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-4 flex items-start gap-3 text-left hover:bg-[hsl(0_0%_100%/0.04)] hover:border-[hsl(0_0%_100%/0.1)] transition-all group"
                >
                  {/* Portrait circle */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 border-2"
                    style={{ borderColor: topAdv.accentColor + "40", backgroundColor: topAdv.accentColor + "15" }}
                  >
                    {topAdv.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-[12px] font-bold text-[hsl(0_0%_100%/0.8)]">{topAdv.name}</p>
                      <span className="text-[9px] font-medium" style={{ color: topAdv.accentColor }}>{topAdv.role}</span>
                    </div>
                    {/* Speech bubble */}
                    <div className="relative rounded-lg bg-[hsl(0_0%_100%/0.03)] border border-[hsl(0_0%_100%/0.06)] p-2.5">
                      <div className="absolute -left-1.5 top-3 w-2.5 h-2.5 bg-[hsl(0_0%_100%/0.03)] border-l border-b border-[hsl(0_0%_100%/0.06)] rotate-45" />
                      <p className="text-[11px] text-[hsl(0_0%_100%/0.55)] italic flex items-start gap-1.5 relative z-10">
                        <MessageCircle size={10} className="shrink-0 mt-0.5 text-[hsl(280_50%_55%/0.4)]" />
                        "{stance}"
                      </p>
                    </div>
                  </div>
                  <ConfidenceBar value={conf} size="sm" showValue className="w-20 shrink-0" />
                </motion.button>
              );
            });
          })()}
        </div>
      </div>

      {/* Overdue pressure */}
      {overdueTasks.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[hsl(var(--destructive))]/60 mb-3 flex items-center gap-1.5">
            <AlertTriangle size={12} /> Overdue Pressure
          </p>
          <div className="space-y-1.5">
            {overdueTasks.slice(0, 3).map((t: any) => (
              <div key={t.id} className="rounded-lg border border-[hsl(var(--destructive))]/15 bg-[hsl(var(--destructive))]/5 p-3 text-[12px] text-[hsl(0_0%_100%/0.6)]">
                {t.title}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
