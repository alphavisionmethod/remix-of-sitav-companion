// ═══════════════════════════════════════════════════════════════
// SITA OS — AITruthDisclosure (D4 canonical primitive)
// Class: PRIMITIVE — composes StatusBadge + react-router Link.
//
// Single source of truth for AI runtime/trust disclosure across
// AI-facing surfaces. Mirrors the prompt's required modes verbatim:
//
//   live-gateway → "Live · gateway-governed"   (success)
//   degraded     → "Degraded · fallback active" (warning)
//   structural   → "Structurally wired · not behaviorally proven" (neutral)
//   preview      → "Preview · demo data"        (info)
//   archived     → "Archived · not in scope"    (muted)
//
// Use this anywhere AI surfaces need explicit trust labeling instead
// of ad-hoc chips. Composes existing canonical primitives — adds zero
// new component families and zero new color systems.
// ═══════════════════════════════════════════════════════════════
import { Link } from "react-router-dom";
import { StatusBadge, type StatusSize, type StatusTone } from "./StatusBadge";
import { cn } from "@/lib/utils";

export type AITruthMode =
  | "live-gateway"
  | "degraded"
  | "structural"
  | "preview"
  | "archived";

export interface AITruthDisclosureProps {
  mode: AITruthMode;
  /** Optional ISO timestamp — appends "· {rel}" suffix when present. */
  verifiedAt?: string | null;
  /** Optional drilldown route (typically /admin/ai-runtime). */
  to?: string;
  /** Optional override label — defaults to canonical mode label. */
  label?: string;
  size?: StatusSize;
  className?: string;
  ariaLabel?: string;
}

interface ModeSpec {
  label: string;
  tone: StatusTone;
}

const MODE_SPEC: Record<AITruthMode, ModeSpec> = {
  "live-gateway": { label: "Live · gateway-governed", tone: "success" },
  degraded:       { label: "Degraded · fallback active", tone: "warning" },
  structural:     { label: "Structurally wired · not behaviorally proven", tone: "neutral" },
  preview:        { label: "Preview · demo data", tone: "info" },
  archived:       { label: "Archived · not in scope", tone: "muted" },
};

function relTime(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  const ms = Date.now() - t;
  if (ms < 0) return "just now";
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function AITruthDisclosure({
  mode,
  verifiedAt,
  to,
  label,
  size = "sm",
  className,
  ariaLabel,
}: AITruthDisclosureProps) {
  const spec = MODE_SPEC[mode];
  const rel = relTime(verifiedAt);
  const text = label ?? spec.label;
  const composed = rel ? `${text} · ${rel}` : text;
  const aria = ariaLabel ?? `AI status: ${composed}`;

  const badge = (
    <StatusBadge tone={spec.tone} size={size} dot className={cn(className)}>
      <span aria-label={aria}>{composed}</span>
    </StatusBadge>
  );

  if (!to) return badge;
  return (
    <Link
      to={to}
      className="inline-flex items-center hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full"
      aria-label={`${aria} — open AI runtime drilldown`}
    >
      {badge}
    </Link>
  );
}

export default AITruthDisclosure;
