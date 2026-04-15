import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { adminRbacEngine } from "@/lib/platform-plane";

/**
 * Hook for granular admin permission checks.
 * Returns whether the current user has a specific permission.
 */
export function useRequireAdminPermission(permission: string) {
  const { user, loading: authLoading, isDemo } = useAuth();
  const [hasPermission, setHasPermission] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (authLoading || !user) {
      setHasPermission(false);
      setChecking(false);
      return;
    }

    if (isDemo) {
      setHasPermission(true);
      setChecking(false);
      return;
    }

    adminRbacEngine
      .hasPermission(user.id, permission)
      .then(setHasPermission)
      .catch(() => setHasPermission(false))
      .finally(() => setChecking(false));
  }, [user, authLoading, isDemo, permission]);

  return { hasPermission, loading: authLoading || checking };
}
