// ═══════════════════════════════════════════════════════════════
// SITA OS — Split Workspace
// Resizable list/detail layout with Surface Level hierarchy
// ═══════════════════════════════════════════════════════════════

import { cn } from "@/lib/utils";
import { useState, useRef, useCallback, type ReactNode } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface SplitWorkspaceProps {
  list: ReactNode;
  detail: ReactNode;
  hasSelection?: boolean;
  defaultSplit?: number; // percentage for list width (default 38)
  className?: string;
}

export function SplitWorkspace({ list, detail, hasSelection = false, defaultSplit = 38, className }: SplitWorkspaceProps) {
  const isMobile = useIsMobile();
  const [split, setSplit] = useState(defaultSplit);
  const dragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const onDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;

    const onMove = (ev: MouseEvent) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((ev.clientX - rect.left) / rect.width) * 100;
      setSplit(Math.max(25, Math.min(65, pct)));
    };

    const onUp = () => {
      dragging.current = false;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }, []);

  // Mobile: show list or detail based on selection
  if (isMobile) {
    return (
      <div className={cn("flex flex-col h-full", className)}>
        {!hasSelection ? (
          <div className="flex-1 overflow-y-auto bg-[hsl(0_0%_9%)]">{list}</div>
        ) : (
          <div className="flex-1 overflow-y-auto bg-[hsl(0_0%_12%)]">{detail}</div>
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn("flex h-full overflow-hidden", className)}>
      {/* List pane (Surface 1) */}
      <div
        className="overflow-y-auto bg-[hsl(0_0%_9%)] border-r border-[hsl(0_0%_100%/0.06)]"
        style={{ width: `${split}%` }}
      >
        {list}
      </div>

      {/* Divider */}
      <div
        onMouseDown={onDragStart}
        className="w-[3px] shrink-0 cursor-col-resize relative group"
      >
        <div className="absolute inset-0 bg-[hsl(0_0%_100%/0.04)] group-hover:bg-[hsl(265_55%_58%/0.30)] transition-colors" />
      </div>

      {/* Detail pane (Surface 2) */}
      <div
        className="flex-1 overflow-y-auto bg-[hsl(0_0%_12%)]"
      >
        {detail}
      </div>
    </div>
  );
}
