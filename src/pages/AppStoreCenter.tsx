// ═══════════════════════════════════════════════════════════════
// SITA OS — App Store Redirect Shim
// Intercepts /app-store/* routes → dispatches event → desktop
// ═══════════════════════════════════════════════════════════════

import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

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
    (window as unknown as { __appStoreInitialModule?: string }).__appStoreInitialModule = module;
    window.dispatchEvent(
      new CustomEvent("sita-open-app-store", { detail: { module } })
    );
    navigate("/desktop", { replace: true });
  }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-3 animate-fade-in">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">Opening App Store…</p>
      </div>
    </div>
  );
}
