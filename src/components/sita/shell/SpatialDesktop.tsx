// ═══════════════════════════════════════════════════════════════
// SITA OS — Spatial Desktop
// 3-level zoomable environment: Overview → Workspace → App
// Workspaces arranged spatially with smooth transitions
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase, DollarSign, Headphones, Settings, BarChart3,
  FolderOpen, Calendar, ListTodo, LayoutDashboard, Minus, Plus,
  Maximize2, Grid3X3,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Zoom Levels ───────────────────────────────────────────────

export type ZoomLevel = "overview" | "workspace" | "app";

interface WorkspaceConfig {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  gradient: string;
  routes: { path: string; label: string; icon: React.ElementType }[];
  position: { x: number; y: number }; // spatial position in overview
}

const WORKSPACES: WorkspaceConfig[] = [
  {
    id: "business",
    label: "Business",
    icon: Briefcase,
    color: "hsl(220 80% 60%)",
    gradient: "from-blue-500/20 to-indigo-500/20",
    routes: [
      { path: "/business", label: "Dashboard", icon: LayoutDashboard },
      { path: "/business/leads", label: "Leads", icon: Briefcase },
      { path: "/revenue-office", label: "Revenue", icon: BarChart3 },
    ],
    position: { x: 0, y: 0 },
  },
  {
    id: "money",
    label: "Money",
    icon: DollarSign,
    color: "hsl(150 70% 50%)",
    gradient: "from-emerald-500/20 to-green-500/20",
    routes: [
      { path: "/money", label: "Dashboard", icon: LayoutDashboard },
      { path: "/money/transactions", label: "Transactions", icon: DollarSign },
    ],
    position: { x: 1, y: 0 },
  },
  {
    id: "concierge",
    label: "Concierge",
    icon: Headphones,
    color: "hsl(280 70% 60%)",
    gradient: "from-purple-500/20 to-fuchsia-500/20",
    routes: [
      { path: "/concierge", label: "Dashboard", icon: LayoutDashboard },
      { path: "/tasks", label: "Tasks", icon: ListTodo },
      { path: "/calendar", label: "Calendar", icon: Calendar },
    ],
    position: { x: 0, y: 1 },
  },
  {
    id: "system",
    label: "System",
    icon: Settings,
    color: "hsl(0 0% 60%)",
    gradient: "from-gray-500/20 to-slate-500/20",
    routes: [
      { path: "/settings", label: "Settings", icon: Settings },
      { path: "/files", label: "Files", icon: FolderOpen },
      { path: "/app-store", label: "Apps", icon: Grid3X3 },
    ],
    position: { x: 1, y: 1 },
  },
];

// ── Spatial Desktop Component ─────────────────────────────────

interface SpatialDesktopProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (path: string) => void;
}

export function SpatialDesktop({ isOpen, onClose, onNavigate }: SpatialDesktopProps) {
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>("overview");
  const [selectedWorkspace, setSelectedWorkspace] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);

  // Determine active workspace from current route
  const activeWorkspaceId = useMemo(() => {
    const segment = location.pathname.split("/").filter(Boolean)[0] || "home";
    const match = WORKSPACES.find(ws =>
      ws.routes.some(r => r.path.startsWith(`/${segment}`)) || ws.id === segment
    );
    return match?.id || null;
  }, [location.pathname]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (zoomLevel === "app") setZoomLevel("workspace");
        else if (zoomLevel === "workspace") setZoomLevel("overview");
        else onClose();
      }
      if (e.key === "-" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (zoomLevel === "app") setZoomLevel("workspace");
        else if (zoomLevel === "workspace") setZoomLevel("overview");
      }
      if (e.key === "=" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (zoomLevel === "overview" && selectedWorkspace) setZoomLevel("workspace");
        else if (zoomLevel === "workspace") setZoomLevel("app");
      }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, zoomLevel, selectedWorkspace, onClose]);

  // Handle workspace click
  const handleWorkspaceClick = useCallback((wsId: string) => {
    setSelectedWorkspace(wsId);
    setZoomLevel("workspace");
  }, []);

  // Handle route click
  const handleRouteClick = useCallback((path: string) => {
    navigate(path);
    onNavigate?.(path);
    onClose();
  }, [navigate, onNavigate, onClose]);

  // Zoom controls
  const zoomIn = useCallback(() => {
    if (zoomLevel === "overview" && selectedWorkspace) setZoomLevel("workspace");
    else if (zoomLevel === "workspace") setZoomLevel("app");
  }, [zoomLevel, selectedWorkspace]);

  const zoomOut = useCallback(() => {
    if (zoomLevel === "app") setZoomLevel("workspace");
    else if (zoomLevel === "workspace") setZoomLevel("overview");
  }, [zoomLevel]);

  if (!isOpen) return null;

  const currentWorkspace = WORKSPACES.find(ws => ws.id === selectedWorkspace);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[180] flex flex-col"
        style={{
          background: "hsl(0 0% 0% / 0.7)",
          backdropFilter: "blur(30px) saturate(1.5)",
        }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        {/* Top Bar */}
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-foreground/80">
              {zoomLevel === "overview" ? "All Workspaces" :
               zoomLevel === "workspace" ? currentWorkspace?.label || "Workspace" :
               "App View"}
            </span>
            <div className="flex items-center gap-1 bg-muted/20 rounded-lg px-2 py-1">
              {(["overview", "workspace", "app"] as ZoomLevel[]).map((level) => (
                <button
                  key={level}
                  onClick={() => {
                    if (level === "overview") setZoomLevel("overview");
                    else if (level === "workspace" && selectedWorkspace) setZoomLevel("workspace");
                    else if (level === "app" && selectedWorkspace) setZoomLevel("app");
                  }}
                  className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-medium transition-all",
                    zoomLevel === level
                      ? "bg-primary/20 text-primary"
                      : "text-muted-foreground/50 hover:text-foreground/70"
                  )}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={zoomOut} className="p-1.5 rounded-lg bg-muted/20 hover:bg-muted/40 text-foreground/60 transition-colors" title="Zoom out (Ctrl+-)">
              <Minus className="h-4 w-4" />
            </button>
            <button onClick={zoomIn} className="p-1.5 rounded-lg bg-muted/20 hover:bg-muted/40 text-foreground/60 transition-colors" title="Zoom in (Ctrl+=)">
              <Plus className="h-4 w-4" />
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg bg-muted/20 hover:bg-muted/40 text-foreground/60 transition-colors">
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div ref={containerRef} className="flex-1 flex items-center justify-center p-8 overflow-hidden">
          <AnimatePresence mode="wait">
            {/* OVERVIEW: All workspaces as cards in grid */}
            {zoomLevel === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                className="grid grid-cols-2 gap-6 max-w-2xl w-full"
              >
                {WORKSPACES.map((ws) => {
                  const Icon = ws.icon;
                  const isActive = ws.id === activeWorkspaceId;
                  return (
                    <motion.button
                      key={ws.id}
                      whileHover={{ scale: 1.04, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleWorkspaceClick(ws.id)}
                      className={cn(
                        "relative flex flex-col items-center gap-4 p-8 rounded-2xl border transition-all duration-300",
                        "bg-gradient-to-br",
                        ws.gradient,
                        isActive
                          ? "border-primary/40 ring-2 ring-primary/20"
                          : "border-border/20 hover:border-border/40"
                      )}
                      style={{ boxShadow: `0 8px 40px -12px ${ws.color}33` }}
                    >
                      <div
                        className="flex items-center justify-center h-16 w-16 rounded-2xl shadow-lg"
                        style={{ background: ws.color }}
                      >
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <div className="text-center">
                        <p className="text-base font-semibold text-foreground">{ws.label}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {ws.routes.length} apps
                        </p>
                      </div>
                      {isActive && (
                        <div className="absolute top-3 right-3 h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
                      )}
                    </motion.button>
                  );
                })}
              </motion.div>
            )}

            {/* WORKSPACE: Selected workspace with app cards */}
            {zoomLevel === "workspace" && currentWorkspace && (
              <motion.div
                key={`workspace-${currentWorkspace.id}`}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                className="flex flex-col items-center gap-8 max-w-3xl w-full"
              >
                {/* Workspace header */}
                <div className="flex items-center gap-4">
                  <div
                    className="flex items-center justify-center h-12 w-12 rounded-xl shadow-lg"
                    style={{ background: currentWorkspace.color }}
                  >
                    <currentWorkspace.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{currentWorkspace.label}</h2>
                    <p className="text-sm text-muted-foreground">{currentWorkspace.routes.length} apps in this workspace</p>
                  </div>
                </div>

                {/* App cards */}
                <div className="grid grid-cols-3 gap-4 w-full">
                  {currentWorkspace.routes.map((route, idx) => {
                    const RouteIcon = route.icon;
                    const isActive = location.pathname === route.path || location.pathname.startsWith(route.path + "/");
                    return (
                      <motion.button
                        key={route.path}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ scale: 1.05, y: -4 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleRouteClick(route.path)}
                        className={cn(
                          "flex flex-col items-center gap-3 p-6 rounded-xl border transition-all duration-200",
                          isActive
                            ? "border-primary/40 bg-primary/10"
                            : "border-border/20 bg-card/50 hover:bg-card/80 hover:border-border/40"
                        )}
                      >
                        <div className={cn(
                          "flex items-center justify-center h-12 w-12 rounded-xl",
                          isActive ? "bg-primary/20" : "bg-muted/30"
                        )}>
                          <RouteIcon className={cn("h-6 w-6", isActive ? "text-primary" : "text-foreground/70")} />
                        </div>
                        <span className={cn(
                          "text-sm font-medium",
                          isActive ? "text-primary" : "text-foreground/80"
                        )}>
                          {route.label}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Back button */}
                <button
                  onClick={() => setZoomLevel("overview")}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Back to all workspaces
                </button>
              </motion.div>
            )}

            {/* APP: Focused view placeholder */}
            {zoomLevel === "app" && (
              <motion.div
                key="app-view"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center gap-4 text-center"
              >
                <p className="text-lg font-semibold text-foreground">
                  {currentWorkspace?.label || "App"} — Focused View
                </p>
                <p className="text-sm text-muted-foreground max-w-md">
                  Navigate to an app to see it in focused view. Use Ctrl+- to zoom back out.
                </p>
                <button
                  onClick={() => setZoomLevel("workspace")}
                  className="text-xs text-primary hover:underline"
                >
                  ← Back to workspace
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Minimap */}
        <div className="fixed bottom-6 right-6 w-32 h-32 rounded-xl border border-border/20 bg-card/30 backdrop-blur-xl p-2 hidden lg:block">
          <div className="relative w-full h-full">
            {WORKSPACES.map((ws) => {
              const isSelected = ws.id === selectedWorkspace && zoomLevel !== "overview";
              return (
                <div
                  key={ws.id}
                  className={cn(
                    "absolute w-[45%] h-[45%] rounded-md transition-all duration-300",
                    isSelected ? "ring-2 ring-primary/60 scale-105" : "opacity-60"
                  )}
                  style={{
                    left: `${ws.position.x * 52}%`,
                    top: `${ws.position.y * 52}%`,
                    background: ws.color + "33",
                    border: `1px solid ${ws.color}44`,
                  }}
                >
                  <span className="text-[8px] text-foreground/50 p-1 block truncate">{ws.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default SpatialDesktop;
