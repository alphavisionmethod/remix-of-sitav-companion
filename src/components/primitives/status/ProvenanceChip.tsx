// ═══════════════════════════════════════════════════════════════
// SITA OS — ProvenanceChip
// Class: PRIMITIVE — composes StatusBadge + react-router Link.
//
// One-line "source · last verified" chip with optional drilldown.
// Use to make the truth-source of a card or summary visible to the
// operator without inventing a new color/system.
//
// Examples:
//   <ProvenanceChip source="ai_inference_receipts" verifiedAt={ts} />
//   <ProvenanceChip source="OAuth gateway" tone="success" verifiedAt={ts}
//                   to="/admin/integrations" />
// ═══════════════════════════════════════════════════════════════
import { Link } from "react-router-dom";
import { StatusBadge, type StatusTone, type StatusSize } from "./StatusBadge";
import { cn } from "@/lib/utils";

export interface ProvenanceChipProps {
  /** Canonical source label (table, system, or proof bundle). */
  source: string;
  /** Optional ISO timestamp for "verified <relative>" suffix. */
  verifiedAt?: string | null;
  /** Optional tone — defaults to neutral (no overclaim). */
  tone?: StatusTone;
  size?: StatusSize;
  /** Optional drilldown route. When set, chip becomes a Link. */
  to?: string;
  /** Optional ARIA label override (defaults to "Provenance: …"). */
  ariaLabel?: string;
  className?: string;
}

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

export function ProvenanceChip({
  source,
  verifiedAt,
  tone = "neutral",
  size = "xs",
  to,
  ariaLabel,
  className,
}: ProvenanceChipProps) {
  const rel = relTime(verifiedAt);
  const label = rel ? `${source} · ${rel}` : source;
  const aria = ariaLabel ?? `Provenance: ${label}`;
  const badge = (
    <StatusBadge tone={tone} size={size} className={cn(className)}>
      <span aria-label={aria}>{label}</span>
    </StatusBadge>
  );
  if (!to) return badge;
  return (
    <Link
      to={to}
      className="inline-flex items-center hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full"
      aria-label={`${aria} — open drilldown`}
    >
      {badge}
    </Link>
  );
}

export default ProvenanceChip;
