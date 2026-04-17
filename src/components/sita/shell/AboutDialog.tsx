// ═══════════════════════════════════════════════════════════════
// SITA OS — About Dialog
// Triggered by the Apple/SITA brand menu's "About SITA OS" item.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import logo from "@/assets/logo.webp";
import { MENU_EVENTS } from "@/lib/system-menu/menu-actions";

const VERSION = "1.0.0";
const BUILD = (typeof __BUILD_ID__ !== "undefined" ? __BUILD_ID__ : "dev"); // optional vite-define
const RUNTIME = typeof window !== "undefined" && (window as any).electron ? "Desktop (Electron)" : "Web";

declare const __BUILD_ID__: string;

export function AboutDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener(MENU_EVENTS.showAbout, handler);
    return () => window.removeEventListener(MENU_EVENTS.showAbout, handler);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-sm">
        <DialogHeader className="items-center text-center">
          <img src={logo} alt="SITA" className="h-16 w-16 rounded-lg shadow-lg mb-2" />
          <DialogTitle className="text-xl">SITA OS</DialogTitle>
          <DialogDescription>Operating system for ambitious work</DialogDescription>
        </DialogHeader>
        <div className="space-y-2 text-sm text-center text-muted-foreground">
          <p>Version <span className="text-foreground font-medium">{VERSION}</span></p>
          <p>Build <span className="text-foreground font-mono text-xs">{BUILD}</span></p>
          <p>Runtime <span className="text-foreground font-medium">{RUNTIME}</span></p>
          <p className="pt-3 text-xs">© {new Date().getFullYear()} SITA. All rights reserved.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
