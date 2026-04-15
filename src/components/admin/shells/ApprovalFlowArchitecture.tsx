import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck, ArrowRight, CheckCircle, XCircle, FileText, Lock,
  AlertTriangle, ChevronDown, ChevronUp, Eye, Smartphone, Cloud,
  Monitor, Key, Trash2, Upload, RefreshCw, Zap, UserX
} from "lucide-react";
import { WhyTooltip } from "./WhyTooltip";

interface ApprovalStage {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  description: string;
}

const APPROVAL_SEQUENCE: ApprovalStage[] = [
  { id: "request", label: "Action Requested", icon: Zap, color: "text-amber-400", bg: "bg-amber-500/10", description: "A risky or sensitive action is triggered from any surface (OS, App, or Admin plane)" },
  { id: "risk-eval", label: "Risk Evaluation", icon: AlertTriangle, color: "text-orange-400", bg: "bg-orange-500/10", description: "Cloud evaluates the action against policy rules, trust thresholds, and risk classification" },
  { id: "approval-req", label: "Approval Request Created", icon: FileText, color: "text-cyan-400", bg: "bg-cyan-500/10", description: "Cloud generates a structured approval request with action details, risk level, and impact summary" },
  { id: "prompt", label: "App Prompt Displayed", icon: Smartphone, color: "text-purple-400", bg: "bg-purple-500/10", description: "App renders a clear, human-readable approval prompt with expandable details" },
  { id: "decision", label: "User Decision", icon: ShieldCheck, color: "text-indigo-400", bg: "bg-indigo-500/10", description: "User approves or denies. Decision is cryptographically signed and timestamped" },
  { id: "execution", label: "Conditional Execution", icon: Monitor, color: "text-blue-400", bg: "bg-blue-500/10", description: "If approved, Cloud sends structured execution instruction to OS. OS performs the action" },
  { id: "receipt", label: "Receipt Generated", icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10", description: "App receives a detailed receipt: action, target, result, rollback availability, timestamp" },
  { id: "audit", label: "Audit Recorded", icon: Eye, color: "text-teal-400", bg: "bg-teal-500/10", description: "Full audit trail recorded end-to-end: origin, risk eval, approval, execution, verification" },
];

interface ApprovalClass {
  id: string;
  label: string;
  icon: React.ElementType;
  risk: "high" | "critical";
  examples: string[];
  promptTemplate: {
    action: string;
    device: string;
    reason: string;
    risk: string;
    effect: string;
    rollback: string;
  };
}

const APPROVAL_CLASSES: ApprovalClass[] = [
  {
    id: "ac-1", label: "High-Risk File Actions", icon: FileText, risk: "high",
    examples: ["Permanent file deletion", "Bulk file move across namespaces", "Encrypted archive export"],
    promptTemplate: { action: "Delete 47 files from /workspace/finance", device: "Desktop-01", reason: "User-initiated bulk cleanup via OS file manager", risk: "High — permanent deletion, no trash recovery after 30 days", effect: "Files will be permanently removed from all synced devices", rollback: "Available for 30 days via Cloud version history" },
  },
  {
    id: "ac-2", label: "Low-Trust App Installs", icon: AlertTriangle, risk: "high",
    examples: ["Unverified publisher", "Excessive permission requests", "Known risky category"],
    promptTemplate: { action: "Install 'DataMiner Pro' (unverified publisher)", device: "Desktop-01", reason: "User initiated install from external source", risk: "High — unverified publisher, requests network + file access", effect: "App will be sandboxed with restricted permissions initially", rollback: "Full uninstall available; sandbox prevents data exposure" },
  },
  {
    id: "ac-3", label: "Secure Data Export", icon: Upload, risk: "critical",
    examples: ["Export encrypted vault", "Download full account backup", "Share sensitive workspace"],
    promptTemplate: { action: "Export encrypted workspace backup", device: "Desktop-01 → External drive", reason: "User-requested full workspace export for offline backup", risk: "Critical — contains sensitive financial and personal data", effect: "Encrypted archive created; decryption key released to verified device", rollback: "Not available — exported data cannot be recalled after download" },
  },
  {
    id: "ac-4", label: "Trust Changes", icon: ShieldCheck, risk: "critical",
    examples: ["Add new trusted device", "Change trust threshold", "Modify trust policy"],
    promptTemplate: { action: "Add 'iPad-Air' as trusted device", device: "New device — iPad Air (iOS 18)", reason: "Device attempted first sync with valid credentials", risk: "Critical — trusted devices can access all synced data", effect: "Device gains full sync access and can approve future actions", rollback: "Revoke trust at any time from App → Devices → Trust" },
  },
  {
    id: "ac-5", label: "Device Revocation", icon: Trash2, risk: "critical",
    examples: ["Remove trusted device", "Invalidate device session", "Block device permanently"],
    promptTemplate: { action: "Remove 'Laptop-Work' from trusted devices", device: "Target: Laptop-Work (last seen 2h ago)", reason: "Admin-initiated device cleanup — device reported lost", risk: "Critical — device will lose all sync access immediately", effect: "All sessions terminated, sync paused, local data retention per policy", rollback: "Re-enrollment required — cannot undo remotely" },
  },
  {
    id: "ac-6", label: "Dangerous Remote Commands", icon: Zap, risk: "critical",
    examples: ["Remote wipe", "Force factory reset", "Emergency account freeze"],
    promptTemplate: { action: "Emergency remote lock on Desktop-01", device: "Target: Desktop-01 (currently active)", reason: "Security alert — unauthorized access pattern detected", risk: "Critical — device will be immediately locked, all sessions terminated", effect: "User will be signed out; device locked until App unlock issued", rollback: "Unlock available from App → Emergency → Unlock Device" },
  },
  {
    id: "ac-7", label: "Protection Disabling", icon: Lock, risk: "critical",
    examples: ["Disable 2FA temporarily", "Lower trust threshold", "Pause security monitoring"],
    promptTemplate: { action: "Temporarily disable 2FA for account", device: "Account-wide", reason: "User request — migrating authenticator app", risk: "Critical — account vulnerable during 2FA disabled window", effect: "2FA disabled for 1 hour; auto-re-enables after window expires", rollback: "Re-enable immediately from App → Security → 2FA" },
  },
  {
    id: "ac-8", label: "Encrypted Key Release", icon: Key, risk: "critical",
    examples: ["Release sync encryption key to new device", "Share vault key", "Export master key"],
    promptTemplate: { action: "Release sync encryption key to iPad-Air", device: "Target: iPad-Air (newly trusted)", reason: "New trusted device requires encryption key for full sync", risk: "Critical — encryption key grants access to all synced encrypted data", effect: "Key transferred securely; device can decrypt all synced content", rollback: "Revoke device trust to invalidate key access" },
  },
];

const RISK_COLORS = {
  high: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  critical: "bg-red-500/10 text-red-400 border-red-500/20",
};

export function ApprovalFlowArchitecture() {
  const [expandedClass, setExpandedClass] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          Approval Flow Architecture
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Structured approval sequence for all risky actions — from request through audit
        </p>
      </div>

      {/* Approval Pipeline */}
      <Card className="border-white/[0.06] bg-white/[0.03]">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-primary" />
            8-Stage Approval Sequence
            <WhyTooltip explanation="Every risky action follows this exact sequence. No step can be skipped. The App is the mandatory trust gate for all protected actions." />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {APPROVAL_SEQUENCE.map((stage, i) => (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={cn("p-3 rounded-xl border relative", stage.bg, "border-white/[0.06]")}
              >
                <div className="absolute -top-2 -left-1 h-4 w-4 rounded-full bg-card flex items-center justify-center text-[8px] font-bold text-muted-foreground border border-white/[0.1]">{i + 1}</div>
                <stage.icon className={cn("h-5 w-5 mb-2", stage.color)} />
                <p className={cn("text-[11px] font-semibold mb-1", stage.color)}>{stage.label}</p>
                <p className="text-[9px] text-muted-foreground leading-relaxed">{stage.description}</p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Approval Classes */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Lock className="h-4 w-4 text-primary" />
          Approval-Required Action Classes
          <Badge variant="outline" className="text-[8px] text-muted-foreground">{APPROVAL_CLASSES.length} classes</Badge>
        </h3>
        <div className="space-y-2">
          {APPROVAL_CLASSES.map((ac, i) => (
            <Card key={ac.id} className="border-white/[0.06] bg-white/[0.03]">
              <CardHeader className="py-2.5 px-4">
                <button onClick={() => setExpandedClass(expandedClass === ac.id ? null : ac.id)} className="w-full flex items-center gap-3">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} className="flex items-center gap-3 flex-1">
                    <ac.icon className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-xs font-medium text-foreground">{ac.label}</span>
                    <Badge variant="outline" className={cn("text-[8px] px-1.5 py-0", RISK_COLORS[ac.risk])}>
                      {ac.risk}
                    </Badge>
                    <div className="flex items-center gap-1 ml-auto">
                      {ac.examples.map((ex, ei) => (
                        <Badge key={ei} variant="outline" className="text-[7px] px-1 py-0 text-muted-foreground border-white/[0.06]">{ex}</Badge>
                      ))}
                    </div>
                  </motion.div>
                  {expandedClass === ac.id ? <ChevronUp className="h-3 w-3 text-muted-foreground" /> : <ChevronDown className="h-3 w-3 text-muted-foreground" />}
                </button>
              </CardHeader>
              <AnimatePresence>
                {expandedClass === ac.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                    <CardContent className="pt-0 px-4 pb-4">
                      <div className="border border-white/[0.08] rounded-lg overflow-hidden">
                        <div className="bg-white/[0.03] px-3 py-2 border-b border-white/[0.06]">
                          <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">Approval Prompt Preview</span>
                        </div>
                        <div className="p-3 space-y-2">
                          {Object.entries(ac.promptTemplate).map(([key, value]) => (
                            <div key={key} className="flex items-start gap-3">
                              <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium min-w-[60px] mt-0.5">{key}</span>
                              <span className="text-[11px] text-foreground">{value}</span>
                            </div>
                          ))}
                        </div>
                        <div className="bg-white/[0.02] px-3 py-2 border-t border-white/[0.06] flex items-center gap-2">
                          <Button variant="ghost" size="sm" className="h-6 text-[10px] text-emerald-400 hover:text-emerald-300 gap-1">
                            <CheckCircle className="h-3 w-3" /> Approve
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 text-[10px] text-red-400 hover:text-red-300 gap-1">
                            <XCircle className="h-3 w-3" /> Deny
                          </Button>
                          <span className="ml-auto text-[8px] text-muted-foreground">Expires in 5 minutes</span>
                        </div>
                      </div>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          ))}
        </div>
      </div>

      {/* UX Rules */}
      <Card className="border-white/[0.06] bg-white/[0.03]">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" />
            Approval UX Rules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {[
              { rule: "Clear", detail: "Plain language, no jargon — user understands what will happen" },
              { rule: "Short", detail: "Core info visible at a glance — details expandable on tap" },
              { rule: "Human-readable", detail: "Real device names, real action descriptions, real consequences" },
              { rule: "Not overloaded", detail: "Maximum 6 fields in prompt — action, device, reason, risk, effect, rollback" },
              { rule: "Expandable", detail: "Technical details available but hidden by default" },
              { rule: "Time-limited", detail: "Approval requests expire after configurable window (default 5 min)" },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} className="p-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02]">
                <p className="text-[10px] font-semibold text-primary mb-0.5">{item.rule}</p>
                <p className="text-[9px] text-muted-foreground leading-relaxed">{item.detail}</p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
