// ═══════════════════════════════════════════════════════════════
// SITA OS — MobileCapabilityBanner
//
// Honest in-product banner that surfaces gaps for mobile features
// classified as `partial` or `deferred` in the truth registry.
// Renders nothing for `live` / `responsive-only` / unknown features.
// ═══════════════════════════════════════════════════════════════

import { AlertTriangle, Clock, Info } from "lucide-react";
import {
  getMobileCapability,
  type MobileCapabilityClass,
} from "@/platform/architecture/mobile-feature-truth-registry";

interface MobileCapabilityBannerProps {
  featureKey: string;
  className?: string;
}

const variantByClass: Record<
  MobileCapabilityClass,
  { icon: typeof Info; tone: string; label: string } | null
> = {
  live: null,
  "responsive-only": null,
  partial: {
    icon: AlertTriangle,
    tone: "border-amber-400/40 bg-amber-500/5 text-amber-100",
    label: "Partial mobile experience",
  },
  deferred: {
    icon: Clock,
    tone: "border-sky-400/40 bg-sky-500/5 text-sky-100",
    label: "Coming soon on mobile",
  },
  mock: {
    icon: Info,
    tone: "border-muted bg-muted/30 text-muted-foreground",
    label: "Preview only",
  },
};

export function MobileCapabilityBanner({ featureKey, className }: MobileCapabilityBannerProps) {
  const entry = getMobileCapability(featureKey);
  if (!entry) return null;
  const variant = variantByClass[entry.classification];
  if (!variant) return null;
  const Icon = variant.icon;
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-xs ${variant.tone} ${className ?? ""}`}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <div className="flex-1">
        <div className="font-medium">{variant.label}</div>
        {entry.gaps.length > 0 && (
          <ul className="mt-1 list-disc space-y-0.5 pl-4 opacity-90">
            {entry.gaps.map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
