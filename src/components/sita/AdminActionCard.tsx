// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin Action Card
// Every admin control shows: what changes, risk, next, undo, proof
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle, RotateCcw, Shield, ChevronDown, ChevronUp, FileText, Zap } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface AdminActionCardProps {
  title: string;
  description?: string;
  whatChanges: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  whatHappensNext: string;
  proofNote: string;
  undoDescription?: string;
  onConfirm: () => void;
  onUndo?: () => void;
  confirmLabel?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

const RISK_STYLES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  low: { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/20", label: "Low Risk" },
  medium: { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/20", label: "Medium Risk" },
  high: { bg: "bg-orange-500/10", text: "text-orange-500", border: "border-orange-500/20", label: "High Risk" },
  critical: { bg: "bg-destructive/10", text: "text-destructive", border: "border-destructive/20", label: "Critical" },
};

export function AdminActionCard({
  title, description, whatChanges, riskLevel, whatHappensNext, proofNote,
  undoDescription, onConfirm, onUndo, confirmLabel = "Confirm", icon, children, disabled, className,
}: AdminActionCardProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const risk = RISK_STYLES[riskLevel];

  return (
    <>
      <div className={cn("glass-panel rounded-2xl border border-border/50 overflow-hidden transition-all duration-200", className)}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 pb-2">
          <div className="flex items-center gap-3 min-w-0">
            {icon && <div className="shrink-0">{icon}</div>}
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-foreground truncate">{title}</h3>
              {description && <p className="text-xs text-muted-foreground mt-0.5 truncate">{description}</p>}
            </div>
          </div>
          <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide", risk.bg, risk.text, risk.border)}>
            <span className={cn("h-1.5 w-1.5 rounded-full", risk.text.replace("text-", "bg-"))} />
            {risk.label}
          </span>
        </div>

        {/* Content */}
        {children && <div className="px-4 pb-2">{children}</div>}

        {/* Impact Details (collapsible) */}
        <button onClick={() => setExpanded(!expanded)} className="flex w-full items-center justify-between px-4 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors border-t border-border/30">
          <span className="flex items-center gap-1.5"><Shield className="h-3 w-3" /> Impact details</span>
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>

        {expanded && (
          <div className="px-4 pb-3 space-y-2 text-xs border-t border-border/20 pt-2 animate-in slide-in-from-top-1 duration-200">
            <div className="flex gap-2">
              <Zap className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
              <div><span className="font-medium text-foreground">What changes:</span> <span className="text-muted-foreground">{whatChanges}</span></div>
            </div>
            <div className="flex gap-2">
              <AlertTriangle className={cn("h-3.5 w-3.5 shrink-0 mt-0.5", risk.text)} />
              <div><span className="font-medium text-foreground">What happens next:</span> <span className="text-muted-foreground">{whatHappensNext}</span></div>
            </div>
            {undoDescription && (
              <div className="flex gap-2">
                <RotateCcw className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                <div><span className="font-medium text-foreground">How to undo:</span> <span className="text-muted-foreground">{undoDescription}</span></div>
              </div>
            )}
            <div className="flex gap-2">
              <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
              <div><span className="font-medium text-foreground">Proof logged:</span> <span className="text-muted-foreground">{proofNote}</span></div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-border/30 bg-secondary/20">
          {onUndo && (
            <Button variant="ghost" size="sm" onClick={onUndo} className="text-xs gap-1.5">
              <RotateCcw className="h-3 w-3" /> Undo
            </Button>
          )}
          <Button size="sm" onClick={() => setShowConfirm(true)} disabled={disabled} className="text-xs gap-1.5">
            {confirmLabel}
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="glass-panel border-border/50 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Confirm: {title}</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">Review the impact before proceeding.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="rounded-xl bg-secondary/30 p-3 space-y-2 text-xs">
              <div><span className="font-semibold text-foreground">What changes:</span> <span className="text-muted-foreground">{whatChanges}</span></div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-foreground">Risk:</span>
                <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase", risk.bg, risk.text, risk.border)}>
                  {risk.label}
                </span>
              </div>
              <div><span className="font-semibold text-foreground">Next:</span> <span className="text-muted-foreground">{whatHappensNext}</span></div>
              {undoDescription && <div><span className="font-semibold text-foreground">Undo:</span> <span className="text-muted-foreground">{undoDescription}</span></div>}
              <div><span className="font-semibold text-foreground">Proof:</span> <span className="text-muted-foreground">{proofNote}</span></div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowConfirm(false)}>Cancel</Button>
            <Button size="sm" variant={riskLevel === "critical" ? "destructive" : "default"} onClick={() => { onConfirm(); setShowConfirm(false); }}>
              {confirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
