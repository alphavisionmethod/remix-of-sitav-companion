import { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";
import { TrustRibbon } from "@/components/sita/admin/TrustRibbon";
import { RolloutStatusBanner } from "./RolloutStatusBanner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2, AlertTriangle } from "lucide-react";

interface AdminShellProps {
  children: ReactNode;
  activePath?: string;
  contextScope?: string;
  layoutMode?: "default" | "dense" | "comfortable";
  showDegradedBanner?: boolean;
  degradedMessage?: string;
}

export function AdminShell({
  children,
  activePath,
  contextScope,
  layoutMode: initialLayout = "default",
  showDegradedBanner = false,
  degradedMessage,
}: AdminShellProps) {
  const [density, setDensity] = useState(initialLayout);

  const densityClass = {
    default: "space-y-4",
    dense: "space-y-2",
    comfortable: "space-y-6",
  }[density];

  return (
    <div className="min-h-screen bg-background">
      {/* Global degraded-state banner */}
      {showDegradedBanner && (
        <div className="bg-destructive/5 border-b border-destructive/20 px-4 py-2 flex items-center gap-2 text-[11px] text-destructive">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          <span className="font-medium">{degradedMessage || "Some platform services are operating in degraded mode. Truth state may be incomplete."}</span>
        </div>
      )}

      {/* Admin utility bar */}
      <div className="border-b border-border/50 px-6 py-2 flex items-center justify-between bg-card/30">
        <div className="flex items-center gap-3">
          <TrustRibbon />
        </div>
        <div className="flex items-center gap-2">
          {contextScope && (
            <Badge variant="outline" className="text-[9px] h-5">{contextScope}</Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-[10px] px-2"
            onClick={() => setDensity(d => d === "dense" ? "comfortable" : d === "comfortable" ? "default" : "dense")}
          >
            {density === "dense" ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
            <span className="ml-1 capitalize">{density}</span>
          </Button>
        </div>
      </div>

      {/* Rollout banner */}
      <div className="px-6 pt-3">
        <RolloutStatusBanner />
      </div>

      {/* Content area */}
      <div className={cn("px-6 pb-6 pt-3", densityClass)}>
        {children}
      </div>
    </div>
  );
}
