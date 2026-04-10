import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Eye, Database, BookOpen, Network, Server, Shield,
  Brain, BarChart3, Tag, Rocket, ArrowRight, Activity
} from "lucide-react";

const drsPages = [
  { label: "Overview", path: "/admin/drs/overview", icon: Eye },
  { label: "Registry", path: "/admin/drs/registry", icon: Database },
  { label: "Scenarios", path: "/admin/drs/scenarios", icon: BookOpen },
  { label: "Entities", path: "/admin/drs/entities", icon: Network },
  { label: "Providers", path: "/admin/drs/providers", icon: Server },
  { label: "Safety", path: "/admin/drs/safety", icon: Shield },
  { label: "AI Control", path: "/admin/drs/ai-control", icon: Brain },
  { label: "Analytics", path: "/admin/drs/analytics", icon: BarChart3 },
  { label: "Truth Labels", path: "/admin/drs/truth", icon: Tag },
  { label: "Launch Gate", path: "/admin/drs/launch-gate", icon: Rocket },
];

const crossLinks = [
  { label: "Launch Truth", path: "/admin/truth/behavioral", icon: Activity },
  { label: "SAG Gateway", path: "/admin/sag/overview", icon: Brain },
];

export default function DRSSubNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="space-y-1 mb-4">
      <div className="flex items-center gap-1 p-1 rounded-lg bg-card/50 border border-border/50 overflow-x-auto">
        {drsPages.map(p => {
          const active = location.pathname === p.path;
          return (
            <button
              key={p.path}
              onClick={() => navigate(p.path)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap",
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
