import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import type { PlaneKey } from "@/lib/platform-plane";

const PLANE_ROUTE_MAP: Record<string, PlaneKey> = {
  "/admin/founder": "internal-execution",
  "/admin/engineering": "internal-execution",
  "/admin": "control",
  "/settings": "product",
  "/cloud": "product",
  "/desktop": "product",
};

/**
 * Returns which plane the current route belongs to.
 */
export function useCurrentPlane(): PlaneKey {
  const location = useLocation();

  return useMemo(() => {
    const path = location.pathname;
    for (const [prefix, plane] of Object.entries(PLANE_ROUTE_MAP)) {
      if (path.startsWith(prefix)) return plane;
    }
    return "product";
  }, [location.pathname]);
}
