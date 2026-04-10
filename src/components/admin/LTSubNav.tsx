import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  ShieldCheck, GitBranch, TestTube, Radar,
  Rocket, Route, TrendingDown
} from "lucide-react";

const ltPages = [
  { label: "Behavioral Truth", path: "/admin/truth/behavioral", icon: ShieldCheck },
  { label: "CI Pipeline", path: "/admin/truth/ci-pipeline", icon: GitBranch },
  { label: "E2E Journeys", path: "/admin/truth/e2e-journeys", icon: TestTube },
  { label: "Runtime Probes", path: "/admin/truth/runtime-probes", icon: Radar },
  { label: "Launch Gate", path: "/admin/truth/launch-gate", icon: Rocket },
  { label: "Route Truth", path: "/admin/truth/route-interaction", icon: Route },
  { label: "Regressions", path: "/admin/truth/regression-radar", icon: TrendingDown },
];

export default function LTSubNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-card/50 border border-border/50 overflow-x-auto mb-4">
      {ltPages.map(p => {
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
  );
}
