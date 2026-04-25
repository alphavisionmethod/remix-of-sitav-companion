import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, MessageSquare, Shield, AlertTriangle,
  CheckCircle, Activity
} from "lucide-react";

const NAV_ITEMS = [
  { path: "/admin/dashboard", icon: LayoutDashboard, label: "Home" },
  { path: "/admin/mc/system-health", icon: Activity, label: "Health" },
  { path: "/admin/founder/command", icon: MessageSquare, label: "Command" },
  { path: "/admin/mc/incidents", icon: AlertTriangle, label: "Incidents" },
  { path: "/admin/mc/trust-security", icon: Shield, label: "Trust" },
];

export function FounderMobileNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card/95 backdrop-blur-xl border-t border-border/30 safe-area-bottom">
      <div className="flex items-center justify-around h-14 px-2">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5", active && "drop-shadow-[0_0_4px_hsl(var(--primary)/0.5)]")} />
              <span className="text-[9px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
