import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, RotateCcw, Plus, WifiOff, Building2, ChevronRight, ChevronLeft, User, Calendar, Monitor, Check, FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useDataMode } from "@/contexts/DataModeContext";

const IS_DEV = import.meta.env.DEV || import.meta.env.VITE_DEMO_MODE === "true";

type AccountPath = "signin" | "restore" | "create" | "offline" | "managed" | "";
type SubView = "paths" | "signin-form" | "create-form" | "managed-form";

const PATH_OPTIONS: { key: AccountPath; icon: typeof LogIn; title: string; desc: string }[] = [
  { key: "signin", icon: LogIn, title: "Sign in to SITA", desc: "Access your existing SITA environment" },
  { key: "restore", icon: RotateCcw, title: "Restore previous environment", desc: "Bring back your workspace, settings, and history" },
  { key: "create", icon: Plus, title: "Create a new environment", desc: "Start fresh with a brand-new SITA workspace" },
  { key: "offline", icon: WifiOff, title: "Continue with limited offline setup", desc: "Set up locally — sync later when online" },
  { key: "managed", icon: Building2, title: "Work / managed environment", desc: "Connect to your organization's SITA deployment" },
];

// Mock restore data
const MOCK_RESTORE = {
  name: "Alex's Environment",
  avatar: null,
  lastDevice: "MacBook Pro",
  lastDate: "March 28, 2026",
  modules: ["Business", "Money", "Concierge"],
};

interface Props {
  onNext: () => void;
  onPrev: () => void;
  onPathChange: (path: AccountPath) => void;
  selectedPath: AccountPath;
}

export function AccountEnvironmentStep({ onNext, onPrev, onPathChange, selectedPath }: Props) {
  const [subView, setSubView] = useState<SubView>("paths");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [orgCode, setOrgCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRestore, setShowRestore] = useState(false);

  const handleSelectPath = (path: AccountPath) => {
  const { isDemoMode } = useDataMode();
    onPathChange(path);
    if (path === "signin") setSubView("signin-form");
    else if (path === "create") setSubView("create-form");
    else if (path === "managed") setSubView("managed-form");
    else if (path === "restore") setShowRestore(true);
    else if (path === "offline") onNext();
  };

  const handleSignIn = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Signed in successfully");
      onNext();
    } catch (e: any) {
      toast.error(e.message || "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: displayName } } });
      if (error) throw error;
      toast.success("Account created! Check your email to verify.");
      onNext();
    } catch (e: any) {
      toast.error(e.message || "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: "google" | "apple") => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
    } catch (e: any) {
      toast.error(e.message || "OAuth failed");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-xl mx-auto">
      <div className="rounded-2xl border border-border bg-card shadow-2xl shadow-primary/5 overflow-hidden">
        <div className="p-8 pb-0">
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ delay: 0.1 }}
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/20 mb-4">
            <User className="h-7 w-7 text-primary-foreground" />
          </motion.div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">Connect your environment</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">Sign in, restore a previous setup, or create a new SITA environment</p>
        </div>

        <div className="p-8 pt-6">
          <AnimatePresence mode="wait">
            {/* Path selection */}
            {subView === "paths" && !showRestore && (
              <motion.div key="paths" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2.5">
                {PATH_OPTIONS.map((opt, i) => (
                  <motion.button key={opt.key} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    onClick={() => handleSelectPath(opt.key)}
                    className="w-full rounded-xl border border-border bg-secondary/20 p-4 text-left hover:border-primary/20 hover:bg-secondary/40 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg p-2 bg-secondary group-hover:bg-primary/15 transition-colors">
                        <opt.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">{opt.title}</p>
                        <p className="text-xs text-muted-foreground">{opt.desc}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                  </motion.button>
                ))}

                {/* Dev/Demo mode bypass */}
                {IS_DEV && (
                  <motion.button initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: PATH_OPTIONS.length * 0.06 }}
                    onClick={() => {
                      onPathChange("offline");
                      toast.success("Demo mode — skipping authentication");
                      onNext();
                    }}
                    className="w-full rounded-xl border border-dashed border-amber-500/40 bg-amber-500/5 p-4 text-left hover:border-amber-500/60 hover:bg-amber-500/10 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg p-2 bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors">
                        <FlaskConical className="h-4 w-4 text-amber-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-amber-400">Demo / Dev Mode</p>
                        <p className="text-xs text-amber-500/70">Skip auth — explore the full setup flow without an account</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-amber-500/50 group-hover:text-amber-400 transition-colors" />
                    </div>
                  </motion.button>
                )}
              </motion.div>
            )}

            {/* Restore view */}
            {showRestore && (
              <motion.div key="restore" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-5">
                <button onClick={() => setShowRestore(false)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                  <ChevronLeft className="h-3 w-3" /> Back to options
                </button>
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-foreground">{MOCK_RESTORE.name}</p>
                      <p className="text-xs text-muted-foreground">Your world is coming back</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Monitor className="h-3 w-3" /> {MOCK_RESTORE.lastDevice}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-3 w-3" /> {MOCK_RESTORE.lastDate}
                    </div>
                  </div>
                  <div className="mt-3 flex gap-1.5">
                    {MOCK_RESTORE.modules.map(m => (
                      <span key={m} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] text-primary font-medium">{m}</span>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Restoring: identity, advisor setup, trust settings, connections, workspaces, preferences, recent workflows</p>
                <button onClick={onNext}
                  className="w-full rounded-xl bg-primary text-primary-foreground py-3 text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                  <RotateCcw className="h-4 w-4" /> Restore this environment
                </button>
              </motion.div>
            )}

            {/* Sign in form */}
            {subView === "signin-form" && (
              <motion.div key="signin" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                <button onClick={() => setSubView("paths")} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                  <ChevronLeft className="h-3 w-3" /> Back to options
                </button>
                {/* OAuth */}
                <div className="flex gap-2">
                  <button onClick={() => handleOAuth("google")}
                    className="flex-1 rounded-xl border border-border bg-secondary/30 py-2.5 text-sm text-foreground hover:bg-secondary/50 transition-colors">Google</button>
                  <button onClick={() => handleOAuth("apple")}
                    className="flex-1 rounded-xl border border-border bg-secondary/30 py-2.5 text-sm text-foreground hover:bg-secondary/50 transition-colors">Apple</button>
                </div>
                <div className="flex items-center gap-3"><div className="flex-1 h-px bg-border" /><span className="text-[10px] text-muted-foreground">or</span><div className="flex-1 h-px bg-border" /></div>
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email"
                  className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:ring-2 focus:ring-primary/20 focus:outline-none" />
                <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password"
                  onKeyDown={e => e.key === "Enter" && handleSignIn()}
                  className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:ring-2 focus:ring-primary/20 focus:outline-none" />
                <button onClick={handleSignIn} disabled={loading || !email || !password}
                  className={cn("w-full rounded-xl py-3 text-sm font-semibold transition-all",
                    email && password ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground cursor-not-allowed"
                  )}>{loading ? "Signing in…" : "Sign in"}</button>
              </motion.div>
            )}

            {/* Create form */}
            {subView === "create-form" && (
              <motion.div key="create" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                <button onClick={() => setSubView("paths")} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                  <ChevronLeft className="h-3 w-3" /> Back to options
                </button>
                <div className="flex gap-2">
                  <button onClick={() => handleOAuth("google")}
                    className="flex-1 rounded-xl border border-border bg-secondary/30 py-2.5 text-sm text-foreground hover:bg-secondary/50 transition-colors">Google</button>
                  <button onClick={() => handleOAuth("apple")}
                    className="flex-1 rounded-xl border border-border bg-secondary/30 py-2.5 text-sm text-foreground hover:bg-secondary/50 transition-colors">Apple</button>
                </div>
                <div className="flex items-center gap-3"><div className="flex-1 h-px bg-border" /><span className="text-[10px] text-muted-foreground">or</span><div className="flex-1 h-px bg-border" /></div>
                <input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your name"
                  className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:ring-2 focus:ring-primary/20 focus:outline-none" />
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email"
                  className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:ring-2 focus:ring-primary/20 focus:outline-none" />
                <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password"
                  className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:ring-2 focus:ring-primary/20 focus:outline-none" />
                <button onClick={handleCreate} disabled={loading || !email || !password}
                  className={cn("w-full rounded-xl py-3 text-sm font-semibold transition-all",
                    email && password ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground cursor-not-allowed"
                  )}>{loading ? "Creating…" : "Create environment"}</button>
              </motion.div>
            )}

            {/* Managed form */}
            {subView === "managed-form" && (
              <motion.div key="managed" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                <button onClick={() => setSubView("paths")} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                  <ChevronLeft className="h-3 w-3" /> Back to options
                </button>
                <p className="text-xs text-muted-foreground">Enter your organization's enrollment code or domain</p>
                <input value={orgCode} onChange={e => setOrgCode(e.target.value)} placeholder="Organization code or domain"
                  className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:ring-2 focus:ring-primary/20 focus:outline-none" />
                <button onClick={onNext} disabled={!orgCode}
                  className={cn("w-full rounded-xl py-3 text-sm font-semibold transition-all",
                    orgCode ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground cursor-not-allowed"
                  )}>Connect to organization</button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom nav for paths view */}
          {subView === "paths" && !showRestore && (
            <div className="flex items-center justify-between pt-6 mt-4 border-t border-border">
              <button onClick={onPrev} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Back</button>
              <div />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
