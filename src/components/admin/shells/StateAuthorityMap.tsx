import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Monitor, Smartphone, Cloud, CheckCircle, Clock, AlertTriangle,
  Database, Cpu, Layers, Activity, Eye, Radio
} from "lucide-react";
import { WhyTooltip } from "./WhyTooltip";

interface StateItem {
  label: string;
  status: "synced" | "local" | "stale" | "conflict";
  lastUpdated: string;
}

interface AuthorityClass {
  title: string;
  owner: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  items: StateItem[];
}

const STATUS_CONFIG: Record<string, { color: string; icon: React.ElementType; label: string }> = {
  synced: { color: "text-emerald-400", icon: CheckCircle, label: "Synced" },
  local: { color: "text-blue-400", icon: Monitor, label: "Local" },
  stale: { color: "text-amber-400", icon: Clock, label: "Stale" },
  conflict: { color: "text-red-400", icon: AlertTriangle, label: "Conflict" },
};

const AUTHORITY_CLASSES: AuthorityClass[] = [
  {
    title: "Execution State",
    owner: "OS-Owned",
    icon: Monitor,
    color: "text-blue-400",
    bgColor: "bg-blue-500/[0.05]",
    borderColor: "border-blue-500/20",
    description: "Runtime state managed locally by the OS. Reported upward but originates on-device.",
    items: [
      { label: "Open windows & processes", status: "local", lastUpdated: "Real-time" },
      { label: "Local resource usage (CPU/RAM)", status: "local", lastUpdated: "Real-time" },
      { label: "Local cache state", status: "local", lastUpdated: "Real-time" },
      { label: "Active rendering state", status: "local", lastUpdated: "Real-time" },
      { label: "Device-local runtime config", status: "synced", lastUpdated: "2m ago" },
      { label: "Queued offline changes", status: "local", lastUpdated: "N/A" },
      { label: "Local hardware state (sensors, battery, peripherals)", status: "local", lastUpdated: "Real-time" },
      { label: "Local pending writes (uncommitted mutations)", status: "local", lastUpdated: "Real-time" },
    ],
  },
  {
    title: "Canonical State",
    owner: "Cloud-Owned",
    icon: Cloud,
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/[0.05]",
    borderColor: "border-cyan-500/20",
    description: "Source-of-truth state managed by the Cloud. All surfaces read from and write to Cloud.",
    items: [
      { label: "Account identity", status: "synced", lastUpdated: "1m ago" },
      { label: "Trusted devices registry", status: "synced", lastUpdated: "5m ago" },
      { label: "File/version metadata", status: "synced", lastUpdated: "30s ago" },
      { label: "Global sync state", status: "synced", lastUpdated: "10s ago" },
      { label: "Workspace continuity truth", status: "synced", lastUpdated: "2m ago" },
      { label: "Policies & governance rules", status: "synced", lastUpdated: "1h ago" },
      { label: "Rollout state & ring config", status: "synced", lastUpdated: "15m ago" },
      { label: "Command history", status: "synced", lastUpdated: "Real-time" },
      { label: "Approval history", status: "synced", lastUpdated: "Real-time" },
      { label: "Trust level (per-user & per-device)", status: "synced", lastUpdated: "5m ago" },
      { label: "AI decisioning state (model routing, budget)", status: "synced", lastUpdated: "1m ago" },
      { label: "Security event truth (alerts, incidents, posture)", status: "synced", lastUpdated: "Real-time" },
      { label: "Global notification truth (delivery, read state)", status: "synced", lastUpdated: "30s ago" },
    ],
  },
  {
    title: "Control State",
    owner: "App-Owned",
    icon: Smartphone,
    color: "text-purple-400",
    bgColor: "bg-purple-500/[0.05]",
    borderColor: "border-purple-500/20",
    description: "View and control state managed by the App. Reflects and controls — does not store canonical truth.",
    items: [
      { label: "Selected device in view", status: "local", lastUpdated: "Real-time" },
      { label: "Pending approval screen state", status: "local", lastUpdated: "Real-time" },
      { label: "Notification state", status: "synced", lastUpdated: "5s ago" },
      { label: "Command drafts", status: "local", lastUpdated: "Real-time" },
      { label: "Mobile session state", status: "local", lastUpdated: "Real-time" },
      { label: "Control preferences", status: "synced", lastUpdated: "1h ago" },
      { label: "Cached summaries (quick mobile viewing)", status: "local", lastUpdated: "30s ago" },
    ],
  },
];

export function StateAuthorityMap({ compact = false }: { compact?: boolean }) {
  const [selectedClass, setSelectedClass] = useState<string | null>(null);

  const totalItems = AUTHORITY_CLASSES.reduce((sum, c) => sum + c.items.length, 0);
  const syncedItems = AUTHORITY_CLASSES.reduce((sum, c) => sum + c.items.filter(i => i.status === "synced").length, 0);
  const conflictItems = AUTHORITY_CLASSES.reduce((sum, c) => sum + c.items.filter(i => i.status === "conflict").length, 0);

  return (
    <Card className="border-white/[0.06] bg-white/[0.03] backdrop-blur-xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          State Authority Map
          <WhyTooltip explanation="Visualizes which platform surface owns each category of state. Execution state lives on the OS, canonical truth lives in the Cloud, and control state lives in the App." />
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="outline" className="text-[8px] text-emerald-400 border-emerald-500/20">
              {syncedItems}/{totalItems} synced
            </Badge>
            {conflictItems > 0 && (
              <Badge variant="outline" className="text-[8px] text-red-400 border-red-500/20 animate-pulse">
                {conflictItems} conflicts
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Authority Classes */}
        <div className={cn("grid gap-3", compact ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-3")}>
          {AUTHORITY_CLASSES.map((cls, ci) => (
            <motion.div
              key={cls.title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: ci * 0.08 }}
            >
              <Card className={cn("border bg-white/[0.02]", cls.borderColor)}>
                <CardHeader className="pb-2 pt-3 px-3">
                  <div className="flex items-center gap-2">
                    <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", cls.bgColor)}>
                      <cls.icon className={cn("h-4 w-4", cls.color)} />
                    </div>
                    <div>
                      <h3 className={cn("text-xs font-semibold", cls.color)}>{cls.title}</h3>
                      <Badge variant="outline" className={cn("text-[8px] px-1 py-0 mt-0.5", cls.color, cls.borderColor)}>
                        {cls.owner}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-[9px] text-muted-foreground mt-1.5 leading-relaxed">{cls.description}</p>
                </CardHeader>
                <CardContent className="px-3 pb-3">
                  <div className="space-y-1">
                    {cls.items.map(item => {
                      const statusInfo = STATUS_CONFIG[item.status];
                      return (
                        <div key={item.label} className="flex items-center gap-2 py-1 px-2 rounded hover:bg-white/[0.03] transition-colors">
                          <statusInfo.icon className={cn("h-3 w-3 shrink-0", statusInfo.color)} />
                          <span className="text-[10px] text-foreground flex-1">{item.label}</span>
                          <span className="text-[8px] text-muted-foreground">{item.lastUpdated}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-[9px] text-muted-foreground pt-1 flex-wrap">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-1">
              <cfg.icon className={cn("h-3 w-3", cfg.color)} />
              <span>{cfg.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
