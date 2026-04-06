// ═══════════════════════════════════════════════════════════════
// User App — Navigation
// Clean, minimal nav for daily use
// ═══════════════════════════════════════════════════════════════

import { useLocation, Link } from "react-router-dom";
import { Home, FolderOpen, Users, DollarSign, Briefcase, Settings, BarChart3, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { path: "/app/dashboard", label: "Home", icon: Home },
  { path: "/app/boardroom", label: "Boardroom", icon: Users },
  { path: "/app/files", label: "Files", icon: FolderOpen },
  { path: "/app/money", label: "Money", icon: DollarSign },
  { path: "/app/business", label: "Business", icon: Briefcase },
  { path: "/app/pulse", label: "Pulse", icon: BarChart3 },
  { path: "/app/connected-services", label: "Services", icon: Link2 },
  { path: "/app/settings", label: "Settings", icon: Settings },
];

export function UserNav() {
  const location = useLocation();

  return (
    <nav className="flex items-center gap-1">
      {NAV_ITEMS.map(item => {
        const active = location.pathname.startsWith(item.path);
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors",
              active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <item.icon className="h-4 w-4" />
            <span className="hidden lg:inline">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
