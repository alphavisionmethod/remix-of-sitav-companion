// ═══════════════════════════════════════════════════════════════
// SITA OS — Standalone App Frame
// Wraps a single app's page in a focused, isolated window with
// a lightweight header. Used for every route OUTSIDE the
// Control Room (/owner) and the Desktop (/, /home, /desktop).
// No cross-app navigation is rendered here — the app's own
// internal tabs/nav remain inside `children`.
// ═══════════════════════════════════════════════════════════════

import { ReactNode, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Monitor, Briefcase, DollarSign, Headphones, FolderOpen,
  TrendingUp, BarChart3, Brain, Calendar, ListTodo, Settings, ShoppingBag,
  Home, Shield, LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";

type AppMeta = {
  title: string;
  icon: React.ElementType;
  accent: string; // tailwind gradient classes
};

// Route-prefix → app metadata. Keep this small and additive.
const APP_REGISTRY: Array<{ prefix: string; meta: AppMeta }> = [
  { prefix: "/business",       meta: { title: "Business",      icon: Briefcase,    accent: "from-blue-400 to-indigo-500" } },
  { prefix: "/money",          meta: { title: "Money",         icon: DollarSign,   accent: "from-emerald-400 to-green-500" } },
  { prefix: "/concierge",      meta: { title: "Concierge",     icon: Headphones,   accent: "from-purple-400 to-fuchsia-500" } },
  { prefix: "/files",          meta: { title: "Files",         icon: FolderOpen,   accent: "from-sky-400 to-blue-500" } },
  { prefix: "/revenue-office", meta: { title: "Revenue",       icon: TrendingUp,   accent: "from-yellow-400 to-amber-500" } },
  { prefix: "/boardroom",      meta: { title: "Boardroom",     icon: BarChart3,    accent: "from-indigo-400 to-violet-500" } },
  { prefix: "/intelligence",   meta: { title: "Intelligence",  icon: Brain,        accent: "from-cyan-400 to-blue-500" } },
  { prefix: "/calendar",       meta: { title: "Calendar",      icon: Calendar,     accent: "from-rose-400 to-pink-500" } },
  { prefix: "/tasks",          meta: { title: "Tasks",         icon: ListTodo,     accent: "from-teal-400 to-cyan-500" } },
  { prefix: "/pulse",          meta: { title: "Daily Pulse",   icon: Home,         accent: "from-amber-400 to-orange-500" } },
  { prefix: "/settings",       meta: { title: "Settings",      icon: Settings,     accent: "from-gray-400 to-slate-500" } },
  { prefix: "/app-store",      meta: { title: "App Store",     icon: ShoppingBag,  accent: "from-violet-400 to-purple-500" } },
  { prefix: "/admin",          meta: { title: "Mission Control", icon: Shield,     accent: "from-red-400 to-rose-500" } },
];

const FALLBACK_META: AppMeta = {
  title: "App",
  icon: LayoutGrid,
  accent: "from-slate-400 to-slate-600",
};

function resolveAppMeta(pathname: string): AppMeta {
  const match = APP_REGISTRY.find(({ prefix }) => pathname === prefix || pathname.startsWith(prefix + "/"));
  return match?.meta ?? FALLBACK_META;
}

export function StandaloneAppFrame({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const meta = useMemo(() => resolveAppMeta(location.pathname), [location.pathname]);
  const Icon = meta.icon;

  return (
    <div className="flex flex-1 flex-col min-w-0">
      {/* Focused single-app header */}
      <header
        className={cn(
          "flex items-center justify-between gap-3 px-4 py-2.5",
          "border-b border-sidebar-border/30 bg-surface-1/60 backdrop-blur-xl"
        )}
        aria-label={`${meta.title} app header`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br shadow-md shrink-0",
              meta.accent
            )}
          >
            <Icon className="h-[18px] w-[18px] text-white drop-shadow-sm" strokeWidth={1.8} />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-semibold text-foreground truncate">{meta.title}</h1>
            <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60">Standalone window</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => navigate("/owner")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium",
              "text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors"
            )}
            title="Back to Control Room"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
            <span className="hidden sm:inline">Control Room</span>
          </button>
          <button
            type="button"
            onClick={() => navigate("/home")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium",
              "text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors"
            )}
            title="Back to Desktop"
          >
            <Monitor className="h-3.5 w-3.5" strokeWidth={2} />
            <span className="hidden sm:inline">Desktop</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 min-w-0">{children}</div>
    </div>
  );
}