import { ReactNode } from "react";
import { useCurrentPlane } from "@/hooks/useCurrentPlane";
import { useRequireAdminPermission } from "@/platform/auth/hooks/useRequireAdminPermission";
import { Badge } from "@/components/ui/badge";
import { Shield, Monitor, Server, Layers, Cpu, Terminal } from "lucide-react";
import type { PlaneKey } from "@/lib/platform-plane";
import {
  CANONICAL_PLANES,
  resolvePlane,
  type CanonicalPlaneKey,
  type PlaneKeyAny,
} from "@/platform/architecture/plane-registry";

interface PlaneBoundaryGuardProps {
  children: ReactNode;
  requiredPlane?: PlaneKeyAny;
  requiredPermission?: string;
  showPlaneBadge?: boolean;
}

const PLANE_ICON: Record<CanonicalPlaneKey, any> = {
  "core-os": Cpu,
  "shell-runtime": Terminal,
  user: Monitor,
  admin: Shield,
  "backend-services": Server,
};

// Legacy 4-key view — preserved for rendering only via shim resolution.
const PLANE_INFO: Record<PlaneKey, { label: string; icon: any; color: string }> = {
  control: { label: "Admin Control Plane", icon: Shield, color: CANONICAL_PLANES.admin.badgeClass },
  product: { label: "User Product Plane", icon: Monitor, color: CANONICAL_PLANES.user.badgeClass },
  "shared-core": { label: "Backend Services", icon: Server, color: CANONICAL_PLANES["backend-services"].badgeClass },
  "internal-execution": { label: "Admin Control Plane", icon: Layers, color: CANONICAL_PLANES.admin.badgeClass },
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
  // Resolve via canonical registry — accepts both legacy and canonical keys.
  const canonicalKey = resolvePlane(effectivePlane as PlaneKeyAny);
  const canonical = CANONICAL_PLANES[canonicalKey];
  const info = {
    label: canonical.label,
    color: canonical.badgeClass,
    icon: PLANE_ICON[canonicalKey] ?? Layers,
  };
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
