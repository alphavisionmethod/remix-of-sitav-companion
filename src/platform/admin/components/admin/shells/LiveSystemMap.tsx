import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  Monitor, Cloud, HardDrive, Shield, Brain, Rocket, Users,
  Smartphone, Layers, AlertTriangle, Activity, Wrench,
  Lock, DollarSign, Bell, Server
} from "lucide-react";

type HealthLevel = "healthy" | "caution" | "degraded" | "critical" | "active" | "stable";

interface MapNode {
  id: string;
  label: string;
  icon: React.ElementType;
  health: HealthLevel;
  plane: "product" | "control" | "service" | "execution";
  route: string;
  incidents?: number;
  detail?: string;
}

const HEALTH_COLORS: Record<HealthLevel, { bg: string; border: string; text: string; dot: string }> = {
  healthy: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400", dot: "bg-emerald-400" },
  caution: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400", dot: "bg-amber-400" },
  degraded: { bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-400", dot: "bg-orange-400" },
  critical: { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400", dot: "bg-red-400" },
  active: { bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-400", dot: "bg-purple-400" },
  stable: { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-400", dot: "bg-blue-400" },
};

const PLANE_LABELS: Record<string, string> = {
  product: "Product Plane",
  control: "Control Plane",
  service: "Service Plane",
  execution: "Execution Plane",
};

const MAP_NODES: MapNode[] = [
  { id: "devices", label: "Devices", icon: Smartphone, health: "healthy", plane: "product", route: "/admin/mc/devices", detail: "All cohorts healthy" },
  { id: "users", label: "Users", icon: Users, health: "healthy", plane: "product", route: "/admin/mc/users", detail: "Active: 12.4K" },
  { id: "workspaces", label: "Workspaces", icon: Layers, health: "healthy", plane: "product", route: "/admin/mc/workspaces", detail: "No stuck workspaces" },

  { id: "releases", label: "Releases", icon: Rocket, health: "stable", plane: "control", route: "/admin/mc/releases", detail: "Canary 10% stable" },
  { id: "policies", label: "Policies", icon: Shield, health: "healthy", plane: "control", route: "/admin/mc/policies", detail: "14 active policies" },
  { id: "incidents", label: "Incidents", icon: AlertTriangle, health: "healthy", plane: "control", route: "/admin/mc/incidents", incidents: 0, detail: "0 active" },
  { id: "trust", label: "Trust", icon: Lock, health: "caution", plane: "control", route: "/admin/mc/trust-security", detail: "FP rate: 4.2%" },

  { id: "sync", label: "Sync", icon: Cloud, health: "healthy", plane: "service", route: "/admin/mc/sync-cloud", detail: "99.4% reliability" },
  { id: "storage", label: "Storage", icon: HardDrive, health: "healthy", plane: "service", route: "/admin/mc/storage", detail: "12.4 TB used" },
  { id: "auth", label: "Auth", icon: Lock, health: "healthy", plane: "service", route: "/admin/mc/trust-security", detail: "P95: 45ms" },
  { id: "notifications", label: "Notifications", icon: Bell, health: "healthy", plane: "service", route: "/admin/mc/jobs", detail: "Delivery: 99.8%" },

  { id: "ai", label: "AI Engine", icon: Brain, health: "active", plane: "execution", route: "/admin/mc/ai-control", detail: "4 tasks running" },
  { id: "jobs", label: "Workers", icon: Wrench, health: "healthy", plane: "execution", route: "/admin/mc/jobs", detail: "No backlog" },
  { id: "costs", label: "Cost Engine", icon: DollarSign, health: "healthy", plane: "execution", route: "/admin/mc/costs", detail: "$0.42/day" },
];

interface LiveSystemMapProps {
  compact?: boolean;
}

export function LiveSystemMap({ compact = false }: LiveSystemMapProps) {
  const navigate = useNavigate();
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const planes = ["product", "control", "service", "execution"] as const;

  return (
    <div className="space-y-3">
      {planes.map(plane => {
        const nodes = MAP_NODES.filter(n => n.plane === plane);
        return (
          <div key={plane}>
            <div className="flex items-center gap-2 mb-2">
              <Server className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{PLANE_LABELS[plane]}</span>
              <div className="flex-1 h-px bg-border/20" />
            </div>
            <div className={cn("grid gap-2", compact ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4")}>
              {nodes.map(node => {
                const colors = HEALTH_COLORS[node.health];
                const isHovered = hoveredNode === node.id;
                return (
                  <button
                    key={node.id}
                    onClick={() => navigate(node.route)}
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    className={cn(
                      "relative p-3 rounded-lg border text-left transition-all",
                      colors.bg, colors.border,
                      isHovered && "ring-1 ring-primary/30 scale-[1.02]",
                      "hover:shadow-lg"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <node.icon className={cn("h-3.5 w-3.5", colors.text)} />
                      <span className="text-xs font-medium text-foreground">{node.label}</span>
                      <div className={cn("h-2 w-2 rounded-full ml-auto", colors.dot)} />
                    </div>
                    <p className="text-[10px] text-muted-foreground">{node.detail}</p>
                    {node.incidents !== undefined && node.incidents > 0 && (
                      <Badge variant="destructive" className="absolute -top-1 -right-1 text-[8px] h-4 px-1">
                        {node.incidents}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
