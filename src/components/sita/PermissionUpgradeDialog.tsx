// ═══════════════════════════════════════════════════════════════
// SITA OS — Permission Upgrade Dialog
// User-facing scope upgrade request flow
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpCircle, Shield, AlertTriangle, CheckCircle } from "lucide-react";
import { fromDynamicTable } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { GenericScopeTier } from "@/lib/services/provider-family/types";

interface PermissionUpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  capabilityKey: string;
  displayName: string;
  currentTier: GenericScopeTier;
  requestedTier: GenericScopeTier;
  currentScopes: string[];
  additionalScopes: string[];
  providerFamilyId: string | null;
}

const TIER_ORDER: GenericScopeTier[] = ["minimal", "read_only", "read_write", "elevated", "full"];

const TIER_LABELS: Record<GenericScopeTier, { label: string; description: string }> = {
  minimal: { label: "Minimal", description: "Metadata only — no content access" },
  read_only: { label: "Read Only", description: "Can read data but not modify" },
  read_write: { label: "Read & Write", description: "Can read and create/edit data" },
  elevated: { label: "Elevated", description: "Full service access including deletions" },
  full: { label: "Full Access", description: "Complete unrestricted access" },
};

export function PermissionUpgradeDialog({
  open, onOpenChange,
  capabilityKey, displayName,
  currentTier, requestedTier,
  currentScopes, additionalScopes,
  providerFamilyId,
}: PermissionUpgradeDialogProps) {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const currentIdx = TIER_ORDER.indexOf(currentTier);
  const requestedIdx = TIER_ORDER.indexOf(requestedTier);
  const isUpgrade = requestedIdx > currentIdx;

  const handleSubmit = async () => {
    if (!user?.id) return;
    setSubmitting(true);
    try {
      // Insert permission upgrade request
      const { error: reqError } = await fromDynamicTable("permission_upgrade_requests").insert({
        user_id: user.id,
        capability_key: capabilityKey,
        current_tier: currentTier,
        requested_tier: requestedTier,
        current_scopes: currentScopes,
        requested_scopes: [...currentScopes, ...additionalScopes],
        status: "pending",
        provider_family_id: providerFamilyId,
      });

      if (reqError) throw reqError;

      // Log to consent ledger
      await fromDynamicTable("consent_ledger").insert({
        user_id: user.id,
        action_type: "upgrade_requested",
        capability_key: capabilityKey,
        scopes_granted: additionalScopes,
        provider_family_id: providerFamilyId,
        mode: "real",
      });

      toast.success("Permission upgrade requested", {
        description: `${displayName} upgrade from ${TIER_LABELS[currentTier].label} to ${TIER_LABELS[requestedTier].label}`,
      });
      onOpenChange(false);
    } catch (err) {
      toast.error("Failed to submit upgrade request");
      console.error("Permission upgrade error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowUpCircle className="h-5 w-5 text-primary" />
            Permission Upgrade
          </DialogTitle>
          <DialogDescription>
            Request elevated access for <strong>{displayName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current → Requested tier visual */}
          <div className="flex items-center justify-center gap-3">
            <div className="text-center p-3 rounded-lg bg-muted/20 border border-border min-w-[100px]">
              <p className="text-xs text-muted-foreground">Current</p>
              <p className="text-sm font-medium mt-1">{TIER_LABELS[currentTier].label}</p>
            </div>
            <ArrowUpCircle className={`h-5 w-5 ${isUpgrade ? "text-primary" : "text-muted-foreground"}`} />
            <div className="text-center p-3 rounded-lg bg-primary/5 border border-primary/20 min-w-[100px]">
              <p className="text-xs text-primary">Requested</p>
              <p className="text-sm font-medium mt-1">{TIER_LABELS[requestedTier].label}</p>
            </div>
          </div>

          {/* Scope diff */}
          {additionalScopes.length > 0 && (
            <div className="rounded-lg bg-muted/10 border border-border p-3">
              <p className="text-xs font-medium text-foreground mb-2">Additional scopes requested:</p>
              <div className="space-y-1">
                {additionalScopes.map((scope) => (
                  <div key={scope} className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-primary shrink-0" />
                    <code className="text-xs text-muted-foreground break-all">{scope}</code>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security notice */}
          <div className="rounded-lg bg-yellow-500/5 border border-yellow-500/10 p-3 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-yellow-400 font-medium">Permission upgrade notice</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Upgraded permissions allow SITA to access more of your data. You can revoke at any time from Connected Accounts.
              </p>
            </div>
          </div>

          {/* Consent acknowledgment */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/5">
            <Shield className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              This request will be logged in your consent ledger. Identity authentication is never affected by connector permission changes.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || !isUpgrade}>
            {submitting ? "Requesting..." : "Request Upgrade"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
