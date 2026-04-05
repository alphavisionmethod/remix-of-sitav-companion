import { ReactNode, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, PanelRightClose, PanelRightOpen, Layers, FileText, Activity } from "lucide-react";

interface MissionOpsShellProps {
  children: ReactNode;
  registryItems?: { label: string; path: string; count?: number }[];
  detailPane?: ReactNode;
  actionLog?: ReactNode;
}

export function MissionOpsShell({ children, registryItems, detailPane, actionLog }: MissionOpsShellProps) {
  const location = useLocation();
  const [detailOpen, setDetailOpen] = useState(!!detailPane);

  const segments = location.pathname.split("/").filter(Boolean);
  const breadcrumbs = segments.map((seg, i) => ({
    label: seg.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
    path: "/" + segments.slice(0, i + 1).join("/"),
  }));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Breadcrumb */}
      <header className="border-b px-4 py-2 flex items-center justify-between bg-card/30">
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          {breadcrumbs.map((bc, i) => (
            <span key={bc.path} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="h-3 w-3" />}
              <Link to={bc.path} className={cn("hover:text-foreground", i === breadcrumbs.length - 1 && "text-foreground font-medium")}>{bc.label}</Link>
            </span>
          ))}
        </div>
        {detailPane && (
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setDetailOpen(!detailOpen)}>
            {detailOpen ? <PanelRightClose className="h-3.5 w-3.5" /> : <PanelRightOpen className="h-3.5 w-3.5" />}
          </Button>
        )}
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Registry tree */}
        {registryItems && (
          <aside className="w-52 border-r bg-card/30 py-3 px-2 space-y-0.5 overflow-y-auto shrink-0">
            <div className="px-2 mb-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="h-3 w-3" /> Registry
            </div>
            {registryItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors",
                    isActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <span>{item.label}</span>
                  {item.count != null && <Badge variant="secondary" className="text-[9px] px-1.5 py-0">{item.count}</Badge>}
                </Link>
              );
            })}
          </aside>
        )}

        {/* Center: Main content */}
        <main className="flex-1 overflow-auto">{children}</main>

        {/* Right: Detail pane */}
        {detailPane && detailOpen && (
          <aside className="w-80 border-l bg-card/30 overflow-y-auto shrink-0">
            <div className="p-3 border-b text-[10px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="h-3 w-3" /> Detail
            </div>
            <div className="p-3">{detailPane}</div>
          </aside>
        )}
      </div>

      {/* Bottom: Action log */}
      {actionLog && (
        <footer className="border-t bg-card/30 px-4 py-2 max-h-32 overflow-y-auto">
          <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <Activity className="h-3 w-3" /> Action Log
          </div>
          {actionLog}
        </footer>
      )}
    </div>
  );
}

export default MissionOpsShell;
