// ═══════════════════════════════════════════════════════════════
// Nova SDK — Theme Provider
// Injects design system CSS custom properties into app windows
// Prevents apps from overriding root design tokens
// ═══════════════════════════════════════════════════════════════

import React, { createContext, useContext, useMemo, type ReactNode } from "react";
import { SPACE, TYPE, APP_MATERIALS, APP_SHADOWS, APP_CHROME } from "@/lib/design-system/app-window-system";
import { NOVA_MOTION, NOVA_SHADOWS, MATERIALS, DEPTH_LAYERS } from "@/lib/design-system/nova-os";

// ── Theme Token Interface ────────────────────────────────────

export interface NovaThemeTokens {
  spacing: typeof SPACE;
  typography: typeof TYPE;
  materials: typeof APP_MATERIALS;
  shadows: typeof APP_SHADOWS;
  chrome: typeof APP_CHROME;
  motion: typeof NOVA_MOTION;
  novaShadows: typeof NOVA_SHADOWS;
  novaMaterials: typeof MATERIALS;
  depthLayers: typeof DEPTH_LAYERS;
}

// ── Frozen Theme (read-only) ─────────────────────────────────

const FROZEN_TOKENS: NovaThemeTokens = Object.freeze({
  spacing: Object.freeze({ ...SPACE }),
  typography: Object.freeze({ ...TYPE }),
  materials: Object.freeze({ ...APP_MATERIALS }),
  shadows: Object.freeze({ ...APP_SHADOWS }),
  chrome: Object.freeze({ ...APP_CHROME }),
  motion: Object.freeze({ ...NOVA_MOTION }),
  novaShadows: Object.freeze({ ...NOVA_SHADOWS }),
  novaMaterials: Object.freeze({ ...MATERIALS }),
  depthLayers: Object.freeze({ ...DEPTH_LAYERS }),
}) as NovaThemeTokens;

// ── Context ──────────────────────────────────────────────────

const NovaThemeContext = createContext<NovaThemeTokens>(FROZEN_TOKENS);

// ── Provider Component ───────────────────────────────────────

interface NovaThemeProviderProps {
  children: ReactNode;
}

export function NovaThemeProvider({ children }: NovaThemeProviderProps) {
  // CSS custom properties injected inline for app scoping
  const cssVars = useMemo(() => ({
    "--nova-space-micro": `${SPACE.micro}px`,
    "--nova-space-tight": `${SPACE.tight}px`,
    "--nova-space-normal": `${SPACE.normal}px`,
    "--nova-space-section": `${SPACE.section}px`,
    "--nova-space-large": `${SPACE.large}px`,
    "--nova-type-label": `${TYPE.label.size}px`,
    "--nova-type-body": `${TYPE.body.size}px`,
    "--nova-type-title": `${TYPE.title.size}px`,
    "--nova-type-heading": `${TYPE.heading.size}px`,
    "--nova-chrome-titlebar": `${APP_CHROME.titleBarHeight}px`,
    "--nova-chrome-toolbar": `${APP_CHROME.toolbarHeight}px`,
    "--nova-chrome-radius": `${APP_CHROME.cornerRadius}px`,
    "--nova-motion-micro": `${NOVA_MOTION.duration.micro}s`,
    "--nova-motion-standard": `${NOVA_MOTION.duration.standard}s`,
    "--nova-motion-emphasis": `${NOVA_MOTION.duration.emphasis}s`,
  } as React.CSSProperties), []);

  return (
    <NovaThemeContext.Provider value={FROZEN_TOKENS}>
      <div style={cssVars} className="nova-theme-scope contents">
        {children}
      </div>
    </NovaThemeContext.Provider>
  );
}

// ── Hook (read-only access) ──────────────────────────────────

export function useNovaTheme(): Readonly<NovaThemeTokens> {
  return useContext(NovaThemeContext);
}
