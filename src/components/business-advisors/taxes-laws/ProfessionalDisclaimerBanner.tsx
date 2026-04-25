// ═══════════════════════════════════════════════════════════════
// SITA OS — Taxes & Laws Advisor: Persistent Professional Disclaimer
//
// Required by L1-suggest authority. This banner MUST stay visible on
// every Taxes & Laws surface (header, recommendations, simulation,
// detail drawer, mobile panels) so the operator never sees an output
// without the reminder that this is preparation/issue-spotting only,
// not a substitute for a licensed tax or legal professional.
//
// Usage: <ProfessionalDisclaimerBanner /> at the top of each surface.
// Variants:
//   - default  → full Alert with title + body (page surfaces)
//   - compact  → single-line muted strip (drawer, mobile cards)
//   - inline   → small badge + tooltip (inline next to outputs)
// ═══════════════════════════════════════════════════════════════

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Scale } from "lucide-react";

type Variant = "default" | "compact" | "inline";

const FULL_BODY =
  "The Taxes & Laws Advisor provides preparation, structure, and issue-spotting only. " +
  "Every output is a starting point — confirm with a licensed tax professional or attorney " +
  "before filing, signing, paying, or relying on it. Outputs are never legal or tax advice.";

const COMPACT_BODY =
  "Preparation & issue-spotting only — not a substitute for a licensed tax professional or attorney.";

export function ProfessionalDisclaimerBanner({ variant = "default" }: { variant?: Variant }) {
  if (variant === "compact") {
    return (
      <p
        role="note"
        aria-label="Professional disclaimer"
        className="text-[11px] text-muted-foreground border border-dashed border-border/70 rounded-md px-2 py-1 flex items-start gap-1.5 bg-muted/20"
      >
        <Scale className="h-3 w-3 shrink-0 mt-0.5" />
        <span>{COMPACT_BODY}</span>
      </p>
    );
  }

  if (variant === "inline") {
    return (
      <span
        role="note"
        aria-label="Professional disclaimer"
        className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground border border-border/60 rounded px-1.5 py-0.5"
        title={FULL_BODY}
      >
        <Scale className="h-3 w-3" /> Preparation only · not legal/tax advice
      </span>
    );
  }

  return (
    <Alert role="note" aria-label="Professional disclaimer">
      <Scale className="h-4 w-4" />
      <AlertTitle className="text-sm">Preparation & issue-spotting only</AlertTitle>
      <AlertDescription className="text-xs mt-1">{FULL_BODY}</AlertDescription>
    </Alert>
  );
}

export const TAXES_LAWS_DISCLAIMER_TEXT = FULL_BODY;