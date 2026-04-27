// ═══════════════════════════════════════════════════════════════
// Business OS — Page Render Helper
// Thin extension of src/test/test-utils.tsx that adds the
// BusinessProfileProvider so adaptive surfaces resolve correctly.
// Reuses the canonical Supabase mock + QueryClient + MemoryRouter
// from test-utils — does not duplicate any of them.
// ═══════════════════════════════════════════════════════════════

import React from "react";
import { render as canonicalRender } from "@/test/test-utils";
import type { RenderOptions } from "@testing-library/react";
import { BusinessProfileProvider } from "@/modules/business/contexts/BusinessProfileContext";

interface BusinessRenderOptions extends Omit<RenderOptions, "wrapper"> {
  initialRoute?: string;
}

export function renderBusinessPage(
  ui: React.ReactElement,
  options: BusinessRenderOptions = {},
) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <BusinessProfileProvider>{children}</BusinessProfileProvider>
  );
  return canonicalRender(ui, { wrapper: Wrapper, ...options });
}

export * from "@testing-library/react";