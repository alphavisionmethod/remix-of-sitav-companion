import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDataMode } from "@/contexts/DataModeContext";
import { useDisplayMode } from "@/contexts/DisplayModeContext";
import { AISpendIndicator } from "./AISpendIndicator";
import { CommandPalette } from "./CommandPalette";
import { Wifi, Battery, BatteryCharging, Volume2, Search, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface MenuItemDef {
  label?: string;
  shortcut?: string;
  separator?: boolean;
  action?: () => void;
  disabled?: boolean;
}

interface MenuDef {
  label: string;
  bold?: boolean;
  items: MenuItemDef[];
}

const MenuDropdown = ({ menu, isOpen, onToggle, onClose }: { menu: MenuDef; isOpen: boolean; onToggle: () => void; onClose: () => void }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={onToggle}
        className={cn(
          "px-2.5 py-0.5 text-[13px] rounded-[4px] transition-colors",
          menu.bold ? "font-bold" : "font-medium",
          isOpen ? "bg-primary/20 text-foreground" : "text-foreground/80 hover:bg-secondary/60"
        )}
      >
        {menu.label}
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-0.5 w-56 rounded-lg border border-border bg-popover shadow-lg py-1 z-[100] glass-heavy animate-fade-in">
          {menu.items.map((item, i) =>
            item.separator ? (
              <div key={i} className="my-1 border-t border-border/50" />
            ) : (
              <button
                key={i}
                onClick={() => { item.action?.(); onClose(); }}
                disabled={item.disabled}
                className="w-full flex items-center justify-between px-3 py-1.5 text-[13px] text-foreground/90 hover:bg-primary/10 hover:text-foreground disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                <span>{item.label}</span>
                {item.shortcut && <span className="text-[11px] text-muted-foreground font-mono">{item.shortcut}</span>}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
};

export const MacMenuBar = () => {
  const [clock, setClock] = useState("");
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const { user } = useAuth();
  const { isDemoMode, toggleMode } = useDataMode();
  const { toggleFocus, toggleCalm, isFocus, isCalm } = useDisplayMode();

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setClock(now.toLocaleString("en-US", { weekday: "short", hour: "numeric", minute: "2-digit", hour12: true }));
    };
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";

  const menus: MenuDef[] = [
    {
      label: "SITA",
      bold: true,
      items: [
        { label: "About SITA OS", action: () => {} },
        { separator: true },
        { label: isDemoMode ? "Switch to Live Mode" : "Switch to Demo Mode", action: toggleMode },
        { separator: true },
        { label: "Preferences…", shortcut: "⌘," },
        { separator: true },
        { label: "Sign Out", action: () => {} },
      ],
    },
    {
      label: "File",
      items: [
        { label: "New Document", shortcut: "⌘N" },
        { label: "Upload Files", shortcut: "⌘U" },
        { separator: true },
        { label: "Export Data…", shortcut: "⇧⌘E" },
      ],
    },
    {
      label: "Edit",
      items: [
        { label: "Undo", shortcut: "⌘Z", disabled: true },
        { label: "Redo", shortcut: "⇧⌘Z", disabled: true },
        { separator: true },
        { label: "Copy", shortcut: "⌘C" },
        { label: "Paste", shortcut: "⌘V" },
      ],
    },
    {
      label: "View",
      items: [
        { label: isFocus ? "Exit Focus Mode" : "Focus Mode", shortcut: "⌘.", action: toggleFocus },
        { label: isCalm ? "Exit Calm Mode" : "Calm Mode", shortcut: "⌘,", action: toggleCalm },
        { separator: true },
        { label: "Reload", shortcut: "⌘R", action: () => window.location.reload() },
        { label: "Full Screen", shortcut: "⌃⌘F", action: () => document.documentElement.requestFullscreen?.() },
      ],
    },
    {
      label: "Window",
      items: [
        { label: "Minimize", shortcut: "⌘M" },
        { label: "Zoom" },
        { separator: true },
        { label: "Show Sidebar", shortcut: "⌃⌘S" },
      ],
    },
    {
      label: "Help",
      items: [
        { label: "SITA OS Help" },
        { label: "Keyboard Shortcuts", shortcut: "⌘/" },
        { separator: true },
        { label: "Report Issue" },
      ],
    },
  ];

  return (
    <div className="mac-menu-bar sticky top-0 z-50 flex h-7 items-center justify-between border-b border-border/40 glass-heavy px-3 select-none">
      {/* Left: Traffic lights + menus */}
      <div className="flex items-center gap-1">
        {/* Traffic lights */}
        <div className="flex items-center gap-1.5 mr-3">
          <div className="h-3 w-3 rounded-full bg-[hsl(0,70%,55%)] border border-[hsl(0,60%,40%)] hover:brightness-110 transition-all cursor-pointer" title="Close" />
          <div className="h-3 w-3 rounded-full bg-[hsl(45,90%,55%)] border border-[hsl(45,80%,40%)] hover:brightness-110 transition-all cursor-pointer" title="Minimize" />
          <div className="h-3 w-3 rounded-full bg-[hsl(130,55%,45%)] border border-[hsl(130,45%,35%)] hover:brightness-110 transition-all cursor-pointer" title="Maximize" />
        </div>

        {/* Menus */}
        {menus.map((menu, i) => (
          <MenuDropdown
            key={menu.label}
            menu={menu}
            isOpen={openMenu === i}
            onToggle={() => setOpenMenu(openMenu === i ? null : i)}
            onClose={() => setOpenMenu(null)}
          />
        ))}
      </div>

      {/* Right: Status items */}
      <div className="flex items-center gap-2">
        <AISpendIndicator />
        <Wifi className="h-3.5 w-3.5 text-foreground/60" />
        <Volume2 className="h-3.5 w-3.5 text-foreground/60" />
        <BatteryCharging className="h-3.5 w-3.5 text-foreground/60" />
        <CommandPalette />
        <span className="text-[12px] font-medium text-foreground/70 tabular-nums">{clock}</span>
      </div>
    </div>
  );
};
