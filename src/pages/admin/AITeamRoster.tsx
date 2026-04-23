import { useAuth } from "@/contexts/AuthContext";
import { AdminPageHeader } from "@/components/sita/admin/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import {
  Brain, Code, Palette, TestTube, Bug, Shield, Gauge, FileText,
  Rocket, Sparkles, TrendingUp, Users, Eye, AlertTriangle, Activity
} from "lucide-react";
import { useAIEngDomain } from "@/hooks/use-ai-engineering-data";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";

const AGENTS: any[] = [];


const autonomyColors: Record<string, string> = {
  "auto-low-risk": "bg-[hsl(var(--trust-safe))]/10 text-[hsl(var(--trust-safe))]",
  "supervised": "bg-primary/10 text-primary",
  "draft-only": "bg-amber-500/10 text-amber-500",
  "observe-only": "bg-muted text-muted-foreground",
};

const autonomyLevels = ["observe-only", "draft-only", "supervised", "auto-low-risk"] as const;

const AITeamRoster = () => {
  const [selected, setSelected] = useState<string | null>("debugger");
  const [view, setView] = useState("roster");
  const [agentAutonomy, setAgentAutonomy] = useState<Record<string, string>>({});
  const active = selected ? ([] as any[]).find(a => a.id === selected) : null;

  const getAutonomy = (agentId: string, defaultVal: string) => agentAutonomy[agentId] ?? defaultVal;

  const sorted = view === "roster" ? AGENTS :
    view === "severity" ? [...AGENTS].sort((a, b) => (b.escalation === "active" ? 2 : b.escalation === "pending" ? 1 : 0) - (a.escalation === "active" ? 2 : a.escalation === "pending" ? 1 : 0)) :
    view === "workload" ? [...AGENTS].sort((a, b) => b.queueLoad - a.queueLoad) :
    [...AGENTS].sort((a, b) => b.accuracy - a.accuracy);

  return (
    <div className="space-y-6 p-6">
<AdminPageHeader icon={Users} title="AI Team Roster" subtitle="Your AI engineering specialists — focus, queue, confidence, autonomy, and accuracy" accent="primary" />

      {/* Summary Stats */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { l: "Total Agents", v: ([] as any[]).length },
          { l: "Escalated", v: ([] as any[]).filter(a => a.escalation !== "none").length, c: "text-amber-500" },
          { l: "Total Queue", v: ([] as any[]).reduce((a, ag) => a + ag.queueLoad, 0) },
          { l: "Avg Confidence", v: `${Math.round(([] as any[]).reduce((a, ag) => a + ag.confidence, 0) / ([] as any[]).length)}%` },
          { l: "Avg Accuracy", v: `${Math.round(([] as any[]).reduce((a, ag) => a + ag.accuracy, 0) / ([] as any[]).length)}%` },
        ].map(c => (
          <div key={c.l} className="rounded-xl border border-border/40 bg-card p-3 text-center">
            <p className={`text-xl font-bold ${c.c || ""}`}>{c.v}</p>
            <p className="text-[10px] text-muted-foreground">{c.l}</p>
          </div>
        ))}
      </div>

      {/* View Selector */}
      <Tabs value={view} onValueChange={setView}>
        <TabsList>
          <TabsTrigger value="roster">Roster</TabsTrigger>
          <TabsTrigger value="workload">By Workload</TabsTrigger>
          <TabsTrigger value="severity">By Escalation</TabsTrigger>
          <TabsTrigger value="accuracy">By Accuracy</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent List */}
        <div className="lg:col-span-2 space-y-2">
          {sorted.map(a => (
            <div
              key={a.id}
              onClick={() => setSelected(a.id === selected ? null : a.id)}
              className={`rounded-xl border p-4 cursor-pointer transition-all ${
                a.id === selected ? "border-primary/40 bg-primary/5" : a.escalation !== "none" ? "border-amber-500/30 bg-amber-500/5" : "border-border/40 bg-card hover:bg-muted/30"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                  <a.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{a.name}</span>
                    {a.escalation === "active" && <Badge variant="destructive" className="text-[10px]">Escalated</Badge>}
                    {a.escalation === "pending" && <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-500">Pending</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{a.currentTask}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="w-12">
                    <div className="flex items-center justify-between text-[9px] text-muted-foreground mb-0.5">
                      <span>Q</span><span>{a.queueLoad}</span>
                    </div>
                    <Progress value={a.queueLoad * 20} className="h-1" />
                  </div>
                  <Badge className={`text-[10px] ${autonomyColors[getAutonomy(a.id, a.autonomy)] || ""}`} variant="outline">{getAutonomy(a.id, a.autonomy)}</Badge>
                  <span className="text-sm font-bold w-8 text-right">{a.confidence}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Detail Panel */}
        <div className="rounded-xl border border-border/40 bg-card p-5">
          {active ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <active.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{active.name}</h3>
                  <p className="text-xs text-muted-foreground">{active.domain}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div><p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Watching</p><p className="text-sm">{active.watching}</p></div>
                <div><p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Current Task</p><p className="text-sm">{active.currentTask}</p></div>
                <div><p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Recommended Next Action</p><p className="text-sm text-primary">{active.nextAction}</p></div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Confidence</p>
                    <Progress value={active.confidence} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">{active.confidence}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Accuracy</p>
                    <Progress value={active.accuracy} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">{active.accuracy}%</p>
                  </div>
                </div>

                {/* Boundary Controls */}
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Autonomy Level</p>
                  <div className="flex gap-1 flex-wrap">
                    {autonomyLevels.map(level => (
                      <Badge
                        key={level}
                        variant={getAutonomy(active.id, active.autonomy) === level ? "default" : "outline"}
                        className={`text-[10px] cursor-pointer transition-all ${
                          getAutonomy(active.id, active.autonomy) === level ? autonomyColors[level] : "hover:bg-muted/50"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setAgentAutonomy(prev => ({ ...prev, [active.id]: level }));
                        }}
                      >
                        {level}
                      </Badge>
                    ))}
                  </div>
                </div>

                {active.escalation !== "none" && (
                  <div className="rounded-lg bg-amber-500/5 border border-amber-500/10 p-2">
                    <p className="text-xs text-amber-500 font-semibold">Escalation: {active.escalation}</p>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border/40">
                  <div className="text-center"><p className="text-lg font-bold">{active.tasksCompleted}</p><p className="text-[10px] text-muted-foreground">Tasks Done</p></div>
                  <div className="text-center"><p className="text-lg font-bold">{active.recommendations}</p><p className="text-[10px] text-muted-foreground">Recommendations</p></div>
                  <div className="text-center"><p className="text-lg font-bold">{active.findings}</p><p className="text-[10px] text-muted-foreground">Findings</p></div>
                </div>

                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Queue Load</p>
                  <Progress value={active.queueLoad * 20} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">{active.queueLoad} items</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <Eye className="h-8 w-8 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">Select an agent to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AITeamRoster;
