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
      className="fixed bottom-3 left-4 right-4 z-40 md:hidden rounded-[22px] border border-border/15"
      style={{
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        background: "linear-gradient(180deg, hsl(var(--card) / 0.80) 0%, hsl(var(--card) / 0.65) 100%)",
        backdropFilter: "blur(40px) saturate(1.8)",
        WebkitBackdropFilter: "blur(40px) saturate(1.8)",
        boxShadow: "0 -4px 40px hsl(0 0% 0% / 0.2), 0 0 1px hsl(0 0% 100% / 0.06), inset 0 1px 0 hsl(0 0% 100% / 0.08), inset 0 -0.5px 0 hsl(0 0% 0% / 0.05)",
      }}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              className="relative flex flex-col items-center gap-0.5 px-3 py-1.5 min-w-0 active:scale-[0.88] transition-transform duration-150"
              onTouchStart={() => prefetchRoute(item.path)}
            >
              {/* Active glow background */}
              {active && (
                <div
                  className="absolute top-0 h-9 w-9 rounded-full"
                  style={{
                    background: "radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 70%)",
                    boxShadow: "0 0 12px hsl(var(--primary) / 0.12)",
                  }}
                />
              )}
              <Icon
                className={cn(
                  "relative z-10 h-5 w-5 transition-all duration-200 shrink-0",
                  active ? "text-primary" : "text-muted-foreground"
                )}
                strokeWidth={active ? 2.2 : 1.5}
                style={active ? { filter: "drop-shadow(0 0 4px hsl(var(--primary) / 0.3))" } : undefined}
              />
              <span
                className={cn(
                  "relative z-10 text-[9px] font-medium leading-tight truncate max-w-[48px] transition-all duration-200",
                  active ? "text-primary font-semibold" : "text-muted-foreground"
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
