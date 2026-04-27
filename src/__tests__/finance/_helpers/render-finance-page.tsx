// ═══════════════════════════════════════════════════════════════
// Finance OS — Page Render Helper
// Thin extension of src/test/test-utils.tsx that adds the
// Finance navigation provider so finance sub-pages resolve their
// active-module context. Reuses the canonical Supabase mock,
// QueryClient, and MemoryRouter from test-utils — no duplication.
// ═══════════════════════════════════════════════════════════════

import React from "react";
import { render as canonicalRender } from "@/test/test-utils";
import type { RenderOptions } from "@testing-library/react";
import { FinanceNavigationContext } from "@/modules/finance/contexts/FinanceNavigationContext";

interface FinanceRenderOptions extends Omit<RenderOptions, "wrapper"> {
  initialRoute?: string;
  activeModule?: string;
  navigateTo?: (moduleKey: string) => void;
  authenticated?: boolean;
}

export function renderFinancePage(
  ui: React.ReactElement,
  options: FinanceRenderOptions = {},
) {
  const navValue = {
    activeModule: options.activeModule ?? "overview",
    navigateTo: options.navigateTo ?? (() => {}),
  };
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <FinanceNavigationContext.Provider value={navValue}>
      {children}
    </FinanceNavigationContext.Provider>
  );
  const { initialRoute: _i, activeModule: _a, navigateTo: _n, ...rest } = options;
  return canonicalRender(ui, { wrapper: Wrapper, ...rest });
}

export * from "@testing-library/react";