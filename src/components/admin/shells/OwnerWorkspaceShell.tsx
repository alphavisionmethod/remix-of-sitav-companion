import { ReactNode, useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from "react-router-dom";
import { TrustRibbon } from "@/components/sita/admin/TrustRibbon";
import { RolloutStatusBanner } from "./RolloutStatusBanner";
import { Button } from "@/components/ui/button";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import {
  Home, Activity, Heart, Shield, CheckCircle, Brain, DollarSign, AlertTriangle,
  Rocket, ChevronLeft, ChevronRight, Settings, GripVertical, RotateCcw,
} from "lucide-react";

interface OwnerWorkspaceShellProps {
  children: ReactNode;
}

const DEFAULT_TABS = [
  { id: "home", label: "Home", icon: Home, path: "/owner/home" },
  { id: "health", label: "Health", icon: Activity, path: "/owner/health" },
  { id: "pulse", label: "Pulse", icon: Heart, path: "/owner/pulse" },
  { id: "trust", label: "Trust", icon: Shield, path: "/owner/trust-center" },
  { id: "approvals", label: "Approvals", icon: CheckCircle, path: "/owner/approvals" },
  { id: "ai-team", label: "AI Team", icon: Brain, path: "/owner/ai-team" },
  { id: "revenue", label: "Revenue", icon: DollarSign, path: "/owner/billing" },
  { id: "risks", label: "Risks", icon: AlertTriangle, path: "/owner/governance" },
  { id: "launches", label: "Launches", icon: Rocket, path: "/owner/releases" },
] as const;

type TabDef = typeof DEFAULT_TABS[number];

const STORAGE_KEY = "owner-workspace-tab-order";

function loadTabOrder(): TabDef[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [...DEFAULT_TABS];
    const ids = JSON.parse(stored) as string[];
    const tabMap = new Map(DEFAULT_TABS.map(t => [t.id, t]));
    const ordered: TabDef[] = [];
    for (const id of ids) {
      const tab = tabMap.get(id);
      if (tab) {
        ordered.push(tab);
        tabMap.delete(id);
      }
    }
    // Append any new tabs not in stored order
    for (const tab of tabMap.values()) ordered.push(tab);
    return ordered;
  } catch {
    return [...DEFAULT_TABS];
  }
}

export function OwnerWorkspaceShell({ children }: OwnerWorkspaceShellProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [tabs, setTabs] = useState<TabDef[]>(loadTabOrder);

  const activeTab = tabs.find(t => location.pathname.startsWith(t.path))?.id || "home";

  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;
    const reordered = Array.from(tabs);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setTabs(reordered);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reordered.map(t => t.id)));
  }, [tabs]);

  const resetOrder = useCallback(() => {
    setTabs([...DEFAULT_TABS]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={cn(
        "border-r border-border/50 bg-card/30 flex flex-col transition-all duration-200 shrink-0",
        collapsed ? "w-14" : "w-48"
      )}>
        <div className="p-3 border-b border-border/50 flex items-center justify-between">
          {!collapsed && <span className="text-xs font-semibold text-foreground">Owner Workspace</span>}
          <button onClick={() => setCollapsed(!collapsed)} className="p-1 hover:bg-muted/30 rounded">
            {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </button>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="sidebar-tabs">
            {(provided) => (
              <nav
                className="flex-1 py-2 space-y-0.5 px-2"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {tabs.map((tab, index) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <Draggable key={tab.id} draggableId={tab.id} index={index}>
                      {(dragProvided, snapshot) => (
                        <div
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          className={cn(
                            "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs transition-colors group",
                            isActive
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/30",
                            snapshot.isDragging && "shadow-md bg-card border border-border/50"
                          )}
                        >
                          {!collapsed && (
                            <span
                              {...dragProvided.dragHandleProps}
                              className="opacity-0 group-hover:opacity-60 hover:!opacity-100 cursor-grab active:cursor-grabbing shrink-0"
                            >
                              <GripVertical className="h-3 w-3" />
                            </span>
                          )}
                          <button
                            onClick={() => navigate(tab.path)}
                            className="flex items-center gap-2.5 flex-1 min-w-0"
                          >
                            <Icon className="h-3.5 w-3.5 shrink-0" />
                            {!collapsed && <span className="truncate">{tab.label}</span>}
                          </button>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </nav>
            )}
          </Droppable>
        </DragDropContext>

        <div className="p-2 border-t border-border/50 space-y-0.5">
          {!collapsed && (
            <button
              onClick={resetOrder}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30"
            >
              <RotateCcw className="h-3.5 w-3.5 shrink-0" />
              <span>Reset order</span>
            </button>
          )}
          <button
            onClick={() => navigate("/settings")}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30"
          >
            <Settings className="h-3.5 w-3.5 shrink-0" />
            {!collapsed && <span>Settings</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0">
        <div className="border-b border-border/50 px-4 py-2 flex items-center justify-between bg-card/20">
          <TrustRibbon />
        </div>
        <div className="px-4 pt-2">
          <RolloutStatusBanner />
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
}
