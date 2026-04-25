import { useState } from "react";
import sitaLogo from "@/assets/logo.webp";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, ShieldCheck, Brain, Receipt, BarChart3, Zap, CheckCircle } from "lucide-react";
import { GoogleSignInButton } from "@/platform/auth/components/auth/GoogleSignInButton";
import { AppleSignInButton } from "@/platform/auth/components/auth/AppleSignInButton";
import { AuthDivider } from "@/platform/auth/components/auth/AuthDivider";
import { motion } from "framer-motion";

const Signup = () => {
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setLoading(true);
    const { error } = await signUp(email, password, fullName || undefined);
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
      
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm text-center space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 border border-primary/15">
            <Mail className="h-9 w-9 text-primary" />
          </div>
          <div className="space-y-2">
            <h1 className="font-display text-2xl font-bold text-foreground">Check your email</h1>
            <p className="text-sm text-muted-foreground">We sent a verification link to <strong className="text-foreground">{email}</strong>. Click the link to activate your account.</p>
          </div>
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium">
            <ArrowRight className="h-3 w-3 rotate-180" /> Back to sign in
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left: Brand panel */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--sita-purple)/0.12)] via-background to-[hsl(var(--sita-gold)/0.06)]" />
        <div className="absolute top-1/3 -left-16 h-72 w-72 rounded-full bg-[hsl(var(--sita-purple)/0.08)] blur-[100px]" />
        <div className="absolute bottom-1/3 right-0 h-56 w-56 rounded-full bg-[hsl(var(--sita-gold)/0.06)] blur-[80px]" />
        
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="flex items-center gap-3">
              <img src={sitaLogo} alt="SITA OS" width={44} height={44} className="h-11 w-11 rounded-xl shadow-glow-purple object-cover" />
              <div>
                <h1 className="font-display text-xl font-bold tracking-tight gradient-sita-text">SITA OS</h1>
                <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-medium">Sovereign Intelligence</p>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-8">
            <div>
              <h2 className="font-display text-[2.5rem] font-bold tracking-tight text-foreground leading-[1.1]">
                Start building<br />
                <span className="gradient-sita-text">your command center.</span>
              </h2>
              <p className="mt-4 text-sm text-muted-foreground max-w-sm leading-relaxed">
                Business, money, and life — unified in one premium operating 
                environment. Built on trust, proof, and governed intelligence.
              </p>
            </div>

            <div className="space-y-2.5 max-w-sm">
              {[
                { icon: CheckCircle, text: "Set up in 5 minutes" },
                { icon: CheckCircle, text: "Full demo mode — no data required" },
                { icon: CheckCircle, text: "Every action has a proof chain" },
                { icon: CheckCircle, text: "You control what SITA sees and does" },
              ].map((item, i) => (
                <motion.div
                  key={item.text}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.08 }}
                  className="flex items-center gap-2.5 text-sm text-muted-foreground"
                >
                  <item.icon className="h-4 w-4 text-primary shrink-0" />
                  {item.text}
                </motion.div>
              ))}
            </div>
          </motion.div>

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

      {/* Right: Signup form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="w-full max-w-sm space-y-8"
        >
          <div className="text-center lg:hidden space-y-4">
            <img src={sitaLogo} alt="SITA OS" width={64} height={64} loading="lazy" className="mx-auto h-16 w-16 rounded-2xl shadow-glow-purple object-cover" />
            <div>
              <h1 className="font-display text-2xl font-bold gradient-sita-text">SITA OS</h1>
              <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground">Sovereign Intelligence</p>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-2xl font-bold text-foreground tracking-tight">Create your account</h2>
            <p className="text-sm text-muted-foreground">Get started with your operating environment</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Full name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-secondary/40 py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="Your name"
                />
              </div>
            </div>

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
                  placeholder="At least 6 characters"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl gradient-sita py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-all shadow-glow-purple/30"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                  Creating account...
                </div>
              ) : (
                <>Create account <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </form>

          <AuthDivider />
          <div className="space-y-2.5">
            <GoogleSignInButton label="Sign up with Google" />
            <AppleSignInButton label="Sign up with Apple" />
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Already have an account? <Link to="/login" className="text-primary hover:underline font-medium">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;
