import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Cpu, Play, Pause, RotateCcw, Search, Filter, Star,
  TrendingUp, Clock, Zap, Shield, Brain, Users,
  ChevronRight, MoreVertical, Activity, BarChart3,
  CheckCircle, AlertTriangle, XCircle, Sparkles
} from "lucide-react";
import { useState } from "react";

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };

type AgentStatus = "active" | "idle" | "paused" | "degraded";

interface Agent {
  id: string;
  name: string;
  council: string;
  status: AgentStatus;
  satisfaction: number;
  accuracy: number;
  tokensToday: number;
  tasksCompleted: number;
  maturity: "scaffold" | "alpha" | "beta" | "production";
  lastActive: string;
  specialAbility: string;
}

const mockAgents: Agent[] = [
  { id: "ux-qa", name: "UX Quality Agent", council: "Product Build", status: "active", satisfaction: 94, accuracy: 91, tokensToday: 2400, tasksCompleted: 12, maturity: "beta", lastActive: "2m ago", specialAbility: "Lighthouse audits & accessibility scoring" },
  { id: "incident-commander", name: "Incident Commander", council: "Reliability Ops", status: "active", satisfaction: 97, accuracy: 95, tokensToday: 1800, tasksCompleted: 3, maturity: "production", lastActive: "now", specialAbility: "Auto-triage incidents by severity" },
  { id: "threat-detector", name: "Threat Detector", council: "Security Trust", status: "active", satisfaction: 99, accuracy: 98, tokensToday: 3200, tasksCompleted: 45, maturity: "production", lastActive: "1m ago", specialAbility: "Real-time anomaly detection" },
  { id: "token-optimizer", name: "Token Optimizer", council: "Runtime Cost", status: "idle", satisfaction: 88, accuracy: 85, tokensToday: 600, tasksCompleted: 2, maturity: "alpha", lastActive: "15m ago", specialAbility: "Model routing cost optimization" },
  { id: "import-guard", name: "Import Guard", council: "Architecture", status: "active", satisfaction: 92, accuracy: 90, tokensToday: 1100, tasksCompleted: 8, maturity: "beta", lastActive: "5m ago", specialAbility: "Dependency boundary enforcement" },
  { id: "doc-freshness", name: "Doc Freshness Agent", council: "Knowledge", status: "paused", satisfaction: 85, accuracy: 82, tokensToday: 0, tasksCompleted: 0, maturity: "scaffold", lastActive: "2h ago", specialAbility: "Stale documentation detection" },
  { id: "perf-sentry", name: "Performance Sentry", council: "Reliability Ops", status: "active", satisfaction: 93, accuracy: 89, tokensToday: 1500, tasksCompleted: 6, maturity: "beta", lastActive: "3m ago", specialAbility: "Bundle size & TTI monitoring" },
  { id: "compliance-watcher", name: "Compliance Watcher", council: "Security Trust", status: "degraded", satisfaction: 78, accuracy: 76, tokensToday: 900, tasksCompleted: 1, maturity: "alpha", lastActive: "30m ago", specialAbility: "GDPR/SOC2 policy compliance" },
];

const councils = ["All", "Product Build", "Reliability Ops", "Security Trust", "Runtime Cost", "Architecture", "Knowledge"];

const statusConfig: Record<AgentStatus, { color: string; icon: React.ElementType; label: string }> = {
  active: { color: "text-emerald-500 bg-emerald-500/10", icon: CheckCircle, label: "Active" },
  idle: { color: "text-blue-500 bg-blue-500/10", icon: Clock, label: "Idle" },
  paused: { color: "text-amber-500 bg-amber-500/10", icon: Pause, label: "Paused" },
  degraded: { color: "text-red-500 bg-red-500/10", icon: AlertTriangle, label: "Degraded" },
};

const maturityColors: Record<string, string> = {
  scaffold: "bg-muted text-muted-foreground",
  alpha: "bg-blue-500/10 text-blue-500",
  beta: "bg-purple-500/10 text-purple-500",
  production: "bg-emerald-500/10 text-emerald-500",
};

export default function TeamManagement() {
  const [search, setSearch] = useState("");
  const [council, setCouncil] = useState("All");
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const filtered = mockAgents.filter(a => {
    if (council !== "All" && a.council !== council) return false;
    if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalActive = mockAgents.filter(a => a.status === "active").length;
  const totalPaused = mockAgents.filter(a => a.status === "paused").length;
  const totalDegraded = mockAgents.filter(a => a.status === "degraded").length;
  const avgSatisfaction = Math.round(mockAgents.reduce((s, a) => s + a.satisfaction, 0) / mockAgents.length);

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Cpu className="h-6 w-6 text-primary" /> AI Team Management
          </h1>
          <p className="text-sm text-muted-foreground">Configure, deploy, train and monitor your AI engineer team</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Reset All Learning
          </Button>
          <Button size="sm">
            <Sparkles className="h-3.5 w-3.5 mr-1.5" /> Deploy New Agent
          </Button>
        </div>
      </div>

      {/* Top Stats */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <motion.div variants={fadeUp}>
          <Card><CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-foreground">{mockAgents.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Total Agents</p>
          </CardContent></Card>
        </motion.div>
        <motion.div variants={fadeUp}>
          <Card><CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-emerald-500">{totalActive}</p>
            <p className="text-xs text-muted-foreground mt-1">Active Now</p>
          </CardContent></Card>
        </motion.div>
        <motion.div variants={fadeUp}>
          <Card><CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-foreground">{avgSatisfaction}%</p>
            <p className="text-xs text-muted-foreground mt-1">Avg Satisfaction</p>
          </CardContent></Card>
        </motion.div>
        <motion.div variants={fadeUp}>
          <Card className={totalDegraded > 0 ? "border-red-500/20" : ""}>
            <CardContent className="p-4 text-center">
              <p className={`text-3xl font-bold ${totalDegraded > 0 ? "text-red-500" : "text-foreground"}`}>{totalDegraded}</p>
              <p className="text-xs text-muted-foreground mt-1">Degraded</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search agents..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {councils.map(c => (
            <Button key={c} variant={council === c ? "default" : "outline"} size="sm" onClick={() => setCouncil(c)} className="text-xs">
              {c}
            </Button>
          ))}
        </div>
      </div>

      {/* Agent Grid */}
      <Tabs defaultValue="grid">
        <TabsList className="mb-4">
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="grid">
          <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(agent => {
              const sc = statusConfig[agent.status];
              return (
                <motion.div key={agent.id} variants={fadeUp}>
                  <Card className="hover:shadow-md transition-all cursor-pointer group" onClick={() => setSelectedAgent(agent)}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-2 rounded-xl ${sc.color}`}>
                            <sc.icon className="h-4 w-4" />
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-foreground">{agent.name}</h3>
                            <p className="text-[10px] text-muted-foreground">{agent.council}</p>
                          </div>
                        </div>
                        <Badge className={maturityColors[agent.maturity]} variant="secondary">
                          {agent.maturity}
                        </Badge>
                      </div>

                      <p className="text-xs text-muted-foreground">{agent.specialAbility}</p>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-muted-foreground">Satisfaction</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Progress value={agent.satisfaction} className="h-1.5 flex-1" />
                            <span className="font-medium text-foreground">{agent.satisfaction}%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Accuracy</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Progress value={agent.accuracy} className="h-1.5 flex-1" />
                            <span className="font-medium text-foreground">{agent.accuracy}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-muted-foreground border-t border-border pt-2">
                        <span>{agent.tokensToday.toLocaleString()} tokens today</span>
                        <span>{agent.tasksCompleted} tasks</span>
                        <span>{agent.lastActive}</span>
                      </div>

                      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {agent.status === "paused" ? (
                          <Button variant="outline" size="sm" className="flex-1 text-xs h-7" onClick={e => e.stopPropagation()}>
                            <Play className="h-3 w-3 mr-1" /> Resume
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" className="flex-1 text-xs h-7" onClick={e => e.stopPropagation()}>
                            <Pause className="h-3 w-3 mr-1" /> Pause
                          </Button>
                        )}
                        <Button variant="outline" size="sm" className="flex-1 text-xs h-7" onClick={e => e.stopPropagation()}>
                          <RotateCcw className="h-3 w-3 mr-1" /> Reset
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs h-7 px-2" onClick={e => e.stopPropagation()}>
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="grid grid-cols-6 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider pb-2 border-b border-border">
                  <span className="col-span-2">Agent</span>
                  <span>Status</span>
                  <span>Satisfaction</span>
                  <span>Accuracy</span>
                  <span>Tokens</span>
                </div>
                {filtered.map(agent => {
                  const sc = statusConfig[agent.status];
                  return (
                    <div key={agent.id} className="grid grid-cols-6 items-center text-xs py-2 hover:bg-muted/30 rounded px-1 cursor-pointer" onClick={() => setSelectedAgent(agent)}>
                      <div className="col-span-2 flex items-center gap-2">
                        <div className={`p-1 rounded ${sc.color}`}><sc.icon className="h-3 w-3" /></div>
                        <div>
                          <p className="font-medium text-foreground">{agent.name}</p>
                          <p className="text-[10px] text-muted-foreground">{agent.council}</p>
                        </div>
                      </div>
                      <Badge className={sc.color} variant="secondary">{sc.label}</Badge>
                      <span className={agent.satisfaction >= 90 ? "text-emerald-500 font-medium" : "text-foreground"}>{agent.satisfaction}%</span>
                      <span className={agent.accuracy >= 90 ? "text-emerald-500 font-medium" : "text-foreground"}>{agent.accuracy}%</span>
                      <span className="text-muted-foreground">{agent.tokensToday.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Agent Detail Drawer */}
      {selectedAgent && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-lg p-4">
          <Card className="shadow-2xl border-primary/20">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{selectedAgent.name}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setSelectedAgent(null)}>
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>{selectedAgent.council} · {selectedAgent.specialAbility}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div><p className="text-lg font-bold text-foreground">{selectedAgent.satisfaction}%</p><p className="text-[10px] text-muted-foreground">Satisfaction</p></div>
                <div><p className="text-lg font-bold text-foreground">{selectedAgent.accuracy}%</p><p className="text-[10px] text-muted-foreground">Accuracy</p></div>
                <div><p className="text-lg font-bold text-foreground">{selectedAgent.tasksCompleted}</p><p className="text-[10px] text-muted-foreground">Tasks Today</p></div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1"><Brain className="h-3.5 w-3.5 mr-1.5" /> Train</Button>
                <Button variant="outline" size="sm" className="flex-1"><RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Reset</Button>
                <Button variant="outline" size="sm" className="flex-1"><Shield className="h-3.5 w-3.5 mr-1.5" /> Permissions</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
