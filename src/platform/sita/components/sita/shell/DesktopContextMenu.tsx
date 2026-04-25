// ═══════════════════════════════════════════════════════════════
// NovaOS — Desktop Context Menu
// Glassmorphic right-click menu with keyboard shortcut hints
// ═══════════════════════════════════════════════════════════════

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { APP_TYPE } from "@/platform/design-system/app-window-system";
import {
  FolderPlus, ArrowDownAZ, Image, Monitor, LayoutGrid,
} from "lucide-react";

interface DesktopContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
}

const MENU_ITEMS = [
  { id: "new-folder", label: "New Folder", icon: FolderPlus, shortcut: "⇧⌘N" },
  { id: "sort-by", label: "Sort By", icon: ArrowDownAZ, shortcut: "" },
  { id: "divider-1", label: "", icon: null, shortcut: "" },
  { id: "wallpaper", label: "Change Wallpaper", icon: Image, shortcut: "" },
  { id: "show-desktop", label: "Show Desktop", icon: Monitor, shortcut: "F11" },
  { id: "mission-control", label: "Mission Control", icon: LayoutGrid, shortcut: "F3" },
] as const;

export function DesktopContextMenu({ x, y, onClose }: DesktopContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [onClose]);

  const menuW = 220;
  const menuH = 220;
  const clampedX = Math.min(x, window.innerWidth - menuW - 8);
  const clampedY = Math.min(y, window.innerHeight - menuH - 8);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.92, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.12, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn(
        "fixed rounded-xl overflow-hidden",
        "bg-[hsl(0_0%_100%/0.70)] dark:bg-[hsl(0_0%_0%/0.70)]",
        "backdrop-blur-2xl",
        "border border-[hsl(0_0%_100%/0.25)] dark:border-[hsl(0_0%_100%/0.10)]",
        "shadow-[0_2px_6px_hsl(0_0%_0%/0.08),0_20px_40px_hsl(0_0%_0%/0.18)]"
      )}
      style={{
        left: clampedX,
        top: clampedY,
        width: menuW,
        zIndex: 50,
      }}
    >
      <div className="p-1.5">
        {MENU_ITEMS.map((item) => {
          if (item.icon === null) {
            return (
              <div
                key={item.id}
                className="h-px bg-[hsl(0_0%_50%/0.15)] my-1 mx-2"
              />
            );
          }
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={onClose}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg",
                "text-[12px] font-medium",
                "text-[hsl(0_0%_20%)] dark:text-[hsl(0_0%_85%)]",
                "hover:bg-[hsl(210_80%_60%/0.12)] dark:hover:bg-[hsl(210_80%_60%/0.18)]",
                "transition-colors duration-100 cursor-default"
              )}
            >
              <Icon className="w-3.5 h-3.5 text-[hsl(0_0%_40%)] dark:text-[hsl(0_0%_65%)]" />
              <span className="flex-1">{item.label}</span>
              {item.shortcut && (
                <span className={cn(APP_TYPE.label, "text-[hsl(0_0%_0%/0.25)] dark:text-[hsl(0_0%_100%/0.25)]")}>
                  {item.shortcut}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
