import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, AlertTriangle, CheckCircle, XCircle, Eye, Brain, Activity } from "lucide-react";
import { EVIDENCE_GRADE_POLICIES } from "@/lib/core-services/epistemic-firewall/evidence-grader";
import { GROUNDING_RULES } from "@/lib/core-services/epistemic-firewall/tool-grounding";
import { getInvariants } from "@/lib/core-services/epistemic-firewall/sentinel-engine";
import { CORTEX_LOOP_CONFIGS } from "@/lib/core-services/epistemic-firewall/cortex-loop";
import { useDataMode } from "@/contexts/DataModeContext";

function EpistemicFirewallBoard() {
  const [activeTab, setActiveTab] = useState("overview");
  const invariants = getInvariants();
  const grades = Object.values(EVIDENCE_GRADE_POLICIES);

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="epistemic-firewall-board">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Epistemic Firewall</h1>
          <p className="text-sm text-muted-foreground">Truth Triangle · Sentinel Engine · Cortex Loop · Tool Grounding</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="evidence">Evidence Grades</TabsTrigger>
          <TabsTrigger value="grounding">Tool Grounding</TabsTrigger>
          <TabsTrigger value="sentinel">Sentinel Guard</TabsTrigger>
          <TabsTrigger value="cortex">Cortex Loops</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4" data-testid="ef-overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Evidence Grades</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">{grades.length}</div><p className="text-xs text-muted-foreground">A through F hierarchy</p></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Grounding Rules</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">{GROUNDING_RULES.length}</div><p className="text-xs text-muted-foreground">Canonical tool rules</p></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Invariants</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">{invariants.length}</div><p className="text-xs text-muted-foreground">Runtime checks active</p></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Cortex Loops</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">{CORTEX_LOOP_CONFIGS.length}</div><p className="text-xs text-muted-foreground">Scoped loop configs</p></CardContent></Card>
          </div>
          <Card><CardHeader><CardTitle className="text-base flex items-center gap-2"><Eye className="h-4 w-4" />Modules Active</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {["Evidence Grader (Truth Triangle Gate 1)", "Cite-Checker (Truth Triangle Gate 2)", "Assumption Registry (Truth Triangle Gate 3)", "Negative Receipts", "Tool Grounding", "Sentinel Guard / Invariant Engine", "Cortex Loop Runtime", "Verified Outcome Learning"].map((m) => (
                <div key={m} className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /><span className="text-sm">{m}</span><Badge variant="outline" className="ml-auto">Active</Badge></div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evidence" className="space-y-4" data-testid="ef-evidence">
          <Card><CardHeader><CardTitle className="text-base">Evidence Grade Hierarchy</CardTitle></CardHeader>
            <CardContent><div className="space-y-3">
              {grades.map((g) => (
                <div key={g.grade} className="flex items-start gap-3 p-3 rounded-lg border">
                  <Badge variant={g.allowedForHighStakes ? "default" : "secondary"} className="text-lg px-3">{g.grade}</Badge>
                  <div className="flex-1"><div className="font-medium">{g.label}</div><p className="text-sm text-muted-foreground">{g.description}</p>
                    <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                      <span>Max age: {g.maxAgeSec}s</span><span>Trust: {g.trustFactor}</span>
                      <span>{g.allowedForHighStakes ? <CheckCircle className="inline h-3 w-3 text-green-500" /> : <XCircle className="inline h-3 w-3 text-red-500" />} High-stakes</span>
                    </div>
                  </div>
                </div>
              ))}
            </div></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grounding" className="space-y-4" data-testid="ef-grounding">
          <Card><CardHeader><CardTitle className="text-base">Canonical Tool Grounding Rules</CardTitle></CardHeader>
            <CardContent><div className="space-y-3">
              {GROUNDING_RULES.map((r, i) => (
                <div key={i} className="p-3 rounded-lg border space-y-1">
                  <div className="flex items-center gap-2"><Badge variant={r.blockIfUngrounded ? "destructive" : "secondary"}>{r.blockIfUngrounded ? "Block" : "Warn"}</Badge><span className="font-medium text-sm">{r.fieldType}</span></div>
                  <p className="text-sm text-muted-foreground">{r.description}</p>
                  <p className="text-xs text-muted-foreground">Required: {r.requiredSource} · Domains: {r.domains.join(", ")}</p>
                </div>
              ))}
            </div></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sentinel" className="space-y-4" data-testid="ef-sentinel">
          <Card><CardHeader><CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4" />Runtime Invariants ({invariants.length})</CardTitle></CardHeader>
            <CardContent><div className="space-y-3">
              {invariants.map((inv) => (
                <div key={inv.id} className="p-3 rounded-lg border">
                  <div className="flex items-center gap-2"><Badge variant={inv.severity === "critical" ? "destructive" : inv.severity === "block" ? "default" : "secondary"}>{inv.severity}</Badge><span className="font-mono text-xs">{inv.id}</span><span className="font-medium text-sm">{inv.name}</span></div>
                  <p className="text-sm text-muted-foreground mt-1">{inv.description}</p>
                  <p className="text-xs text-muted-foreground">Scope: {inv.scope} · Domains: {inv.domains.join(", ")}</p>
                </div>
              ))}
            </div></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cortex" className="space-y-4" data-testid="ef-cortex">
          <Card><CardHeader><CardTitle className="text-base flex items-center gap-2"><Brain className="h-4 w-4" />Cortex Loop Configurations</CardTitle></CardHeader>
            <CardContent><div className="space-y-3">
              {CORTEX_LOOP_CONFIGS.map((c) => (
                <div key={c.loopId} className="p-3 rounded-lg border">
                  <div className="flex items-center gap-2"><Activity className="h-4 w-4" /><span className="font-medium text-sm">{c.loopId}</span><Badge variant={c.enabled ? "default" : "secondary"}>{c.enabled ? "Enabled" : "Disabled"}</Badge></div>
                  <p className="text-sm text-muted-foreground mt-1">{c.description}</p>
                  <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                    <span>Domain: {c.domain}</span><span>Max iter: {c.maxIterations}</span>
                    <span>{c.requiresApproval ? "✓ Approval" : "○ No approval"}</span>
                    <span>{c.requiresProof ? "✓ Proof" : "○ No proof"}</span>
                    <span>{c.learnFromOutcomes ? "✓ Learning" : "○ No learning"}</span>
                  </div>
                </div>
              ))}
            </div></CardContent>
          </Card>
          <Card><CardHeader><CardTitle className="text-base">Cortex Loop Stages</CardTitle></CardHeader>
            <CardContent><div className="flex flex-wrap gap-2">
              {["Sense", "State Update", "Plan", "Approve", "Execute", "Prove", "Learn"].map((s, i) => (
                <div key={s} className="flex items-center gap-1"><Badge variant="outline">{i + 1}. {s}</Badge>{i < 6 && <span className="text-muted-foreground">→</span>}</div>
              ))}
            </div></CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default EpistemicFirewallBoard;
