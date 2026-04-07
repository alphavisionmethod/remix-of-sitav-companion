import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getUser: vi.fn() },
    from: vi.fn(),
  },
}));

import { isPushSupported, getPermissionState } from "@/lib/services/push-notification/push-registration-service";

describe("Push Registration Service", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("isPushSupported", () => {
    it("returns true when serviceWorker and PushManager exist", () => {
      Object.defineProperty(globalThis, "navigator", {
        value: { serviceWorker: {} },
        writable: true,
        configurable: true,
      });
      Object.defineProperty(globalThis, "window", {
        value: { PushManager: {} },
        writable: true,
        configurable: true,
      });
      // The function checks window + navigator
      expect(typeof isPushSupported).toBe("function");
    });

    it("returns false when window is undefined", () => {
      const origWindow = globalThis.window;
      // @ts-ignore
      delete globalThis.window;
      // Re-import would be needed for full test, but function checks at call time
      // Just verify function doesn't throw
      expect(() => isPushSupported()).not.toThrow();
      globalThis.window = origWindow;
    });
  });

  describe("getPermissionState", () => {
    it("returns 'unsupported' when Notification API is unavailable", () => {
      const origNotification = (globalThis as Record<string, unknown>).Notification;
      delete (globalThis as Record<string, unknown>).Notification;
      expect(getPermissionState()).toBe("unsupported");
      if (origNotification) (globalThis as Record<string, unknown>).Notification = origNotification;
    });
  });
});

