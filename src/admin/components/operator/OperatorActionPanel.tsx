// ═══════════════════════════════════════════════════════════════
// SITA OS — OperatorActionPanel (Wave 1.1 canonical home)
// Canonical action-panel primitive for admin boards.
//
// Enforces the canonical action ordering at the type level:
//   1. primary       — the principal next action
//   2. remediation   — only when the board is degraded / failing
//   3. next          — suggested onward navigation
//   4. related       — lateral inspection
//   5. evidence      — drilldown to receipts / proof bundles
//
// Class: PRIMITIVE. Composes only @/components/ui/button + @/lib/utils.
//
// Previously at src/components/primitives/actions/OperatorActionPanel.tsx.
// That path now contains a deprecated re-export shim.
// ═══════════════════════════════════════════════════════════════
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { MouseEventHandler, ReactNode } from "react";

export interface OperatorAction {
  /** Human-readable label (operator-grade). */
  label: string;
  /** Optional Lucide icon. */
  icon?: LucideIcon;
  /** Click handler. Either this or `href` should be provided. */
  onClick?: MouseEventHandler<HTMLButtonElement>;
  /** Optional internal route. When set, render as a child-asChild Link. */
  href?: string;
  /** Optional element (e.g. wrapping <Link>) — overrides default rendering. */
  asChild?: ReactNode;
  /** Disabled state. */
  disabled?: boolean;
}

export interface OperatorActionPanelProps {
  primary?: OperatorAction;
  remediation?: OperatorAction;
  next?: OperatorAction[];
  related?: OperatorAction[];
  evidence?: OperatorAction[];
  /** Optional className passthrough. */
  className?: string;
  /** Optional ARIA label for the panel (defaults to "Operator actions"). */
  ariaLabel?: string;
}

function renderAction(
  action: OperatorAction,
  variant: "default" | "destructive" | "outline" | "ghost",
  size: "sm" | "default" = "sm",
) {
  if (action.asChild) {
    return action.asChild;
  }
  const Icon = action.icon;
  return (
    <Button
      variant={variant}
      size={size}
      onClick={action.onClick}
      disabled={action.disabled}
      type="button"
    >
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {action.label}
    </Button>
  );
}

export function OperatorActionPanel({
  primary,
  remediation,
  next,
  related,
  evidence,
  className,
  ariaLabel = "Operator actions",
}: OperatorActionPanelProps) {
  const hasAny =
    primary ||
    remediation ||
    (next && next.length > 0) ||
    (related && related.length > 0) ||
    (evidence && evidence.length > 0);
  if (!hasAny) return null;
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn(
        "flex flex-wrap items-center gap-2 pt-2",
        className,
      )}
    >
      {primary && (
        <span data-action-slot="primary">
          {renderAction(primary, "default")}
        </span>
      )}
      {remediation && (
        <span data-action-slot="remediation">
          {renderAction(remediation, "destructive")}
        </span>
      )}
      {next?.map((a, i) => (
        <span data-action-slot="next" key={`next-${i}-${a.label}`}>
          {renderAction(a, "outline")}
        </span>
      ))}
      {related?.map((a, i) => (
        <span data-action-slot="related" key={`related-${i}-${a.label}`}>
          {renderAction(a, "ghost")}
        </span>
      ))}
      {evidence?.map((a, i) => (
        <span data-action-slot="evidence" key={`evidence-${i}-${a.label}`}>
          {renderAction(a, "ghost")}
        </span>
      ))}
    </div>
  );
}

export default OperatorActionPanel;