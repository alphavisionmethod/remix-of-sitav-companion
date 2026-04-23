import { useNavigate, useLocation } from "react-router-dom";
import { Home, Briefcase, DollarSign, Headphones, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { icon: Home, label: "Home", path: "/mobile" },
  { icon: Briefcase, label: "Business", path: "/mobile/business" },
  { icon: DollarSign, label: "Finance", path: "/mobile/money" },
  { icon: Headphones, label: "Concierge", path: "/mobile/concierge" },
  { icon: MoreHorizontal, label: "More", path: "/mobile/more" },
];

export const MobileTabBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) =>
    path === "/mobile" ? location.pathname === "/mobile" : location.pathname.startsWith(path);

  return (
    <nav
      role="tablist"
      aria-label="Main navigation"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/40 bg-card/95 backdrop-blur-xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
      <div className="flex items-center justify-around px-1 py-2 max-w-md mx-auto">
        {tabs.map((tab) => {
          const active = isActive(tab.path);
          const Icon = tab.icon;
          return (
            <button
              key={tab.path}
              role="tab"
              aria-selected={active}
              aria-label={tab.label}
              onClick={() => {
                if (active && location.pathname !== tab.path) {
                  // If on a sub-page of this tab, navigate to tab root (preserve filter context)
                  navigate(tab.path);
                } else if (!active) {
                  navigate(tab.path);
                }
                // If already on exact tab root, do nothing (no-op tap)
              }}
              className={cn(
                "relative flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.2 : 1.5} />
              <span className="text-[10px] font-medium">{tab.label}</span>
              {active && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
