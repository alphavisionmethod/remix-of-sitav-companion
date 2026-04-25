// ═══════════════════════════════════════════════════════════════
// SITA OS — Human Oversight & Escalation Layer (FCC10)
// Team roles, approval flows, dual-approval, intervention controls
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminPageHeader } from "@/platform/sita/components/sita/admin/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Users, UserCheck, Shield, AlertTriangle, CheckCircle2, XCircle, Clock,
  Eye, Lock, Fingerprint, ArrowRight, ChevronRight, RotateCcw, Timer,
  MessageSquare, Bell, Zap, Terminal, GitBranch, Brain, Target
} from "lucide-react";

// ── Team Roles ──
interface HumanRole {
  id: string;
  title: string;
  owner: string | null;
  responsibilities: string[];
  criticalCategories: string[];
  status: "filled" | "vacant" | "backup";
  avatarInitials: string;
}

const HUMAN_ROLES: HumanRole[] = [
  { id: "r1", title: "Senior Systems Engineer", owner: "Alex K.", responsibilities: ["Kernel-level changes", "System architecture review", "Critical performance tuning", "Infrastructure decisions"], criticalCategories: ["kernel", "infrastructure"], status: "filled", avatarInitials: "AK" },
  { id: "r2", title: "Platform/Backend Engineer", owner: "Sarah M.", responsibilities: ["Backend service changes", "Database migrations", "API contract changes", "Service mesh configuration"], criticalCategories: ["backend", "data"], status: "filled", avatarInitials: "SM" },
  { id: "r3", title: "DevOps/Infra Engineer", owner: "James L.", responsibilities: ["CI/CD pipeline management", "Infrastructure scaling", "Monitoring and alerting", "Deployment orchestration"], criticalCategories: ["deployment", "infra"], status: "filled", avatarInitials: "JL" },
  { id: "r4", title: "Security Engineer", owner: "Maria R.", responsibilities: ["Security review and auditing", "Vulnerability assessment", "Auth flow validation", "Compliance verification"], criticalCategories: ["security", "auth"], status: "filled", avatarInitials: "MR" },
  { id: "r5", title: "Release Manager", owner: null, responsibilities: ["Release coordination", "Rollout gate approval", "Rollback decisions", "Quality gate enforcement"], criticalCategories: ["release", "rollout"], status: "vacant", avatarInitials: "RM" },
  { id: "r6", title: "Support/Operations Lead", owner: "David C.", responsibilities: ["Incident command", "User escalation handling", "Support pattern analysis", "Operational runbook management"], criticalCategories: ["support", "incidents"], status: "filled", avatarInitials: "DC" },
];

// ── Approval Queue ──
interface ApprovalRequest {
  id: string;
  title: string;
  description: string;
  requestedBy: string;
  requestType: "ai_proposal" | "human_request" | "system_trigger";
  riskLevel: "low" | "medium" | "high" | "critical";
  category: string;
  requiresDual: boolean;
  approvals: { approver: string; decision: "approved" | "rejected" | "pending"; at: string | null }[];
  blastRadius: string;
  dryRunResult: string | null;
  createdAt: string;
  expiresAt: string;
}

const APPROVAL_QUEUE: ApprovalRequest[] = [
  {
    id: "ap1", title: "Deploy sync retry backoff to production", description: "AI-generated fix for sync retry storm. Reduces retry frequency from 2s to exponential backoff (2s → 4s → 8s → 16s → 32s cap).",
    requestedBy: "AI Ops Agent", requestType: "ai_proposal", riskLevel: "high", category: "deployment",
    requiresDual: true, approvals: [
      { approver: "James L.", decision: "approved", at: "2026-04-15T10:30:00Z" },
      { approver: "Sarah M.", decision: "pending", at: null },
    ],
    blastRadius: "All sync clients across all platforms", dryRunResult: "Staging test: 0 errors, 34% reduction in retry traffic",
    createdAt: "2026-04-15T09:00:00Z", expiresAt: "2026-04-16T09:00:00Z",
  },
  {
    id: "ap2", title: "Increase enterprise storage quota to 50GB", description: "Policy change to raise storage limit for enterprise tier customers from 25GB to 50GB.",
    requestedBy: "Product Agent", requestType: "ai_proposal", riskLevel: "medium", category: "policy",
    requiresDual: false, approvals: [{ approver: "Founder", decision: "pending", at: null }],
    blastRadius: "Enterprise tier accounts (~120 orgs)", dryRunResult: "Estimated monthly cost increase: $340",
    createdAt: "2026-04-15T08:00:00Z", expiresAt: "2026-04-17T08:00:00Z",
  },
  {
    id: "ap3", title: "Enable new trust scoring classifier v3", description: "Machine learning model update for trust scoring. Reduces false positive rate by 18% in staging tests.",
    requestedBy: "AI Security Agent", requestType: "ai_proposal", riskLevel: "critical", category: "trust",
    requiresDual: true, approvals: [
      { approver: "Maria R.", decision: "pending", at: null },
      { approver: "Founder", decision: "pending", at: null },
    ],
    blastRadius: "All authenticated users — trust decisions globally affected", dryRunResult: "Shadow mode results: 18% fewer false positives, 0.2% increase in false negatives",
    createdAt: "2026-04-14T16:00:00Z", expiresAt: "2026-04-15T16:00:00Z",
  },
];

// ── Human-Required Categories ──
const HUMAN_REQUIRED_CATEGORIES = [
  { category: "Kernel-level changes", reason: "Architecture impact too broad for automated review", assignee: "Senior Systems Engineer" },
  { category: "System security changes", reason: "Risk of credential exposure or auth bypass", assignee: "Security Engineer" },
  { category: "Trust/policy threshold changes", reason: "Affects all users' trust decisions", assignee: "Security Engineer + Founder" },
  { category: "Destructive data migrations", reason: "Irreversible data loss risk", assignee: "Platform Engineer" },
  { category: "Global kill-switch activations", reason: "Platform-wide service disruption", assignee: "Founder + DevOps" },
  { category: "Admin auth/RBAC changes", reason: "Privilege escalation risk", assignee: "Security Engineer" },
  { category: "Signing key rotations", reason: "Breaks all existing signed artifacts", assignee: "Security Engineer" },
  { category: "Legal/compliance-sensitive actions", reason: "Regulatory and legal liability", assignee: "Founder" },
  { category: "Major incident decisions", reason: "Requires judgment under pressure", assignee: "Incident Commander" },
  { category: "High-risk production rollouts", reason: "Blast radius exceeds automated safety threshold", assignee: "Release Manager + DevOps" },
];

// ── Escalation Paths ──
interface EscalationPath {
  trigger: string;
  from: string;
  to: string;
  sla: string;
  autoEscalateAfter: string;
}

const ESCALATION_PATHS: EscalationPath[] = [
  { trigger: "AI confidence < 60%", from: "AI Agent", to: "Assigned Human Reviewer", sla: "30 min", autoEscalateAfter: "2h" },
  { trigger: "Risk level: critical", from: "Any Agent", to: "Founder + Security Engineer", sla: "15 min", autoEscalateAfter: "1h" },
  { trigger: "Dual approval stalled", from: "Approval Queue", to: "Founder Override", sla: "4h", autoEscalateAfter: "8h" },
  { trigger: "Incident severity: P1", from: "Monitoring", to: "Incident Commander + On-call", sla: "5 min", autoEscalateAfter: "15 min" },
  { trigger: "Rollout failure rate > 1%", from: "Ops Agent", to: "Release Manager + DevOps", sla: "10 min", autoEscalateAfter: "30 min" },
  { trigger: "Security finding: critical", from: "Security Agent", to: "Security Engineer + Founder", sla: "1h", autoEscalateAfter: "4h" },
];

export default function FCC10HumanOversightEscalation() {
  const [selectedApproval, setSelectedApproval] = useState<ApprovalRequest | null>(null);

  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader
        icon={Users}
        title="Human Oversight & Escalation"
        subtitle="Team roles, approval flows, dual-approval controls, and escalation paths"
        accent="trust"
      />

      {/* Team Roster */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {HUMAN_ROLES.map((role, i) => (
          <motion.div key={role.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className={`border-white/10 h-full ${role.status === "vacant" ? "bg-destructive/5 border-destructive/20" : "bg-white/[0.02]"}`}>
              <CardContent className="p-4 text-center">
                <div className={`h-10 w-10 rounded-full mx-auto mb-2 flex items-center justify-center text-xs font-bold ${role.status === "vacant" ? "bg-destructive/20 text-destructive" : "bg-primary/20 text-primary"}`}>
                  {role.avatarInitials}
                </div>
                <p className="text-xs font-medium line-clamp-1">{role.title}</p>
                <p className="text-[10px] text-muted-foreground">{role.owner || "Vacant"}</p>
                <Badge variant={role.status === "vacant" ? "destructive" : "outline"} className="text-[9px] mt-2">{role.status}</Badge>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="approvals" className="space-y-4">
        <TabsList className="bg-white/[0.03] border border-white/10">
          <TabsTrigger value="approvals">Approval Queue</TabsTrigger>
          <TabsTrigger value="required">Human-Required Categories</TabsTrigger>
          <TabsTrigger value="escalation">Escalation Paths</TabsTrigger>
          <TabsTrigger value="interactions">Interaction Modes</TabsTrigger>
        </TabsList>

        {/* Approval Queue */}
        <TabsContent value="approvals">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-3">
              {APPROVAL_QUEUE.map((req, i) => {
                const riskColors = { low: "text-muted-foreground", medium: "text-sita-gold", high: "text-destructive", critical: "text-destructive" };
                const pendingCount = req.approvals.filter(a => a.decision === "pending").length;
                const approvedCount = req.approvals.filter(a => a.decision === "approved").length;
                const isSelected = selectedApproval?.id === req.id;
                return (
                  <motion.div key={req.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card
                      onClick={() => setSelectedApproval(req)}
                      className={`cursor-pointer transition-all border ${isSelected ? "border-primary/40 bg-primary/5" : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]"}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Lock className={`h-4 w-4 mt-0.5 shrink-0 ${riskColors[req.riskLevel]}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium line-clamp-1">{req.title}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant={req.riskLevel === "critical" || req.riskLevel === "high" ? "destructive" : "outline"} className="text-[9px]">{req.riskLevel}</Badge>
                              {req.requiresDual && <Badge variant="outline" className="text-[9px] gap-1"><Users className="h-2.5 w-2.5" />Dual</Badge>}
                              <span className="text-[10px] text-muted-foreground">{approvedCount}/{req.approvals.length} approved</span>
                            </div>
                          </div>
                          <ChevronRight className="h-3 w-3 text-muted-foreground/40 mt-1" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              {selectedApproval ? (
                <motion.div key={selectedApproval.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                  <Card className="border-white/10 bg-white/[0.02]">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">{selectedApproval.title}</CardTitle>
                      <p className="text-xs text-muted-foreground">{selectedApproval.description}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                          <p className="text-[10px] text-muted-foreground">Requested By</p>
                          <p className="text-xs font-medium">{selectedApproval.requestedBy}</p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                          <p className="text-[10px] text-muted-foreground">Blast Radius</p>
                          <p className="text-xs font-medium">{selectedApproval.blastRadius}</p>
                        </div>
                      </div>

                      {selectedApproval.dryRunResult && (
                        <div className="p-3 rounded-lg bg-trust-safe/5 border border-trust-safe/10">
                          <p className="text-[10px] font-medium text-trust-safe mb-1">Dry-Run Result</p>
                          <p className="text-xs">{selectedApproval.dryRunResult}</p>
                        </div>
                      )}

                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">Approval Chain</p>
                        <div className="space-y-2">
                          {selectedApproval.approvals.map((a, i) => (
                            <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                              {a.decision === "approved" ? (
                                <CheckCircle2 className="h-4 w-4 text-trust-safe" />
                              ) : a.decision === "rejected" ? (
                                <XCircle className="h-4 w-4 text-destructive" />
                              ) : (
                                <Clock className="h-4 w-4 text-sita-gold" />
                              )}
                              <span className="text-xs flex-1">{a.approver}</span>
                              <Badge variant={a.decision === "approved" ? "outline" : a.decision === "rejected" ? "destructive" : "outline"} className="text-[9px]">{a.decision}</Badge>
                              {a.at && <span className="text-[10px] text-muted-foreground">{new Date(a.at).toLocaleTimeString()}</span>}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-white/5">
                        <Button size="sm" className="flex-1 gap-1.5 bg-trust-safe/20 text-trust-safe hover:bg-trust-safe/30">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 gap-1.5 text-destructive">
                          <XCircle className="h-3.5 w-3.5" /> Reject
                        </Button>
                        <Button size="sm" variant="outline" className="gap-1.5">
                          <MessageSquare className="h-3.5 w-3.5" /> Comment
                        </Button>
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <Timer className="h-3 w-3" />
                        Expires: {new Date(selectedApproval.expiresAt).toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <Card className="border-white/10 bg-white/[0.02]">
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <Lock className="h-8 w-8 mx-auto mb-3 opacity-40" />
                    <p className="text-sm">Select an approval request to review</p>
                  </CardContent>
                </Card>
              )}
            </AnimatePresence>
          </div>
        </TabsContent>

        {/* Human-Required Categories */}
        <TabsContent value="required" className="space-y-2">
          {HUMAN_REQUIRED_CATEGORIES.map((cat, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="border-white/10 bg-white/[0.02]">
                <CardContent className="p-3 flex items-center gap-3">
                  <Shield className="h-4 w-4 text-sita-gold shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">{cat.category}</p>
                    <p className="text-[10px] text-muted-foreground">{cat.reason}</p>
                  </div>
                  <Badge variant="outline" className="text-[9px] shrink-0">{cat.assignee}</Badge>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        {/* Escalation Paths */}
        <TabsContent value="escalation" className="space-y-3">
          {ESCALATION_PATHS.map((path, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="border-white/10 bg-white/[0.02]">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <AlertTriangle className="h-4 w-4 text-sita-gold shrink-0" />
                    <p className="text-xs font-medium flex-1">{path.trigger}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-7">
                    <Badge variant="outline" className="text-[9px]">{path.from}</Badge>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <Badge variant="outline" className="text-[9px] border-primary/30 text-primary">{path.to}</Badge>
                    <div className="ml-auto flex items-center gap-3">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="h-2.5 w-2.5" /> SLA: {path.sla}</span>
                      <span className="text-[10px] text-sita-gold flex items-center gap-1"><Bell className="h-2.5 w-2.5" /> Auto-escalate: {path.autoEscalateAfter}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        {/* Interaction Modes */}
        <TabsContent value="interactions">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { mode: "Approve / Reject Plan", description: "Review AI-generated execution plans and approve or reject with comments. Supports conditional approvals.", icon: CheckCircle2, color: "text-trust-safe" },
              { mode: "Request Changes", description: "Send back proposals with specific modification requests. AI will revise and resubmit for review.", icon: MessageSquare, color: "text-primary" },
              { mode: "Edit Execution Constraints", description: "Modify blast radius limits, rollout percentages, timing windows, or safety thresholds on approved plans.", icon: Target, color: "text-sita-gold" },
              { mode: "Intervene During Incident", description: "Take manual control during active incidents. Override AI recommendations when human judgment is critical.", icon: AlertTriangle, color: "text-destructive" },
              { mode: "Handoff AI ↔ Human", description: "Transfer ownership of a task between AI agent and human reviewer. Preserves full context and audit trail.", icon: RotateCcw, color: "text-primary" },
              { mode: "Emergency Override", description: "Bypass normal approval flow in emergency situations. Requires extra logging, post-incident review, and justification.", icon: Zap, color: "text-destructive" },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="border-white/10 bg-white/[0.02] h-full">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${item.color}`} />
                        <div>
                          <p className="text-sm font-medium">{item.mode}</p>
                          <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
