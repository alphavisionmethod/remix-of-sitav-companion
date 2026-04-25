// ═══════════════════════════════════════════════════════════════
// SITA OS — SemanticContextBadge
// Tiny inline badge that surfaces how a piece of context was
// retrieved by the orchestrator (semantic / fulltext / recency).
// Class: PRIMITIVE.
// ═══════════════════════════════════════════════════════════════
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sparkles, Search, Clock, Mic, Network } from "lucide-react";

export type RetrievalKind = "semantic" | "fulltext" | "recency" | "voice" | "manual" | "federated";

export interface SemanticContextBadgeProps {
  kind: RetrievalKind;
  similarity?: number | null;
  label?: string;
  className?: string;
}

const KIND_CONFIG: Record<RetrievalKind, { label: string; icon: React.ReactNode; variant: "default" | "secondary" | "outline" }> = {
  semantic: { label: "Semantic", icon: <Sparkles className="h-3 w-3" />, variant: "default" },
  fulltext: { label: "Full-text", icon: <Search className="h-3 w-3" />, variant: "secondary" },
  recency: { label: "Recent", icon: <Clock className="h-3 w-3" />, variant: "outline" },
  voice: { label: "Voice", icon: <Mic className="h-3 w-3" />, variant: "secondary" },
  manual: { label: "Manual", icon: null, variant: "outline" },
  federated: { label: "Federated", icon: <Network className="h-3 w-3" />, variant: "default" },
};

export function SemanticContextBadge({ kind, similarity, label, className }: SemanticContextBadgeProps) {
  const cfg = KIND_CONFIG[kind] ?? KIND_CONFIG.manual;
  const pct = typeof similarity === "number" && similarity > 0
    ? `${Math.round(similarity * 100)}%`
    : null;
  const text = label ?? cfg.label;
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={cfg.variant} className={`gap-1 px-1.5 py-0 text-[10px] font-medium ${className ?? ""}`}>
            {cfg.icon}
            <span>{text}</span>
            {pct && <span className="opacity-70">· {pct}</span>}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="text-xs">
            Retrieval: <span className="font-medium">{cfg.label}</span>
            {pct && <> · cosine similarity {pct}</>}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
