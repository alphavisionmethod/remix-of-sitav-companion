import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Globe, Sparkles, CheckCircle, Search, Zap, Shield, Play, ArrowRight, AlertTriangle, RefreshCw, Workflow, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DEMO_USE_CASES } from "@/data/seed/admin-platform";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { useDataMode } from "@/contexts/DataModeContext";

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

const connectorStatusColor: Record<string, string> = { connected: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", available: "bg-blue-500/10 text-blue-500 border-blue-500/20", required: "bg-amber-500/10 text-amber-500 border-amber-500/20" };

const DEMO_RECOMMENDATIONS = [
  { id: "rec1", useCase: "Lead Recovery", connector: "HubSpot CRM", reason: "90% of lead recovery use cases require CRM integration for contact enrichment", confidence: 0.94, priority: "high" },
  { id: "rec2", useCase: "Incident Alerting", connector: "Slack", reason: "Real-time alerting requires messaging integration for team notification", confidence: 0.97, priority: "high" },
  { id: "rec3", useCase: "Invoice Automation", connector: "Xero", reason: "Accounting integration enables automated invoice generation and reconciliation", confidence: 0.88, priority: "medium" },
  { id: "rec4", useCase: "Calendar Sync", connector: "Google Calendar", reason: "Booking and scheduling features depend on calendar provider integration", confidence: 0.92, priority: "high" },
  { id: "rec5", useCase: "Email Campaigns", connector: "SendGrid", reason: "Transactional and campaign emails require email delivery provider", confidence: 0.85, priority: "medium" },
];

const DEMO_WORKFLOWS = [
  { id: "wf1", name: "Lead → CRM → Nurture Sequence", steps: ["Capture lead signal", "Enrich via CRM", "Create nurture workflow", "Schedule follow-up"], status: "ready", connectorDeps: ["HubSpot", "SendGrid"] },
  { id: "wf2", name: "Incident → Alert → Runbook", steps: ["Detect anomaly", "Classify severity", "Route to Slack", "Launch runbook"], status: "ready", connectorDeps: ["Slack", "PagerDuty"] },
  { id: "wf3", name: "Invoice → Accounting → Receipt", steps: ["Generate invoice", "Push to Xero", "Track payment", "Issue receipt"], status: "partial", connectorDeps: ["Xero", "Stripe"] },
];

const DEMO_SIMULATIONS = [
  { id: "sim1", useCase: "Lead Recovery with HubSpot", result: "success", latencyMs: 340, dataFlowValid: true, trustGatesPassed: 3, trustGatesTotal: 3 },
  { id: "sim2", useCase: "Incident Alerting with Slack", result: "success", latencyMs: 120, dataFlowValid: true, trustGatesPassed: 2, trustGatesTotal: 2 },
  { id: "sim3", useCase: "Invoice Automation with Xero", result: "partial", latencyMs: 890, dataFlowValid: false, trustGatesPassed: 2, trustGatesTotal: 3 },
];

const IntegrationConciergePage = () => {
  const { isDemoMode } = useDataMode();
  const [tab, setTab] = useState("discover");
  const [search, setSearch] = useState("");
  const filtered = DEMO_USE_CASES.filter(uc => uc.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
<div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" /> Integration Concierge
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Use-case-first connector setup — recommendations, workflow composition, simulation, and trust gating</p>
        </div>
        <Button variant="outline" size="sm"><RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh</Button>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-secondary/50 flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="discover" className="text-xs">Discover Use Cases</TabsTrigger>
          <TabsTrigger value="recommend" className="text-xs">Recommendations</TabsTrigger>
          <TabsTrigger value="workflows" className="text-xs">Workflow Composer</TabsTrigger>
          <TabsTrigger value="simulations" className="text-xs">Simulations</TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="mt-4 space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="What do you want to achieve? e.g., lead recovery, alerting..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>

          <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
            {filtered.map(uc => (
              <motion.div key={uc.id} variants={fadeUp}>
                <Card className="hover:bg-muted/30 transition-colors">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">{uc.title}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{uc.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-[9px] ${uc.riskLevel === "low" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"}`}>
                          Risk: {uc.riskLevel}
                        </Badge>
                        <Badge variant="outline" className="text-[9px]">{uc.readiness}% ready</Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Required Connectors</p>
                        <div className="flex flex-wrap gap-1.5">
                          {uc.connectors.map(c => (
                            <Badge key={c.name} variant="outline" className={`text-[9px] ${connectorStatusColor[c.status]}`}>
                              {c.status === "connected" && <CheckCircle className="h-2.5 w-2.5 mr-0.5" />}
                              {c.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Workflows</p>
                        <div className="space-y-1">
                          {uc.workflows.map(w => (
                            <div key={w} className="flex items-center gap-1.5 text-[10px] text-foreground">
                              <Zap className="h-2.5 w-2.5 text-muted-foreground" /> {w}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                      <Button size="sm" className="h-7 text-xs"><Play className="h-3 w-3 mr-1" /> Simulate</Button>
                      <Button variant="outline" size="sm" className="h-7 text-xs"><Globe className="h-3 w-3 mr-1" /> Connect Missing</Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </TabsContent>

        <TabsContent value="recommend" className="mt-4 space-y-3">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Connector Recommendations</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {(isDemoMode ? DEMO_RECOMMENDATIONS : [] as typeof DEMO_RECOMMENDATIONS).map(r => (
                <div key={r.id} className="p-3 rounded-lg border hover:bg-muted/20 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-foreground">{r.connector}</span>
                      <Badge variant="outline" className="text-[9px]">{r.useCase}</Badge>
                      <Badge variant="outline" className={`text-[9px] ${r.priority === "high" ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"}`}>{r.priority}</Badge>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{(r.confidence * 100).toFixed(0)}% confidence</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{r.reason}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflows" className="mt-4 space-y-3">
          {(isDemoMode ? DEMO_WORKFLOWS : [] as typeof DEMO_WORKFLOWS).map(wf => (
            <Card key={wf.id} className="hover:bg-muted/20 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Workflow className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold text-foreground">{wf.name}</span>
                  </div>
                  <Badge variant="outline" className={`text-[9px] ${wf.status === "ready" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"}`}>{wf.status}</Badge>
                </div>
                <div className="flex items-center gap-1 mb-2">
                  {wf.steps.map((step, i) => (
                    <span key={i} className="flex items-center gap-1 text-[10px]">
                      {i > 0 && <ArrowRight className="h-2.5 w-2.5 text-muted-foreground" />}
                      <Badge variant="outline" className="text-[9px]">{step}</Badge>
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span>Dependencies:</span>
                  {wf.connectorDeps.map(d => <Badge key={d} variant="outline" className="text-[9px]">{d}</Badge>)}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="simulations" className="mt-4 space-y-3">
          {(isDemoMode ? DEMO_SIMULATIONS : [] as typeof DEMO_SIMULATIONS).map(sim => (
            <Card key={sim.id} className={`hover:bg-muted/20 transition-colors ${sim.result !== "success" ? "border-amber-500/20" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-foreground">{sim.useCase}</span>
                  <Badge variant="outline" className={`text-[9px] ${sim.result === "success" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"}`}>
                    {sim.result}
                  </Badge>
                </div>
                <div className="grid grid-cols-4 gap-3 text-[10px]">
                  <div><span className="text-muted-foreground">Latency:</span> <span className="text-foreground">{sim.latencyMs}ms</span></div>
                  <div><span className="text-muted-foreground">Data Flow:</span> <span className={sim.dataFlowValid ? "text-emerald-500" : "text-amber-500"}>{sim.dataFlowValid ? "Valid" : "Invalid"}</span></div>
                  <div><span className="text-muted-foreground">Trust Gates:</span> <span className="text-foreground">{sim.trustGatesPassed}/{sim.trustGatesTotal}</span></div>
                  <div>
                    {sim.trustGatesPassed === sim.trustGatesTotal
                      ? <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20"><Shield className="h-2.5 w-2.5 mr-0.5" /> All gates passed</Badge>
                      : <Badge variant="outline" className="text-[9px] bg-amber-500/10 text-amber-500 border-amber-500/20"><AlertTriangle className="h-2.5 w-2.5 mr-0.5" /> Gate failure</Badge>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntegrationConciergePage;
