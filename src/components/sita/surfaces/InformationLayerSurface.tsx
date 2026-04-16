// ═══════════════════════════════════════════════════════════════
// SITA OS — Information Layer Surface
// 3-layer progressive disclosure wrapper
// ═══════════════════════════════════════════════════════════════

import { ReactNode, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, Layers } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type LayerLevel = 1 | 2 | 3;

interface InformationLayerSurfaceProps {
  /** Layer 1: title, state, importance, top metrics, main actions (always visible) */
  summary: ReactNode;
  /** Layer 2: sub-status, signals, recent changes, confidence (expandable) */
  detail?: ReactNode;
  /** Layer 3: logs, history, provenance, receipts, raw details (drill-down) */
  deep?: ReactNode;
  /** Initial expanded layer (default: 1) */
  defaultLayer?: LayerLevel;
  /** Label for layer 2 toggle */
  detailLabel?: string;
  /** Label for layer 3 toggle */
  deepLabel?: string;
  className?: string;
}

export function InformationLayerSurface({
  summary,
  detail,
  deep,
  defaultLayer = 1,
  detailLabel = "More details",
  deepLabel = "Deep inspection",
  className,
}: InformationLayerSurfaceProps) {
  const [expandedLayer, setExpandedLayer] = useState<LayerLevel>(defaultLayer);
  const prefersReducedMotion = useReducedMotion();

  const toggleLayer = useCallback((target: LayerLevel) => {
    setExpandedLayer(prev => (prev >= target ? (target - 1 || 1) as LayerLevel : target));
  }, []);

  const transitionClass = prefersReducedMotion ? "" : "transition-all duration-200";

  return (
    <div className={cn("space-y-0", className)} role="region" aria-label="Information layers">
      {/* Layer 1: Summary — always visible */}
      <div aria-label="Summary" className="relative">
        {summary}
      </div>

      {/* Layer 2: Detail — expandable */}
      {detail && (
        <>
          <button
            onClick={() => toggleLayer(2)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground w-full transition-colors"
            aria-expanded={expandedLayer >= 2}
            aria-controls="info-layer-2"
          >
            {expandedLayer >= 2 ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            <Layers className="h-3 w-3" />
            {detailLabel}
          </button>
          <div
            id="info-layer-2"
            className={cn(
              "overflow-hidden",
              transitionClass,
              expandedLayer >= 2 ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
            )}
            role="region"
            aria-label="Detail layer"
          >
            <div className="border-t border-border/30 pt-3">
              {detail}
            </div>
          </div>
        </>
      )}

      {/* Layer 3: Deep — drill-down */}
      {deep && expandedLayer >= 2 && (
        <>
          <button
            onClick={() => toggleLayer(3)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground w-full transition-colors"
            aria-expanded={expandedLayer >= 3}
            aria-controls="info-layer-3"
          >
            {expandedLayer >= 3 ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            <Layers className="h-3 w-3" />
            {deepLabel}
          </button>
          <div
            id="info-layer-3"
            className={cn(
              "overflow-hidden",
              transitionClass,
              expandedLayer >= 3 ? "max-h-[4000px] opacity-100" : "max-h-0 opacity-0"
            )}
            role="region"
            aria-label="Deep inspection layer"
          >
            <div className="border-t border-border/30 pt-3">
              {deep}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
