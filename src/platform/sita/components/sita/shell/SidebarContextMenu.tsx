// ═══════════════════════════════════════════════════════════════
// SITA OS — Sidebar Context Menu
// Right-click options on sidebar domain items
// ═══════════════════════════════════════════════════════════════

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Pin, PinOff, RotateCcw, ExternalLink } from "lucide-react";

interface SidebarContextMenuProps {
  x: number;
  y: number;
  itemTitle: string;
  itemUrl: string;
  isPinned?: boolean;
  onClose: () => void;
  onPinToggle?: () => void;
  onClearState?: () => void;
  onOpenInNew?: () => void;
}

export function SidebarContextMenu({ x, y, itemTitle, onClose, isPinned, onPinToggle, onClearState, onOpenInNew }: SidebarContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    const handleClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener("keydown", handleKey);
    document.addEventListener("mousedown", handleClick);
    return () => { document.removeEventListener("keydown", handleKey); document.removeEventListener("mousedown", handleClick); };
  }, [onClose]);

  const menuW = 200;
  const menuH = 140;
  const clampedX = Math.min(x, window.innerWidth - menuW - 8);
  const clampedY = Math.min(y, window.innerHeight - menuH - 8);

  const items = [
    { id: "pin", label: isPinned ? "Unpin from Dock" : "Pin to Dock", icon: isPinned ? PinOff : Pin, onClick: onPinToggle },
    { id: "clear", label: "Clear App State", icon: RotateCcw, onClick: onClearState },
    { id: "new", label: "Open in New Tab", icon: ExternalLink, onClick: onOpenInNew },
  ].filter(i => i.onClick);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.92, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.12, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn(
        "fixed rounded-xl overflow-hidden z-[200]",
        "bg-[hsl(0_0%_8%/0.92)] backdrop-blur-2xl",
        "border border-[hsl(0_0%_100%/0.10)]",
        "shadow-[0_2px_6px_hsl(0_0%_0%/0.12),0_16px_32px_hsl(0_0%_0%/0.25)]"
      )}
      style={{ left: clampedX, top: clampedY, width: menuW }}
    >
      <div className="px-3 py-2 border-b border-[hsl(0_0%_100%/0.06)]">
        <p className="text-[10px] font-semibold text-[hsl(0_0%_50%)] uppercase tracking-wider truncate">{itemTitle}</p>
      </div>
      <div className="p-1">
        {items.map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => { item.onClick?.(); onClose(); }}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg",
                "text-[11px] font-medium text-[hsl(0_0%_80%)]",
                "hover:bg-[hsl(265_55%_58%/0.12)] transition-colors duration-75 cursor-default"
              )}
            >
              <Icon className="w-3.5 h-3.5 text-[hsl(0_0%_55%)]" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
