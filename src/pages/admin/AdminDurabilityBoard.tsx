import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Database, CheckCircle, AlertTriangle, XCircle, Clock, Shield, RefreshCw, ArrowRight, Eye, Undo2 } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

type DurabilityStatus = "persisted" | "pending" | "failed" | "noncanonical";

const statusConfig: Record<DurabilityStatus, { color: string; icon: typeof CheckCircle; label: string }> = {
  persisted: { color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", icon: CheckCircle, label: "Persisted" },
  pending: { color: "bg-amber-500/10 text-amber-500 border-amber-500/20", icon: Clock, label: "Pending" },
  failed: { color: "bg-red-500/10 text-red-500 border-red-500/20", icon: XCircle, label: "Failed" },
  noncanonical: { color: "bg-orange-500/10 text-orange-500 border-orange-500/20", icon: AlertTriangle, label: "Non-canonical" },
};

interface MutationRecord {
  id: string;
  actor: string;
  surface: string;
  mutationType: string;
  targetType: string;
  targetId: string;
  submittedAt: string;
  durabilityStatus: DurabilityStatus;
  canonicalWritePath: boolean;
  lineageComplete: boolean;
  rollbackEligible: boolean;
  proofRef?: string;
}

const MOCK_MUTATIONS: MutationRecord[] = [
  { id: "mut-001", actor: "admin@sita.os", surface: "PolicySimulator", mutationType: "policy.create", targetType: "policy", targetId: "pol-42", submittedAt: "2026-04-05T10:23:00Z", durabilityStatus: "persisted", canonicalWritePath: true, lineageComplete: true, rollbackEligible: true, proofRef: "prf-901" },
  { id: "mut-002", actor: "system", surface: "ConnectorGateway", mutationType: "connector.refresh", targetType: "connector", targetId: "conn-7", submittedAt: "2026-04-05T10:21:00Z", durabilityStatus: "persisted", canonicalWritePath: true, lineageComplete: true, rollbackEligible: false },
  { id: "mut-003", actor: "admin@sita.os", surface: "UserManagement", mutationType: "user.role.update", targetType: "user_role", targetId: "ur-18", submittedAt: "2026-04-05T10:18:00Z", durabilityStatus: "pending", canonicalWritePath: true, lineageComplete: false, rollbackEligible: true },
  { id: "mut-004", actor: "workflow-engine", surface: "WorkflowReplay", mutationType: "workflow.retry", targetType: "workflow_run", targetId: "wf-55", submittedAt: "2026-04-05T10:15:00Z", durabilityStatus: "failed", canonicalWritePath: false, lineageComplete: false, rollbackEligible: false },
  { id: "mut-005", actor: "admin@sita.os", surface: "ApprovalQueue", mutationType: "approval.override", targetType: "approval", targetId: "apv-33", submittedAt: "2026-04-05T10:10:00Z", durabilityStatus: "noncanonical", canonicalWritePath: false, lineageComplete: false, rollbackEligible: true },
];

const AdminDurabilityBoard = () => {
  const [tab, setTab] = useState("all");

  const filtered = tab === "all" ? MOCK_MUTATIONS : MOCK_MUTATIONS.filter(m => m.durabilityStatus === tab);
  const persistedPct = Math.round((MOCK_MUTATIONS.filter(m => m.durabilityStatus === "persisted").length / MOCK_MUTATIONS.length) * 100);
  const lineagePct = Math.round((MOCK_MUTATIONS.filter(m => m.lineageComplete).length / MOCK_MUTATIONS.length) * 100);
  const canonicalPct = Math.round((MOCK_MUTATIONS.filter(m => m.canonicalWritePath).length / MOCK_MUTATIONS.length) * 100);

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <DemoModeBadge />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Database className="h-6 w-6 text-primary" /> Admin Durability Board
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Mutation persistence truth · No operator should wonder if an action truly persisted</p>
        </div>
        <Button variant="outline" size="sm"><RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh</Button>
      </div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
        {/* Summary */}
        <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { label: "Persistence Rate", value: `${persistedPct}%`, target: 100, color: persistedPct === 100 ? "text-emerald-500" : "text-amber-500" },
            { label: "Lineage Completion", value: `${lineagePct}%`, target: 100, color: lineagePct === 100 ? "text-emerald-500" : "text-amber-500" },
            { label: "Canonical Write Rate", value: `${canonicalPct}%`, target: 100, color: canonicalPct === 100 ? "text-emerald-500" : "text-orange-500" },
          ].map((m) => (
            <Card key={m.label}>
              <CardContent className="p-4">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">{m.label}</p>
                <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
                <Progress value={parseInt(m.value)} className="mt-2 h-1.5" />
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Mutation List */}
        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Recent Mutations</CardTitle>
                <Tabs value={tab} onValueChange={setTab}>
                  <TabsList className="h-7">
                    <TabsTrigger value="all" className="text-[10px] px-2 h-6">All</TabsTrigger>
                    <TabsTrigger value="persisted" className="text-[10px] px-2 h-6">Persisted</TabsTrigger>
                    <TabsTrigger value="pending" className="text-[10px] px-2 h-6">Pending</TabsTrigger>
                    <TabsTrigger value="failed" className="text-[10px] px-2 h-6">Failed</TabsTrigger>
                    <TabsTrigger value="noncanonical" className="text-[10px] px-2 h-6">Non-canonical</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {filtered.map((mut) => {
                const cfg = statusConfig[mut.durabilityStatus];
                const StatusIcon = cfg.icon;
                return (
                  <div key={mut.id} className="p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <StatusIcon className={`h-4 w-4 ${cfg.color.split(" ")[1]}`} />
                        <span className="text-sm font-medium text-foreground">{mut.mutationType}</span>
                        <Badge variant="outline" className={`text-[9px] ${cfg.color}`}>{cfg.label}</Badge>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{new Date(mut.submittedAt).toLocaleTimeString()}</span>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                      <span>Actor: <span className="text-foreground">{mut.actor}</span></span>
                      <span>Surface: <span className="text-foreground">{mut.surface}</span></span>
                      <span>Target: <span className="text-foreground font-mono">{mut.targetId}</span></span>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      {mut.canonicalWritePath ? (
                        <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Canonical</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[9px] bg-orange-500/10 text-orange-500 border-orange-500/20">Non-canonical path</Badge>
                      )}
                      {mut.lineageComplete ? (
                        <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Lineage ✓</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[9px] bg-amber-500/10 text-amber-500 border-amber-500/20">Lineage incomplete</Badge>
                      )}
                      {mut.rollbackEligible && (
                        <Badge variant="outline" className="text-[9px] bg-blue-500/10 text-blue-500 border-blue-500/20"><Undo2 className="h-2.5 w-2.5 mr-0.5" /> Rollbackable</Badge>
                      )}
                      {mut.proofRef && (
                        <Badge variant="outline" className="text-[9px] bg-primary/10 text-primary border-primary/20"><Eye className="h-2.5 w-2.5 mr-0.5" /> {mut.proofRef}</Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AdminDurabilityBoard;
