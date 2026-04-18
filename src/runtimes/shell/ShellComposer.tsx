import { ReactNode, useMemo } from "react";
import { Navigate, useLocation } from "react-router-dom";
import {
  getDeploymentProfile,
  getDefaultShellHome,
} from "@/lib/runtime/deployment-profile";
import { resolveRoutePlane } from "@/lib/architecture/route-plane-map";

/**
 * ShellComposer
 * --------------
 * Thin runtime selector for "which shell home does the user land on?".
 *
 *   - Reads active deployment profile (user vs operator)
 *   - On `/` it redirects to the profile's `defaultShellHome`
 *   - Wraps children with profile context for downstream components
 *
 * IMPORTANT: This does NOT replace the user shell or AdminControlPlaneShell —
 * it just picks which one the route lands in by default. Both shells stay
 * canonical.
 */
export function ShellComposer({ children }: { children: ReactNode }) {
  const profile = getDeploymentProfile();
  const location = useLocation();

  const redirectTo = useMemo(() => {
    if (location.pathname !== "/" && location.pathname !== "") return null;
    return getDefaultShellHome();
  }, [location.pathname]);

  if (redirectTo && redirectTo !== location.pathname) {
    return <Navigate to={redirectTo} replace />;
  }

  // Tag the document so CSS variants can adapt without coupling to React state.
  if (typeof document !== "undefined") {
    document.documentElement.dataset.sitaProfile = profile.profile;
    if (profile.branding?.themeVariant) {
      document.documentElement.dataset.sitaThemeVariant = profile.branding.themeVariant;
    }
  }

  return <>{children}</>;
}

/**
 * Hook: returns whether the current route is visible under the active profile.
 * Components can use this to hide nav entries that belong to a different profile.
 */
export function useRouteVisibleInProfile(pathname?: string): boolean {
  const location = useLocation();
  const profile = getDeploymentProfile();
  const path = pathname ?? location.pathname;
  const entry = resolveRoutePlane(path);
  if (!entry) return true;
  return entry.profiles.includes(profile.profile);
}
