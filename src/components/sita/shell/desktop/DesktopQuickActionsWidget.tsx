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
  { label: "Files", icon: FolderOpen, gradient: "from-slate-500 to-slate-700", route: "/files" },
  { label: "Boardroom", icon: Presentation, gradient: "from-fuchsia-500 to-fuchsia-700", route: "/boardroom" },
  { label: "Trust", icon: ShieldCheck, gradient: "from-cyan-500 to-cyan-700", route: "/trust" },
  { label: "Settings", icon: Settings, gradient: "from-gray-500 to-gray-700", route: "/settings" },
  { label: "Search", icon: Search, gradient: "from-white/30 to-white/10", isSearch: true },
];

export function DesktopQuickActionsWidget({ onOpenCommand }: Props) {
  const navigate = useNavigate();

  return (
    <div className="rounded-2xl border border-white/[0.1] bg-white/[0.06] backdrop-blur-2xl p-4">
      <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40 mb-3">Apps</div>
      <div className="grid grid-cols-4 gap-3">
        {apps.map((a) => (
          <button
            key={a.label}
            onClick={() => a.isSearch ? onOpenCommand?.() : navigate(a.route!)}
            className="group flex flex-col items-center gap-1.5"
          >
            <div className={cn(
              "flex h-12 w-12 items-center justify-center rounded-[14px] bg-gradient-to-br shadow-lg",
              "transition-all duration-200 group-hover:scale-110 group-hover:shadow-xl",
              a.gradient
            )}>
              <a.icon className="h-5 w-5 text-white" />
            </div>
            <span className="text-[10px] text-white/60 group-hover:text-white/90 transition-colors">
              {a.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
