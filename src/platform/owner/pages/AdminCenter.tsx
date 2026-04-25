import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { pathToModuleId } from "@/components/sita/apps/mission-control/MissionControlAppShell";

/**
 * AdminCenter is a redirect shim.
 * When any /admin/* route is hit, it opens the Mission Control windowed app
 * at the correct sub-page and redirects back to /desktop.
 */
const AdminCenter = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const module = pathToModuleId(location.pathname);
    (window as unknown as { __missionControlInitialModule?: string }).__missionControlInitialModule = module;
    window.dispatchEvent(new CustomEvent("sita-open-mission-control", { detail: { module } }));
    navigate("/desktop", { replace: true });
  }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-3 animate-fade-in">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">Opening Mission Control…</p>
      </div>
    </div>
  );
};

export default AdminCenter;
