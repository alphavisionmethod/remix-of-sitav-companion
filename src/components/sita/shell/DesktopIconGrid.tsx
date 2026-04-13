// ═══════════════════════════════════════════════════════════════
// NovaOS — Desktop Icon Grid
// Right-aligned file/folder icons with zero-clutter auto-hide
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { ICON_GRADIENTS } from "@/lib/design-system/nova-os";
import {
  Folder, Download, FileText, StickyNote, Trash2,
  Code2, FileDown, FileStack,
} from "lucide-react";

interface DesktopIcon {
  id: string;
  label: string;
  icon: React.ElementType;
  previewIcon?: React.ElementType; // Smart preview alternative
  gradient: string;
}

const DESKTOP_ICONS: DesktopIcon[] = [
  { id: "documents", label: "Documents", icon: FileText, previewIcon: FileStack, gradient: ICON_GRADIENTS.blue },
  { id: "downloads", label: "Downloads", icon: Download, previewIcon: FileDown, gradient: ICON_GRADIENTS.green },
  { id: "projects", label: "Projects", icon: Folder, previewIcon: Code2, gradient: ICON_GRADIENTS.purple },
  { id: "notes", label: "Notes", icon: StickyNote, gradient: ICON_GRADIENTS.gold },
  { id: "trash", label: "Trash", icon: Trash2, gradient: ICON_GRADIENTS.orange },
];

const IDLE_TIMEOUT = 8000;

interface DesktopIconGridProps {
  visible?: boolean;
  onOpenFolder?: (folderId: string) => void;
}

export function DesktopIconGrid({ visible = true, onOpenFolder }: DesktopIconGridProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [idle, setIdle] = useState(false);

  // Zero-clutter: hide after 8s idle
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const resetIdle = () => {
      setIdle(false);
      clearTimeout(timer);
      timer = setTimeout(() => setIdle(true), IDLE_TIMEOUT);
    };

    resetIdle();
    window.addEventListener("mousemove", resetIdle);
    window.addEventListener("keydown", resetIdle);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", resetIdle);
      window.removeEventListener("keydown", resetIdle);
    };
  }, []);

  const handleClick = useCallback((id: string) => {
    setSelectedId(prev => (prev === id ? null : id));
  }, []);

  const handleDoubleClick = useCallback((id: string) => {
    onOpenFolder?.(id);
  }, [onOpenFolder]);

  return (
    <div
      className={cn(
        "absolute top-16 right-6 flex flex-col gap-5 transition-opacity duration-500 select-none",
        idle ? "opacity-0" : "opacity-100",
        !visible && "opacity-0 pointer-events-none"
      )}
      style={{ zIndex: 11 }}
    >
      {DESKTOP_ICONS.map((item, i) => {
        const Icon = item.icon;
        const PreviewIcon = item.previewIcon;
        const isSelected = selectedId === item.id;
        return (
          <button
            key={item.id}
            className={cn(
              "flex flex-col items-center gap-1.5 w-[80px] group cursor-default",
              "transition-all duration-200"
            )}
            style={{
              animationDelay: `${i * 80}ms`,
            }}
            onClick={() => handleClick(item.id)}
            onDoubleClick={() => handleDoubleClick(item.id)}
          >
            <div
              className={cn(
                "w-13 h-13 rounded-[14px] bg-gradient-to-br flex items-center justify-center transition-all duration-200 relative overflow-hidden",
                item.gradient,
                isSelected && "ring-2 ring-[hsl(210_80%_60%/0.7)]",
                "group-hover:scale-[1.08]"
              )}
              style={{
                boxShadow: isSelected
                  ? "0 0 16px hsl(210 80% 60% / 0.35), 0 4px 16px hsl(0 0% 0% / 0.3)"
                  : "0 2px 8px hsl(0 0% 0% / 0.2), 0 6px 20px hsl(0 0% 0% / 0.15), inset 0 1px 0 hsl(0 0% 100% / 0.15)",
              }}
            >
              {/* Inner glow on hover */}
              <div className="absolute inset-0 rounded-[14px] bg-[hsl(0_0%_100%/0)] group-hover:bg-[hsl(0_0%_100%/0.10)] transition-colors duration-200" />
              <Icon className="w-5.5 h-5.5 text-[hsl(0_0%_100%/0.95)] relative z-10 drop-shadow-sm" />
              {/* Smart preview mini-icon */}
              {PreviewIcon && (
                <PreviewIcon className="absolute bottom-1 right-1 w-2.5 h-2.5 text-[hsl(0_0%_100%/0.4)]" />
              )}
            </div>
            <span
              className={cn(
                "text-[11px] font-medium truncate max-w-[76px] text-center leading-tight transition-colors duration-200",
                isSelected ? "text-[hsl(0_0%_100%/0.95)]" : "text-[hsl(0_0%_100%/0.75)]"
              )}
              style={{
                textShadow: "0 1px 4px hsl(0 0% 0% / 0.6)",
              }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
