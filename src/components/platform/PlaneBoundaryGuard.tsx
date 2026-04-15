import { ReactNode } from "react";
import { useCurrentPlane } from "@/hooks/useCurrentPlane";
import { useRequireAdminPermission } from "@/hooks/useRequireAdminPermission";
import { Badge } from "@/components/ui/badge";
import { Shield, Monitor, Server, Layers } from "lucide-react";
import type { PlaneKey } from "@/lib/platform-plane";

interface PlaneBoundaryGuardProps {
  children: ReactNode;
  requiredPlane?: PlaneKey;
  requiredPermission?: string;
  showPlaneBadge?: boolean;
}

const PLANE_INFO: Record<PlaneKey, { label: string; icon: any; color: string }> = {
  control: { label: "Control Plane", icon: Shield, color: "text-purple-400 bg-purple-500/10 border-purple-500/30" },
  product: { label: "Product Plane", icon: Monitor, color: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
  "shared-core": { label: "Shared Core", icon: Server, color: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
  "internal-execution": { label: "Internal Execution", icon: Layers, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
};

export function PlaneBoundaryGuard({
  children,
  requiredPlane,
  requiredPermission,
  showPlaneBadge = true,
}: PlaneBoundaryGuardProps) {
  const currentPlane = useCurrentPlane();
  const { hasPermission, loading } = useRequireAdminPermission(requiredPermission || "audit.view");

  const effectivePlane = requiredPlane || currentPlane;
  const info = PLANE_INFO[effectivePlane];
  const Icon = info.icon;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (requiredPermission && !hasPermission) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-3 text-center">
          <Layers className="h-8 w-8 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">Access Restricted</h3>
          <p className="text-xs text-muted-foreground max-w-xs">
            This section requires{" "}
            <code className="text-[10px] bg-muted px-1 py-0.5 rounded">{requiredPermission}</code>{" "}
            permission in the {info.label}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {showPlaneBadge && (
        <div className="mb-3">
          <Badge variant="outline" className={`text-[9px] ${info.color}`}>
            <Icon className="h-2.5 w-2.5 mr-1" />
            {info.label}
          </Badge>
        </div>
      )}
      {children}
    </div>
  );
}
