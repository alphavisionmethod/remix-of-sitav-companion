import { useState, useEffect } from "react";
import sitaLogo from "@/assets/logo.webp";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Mail, Lock, ArrowRight, Eye, EyeOff, ShieldCheck, Zap, Brain, BarChart3, Receipt } from "lucide-react";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { AppleSignInButton } from "@/components/auth/AppleSignInButton";
import { AuthDivider } from "@/components/auth/AuthDivider";
import { MFAChallenge } from "@/components/auth/MFAChallenge";
import { motion } from "framer-motion";
import { EnhancedLockScreen as LockScreen } from "@/components/sita/shell/EnhancedLockScreen";
import { FirstBootScreen } from "@/components/sita/FirstBootScreen";

const Login = () => {
  const { signIn, signInAsDemo, requiresMFA, mfaFactorId, cancelMFA } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if returning user (has a cached email)
  const [savedEmail] = useState(() => localStorage.getItem("sita-last-email") || "");
  const [showLockScreen, setShowLockScreen] = useState(!!savedEmail);
  const [showBoot, setShowBoot] = useState(!!savedEmail);

  // Phase 19.1.B — MFA challenge step renders before completing sign-in
  if (requiresMFA && mfaFactorId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="w-full max-w-md">
          <MFAChallenge
            factorId={mfaFactorId}
            onSuccess={() => {
              toast.success("Multi-factor verification complete");
              navigate("/");
            }}
            onCancel={async () => {
              await cancelMFA();
              toast.info("Sign-in cancelled");
            }}
          />
        </div>
      </div>
    );
  }

  // Boot sequence for returning users
  if (showBoot && savedEmail) {
    return <FirstBootScreen onComplete={() => setShowBoot(false)} />;
  }

  // Lock screen for returning users
  if (showLockScreen && savedEmail) {
    return (
      <LockScreen
        userName={savedEmail.split("@")[0]}
        onUnlock={async (pw) => {
          const { error } = await signIn(savedEmail, pw);
          if (error) return false;
          localStorage.setItem("sita-last-email", savedEmail);
          toast.success("Welcome back");
          navigate("/");
          return true;
        }}
        onForgotPassword={() => navigate("/forgot-password")}
        onSwitchUser={() => {
          setShowLockScreen(false);
          localStorage.removeItem("sita-last-email");
        }}
      />
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      localStorage.setItem("sita-last-email", email);
      navigate("/");
    }
  };

  const handleDemoAccess = () => {
    signInAsDemo();
    toast.success("Demo mode activated");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex bg-background">
      
      {/* Left: Brand panel */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--sita-purple)/0.12)] via-background to-[hsl(var(--sita-gold)/0.06)]" />
        <div className="absolute top-1/4 -left-20 h-80 w-80 rounded-full bg-[hsl(var(--sita-purple)/0.08)] blur-[100px]" />
        <div className="absolute bottom-1/4 right-0 h-64 w-64 rounded-full bg-[hsl(var(--sita-gold)/0.06)] blur-[80px]" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="flex items-center gap-3">
              <img src={sitaLogo} alt="SITA OS" width={44} height={44} className="h-11 w-11 rounded-xl shadow-glow-purple object-cover" />
              <div>
                <h1 className="font-display text-xl font-bold tracking-tight gradient-sita-text">SITA OS</h1>
                <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-medium">Sovereign Intelligence</p>
              </div>
            </div>
          </motion.div>

          {/* Hero message */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-8">
            <div>
              <h2 className="font-display text-[2.5rem] font-bold tracking-tight text-foreground leading-[1.1]">
                Your executive<br />
                <span className="gradient-sita-text">operating system.</span>
              </h2>
              <p className="mt-4 text-sm text-muted-foreground max-w-sm leading-relaxed">
                One sovereign brain. Three domains. Every decision governed, 
                every action proven, every advisor accountable.
              </p>
            </div>

            {/* Feature pills */}
            <div className="grid grid-cols-2 gap-3 max-w-md">
              {[
                { icon: Brain, label: "Advisory Council", desc: "Multi-advisor intelligence" },
                { icon: Receipt, label: "Proof Chain", desc: "Every action verified" },
                { icon: BarChart3, label: "Boardroom", desc: "Executive review surfaces" },
                { icon: Zap, label: "Autopilot", desc: "Governed automation" },
              ].map((f, i) => (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.08 }}
                  className="flex items-center gap-2.5 rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm px-3 py-2.5"
                >
                  <div className="rounded-lg bg-primary/8 p-1.5">
                    <f.icon className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-foreground">{f.label}</p>
                    <p className="text-[9px] text-muted-foreground">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Bottom trust strip */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
            className="flex items-center gap-4 text-[10px] text-muted-foreground/60"
          >
            <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Policy-governed</span>
            <span className="h-3 w-px bg-border" />
            <span>Deterministic finance</span>
            <span className="h-3 w-px bg-border" />
            <span>Zero-hallucination proof</span>
          </motion.div>
        </div>
      </div>

      {/* Right: Login form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="w-full max-w-sm space-y-8"
        >
          {/* Mobile-only logo */}
          <div className="text-center lg:hidden space-y-4">
            <img src={sitaLogo} alt="SITA OS" width={64} height={64} loading="lazy" className="mx-auto h-16 w-16 rounded-2xl shadow-glow-purple object-cover" />
            <div>
              <h1 className="font-display text-2xl font-bold gradient-sita-text">SITA OS</h1>
              <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground">Sovereign Intelligence</p>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-2xl font-bold text-foreground tracking-tight">Welcome back</h2>
            <p className="text-sm text-muted-foreground">Sign in to your operating environment</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-border bg-secondary/40 py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type={showPw ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-border bg-secondary/40 py-2.5 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl gradient-sita py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-all shadow-glow-purple/30"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                  Signing in...
                </div>
              ) : (
                <>Sign in <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </form>

          {/* Social + Demo */}
          <AuthDivider />

          <div className="space-y-2.5">
            <GoogleSignInButton />
            <AppleSignInButton />
            <button
              onClick={handleDemoAccess}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-2.5 text-sm font-medium text-foreground hover:bg-secondary/60 transition-all"
            >
              <ShieldCheck className="h-4 w-4 text-primary" />
              Enter Demo Mode
            </button>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Don't have an account? <Link to="/signup" className="text-primary hover:underline font-medium">Create one</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;