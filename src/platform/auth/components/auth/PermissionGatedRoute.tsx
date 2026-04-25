import { ReactNode } from "react";
import { useRequireAdminPermission } from "@/hooks/useRequireAdminPermission";

interface PermissionGatedRouteProps {
  children: ReactNode;
  permission: string;
}

/**
 * Wraps a page component with a granular permission check.
 * Shows a loading spinner while checking, then either renders children
 * or an insufficient-permission message.
 */
export function PermissionGatedRoute({ children, permission }: PermissionGatedRouteProps) {
  const { hasPermission, loading } = useRequireAdminPermission(permission);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!hasPermission) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
            <span className="text-lg">🚫</span>
          </div>
          <h3 className="text-sm font-semibold text-foreground">Permission Required</h3>
          <p className="text-xs text-muted-foreground max-w-xs">
            You need <code className="text-[10px] bg-muted px-1 py-0.5 rounded">{permission}</code> to view this page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
