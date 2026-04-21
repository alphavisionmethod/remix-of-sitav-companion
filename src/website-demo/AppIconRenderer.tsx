import React from "react";
import {
  Briefcase, DollarSign, Sparkles, Users,
  TrendingUp, FolderOpen, FileText, Settings
} from "lucide-react";
import type { DemoAppId } from "./demo-data";

const ICON_CONFIG: Record<DemoAppId, {
  gradient: [string, string];
  Icon: React.ElementType;
  shadow: string;
}> = {
  business: {
    gradient: ["#1a6dff", "#38bdf8"],
    Icon: Briefcase,
    shadow: "rgba(26,109,255,0.5)",
  },
  finance: {
    gradient: ["#059669", "#34d399"],
    Icon: DollarSign,
    shadow: "rgba(5,150,105,0.5)",
  },
  concierge: {
    gradient: ["#7c3aed", "#e879f9"],
    Icon: Sparkles,
    shadow: "rgba(124,58,237,0.5)",
  },
  boardroom: {
    gradient: ["#d97706", "#fb923c"],
    Icon: Users,
    shadow: "rgba(217,119,6,0.5)",
  },
  investment: {
    gradient: ["#16a34a", "#86efac"],
    Icon: TrendingUp,
    shadow: "rgba(22,163,74,0.5)",
  },
  files: {
    gradient: ["#0ea5e9", "#7dd3fc"],
    Icon: FolderOpen,
    shadow: "rgba(14,165,233,0.5)",
  },
  notes: {
    gradient: ["#eab308", "#fde68a"],
    Icon: FileText,
    shadow: "rgba(234,179,8,0.5)",
  },
  settings: {
    gradient: ["#64748b", "#94a3b8"],
    Icon: Settings,
    shadow: "rgba(100,116,139,0.5)",
  },
};

interface Props {
  appId: DemoAppId;
  size?: number;
  className?: string;
  glowOnHover?: boolean;
}

export function AppIconRenderer({ appId, size = 56, className = "", glowOnHover = false }: Props) {
  const config = ICON_CONFIG[appId];
  if (!config) return null;
  const { gradient, Icon, shadow } = config;
  const iconSize = Math.round(size * 0.48);
  const gradientId = `icon-grad-${appId}`;

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: "22%",
        background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`,
        boxShadow: glowOnHover ? undefined : `0 4px 14px -2px ${shadow}`,
        transition: "box-shadow 0.2s, transform 0.2s",
      }}
      onMouseEnter={(e) => {
        if (glowOnHover) {
          (e.currentTarget as HTMLDivElement).style.boxShadow = `0 6px 24px -2px ${shadow}`;
        }
      }}
      onMouseLeave={(e) => {
        if (glowOnHover) {
          (e.currentTarget as HTMLDivElement).style.boxShadow = `0 4px 14px -2px ${shadow}`;
        }
      }}
    >
      {/* highlight overlay */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 50%)",
          borderRadius: "22%",
        }}
      />
      <Icon size={iconSize} color="white" strokeWidth={1.8} className="relative z-10 drop-shadow-sm" />
    </div>
  );
}