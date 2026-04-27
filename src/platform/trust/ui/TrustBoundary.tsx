// ════════════════════════════════════════════════════════════
// TrustBoundary — wraps a critical button so it always emits
// a Trust receipt (and optionally requires approval) before the
// underlying onConfirm runs. Pillars use this to avoid duplicating
// the receipt + approval dance on every action.
// ════════════════════════════════════════════════════════════

import { useState, type ReactNode } from "react";
import { useTrustEmit } from "@/platform/trust/hooks/use-trust-emit";
import type { RiskTier, TrustPillarId } from "@/platform/trust";

interface TrustBoundaryProps {
  pillar: TrustPillarId;
  actionKey: string;
  riskTier?: RiskTier;
  /** When true, an approval row is opened first (status: pending). */
  requireApproval?: boolean;
  reversible?: boolean;
  /** Free-form summary persisted with the receipt. */
  impactSummary?: string;
  /** Free-form payload persisted with the receipt. */
  payload?: Record<string, unknown>;
  /** Called only after the receipt (and optional approval) succeeds. */
  onConfirm: (ctx: { receiptId: string; approvalId?: string }) => Promise<void> | void;
  /** Render the trigger; receives the wrapped click handler + busy state. */
  children: (api: { run: () => void; busy: boolean }) => ReactNode;
}

export function TrustBoundary({
  pillar,
  actionKey,
  riskTier = "medium",
  requireApproval = false,
  reversible = true,
  impactSummary,
  payload,
  onConfirm,
  children,
}: TrustBoundaryProps) {
  const { receipt, approval } = useTrustEmit();
  const [busy, setBusy] = useState(false);

  const run = async () => {
    if (busy) return;
    setBusy(true);
    try {
      let approvalId: string | undefined;
      if (requireApproval) {
        const a = await approval({
          actionKey,
          pillar,
          justification: impactSummary ?? `Trust-gated: ${actionKey}`,
          impactSummary,
          riskTier,
          payload,
        });
        approvalId = a.id;
      }
      const r = await receipt({
        actionKey,
        pillar,
        payload: payload ?? {},
        reversible,
        riskTier,
      });
      await onConfirm({ receiptId: r.id, approvalId });
    } finally {
      setBusy(false);
    }
  };

  return <>{children({ run, busy })}</>;
}
