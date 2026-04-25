// ═══════════════════════════════════════════════════════════════
// SITA OS — Kill Switch Toggle Dialog
// Mandatory-reason dialog with optional TTL, dependency warning,
// and affected systems summary.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useMemo, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, Clock, Network } from "lucide-react";
import { toast } from "sonner";
import { toggleKillSwitch, type KillSwitchRow } from "@/lib/control-plane/kill-switch-db-client";
import { recommendCascade } from "@/lib/control-plane/kill-switch-dependency-map";
import type { KillSwitchEntry } from "@/lib/control-plane/kill-switch-types";

const MIN_REASON = 20;
const DUAL_APPROVAL_SWITCHES = new Set([
  "KS-PAYMENTS", "KS-MODEL-PROVIDERS", "KS-RELEASE-ROLLOUT", "KS-APPLIANCE-UPDATE",
]);

interface Props {
  entry: KillSwitchEntry;
  currentRow: KillSwitchRow | null;
  open: boolean;
  intent: "activate" | "deactivate";
  onClose: () => void;
  onSuccess: () => void;
}

export function KillSwitchToggleDialog({ entry, currentRow, open, intent, onClose, onSuccess }: Props) {
  const [reason, setReason] = useState("");
  const [ttlMinutes, setTtlMinutes] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setReason("");
      setTtlMinutes("");
    }
  }, [open]);

  const cascade = useMemo(() => recommendCascade(entry.switchId), [entry.switchId]);
  const requiresDualApproval = DUAL_APPROVAL_SWITCHES.has(entry.switchId);
  const reasonValid = reason.trim().length >= MIN_REASON;
  const isActivating = intent === "activate";

  async function handleSubmit() {
    if (isActivating && !reasonValid) {
      toast.error(`Reason must be at least ${MIN_REASON} characters`);
      return;
    }
    setSubmitting(true);
    const ttl = ttlMinutes ? parseInt(ttlMinutes, 10) : undefined;
    const res = await toggleKillSwitch({
      switchId: entry.switchId,
      enable: isActivating,
      reason: reason || `Deactivated by operator at ${new Date().toISOString()}`,
      expiresInMinutes: ttl && !Number.isNaN(ttl) && ttl > 0 ? ttl : undefined,
      severity: entry.impactLevel as "minimal" | "moderate" | "significant" | "severe",
    });
    setSubmitting(false);
    if (res.requiresApproval) {
      toast.info(`Dual approval required — request #${res.approvalId?.slice(0, 8)} pending second admin`);
      onSuccess();
      onClose();
      return;
    }
    if (res.ok) {
      toast.success(isActivating ? "Kill switch activated" : "Kill switch deactivated");
      onSuccess();
      onClose();
    } else {
      toast.error(res.error ?? "Toggle failed");
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className={isActivating ? "h-5 w-5 text-destructive" : "h-5 w-5 text-primary"} />
            {isActivating ? "Activate" : "Deactivate"} {entry.displayName}
          </DialogTitle>
          <DialogDescription>{entry.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Affected systems */}
          <div className="rounded-md border border-border/50 p-3 bg-secondary/20 space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium">
              <Network className="h-3.5 w-3.5" /> Affected systems
            </div>
            <div className="flex flex-wrap gap-1">
              {entry.enforcementLayers.map((l) => (
                <Badge key={l} variant="outline" className="text-[10px]">{l}</Badge>
              ))}
            </div>
            {entry.affectedEdgeFunctions.length > 0 && (
              <div className="text-[10px] text-muted-foreground">
                Edge functions: {entry.affectedEdgeFunctions.join(", ")}
              </div>
            )}
          </div>

          {/* Cascade warning */}
          {isActivating && cascade.length > 1 && (
            <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3 space-y-1">
              <div className="flex items-center gap-2 text-xs font-medium text-amber-500">
                <AlertTriangle className="h-3.5 w-3.5" /> Dependency cascade
              </div>
              <div className="text-[11px] text-muted-foreground">
                Operators usually consider these together: {cascade.filter((c) => c !== entry.switchId).join(", ")}
              </div>
            </div>
          )}

          {/* Dual approval warning */}
          {isActivating && requiresDualApproval && (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 space-y-1">
              <div className="flex items-center gap-2 text-xs font-medium text-destructive">
                <AlertTriangle className="h-3.5 w-3.5" /> Dual approval required
              </div>
              <div className="text-[11px] text-muted-foreground">
                A second admin (different user) must approve before this switch activates.
              </div>
            </div>
          )}

          {/* Reason */}
          {isActivating && (
            <div className="space-y-1">
              <label className="text-xs font-medium">Reason (required, min {MIN_REASON} chars)</label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain why this kill switch must activate now and what runbook applies."
                rows={3}
              />
              <div className={`text-[10px] ${reasonValid ? "text-muted-foreground" : "text-destructive"}`}>
                {reason.trim().length}/{MIN_REASON}
              </div>
            </div>
          )}

          {/* TTL */}
          {isActivating && (
            <div className="space-y-1">
              <label className="text-xs font-medium flex items-center gap-1">
                <Clock className="h-3 w-3" /> Auto-deactivate after (minutes, optional)
              </label>
              <Input
                type="number"
                min={1}
                value={ttlMinutes}
                onChange={(e) => setTtlMinutes(e.target.value)}
                placeholder="e.g. 60 for 1 hour"
              />
            </div>
          )}

          {!isActivating && currentRow && (
            <div className="rounded-md border border-border/50 p-3 text-[11px] text-muted-foreground space-y-1">
              <div>Activated: {currentRow.activated_at ? new Date(currentRow.activated_at).toLocaleString() : "—"}</div>
              {currentRow.reason && <div>Reason: {currentRow.reason}</div>}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button
            variant={isActivating ? "destructive" : "default"}
            onClick={handleSubmit}
            disabled={submitting || (isActivating && !reasonValid)}
          >
            {submitting ? "Working…" : isActivating ? "Activate kill switch" : "Deactivate"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
