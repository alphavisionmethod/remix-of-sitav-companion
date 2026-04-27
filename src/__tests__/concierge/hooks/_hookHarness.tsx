// ═══════════════════════════════════════════════════════════════
// Phase 6 — Hook Integration Harness (Concierge + Finance)
// Provides a QueryClientProvider wrapper so React Query data hooks
// can be exercised via @testing-library/react `renderHook`.
//
// Reuses the canonical Supabase + Auth mocks from src/test/test-utils
// (imported once via the helper test files in Phase 2). When the
// caller passes `authenticated: true`, queries gated on `user?.id`
// will run and resolve to `[]` (empty backend) so we can verify
// the full loading→ready transition through the real hook.
// ═══════════════════════════════════════════════════════════════

import React, { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
}

export function makeWrapper() {
  const client = makeQueryClient();
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { client, Wrapper };
}
