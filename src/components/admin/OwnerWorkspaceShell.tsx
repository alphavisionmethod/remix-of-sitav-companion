import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { TrustRibbon } from "@/components/sita/admin/TrustRibbon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Home, Heart, CheckCircle, Sparkles, BarChart3, Shield, AlertTriangle,
  Activity, Target, ChevronRight, Settings
} from "lucide-react";

interface OwnerWorkspaceShellProps {
  children: ReactNode;
}

const TABS = [
  { label: "Home", path: "/owner", icon: Home },
  { label: "Health", path: "/owner/pulse", icon: Heart },
  { label: "Trust", path: "/admin/truth-registry", icon: Shield },
  { label: "Approvals", path: "/owner/approvals", icon: CheckCircle },
  { label: "AI Team", path: "/owner/ai-team", icon: Sparkles },
  { label: "Revenue", path: "/admin/revenue-autopilot", icon: BarChart3 },
  { label: "Risks", path: "/admin/security-posture", icon: AlertTriangle },
  { label: "Launches", path: "/admin/launch-readiness", icon: Target },
];

export function OwnerWorkspaceShell({ children }: OwnerWorkspaceShellProps) {
  const location = useLocation();
  const [advancedMode, setAdvancedMode] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top summary lane */}
      <header className="border-b px-6 py-2.5 flex items-center justify-between bg-card/30">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-foreground tracking-tight">Owner Workspace</span>
          <TrustRibbon />
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={cn("text-[9px] cursor-pointer", advancedMode ? "bg-primary/10 text-primary border-primary/20" : "")}>
            <button onClick={() => setAdvancedMode(!advancedMode)} className="flex items-center gap-1">
              <Settings className="h-2.5 w-2.5" /> {advancedMode ? "Advanced" : "Safe"}
            </button>
          </Badge>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar tabs */}
        <aside className="w-48 border-r bg-card/30 py-3 px-2 space-y-0.5 shrink-0">
          {TABS.map((tab) => {
            const isActive = location.pathname === tab.path || (tab.path !== "/owner" && location.pathname.startsWith(tab.path));
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-xs transition-colors",
                  isActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
              </Link>
            );
          })}
        </aside>

        {/* Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

export default OwnerWorkspaceShell;
