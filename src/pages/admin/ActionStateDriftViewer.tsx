import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Activity, CheckCircle, AlertTriangle, XCircle, Zap, RefreshCw, Clock, Search, GitBranch } from "lucide-react";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { useDataMode } from "@/contexts/DataModeContext";

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

type ActionState = "proposed" | "simulated" | "approved" | "executing" | "completed" | "degraded" | "failed" | "rolled_back" | "replayable" | "receipted";

interface ActionRecord {
  id: string;
  action: string;
  domain: string;
  actor: string;
  state: ActionState;
  canonical: boolean;
  stuckSince?: string;
  driftReason?: string;
  timestamp: string;
  expectedState?: ActionState;
}

const stateColor: Record<string, string> = {
  proposed: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  simulated: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  approved: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  executing: "bg-primary/10 text-primary border-primary/20",
  completed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  degraded: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  failed: "bg-red-500/10 text-red-500 border-red-500/20",
  rolled_back: "bg-muted text-muted-foreground border-border",
  replayable: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  receipted: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
};

const DEMO_ACTIONS: ActionRecord[] = [
  { id: "a1", action: "Invoice Payment Processing", domain: "Finance OS", actor: "system", state: "completed", canonical: true, timestamp: "2026-04-10T09:00:00Z" },
  { id: "a2", action: "Lead Recovery Autopilot", domain: "Business OS", actor: "autopilot", state: "executing", canonical: true, timestamp: "2026-04-10T09:15:00Z" },
  { id: "a3", action: "Connector Sync — Google Calendar", domain: "Connector Control", actor: "scheduler", state: "degraded", canonical: false, driftReason: "Sync stuck in retry loop, expected 'completed' but remains 'executing' for >15m", expectedState: "completed", timestamp: "2026-04-10T08:30:00Z" },
  { id: "a4", action: "Policy Update — Budget Threshold", domain: "Admin", actor: "operator@sita.os", state: "approved", canonical: true, timestamp: "2026-04-10T09:20:00Z" },
  { id: "a5", action: "Booking Confirmation Email", domain: "Concierge OS", actor: "concierge-agent", state: "failed", canonical: false, driftReason: "Email provider returned 500, action stuck without receipt", timestamp: "2026-04-10T08:45:00Z" },
  { id: "a6", action: "Device Trust Handoff", domain: "Device Layer", actor: "system", state: "executing", canonical: false, stuckSince: "2026-04-10T07:30:00Z", driftReason: "Handoff waiting for Apple Watch acknowledgment >2h", expectedState: "completed", timestamp: "2026-04-10T07:30:00Z" },
  { id: "a7", action: "Release Gate Approval — v2.14", domain: "Admin", actor: "founder@sita.os", state: "receipted", canonical: true, timestamp: "2026-04-10T09:25:00Z" },
  { id: "a8", action: "AI Model Routing Override", domain: "AI Gateway", actor: "operator@sita.os", state: "rolled_back", canonical: true, timestamp: "2026-04-10T08:00:00Z" },
];

const ActionStateDriftViewer = () => {
  const [tab, setTab] = useState("all");
  const nonCanonical = ([] as typeof DEMO_ACTIONS).filter(a => !a.canonical);
  const stuck = ([] as typeof DEMO_ACTIONS).filter(a => a.stuckSince);
  const drifted = ([] as typeof DEMO_ACTIONS).filter(a => a.driftReason);

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
<div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" /> Action-State Drift Viewer
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Cross-domain action lifecycle — noncanonical detection, stuck actions, state drift analysis</p>
        </div>
        <Button variant="outline" size="sm"><RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh</Button>
      </div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Actions", value: String(([] as typeof DEMO_ACTIONS).length), color: "text-foreground" },
          { label: "Canonical", value: String(([] as typeof DEMO_ACTIONS).filter(a => a.canonical).length), color: "text-emerald-500" },
          { label: "Noncanonical", value: String(nonCanonical.length), color: nonCanonical.length > 0 ? "text-amber-500" : "text-emerald-500" },
          { label: "Drifted/Stuck", value: String(drifted.length), color: drifted.length > 0 ? "text-destructive" : "text-emerald-500" },
        ].map(m => (
          <motion.div key={m.label} variants={fadeUp}>
            <Card className="hover:-translate-y-0.5 transition-transform">
              <CardContent className="p-3.5">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">{m.label}</p>
                <p className={`text-xl font-bold ${m.color}`}>{m.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-secondary/50 flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="all" className="text-xs">All Actions</TabsTrigger>
          <TabsTrigger value="drift" className="text-xs">State Drift</TabsTrigger>
          <TabsTrigger value="noncanonical" className="text-xs">Noncanonical</TabsTrigger>
          <TabsTrigger value="stuck" className="text-xs">Stuck Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4 space-y-2">
          {([] as typeof DEMO_ACTIONS).map(a => (
            <ActionRow key={a.id} action={a} />
          ))}
        </TabsContent>

        <TabsContent value="drift" className="mt-4 space-y-2">
          {drifted.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground text-sm">No action-state drift detected.</CardContent></Card>
          ) : drifted.map(a => <ActionRow key={a.id} action={a} showDrift />)}
        </TabsContent>

        <TabsContent value="noncanonical" className="mt-4 space-y-2">
          {nonCanonical.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground text-sm">All actions following canonical paths.</CardContent></Card>
          ) : nonCanonical.map(a => <ActionRow key={a.id} action={a} />)}
        </TabsContent>

        <TabsContent value="stuck" className="mt-4 space-y-2">
          {stuck.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground text-sm">No stuck actions.</CardContent></Card>
          ) : stuck.map(a => <ActionRow key={a.id} action={a} showStuck />)}
        </TabsContent>
      </Tabs>
    </div>
  );
};

function ActionRow({ action, showDrift, showStuck }: { action: ActionRecord; showDrift?: boolean; showStuck?: boolean }) {
  return (
    <Card className={`hover:bg-muted/20 transition-colors ${!action.canonical ? "border-amber-500/20" : ""}`}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            {action.canonical ? <CheckCircle className="h-3 w-3 text-emerald-500" /> : <AlertTriangle className="h-3 w-3 text-amber-500" />}
            <span className="text-xs font-medium text-foreground">{action.action}</span>
            <Badge variant="outline" className={`text-[9px] ${stateColor[action.state]}`}>{action.state}</Badge>
            {!action.canonical && <Badge variant="outline" className="text-[9px] bg-amber-500/10 text-amber-500 border-amber-500/20">noncanonical</Badge>}
          </div>
          <span className="text-[10px] text-muted-foreground">{action.domain}</span>
        </div>
        <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
          <span>Actor: {action.actor}</span>
          <span>{new Date(action.timestamp).toLocaleString()}</span>
          {action.expectedState && <span>Expected: <Badge variant="outline" className={`text-[9px] ${stateColor[action.expectedState]}`}>{action.expectedState}</Badge></span>}
        </div>
        {(showDrift || showStuck) && action.driftReason && (
          <p className="text-[10px] text-amber-500 mt-1.5 flex items-center gap-1">
            <AlertTriangle className="h-2.5 w-2.5" /> {action.driftReason}
          </p>
        )}
        {showStuck && action.stuckSince && (
          <p className="text-[10px] text-destructive mt-1 flex items-center gap-1">
            <Clock className="h-2.5 w-2.5" /> Stuck since: {new Date(action.stuckSince).toLocaleString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default ActionStateDriftViewer;
