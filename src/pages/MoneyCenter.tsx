import { useEffect, lazy, Suspense } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { MobileShell } from "@/components/mobile/MobileShell";
import { Skeleton } from "@/components/ui/skeleton";

const MoneyAdvisorBoard = lazy(() => import("@/pages/money/MoneyAdvisorBoard"));

// Map of sub-paths that have dedicated mobile-inline rendering
const MOBILE_INLINE_MODULES: Record<string, { title: string; Component: React.LazyExoticComponent<any> }> = {
  advisors: { title: "Money Advisors", Component: MoneyAdvisorBoard },
};

const subpageFromPath = (path: string): string => {
  const segments = path.replace("/money", "").split("/").filter(Boolean);
  return segments[0] || "overview";
};

const MoneyCenter = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { loading } = useAuth();
  const module = subpageFromPath(location.pathname);

  // Desktop: dispatch event to FinanceAppShell and redirect to /desktop
  useEffect(() => {
    if (isMobile) return; // mobile renders inline — no redirect
    window.dispatchEvent(new CustomEvent("sita-open-finance", { detail: { module } }));
    navigate("/desktop", { replace: true });
  }, [isMobile]); // eslint-disable-line react-hooks/exhaustive-deps

  // Desktop path returns null (redirect happens in effect)
  if (!isMobile) return null;

  // Mobile: if this module has a dedicated inline component, render it
  const inlineMod = MOBILE_INLINE_MODULES[module];
  if (inlineMod) {
    const { title, Component } = inlineMod;
    return (
      <MobileShell title={title}>
        <Suspense fallback={<div className="space-y-3 p-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>}>
          {loading ? (
            <div className="space-y-3 p-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
          ) : (
            <Component />
          )}
        </Suspense>
      </MobileShell>
    );
  }

  // Default mobile money pages → redirect to /mobile/money
  navigate("/mobile/money", { replace: true });
  return null;
};

export default MoneyCenter;
