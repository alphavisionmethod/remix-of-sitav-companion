// ═══════════════════════════════════════════════════════════════
// Nova SDK — Window API
// Apps request windows through this API; wraps useWindowManager
// ═══════════════════════════════════════════════════════════════

import type { AppManifest } from "../core/manifest";

export interface NovaWindowOptions {
  width?: number;
  height?: number;
  title?: string;
  resizable?: boolean;
  transparent?: boolean;
  position?: { x: number; y: number };
  originRect?: { x: number; y: number; width: number; height: number };
}

export interface NovaWindowHandle {
  id: string;
  setTitle(title: string): void;
  close(): void;
  minimize(): void;
  focus(): void;
}

// Window API factory — creates an API bound to a specific app manifest + window manager
export function createWindowAPI(
  manifest: AppManifest,
  wmOpenWindow: (id: string, config: any) => void,
  wmCloseWindow: (id: string) => void,
  wmFocusWindow: (id: string) => void,
  wmMinimizeWindow: (id: string) => void,
) {
  const MIN_WIDTH = 200;
  const MIN_HEIGHT = 150;
  const MAX_WIDTH = 2000;
  const MAX_HEIGHT = 1500;

  function create(component: React.ReactNode, options: NovaWindowOptions = {}): NovaWindowHandle {
    const defaults = manifest.windowDefaults;
    const width = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, options.width ?? defaults.width));
    const height = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, options.height ?? defaults.height));
    const title = options.title ?? manifest.name;
    const id = manifest.id;

    wmOpenWindow(id, {
      title,
      component,
      position: options.position ?? { x: 120, y: 100 },
      width,
      originRect: options.originRect,
    });

    return {
      id,
      setTitle: (_title: string) => {
        // Future: wm.updateWindow support
      },
      close: () => wmCloseWindow(id),
      minimize: () => wmMinimizeWindow(id),
      focus: () => wmFocusWindow(id),
    };
  }

  return { create };
}
