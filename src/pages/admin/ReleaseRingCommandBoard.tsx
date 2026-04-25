import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import {
  Rocket, Target, AlertTriangle, CheckCircle, Clock, Shield, GitBranch,
  RotateCcw, Users, MessageSquare, ArrowRight, XCircle, RefreshCw
} from "lucide-react";

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

type RingStatus = "ready" | "blocked" | "in_progress" | "promoted";
const ringStatusConfig: Record<RingStatus, { color: string; label: string }> = {
  ready: { color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", label: "Ready" },
  blocked: { color: "text-red-500 bg-red-500/10 border-red-500/20", label: "Blocked" },
  in_progress: { color: "text-blue-500 bg-blue-500/10 border-blue-500/20", label: "In Progress" },
  promoted: { color: "text-primary bg-primary/10 border-primary/20", label: "Promoted" },
};

interface RingData {
  ring: number;
  name: string;
  status: RingStatus;
  readinessScore: number;
  release: string;
  blockerCount: number;
  evidenceComplete: number;
  evidenceRequired: number;
  feedbackGate: { received: number; required: number; sentiment: number };
  incidentImpact: number;
  rollbackReady: boolean;
}

const RINGS: RingData[] = [
  { ring: 0, name: "Pilot (Internal)", status: "promoted", readinessScore: 98, release: "v2.14.0-rc3", blockerCount: 0, evidenceComplete: 12, evidenceRequired: 12, feedbackGate: { received: 8, required: 5, sentiment: 0.92 }, incidentImpact: 0, rollbackReady: true },
  { ring: 1, name: "Beta (Early Access)", status: "in_progress", readinessScore: 74, release: "v2.14.0-rc3", blockerCount: 2, evidenceComplete: 9, evidenceRequired: 14, feedbackGate: { received: 3, required: 10, sentiment: 0.81 }, incidentImpact: 1, rollbackReady: true },
  { ring: 2, name: "GA (Production)", status: "blocked", readinessScore: 45, release: "v2.14.0-rc3", blockerCount: 5, evidenceComplete: 6, evidenceRequired: 18, feedbackGate: { received: 0, required: 25, sentiment: 0 }, incidentImpact: 0, rollbackReady: false },
];

const BLOCKERS = [
  { id: "blk-1", title: "Smoke test failure: concierge-travel endpoint 502", severity: "critical" as const, ring: 1, owner: "backend-team", domain: "concierge", missingEvidence: ["smoke-pass-concierge-travel"], createdAt: "2026-04-09" },
  { id: "blk-2", title: "Load test incomplete: approval-service p99 >200ms", severity: "high" as const, ring: 1, owner: "platform-team", domain: "approvals", missingEvidence: ["load-pass-approval-service"], createdAt: "2026-04-09" },
  { id: "blk-3", title: "HA verification missing for brain-core", severity: "critical" as const, ring: 2, owner: "infra-team", domain: "brain-core", missingEvidence: ["ha-verification-brain-core", "dr-verification-brain-core"], createdAt: "2026-04-08" },
  { id: "blk-4", title: "Secret rotation overdue — connector-service keys", severity: "high" as const, ring: 2, owner: "security-team", domain: "connectors", missingEvidence: ["secret-rotation-proof"], createdAt: "2026-04-07" },
  { id: "blk-5", title: "VMware image build not validated", severity: "medium" as const, ring: 2, owner: "infra-team", domain: "deployment", missingEvidence: ["vmware-image-validation"], createdAt: "2026-04-07" },
  { id: "blk-6", title: "Config integrity check failing in staging", severity: "high" as const, ring: 2, owner: "platform-team", domain: "deployment", missingEvidence: ["config-integrity-staging"], createdAt: "2026-04-08" },
  { id: "blk-7", title: "DR failover test not completed", severity: "critical" as const, ring: 2, owner: "infra-team", domain: "deployment", missingEvidence: ["dr-failover-proof"], createdAt: "2026-04-06" },
];

const EVIDENCE_CHECKLIST = [
  { id: "ev-1", name: "Smoke tests — all services", ring: 1, status: "pass" as const },
  { id: "ev-2", name: "Load test — approval-service", ring: 1, status: "fail" as const },
  { id: "ev-3", name: "Load test — brain-core", ring: 1, status: "pass" as const },
  { id: "ev-4", name: "Secret integrity verification", ring: 1, status: "pass" as const },
  { id: "ev-5", name: "Config integrity — staging", ring: 1, status: "fail" as const },
  { id: "ev-6", name: "HA verification — all critical services", ring: 2, status: "pending" as const },
  { id: "ev-7", name: "DR failover test", ring: 2, status: "pending" as const },
  { id: "ev-8", name: "VMware image validation", ring: 2, status: "pending" as const },
  { id: "ev-9", name: "User feedback gate (25 responses)", ring: 2, status: "pending" as const },
];

const sevColor = { critical: "text-red-500", high: "text-orange-500", medium: "text-amber-500" };
const evStatusIcon = { pass: CheckCircle, fail: XCircle, pending: Clock };
const evStatusColor = { pass: "text-emerald-500", fail: "text-red-500", pending: "text-muted-foreground" };

const ReleaseRingCommandBoard = () => {
  const [tab, setTab] = useState("overview");

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
<div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Rocket className="h-6 w-6 text-primary" /> Release Ring Command
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Ring 0 / 1 / 2 promotion with evidence, blockers, feedback gates, and rollback visibility</p>
        </div>
        <Button variant="outline" size="sm"><RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh</Button>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="overview"><Target className="h-3.5 w-3.5 mr-1" /> Overview</TabsTrigger>
          <TabsTrigger value="blockers"><AlertTriangle className="h-3.5 w-3.5 mr-1" /> Blockers ({BLOCKERS.length})</TabsTrigger>
          <TabsTrigger value="evidence"><CheckCircle className="h-3.5 w-3.5 mr-1" /> Evidence</TabsTrigger>
          <TabsTrigger value="feedback"><MessageSquare className="h-3.5 w-3.5 mr-1" /> Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {RINGS.map(r => {
              const sc = ringStatusConfig[r.status];
              return (
                <motion.div key={r.ring} variants={fadeUp}>
                  <Card className={r.status === "blocked" ? "border-red-500/30" : ""}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold">Ring {r.ring}: {r.name}</CardTitle>
                        <Badge variant="outline" className={`text-[9px] ${sc.color}`}>{sc.label}</Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground">{r.release}</p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="flex justify-between text-[10px] mb-1">
                          <span className="text-muted-foreground">Readiness</span>
                          <span className="text-foreground font-medium">{r.readinessScore}%</span>
                        </div>
                        <Progress value={r.readinessScore} className="h-2" />
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div className="p-2 rounded bg-muted/50">
                          <span className="text-muted-foreground">Blockers</span>
                          <p className={`font-bold ${r.blockerCount > 0 ? "text-red-500" : "text-emerald-500"}`}>{r.blockerCount}</p>
                        </div>
                        <div className="p-2 rounded bg-muted/50">
                          <span className="text-muted-foreground">Evidence</span>
                          <p className="font-bold text-foreground">{r.evidenceComplete}/{r.evidenceRequired}</p>
                        </div>
                        <div className="p-2 rounded bg-muted/50">
                          <span className="text-muted-foreground">Incidents</span>
                          <p className={`font-bold ${r.incidentImpact > 0 ? "text-amber-500" : "text-emerald-500"}`}>{r.incidentImpact}</p>
                        </div>
                        <div className="p-2 rounded bg-muted/50">
                          <span className="text-muted-foreground">Rollback</span>
                          <p className={`font-bold ${r.rollbackReady ? "text-emerald-500" : "text-red-500"}`}>{r.rollbackReady ? "Ready" : "Not Ready"}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {r.status === "in_progress" && <Button size="sm" className="text-xs h-7 flex-1">Promote → Ring {r.ring + 1}</Button>}
                        {r.status === "promoted" && <Badge variant="outline" className="text-[9px] text-emerald-500 bg-emerald-500/10 border-emerald-500/20 flex-1 justify-center">✓ Promoted</Badge>}
                        {r.status === "blocked" && <Badge variant="outline" className="text-[9px] text-red-500 bg-red-500/10 border-red-500/20 flex-1 justify-center">Resolve blockers first</Badge>}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </TabsContent>

        <TabsContent value="blockers" className="space-y-2 mt-4">
          {BLOCKERS.map(b => (
            <motion.div key={b.id} variants={fadeUp} initial="hidden" animate="show">
              <Card className={b.severity === "critical" ? "border-red-500/30" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1">
                      <AlertTriangle className={`h-4 w-4 ${sevColor[b.severity]} shrink-0`} />
                      <span className="text-sm font-medium text-foreground">{b.title}</span>
                    </div>
                    <Badge variant="outline" className={`text-[9px] ${sevColor[b.severity]}`}>{b.severity}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-3 text-[10px] text-muted-foreground mb-2">
                    <span>Ring: <span className="text-foreground font-medium">{b.ring}</span></span>
                    <span>Owner: <span className="text-foreground">{b.owner}</span></span>
                    <span>Domain: <span className="text-foreground">{b.domain}</span></span>
                    <span>Since: <span className="text-foreground">{b.createdAt}</span></span>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {b.missingEvidence.map(e => <Badge key={e} variant="outline" className="text-[9px] text-red-500 bg-red-500/5 border-red-500/20">Missing: {e}</Badge>)}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        <TabsContent value="evidence" className="mt-4">
          <div className="space-y-2">
            {[1, 2].map(ring => (
              <div key={ring}>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Ring {ring} Evidence</h3>
                <div className="space-y-1">
                  {EVIDENCE_CHECKLIST.filter(e => e.ring === ring).map(e => {
                    const Icon = evStatusIcon[e.status];
                    return (
                      <Card key={e.id}>
                        <CardContent className="p-3 flex items-center gap-3">
                          <Icon className={`h-4 w-4 ${evStatusColor[e.status]}`} />
                          <span className="text-xs text-foreground flex-1">{e.name}</span>
                          <Badge variant="outline" className={`text-[9px] ${evStatusColor[e.status]}`}>{e.status}</Badge>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="feedback" className="mt-4">
          <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {RINGS.map(r => (
              <motion.div key={r.ring} variants={fadeUp}>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Ring {r.ring} Feedback</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-muted-foreground">Responses</span>
                        <span className="text-foreground">{r.feedbackGate.received}/{r.feedbackGate.required}</span>
                      </div>
                      <Progress value={r.feedbackGate.required > 0 ? (r.feedbackGate.received / r.feedbackGate.required) * 100 : 0} className="h-1.5" />
                    </div>
                    {r.feedbackGate.sentiment > 0 && (
                      <div className="text-[10px]">
                        <span className="text-muted-foreground">Sentiment: </span>
                        <span className={`font-medium ${r.feedbackGate.sentiment > 0.8 ? "text-emerald-500" : r.feedbackGate.sentiment > 0.6 ? "text-amber-500" : "text-red-500"}`}>
                          {(r.feedbackGate.sentiment * 100).toFixed(0)}% positive
                        </span>
                      </div>
                    )}
                    {r.feedbackGate.received === 0 && <p className="text-[10px] text-muted-foreground">No feedback collected yet</p>}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReleaseRingCommandBoard;
