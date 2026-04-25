import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertTriangle, Shield, RotateCcw, Users, Server, ChevronDown,
  CheckCircle, XCircle, Clock, Zap, Eye, FileText, ShieldAlert, Timer
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface SafetyAction {
  title: string;
  description: string;
  riskLevel: RiskLevel;
  affectedSystems: string[];
  affectedUsers?: string;
  rollbackAvailable: boolean;
  rollbackDescription?: string;
  approvalRequired?: boolean;
  estimatedDuration?: string;
  simulationAvailable?: boolean;
  simulationResult?: string;
  saferAlternative?: { label: string; description: string };
  technicalDetails?: string;
  requiresDualApproval?: boolean;
  timedApprovalMinutes?: number;
}

interface SafetyConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: SafetyAction;
  onConfirm: () => void;
  onSimulate?: () => void;
  onChooseSafer?: () => void;
}

const RISK_CONFIG: Record<RiskLevel, { color: string; bg: string; border: string; icon: React.ElementType; label: string }> = {
  low: { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: CheckCircle, label: "Low Risk" },
  medium: { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", icon: AlertTriangle, label: "Medium Risk" },
  high: { color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", icon: AlertTriangle, label: "High Risk" },
  critical: { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", icon: XCircle, label: "Critical Risk" },
};

export function SafetyConfirmDialog({ open, onOpenChange, action, onConfirm, onSimulate, onChooseSafer }: SafetyConfirmDialogProps) {
  const [showTechnical, setShowTechnical] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [reason, setReason] = useState("");
  const [dualApprovalStep, setDualApprovalStep] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  const risk = RISK_CONFIG[action.riskLevel];
  const RiskIcon = risk.icon;
  const requiresTypedConfirm = action.riskLevel === "critical" || action.riskLevel === "high";
  const requiresDual = action.requiresDualApproval ?? action.riskLevel === "critical";
  const timedMinutes = action.timedApprovalMinutes ?? (action.riskLevel === "critical" ? 5 : action.riskLevel === "high" ? 3 : 0);
  const requiresReason = action.riskLevel !== "low";

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setConfirmText("");
      setReason("");
      setDualApprovalStep(0);
      setShowTechnical(false);
      if (timedMinutes > 0) {
        setTimerSeconds(timedMinutes * 60);
        setTimerActive(true);
      } else {
        setTimerActive(false);
        setTimerSeconds(0);
      }
    }
  }, [open, timedMinutes]);

  // Countdown timer for timed approvals
  useEffect(() => {
    if (!timerActive || timerSeconds <= 0) return;
    const interval = setInterval(() => {
      setTimerSeconds(prev => {
        if (prev <= 1) {
          setTimerActive(false);
          onOpenChange(false); // Auto-expire
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds, onOpenChange]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const canConfirm =
    (!requiresTypedConfirm || confirmText === "CONFIRM") &&
    (!requiresReason || reason.trim().length >= 5);

  const handleConfirmClick = () => {
    if (requiresDual && dualApprovalStep === 0) {
      setDualApprovalStep(1);
      setConfirmText("");
      return;
    }
    onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-border/40">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className={cn("rounded-lg p-2", risk.bg, risk.border, "border")}>
              <RiskIcon className={cn("h-5 w-5", risk.color)} />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-base">{action.title}</DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={cn("text-[10px]", risk.bg, risk.color, risk.border)}>
                  {risk.label}
                </Badge>
                {requiresDual && (
                  <Badge variant="outline" className="text-[10px] bg-purple-500/10 text-purple-400 border-purple-500/20 gap-1">
                    <ShieldAlert className="h-2.5 w-2.5" /> Dual Approval
                  </Badge>
                )}
                {timedMinutes > 0 && timerActive && (
                  <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-400 border-amber-500/20 gap-1 tabular-nums">
                    <Timer className="h-2.5 w-2.5" /> Expires: {formatTime(timerSeconds)}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            {action.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2 max-h-[50vh] overflow-y-auto">
          {/* Dual approval progress */}
          {requiresDual && (
            <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-3">
              <div className="flex items-center gap-3 text-xs">
                <div className={cn("rounded-full h-6 w-6 flex items-center justify-center text-[10px] font-bold border",
                  dualApprovalStep >= 1 ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400" : "bg-primary/10 border-primary/20 text-primary"
                )}>1</div>
                <div className="flex-1 h-px bg-border/40" />
                <div className={cn("rounded-full h-6 w-6 flex items-center justify-center text-[10px] font-bold border",
                  dualApprovalStep >= 1 ? "bg-primary/10 border-primary/20 text-primary" : "bg-muted/20 border-border/30 text-muted-foreground"
                )}>2</div>
              </div>
              <p className="text-[10px] text-purple-300 mt-2">
                {dualApprovalStep === 0 ? "Step 1 of 2: First approval required" : "Step 2 of 2: Second confirmation required"}
              </p>
            </div>
          )}

          {/* What will change */}
          <div className="rounded-lg border border-border/30 bg-white/[0.02] p-3 space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-foreground">
              <Server className="h-3.5 w-3.5 text-muted-foreground" />
              Affected Systems
            </div>
            <div className="flex flex-wrap gap-1.5">
              {action.affectedSystems.map(s => (
                <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] text-muted-foreground border border-white/[0.06]">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Who is affected */}
          {action.affectedUsers && (
            <div className="rounded-lg border border-border/30 bg-white/[0.02] p-3">
              <div className="flex items-center gap-2 text-xs">
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-medium text-foreground">Impact:</span>
                <span className="text-muted-foreground">{action.affectedUsers}</span>
              </div>
            </div>
          )}

          {/* Rollback info */}
          <div className="rounded-lg border border-border/30 bg-white/[0.02] p-3">
            <div className="flex items-center gap-2 text-xs">
              <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-medium text-foreground">Rollback:</span>
              <span className={action.rollbackAvailable ? "text-emerald-400" : "text-red-400"}>
                {action.rollbackAvailable ? "Available" : "Not Available"}
              </span>
            </div>
            {action.rollbackDescription && (
              <p className="text-[10px] text-muted-foreground mt-1 ml-6">{action.rollbackDescription}</p>
            )}
          </div>

          {/* Duration */}
          {action.estimatedDuration && (
            <div className="rounded-lg border border-border/30 bg-white/[0.02] p-3">
              <div className="flex items-center gap-2 text-xs">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-medium text-foreground">Estimated Duration:</span>
                <span className="text-muted-foreground">{action.estimatedDuration}</span>
              </div>
            </div>
          )}

          {/* Simulation result */}
          {action.simulationResult && (
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
              <div className="flex items-center gap-2 text-xs">
                <Eye className="h-3.5 w-3.5 text-emerald-400" />
                <span className="font-medium text-emerald-400">Simulation Passed</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1 ml-6">{action.simulationResult}</p>
            </div>
          )}

          {/* Safer alternative */}
          {action.saferAlternative && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3 cursor-pointer hover:bg-blue-500/10 transition-colors"
              onClick={onChooseSafer}
            >
              <div className="flex items-center gap-2 text-xs">
                <Shield className="h-3.5 w-3.5 text-blue-400" />
                <span className="font-medium text-blue-400">Safer: {action.saferAlternative.label}</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 ml-6">{action.saferAlternative.description}</p>
            </motion.div>
          )}

          {/* Technical details */}
          {action.technicalDetails && (
            <div>
              <button
                onClick={() => setShowTechnical(!showTechnical)}
                className="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
              >
                <FileText className="h-3 w-3" />
                Technical Details
                <ChevronDown className={cn("h-3 w-3 transition-transform", showTechnical && "rotate-180")} />
              </button>
              {showTechnical && (
                <motion.pre
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="mt-2 p-2 rounded bg-black/30 text-[10px] font-mono text-muted-foreground overflow-x-auto"
                >
                  {action.technicalDetails}
                </motion.pre>
              )}
            </div>
          )}

          {/* Reason capture */}
          {requiresReason && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Reason / Justification {action.riskLevel === "low" ? "(optional)" : "(required)"}
              </label>
              <Textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Why is this action being taken? This will be recorded in the audit log."
                className="text-xs min-h-[60px] bg-black/20 border-border/30 resize-none"
              />
              {requiresReason && reason.trim().length > 0 && reason.trim().length < 5 && (
                <p className="text-[10px] text-amber-400">Please provide at least 5 characters.</p>
              )}
            </div>
          )}

          {/* Typed confirmation for high/critical */}
          {requiresTypedConfirm && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 space-y-2">
              <p className="text-[11px] text-red-400">
                Type <span className="font-mono font-bold">CONFIRM</span> to proceed with this {action.riskLevel}-risk action.
                {requiresDual && dualApprovalStep === 1 && " (Second confirmation)"}
              </p>
              <input
                value={confirmText}
                onChange={e => setConfirmText(e.target.value)}
                placeholder="Type CONFIRM"
                className="w-full px-3 py-1.5 rounded bg-black/30 border border-red-500/20 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-red-500/30"
              />
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {action.simulationAvailable && onSimulate && (
            <Button variant="outline" size="sm" onClick={onSimulate} className="gap-1.5">
              <Eye className="h-3.5 w-3.5" />
              Run Simulation First
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant={action.riskLevel === "critical" ? "destructive" : "default"}
              disabled={!canConfirm}
              onClick={handleConfirmClick}
              className="gap-1.5"
            >
              <Zap className="h-3.5 w-3.5" />
              {requiresDual && dualApprovalStep === 0
                ? "First Approval"
                : requiresDual && dualApprovalStep === 1
                ? "Final Confirmation"
                : action.saferAlternative
                ? "Proceed Anyway"
                : "Confirm Action"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
