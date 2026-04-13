import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Briefcase, DollarSign, Users, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { ConfidenceBar, AdvisorAvatar } from "@/components/sita/primitives";
import { useBoardroomData } from "@/hooks/use-boardroom-data";

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

const PULSE_DATA: Record<PulseDomain, {
  metrics: { label: string; value: string; trend: "up" | "down" | "flat" }[];
  priorities: { title: string; confidence: number; urgency: string }[];
  advisors: { name: string; domain: "business" | "money" | "concierge"; stance: string; confidence: number }[];
}> = {
  business: {
    metrics: [
      { label: "Pipeline Value", value: "$48,200", trend: "down" },
      { label: "Active Deals", value: "7", trend: "flat" },
      { label: "Win Rate (30d)", value: "34%", trend: "up" },
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
      { label: "Cash Reserves", value: "$7,200", trend: "down" },
      { label: "Monthly Burn", value: "$4,800", trend: "flat" },
      { label: "Receivables", value: "$18,500", trend: "up" },
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
      { label: "Overdue Tasks", value: "2", trend: "flat" },
      { label: "Upcoming Prep", value: "3 items", trend: "up" },
      { label: "Automation Rate", value: "68%", trend: "up" },
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
  const data = PULSE_DATA[domain];
  const { overdueTasks } = useBoardroomData();

  // Sync domain tab with header scope
  useEffect(() => {
    if (scope === "business" || scope === "finance" || scope === "concierge") {
      setDomain(scope);
    }
  }, [scope]);

  return (
    <div className="p-6 space-y-6">
      {/* Domain tabs */}
      <div className="flex items-center gap-1">
        {DOMAIN_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setDomain(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold transition-all",
              domain === tab.id
                ? "bg-[hsl(280_40%_50%/0.1)] text-[hsl(280_50%_75%)] border border-[hsl(280_50%_50%/0.2)]"
                : "text-[hsl(0_0%_100%/0.4)] hover:text-[hsl(0_0%_100%/0.7)] border border-transparent",
            )}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-3">
        {data.metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-4 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-medium text-[hsl(0_0%_100%/0.4)] uppercase tracking-wider">{m.label}</span>
              {trendIcon(m.trend)}
            </div>
            <p className="text-xl font-bold text-[hsl(0_0%_100%/0.9)] tabular-nums">{m.value}</p>
          </motion.div>
        ))}
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

      {/* Advisor stances */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[hsl(280_50%_65%/0.5)] mb-3">
          Advisor Stances
        </p>
        <div className="space-y-2">
          {data.advisors.map((adv, i) => (
            <motion.div
              key={adv.name}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-4 flex items-start gap-3"
            >
              <AdvisorAvatar domain={adv.domain} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-[hsl(0_0%_100%/0.7)] mb-0.5">{adv.name}</p>
                <p className="text-[12px] text-[hsl(0_0%_100%/0.5)] italic">"{adv.stance}"</p>
              </div>
              <ConfidenceBar value={adv.confidence} size="sm" showValue className="w-20 shrink-0" />
            </motion.div>
          ))}
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
