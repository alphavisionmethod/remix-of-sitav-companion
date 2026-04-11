import { memo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Briefcase, DollarSign, Headphones, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { prefetchRoute } from "@/hooks/useRoutePrefetch";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Briefcase, label: "Biz", path: "/business" },
  { icon: DollarSign, label: "Money", path: "/money" },
  { icon: Headphones, label: "Help", path: "/concierge" },
  { icon: MoreHorizontal, label: "More", path: "/settings" },
];

export const MobileBottomNav = memo(() => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className="fixed bottom-2 left-3 right-3 z-40 md:hidden rounded-2xl border border-border/20 bg-card/70 backdrop-blur-2xl shadow-xl"
      style={{
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        boxShadow: "0 -4px 40px hsl(0 0% 0% / 0.25), 0 0 1px hsl(0 0% 100% / 0.06), inset 0 1px 0 hsl(0 0% 100% / 0.04)",
      }}
    >
      <div className="flex items-center justify-around px-2 py-1.5">
        {navItems.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              className="relative flex flex-col items-center gap-0.5 px-3 py-1.5 min-w-0 active:scale-90 transition-transform duration-150"
              onTouchStart={() => prefetchRoute(item.path)}
            >
              {/* Active circle background */}
              {active && (
                <div className="absolute top-0.5 h-8 w-8 rounded-full bg-primary/12" />
              )}
              <Icon
                className={cn(
                  "relative z-10 h-5 w-5 transition-colors duration-200 shrink-0",
                  active ? "text-primary" : "text-muted-foreground"
                )}
                strokeWidth={active ? 2.2 : 1.5}
              />
              <span
                className={cn(
                  "relative z-10 text-[9px] font-medium leading-tight truncate max-w-[48px] transition-colors duration-200",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
});
MobileBottomNav.displayName = "MobileBottomNav";
