import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Route entry point for /revenue-office/onboarding.
 * Instead of rendering the full-page wizard, it opens the Business OS
 * window with the onboarding module and redirects to the desktop.
 */
export default function BusinessOnboarding() {
  const navigate = useNavigate();

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("sita-open-business", { detail: { module: "onboarding" } })
    );
    navigate("/desktop", { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-muted-foreground text-sm animate-pulse">Opening Business OS…</p>
    </div>
  );
}
