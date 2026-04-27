// ═══════════════════════════════════════════════════════════════
// Concierge OS — Page Render Helper
// Thin extension of src/test/test-utils.tsx that adds the
// Concierge navigation + CAI data providers so concierge sub-pages
// resolve their context without duplicating the canonical Supabase
// mock, QueryClient, or MemoryRouter from test-utils.
// ═══════════════════════════════════════════════════════════════

import React from "react";
import { render as canonicalRender } from "@/test/test-utils";
import type { RenderOptions } from "@testing-library/react";
import {
  ConciergeDataProvider,
  type ConciergeCAIData,
} from "@/modules/concierge/contexts/ConciergeDataContext";
import { ConciergeNavigationContext } from "@/modules/concierge/contexts/ConciergeNavigationContext";

interface ConciergeRenderOptions extends Omit<RenderOptions, "wrapper"> {
  initialRoute?: string;
  cai?: Partial<ConciergeCAIData>;
  activeModule?: string;
  navigateTo?: (moduleKey: string) => void;
  authenticated?: boolean;
}

const EMPTY_CAI: ConciergeCAIData = {
  relationships: [],
  obligations: [],
};

export function renderConciergePage(
  ui: React.ReactElement,
  options: ConciergeRenderOptions = {},
) {
  const cai: ConciergeCAIData = { ...EMPTY_CAI, ...(options.cai ?? {}) };
  const navValue = {
    activeModule: options.activeModule ?? "overview",
    navigateTo: options.navigateTo ?? (() => {}),
  };
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <ConciergeNavigationContext.Provider value={navValue}>
      <ConciergeDataProvider value={cai}>{children}</ConciergeDataProvider>
    </ConciergeNavigationContext.Provider>
  );
  const { initialRoute: _ignored, cai: _ignored2, activeModule: _ignored3, navigateTo: _ignored4, ...rest } = options;
  return canonicalRender(ui, { wrapper: Wrapper, ...rest });
}

export * from "@testing-library/react";