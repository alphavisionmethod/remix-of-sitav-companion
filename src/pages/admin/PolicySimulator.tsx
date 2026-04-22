import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Play, CheckCircle, XCircle, AlertTriangle, Eye, Undo2, Redo2, Save, Users, Zap, ArrowRight, Lock, Clock, GitBranch, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { DEMO_DRAFTS } from "@/data/seed/admin-platform";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
interface PolicyDraft {
  id: string;
  name: string;
  description: string;
  rule: string;
  status: "draft" | "simulated" | "approved" | "active";
  affectedSystems: string[];
  affectedUsers: number;
  riskLevel: "low" | "medium" | "high";
  approvalPath: string[];
  createdAt: string;
}

interface SimulationResult {
  policyId: string;
  passed: boolean;
  affectedCapabilities: string[];
  sideEffects: { type: string; description: string; severity: "info" | "warning" | "error" }[];
  beforeState: Record<string, string>;
  afterState: Record<string, string>;
  trustImplications: string[];
  successProbability: number;
  adoptionForecast: string;
}

const SIMULATION: SimulationResult = {
  policyId: "POL-001",
  passed: true,
  affectedCapabilities: ["invoice_approval", "payment_processing", "vendor_management"],
  sideEffects: [
    { type: "workflow", description: "Approval queue volume reduced by ~35%", severity: "info" },
    { type: "audit", description: "Auto-approved invoices will still generate audit receipts", severity: "info" },
    { type: "risk", description: "Trusted vendor score must be maintained — stale scores could auto-approve incorrectly", severity: "warning" },
  ],
  beforeState: { "approval_queue_volume": "~140/week", "avg_approval_time": "4.2 hours", "manual_reviews": "100%" },
  afterState: { "approval_queue_volume": "~90/week", "avg_approval_time": "1.8 hours", "manual_reviews": "~65%" },
  trustImplications: ["Vendor trust scores become a critical dependency", "Auto-approval audit trail must be durable"],
  successProbability: 87,
  adoptionForecast: "Low friction — affects only low-value invoices. Expect full adoption within 1 week.",
};

const RISK_CONFIG: Record<string, { color: string; bg: string }> = {
  low: { color: "text-emerald-400", bg: "bg-emerald-500/10" },
  medium: { color: "text-amber-400", bg: "bg-amber-500/10" },
  high: { color: "text-red-400", bg: "bg-red-500/10" },
};

const STATUS_CONFIG: Record<string, { color: string }> = {
  draft: { color: "text-muted-foreground" },
  simulated: { color: "text-blue-400" },
  approved: { color: "text-emerald-400" },
  active: { color: "text-primary" },
};

export default function PolicySimulator() {
  const [tab, setTab] = useState("drafts");
  const [selectedPolicy, setSelectedPolicy] = useState<string | null>("POL-001");
  const [undoStack] = useState<string[]>(["Initial draft"]);

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Policy Simulator</h1>
            <p className="text-sm text-muted-foreground">Draft, simulate, preview side-effects, and safely promote policies</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5"><Undo2 className="w-3.5 h-3.5" />Undo</Button>
            <Button variant="outline" size="sm" className="gap-1.5"><Redo2 className="w-3.5 h-3.5" />Redo</Button>
            <Button size="sm" className="gap-1.5"><Shield className="w-3.5 h-3.5" />New Policy</Button>
          </div>
        </div>
      </motion.div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/30 border border-border/40 h-8 p-0.5 gap-0.5">
          {[
            { value: "drafts", label: `Policies (${([] as typeof DEMO_DRAFTS).length})`, icon: FileText },
            { value: "simulate", label: "Simulation Results", icon: Play },
            { value: "compose", label: "Compose", icon: GitBranch },
          ].map(t => (
            <TabsTrigger key={t.value} value={t.value} className="text-[10px] h-7 px-2.5 gap-1"><t.icon className="h-3 w-3" />{t.label}</TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-4">
          <TabsContent value="drafts">
            <div className="space-y-3">
              {([] as typeof DEMO_DRAFTS).map((policy, idx) => {
                const riskCfg = RISK_CONFIG[policy.riskLevel];
                const stCfg = STATUS_CONFIG[policy.status];
                const isSelected = selectedPolicy === policy.id;
                return (
                  <motion.div key={policy.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
                    <Card className={cn("bg-card/50 border-border/50 hover:border-primary/20 transition-colors cursor-pointer", isSelected && "border-primary/40")} onClick={() => { setSelectedPolicy(policy.id); setTab("simulate"); }}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-mono text-muted-foreground">{policy.id}</span>
                              <Badge variant="outline" className={cn("text-[9px] capitalize", stCfg.color)}>{policy.status}</Badge>
                              <Badge variant="outline" className={cn("text-[9px]", riskCfg.color)}>Risk: {policy.riskLevel}</Badge>
                            </div>
                            <p className="text-sm font-medium text-foreground">{policy.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{policy.description}</p>
                            <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                              <span className="flex items-center gap-1"><Users className="w-3 h-3" />{policy.affectedUsers} users</span>
                              <span className="flex items-center gap-1"><Zap className="w-3 h-3" />{policy.affectedSystems.length} systems</span>
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{policy.createdAt}</span>
                            </div>
                            <div className="flex gap-1 mt-1.5">{policy.affectedSystems.map(s => <Badge key={s} variant="outline" className="text-[8px]">{s}</Badge>)}</div>
                          </div>
                          <div className="flex flex-col items-end gap-1.5">
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              <Lock className="w-3 h-3" />
                              {policy.approvalPath.join(" → ")}
                            </div>
                            <Button variant="outline" size="sm" className="text-[10px] h-7 gap-1"><Play className="w-3 h-3" />Simulate</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="simulate">
            <div className="space-y-4">
              <Card className={cn("border-border/50", SIMULATION.passed ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20")}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    {SIMULATION.passed ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <XCircle className="w-5 h-5 text-red-400" />}
                    <div>
                      <p className="text-sm font-medium text-foreground">Simulation {SIMULATION.passed ? "Passed" : "Failed"}</p>
                      <p className="text-xs text-muted-foreground">Success probability: {SIMULATION.successProbability}%</p>
                    </div>
                    <Badge variant="outline" className="ml-auto text-[9px]">POL-001</Badge>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-card/50 border-border/50">
                  <CardHeader className="pb-2"><CardTitle className="text-xs">Side Effects</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    {SIMULATION.sideEffects.map((se, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-muted/10">
                        {se.severity === "info" ? <CheckCircle className="w-3.5 h-3.5 text-blue-400 mt-0.5" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5" />}
                        <div>
                          <Badge variant="outline" className="text-[8px] mb-0.5">{se.type}</Badge>
                          <p className="text-xs text-foreground">{se.description}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="bg-card/50 border-border/50">
                  <CardHeader className="pb-2"><CardTitle className="text-xs">Before / After Comparison</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    {Object.keys(SIMULATION.beforeState).map(key => (
                      <div key={key} className="flex items-center justify-between text-xs p-2 rounded-lg bg-muted/10">
                        <span className="text-muted-foreground capitalize">{key.replace(/_/g, " ")}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-red-400 line-through">{SIMULATION.beforeState[key]}</span>
                          <ArrowRight className="w-3 h-3 text-muted-foreground" />
                          <span className="text-emerald-400 font-medium">{SIMULATION.afterState[key]}</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-2"><CardTitle className="text-xs">Trust Implications & Adoption Forecast</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {SIMULATION.trustImplications.map((t, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs"><Shield className="w-3 h-3 text-amber-400" /><span className="text-foreground">{t}</span></div>
                  ))}
                  <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Adoption Forecast</p>
                    <p className="text-xs text-foreground">{SIMULATION.adoptionForecast}</p>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-2">
                <Button variant="outline" size="sm">Save as Draft</Button>
                <Button variant="outline" size="sm">Request Approval</Button>
                <Button size="sm" className="gap-1.5"><CheckCircle className="w-3.5 h-3.5" />Promote to Active</Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="compose">
            <div className="space-y-4">
              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-2"><CardTitle className="text-xs">Policy Composer</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div><label className="text-[10px] font-medium text-muted-foreground uppercase">Name</label><Input placeholder="Policy name..." className="mt-1" /></div>
                  <div><label className="text-[10px] font-medium text-muted-foreground uppercase">Description</label><Textarea placeholder="What does this policy do?" className="mt-1" rows={2} /></div>
                  <div><label className="text-[10px] font-medium text-muted-foreground uppercase">Rule (pseudo-code)</label><Textarea placeholder="IF condition THEN action" className="mt-1 font-mono text-xs" rows={4} /></div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm"><Save className="w-3 h-3 mr-1" />Save Draft</Button>
                    <Button size="sm"><Play className="w-3 h-3 mr-1" />Simulate</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
