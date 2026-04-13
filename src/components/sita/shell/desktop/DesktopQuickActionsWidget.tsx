import { useNavigate } from "react-router-dom";
import {
  Briefcase, TrendingUp, Users, FolderOpen,
  Presentation, ShieldCheck, Settings, Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  onOpenCommand?: () => void;
}

const apps = [
  { label: "Business", icon: Briefcase, gradient: "from-violet-500 to-violet-700", route: "/business" },
  { label: "Finance", icon: TrendingUp, gradient: "from-emerald-500 to-emerald-700", route: "/finance" },
  { label: "Concierge", icon: Users, gradient: "from-amber-500 to-amber-700", route: "/concierge" },
  { label: "Files", icon: FolderOpen, gradient: "from-slate-400 to-slate-600", route: "/files" },
  { label: "Boardroom", icon: Presentation, gradient: "from-fuchsia-500 to-fuchsia-700", route: "/boardroom" },
  { label: "Trust", icon: ShieldCheck, gradient: "from-cyan-500 to-cyan-700", route: "/trust" },
  { label: "Settings", icon: Settings, gradient: "from-gray-400 to-gray-600", route: "/settings" },
  { label: "Search", icon: Search, gradient: "from-white/20 to-white/5", isSearch: true },
];

export function DesktopQuickActionsWidget({ onOpenCommand }: Props) {
  const navigate = useNavigate();

  return (
    <div className="rounded-3xl border border-white/[0.04] bg-white/[0.02] backdrop-blur-3xl p-4">
      <div className="grid grid-cols-4 gap-3">
        {apps.map((a) => (
          <button
            key={a.label}
            onClick={() => a.isSearch ? onOpenCommand?.() : navigate(a.route!)}
            className="group flex flex-col items-center gap-1.5"
          >
            <div className={cn(
              "flex h-11 w-11 items-center justify-center rounded-[14px] bg-gradient-to-br",
              "transition-all duration-200 group-hover:scale-110 group-hover:brightness-110",
              "shadow-[0_4px_12px_rgba(0,0,0,0.15)]",
              a.gradient
            )}>
              <a.icon className="h-5 w-5 text-white/90" />
            </div>
            <span className="text-[10px] text-white/40 group-hover:text-white/70 transition-colors">
              {a.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
