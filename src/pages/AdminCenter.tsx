import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-muted-foreground text-sm animate-pulse">Opening Mission Control...</p>
    </div>
  );
};

export default AdminCenter;
