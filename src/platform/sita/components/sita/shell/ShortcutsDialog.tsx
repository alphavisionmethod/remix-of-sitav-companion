// ═══════════════════════════════════════════════════════════════
// SITA OS — Keyboard Shortcuts Dialog
// Triggered by Help → Keyboard Shortcuts (⌘/)
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MENU_EVENTS } from "@/lib/system-menu/menu-actions";

const SHORTCUTS: { group: string; items: { keys: string; label: string }[] }[] = [
  {
    group: "System",
    items: [
      { keys: "⌘ K", label: "Open search / command palette" },
      { keys: "⌘ ,", label: "Open System Settings" },
      { keys: "⌘ /", label: "Show keyboard shortcuts" },
      { keys: "⌃ ⌘ Q", label: "Lock screen" },
      { keys: "⌃ ⌘ F", label: "Toggle fullscreen" },
      { keys: "⌃ ⌘ S", label: "Toggle sidebar" },
    ],
  },
  {
    group: "Window",
    items: [
      { keys: "⌘ N", label: "New window" },
      { keys: "⌘ W", label: "Close window" },
      { keys: "⌘ M", label: "Minimize window" },
    ],
  },
  {
    group: "View",
    items: [
      { keys: "⌘ +", label: "Zoom in" },
      { keys: "⌘ −", label: "Zoom out" },
      { keys: "⌘ 0", label: "Actual size" },
    ],
  },
  {
    group: "Edit",
    items: [
      { keys: "⌘ Z / ⇧⌘ Z", label: "Undo / Redo" },
      { keys: "⌘ X / C / V", label: "Cut / Copy / Paste" },
      { keys: "⌘ A", label: "Select all" },
      { keys: "⌘ F", label: "Find in app" },
      { keys: "⌘ S", label: "Save" },
    ],
  },
];

export function ShortcutsDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener(MENU_EVENTS.showShortcuts, handler);
    return () => window.removeEventListener(MENU_EVENTS.showShortcuts, handler);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {SHORTCUTS.map(group => (
            <div key={group.group}>
              <h4 className="text-xs uppercase tracking-wide text-muted-foreground mb-2">{group.group}</h4>
              <div className="space-y-1">
                {group.items.map(item => (
                  <div key={item.keys} className="flex items-center justify-between text-sm py-1.5 border-b border-border/50 last:border-0">
                    <span>{item.label}</span>
                    <kbd className="px-2 py-0.5 rounded bg-muted text-xs font-mono">{item.keys}</kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
