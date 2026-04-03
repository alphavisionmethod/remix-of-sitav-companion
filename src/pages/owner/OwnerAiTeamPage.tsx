// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Workforce Owner Control
// Agent roster, workstreams, blocked work, budget, health
// ═══════════════════════════════════════════════════════════════

import { useNavigate } from "react-router-dom";
import { SitaCard, SitaCardTitle, SitaSectionHeader } from "@/components/sita/SitaCard";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAITeamSummary } from "@/hooks/use-mission-control-views";
import {
  Cpu, Users, Zap, AlertTriangle, CheckCircle, Pause, Play,
  ChevronRight, BarChart3, Shield, Target, Activity, Clock,
} from "lucide-react";

interface AgentView {
  id: string;
  name: string;
  council: string;
  role: string;
  status: "active" | "paused" | "error" | "cooldown";
  tasksCompleted: number;
  tasksBlocked: number;
  tokenBudgetUsed: number;
  tokenBudgetMax: number;
  confidence: number;
}

const agents: AgentView[] = [
  { id: "ag-1", name: "Schema Validator", council: "Architecture", role: "Validates all schema changes", status: "active", tasksCompleted: 142, tasksBlocked: 0, tokenBudgetUsed: 12400, tokenBudgetMax: 50000, confidence: 97 },
  { id: "ag-2", name: "Cost Sentinel", council: "Runtime & Cost", role: "Monitors runtime spend", status: "active", tasksCompleted: 89, tasksBlocked: 0, tokenBudgetUsed: 8200, tokenBudgetMax: 30000, confidence: 95 },
  { id: "ag-3", name: "Trust Auditor", council: "Security & Trust", role: "Audits trust posture changes", status: "active", tasksCompleted: 67, tasksBlocked: 1, tokenBudgetUsed: 15600, tokenBudgetMax: 40000, confidence: 92 },
  { id: "ag-4", name: "Onboarding Guide", council: "Product Build", role: "Manages user onboarding flows", status: "paused", tasksCompleted: 34, tasksBlocked: 2, tokenBudgetUsed: 4800, tokenBudgetMax: 20000, confidence: 88 },
  { id: "ag-5", name: "Incident Responder", council: "Reliability Ops", role: "Auto-responds to incidents", status: "active", tasksCompleted: 23, tasksBlocked: 0, tokenBudgetUsed: 21000, tokenBudgetMax: 60000, confidence: 94 },
  { id: "ag-6", name: "Knowledge Curator", council: "Knowledge", role: "Maintains knowledge graphs", status: "cooldown", tasksCompleted: 56, tasksBlocked: 1, tokenBudgetUsed: 18900, tokenBudgetMax: 35000, confidence: 91 },
];

const statusStyles: Record<string, { bg: string; text: string; dot: string }> = {
  active: { bg: "bg-trust-verified/10", text: "text-trust-safe", dot: "bg-trust-safe" },
  paused: { bg: "bg-secondary", text: "text-muted-foreground", dot: "bg-muted-foreground" },
  error: { bg: "bg-destructive/10", text: "text-destructive", dot: "bg-destructive" },
  cooldown: { bg: "bg-accent/10", text: "text-accent", dot: "bg-accent" },
};

export default function OwnerAiTeamPage() {
  const navigate = useNavigate();
  const summary = useAITeamSummary();
  const activeCount = agents.filter(a => a.status === "active").length;
  const blockedTotal = agents.reduce((s, a) => s + a.tasksBlocked, 0);

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 via-card to-card p-6"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sita-gold/10 shadow-lg shadow-sita-gold/10">
            <Cpu className="h-7 w-7 text-sita-gold" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">AI Workforce</h1>
            <p className="text-sm text-muted-foreground">Agent roster, workstreams, budget, governance</p>
          </div>
          <button onClick={() => navigate("/owner/ai-team/updates")}
            className="ml-auto flex items-center gap-1.5 rounded-xl border border-border bg-card/60 px-4 py-2 text-xs text-muted-foreground hover:text-foreground transition-all"
          ><Activity className="h-3.5 w-3.5" /> Updates Feed</button>
        </div>
      </motion.div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Active Agents", value: `${activeCount}/${agents.length}`, icon: Cpu },
          { label: "Tasks Completed", value: `${agents.reduce((s, a) => s + a.tasksCompleted, 0)}`, icon: CheckCircle },
          { label: "Blocked Tasks", value: `${blockedTotal}`, icon: AlertTriangle },
          { label: "Avg Confidence", value: `${Math.round(agents.reduce((s, a) => s + a.confidence, 0) / agents.length)}%`, icon: Target },
          { label: "Total Token Spend", value: `${Math.round(agents.reduce((s, a) => s + a.tokenBudgetUsed, 0) / 1000)}K`, icon: BarChart3 },
        ].map(k => (
          <div key={k.label} className="rounded-xl border border-border/50 bg-card/60 p-3 text-center">
            <k.icon className="h-4 w-4 text-primary mx-auto mb-1" />
            <p className="font-display text-lg font-bold text-foreground">{k.value}</p>
            <p className="text-[10px] text-muted-foreground">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Agent roster */}
      <SitaSectionHeader title="Agent Roster" subtitle="All agents with status, budget, and governance controls" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {agents.map((agent, i) => {
          const s = statusStyles[agent.status];
          const budgetPct = Math.round((agent.tokenBudgetUsed / agent.tokenBudgetMax) * 100);
          return (
            <motion.div key={agent.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <SitaCard hover>
                <div className="flex items-start gap-3">
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl shrink-0", s.bg)}>
                    <Cpu className={cn("h-5 w-5", s.text)} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs font-semibold text-foreground">{agent.name}</p>
                      <div className={cn("h-2 w-2 rounded-full", s.dot)} />
                      <Badge variant="outline" className="text-[9px]">{agent.council}</Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground mb-2">{agent.role}</p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-lg bg-secondary/30 p-1.5">
                        <p className="text-xs font-bold text-foreground">{agent.tasksCompleted}</p>
                        <p className="text-[8px] text-muted-foreground">done</p>
                      </div>
                      <div className="rounded-lg bg-secondary/30 p-1.5">
                        <p className={cn("text-xs font-bold", agent.tasksBlocked > 0 ? "text-accent" : "text-foreground")}>{agent.tasksBlocked}</p>
                        <p className="text-[8px] text-muted-foreground">blocked</p>
                      </div>
                      <div className="rounded-lg bg-secondary/30 p-1.5">
                        <p className="text-xs font-bold text-foreground">{agent.confidence}%</p>
                        <p className="text-[8px] text-muted-foreground">conf.</p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[9px] text-muted-foreground">Budget</span>
                      <Progress value={budgetPct} className="h-1 flex-1" />
                      <span className={cn("text-[9px] font-medium", budgetPct >= 80 ? "text-accent" : "text-muted-foreground")}>{budgetPct}%</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <Switch checked={agent.status === "active"} className="scale-75" />
                  </div>
                </div>
              </SitaCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
