import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { emitLoopCompletion } from "@/hooks/use-flagship-loop-proof";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isDemo: boolean;
  requiresMFA: boolean;
  mfaFactorId: string | null;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInAsDemo: () => void;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (password: string) => Promise<{ error: any }>;
  verifyMFA: (code: string) => Promise<{ error: any }>;
  cancelMFA: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

const FALLBACK_USER: User = {
  id: "00000000-0000-0000-0000-000000000000",
  aud: "authenticated",
  role: "authenticated",
  email: "admin@sita.os",
  email_confirmed_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  app_metadata: { provider: "demo" },
  user_metadata: { full_name: "SITA Admin" },
  identities: [],
} as unknown as User;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [seedTriggered, setSeedTriggered] = useState(false);
  const [requiresMFA, setRequiresMFA] = useState(false);
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);

  const triggerAutoSeed = async (userId: string) => {
    if (seedTriggered) return;
    setSeedTriggered(true);

    // Per-user localStorage guard prevents double-fire across hot reloads.
    const guardKey = `sita-seed-attempted:${userId}`;
    if (typeof window !== "undefined" && localStorage.getItem(guardKey)) {
      // We've already attempted this session — defer to durable marker check below.
    }

    try {
      // Pre-flight: check durable seed marker on the profile.
      // If set, skip the edge-function call entirely (saves a function invocation per page load).
      const { data: profile } = await supabase
        .from("profiles")
        .select("preferences")
        .eq("user_id", userId)
        .maybeSingle();

      const prefs = (profile?.preferences ?? {}) as Record<string, unknown>;
      if (prefs?.seeded_at) {
        if (typeof window !== "undefined") localStorage.setItem(guardKey, "1");
        return;
      }

      const { data, error } = await supabase.functions.invoke("seed-user-data", {
        method: "POST",
        body: {},
      });

      if (typeof window !== "undefined") localStorage.setItem(guardKey, "1");

      if (error) {
        console.warn("Auto-seed skipped or failed:", error.message);
      } else if (data?.skipped) {
        console.log("Seed skipped — already seeded");
      } else {
        console.log(`Seed completed — ${data?.rows_count ?? "?"} rows across ${data?.tables_count ?? "?"} tables`);
      }
    } catch (e) {
      console.warn("Auto-seed error:", e);
    }
  };

  /**
   * Phase 19.1.B — Detect AAL2 step-up requirement.
   * Returns { requiresMFA, factorId } based on current vs next assurance level.
   */
  const detectMFARequirement = async (): Promise<{ required: boolean; factorId: string | null }> => {
    try {
      const { data: aal, error: aalErr } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aalErr || !aal) return { required: false, factorId: null };
      if (aal.nextLevel === "aal2" && aal.currentLevel === "aal1") {
        const { data: factors } = await supabase.auth.mfa.listFactors();
        const totp = factors?.totp?.find((f) => f.status === "verified");
        if (totp) return { required: true, factorId: totp.id };
      }
    } catch (e) {
      console.warn("MFA detection failed:", e);
    }
    return { required: false, factorId: null };
  };

  useEffect(() => {
    // Check if demo session was active
    if (localStorage.getItem("sita-demo-session") === "true") {
      setUser(FALLBACK_USER);
      setIsDemo(true);
      setLoading(false);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session?.user) {
        triggerAutoSeed(session.user.id);
        // Flagship Loop 1 — emit durable proof of sign-in (fire-and-forget).
        if (event === "SIGNED_IN") {
          emitLoopCompletion({
            loop_key: "sign-in-dashboard-pulse",
            step_key: "sign_in",
            outcome: "success",
            evidence: { event, user_id: session.user.id },
          }).catch(() => { /* never block auth flow */ });
        }
        // Defer MFA detection to avoid deadlock with auth callback
        setTimeout(() => {
          detectMFARequirement().then(({ required, factorId }) => {
            setRequiresMFA(required);
            setMfaFactorId(factorId);
          });
        }, 0);
      }
      if (event === "SIGNED_OUT") {
        setRequiresMFA(false);
        setMfaFactorId(null);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        detectMFARequirement().then(({ required, factorId }) => {
          setRequiresMFA(required);
          setMfaFactorId(factorId);
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: fullName ? { full_name: fullName } : undefined,
      },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error && data.user) {
      triggerAutoSeed(data.user.id);
      // MFA requirement is detected via onAuthStateChange → detectMFARequirement
    }
    return { error };
  };

  const signInAsDemo = () => {
    localStorage.setItem("sita-demo-session", "true");
    setUser(FALLBACK_USER);
    setIsDemo(true);
    setLoading(false);
  };

  const signOut = async () => {
    if (isDemo) {
      localStorage.removeItem("sita-demo-session");
      setUser(null);
      setSession(null);
      setIsDemo(false);
      setRequiresMFA(false);
      setMfaFactorId(null);
      return;
    }
    setRequiresMFA(false);
    setMfaFactorId(null);
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    return { error };
  };

  /** Phase 19.1.B — Verify TOTP code to satisfy AAL2 step-up. */
  const verifyMFA = async (code: string) => {
    if (!mfaFactorId) return { error: new Error("No MFA factor pending") };
    const { error } = await supabase.auth.mfa.challengeAndVerify({
      factorId: mfaFactorId,
      code,
    });
    if (!error) {
      setRequiresMFA(false);
      setMfaFactorId(null);
    }
    return { error };
  };

  const cancelMFA = async () => {
    setRequiresMFA(false);
    setMfaFactorId(null);
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isDemo,
        requiresMFA,
        mfaFactorId,
        signUp,
        signIn,
        signInAsDemo,
        signOut,
        resetPassword,
        updatePassword,
        verifyMFA,
        cancelMFA,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
