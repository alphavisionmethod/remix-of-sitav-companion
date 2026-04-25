import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { ConfidenceBand, ProvenanceKind, Sensitivity } from "./memory-service";

interface Props {
  provenanceKind: ProvenanceKind;
  confidenceBand: ConfidenceBand;
  sensitivity?: Sensitivity;
  lastUsedAt?: string | null;
}

const KIND_LABEL: Record<ProvenanceKind, string> = {
  explicit_user: "you said",
  inferred_chat: "from chat",
  inferred_file: "from file",
  inferred_behavior: "behavior",
  system_seed: "seeded",
};

const BAND_VARIANT: Record<ConfidenceBand, "default" | "secondary" | "outline" | "destructive"> = {
  verified: "default",
  high: "secondary",
  medium: "outline",
  low: "outline",
};

export function MemoryProvenanceBadge({ provenanceKind, confidenceBand, sensitivity, lastUsedAt }: Props) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={BAND_VARIANT[confidenceBand]} className="gap-1 text-[10px] uppercase tracking-wide">
            <span>{KIND_LABEL[provenanceKind]}</span>
            <span className="opacity-60">·</span>
            <span>{confidenceBand}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="text-xs space-y-0.5">
          <div><span className="text-muted-foreground">Source:</span> {KIND_LABEL[provenanceKind]}</div>
          <div><span className="text-muted-foreground">Confidence:</span> {confidenceBand}</div>
          {sensitivity && (
            <div><span className="text-muted-foreground">Sensitivity:</span> {sensitivity}</div>
          )}
          {lastUsedAt && (
            <div><span className="text-muted-foreground">Last used:</span> {new Date(lastUsedAt).toLocaleString()}</div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}