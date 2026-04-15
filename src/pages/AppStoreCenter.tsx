// ═══════════════════════════════════════════════════════════════
// SITA OS — App Store Redirect Shim
// Intercepts /app-store/* routes → dispatches event → desktop
// ═══════════════════════════════════════════════════════════════

import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function pathToModuleId(pathname: string): string {
  const seg = pathname.replace("/app-store", "").replace(/^\//, "").split("/")[0];
  const map: Record<string, string> = {
    "": "store",
    "library": "library",
    "updates": "updates",
    "permissions": "permissions",
    "associations": "associations",
    "compare": "compare",
    "web-install": "web-install",
    "external-install": "external-install",
    "receipts": "receipts",
    "receipt": "receipt-detail",
    "enterprise": "enterprise",
    "dev-tools": "dev-tools",
    "open-with": "open-with",
    "first-launch": "first-launch",
    "app": "app-detail",
    "bundle": "bundle-detail",
    "manage": "manage",
  };
  return map[seg] || "store";
}

export default function AppStoreCenter() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const module = pathToModuleId(location.pathname);
    (window as any).__appStoreInitialModule = module;
    window.dispatchEvent(
      new CustomEvent("sita-open-app-store", { detail: { module } })
    );
    navigate("/desktop", { replace: true });
  }, [location.pathname, navigate]);

  return null;
}
