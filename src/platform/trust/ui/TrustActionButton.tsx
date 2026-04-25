// ════════════════════════════════════════════════════════════
// TrustActionButton — declarative trigger for registered Trust
// actions. Pillars use this for the 5 high-value mutations so
// risk tier + approval gating live in one place (the registry),
// not in every call site.
// ════════════════════════════════════════════════════════════

import type { ReactNode } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { TrustBoundary } from "./TrustBoundary";
import {
  getTrustActionPreset,
  type TrustActionKey,
} from "../registry/trust-action-registry";

interface TrustActionButtonProps extends Omit<ButtonProps, "onClick"> {
  action: TrustActionKey;
  payload?: Record<string, unknown>;
  impactSummary?: string;
  onConfirm: (ctx: { receiptId: string; approvalId?: string }) => Promise<void> | void;
  children: ReactNode;
}

export function TrustActionButton({
  action,
  payload,
  impactSummary,
  onConfirm,
  children,
  ...buttonProps
}: TrustActionButtonProps) {
  const preset = getTrustActionPreset(action);
  return (
    <TrustBoundary
      pillar={preset.pillar}
      actionKey={preset.key}
      riskTier={preset.riskTier}
      requireApproval={preset.requireApproval}
      reversible={preset.reversible}
      impactSummary={impactSummary ?? preset.description}
      payload={payload}
      onConfirm={onConfirm}
    >
      {({ run, busy }) => (
        <Button
          {...buttonProps}
          onClick={run}
          disabled={busy || buttonProps.disabled}
        >
          {busy ? "Working…" : children}
        </Button>
      )}
    </TrustBoundary>
  );
}