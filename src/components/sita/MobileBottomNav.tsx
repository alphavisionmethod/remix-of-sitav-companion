import { useNavigate, useLocation } from "react-router-dom";
import { Home, Briefcase, DollarSign, Headphones, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Briefcase, label: "Biz", path: "/business" },
  { icon: DollarSign, label: "Money", path: "/money" },
  { icon: Headphones, label: "Help", path: "/concierge" },
  { icon: MoreHorizontal, label: "More", path: "/settings" },
];

export const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-border/40 bg-surface-0/90 backdrop-blur-xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-center justify-around px-1 py-1">
        {navItems.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              className="relative flex flex-col items-center gap-0.5 px-2 py-1 min-w-0"
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-colors shrink-0",
                  active ? "text-primary" : "text-muted-foreground"
                )}
                strokeWidth={active ? 2 : 1.5}
              />
              <span
                className={cn(
                  "text-[9px] font-medium leading-tight truncate max-w-[48px]",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                {item.label}
              </span>
              {active && (
                <div className="absolute top-0 h-0.5 w-5 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
