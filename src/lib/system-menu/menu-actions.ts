// ═══════════════════════════════════════════════════════════════
// SITA OS — System Menu Actions
// Pure action functions consumed by the SystemMenuBar dropdowns.
// Side-effect only; no UI.
// ═══════════════════════════════════════════════════════════════

import { toast } from "sonner";

/* ─── Custom Event Names ──────────────────────────────────────── */
export const MENU_EVENTS = {
  openAppStore: "sita-open-app-store",
  openMissionControl: "sita-open-mission-control",
  lockScreen: "sita-lock-screen",
  showAbout: "sita-show-about",
  showShortcuts: "sita-show-shortcuts",
  toggleSidebar: "sita-toggle-sidebar",
  toggleDock: "sita-toggle-dock",
  openWidgetPicker: "sita-open-widget-picker",
  saveActive: "sita-save-active",
  exportActive: "sita-export-active",
  findInApp: "sita-find-in-app",
  undo: "sita-undo",
  redo: "sita-redo",
} as const;

export function dispatchMenuEvent(name: string, detail?: any) {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

/* ─── Apple / Brand menu actions ──────────────────────────────── */
export function showAbout() {
  dispatchMenuEvent(MENU_EVENTS.showAbout);
}

export function openSystemSettings(openWindow: (id: string) => void) {
  openWindow("settings");
}

export function openAppStore() {
  dispatchMenuEvent(MENU_EVENTS.openAppStore, { module: "store" });
}

export function openMissionControl() {
  dispatchMenuEvent(MENU_EVENTS.openMissionControl);
}

export function lockScreen() {
  dispatchMenuEvent(MENU_EVENTS.lockScreen);
}

export async function signOutWithConfirm(signOut: () => Promise<void>) {
  if (!window.confirm("Sign out of SITA OS?")) return;
  try {
    await signOut();
    toast.success("Signed out");
  } catch (e) {
    toast.error("Sign-out failed");
  }
}

export function restartShell() {
  if (!window.confirm("Restart the SITA shell? Unsaved work in apps may be lost.")) return;
  window.location.reload();
}

/* ─── File menu actions ───────────────────────────────────────── */
export function newWindow(openWindow: (id: string) => void) {
  openWindow("files");
}

export async function openFileDialog() {
  // Bridge to FilePickerService via custom event so we don't import the hook here
  return new Promise<File | null>((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.onchange = () => resolve(input.files?.[0] ?? null);
    input.click();
  });
}

export function saveActive() {
  // Apps may listen and intercept. If nothing listens we still toast so user gets feedback.
  let handled = false;
  const listener = () => { handled = true; };
  window.addEventListener("sita-save-active-handled", listener, { once: true });
  dispatchMenuEvent(MENU_EVENTS.saveActive);
  setTimeout(() => {
    window.removeEventListener("sita-save-active-handled", listener);
    if (!handled) toast.info("Nothing to save in the active view");
  }, 50);
}

export function exportActive() {
  let handled = false;
  const listener = () => { handled = true; };
  window.addEventListener("sita-export-active-handled", listener, { once: true });
  dispatchMenuEvent(MENU_EVENTS.exportActive);
  setTimeout(() => {
    window.removeEventListener("sita-export-active-handled", listener);
    if (!handled) toast.info("Export not available for the active view");
  }, 50);
}

/* ─── Edit menu actions ───────────────────────────────────────── */
export function execEditCommand(cmd: "undo" | "redo" | "cut" | "copy" | "paste" | "selectAll") {
  try {
    document.execCommand(cmd);
    if (cmd === "undo") dispatchMenuEvent(MENU_EVENTS.undo);
    if (cmd === "redo") dispatchMenuEvent(MENU_EVENTS.redo);
  } catch {
    toast.info(`${cmd} not available here`);
  }
}

export function findInApp() {
  let handled = false;
  const listener = () => { handled = true; };
  window.addEventListener("sita-find-in-app-handled", listener, { once: true });
  dispatchMenuEvent(MENU_EVENTS.findInApp);
  setTimeout(() => {
    window.removeEventListener("sita-find-in-app-handled", listener);
    if (!handled) toast.info("Find isn't available in the active view");
  }, 50);
}

/* ─── View menu actions ───────────────────────────────────────── */
export function toggleSidebar() {
  dispatchMenuEvent(MENU_EVENTS.toggleSidebar);
}

export function toggleDock() {
  dispatchMenuEvent(MENU_EVENTS.toggleDock);
}

export function openWidgetPicker() {
  dispatchMenuEvent(MENU_EVENTS.openWidgetPicker);
}

export async function toggleFullscreen() {
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  } catch (e) {
    toast.error("Fullscreen not allowed in this context");
  }
}

const ZOOM_KEY = "sita-shell-zoom";
const ZOOM_MIN = 0.75;
const ZOOM_MAX = 1.5;
const ZOOM_STEP = 0.1;

function applyZoom(z: number) {
  const clamped = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, z));
  document.documentElement.style.fontSize = `${clamped * 16}px`;
  localStorage.setItem(ZOOM_KEY, String(clamped));
}

export function zoomIn() {
  const cur = parseFloat(localStorage.getItem(ZOOM_KEY) || "1");
  applyZoom(cur + ZOOM_STEP);
}
export function zoomOut() {
  const cur = parseFloat(localStorage.getItem(ZOOM_KEY) || "1");
  applyZoom(cur - ZOOM_STEP);
}
export function zoomReset() {
  applyZoom(1);
}
export function initZoomFromStorage() {
  const cur = parseFloat(localStorage.getItem(ZOOM_KEY) || "1");
  if (cur !== 1) applyZoom(cur);
}

/* ─── Window menu actions ─────────────────────────────────────── */
export interface WindowOpsLite {
  windows: Array<{ id: string; title: string; zIndex: number; minimized: boolean }>;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  closeWindow: (id: string) => void;
  updateWindowPosition: (id: string, pos: { x: number; y: number }, w?: number) => void;
}

export function topWindow(wm: WindowOpsLite): string | null {
  const visible = wm.windows.filter(w => !w.minimized).sort((a, b) => b.zIndex - a.zIndex);
  return visible[0]?.id ?? null;
}

export function minimizeFocused(wm: WindowOpsLite) {
  const id = topWindow(wm);
  if (id) wm.minimizeWindow(id);
  else toast.info("No window is open");
}

export function maximizeFocused(wm: WindowOpsLite) {
  const id = topWindow(wm);
  if (id) wm.maximizeWindow(id);
  else toast.info("No window is open");
}

export function closeFocused(wm: WindowOpsLite) {
  const id = topWindow(wm);
  if (id) wm.closeWindow(id);
  else toast.info("No window is open");
}

export function bringAllToFront(wm: WindowOpsLite) {
  const sorted = [...wm.windows].sort((a, b) => a.zIndex - b.zIndex);
  for (const w of sorted) wm.focusWindow(w.id);
  if (sorted.length === 0) toast.info("No windows to bring forward");
}

export function cascadeWindows(wm: WindowOpsLite) {
  const visible = wm.windows.filter(w => !w.minimized);
  if (visible.length === 0) {
    toast.info("No windows to cascade");
    return;
  }
  const baseX = 80;
  const baseY = 60;
  const offset = 32;
  visible.forEach((w, i) => {
    wm.updateWindowPosition(w.id, { x: baseX + i * offset, y: baseY + i * offset });
    wm.focusWindow(w.id);
  });
  toast.success(`Cascaded ${visible.length} window${visible.length === 1 ? "" : "s"}`);
}

export function closeAllWindows(wm: WindowOpsLite) {
  if (wm.windows.length === 0) {
    toast.info("No windows to close");
    return;
  }
  if (!window.confirm(`Close all ${wm.windows.length} window(s)?`)) return;
  for (const w of [...wm.windows]) wm.closeWindow(w.id);
}

/* ─── Help menu actions ───────────────────────────────────────── */
export function openHelp(openWindow: (id: string) => void) {
  // Help is rendered as Mission Control help tab; if no help app, fall back to support
  try { openWindow("help"); }
  catch { window.open("https://docs.lovable.dev", "_blank", "noopener,noreferrer"); }
}

export function openShortcuts() {
  dispatchMenuEvent(MENU_EVENTS.showShortcuts);
}

export function openDocumentation() {
  window.open("https://docs.lovable.dev", "_blank", "noopener,noreferrer");
}

export function reportIssue() {
  window.open("https://github.com/lovable-dev/issues/new", "_blank", "noopener,noreferrer");
}

export function whatsNew() {
  window.open("https://lovable.dev/changelog", "_blank", "noopener,noreferrer");
}
