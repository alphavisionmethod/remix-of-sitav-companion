import { ReactNode, useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { TrustRibbon } from "@/components/sita/admin/TrustRibbon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Home, Shield, Activity, Zap, Database, BarChart3, Lock, Eye, Bell,
  GitBranch, Layers, Target, Cpu, Globe, ChevronRight, Command, HelpCircle,
  PanelLeftClose, PanelLeftOpen, AlertTriangle, RefreshCw
} from "lucide-react";

interface AdminShellProps {
  children: ReactNode;
  activePath?: string;
  contextScope?: string;
  layoutMode?: "default" | "compact" | "dense";
}

const NAV_ITEMS = [
  { label: "Mission Control", path: "/admin/mission-control", icon: Home },
  { label: "Incidents", path: "/admin/incidents", icon: AlertTriangle },
  { label: "Operations", path: "/admin/operations", icon: Zap },
  { label: "Alert Triage", path: "/admin/alert-triage", icon: Bell },
  { label: "Deployment", path: "/admin/deployment", icon: GitBranch },
  { label: "Proof Matrix", path: "/admin/proof-matrix", icon: Layers },
  { label: "Projections", path: "/admin/projections", icon: BarChart3 },
  { label: "Durability", path: "/admin/durability", icon: Database },
  { label: "Connectors", path: "/admin/connectors", icon: Globe },
  { label: "Security", path: "/admin/security-posture", icon: Lock },
  { label: "Truth Registry", path: "/admin/truth-registry", icon: Eye },
  { label: "Launch", path: "/admin/launch-readiness", icon: Target },
  { label: "Fleet", path: "/admin/fleet-health", icon: Cpu },
  { label: "Concierge", path: "/admin/concierge-runtime", icon: Activity },
  { label: "Compute", path: "/admin/compute-governance", icon: Shield },
  { label: "Revenue Autopilot", path: "/admin/revenue-autopilot", icon: BarChart3 },
  { label: "Proof Ledger", path: "/admin/proof-ledger", icon: Layers },
];

export function AdminShell({ children, activePath, layoutMode = "default" }: AdminShellProps) {
  const location = useLocation();
  const current = activePath || location.pathname;
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rolloutActive] = useState(true);

  // Breadcrumb
  const segments = current.split("/").filter(Boolean);
  const breadcrumbs = segments.map((seg, i) => ({
    label: seg.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
    path: "/" + segments.slice(0, i + 1).join("/"),
  }));

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={cn(
        "border-r bg-card/50 flex flex-col transition-all duration-200 shrink-0",
        sidebarOpen ? "w-56" : "w-14"
      )}>
        <div className="p-3 border-b flex items-center justify-between">
          {sidebarOpen && <span className="text-xs font-bold text-foreground tracking-wider uppercase">Admin</span>}
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <PanelLeftClose className="h-3.5 w-3.5" /> : <PanelLeftOpen className="h-3.5 w-3.5" />}
          </Button>
        </div>
        <nav className="flex-1 overflow-y-auto py-2 space-y-0.5 px-2">
          {NAV_ITEMS.map((item) => {
            const isActive = current.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs transition-colors",
                  isActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
                title={!sidebarOpen ? item.label : undefined}
              >
                <item.icon className="h-3.5 w-3.5 shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="p-2 border-t">
          <Link to="/admin/dashboard" className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground rounded-md hover:bg-muted/50">
            <HelpCircle className="h-3.5 w-3.5" />
            {sidebarOpen && <span>Dashboard</span>}
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="border-b px-4 py-2 flex items-center justify-between bg-card/30">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            {breadcrumbs.map((bc, i) => (
              <span key={bc.path} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="h-3 w-3" />}
                <Link to={bc.path} className={cn("hover:text-foreground transition-colors", i === breadcrumbs.length - 1 && "text-foreground font-medium")}>{bc.label}</Link>
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <TrustRibbon />
            <Button variant="ghost" size="sm" className="h-7 text-[10px] gap-1"><Command className="h-3 w-3" />K</Button>
          </div>
        </header>

        {/* Rollout banner */}
        {rolloutActive && <RolloutStatusBanner />}

        {/* Content */}
        <main className={cn("flex-1 overflow-auto", layoutMode === "compact" ? "p-3" : layoutMode === "dense" ? "p-2" : "p-0")}>
          {children}
        </main>
      </div>
    </div>
  );
}

function RolloutStatusBanner() {
  return (
    <div className="bg-primary/5 border-b border-primary/10 px-4 py-1.5 flex items-center gap-3 text-[10px]">
      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[9px] px-1.5 py-0">
        <RefreshCw className="h-2.5 w-2.5 mr-0.5 animate-spin" /> Rollout Active
      </Badge>
      <span className="text-muted-foreground">Ring 0 → Ring 1 promotion in progress</span>
      <span className="text-muted-foreground">·</span>
      <span className="text-foreground font-medium">3 gates passing</span>
      <Link to="/admin/deployment" className="text-primary hover:underline ml-auto">View details →</Link>
    </div>
  );
}

export default AdminShell;
