// ═══════════════════════════════════════════════════════════════
// SITA OS — Review & Approve Pattern (Reusable)
// Before/after comparison, proof preview, policy note,
// approve/deny/escalate with biometric confirm path
// ═══════════════════════════════════════════════════════════════

import { cn } from "@/lib/utils";
import { CheckCircle, XCircle, AlertTriangle, Shield, ArrowRight, Fingerprint, MessageSquare, Link2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface ReviewApproveProps {
  title: string;
  summary: string;
  domain?: string;
  severity?: "low" | "medium" | "high" | "critical";
  beforeState?: Record<string, string>;
  afterState?: Record<string, string>;
  policyNote?: string;
  proofHash?: string;
  approverContext?: string;
  requireBiometric?: boolean;
  onApprove?: () => void;
  onDeny?: (reason: string) => void;
  onEscalate?: () => void;
  children?: ReactNode;
  className?: string;
}

const SEVERITY_STYLES = {
  low: { badge: "bg-muted text-muted-foreground", border: "border-border/40" },
  medium: { badge: "bg-[hsl(var(--sita-gold))]/10 text-[hsl(var(--sita-gold))]", border: "border-[hsl(var(--sita-gold))]/30" },
  high: { badge: "bg-destructive/10 text-destructive", border: "border-destructive/30" },
  critical: { badge: "bg-destructive/20 text-destructive", border: "border-destructive/40" },
};

export function ReviewApprovePattern({
  title, summary, domain, severity = "medium",
  beforeState, afterState, policyNote, proofHash,
  approverContext, requireBiometric = false,
  onApprove, onDeny, onEscalate, children, className,
}: ReviewApproveProps) {
  const [denyReason, setDenyReason] = useState("");
  const [showDenyInput, setShowDenyInput] = useState(false);
  const [biometricConfirmed, setBiometricConfirmed] = useState(false);
  const styles = SEVERITY_STYLES[severity];

  const handleDeny = () => {
    if (!showDenyInput) { setShowDenyInput(true); return; }
    onDeny?.(denyReason);
    setShowDenyInput(false);
    setDenyReason("");
  };

  const handleApprove = () => {
    if (requireBiometric && !biometricConfirmed) {
      setBiometricConfirmed(true);
      return;
    }
    onApprove?.();
  };

  return (
    <Card className={cn("overflow-hidden", styles.border, className)}>
      <CardContent className="p-0">
        {/* Header */}
        <div className="p-4 border-b border-border/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold">{title}</h3>
                <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-medium", styles.badge)}>{severity}</span>
                {domain && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{domain}</span>}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">{summary}</p>
            </div>
          </div>
        </div>

        {/* Before/After Comparison */}
        {beforeState && afterState && (
          <div className="p-4 border-b border-border/20 bg-muted/10">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Changes</p>
            <div className="space-y-1.5">
              {Object.keys(afterState).map(key => (
                <div key={key} className="flex items-center gap-2 text-[11px]">
                  <span className="text-muted-foreground w-24 shrink-0">{key}</span>
                  {beforeState[key] && (
                    <>
                      <span className="line-through text-destructive/60">{beforeState[key]}</span>
                      <ArrowRight className="h-2.5 w-2.5 text-muted-foreground" />
                    </>
                  )}
                  <span className="text-[hsl(var(--trust-safe))] font-medium">{afterState[key]}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Policy Note */}
        {policyNote && (
          <div className="px-4 py-3 border-b border-border/20 bg-[hsl(var(--sita-gold))]/5">
            <div className="flex items-start gap-2 text-[11px]">
              <Shield className="h-3.5 w-3.5 text-[hsl(var(--sita-gold))] shrink-0 mt-0.5" />
              <p className="text-[hsl(var(--sita-gold))]">{policyNote}</p>
            </div>
          </div>
        )}

        {/* Proof Hash */}
        {proofHash && (
          <div className="px-4 py-2 border-b border-border/20">
            <div className="flex items-center gap-2 text-[10px]">
              <Link2 className="h-3 w-3 text-[hsl(var(--trust-safe))]" />
              <span className="text-muted-foreground">Proof receipt:</span>
              <code className="px-1.5 py-0.5 rounded bg-muted font-mono">{proofHash}</code>
            </div>
          </div>
        )}

        {/* Custom Content */}
        {children && <div className="p-4 border-b border-border/20">{children}</div>}

        {/* Deny Reason Input */}
        {showDenyInput && (
          <div className="px-4 py-3 border-b border-border/20">
            <textarea
              value={denyReason}
              onChange={(e) => setDenyReason(e.target.value)}
              placeholder="Reason for denial (optional)..."
              className="w-full h-16 bg-muted/30 rounded-lg p-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary/20"
            />
          </div>
        )}

        {/* Actions */}
        <div className="p-4 flex items-center gap-2">
          <Button
            onClick={handleApprove}
            className="flex-1 gap-2"
            variant={requireBiometric && !biometricConfirmed ? "outline" : "default"}
          >
            {requireBiometric && !biometricConfirmed ? (
              <><Fingerprint className="h-4 w-4" /> Biometric Confirm</>
            ) : (
              <><CheckCircle className="h-4 w-4" /> Approve</>
            )}
          </Button>
          <Button onClick={handleDeny} variant="destructive" className="gap-2">
            <XCircle className="h-4 w-4" /> {showDenyInput ? "Confirm Deny" : "Deny"}
          </Button>
          {onEscalate && (
            <Button onClick={onEscalate} variant="outline" size="icon" title="Escalate">
              <AlertTriangle className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Approver Context */}
        {approverContext && (
          <div className="px-4 pb-3">
            <p className="text-[10px] text-muted-foreground">{approverContext}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
