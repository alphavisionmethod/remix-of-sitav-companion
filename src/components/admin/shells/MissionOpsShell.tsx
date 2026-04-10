import { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";
import { TrustRibbon } from "@/components/sita/admin/TrustRibbon";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Layers, Activity } from "lucide-react";

interface MissionOpsShellProps {
  children: ReactNode;
  registryPanel?: ReactNode;
  detailPanel?: ReactNode;
  actionLog?: ReactNode;
  scopeSummary?: string;
  breadcrumbs?: string[];
}

export function MissionOpsShell({
  children,
  registryPanel,
  detailPanel,
  actionLog,
  scopeSummary,
  breadcrumbs,
}: MissionOpsShellProps) {
  const [showActionLog, setShowActionLog] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="border-b border-border/50 px-4 py-2 flex items-center justify-between bg-card/30">
        <div className="flex items-center gap-3">
          <Layers className="h-4 w-4 text-primary" />
          {breadcrumbs && breadcrumbs.length > 0 && (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              {breadcrumbs.map((crumb, i) => (
                <span key={i} className="flex items-center gap-1">
                  {i > 0 && <span>/</span>}
                  <span className={i === breadcrumbs.length - 1 ? "text-foreground font-medium" : ""}>{crumb}</span>
                </span>
              ))}
            </div>
          )}
          <TrustRibbon />
        </div>
        {scopeSummary && (
          <Badge variant="outline" className="text-[9px] h-5">
            <Activity className="h-2.5 w-2.5 mr-1" /> {scopeSummary}
          </Badge>
        )}
      </div>

      {/* Main layout */}
      <div className="flex-1 flex min-h-0">
        {/* Left registry panel */}
        {registryPanel && (
          <aside className="w-64 border-r border-border/50 bg-card/20 overflow-y-auto shrink-0">
            {registryPanel}
          </aside>
        )}

        {/* Center content */}
        <main className="flex-1 min-w-0 overflow-y-auto p-4">
          {children}
        </main>

        {/* Right detail pane */}
        {detailPanel && (
          <aside className="w-80 border-l border-border/50 bg-card/20 overflow-y-auto shrink-0">
            {detailPanel}
          </aside>
        )}
      </div>

      {/* Bottom action log */}
      {actionLog && (
        <div className="border-t border-border/50 bg-card/30">
          <button
            onClick={() => setShowActionLog(!showActionLog)}
            className="w-full px-4 py-1.5 flex items-center justify-between text-[10px] text-muted-foreground hover:text-foreground"
          >
            <span className="font-medium">Action Log</span>
            {showActionLog ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
          </button>
          {showActionLog && (
            <div className="px-4 pb-3 max-h-48 overflow-y-auto">
              {actionLog}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
