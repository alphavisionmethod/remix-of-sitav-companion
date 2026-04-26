// ═══════════════════════════════════════════════════════════════
// Phase 6 — BusinessProfileProvider Persistence
// Mounts the real provider, mutates via context, unmounts, remounts,
// and asserts the change persists in localStorage and `isAdapted`
// reflects the truth.
// ═══════════════════════════════════════════════════════════════

import React, { useContext } from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, act, screen } from "@testing-library/react";
import {
  BusinessProfileProvider,
  BusinessProfileCtx,
} from "@/contexts/BusinessProfileContext";
import {
  saveBusinessProfile,
  loadBusinessProfile,
} from "@/lib/services/business-os/business-profile.service";

function Probe({ onMount }: { onMount: (ctx: any) => void }) {
  const ctx = useContext(BusinessProfileCtx);
  React.useEffect(() => {
    onMount(ctx);
  }, [ctx, onMount]);
  return (
    <div>
      <span data-testid="primary">{ctx.primaryMode}</span>
      <span data-testid="adapted">{String(ctx.isAdapted)}</span>
    </div>
  );
}

describe("Phase 6 — BusinessProfileProvider persistence", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("starts un-adapted on a fresh storage and reports a primaryMode", () => {
    render(
      <BusinessProfileProvider>
        <Probe onMount={() => {}} />
      </BusinessProfileProvider>,
    );
    expect(screen.getByTestId("adapted").textContent).toBe("false");
    expect(screen.getByTestId("primary").textContent).toBeTruthy();
  });

  it("updateOverrides → persists and the next mount reads back as adapted", () => {
    let captured: any;
    const { unmount } = render(
      <BusinessProfileProvider>
        <Probe onMount={(c) => (captured = c)} />
      </BusinessProfileProvider>,
    );
    act(() => {
      captured.updateOverrides({ ecommerce: 80 });
    });
    expect(screen.getByTestId("adapted").textContent).toBe("true");
    // The provider's effect saves on adapted state — confirm the side effect.
    expect(loadBusinessProfile()).toBeTruthy();
    unmount();

    render(
      <BusinessProfileProvider>
        <Probe onMount={() => {}} />
      </BusinessProfileProvider>,
    );
    expect(screen.getByTestId("adapted").textContent).toBe("true");
  });

  it("resetToDetected → clears the adapted flag (honest reset, not silent)", () => {
    saveBusinessProfile({
      primaryMode: "ecommerce",
    } as any);
    let captured: any;
    render(
      <BusinessProfileProvider>
        <Probe onMount={(c) => (captured = c)} />
      </BusinessProfileProvider>,
    );
    expect(screen.getByTestId("adapted").textContent).toBe("true");
    act(() => {
      captured.resetToDetected();
    });
    expect(screen.getByTestId("adapted").textContent).toBe("false");
  });

  it("business-profile.service is SSR-safe (no throw when window is undefined)", async () => {
    // We cannot truly delete window in jsdom; instead verify the service
    // doesn't throw when localStorage is unavailable.
    const orig = window.localStorage;
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: () => { throw new Error("blocked"); },
        setItem: () => { throw new Error("blocked"); },
        removeItem: () => {},
        clear: () => {},
      },
      configurable: true,
    });
    try {
      // Service must swallow these errors per its honest-degradation contract.
      expect(() => loadBusinessProfile()).not.toThrow();
      expect(() => saveBusinessProfile({ primaryMode: "service" } as any)).not.toThrow();
    } finally {
      Object.defineProperty(window, "localStorage", { value: orig, configurable: true });
    }
  });
});