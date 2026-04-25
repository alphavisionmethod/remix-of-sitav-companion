// ═══════════════════════════════════════════════════════════════
// SITA OS — App window right-click menu spec
// ═══════════════════════════════════════════════════════════════

import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuCheckboxItem,
} from "@/components/ui/context-menu";
import {
  Minus,
  Maximize2,
  Square,
  X,
  Move,
  Pin,
  Layout,
  Info,
  RefreshCw,
} from "lucide-react";
import type { OSWindow, SnapDirection } from "@/platform/sita/components/sita/os/WindowContext";

export interface AppWindowMenuHandlers {
  win: OSWindow;
  onRestore: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onClose: () => void;
  onSnap: (dir: SnapDirection) => void;
  onTogglePinned: () => void;
  onReload: () => void;
  onInfo: () => void;
  onMoveMode: () => void;
  onResizeMode: () => void;
}

export function AppWindowMenuContent({ h }: { h: AppWindowMenuHandlers }) {
  const { win } = h;
  return (
    <ContextMenuContent className="w-56">
      <ContextMenuItem disabled={!win.isMaximized} onSelect={h.onRestore}>
        <Square className="mr-2 h-4 w-4" />
        Restore
      </ContextMenuItem>
      <ContextMenuItem onSelect={h.onMoveMode}>
        <Move className="mr-2 h-4 w-4" />
        Move
      </ContextMenuItem>
      <ContextMenuItem onSelect={h.onResizeMode}>
        <Maximize2 className="mr-2 h-4 w-4" />
        Size
      </ContextMenuItem>
      <ContextMenuItem onSelect={h.onMinimize}>
        <Minus className="mr-2 h-4 w-4" />
        Minimize
        <span className="ml-auto text-xs text-muted-foreground">⌘M</span>
      </ContextMenuItem>
      <ContextMenuItem onSelect={h.onMaximize}>
        <Maximize2 className="mr-2 h-4 w-4" />
        {win.isMaximized ? "Unmaximize" : "Maximize"}
      </ContextMenuItem>

      <ContextMenuSeparator />

      <ContextMenuCheckboxItem checked={!!win.isPinned} onSelect={h.onTogglePinned}>
        <Pin className="mr-2 h-4 w-4" />
        Always on Top
      </ContextMenuCheckboxItem>

      <ContextMenuSub>
        <ContextMenuSubTrigger>
          <Layout className="mr-2 h-4 w-4" />
          Snap
        </ContextMenuSubTrigger>
        <ContextMenuSubContent>
          <ContextMenuItem onSelect={() => h.onSnap("left")}>Left half</ContextMenuItem>
          <ContextMenuItem onSelect={() => h.onSnap("right")}>Right half</ContextMenuItem>
          <ContextMenuItem onSelect={() => h.onSnap("top")}>Top half</ContextMenuItem>
          <ContextMenuItem onSelect={() => h.onSnap("bottom")}>Bottom half</ContextMenuItem>
          <ContextMenuItem onSelect={() => h.onSnap("center")}>Center</ContextMenuItem>
          <ContextMenuItem onSelect={() => h.onSnap("full")}>Full screen</ContextMenuItem>
        </ContextMenuSubContent>
      </ContextMenuSub>

      <ContextMenuSeparator />

      <ContextMenuItem onSelect={h.onReload}>
        <RefreshCw className="mr-2 h-4 w-4" />
        Reload App
      </ContextMenuItem>
      <ContextMenuItem onSelect={h.onInfo}>
        <Info className="mr-2 h-4 w-4" />
        App Info…
      </ContextMenuItem>

      <ContextMenuSeparator />

      <ContextMenuItem onSelect={h.onClose} className="text-destructive focus:text-destructive">
        <X className="mr-2 h-4 w-4" />
        Close
        <span className="ml-auto text-xs text-muted-foreground">⌘W</span>
      </ContextMenuItem>
    </ContextMenuContent>
  );
}
