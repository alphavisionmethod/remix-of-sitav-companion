import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

/**
 * ConciergeCenter is now a redirect shim.
 * When any /concierge/* route is hit, it opens the Concierge windowed app
 * at the correct sub-page and redirects back to /desktop.
 */

const subpageFromPath = (path: string): string => {
  if (path.includes("/life-admin")) return "life-admin";
  if (path.includes("/calendar")) return "calendar";
  if (path.includes("/tasks")) return "tasks";
  if (path.includes("/household")) return "household";
  if (path.includes("/school")) return "school";
  if (path.includes("/grocery")) return "grocery";
  if (path.includes("/appointments")) return "appointments";
  if (path.includes("/travel")) return "travel";
  if (path.includes("/providers")) return "providers";
  if (path.includes("/events")) return "events";
  if (path.includes("/errands")) return "errands";
  if (path.includes("/upcoming")) return "upcoming";
  if (path.includes("/recurring")) return "recurring";
  if (path.includes("/workflows")) return "workflows";
  if (path.includes("/proof")) return "proof";
  if (path.includes("/files")) return "files";
  if (path.includes("/boardroom")) return "boardroom";
  if (path.includes("/settings")) return "settings";
  return "overview";
};

const ConciergeCenter = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const module = subpageFromPath(location.pathname);
    window.dispatchEvent(new CustomEvent("sita-open-concierge", { detail: { module } }));
    navigate("/desktop", { replace: true });
  }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-3 animate-fade-in">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">Opening Concierge OS…</p>
      </div>
    </div>
  );
};

export default ConciergeCenter;
