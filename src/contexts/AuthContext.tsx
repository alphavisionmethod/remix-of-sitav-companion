import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isDemo: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInAsDemo: () => void;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (password: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

const DEMO_USER: User = {
  id: "demo-admin-000",
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

  const triggerAutoSeed = async () => {
    if (seedTriggered) return;
    setSeedTriggered(true);
    try {
      const { data, error } = await supabase.functions.invoke("seed-user-data", {
        method: "POST",
        body: {},
      });
      if (error) {
        console.warn("Auto-seed skipped or failed:", error.message);
      } else if (data?.skipped) {
        console.log("Data already seeded");
      } else {
        console.log("Demo data seeded successfully");
      }
    } catch (e) {
      console.warn("Auto-seed error:", e);
    }
  };

  useEffect(() => {
    // Check if demo session was active
    if (localStorage.getItem("sita-demo-session") === "true") {
      setUser(DEMO_USER);
      setIsDemo(true);
      setLoading(false);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      // Auto-seed on sign-in events (email, OAuth, etc.)
      if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session?.user) {
        triggerAutoSeed();
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
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
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) {
      // Auto-seed demo data on first login
      triggerAutoSeed();
    }
    return { error };
  };

  const signInAsDemo = () => {
    localStorage.setItem("sita-demo-session", "true");
    setUser(DEMO_USER);
    setIsDemo(true);
    setLoading(false);
  };

  const signOut = async () => {
    if (isDemo) {
      localStorage.removeItem("sita-demo-session");
      setUser(null);
      setSession(null);
      setIsDemo(false);
      return;
    }
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

  return (
    <AuthContext.Provider value={{ user, session, loading, isDemo, signUp, signIn, signInAsDemo, signOut, resetPassword, updatePassword }}>
      {children}
    </AuthContext.Provider>
  );
};
