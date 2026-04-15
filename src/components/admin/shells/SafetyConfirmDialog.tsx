import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertTriangle, Shield, RotateCcw, Users, Server, ChevronDown,
  CheckCircle, XCircle, Clock, Zap, Eye, FileText
} from "lucide-react";

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
  const risk = RISK_CONFIG[action.riskLevel];
  const RiskIcon = risk.icon;
  const requiresTypedConfirm = action.riskLevel === "critical" || action.riskLevel === "high";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-border/40">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className={cn("rounded-lg p-2", risk.bg, risk.border, "border")}>
              <RiskIcon className={cn("h-5 w-5", risk.color)} />
            </div>
            <div>
              <DialogTitle className="text-base">{action.title}</DialogTitle>
              <Badge variant="outline" className={cn("mt-1 text-[10px]", risk.bg, risk.color, risk.border)}>
                {risk.label}
              </Badge>
            </div>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            {action.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
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
                <span className="font-medium text-emerald-400">Simulation Result:</span>
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
                <span className="font-medium text-blue-400">Recommended: {action.saferAlternative.label}</span>
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

          {/* Typed confirmation for high/critical */}
          {requiresTypedConfirm && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 space-y-2">
              <p className="text-[11px] text-red-400">
                Type <span className="font-mono font-bold">CONFIRM</span> to proceed with this {action.riskLevel}-risk action.
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
              disabled={requiresTypedConfirm && confirmText !== "CONFIRM"}
              onClick={onConfirm}
              className="gap-1.5"
            >
              <Zap className="h-3.5 w-3.5" />
              {action.saferAlternative ? "Proceed Anyway" : "Confirm Action"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
