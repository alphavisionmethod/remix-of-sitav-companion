// ═══════════════════════════════════════════════════════════════
// SITA OS — Global Shortcuts
// Mounts in ShellLayout. Skips when typing in inputs.
// ═══════════════════════════════════════════════════════════════

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWindowManagerContext } from "@/contexts/WindowManagerContext";
import {
  closeFocused, minimizeFocused, lockScreen, toggleFullscreen,
  zoomIn, zoomOut, zoomReset, openShortcuts,
  saveActive, findInApp, execEditCommand, openSystemSettings,
} from "@/lib/system-menu/menu-actions";

function isTypingTarget(t: EventTarget | null): boolean {
  if (!(t instanceof HTMLElement)) return false;
  const tag = t.tagName.toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") return true;
  if (t.isContentEditable) return true;
  return false;
}

export function useGlobalShortcuts(opts: { onSearchOpen?: () => void } = {}) {
  const navigate = useNavigate();
  const wm = useWindowManagerContext();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      const ctrlMeta = e.metaKey && e.ctrlKey || (e.ctrlKey && e.metaKey);
      // Allow ⌘K from inputs (search palette is global)
      if (e.key.toLowerCase() === "k" && meta && !e.shiftKey) {
        e.preventDefault();
        opts.onSearchOpen?.();
        return;
      }
      if (isTypingTarget(e.target)) {
        // Edit shortcuts handled natively by browser inside inputs
        return;
      }

      // ⌘,
      if (meta && e.key === ",") { e.preventDefault(); navigate("/settings"); return; }
      // ⌘/  shortcuts dialog
      if (meta && e.key === "/") { e.preventDefault(); openShortcuts(); return; }
      // ⌃⌘Q lock
      if (e.ctrlKey && e.metaKey && e.key.toLowerCase() === "q") { e.preventDefault(); lockScreen(); return; }
      // ⌃⌘F fullscreen
      if (e.ctrlKey && e.metaKey && e.key.toLowerCase() === "f") { e.preventDefault(); toggleFullscreen(); return; }
      // ⌃⌘S sidebar
      if (e.ctrlKey && e.metaKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("sita-toggle-sidebar"));
        return;
      }
      // ⌘W close
      if (meta && e.key.toLowerCase() === "w" && wm) { e.preventDefault(); closeFocused(wm); return; }
      // ⌘M minimize
      if (meta && e.key.toLowerCase() === "m" && wm) { e.preventDefault(); minimizeFocused(wm); return; }
      // ⌘N new window
      if (meta && e.key.toLowerCase() === "n") { e.preventDefault(); window.dispatchEvent(new CustomEvent("sita-open-app", { detail: { appId: "files" }})); return; }
      // ⌘S save
      if (meta && e.key.toLowerCase() === "s" && !e.ctrlKey) { e.preventDefault(); saveActive(); return; }
      // ⌘F find
      if (meta && e.key.toLowerCase() === "f" && !e.ctrlKey) { e.preventDefault(); findInApp(); return; }
      // Zoom: ⌘+ / ⌘= / ⌘− / ⌘0
      if (meta && (e.key === "+" || e.key === "=")) { e.preventDefault(); zoomIn(); return; }
      if (meta && e.key === "-") { e.preventDefault(); zoomOut(); return; }
      if (meta && e.key === "0") { e.preventDefault(); zoomReset(); return; }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navigate, wm, opts.onSearchOpen]);
}
