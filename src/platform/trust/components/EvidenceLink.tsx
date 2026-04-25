// ═══════════════════════════════════════════════════════════════
// SITA OS — EvidenceLink (Wave 1.1 canonical home)
// Class: PRIMITIVE — composes shadcn Button (asChild) + react-router Link.
//
// Canonical drilldown affordance for routing operators from a
// summary card to the underlying canonical evidence (receipt,
// ledger row, approval, proof bundle, integration page, etc.).
//
// Previously at src/components/primitives/actions/EvidenceLink.tsx.
// That path now contains a deprecated re-export shim.
// ═══════════════════════════════════════════════════════════════
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { Receipt, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type EvidenceKind =
  | "receipt"
  | "ledger"
  | "approval"
  | "proof-bundle"
  | "integration"
  | "fallback-event"
  | "external";

export interface EvidenceLinkProps {
  /** Where the evidence lives. Internal route OR absolute URL. */
  to: string;
  /** Visible label (operator-grade, no hype). */
  label: string;
  /** Logical kind — drives default icon and ARIA. */
  kind?: EvidenceKind;
  /** Optional icon override. */
  icon?: LucideIcon;
  /** Visual size. Defaults to "sm". */
  size?: "sm" | "default";
  /** Visual variant. Defaults to "ghost". */
  variant?: "ghost" | "outline" | "link";
  /** Open in new tab — only for absolute URLs. */
  external?: boolean;
  className?: string;
}

const KIND_ICON: Record<EvidenceKind, LucideIcon> = {
  receipt: Receipt,
  ledger: Receipt,
  approval: Receipt,
  "proof-bundle": Receipt,
  integration: ExternalLink,
  "fallback-event": Receipt,
  external: ExternalLink,
};

function isAbsolute(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

export function EvidenceLink({
  to,
  label,
  kind = "receipt",
  icon,
  size = "sm",
  variant = "ghost",
  external,
  className,
}: EvidenceLinkProps) {
  const Icon = icon ?? KIND_ICON[kind];
  const aria = `Open ${kind.replace(/-/g, " ")}: ${label}`;
  const useExternal = external ?? isAbsolute(to);

  if (useExternal) {
    return (
      <Button asChild variant={variant} size={size} className={cn(className)}>
        <a href={to} target="_blank" rel="noreferrer noopener" aria-label={aria}>
          <Icon className="h-3.5 w-3.5" />
          <span>{label}</span>
        </a>
      </Button>
    );
  }

  return (
    <Button asChild variant={variant} size={size} className={cn(className)}>
      <Link to={to} aria-label={aria}>
        <Icon className="h-3.5 w-3.5" />
        <span>{label}</span>
      </Link>
    </Button>
  );
}

export default EvidenceLink;