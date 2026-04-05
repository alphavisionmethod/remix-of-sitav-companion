import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Shield, Home, Heart, Activity, CheckCircle, Users, BarChart3, AlertTriangle, Sparkles, ChevronRight } from "lucide-react";

interface OwnerModeShellProps {
  children: ReactNode;
}

const OWNER_NAV = [
  { label: "Home", path: "/owner", icon: Home },
  { label: "Health", path: "/owner/pulse", icon: Heart },
  { label: "Approvals", path: "/owner/approvals", icon: CheckCircle },
  { label: "AI Team", path: "/owner/ai-team", icon: Sparkles },
  { label: "Revenue", path: "/admin/revenue-autopilot", icon: BarChart3 },
  { label: "Trust", path: "/admin/truth-registry", icon: Shield },
  { label: "Risks", path: "/admin/security-posture", icon: AlertTriangle },
  { label: "Launch", path: "/admin/launch-readiness", icon: Activity },
];

export function OwnerModeShell({ children }: OwnerModeShellProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Safe Mode Banner */}
      <div className="bg-emerald-500/5 border-b border-emerald-500/15 px-6 py-2.5 flex items-center gap-3">
        <Shield className="h-4 w-4 text-emerald-500" />
        <span className="text-sm font-medium text-emerald-600">Owner Safe Mode</span>
        <span className="text-xs text-muted-foreground">Simplified controls · Plain-English labels · Protected defaults</span>
        <Badge variant="outline" className="ml-auto text-[9px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Safe</Badge>
      </div>

      {/* Nav */}
      <nav className="border-b px-6 py-2 flex items-center gap-1 overflow-x-auto">
        {OWNER_NAV.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== "/owner" && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-colors whitespace-nowrap",
                isActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <item.icon className="h-3.5 w-3.5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Content */}
      <main className="p-6">{children}</main>
    </div>
  );
}

export default OwnerModeShell;
