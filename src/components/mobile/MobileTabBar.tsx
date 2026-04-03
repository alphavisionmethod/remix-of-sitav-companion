import { useNavigate, useLocation } from "react-router-dom";
import { Home, ShieldCheck, FileCheck, Bell, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { icon: Home, label: "Home", path: "/mobile" },
  { icon: ShieldCheck, label: "Approvals", path: "/mobile/approvals" },
  { icon: FileCheck, label: "Proof", path: "/mobile/proof" },
  { icon: Bell, label: "Alerts", path: "/mobile/alerts" },
  { icon: LayoutDashboard, label: "Board", path: "/mobile/boardroom" },
];

export const MobileTabBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) =>
    path === "/mobile" ? location.pathname === "/mobile" : location.pathname.startsWith(path);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/40 bg-card/95 backdrop-blur-xl">
      <div className="flex items-center justify-around px-1 py-2 max-w-md mx-auto">
        {tabs.map((tab) => {
          const active = isActive(tab.path);
          const Icon = tab.icon;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
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
