import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  BarChart3, Eye, FileSearch, Replace, FolderSearch, Database,
  Map, FileCheck, Shield, Calendar, TrendingUp, ShieldCheck,
  ArrowRight, BookOpen, Scale
} from "lucide-react";

const rcpPages = [
  { label: "Overview", path: "/admin/reality-audit/overview", icon: BarChart3 },
  { label: "Classification", path: "/admin/reality-audit", icon: Eye },
  { label: "Feature Detail", path: "/admin/reality-audit/feature/overview", icon: FileSearch },
  { label: "Mock Replacement", path: "/admin/reality-audit/mock-replacement", icon: Replace },
  { label: "Mock Sources", path: "/admin/reality-audit/mock-sources", icon: FolderSearch },
  { label: "Core Persistence", path: "/admin/reality-audit/core-persistence", icon: Database },
  { label: "Route Heatmap", path: "/admin/reality-audit/route-heatmap", icon: Map },
  { label: "Contracts", path: "/admin/reality-audit/contract-readiness", icon: FileCheck },
  { label: "Launch Honesty", path: "/admin/reality-audit/launch-honesty", icon: Shield },
  { label: "Wave Planner", path: "/admin/reality-audit/wave-planner", icon: Calendar },
  { label: "Progress", path: "/admin/reality-audit/progress", icon: TrendingUp },
  { label: "Runtime Truth", path: "/admin/reality-audit/runtime-truth", icon: ShieldCheck },
];

const crossLinks = [
  { label: "Impl. Truth", path: "/admin/implementation-truth", icon: BookOpen },
  { label: "Platform Law", path: "/admin/platform-law", icon: Scale },
];

export default function RCPSubNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) =>
    path === "/admin/reality-audit"
      ? location.pathname === path
      : location.pathname.startsWith(path);

  return (
    <div className="space-y-1 mb-4">
      <div className="flex items-center gap-1 p-1 rounded-lg bg-card/50 border border-border/50 overflow-x-auto">
        {rcpPages.map(p => {
          const active = isActive(p.path);
          return (
            <button
              key={p.path}
              onClick={() => navigate(p.path)}
              className={cn(
                "flex items-center gap-1.5 px-2 py-1.5 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap",
                active
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <p.icon className="h-3 w-3" />
              {p.label}
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-1 pl-1">
        <span className="text-[10px] text-muted-foreground mr-1">Related:</span>
        {crossLinks.map(l => (
          <button
            key={l.path}
            onClick={() => navigate(l.path)}
            className="flex items-center gap-1 px-2 py-1 rounded text-[10px] text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors whitespace-nowrap"
          >
            <l.icon className="h-2.5 w-2.5" />
            {l.label}
            <ArrowRight className="h-2 w-2 opacity-50" />
          </button>
        ))}
      </div>
    </div>
  );
}
