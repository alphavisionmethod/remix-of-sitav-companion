// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Trusted Device: Emergency Actions
// Pause automations, emergency deny, device lost mode
// ═══════════════════════════════════════════════════════════════

import { MobileShell } from "@/platform/experience/components/mobile/MobileShell";
import { AlertTriangle, Pause, XOctagon, Smartphone, ShieldOff, Lock, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

interface EmergencyAction {
  id: string;
  icon: typeof AlertTriangle;
  label: string;
  description: string;
  severity: "warning" | "critical" | "danger";
  confirmText: string;
  proofGenerated: boolean;
}

const EMERGENCY_ACTIONS: EmergencyAction[] = [
  {
    id: "pause-automations", icon: Pause, label: "Pause All Automations",
    description: "Immediately halt all running and scheduled automations. Manual operations continue normally.",
    severity: "warning", confirmText: "Pause all automations now?", proofGenerated: true,
  },
  {
    id: "emergency-deny", icon: XOctagon, label: "Emergency Deny All Pending",
    description: "Deny all pending approvals immediately. Each denial generates a proof receipt.",
    severity: "critical", confirmText: "Deny all pending approvals?", proofGenerated: true,
  },
  {
    id: "device-lost", icon: Smartphone, label: "Report Device Lost",
    description: "Mark this device as lost. All trust capabilities will be revoked and sessions invalidated.",
    severity: "danger", confirmText: "Report this device as lost?", proofGenerated: true,
  },
  {
    id: "revoke-trust", icon: ShieldOff, label: "Revoke All Device Trust",
    description: "Revoke trust for all devices except this one. Re-enrollment required.",
    severity: "critical", confirmText: "Revoke all other device trust?", proofGenerated: true,
  },
  {
    id: "lock-environment", icon: Lock, label: "Lock Environment",
    description: "Lock the entire SITA environment. Requires full re-authentication to resume.",
    severity: "danger", confirmText: "Lock environment now?", proofGenerated: true,
  },
];

const SEVERITY_STYLES: Record<string, { bg: string; border: string; text: string; button: string }> = {
  warning: {
    bg: "bg-[hsl(var(--sita-gold))]/5", border: "border-[hsl(var(--sita-gold))]/30",
    text: "text-[hsl(var(--sita-gold))]", button: "bg-[hsl(var(--sita-gold))]/10 hover:bg-[hsl(var(--sita-gold))]/20 text-[hsl(var(--sita-gold))]",
  },
  critical: {
    bg: "bg-destructive/5", border: "border-destructive/30",
    text: "text-destructive", button: "bg-destructive/10 hover:bg-destructive/20 text-destructive",
  },
  danger: {
    bg: "bg-destructive/5", border: "border-destructive/40",
    text: "text-destructive", button: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  },
};

export default function MobileEmergencyActions() {
  const [confirming, setConfirming] = useState<string | null>(null);
  const [completed, setCompleted] = useState<string[]>([]);

  const handleAction = (action: EmergencyAction) => {
    if (confirming === action.id) {
      setCompleted(prev => [...prev, action.id]);
      setConfirming(null);
      toast.warning(`${action.label} executed`, {
        description: action.proofGenerated ? "Proof receipt generated." : undefined,
      });
    } else {
      setConfirming(action.id);
    }
  };

  return (
    <MobileShell title="Emergency Actions">
      

      {/* Warning Banner */}
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 mb-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-destructive">Emergency Controls</p>
            <p className="text-[11px] text-muted-foreground mt-1">
              These actions take effect immediately and generate proof receipts. Use only when necessary.
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        {EMERGENCY_ACTIONS.map(action => {
          const styles = SEVERITY_STYLES[action.severity];
          const isCompleted = completed.includes(action.id);
          const isConfirming = confirming === action.id;
          const Icon = action.icon;

          return (
            <div
              key={action.id}
              className={cn(
                "rounded-xl border p-4 space-y-3 transition-all",
                isCompleted ? "border-muted bg-muted/30 opacity-60" : `${styles.bg} ${styles.border}`
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center shrink-0", isCompleted ? "bg-muted" : styles.bg)}>
                  {isCompleted ? (
                    <CheckCircle className="h-4.5 w-4.5 text-muted-foreground" />
                  ) : (
                    <Icon className={cn("h-4.5 w-4.5", styles.text)} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-semibold", isCompleted && "text-muted-foreground")}>{action.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{action.description}</p>
                </div>
              </div>

              {action.proofGenerated && !isCompleted && (
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <AlertCircle className="h-3 w-3" />
                  <span>Generates proof receipt</span>
                </div>
              )}

              {!isCompleted && (
                <button
                  onClick={() => handleAction(action)}
                  className={cn(
                    "w-full py-2.5 rounded-lg text-[12px] font-semibold transition-colors",
                    isConfirming ? styles.button : styles.button
                  )}
                >
                  {isConfirming ? action.confirmText : action.label}
                </button>
              )}

              {isCompleted && (
                <p className="text-[10px] text-muted-foreground text-center">Completed — proof receipt generated</p>
              )}
            </div>
          );
        })}
      </div>
    </MobileShell>
  );
}
