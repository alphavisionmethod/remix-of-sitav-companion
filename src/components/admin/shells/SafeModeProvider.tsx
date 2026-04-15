import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface DomainPause {
  sync: boolean;
  storage: boolean;
  releases: boolean;
  trust: boolean;
  ai: boolean;
  devices: boolean;
}

interface SafeModeState {
  enabled: boolean;
  domainPauses: DomainPause;
  approvalOnlyMode: boolean;
  automationHold: boolean;
}

interface SafeModeContextValue extends SafeModeState {
  toggleSafeMode: () => void;
  toggleDomain: (domain: keyof DomainPause) => void;
  toggleApprovalOnly: () => void;
  toggleAutomationHold: () => void;
  resetSafeMode: () => void;
}

const DEFAULT_STATE: SafeModeState = {
  enabled: false,
  domainPauses: { sync: false, storage: false, releases: false, trust: false, ai: false, devices: false },
  approvalOnlyMode: false,
  automationHold: false,
};

function loadState(): SafeModeState {
  try {
    const stored = sessionStorage.getItem("admin-safe-mode");
    return stored ? { ...DEFAULT_STATE, ...JSON.parse(stored) } : DEFAULT_STATE;
  } catch { return DEFAULT_STATE; }
}

function saveState(state: SafeModeState) {
  try { sessionStorage.setItem("admin-safe-mode", JSON.stringify(state)); } catch {}
}

const SafeModeContext = createContext<SafeModeContextValue | null>(null);

export function SafeModeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SafeModeState>(loadState);

  const update = useCallback((updater: (prev: SafeModeState) => SafeModeState) => {
    setState(prev => {
      const next = updater(prev);
      saveState(next);
      return next;
    });
  }, []);

  const toggleSafeMode = useCallback(() => update(s => ({ ...s, enabled: !s.enabled })), [update]);
  const toggleDomain = useCallback((domain: keyof DomainPause) => update(s => ({
    ...s, domainPauses: { ...s.domainPauses, [domain]: !s.domainPauses[domain] }
  })), [update]);
  const toggleApprovalOnly = useCallback(() => update(s => ({ ...s, approvalOnlyMode: !s.approvalOnlyMode })), [update]);
  const toggleAutomationHold = useCallback(() => update(s => ({ ...s, automationHold: !s.automationHold })), [update]);
  const resetSafeMode = useCallback(() => update(() => DEFAULT_STATE), [update]);

  return (
    <SafeModeContext.Provider value={{ ...state, toggleSafeMode, toggleDomain, toggleApprovalOnly, toggleAutomationHold, resetSafeMode }}>
      {children}
    </SafeModeContext.Provider>
  );
}

export function useSafeMode() {
  const ctx = useContext(SafeModeContext);
  if (!ctx) throw new Error("useSafeMode must be used within SafeModeProvider");
  return ctx;
}
