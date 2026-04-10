import { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from "react-router-dom";
import { TrustRibbon } from "@/components/sita/admin/TrustRibbon";
import { RolloutStatusBanner } from "./RolloutStatusBanner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Home, Activity, Heart, Shield, CheckCircle, Brain, DollarSign, AlertTriangle,
  Rocket, ChevronLeft, ChevronRight, Settings,
} from "lucide-react";

interface OwnerWorkspaceShellProps {
  children: ReactNode;
}

const TABS = [
  { id: "home", label: "Home", icon: Home, path: "/owner/home" },
  { id: "health", label: "Health", icon: Activity, path: "/owner/health" },
  { id: "pulse", label: "Pulse", icon: Heart, path: "/owner/pulse" },
  { id: "trust", label: "Trust", icon: Shield, path: "/admin/trust-state" },
  { id: "approvals", label: "Approvals", icon: CheckCircle, path: "/owner/approvals" },
  { id: "ai-team", label: "AI Team", icon: Brain, path: "/owner/ai-team" },
  { id: "revenue", label: "Revenue", icon: DollarSign, path: "/admin/revenue-autopilot" },
  { id: "risks", label: "Risks", icon: AlertTriangle, path: "/admin/risk" },
  { id: "launches", label: "Launches", icon: Rocket, path: "/admin/release-ring" },
] as const;

export function OwnerWorkspaceShell({ children }: OwnerWorkspaceShellProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const activeTab = TABS.find(t => location.pathname.startsWith(t.path))?.id || "home";

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={cn(
        "border-r border-border/50 bg-card/30 flex flex-col transition-all duration-200 shrink-0",
        collapsed ? "w-14" : "w-48"
      )}>
        <div className="p-3 border-b border-border/50 flex items-center justify-between">
          {!collapsed && <span className="text-xs font-semibold text-foreground">Owner Workspace</span>}
          <button onClick={() => setCollapsed(!collapsed)} className="p-1 hover:bg-muted/30 rounded">
            {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </button>
        </div>

        <nav className="flex-1 py-2 space-y-0.5 px-2">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                )}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                {!collapsed && <span>{tab.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-2 border-t border-border/50">
          <button
            onClick={() => navigate("/settings")}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30"
          >
            <Settings className="h-3.5 w-3.5 shrink-0" />
            {!collapsed && <span>Settings</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0">
        <div className="border-b border-border/50 px-4 py-2 flex items-center justify-between bg-card/20">
          <TrustRibbon />
        </div>
        <div className="px-4 pt-2">
          <RolloutStatusBanner />
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
}
