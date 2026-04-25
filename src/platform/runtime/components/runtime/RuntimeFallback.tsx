import { Info } from "lucide-react";
import { useFeatureRuntimeTier, useRuntimeTier } from "@/runtimes/runtime-context";
import { getFeatureRuntimeTier } from "@/runtimes/feature-runtime-tier-registry";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RuntimeFallbackProps {
  featureId: string;
  /** Optional override of the user-facing message. */
  message?: string;
  compact?: boolean;
}

/**
 * <RuntimeFallback> — explains why a feature is unavailable in the current tier.
 *
 * Renders nothing when the feature *is* fully supported. Otherwise shows an
 * honest, premium degradation surface with the registered fallback hint.
 */
export function RuntimeFallback({ featureId, message, compact = false }: RuntimeFallbackProps) {
  const tier = useRuntimeTier();
  const status = useFeatureRuntimeTier(featureId);
  const feature = getFeatureRuntimeTier(featureId);

  if (status === "supported") return null;

  const label =
    status === "prohibited"
      ? "Unavailable on this runtime"
      : status === "fallback"
      ? "Running in fallback mode"
      : status === "simulated"
      ? "Simulated on this runtime"
      : status === "roadmap"
      ? "Coming to this runtime"
      : "Limited here";

  const fallbackMessage = message ?? feature?.fallback ?? "This feature behaves differently on this runtime.";

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Info className="h-3 w-3" />
        <Badge variant="outline" className="text-[10px]">{label}</Badge>
        <span>{fallbackMessage}</span>
      </div>
    );
  }

  return (
    <Card className="border-border/50 bg-muted/20">
      <CardContent className="py-4 flex items-start gap-3">
        <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              {feature?.name ?? featureId}
            </span>
            <Badge variant="outline" className="text-[10px]">{label}</Badge>
            <Badge variant="outline" className="text-[10px] font-mono">{tier}</Badge>
          </div>
          <p className="text-xs text-muted-foreground">{fallbackMessage}</p>
        </div>
      </CardContent>
    </Card>
  );
}
