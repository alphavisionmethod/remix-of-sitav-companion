import { Typography } from "@/components/sita/Typography";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Theater, AlertTriangle, CheckCircle, Users, TrendingUp, Shield, Zap, ArrowRight, FileText, ThumbsUp, ThumbsDown, Clock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
type DecisionState = "draft" | "review" | "approved" | "executed";

export default function DecisionTheater() {
  const [tab, setTab] = useState("decisions");
  const [decisionStates, setDecisionStates] = useState<Record<number, DecisionState>>({});
  const [scenarioStates, setScenarioStates] = useState<Record<number, "pending" | "approved" | "rejected">>({});

  const setDecisionState = (idx: number, state: DecisionState) => setDecisionStates(prev => ({ ...prev, [idx]: state }));
  const setScenarioState = (idx: number, state: "pending" | "approved" | "rejected") => setScenarioStates(prev => ({ ...prev, [idx]: state }));

  const getStateColor = (s: DecisionState) => s === "approved" ? "text-[hsl(var(--trust-safe))]" : s === "executed" ? "text-primary" : s === "review" ? "text-orange-400" : "text-muted-foreground";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
<div>
        <Typography role="appTitle" className="flex items-center gap-2"><Theater className="h-6 w-6 text-purple-400" /> Business Decision Theater</Typography>
        <p className="text-muted-foreground">Pre-launch review — impact simulation, advisor debate, risk analysis, and authorization</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { l: "Pending Decisions", v: ([] as typeof pendingDecisions).length, c: "text-purple-400" },
          { l: "Scenarios to Review", v: ([] as any[]).length, c: "text-primary" },
          { l: "Avg Confidence", v: `${Math.round(([] as any[]).reduce((a, s) => a + s.confidence, 0) / ([] as any[]).length)}%`, c: "text-[hsl(var(--trust-safe))]" },
          { l: "Advisor Votes", v: ([] as any[]).reduce((a, s) => a + s.advisorVotes.approve + s.advisorVotes.cautious + s.advisorVotes.oppose, 0), c: "text-foreground" },
        ].map(m => (
          <div key={m.l} className="rounded-xl border border-border/40 bg-card p-3 text-center">
            <p className="text-xs text-muted-foreground">{m.l}</p>
            <p className={`text-xl font-bold ${m.c}`}>{m.v}</p>
          </div>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="decisions"><Theater className="h-3.5 w-3.5 mr-1" />Decisions</TabsTrigger>
          <TabsTrigger value="scenarios"><Zap className="h-3.5 w-3.5 mr-1" />Scenario Simulation</TabsTrigger>
          <TabsTrigger value="governance"><Shield className="h-3.5 w-3.5 mr-1" />Governance & Proof</TabsTrigger>
        </TabsList>

        {/* Decisions */}
        <TabsContent value="decisions" className="space-y-4 mt-4">
          {([] as typeof pendingDecisions).map((d, i) => {
            const state = decisionStates[i] || "draft";
            return (
              <Card key={i} className="bg-card/50 border-border/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2"><Theater className="h-5 w-5 text-purple-400" />{d.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{d.type}</Badge>
                      <Badge variant="outline" className={getStateColor(state)}>{state}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                      <div className="flex items-center gap-2 mb-1"><TrendingUp className="h-4 w-4 text-emerald-400" /><span className="text-xs font-medium text-emerald-400">Expected Impact</span></div>
                      <p className="text-sm text-foreground">{d.impact}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                      <div className="flex items-center gap-2 mb-1"><AlertTriangle className="h-4 w-4 text-amber-400" /><span className="text-xs font-medium text-amber-400">Risk</span></div>
                      <p className="text-sm text-foreground">{d.risk}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                      <div className="flex items-center gap-2 mb-1"><Users className="h-4 w-4 text-blue-400" /><span className="text-xs font-medium text-blue-400">Affected</span></div>
                      <p className="text-sm text-foreground">{d.affected}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Advisor Commentary</p>
                    {d.advisors.map((a, j) => (
                      <div key={j} className="p-2 rounded bg-background/50 border border-border/30 flex items-center justify-between">
                        <div><span className="text-xs font-medium text-blue-400">{a.name}:</span> <span className="text-xs text-foreground">{a.stance}</span></div>
                        <Badge variant="secondary" className="text-[10px]">{a.confidence}% confidence</Badge>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1"><AlertTriangle className="h-3 w-3" />What Could Break This</p>
                    {d.whatBreaks.map((w, j) => (
                      <div key={j} className="flex items-center gap-2 text-xs text-foreground"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" />{w}</div>
                    ))}
                  </div>

                  {/* Authorization Flow */}
                  <div className="pt-2 border-t border-border/30">
                    <div className="flex items-center gap-2 mb-3">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Authorization Flow</p>
                      <div className="flex items-center gap-1">
                        {(["draft", "review", "approved", "executed"] as DecisionState[]).map((s, si) => (
                          <div key={s} className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${(["draft", "review", "approved", "executed"].indexOf(state) >= si) ? "bg-primary" : "bg-muted"}`} />
                            {si < 3 && <div className={`w-4 h-px ${(["draft", "review", "approved", "executed"].indexOf(state) > si) ? "bg-primary" : "bg-muted"}`} />}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {state === "draft" && <Button size="sm" variant="outline" onClick={() => setDecisionState(i, "review")} className="text-xs">Submit for Review</Button>}
                      {state === "review" && (
                        <>
                          <Button size="sm" onClick={() => setDecisionState(i, "approved")} className="text-xs flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5" />Authorize</Button>
                          <Button size="sm" variant="outline" onClick={() => setDecisionState(i, "draft")} className="text-xs">Request Changes</Button>
                        </>
                      )}
                      {state === "approved" && <Button size="sm" onClick={() => setDecisionState(i, "executed")} className="text-xs flex items-center gap-1"><Zap className="h-3.5 w-3.5" />Execute Launch</Button>}
                      {state === "executed" && <Badge className="text-xs bg-primary/20 text-primary">Executed — Receipt Generated</Badge>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* Scenario Simulation */}
        <TabsContent value="scenarios" className="space-y-3 mt-4">
          {([] as any[]).map((s, i) => {
            const state = scenarioStates[i] || "pending";
            return (
              <Card key={i} className={`bg-card/50 ${state === "approved" ? "border-[hsl(var(--trust-safe))]/30" : state === "rejected" ? "border-destructive/30" : "border-border/50"}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-foreground">{s.title}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]"><Clock className="w-3 h-3 mr-0.5" />{s.timeframe}</Badge>
                      {state !== "pending" && <Badge variant={state === "approved" ? "default" : "destructive"} className="text-[10px]">{state}</Badge>}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-center">
                      <p className="text-[10px] text-emerald-400">Projected Revenue</p>
                      <p className="text-sm font-bold text-emerald-400">{s.projectedRevenue}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-amber-500/5 border border-amber-500/20 text-center">
                      <p className="text-[10px] text-amber-400">Risk</p>
                      <p className="text-xs text-foreground">{s.risk}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-blue-500/5 border border-blue-500/20 text-center">
                      <p className="text-[10px] text-blue-400">Confidence</p>
                      <Progress value={s.confidence} className="h-1.5 mt-1" />
                      <p className="text-xs font-bold text-foreground mt-0.5">{s.confidence}%</p>
                    </div>
                  </div>

                  {/* Advisor Votes */}
                  <div className="flex items-center gap-4 mb-3 text-xs">
                    <span className="text-[hsl(var(--trust-safe))] flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> {s.advisorVotes.approve} approve</span>
                    <span className="text-orange-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {s.advisorVotes.cautious} cautious</span>
                    <span className="text-destructive flex items-center gap-1"><ThumbsDown className="w-3 h-3" /> {s.advisorVotes.oppose} oppose</span>
                  </div>

                  {state === "pending" && (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => setScenarioState(i, "approved")} className="text-xs"><CheckCircle className="w-3.5 h-3.5 mr-1" />Approve Scenario</Button>
                      <Button size="sm" variant="outline" onClick={() => setScenarioState(i, "rejected")} className="text-xs">Reject</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* Governance & Proof */}
        <TabsContent value="governance" className="mt-4 space-y-4">
          <Card className="bg-card/50 border-border/50">
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> Decision Governance Log</CardTitle></CardHeader>
            <CardContent>
              <div className="rounded-xl border border-border/40 overflow-hidden">
                <table className="w-full text-xs">
                  <thead><tr className="border-b border-border/40 bg-muted/30"><th className="text-left p-3">Decision</th><th className="text-center p-3">Type</th><th className="text-center p-3">Advisors</th><th className="text-center p-3">Status</th><th className="text-center p-3">Proof</th></tr></thead>
                  <tbody>
                    {([] as typeof pendingDecisions).map((d, i) => {
                      const state = decisionStates[i] || "draft";
                      return (
                        <tr key={i} className="border-b border-border/20">
                          <td className="p-3 font-medium">{d.title}</td>
                          <td className="p-3 text-center"><Badge variant="outline" className="text-[10px]">{d.type}</Badge></td>
                          <td className="p-3 text-center">{d.advisors.length} reviewed</td>
                          <td className="p-3 text-center"><Badge variant={state === "executed" ? "default" : "outline"} className={`text-[10px] ${getStateColor(state)}`}>{state}</Badge></td>
                          <td className="p-3 text-center">
                            {state === "executed" ? (
                              <span className="text-[hsl(var(--trust-safe))] flex items-center justify-center gap-1"><FileText className="w-3 h-3" />Receipt</span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {([] as any[]).map((s, i) => {
                      const state = scenarioStates[i] || "pending";
                      return (
                        <tr key={`s${i}`} className="border-b border-border/20">
                          <td className="p-3 font-medium">{s.title}</td>
                          <td className="p-3 text-center"><Badge variant="outline" className="text-[10px]">Scenario</Badge></td>
                          <td className="p-3 text-center">{s.advisorVotes.approve + s.advisorVotes.cautious + s.advisorVotes.oppose} voted</td>
                          <td className="p-3 text-center"><Badge variant={state === "approved" ? "default" : state === "rejected" ? "destructive" : "outline"} className="text-[10px]">{state}</Badge></td>
                          <td className="p-3 text-center">{state !== "pending" ? <span className="text-[hsl(var(--trust-safe))] flex items-center justify-center gap-1"><FileText className="w-3 h-3" />Logged</span> : "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );

}
