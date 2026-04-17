// ═══════════════════════════════════════════════════════════════
// SITA OS — Desktop right-click menu spec
// ═══════════════════════════════════════════════════════════════

import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from "@/components/ui/context-menu";
import {
  LayoutGrid,
  ArrowUpDown,
  RefreshCw,
  FolderPlus,
  FilePlus,
  Plus,
  Image as ImageIcon,
  Terminal,
  Monitor,
  Palette,
} from "lucide-react";
import { CommonAppsSubmenu } from "./common-apps-submenu";

export interface DesktopMenuHandlers {
  onAddWidget: () => void;
  onChangeWallpaper: () => void;
  onOpenSettings: () => void;
  onPersonalize: () => void;
  onRefresh: () => void;
  onNewFolder: () => void;
  onNewFile: (kind: "document" | "spreadsheet" | "note") => void;
  onSetIconSize: (size: "sm" | "md" | "lg") => void;
  onSortBy: (key: "name" | "type" | "recent") => void;
  onOpenTerminal: () => void;
}

export function DesktopMenuContent({ h }: { h: DesktopMenuHandlers }) {
  return (
    <ContextMenuContent className="w-60">
      <ContextMenuSub>
        <ContextMenuSubTrigger>
          <LayoutGrid className="mr-2 h-4 w-4" />
          View
        </ContextMenuSubTrigger>
        <ContextMenuSubContent>
          <ContextMenuItem onSelect={() => h.onSetIconSize("sm")}>Small icons</ContextMenuItem>
          <ContextMenuItem onSelect={() => h.onSetIconSize("md")}>Medium icons</ContextMenuItem>
          <ContextMenuItem onSelect={() => h.onSetIconSize("lg")}>Large icons</ContextMenuItem>
        </ContextMenuSubContent>
      </ContextMenuSub>

      <ContextMenuSub>
        <ContextMenuSubTrigger>
          <ArrowUpDown className="mr-2 h-4 w-4" />
          Sort by
        </ContextMenuSubTrigger>
        <ContextMenuSubContent>
          <ContextMenuItem onSelect={() => h.onSortBy("name")}>Name</ContextMenuItem>
          <ContextMenuItem onSelect={() => h.onSortBy("type")}>Type</ContextMenuItem>
          <ContextMenuItem onSelect={() => h.onSortBy("recent")}>Recently added</ContextMenuItem>
        </ContextMenuSubContent>
      </ContextMenuSub>

      <ContextMenuItem onSelect={h.onRefresh}>
        <RefreshCw className="mr-2 h-4 w-4" />
        Refresh desktop
      </ContextMenuItem>

      <ContextMenuSeparator />

      <ContextMenuItem onSelect={h.onNewFolder}>
        <FolderPlus className="mr-2 h-4 w-4" />
        New Folder
      </ContextMenuItem>

      <ContextMenuSub>
        <ContextMenuSubTrigger>
          <FilePlus className="mr-2 h-4 w-4" />
          New File
        </ContextMenuSubTrigger>
        <ContextMenuSubContent>
          <ContextMenuItem onSelect={() => h.onNewFile("document")}>Document</ContextMenuItem>
          <ContextMenuItem onSelect={() => h.onNewFile("spreadsheet")}>Spreadsheet</ContextMenuItem>
          <ContextMenuItem onSelect={() => h.onNewFile("note")}>Note</ContextMenuItem>
        </ContextMenuSubContent>
      </ContextMenuSub>

      <ContextMenuSeparator />

      <ContextMenuItem onSelect={h.onAddWidget}>
        <Plus className="mr-2 h-4 w-4" />
        Add Widget…
      </ContextMenuItem>
      <ContextMenuItem onSelect={h.onChangeWallpaper}>
        <ImageIcon className="mr-2 h-4 w-4" />
        Change Wallpaper…
      </ContextMenuItem>

      <ContextMenuSeparator />

      <ContextMenuItem onSelect={h.onOpenTerminal}>
        <Terminal className="mr-2 h-4 w-4" />
        Open in Terminal
      </ContextMenuItem>
      <CommonAppsSubmenu />

      <ContextMenuSeparator />

      <ContextMenuItem onSelect={h.onOpenSettings}>
        <Monitor className="mr-2 h-4 w-4" />
        Display Settings
      </ContextMenuItem>
      <ContextMenuItem onSelect={h.onPersonalize}>
        <Palette className="mr-2 h-4 w-4" />
        Personalize
      </ContextMenuItem>
    </ContextMenuContent>
  );
}
