import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Brain, DollarSign, RefreshCw, CheckCircle, AlertTriangle, Pause,
  Activity, Zap, Eye, BarChart3, Users, Settings, XCircle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };

const AI_METRICS = {
  activeAgents: 12,
  totalTasks: 847,
  avgConfidence: 88.4,
  cacheHitRate: 72,
  costToday: 4.28,
  policyBlocks: 3,
  escalationQueue: 2,
  builderReviewerDisagreements: 1,
};

const ACTIVE_AGENTS = [
  { id: "a1", name: "Business Advisor", council: "business", status: "active", confidence: 91, tasks: 142, cost: "$0.84", model: "gemini-2.5-pro" },
  { id: "a2", name: "Finance Advisor", council: "finance", status: "active", confidence: 89, tasks: 98, cost: "$0.62", model: "gpt-5-mini" },
  { id: "a3", name: "Concierge Agent", council: "concierge", status: "active", confidence: 94, tasks: 234, cost: "$0.41", model: "gemini-2.5-flash" },
  { id: "a4", name: "Security Scanner", council: "ops", status: "active", confidence: 97, tasks: 56, cost: "$0.32", model: "gpt-5" },
  { id: "a5", name: "Sync Optimizer", council: "ops", status: "paused", confidence: 82, tasks: 28, cost: "$0.18", model: "gemini-2.5-flash-lite" },
  { id: "a6", name: "Cost Optimizer", council: "ops", status: "active", confidence: 86, tasks: 67, cost: "$0.24", model: "gpt-5-nano" },
];

const MODEL_ROUTING = [
  { model: "gemini-2.5-pro", calls: 342, percent: 28, avgCost: 0.012 },
  { model: "gpt-5-mini", calls: 289, percent: 24, avgCost: 0.008 },
  { model: "gemini-2.5-flash", calls: 256, percent: 21, avgCost: 0.004 },
  { model: "gpt-5-nano", calls: 198, percent: 16, avgCost: 0.002 },
  { model: "gpt-5", calls: 127, percent: 11, avgCost: 0.024 },
];

const MCAIControl = () => {
  ;
  const [tab, setTab] = useState<"agents" | "routing" | "escalations">("agents");

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">AI Control</h1>
          <p className="text-sm text-muted-foreground mt-1">Active agents, model routing, costs, and escalations</p>
        </div>
        <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5"><RefreshCw className="h-3 w-3" /> Refresh</Button>
      </div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
        {/* Metrics */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Active Agents", value: AI_METRICS.activeAgents, icon: Brain, color: "text-primary" },
            { label: "Avg Confidence", value: `${AI_METRICS.avgConfidence}%`, icon: CheckCircle, color: "text-emerald-400" },
            { label: "Cache Hit Rate", value: `${AI_METRICS.cacheHitRate}%`, icon: Zap, color: "text-primary" },
            { label: "Cost Today", value: `$${AI_METRICS.costToday}`, icon: DollarSign, color: "text-emerald-400" },
          ].map(m => (
            <Card key={m.label} className="hover:-translate-y-0.5 transition-transform">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <m.icon className={`h-4 w-4 ${m.color}`} />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{m.label}</span>
                </div>
                <p className="text-xl font-bold text-foreground">{m.value}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Tab Navigation */}
        <motion.div variants={fadeUp} className="flex gap-1">
          {(["agents", "routing", "escalations"] as const).map(t => (
            <Button key={t} variant={tab === t ? "default" : "outline"} size="sm" className="h-8 text-xs capitalize" onClick={() => setTab(t)}>{t}</Button>
          ))}
        </motion.div>

        {/* Active Agents Tab */}
        {tab === "agents" && (
          <motion.div variants={fadeUp}>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Active Agents</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {ACTIVE_AGENTS.map(agent => (
                  <div key={agent.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/10 hover:bg-muted/10 transition-colors group">
                    <Brain className="h-4 w-4 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-foreground">{agent.name}</span>
                        <Badge variant="outline" className="text-[9px] h-4">{agent.council}</Badge>
                        <Badge variant="outline" className={`text-[9px] h-4 ${agent.status === "active" ? "text-emerald-400 border-emerald-500/20" : "text-amber-400 border-amber-500/20"}`}>{agent.status}</Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-[10px] text-muted-foreground">
                        <span>Conf: {agent.confidence}%</span>
                        <span>Tasks: {agent.tasks}</span>
                        <span>Cost: {agent.cost}</span>
                        <span>Model: {agent.model}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2"><Eye className="h-2.5 w-2.5 mr-1" /> Trace</Button>
                      <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2"><Pause className="h-2.5 w-2.5 mr-1" /> Pause</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Model Routing Tab */}
        {tab === "routing" && (
          <motion.div variants={fadeUp}>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Model Routing Distribution</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {MODEL_ROUTING.map(m => (
                  <div key={m.model} className="flex items-center gap-3">
                    <span className="text-xs text-foreground w-36 shrink-0 font-mono">{m.model}</span>
                    <div className="flex-1"><Progress value={m.percent} className="h-2" /></div>
                    <span className="text-[10px] text-muted-foreground w-16 text-right">{m.calls} calls</span>
                    <span className="text-[10px] text-muted-foreground w-16 text-right">${m.avgCost}/call</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Escalations Tab */}
        {tab === "escalations" && (
          <motion.div variants={fadeUp}>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Escalation Queue</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {[
                  { title: "Builder-Reviewer disagreement on sync fix approach", agents: "Sync Optimizer vs Security Scanner", severity: "medium", time: "15m ago" },
                  { title: "Budget exceeded without pre-approval", agents: "Finance Advisor", severity: "low", time: "2h ago" },
                ].map((e, i) => (
                  <div key={i} className="p-3 rounded-lg border border-border/10 bg-muted/5">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                      <span className="text-xs font-medium text-foreground">{e.title}</span>
                      <Badge variant="outline" className="text-[9px] h-4 ml-auto">{e.severity}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span>Agents: {e.agents}</span>
                      <span>· {e.time}</span>
                    </div>
                    <div className="flex gap-1 mt-2">
                      <Button size="sm" className="h-6 text-[9px] px-2">Resolve</Button>
                      <Button variant="outline" size="sm" className="h-6 text-[9px] px-2">View Trace</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Quick Actions</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {[
                { label: "Pause Expensive Reasoning", icon: Pause },
                { label: "Switch to Budget Mode", icon: DollarSign },
                { label: "Require Human Review", icon: Users },
                { label: "Inspect Agent Trace", icon: Eye },
                { label: "Clear Low-Value Loops", icon: XCircle },
              ].map(a => (
                <Button key={a.label} variant="outline" size="sm" className="h-8 text-xs gap-1.5"><a.icon className="h-3 w-3" /> {a.label}</Button>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default MCAIControl;
