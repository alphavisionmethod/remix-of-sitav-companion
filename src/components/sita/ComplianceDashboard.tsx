// ═══════════════════════════════════════════════════════════════
// SITA OS — Compliance & ISO Readiness Dashboard
// ISO 27001, SOC 2, NIST 800-53 controls tracking
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
import { useDataMode } from "@/contexts/DataModeContext";
  Shield, CheckCircle, AlertTriangle, XCircle, Clock, FileText,
  Lock, Eye, Activity, Database, Users, Server, Key,
  BarChart3, Target, Gauge, ChevronRight, Radio,
} from "lucide-react";

// ── Types ───────────────────────────────────────────────────────

interface ComplianceControl {
  id: string;
  framework: "ISO 27001" | "SOC 2" | "NIST 800-53";
  controlId: string;
  title: string;
  description: string;
  status: "compliant" | "partial" | "non-compliant" | "not-applicable";
  evidence: string[];
  lastAuditedAt: number;
  owner: string;
  category: string;
}

interface SLAMetric {
  name: string;
  target: number;
  actual: number;
  unit: string;
  status: "met" | "at-risk" | "breached";
  trend: "improving" | "stable" | "declining";
}

interface RiskItem {
  id: string;
  title: string;
  likelihood: 1 | 2 | 3 | 4 | 5;
  impact: 1 | 2 | 3 | 4 | 5;
  category: string;
  mitigations: string[];
  owner: string;
  status: "open" | "mitigated" | "accepted";
}

// ── Demo Data ───────────────────────────────────────────────────

const DEMO_CONTROLS: ComplianceControl[] = [
  { id: "c-1", framework: "ISO 27001", controlId: "A.5.1", title: "Information Security Policies", description: "Management direction for information security", status: "compliant", evidence: ["Policy document v3.2", "Board approval minutes"], lastAuditedAt: Date.now() - 86400000 * 7, owner: "CISO", category: "Governance" },
  { id: "c-2", framework: "ISO 27001", controlId: "A.6.1", title: "Organization of Information Security", description: "Internal organization security roles and responsibilities", status: "compliant", evidence: ["RACI matrix", "Role definitions"], lastAuditedAt: Date.now() - 86400000 * 14, owner: "CISO", category: "Governance" },
  { id: "c-3", framework: "ISO 27001", controlId: "A.8.1", title: "Asset Management", description: "Responsibility for assets and classification", status: "compliant", evidence: ["Asset inventory", "Classification schema"], lastAuditedAt: Date.now() - 86400000 * 5, owner: "IT Ops", category: "Asset Management" },
  { id: "c-4", framework: "ISO 27001", controlId: "A.9.1", title: "Access Control", description: "Business requirements and user access management", status: "compliant", evidence: ["RBAC policy", "Access reviews Q1"], lastAuditedAt: Date.now() - 86400000 * 3, owner: "Security", category: "Access Control" },
  { id: "c-5", framework: "ISO 27001", controlId: "A.10.1", title: "Cryptography", description: "Cryptographic controls policy and key management", status: "compliant", evidence: ["Encryption standards doc", "Key rotation logs"], lastAuditedAt: Date.now() - 86400000 * 10, owner: "Security", category: "Cryptography" },
  { id: "c-6", framework: "ISO 27001", controlId: "A.12.4", title: "Logging and Monitoring", description: "Event logging, protection, and administrator logs", status: "compliant", evidence: ["Audit log system", "SIEM integration", "Retention policy"], lastAuditedAt: Date.now() - 86400000 * 1, owner: "SRE", category: "Operations" },
  { id: "c-7", framework: "ISO 27001", controlId: "A.14.2", title: "Security in Development", description: "Secure development policy and system change control", status: "partial", evidence: ["SDLC doc", "Partial code review coverage"], lastAuditedAt: Date.now() - 86400000 * 12, owner: "Engineering", category: "Development" },
  { id: "c-8", framework: "ISO 27001", controlId: "A.16.1", title: "Incident Management", description: "Responsibilities, procedures, and lessons learned", status: "compliant", evidence: ["Incident playbook", "Post-mortem template", "Self-healing system"], lastAuditedAt: Date.now() - 86400000 * 2, owner: "SRE", category: "Incident Management" },
  { id: "c-9", framework: "SOC 2", controlId: "CC6.1", title: "Logical Access Security", description: "Logical access to information assets", status: "compliant", evidence: ["MFA enforcement", "SSO configuration", "Session management"], lastAuditedAt: Date.now() - 86400000 * 4, owner: "Security", category: "Access Control" },
  { id: "c-10", framework: "SOC 2", controlId: "CC7.2", title: "System Monitoring", description: "Monitor system components for anomalies", status: "compliant", evidence: ["Predictive analysis engine", "Agent telemetry", "Fleet health monitoring"], lastAuditedAt: Date.now() - 86400000 * 1, owner: "SRE", category: "Monitoring" },
  { id: "c-11", framework: "SOC 2", controlId: "CC8.1", title: "Change Management", description: "Changes to infrastructure and software", status: "partial", evidence: ["CI/CD pipeline", "Missing: formal CAB process"], lastAuditedAt: Date.now() - 86400000 * 8, owner: "Engineering", category: "Change Management" },
  { id: "c-12", framework: "NIST 800-53", controlId: "AU-2", title: "Audit Events", description: "Define and maintain auditable events", status: "compliant", evidence: ["Agent audit log", "Event taxonomy", "Retention policy"], lastAuditedAt: Date.now() - 86400000 * 1, owner: "Security", category: "Audit" },
  { id: "c-13", framework: "NIST 800-53", controlId: "IR-4", title: "Incident Handling", description: "Implement incident handling capability", status: "compliant", evidence: ["Self-healing pipeline", "Escalation rules", "Post-mortem process"], lastAuditedAt: Date.now() - 86400000 * 2, owner: "SRE", category: "Incident Response" },
  { id: "c-14", framework: "NIST 800-53", controlId: "RA-5", title: "Vulnerability Scanning", description: "Scan for vulnerabilities and remediate", status: "partial", evidence: ["Dependency scanning", "Missing: infra scanning"], lastAuditedAt: Date.now() - 86400000 * 15, owner: "Security", category: "Risk Assessment" },
];

const DEMO_SLAS: SLAMetric[] = [
  { name: "System Uptime", target: 99.95, actual: 99.98, unit: "%", status: "met", trend: "stable" },
  { name: "Incident Response (P0)", target: 5, actual: 3.2, unit: "min", status: "met", trend: "improving" },
  { name: "Incident Response (P1)", target: 15, actual: 12, unit: "min", status: "met", trend: "stable" },
  { name: "Mean Time to Recovery", target: 30, actual: 18, unit: "min", status: "met", trend: "improving" },
  { name: "Audit Log Retention", target: 2555, actual: 2555, unit: "days", status: "met", trend: "stable" },
  { name: "Backup RPO", target: 4, actual: 1, unit: "hours", status: "met", trend: "stable" },
  { name: "Change Success Rate", target: 95, actual: 92, unit: "%", status: "at-risk", trend: "declining" },
  { name: "Vulnerability Remediation", target: 7, actual: 12, unit: "days", status: "breached", trend: "declining" },
];

const DEMO_RISKS: RiskItem[] = [
  { id: "r-1", title: "Third-party connector API deprecation", likelihood: 3, impact: 4, category: "Vendor", mitigations: ["Multi-provider fallback", "API version monitoring"], owner: "Engineering", status: "mitigated" },
  { id: "r-2", title: "AI model hallucination in financial advice", likelihood: 2, impact: 5, category: "AI Safety", mitigations: ["Sovereign calculation engine", "Human-in-loop for high-value", "Confidence thresholds"], owner: "AI Safety", status: "mitigated" },
  { id: "r-3", title: "Permission drift allowing unauthorized actions", likelihood: 2, impact: 4, category: "Security", mitigations: ["Permission drift agent", "Immutable audit log", "Autonomy ceilings"], owner: "Security", status: "mitigated" },
  { id: "r-4", title: "Cost overrun from uncontrolled agent activity", likelihood: 3, impact: 3, category: "Financial", mitigations: ["Cost guardrail agent", "Daily budget caps", "Circuit breakers"], owner: "Finance", status: "mitigated" },
  { id: "r-5", title: "Data breach via compromised connector credentials", likelihood: 2, impact: 5, category: "Security", mitigations: ["Encrypted credential vault", "Rotation policy"], owner: "Security", status: "open" },
  { id: "r-6", title: "Cascading failure across service mesh", likelihood: 2, impact: 5, category: "Reliability", mitigations: ["Circuit breakers", "Recovery sequencing", "Fleet health monitoring"], owner: "SRE", status: "mitigated" },
];

// ── Components ──────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { color: string; icon: typeof CheckCircle; label: string }> = {
  compliant: { color: "text-trust-safe", icon: CheckCircle, label: "Compliant" },
  partial: { color: "text-accent", icon: AlertTriangle, label: "Partial" },
  "non-compliant": { color: "text-destructive", icon: XCircle, label: "Non-Compliant" },
  "not-applicable": { color: "text-muted-foreground", icon: Eye, label: "N/A" },
};

function ControlRow({ control }: { control: ComplianceControl }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[control.status];
  const StatusIcon = cfg.icon;
  const daysAgo = Math.round((Date.now() - control.lastAuditedAt) / 86400000);

  return (
    <div className="rounded-lg border border-border/40 bg-card/40 overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center gap-3 p-3 text-left hover:bg-secondary/20 transition-colors">
        <StatusIcon className={cn("h-4 w-4 shrink-0", cfg.color)} />
        <Badge variant="outline" className="text-[8px] px-1.5 py-0 h-4 border-border/40 text-muted-foreground font-mono shrink-0">{control.controlId}</Badge>
        <span className="text-xs font-medium text-foreground flex-1 truncate">{control.title}</span>
        <Badge variant="outline" className="text-[8px] px-1.5 py-0 h-4 border-border/30 text-muted-foreground shrink-0">{control.framework}</Badge>
        <span className="text-[9px] text-muted-foreground shrink-0">{daysAgo}d ago</span>
        <ChevronRight className={cn("h-3 w-3 text-muted-foreground transition-transform", expanded && "rotate-90")} />
      </button>
      {expanded && (
        <div className="border-t border-border/30 bg-secondary/10 p-3 space-y-2 text-[10px]">
          <p className="text-muted-foreground">{control.description}</p>
          <div><span className="text-muted-foreground">Owner:</span> <span className="text-foreground">{control.owner}</span></div>
          <div><span className="text-muted-foreground">Evidence:</span> <span className="text-foreground">{control.evidence.join(" • ")}</span></div>
        </div>
      )}
    </div>
  );
}

function RiskCell({ likelihood, impact }: { likelihood: number; impact: number }) {
  const score = likelihood * impact;
  const color = score >= 15 ? "bg-destructive/30 text-destructive" : score >= 8 ? "bg-accent/30 text-accent" : "bg-trust-safe/20 text-trust-safe";
  return <span className={cn("inline-flex items-center justify-center rounded-md h-6 w-8 text-[10px] font-bold", color)}>{score}</span>;
}

// ── Main Component ──────────────────────────────────────────────

export function ComplianceDashboard() {
  const [selectedView, setSelectedView] = useState<"controls" | "sla" | "risks">("controls");
  const [frameworkFilter, setFrameworkFilter] = useState<string>("all");

  const filteredControls = useMemo(() => {
    if (frameworkFilter === "all") return DEMO_CONTROLS;
    return (isDemoMode ? DEMO_CONTROLS : [] as typeof DEMO_CONTROLS).filter(c => c.framework === frameworkFilter);
  }, [frameworkFilter]);

  const stats = useMemo(() => {
    const compliant = (isDemoMode ? DEMO_CONTROLS : [] as typeof DEMO_CONTROLS).filter(c => c.status === "compliant").length;
    const partial = (isDemoMode ? DEMO_CONTROLS : [] as typeof DEMO_CONTROLS).filter(c => c.status === "partial").length;
    const nonCompliant = (isDemoMode ? DEMO_CONTROLS : [] as typeof DEMO_CONTROLS).filter(c => c.status === "non-compliant").length;
    const score = Math.round((compliant / (isDemoMode ? DEMO_CONTROLS : [] as typeof DEMO_CONTROLS).length) * 100);
    return { compliant, partial, nonCompliant, total: (isDemoMode ? DEMO_CONTROLS : [] as typeof DEMO_CONTROLS).length, score };
  }, []);

  const slaStats = useMemo(() => ({
    met: (isDemoMode ? DEMO_SLAS : [] as typeof DEMO_SLAS).filter(s => s.status === "met").length,
    atRisk: (isDemoMode ? DEMO_SLAS : [] as typeof DEMO_SLAS).filter(s => s.status === "at-risk").length,
    breached: (isDemoMode ? DEMO_SLAS : [] as typeof DEMO_SLAS).filter(s => s.status === "breached").length,
  }), []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-primary/15 bg-gradient-to-r from-primary/5 via-card to-card p-5"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-foreground font-display">Compliance & ISO Readiness</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Continuous compliance monitoring across ISO 27001, SOC 2 Type II, and NIST 800-53.
              SLA tracking, risk assessment matrix, and evidence management for audit readiness.
            </p>
          </div>
          <div className="text-center shrink-0">
            <p className={cn("font-display text-2xl font-bold", stats.score >= 90 ? "text-trust-safe" : stats.score >= 70 ? "text-accent" : "text-destructive")}>{stats.score}%</p>
            <p className="text-[9px] text-muted-foreground">Compliance Score</p>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-6 gap-2">
        {[
          { label: "Controls", value: stats.total, color: "text-foreground" },
          { label: "Compliant", value: stats.compliant, color: "text-trust-safe" },
          { label: "Partial", value: stats.partial, color: "text-accent" },
          { label: "SLAs Met", value: slaStats.met, color: "text-trust-safe" },
          { label: "SLAs At Risk", value: slaStats.atRisk, color: "text-accent" },
          { label: "Risks Open", value: (isDemoMode ? DEMO_RISKS : [] as typeof DEMO_RISKS).filter(r => r.status === "open").length, color: "text-destructive" },
        ].map(m => (
          <div key={m.label} className="rounded-xl border border-border/40 bg-card/40 p-2 text-center">
            <p className={cn("font-display text-lg font-bold", m.color)}>{m.value}</p>
            <p className="text-[8px] text-muted-foreground">{m.label}</p>
          </div>
        ))}
      </div>

      {/* View Switcher */}
      <div className="flex gap-1.5">
        {([
          { key: "controls", label: "Compliance Controls", icon: Shield },
          { key: "sla", label: "SLA Monitoring", icon: Target },
          { key: "risks", label: "Risk Matrix", icon: AlertTriangle },
        ] as const).map(v => (
          <button key={v.key} onClick={() => setSelectedView(v.key)}
            className={cn(
              "flex items-center gap-1.5 text-[10px] px-3 py-1.5 rounded-full border transition-all",
              selectedView === v.key ? "bg-primary/15 text-primary border-primary/30" : "border-border/30 text-muted-foreground hover:text-foreground"
            )}
          ><v.icon className="h-3 w-3" />{v.label}</button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {selectedView === "controls" && (
          <motion.div key="controls" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            <div className="flex gap-1.5">
              {["all", "ISO 27001", "SOC 2", "NIST 800-53"].map(f => (
                <button key={f} onClick={() => setFrameworkFilter(f)}
                  className={cn("text-[10px] px-2.5 py-1 rounded-full border transition-all",
                    frameworkFilter === f ? "bg-primary/15 text-primary border-primary/30" : "border-border/30 text-muted-foreground hover:text-foreground"
                  )}>{f === "all" ? "All Frameworks" : f}</button>
              ))}
            </div>
            <div className="space-y-1.5">
              {filteredControls.map(c => <ControlRow key={c.id} control={c} />)}
            </div>
          </motion.div>
        )}

        {selectedView === "sla" && (
          <motion.div key="sla" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
            {(isDemoMode ? DEMO_SLAS : [] as typeof DEMO_SLAS).map(sla => (
              <div key={sla.name} className={cn(
                "rounded-lg border p-3 flex items-center gap-3",
                sla.status === "breached" ? "border-destructive/20 bg-destructive/3" :
                sla.status === "at-risk" ? "border-accent/20 bg-accent/3" :
                "border-border/40 bg-card/40"
              )}>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-foreground">{sla.name}</span>
                    <Badge variant="outline" className={cn("text-[8px] px-1.5 py-0 h-4 border",
                      sla.status === "met" ? "border-trust-safe/20 text-trust-safe" :
                      sla.status === "at-risk" ? "border-accent/20 text-accent" :
                      "border-destructive/20 text-destructive"
                    )}>{sla.status}</Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-[9px] text-muted-foreground">
                    <span>Target: {sla.target}{sla.unit}</span>
                    <span>Actual: <span className={cn("font-bold",
                      sla.status === "met" ? "text-trust-safe" : sla.status === "at-risk" ? "text-accent" : "text-destructive"
                    )}>{sla.actual}{sla.unit}</span></span>
                    <span className={cn(
                      sla.trend === "improving" ? "text-trust-safe" : sla.trend === "declining" ? "text-destructive" : "text-muted-foreground"
                    )}>↗ {sla.trend}</span>
                  </div>
                </div>
                <div className="w-24">
                  <Progress value={Math.min(100, (sla.name.includes("Uptime") || sla.name.includes("Rate") ? sla.actual : (sla.target / Math.max(sla.actual, 0.01)) * 100))} className="h-1.5" />
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {selectedView === "risks" && (
          <motion.div key="risks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            {(isDemoMode ? DEMO_RISKS : [] as typeof DEMO_RISKS).sort((a, b) => (b.likelihood * b.impact) - (a.likelihood * a.impact)).map(risk => (
              <div key={risk.id} className={cn(
                "rounded-xl border p-4",
                risk.status === "open" ? "border-destructive/20 bg-destructive/3" : "border-border/40 bg-card/40"
              )}>
                <div className="flex items-start gap-3">
                  <RiskCell likelihood={risk.likelihood} impact={risk.impact} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-foreground">{risk.title}</span>
                      <Badge variant="outline" className={cn("text-[8px] px-1.5 py-0 h-4 border",
                        risk.status === "open" ? "border-destructive/20 text-destructive" :
                        risk.status === "mitigated" ? "border-trust-safe/20 text-trust-safe" :
                        "border-muted-foreground/20 text-muted-foreground"
                      )}>{risk.status}</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-[9px] text-muted-foreground mb-2">
                      <span>Likelihood: {risk.likelihood}/5</span>
                      <span>Impact: {risk.impact}/5</span>
                      <span>Category: {risk.category}</span>
                      <span>Owner: {risk.owner}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      <span className="font-semibold text-foreground">Mitigations:</span> {risk.mitigations.join(" • ")}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compliance footer */}
      <div className="rounded-lg border border-border/30 bg-secondary/10 p-3">
        <p className="text-[9px] text-muted-foreground">
          <Shield className="h-3 w-3 inline mr-1 -mt-0.5" />
          Compliance posture is continuously evaluated. Controls are mapped to ISO 27001:2022, SOC 2 Type II (2024),
          and NIST 800-53 Rev. 5. Risk scores use likelihood × impact (1-25 scale). SLAs are measured over 30-day rolling windows.
        </p>
      </div>
    </div>
  );
}
