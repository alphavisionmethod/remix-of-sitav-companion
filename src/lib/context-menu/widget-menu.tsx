// ═══════════════════════════════════════════════════════════════
// SITA OS — Widget right-click menu spec
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
import { RefreshCw, Settings, Trash2, Pin, Maximize2 } from "lucide-react";

export interface WidgetMenuHandlers {
  widgetId: string;
  pinned?: boolean;
  onRefresh: () => void;
  onResize: (size: "sm" | "md" | "lg") => void;
  onTogglePinned: () => void;
  onSettings: () => void;
  onRemove: () => void;
}

export function WidgetMenuContent({ h }: { h: WidgetMenuHandlers }) {
  return (
    <ContextMenuContent className="w-52">
      <ContextMenuItem onSelect={h.onRefresh}>
        <RefreshCw className="mr-2 h-4 w-4" />
        Refresh
      </ContextMenuItem>

      <ContextMenuSub>
        <ContextMenuSubTrigger>
          <Maximize2 className="mr-2 h-4 w-4" />
          Resize
        </ContextMenuSubTrigger>
        <ContextMenuSubContent>
          <ContextMenuItem onSelect={() => h.onResize("sm")}>Small</ContextMenuItem>
          <ContextMenuItem onSelect={() => h.onResize("md")}>Medium</ContextMenuItem>
          <ContextMenuItem onSelect={() => h.onResize("lg")}>Large</ContextMenuItem>
        </ContextMenuSubContent>
      </ContextMenuSub>

      <ContextMenuCheckboxItem checked={!!h.pinned} onSelect={h.onTogglePinned}>
        <Pin className="mr-2 h-4 w-4" />
        Pin to position
      </ContextMenuCheckboxItem>

      <ContextMenuSeparator />

      <ContextMenuItem onSelect={h.onSettings}>
        <Settings className="mr-2 h-4 w-4" />
        Widget Settings…
      </ContextMenuItem>
      <ContextMenuItem
        onSelect={h.onRemove}
        className="text-destructive focus:text-destructive"
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Remove Widget
      </ContextMenuItem>
    </ContextMenuContent>
  );
}
