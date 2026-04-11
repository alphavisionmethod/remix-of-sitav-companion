// ═══════════════════════════════════════════════════════════════
// SITA OS — Daily Pulse (Clean Briefing)
// A focused daily summary: greeting, key metrics, advisor insight,
// quick actions, and pending approvals.
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDataMode } from "@/contexts/DataModeContext";
import { motion } from "framer-motion";
import {
  Briefcase, DollarSign, CheckCircle, ArrowRight, Brain,
  Home, TrendingUp, Calendar, ChevronDown, ChevronUp, Sparkles
} from "lucide-react";

// ── Helpers ──────────────────────────────────────────────────
function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function formatDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });
}

// ── Demo Data ────────────────────────────────────────────────
const KEY_METRICS = [
  { label: "Revenue Today", value: "$2,450", change: "+12%", icon: TrendingUp, color: "text-emerald-400", route: "/business" },
  { label: "Pipeline Value", value: "$84K", change: "6 active", icon: Briefcase, color: "text-blue-400", route: "/business" },
  { label: "Cash Position", value: "$42K", change: "Healthy", icon: DollarSign, color: "text-green-400", route: "/money" },
  { label: "Tasks Today", value: "6", change: "2 urgent", icon: Calendar, color: "text-amber-400", route: "/concierge" },
];

const ADVISOR_INSIGHT = {
  title: "Business Advisor",
  message: "3 leads haven't been contacted in 5+ days. Re-engaging now could recover ~$12K in potential revenue. I've drafted follow-up messages for your review.",
  action: "Review Leads",
  route: "/business",
};

const QUICK_ACTIONS = [
  { label: "Business Center", icon: Briefcase, route: "/business", desc: "Pipeline & clients" },
  { label: "Money Center", icon: DollarSign, route: "/money", desc: "Finances & billing" },
  { label: "Concierge", icon: Home, route: "/concierge", desc: "Tasks & household" },
  { label: "Advisor", icon: Brain, route: "/advisor", desc: "AI council" },
];

const PENDING_APPROVALS = [
  { id: "1", title: "Invoice #1847 — $3,200", domain: "Money", urgency: "medium" as const },
  { id: "2", title: "Proposal for Acme Corp", domain: "Business", urgency: "high" as const },
  { id: "3", title: "Grocery delivery — $145", domain: "Concierge", urgency: "low" as const },
];

// ── Component ────────────────────────────────────────────────
export default function DailyPulse() {
  const { user } = useAuth();
  const { isDemoMode } = useDataMode();
  const navigate = useNavigate();
  const [approvalsOpen, setApprovalsOpen] = useState(false);

  const firstName = user?.user_metadata?.full_name?.split(" ")[0]
    || user?.email?.split("@")[0]
    || "there";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="sr-only">Daily Pulse</h1>

      {/* ── Greeting ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <h2 className="text-2xl font-bold text-foreground">
          {getGreeting()}, {firstName}
        </h2>
        <p className="text-sm text-muted-foreground">{formatDate()} · Daily Briefing</p>
      </motion.div>

      {/* ── Key Metrics ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        {KEY_METRICS.map((m) => (
          <button
            key={m.label}
            onClick={() => navigate(m.route)}
            className="rounded-xl border border-border bg-card/60 backdrop-blur-sm p-4 text-left hover:bg-secondary/40 transition-colors group"
          >
            <div className="flex items-center gap-2 mb-2">
              <m.icon className={`h-4 w-4 ${m.color}`} />
              <span className="text-[11px] text-muted-foreground uppercase tracking-wider">{m.label}</span>
            </div>
            <p className="text-xl font-bold text-foreground">{m.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{m.change}</p>
          </button>
        ))}
      </motion.div>

      {/* ── Advisor Insight ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl border border-primary/20 bg-primary/5 p-5"
      >
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-primary/10 p-2.5 shrink-0">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">{ADVISOR_INSIGHT.title}</p>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{ADVISOR_INSIGHT.message}</p>
            <button
              onClick={() => navigate(ADVISOR_INSIGHT.route)}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              {ADVISOR_INSIGHT.action}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Quick Actions ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-2"
      >
        <h3 className="text-sm font-semibold text-foreground">Quick Access</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map((a) => (
            <button
              key={a.label}
              onClick={() => navigate(a.route)}
              className="rounded-xl border border-border bg-card/60 backdrop-blur-sm p-4 text-left hover:bg-secondary/40 transition-colors group"
            >
              <a.icon className="h-5 w-5 text-primary mb-2" />
              <p className="text-sm font-medium text-foreground">{a.label}</p>
              <p className="text-[11px] text-muted-foreground">{a.desc}</p>
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Pending Approvals (collapsible) ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-xl border border-border bg-card/60 backdrop-blur-sm overflow-hidden"
      >
        <button
          onClick={() => setApprovalsOpen(!approvalsOpen)}
          className="w-full flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-medium text-foreground">
              Pending Approvals
            </span>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {PENDING_APPROVALS.length}
            </span>
          </div>
          {approvalsOpen ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>

        {approvalsOpen && (
          <div className="border-t border-border divide-y divide-border">
            {PENDING_APPROVALS.map((a) => (
              <div key={a.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm text-foreground">{a.title}</p>
                  <p className="text-[11px] text-muted-foreground">{a.domain}</p>
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                  a.urgency === "high" ? "bg-destructive/10 text-destructive" :
                  a.urgency === "medium" ? "bg-amber-500/10 text-amber-500" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {a.urgency}
                </span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
