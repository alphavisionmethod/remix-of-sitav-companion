// ═══════════════════════════════════════════════════════════════
// SITA OS — Action Consequence Preview
// Shows what will happen before destructive/irreversible actions
// ═══════════════════════════════════════════════════════════════

import { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle, Shield, Undo2, Trash2, CheckCircle2 } from "lucide-react";
import { getActionCopy } from "@/lib/ux-trust/microcopy-system";
import { Button } from "@/components/ui/button";

interface ConsequenceItem {
  label: string;
  isReversible: boolean;
}

interface ActionConsequencePreviewProps {
  action: string;
  targetName?: string;
  isIrreversible?: boolean;
  affectedCount?: number;
  consequences: ConsequenceItem[];
  downstreamEffects?: string[];
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  className?: string;
  children?: ReactNode;
}

export function ActionConsequencePreview({
  action,
  targetName,
  isIrreversible = false,
  affectedCount,
  consequences,
  downstreamEffects,
  onConfirm,
  onCancel,
  loading = false,
  className,
}: ActionConsequencePreviewProps) {
  const [acknowledged, setAcknowledged] = useState(false);
  const copy = getActionCopy({
    action,
    isDestructive: true,
    isIrreversible,
    affectedCount,
    targetName,
  });

  return (
    <div
      className={cn(
        "rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-4 max-w-md",
        className
      )}
      role="alertdialog"
      aria-label={`Confirm: ${action}`}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-destructive/10 p-2 shrink-0">
          <AlertTriangle className="h-5 w-5 text-destructive" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            {copy.buttonLabel}
          </h3>
          {copy.target && (
            <p className="text-xs text-muted-foreground mt-0.5">Target: {copy.target}</p>
          )}
        </div>
      </div>

      {/* Consequences */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">What will happen</p>
        <ul className="space-y-1.5">
          {consequences.map((c, i) => (
            <li key={i} className="flex items-center gap-2 text-xs">
              {c.isReversible ? (
                <Undo2 className="h-3.5 w-3.5 text-trust-safe shrink-0" />
              ) : (
                <Trash2 className="h-3.5 w-3.5 text-destructive shrink-0" />
              )}
              <span className={cn(c.isReversible ? "text-foreground" : "text-destructive")}>
                {c.label}
              </span>
              <span className={cn(
                "text-[10px] px-1 py-0.5 rounded font-medium ml-auto shrink-0",
                c.isReversible
                  ? "bg-trust-safe/10 text-trust-safe"
                  : "bg-destructive/10 text-destructive"
              )}>
                {c.isReversible ? "Reversible" : "Permanent"}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Downstream effects */}
      {downstreamEffects && downstreamEffects.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Downstream effects</p>
          <ul className="space-y-1">
            {downstreamEffects.map((effect, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Shield className="h-3 w-3 shrink-0" />
                {effect}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Consequence warning */}
      {copy.consequence && (
        <p className="text-xs text-destructive font-medium bg-destructive/10 rounded px-2.5 py-1.5">
          {copy.consequence}
        </p>
      )}

      {/* Acknowledgment + Actions */}
      {isIrreversible && (
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
            className="rounded border-destructive"
          />
          <span className="text-muted-foreground">I understand this action is permanent</span>
        </label>
      )}

      <div className="flex items-center gap-2 pt-1">
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
          className="flex-1"
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={onConfirm}
          className="flex-1"
          disabled={(isIrreversible && !acknowledged) || loading}
        >
          {loading ? (
            "Processing…"
          ) : (
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Confirm
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
