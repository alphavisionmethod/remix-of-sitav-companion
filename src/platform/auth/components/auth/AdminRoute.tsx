import { useRequireAdmin } from "@/platform/auth/hooks/useRequireAdmin";
import { useRequireAdminPermission } from "@/platform/auth/hooks/useRequireAdminPermission";
import { ReactNode } from "react";

interface AdminRouteProps {
  children: ReactNode;
  requiredPermission?: string;
}

export function AdminRoute({ children, requiredPermission }: AdminRouteProps) {
  const { isAdmin, loading: adminLoading } = useRequireAdmin();
  const { hasPermission, loading: permLoading } = useRequireAdminPermission(
    requiredPermission || "audit.view" // fallback — any admin has at least this
  );

  const loading = adminLoading || (requiredPermission ? permLoading : false);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-[13px] text-muted-foreground">Verifying access…</span>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  if (requiredPermission && !hasPermission) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <span className="text-xl">🚫</span>
          </div>
          <h2 className="text-lg font-semibold text-foreground">Insufficient Permissions</h2>
          <p className="text-sm text-muted-foreground max-w-xs">
            You need the <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{requiredPermission}</code> permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
