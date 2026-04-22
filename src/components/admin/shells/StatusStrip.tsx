import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { SafeModeBadge } from "./SafeModeBadge";
import { SafeModeDrawer } from "./SafeModeDrawer";
import { RolloutStatusBanner } from "./RolloutStatusBanner";
import {
  Activity, AlertTriangle, Rocket, Clock, DollarSign, Beaker,
  Server, CheckCircle, Monitor, Smartphone, Shield
} from "lucide-react";
import { useDataMode } from "@/contexts/DataModeContext";

interface StatusItem {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  pulse?: boolean;
}

const DEMO_STATUS: StatusItem[] = [
  { label: "Health", value: "98%", icon: Activity, color: "text-emerald-400" },
  { label: "Incidents", value: "0 active", icon: CheckCircle, color: "text-emerald-400" },
  { label: "Rollout", value: "Canary 10%", icon: Rocket, color: "text-blue-400" },
  { label: "Approvals", value: "2 pending", icon: Clock, color: "text-amber-400", pulse: true },
  { label: "AI Spend", value: "$0.42/day", icon: DollarSign, color: "text-emerald-400" },
  { label: "Simulations", value: "1 running", icon: Beaker, color: "text-purple-400", pulse: true },
];

export function StatusStrip() {
  const { isDemoMode } = useDataMode();
  const [safeModeDrawerOpen, setSafeModeDrawerOpen] = useState(false);

  return (
    <>
      <div className="hidden md:flex items-center gap-3 px-4 py-1.5 border-b border-border/20 bg-card/20 backdrop-blur-sm overflow-x-auto">
        {/* Environment */}
        <Badge variant="outline" className="text-[9px] shrink-0 bg-primary/5 text-primary border-primary/20">
          <Server className="h-2.5 w-2.5 mr-1" /> Production
        </Badge>

        <div className="h-3 w-px bg-border/30 shrink-0" />

        {/* Status Items */}
        {(isDemoMode ? DEMO_STATUS : [] as typeof DEMO_STATUS).map(item => (
          <div key={item.label} className="flex items-center gap-1.5 shrink-0">
            <item.icon className={cn("h-3 w-3", item.color)} />
            <span className="text-[10px] text-muted-foreground">{item.label}:</span>
            <span className={cn("text-[10px] font-medium", item.color)}>
              {item.value}
            </span>
            {item.pulse && <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />}
          </div>
        ))}

        <div className="h-3 w-px bg-border/30 shrink-0" />

        {/* Trust Authority */}
        <div className="flex items-center gap-2 shrink-0">
          <Shield className="h-3 w-3 text-primary" />
          <span className="text-[10px] text-muted-foreground">Trust:</span>
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="text-[8px] px-1.5 py-0 text-blue-400 border-blue-500/20 bg-blue-500/5">
              <Monitor className="h-2.5 w-2.5 mr-0.5" /> OS contextual
            </Badge>
            <Badge variant="outline" className="text-[8px] px-1.5 py-0 text-purple-400 border-purple-500/20 bg-purple-500/5">
              <Smartphone className="h-2.5 w-2.5 mr-0.5" /> App authoritative
            </Badge>
          </div>
        </div>

        <div className="h-3 w-px bg-border/30 shrink-0" />

        {/* Safe Mode */}
        <SafeModeBadge onClick={() => setSafeModeDrawerOpen(true)} />

        <div className="ml-auto shrink-0">
          <RolloutStatusBanner />
        </div>
      </div>

      <SafeModeDrawer open={safeModeDrawerOpen} onOpenChange={setSafeModeDrawerOpen} />
    </>
  );
}
