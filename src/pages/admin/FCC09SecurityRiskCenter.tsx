// ═══════════════════════════════════════════════════════════════
// SITA OS — Security & Risk Center (FCC09)
// Unified security view: action classification, agent boundaries,
// risk scanning, privilege paths, governance enforcement
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { motion } from "framer-motion";
import { AdminPageHeader } from "@/platform/sita/components/sita/admin/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Shield, Lock, AlertTriangle, CheckCircle2, XCircle, Eye, Fingerprint,
  ShieldAlert, ShieldCheck, Key, Scan, Bug, FileWarning, Ban, ToggleLeft,
  ToggleRight, Activity, Terminal, Gauge, Users, Zap, ChevronRight
} from "lucide-react";

// ── Action Safety Classes ──
type SafetyClass = "read_only" | "recommendation" | "low_risk" | "medium_risk" | "high_risk" | "forbidden";

interface ActionClassification {
  id: string;
  actionKey: string;
  displayName: string;
  safetyClass: SafetyClass;
  requiresApproval: boolean;
  requiresAudit: boolean;
  rollbackCapable: boolean;
  domain: string;
}

const SAFETY_CLASSES: Record<SafetyClass, { label: string; color: string; icon: React.ElementType }> = {
  read_only: { label: "Read-Only", color: "text-muted-foreground", icon: Eye },
  recommendation: { label: "Recommendation", color: "text-primary", icon: Zap },
  low_risk: { label: "Low Risk", color: "text-trust-safe", icon: CheckCircle2 },
  medium_risk: { label: "Medium Risk", color: "text-sita-gold", icon: AlertTriangle },
  high_risk: { label: "High Risk", color: "text-destructive", icon: ShieldAlert },
  forbidden: { label: "Forbidden", color: "text-destructive", icon: Ban },
};

const ACTION_CLASSIFICATIONS: ActionClassification[] = [
  { id: "1", actionKey: "deploy.production", displayName: "Deploy to Production", safetyClass: "high_risk", requiresApproval: true, requiresAudit: true, rollbackCapable: true, domain: "deployment" },
  { id: "2", actionKey: "policy.trust.modify", displayName: "Modify Trust Policy", safetyClass: "high_risk", requiresApproval: true, requiresAudit: true, rollbackCapable: true, domain: "policy" },
  { id: "3", actionKey: "data.migration.destructive", displayName: "Destructive Data Migration", safetyClass: "forbidden", requiresApproval: true, requiresAudit: true, rollbackCapable: false, domain: "data" },
  { id: "4", actionKey: "deploy.staging", displayName: "Deploy to Staging", safetyClass: "low_risk", requiresApproval: false, requiresAudit: true, rollbackCapable: true, domain: "deployment" },
  { id: "5", actionKey: "config.feature_flag", displayName: "Toggle Feature Flag", safetyClass: "medium_risk", requiresApproval: false, requiresAudit: true, rollbackCapable: true, domain: "config" },
  { id: "6", actionKey: "auth.key_rotation", displayName: "Rotate Signing Keys", safetyClass: "high_risk", requiresApproval: true, requiresAudit: true, rollbackCapable: false, domain: "security" },
  { id: "7", actionKey: "user.suspend", displayName: "Suspend User Account", safetyClass: "medium_risk", requiresApproval: true, requiresAudit: true, rollbackCapable: true, domain: "users" },
  { id: "8", actionKey: "report.generate", displayName: "Generate Analytics Report", safetyClass: "read_only", requiresApproval: false, requiresAudit: false, rollbackCapable: false, domain: "analytics" },
  { id: "9", actionKey: "ai.model.swap", displayName: "Swap AI Model", safetyClass: "medium_risk", requiresApproval: true, requiresAudit: true, rollbackCapable: true, domain: "ai" },
  { id: "10", actionKey: "killswitch.global", displayName: "Global Kill Switch", safetyClass: "forbidden", requiresApproval: true, requiresAudit: true, rollbackCapable: true, domain: "emergency" },
];

// ── Agent Execution Boundaries ──
interface AgentBoundary {
  agentClass: string;
  label: string;
  allowed: string[];
  forbidden: string[];
  requiresReview: string[];
}

const AGENT_BOUNDARIES: AgentBoundary[] = [
  { agentClass: "dev", label: "Development Agent", allowed: ["Open branches", "Write code proposals", "Run tests", "Prepare PRs", "Generate migration drafts"], forbidden: ["Merge critical code without policy", "Change signing infrastructure", "Bypass security gates"], requiresReview: ["Schema changes", "Auth flow modifications", "API breaking changes"] },
  { agentClass: "ops", label: "Operations Agent", allowed: ["Deploy to staging", "Propose canaries", "Rollback within policy", "Scale infra", "Run safe playbooks"], forbidden: ["Override protected production policies", "Skip rollout gates", "Disable audit logging"], requiresReview: ["Production deployments", "Rollout acceleration", "Infrastructure scaling >2x"] },
  { agentClass: "security", label: "Security Agent", allowed: ["Quarantine risky rollout", "Block unsafe deploys", "Flag secrets leakage", "Require review"], forbidden: ["Grant super-admin access", "Disable MFA requirement", "Expose encryption keys"], requiresReview: ["Policy threshold changes", "Key rotations", "Trust classifier updates"] },
  { agentClass: "qa", label: "QA Agent", allowed: ["Generate test plans", "Run regression suites", "Compare metrics", "Simulate edge cases"], forbidden: ["Skip required test gates", "Approve own test results", "Modify production data"], requiresReview: ["Test environment teardown", "Flaky test suppression"] },
  { agentClass: "performance", label: "Performance Agent", allowed: ["Analyze slow paths", "Compare builds", "Identify regressions", "Tune budgets"], forbidden: ["Disable performance monitoring", "Lower quality thresholds without approval"], requiresReview: ["Runtime config changes", "Cache invalidation policies"] },
];

// ── Security Findings ──
interface SecurityFinding {
  id: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  category: string;
  status: "open" | "mitigated" | "accepted" | "resolved";
  discoveredAt: string;
  details: string;
}

const SECURITY_FINDINGS: SecurityFinding[] = [
  { id: "sf1", title: "Outdated dependency: lodash 4.17.20", severity: "medium", category: "dependency", status: "mitigated", discoveredAt: "2026-04-12", details: "Prototype pollution vulnerability. Patched to 4.17.21." },
  { id: "sf2", title: "Missing rate limiting on admin API", severity: "high", category: "api", status: "open", discoveredAt: "2026-04-14", details: "Admin endpoints lack rate limiting, vulnerable to brute force." },
  { id: "sf3", title: "Overly permissive CORS on storage", severity: "medium", category: "config", status: "resolved", discoveredAt: "2026-04-10", details: "Storage bucket allowed requests from any origin." },
  { id: "sf4", title: "JWT token expiry too long (24h)", severity: "low", category: "auth", status: "accepted", discoveredAt: "2026-04-08", details: "Consider reducing to 1h with refresh token rotation." },
  { id: "sf5", title: "No CSP header on admin pages", severity: "high", category: "headers", status: "open", discoveredAt: "2026-04-13", details: "Content Security Policy header missing, XSS risk." },
];

// ── Security Posture Score ──
const POSTURE_SCORE = {
  overall: 82,
  categories: [
    { name: "Authentication", score: 95, trend: 2 },
    { name: "Authorization", score: 88, trend: 0 },
    { name: "Data Protection", score: 85, trend: -1 },
    { name: "Network Security", score: 78, trend: 3 },
    { name: "Dependency Health", score: 72, trend: -2 },
    { name: "Audit Coverage", score: 90, trend: 1 },
  ],
};

export default function FCC09SecurityRiskCenter() {
  const [selectedBoundary, setSelectedBoundary] = useState<AgentBoundary | null>(AGENT_BOUNDARIES[0]);

  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader
        icon={Shield}
        title="Security & Risk Center"
        subtitle="Action classifications, agent boundaries, vulnerability findings, and security posture"
        accent="destructive"
      />

      {/* Security Posture Overview */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="md:col-span-1">
          <Card className="border-white/10 bg-white/[0.03] backdrop-blur-xl h-full flex items-center justify-center">
            <CardContent className="p-6 text-center">
              <div className="relative inline-flex items-center justify-center">
                <svg className="h-24 w-24 -rotate-90">
                  <circle cx="48" cy="48" r="40" fill="none" stroke="hsl(var(--muted)/0.2)" strokeWidth="6" />
                  <circle cx="48" cy="48" r="40" fill="none" stroke="hsl(var(--trust-safe))" strokeWidth="6"
                    strokeDasharray={`${POSTURE_SCORE.overall * 2.51} 251`} strokeLinecap="round" />
                </svg>
                <span className="absolute text-2xl font-bold font-display">{POSTURE_SCORE.overall}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Security Score</p>
            </CardContent>
          </Card>
        </motion.div>
        {POSTURE_SCORE.categories.map((cat, i) => (
          <motion.div key={cat.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Card className="border-white/10 bg-white/[0.02] h-full">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-muted-foreground">{cat.name}</span>
                  <span className={`text-[10px] ${cat.trend > 0 ? "text-trust-safe" : cat.trend < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                    {cat.trend > 0 ? "+" : ""}{cat.trend}%
                  </span>
                </div>
                <p className="text-xl font-bold font-display">{cat.score}</p>
                <Progress value={cat.score} className="h-1 mt-2" />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="classifications" className="space-y-4">
        <TabsList className="bg-white/[0.03] border border-white/10">
          <TabsTrigger value="classifications">Action Classifications</TabsTrigger>
          <TabsTrigger value="boundaries">Agent Boundaries</TabsTrigger>
          <TabsTrigger value="findings">Security Findings</TabsTrigger>
          <TabsTrigger value="hardRules">Hard Rules</TabsTrigger>
        </TabsList>

        {/* Action Safety Classifications */}
        <TabsContent value="classifications" className="space-y-3">
          <div className="grid grid-cols-6 gap-2 mb-4">
            {(Object.entries(SAFETY_CLASSES) as [SafetyClass, typeof SAFETY_CLASSES[SafetyClass]][]).map(([key, cfg]) => {
              const Icon = cfg.icon;
              const count = ACTION_CLASSIFICATIONS.filter(a => a.safetyClass === key).length;
              return (
                <Card key={key} className="border-white/10 bg-white/[0.02]">
                  <CardContent className="p-3 text-center">
                    <Icon className={`h-4 w-4 mx-auto mb-1 ${cfg.color}`} />
                    <p className="text-lg font-bold">{count}</p>
                    <p className="text-[9px] text-muted-foreground">{cfg.label}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <div className="space-y-2">
            {ACTION_CLASSIFICATIONS.map((action, i) => {
              const safety = SAFETY_CLASSES[action.safetyClass];
              const SafetyIcon = safety.icon;
              return (
                <motion.div key={action.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                  <Card className="border-white/10 bg-white/[0.02]">
                    <CardContent className="p-3 flex items-center gap-3">
                      <SafetyIcon className={`h-4 w-4 shrink-0 ${safety.color}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium">{action.displayName}</p>
                        <p className="text-[10px] font-mono text-muted-foreground">{action.actionKey}</p>
                      </div>
                      <Badge variant="outline" className="text-[9px]">{action.domain}</Badge>
                      {action.requiresApproval && <Badge variant="outline" className="text-[9px] gap-1"><Lock className="h-2.5 w-2.5" />Approval</Badge>}
                      {action.requiresAudit && <Badge variant="outline" className="text-[9px] gap-1"><Eye className="h-2.5 w-2.5" />Audit</Badge>}
                      {action.rollbackCapable ? (
                        <Badge variant="outline" className="text-[9px] text-trust-safe gap-1"><ToggleRight className="h-2.5 w-2.5" />Rollback</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[9px] text-destructive gap-1"><ToggleLeft className="h-2.5 w-2.5" />No Rollback</Badge>
                      )}
                      <Badge className={`text-[9px] ${safety.color}`}>{safety.label}</Badge>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        {/* Agent Execution Boundaries */}
        <TabsContent value="boundaries">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              {AGENT_BOUNDARIES.map((b) => (
                <Card
                  key={b.agentClass}
                  onClick={() => setSelectedBoundary(b)}
                  className={`cursor-pointer transition-all border ${selectedBoundary?.agentClass === b.agentClass ? "border-primary/40 bg-primary/5" : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]"}`}
                >
                  <CardContent className="p-3 flex items-center gap-3">
                    <Shield className="h-4 w-4 text-primary shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs font-medium">{b.label}</p>
                      <p className="text-[10px] text-muted-foreground">{b.allowed.length} allowed · {b.forbidden.length} forbidden</p>
                    </div>
                    <ChevronRight className="h-3 w-3 text-muted-foreground/40" />
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="lg:col-span-2">
              {selectedBoundary && (
                <motion.div key={selectedBoundary.agentClass} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}>
                  <Card className="border-white/10 bg-white/[0.02]">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        {selectedBoundary.label} — Execution Boundaries
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-xs font-medium text-trust-safe mb-2 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Allowed Actions</p>
                        <div className="space-y-1">
                          {selectedBoundary.allowed.map((a, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs py-1.5 px-2.5 rounded bg-trust-safe/5 border border-trust-safe/10">
                              <CheckCircle2 className="h-3 w-3 text-trust-safe shrink-0" />
                              {a}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-sita-gold mb-2 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Requires Review</p>
                        <div className="space-y-1">
                          {selectedBoundary.requiresReview.map((r, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs py-1.5 px-2.5 rounded bg-sita-gold/5 border border-sita-gold/10">
                              <AlertTriangle className="h-3 w-3 text-sita-gold shrink-0" />
                              {r}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-destructive mb-2 flex items-center gap-1"><Ban className="h-3 w-3" /> Forbidden</p>
                        <div className="space-y-1">
                          {selectedBoundary.forbidden.map((f, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs py-1.5 px-2.5 rounded bg-destructive/5 border border-destructive/10">
                              <XCircle className="h-3 w-3 text-destructive shrink-0" />
                              {f}
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Security Findings */}
        <TabsContent value="findings" className="space-y-3">
          <div className="grid grid-cols-4 gap-3 mb-4">
            {(["critical", "high", "medium", "low"] as const).map(sev => {
              const count = SECURITY_FINDINGS.filter(f => f.severity === sev).length;
              const openCount = SECURITY_FINDINGS.filter(f => f.severity === sev && f.status === "open").length;
              const colors = { critical: "text-destructive", high: "text-destructive", medium: "text-sita-gold", low: "text-muted-foreground" };
              return (
                <Card key={sev} className="border-white/10 bg-white/[0.02]">
                  <CardContent className="p-3 text-center">
                    <p className={`text-xl font-bold ${colors[sev]}`}>{count}</p>
                    <p className="text-[10px] text-muted-foreground capitalize">{sev}</p>
                    {openCount > 0 && <Badge variant="destructive" className="text-[9px] mt-1">{openCount} open</Badge>}
                  </CardContent>
                </Card>
              );
            })}
          </div>
          {SECURITY_FINDINGS.map((finding, i) => {
            const sevColors = { critical: "text-destructive", high: "text-destructive", medium: "text-sita-gold", low: "text-muted-foreground" };
            const statusColors = { open: "destructive" as const, mitigated: "outline" as const, accepted: "outline" as const, resolved: "outline" as const };
            return (
              <motion.div key={finding.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className="border-white/10 bg-white/[0.02]">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <ShieldAlert className={`h-4 w-4 mt-0.5 shrink-0 ${sevColors[finding.severity]}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{finding.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{finding.details}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={statusColors[finding.status]} className="text-[9px]">{finding.status}</Badge>
                          <Badge variant="outline" className="text-[9px]">{finding.category}</Badge>
                          <Badge variant="outline" className={`text-[9px] ${sevColors[finding.severity]}`}>{finding.severity}</Badge>
                          <span className="text-[10px] text-muted-foreground ml-auto">{finding.discoveredAt}</span>
                        </div>
                      </div>
                      {finding.status === "open" && (
                        <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1 shrink-0">
                          <Scan className="h-3 w-3" /> Investigate
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </TabsContent>

        {/* Hard Rules */}
        <TabsContent value="hardRules">
          <Card className="border-white/10 bg-white/[0.02]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Ban className="h-4 w-4 text-destructive" /> AI Safety Hard Rules — Never Bypass
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                "AI must never deploy untested code to production",
                "AI must never bypass security policy or RLS enforcement",
                "AI must never skip required approval workflows",
                "AI must never mutate production data destructively without process",
                "AI must never change auth or trust policy silently",
                "AI must never expose secrets, keys, or tokens",
                "AI must never disable audit logging or tracing",
                "AI must never issue super-admin actions without valid scope and justification",
                "AI must never merge critical code without policy review",
                "AI must never override protected production policies",
              ].map((rule, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                    <Ban className="h-4 w-4 text-destructive shrink-0" />
                    <span className="text-xs font-medium">{rule}</span>
                    <ShieldCheck className="h-4 w-4 text-trust-safe ml-auto shrink-0" />
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
