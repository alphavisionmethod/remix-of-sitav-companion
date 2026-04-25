// ═══════════════════════════════════════════════════════════════
// SITA OS — SecurePromptProvider
// Context provider for trusted elevation prompts
// ═══════════════════════════════════════════════════════════════

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { ElevationRequest, OSAuthMethod } from "@/lib/os-security/types";
import { getElevationEngine, type ElevationResult } from "@/lib/os-security/elevation-engine";

interface SecurePromptState {
  isOpen: boolean;
  request: ElevationRequest | null;
}

interface SecurePromptContextType {
  state: SecurePromptState;
  requestElevation: (request: ElevationRequest) => Promise<ElevationResult>;
  submitCredential: (credential: string, method?: OSAuthMethod) => void;
  cancel: () => void;
}

const SecurePromptContext = createContext<SecurePromptContextType | null>(null);

export function useSecurePrompt() {
  const ctx = useContext(SecurePromptContext);
  if (!ctx) throw new Error("useSecurePrompt must be used within SecurePromptProvider");
  return ctx;
}

export function SecurePromptProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SecurePromptState>({ isOpen: false, request: null });
  const [pendingResolve, setPendingResolve] = useState<{
    resolve: (result: ElevationResult) => void;
  } | null>(null);

  const requestElevation = useCallback((request: ElevationRequest): Promise<ElevationResult> => {
    return new Promise((resolve) => {
      setState({ isOpen: true, request });
      setPendingResolve({ resolve });
    });
  }, []);

  const submitCredential = useCallback((credential: string, method: OSAuthMethod = "password") => {
    if (!state.request || !pendingResolve) return;

    const engine = getElevationEngine();
    engine.processApproval(state.request, credential, method).then((result) => {
      pendingResolve.resolve(result);
      setState({ isOpen: false, request: null });
      setPendingResolve(null);
    });
  }, [state.request, pendingResolve]);

  const cancel = useCallback(() => {
    if (pendingResolve) {
      pendingResolve.resolve({ approved: false, error: "Cancelled by user" });
    }
    setState({ isOpen: false, request: null });
    setPendingResolve(null);
  }, [pendingResolve]);

  return (
    <SecurePromptContext.Provider value={{ state, requestElevation, submitCredential, cancel }}>
      {children}
    </SecurePromptContext.Provider>
  );
}
