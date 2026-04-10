import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Apple, Smartphone, Watch, UserCheck, Heart, Rocket,
  ArrowRight, Shield, Radio
} from "lucide-react";

const aplPages = [
  { label: "Ecosystem", path: "/admin/apl/ecosystem", icon: Apple },
  { label: "Devices & Trust", path: "/admin/apl/devices-trust", icon: Shield },
  { label: "Watch", path: "/admin/apl/watch", icon: Watch },
  { label: "Identity", path: "/admin/apl/identity", icon: UserCheck },
  { label: "Health Consent", path: "/admin/apl/health-consent", icon: Heart },
  { label: "Launch Readiness", path: "/admin/apl/launch-readiness", icon: Rocket },
];

const crossLinks = [
  { label: "Android Ecosystem", path: "/admin/and/ecosystem", icon: Smartphone },
  { label: "DWE Devices", path: "/admin/dwe/devices", icon: Radio },
  { label: "Health Signals", path: "/admin/hrs/consent", icon: Heart },
];

export default function APLSubNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="space-y-1 mb-4">
      <div className="flex items-center gap-1 p-1 rounded-lg bg-card/50 border border-border/50 overflow-x-auto">
        {aplPages.map(p => {
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
