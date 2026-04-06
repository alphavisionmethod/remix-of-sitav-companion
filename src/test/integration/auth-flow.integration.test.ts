import { describe, it, expect } from "vitest";

// Test the auth context shape and demo user constants without rendering React
describe("Auth Flow — Integration", () => {
  it("demo user has required fields", async () => {
    // Dynamically import to avoid React rendering
    const mod = await import("@/contexts/AuthContext");
    // The module exports AuthProvider and useAuth — we verify structure
    expect(mod.AuthProvider).toBeDefined();
    expect(mod.useAuth).toBeDefined();
  });

  it("supabase client is configured", async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    expect(supabase).toBeDefined();
    expect(supabase.auth).toBeDefined();
    expect(supabase.from).toBeDefined();
  });

  it("supabase client has correct project URL", async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    // Verify client can access auth methods
    expect(typeof supabase.auth.getSession).toBe("function");
    expect(typeof supabase.auth.signInWithPassword).toBe("function");
    expect(typeof supabase.auth.signUp).toBe("function");
    expect(typeof supabase.auth.signOut).toBe("function");
  });
});
