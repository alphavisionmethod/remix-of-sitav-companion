// ═══════════════════════════════════════════════════════════════
// Shared — Degraded State Panel
// Premium empty/degraded state for features not yet live
// ═══════════════════════════════════════════════════════════════

import { AlertTriangle, RefreshCw, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { SurfaceClass } from "@/lib/dual-reality/surface-class-registry";

interface DegradedStatePanelProps {
  degradedReason: string;
  retryAllowed?: boolean;
  demoFallbackAllowed?: boolean;
  nextStep?: string;
  surfaceClass?: SurfaceClass;
  onRetry?: () => void;
  onDemoFallback?: () => void;
}

export function DegradedStatePanel({
  degradedReason,
  retryAllowed = false,
  demoFallbackAllowed = false,
  nextStep,
  surfaceClass = "user_app",
  onRetry,
  onDemoFallback,
}: DegradedStatePanelProps) {
  const isAdmin = surfaceClass === "admin_os";

  return (
    <Card className="border-border/50">
      <CardContent className="py-8 flex flex-col items-center text-center gap-4">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
          <AlertTriangle className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <h3 className="font-medium text-foreground">
            {isAdmin ? "Service Degraded" : "Feature Temporarily Unavailable"}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md">
            {isAdmin ? degradedReason : "We're working on bringing this feature online. Your data is safe."}
          </p>
          {isAdmin && nextStep && (
            <p className="text-xs text-muted-foreground mt-2 font-mono">
              Next: {nextStep}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {retryAllowed && onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry} className="gap-1">
              <RefreshCw className="h-3 w-3" /> Retry
            </Button>
          )}
          {demoFallbackAllowed && onDemoFallback && (
            <Button variant="outline" size="sm" onClick={onDemoFallback} className="gap-1">
              <Play className="h-3 w-3" /> View Demo
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
