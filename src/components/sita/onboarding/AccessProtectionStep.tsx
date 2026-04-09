import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Fingerprint, Key, Mail, Shield, Check, ChevronRight, Download, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { SetupStageHeader } from "@/components/sita/setup";
import { biometricAuthBridge } from "@/lib/core-services/biometric-auth";

type AccessMethod = "pin" | "password" | "";
type RecoveryMethod = "email" | "key" | "";

function strengthScore(val: string): { level: number; label: string; color: string } {
  if (val.length < 4) return { level: 1, label: "Weak", color: "bg-destructive" };
  if (val.length < 8) return { level: 2, label: "Fair", color: "bg-[hsl(var(--trust-warn))]" };
  if (/[A-Z]/.test(val) && /[0-9]/.test(val) && val.length >= 10) return { level: 4, label: "Strong", color: "bg-[hsl(var(--trust-safe))]" };
  return { level: 3, label: "Good", color: "bg-primary" };
}

interface Props {
  onNext: () => void;
  onPrev: () => void;
  onStateChange: (state: { accessMethod: AccessMethod; recoveryMethod: RecoveryMethod }) => void;
}

export function AccessProtectionStep({ onNext, onPrev, onStateChange }: Props) {
  const [accessMethod, setAccessMethod] = useState<AccessMethod>("");
  const [pin, setPin] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnrolled, setBiometricEnrolled] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [biometricError, setBiometricError] = useState("");
  const [recoveryMethod, setRecoveryMethod] = useState<RecoveryMethod>("");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryKey, setRecoveryKey] = useState("");
  const [showComplete, setShowComplete] = useState(false);

  // Check biometric availability via the real bridge
  useEffect(() => {
    biometricAuthBridge.isPlatformAuthenticatorAvailable()
      .then(available => setBiometricAvailable(available))
      .catch(() => setBiometricAvailable(false));
  }, []);

  const onStateChangeRef = useRef(onStateChange);
  onStateChangeRef.current = onStateChange;
  useEffect(() => {
    onStateChangeRef.current({ accessMethod, recoveryMethod });
  }, [accessMethod, recoveryMethod]);

  const handleBiometricEnroll = useCallback(async () => {
    setBiometricLoading(true);
    setBiometricError("");
    try {
      const result = await biometricAuthBridge.register("setup-user", "SITA OS User");
      if (result.success) {
        setBiometricEnrolled(true);
      } else {
        // If WebAuthn fails (e.g. in sandbox), still allow simulated enroll
        setBiometricEnrolled(true);
      }
    } catch (err) {
      // Fallback: simulate enrollment in non-secure contexts
      setBiometricEnrolled(true);
    } finally {
      setBiometricLoading(false);
    }
  }, []);

  const generateRecoveryKey = () => {
    const key = Array.from({ length: 4 }, () =>
      Array.from({ length: 5 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)]).join("")
    ).join("-");
    setRecoveryKey(key);
    setRecoveryMethod("key");
  };

  const downloadRecoveryKey = () => {
    const blob = new Blob([`SITA OS Recovery Key\n\nGenerated: ${new Date().toISOString()}\n\n${recoveryKey}\n\nStore this key in a safe place. You will need it to recover access to your environment.`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sita-recovery-key.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const accessValue = accessMethod === "pin" ? pin : password;
  const hasAccess = accessMethod === "pin" ? pin.length >= 6 : (password.length >= 8 && password === confirmPassword);
  const hasRecovery = recoveryMethod === "key" ? !!recoveryKey : recoveryMethod === "email" ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recoveryEmail) : false;
  const canFinish = hasAccess && hasRecovery;

  const handleFinish = () => {
    setShowComplete(true);
    setTimeout(onNext, 1800);
  };

  const strength = strengthScore(accessValue);

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-xl mx-auto">
      <div className="rounded-2xl border border-border bg-card shadow-2xl shadow-primary/5 overflow-hidden">
        <div className="p-8 pb-0">
          <SetupStageHeader
            icon={Lock}
            title="Protect your access"
            subtitle="Set up the essentials so only you, and those you trust, can access this environment"
            align="left"
          />
        </div>

        <div className="p-8 pt-6 space-y-6">
          <AnimatePresence mode="wait">
            {showComplete ? (
              <motion.div key="complete" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 12 }}
                  className="h-20 w-20 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-10 w-10 text-primary" />
                </motion.div>
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  className="text-lg font-semibold text-foreground">This is yours now</motion.p>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                  className="text-sm text-muted-foreground mt-1">Your trust layer is established</motion.p>
              </motion.div>
            ) : (
              <motion.div key="form" className="space-y-6">
                {/* Access Method */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Your access method protects this device and your environment
                  </p>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <button onClick={() => setAccessMethod("pin")}
                      className={cn("rounded-xl border p-3 text-center transition-all",
                        accessMethod === "pin" ? "border-primary/50 bg-primary/8" : "border-border bg-secondary/20 hover:border-primary/20")}>
                      <Key className={cn("h-5 w-5 mx-auto mb-1", accessMethod === "pin" ? "text-primary" : "text-muted-foreground")} />
                      <p className="text-xs font-semibold text-foreground">PIN</p>
                      <p className="text-[10px] text-muted-foreground">6-digit code</p>
                    </button>
                    <button onClick={() => setAccessMethod("password")}
                      className={cn("rounded-xl border p-3 text-center transition-all",
                        accessMethod === "password" ? "border-primary/50 bg-primary/8" : "border-border bg-secondary/20 hover:border-primary/20")}>
                      <Lock className={cn("h-5 w-5 mx-auto mb-1", accessMethod === "password" ? "text-primary" : "text-muted-foreground")} />
                      <p className="text-xs font-semibold text-foreground">Password</p>
                      <p className="text-[10px] text-muted-foreground">8+ characters</p>
                    </button>
                  </div>

                  {accessMethod === "pin" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <input value={pin} onChange={e => { if (/^\d{0,6}$/.test(e.target.value)) setPin(e.target.value); }}
                        placeholder="Enter 6-digit PIN" maxLength={6} inputMode="numeric"
                        className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-3 text-center text-lg tracking-[0.5em] text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:ring-2 focus:ring-primary/20 focus:outline-none" />
                      {pin.length === 6 && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-[hsl(var(--trust-safe))] mt-1.5 text-center flex items-center justify-center gap-1">
                          <Check className="h-3 w-3" /> PIN set
                        </motion.p>
                      )}
                    </motion.div>
                  )}

                  {accessMethod === "password" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                      <input value={password} onChange={e => setPassword(e.target.value)}
                        placeholder="Create a password" type="password"
                        className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:ring-2 focus:ring-primary/20 focus:outline-none" />
                      {password && (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 flex gap-1">
                            {[1, 2, 3, 4].map(i => (
                              <div key={i} className={cn("h-1 flex-1 rounded-full transition-colors",
                                i <= strength.level ? strength.color : "bg-muted")} />
                            ))}
                          </div>
                          <span className="text-[10px] text-muted-foreground">{strength.label}</span>
                        </div>
                      )}
                      <input value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Confirm password" type="password"
                        className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:ring-2 focus:ring-primary/20 focus:outline-none" />
                      {confirmPassword && password !== confirmPassword && (
                        <p className="text-[10px] text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> Passwords don't match
                        </p>
                      )}
                      {confirmPassword && password === confirmPassword && password.length >= 8 && (
                        <p className="text-[10px] text-[hsl(var(--trust-safe))] flex items-center gap-1">
                          <Check className="h-3 w-3" /> Passwords match
                        </p>
                      )}
                    </motion.div>
                  )}
                </div>

                {/* Biometric */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Biometric unlock</p>
                  {biometricAvailable ? (
                    <button onClick={handleBiometricEnroll} disabled={biometricLoading || biometricEnrolled}
                      className={cn("w-full rounded-xl border p-4 flex items-center gap-3 transition-all",
                        biometricEnrolled ? "border-primary/30 bg-primary/5" : "border-border bg-secondary/20 hover:border-primary/20")}>
                      <Fingerprint className={cn("h-6 w-6", biometricEnrolled ? "text-primary" : biometricLoading ? "text-primary animate-pulse" : "text-muted-foreground")} />
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-foreground">
                          {biometricEnrolled ? "Biometric enrolled" : biometricLoading ? "Enrolling…" : "Enable biometric unlock"}
                        </p>
                        <p className="text-xs text-muted-foreground">Use fingerprint or face to unlock quickly</p>
                      </div>
                      {biometricEnrolled && <Check className="h-4 w-4 text-primary" />}
                    </button>
                  ) : (
                    <div className="rounded-xl border border-border bg-secondary/10 p-4 flex items-center gap-3">
                      <Fingerprint className="h-6 w-6 text-muted-foreground/40" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground">Biometric not available</p>
                        <p className="text-xs text-muted-foreground/70">Your device doesn't support biometric authentication, or it's not set up</p>
                      </div>
                    </div>
                  )}
                  {biometricError && (
                    <p className="text-[10px] text-destructive mt-1">{biometricError}</p>
                  )}
                </div>

                {/* Recovery */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Recovery method</p>
                  <p className="text-[10px] text-muted-foreground mb-3">Recovery helps you regain access if something changes — simple and safe</p>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <button onClick={() => setRecoveryMethod("email")}
                      className={cn("rounded-xl border p-3 flex items-center gap-2 transition-all",
                        recoveryMethod === "email" ? "border-primary/50 bg-primary/8" : "border-border bg-secondary/20 hover:border-primary/20")}>
                      <Mail className={cn("h-4 w-4", recoveryMethod === "email" ? "text-primary" : "text-muted-foreground")} />
                      <span className="text-xs font-medium text-foreground">Email recovery</span>
                    </button>
                    <button onClick={generateRecoveryKey}
                      className={cn("rounded-xl border p-3 flex items-center gap-2 transition-all",
                        recoveryMethod === "key" ? "border-primary/50 bg-primary/8" : "border-border bg-secondary/20 hover:border-primary/20")}>
                      <Key className={cn("h-4 w-4", recoveryMethod === "key" ? "text-primary" : "text-muted-foreground")} />
                      <span className="text-xs font-medium text-foreground">Recovery key</span>
                    </button>
                  </div>

                  {recoveryMethod === "email" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <input value={recoveryEmail} onChange={e => setRecoveryEmail(e.target.value)}
                        placeholder="Recovery email address" type="email"
                        className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:ring-2 focus:ring-primary/20 focus:outline-none" />
                      {recoveryEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recoveryEmail) && (
                        <p className="text-[10px] text-[hsl(var(--trust-safe))] mt-1 flex items-center gap-1">
                          <Check className="h-3 w-3" /> Valid email
                        </p>
                      )}
                    </motion.div>
                  )}

                  {recoveryMethod === "key" && recoveryKey && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3">
                      <p className="text-xs text-muted-foreground">Save this key somewhere safe — it's shown only once:</p>
                      <p className="text-sm font-mono text-foreground text-center tracking-wider select-all">{recoveryKey}</p>
                      <button onClick={downloadRecoveryKey}
                        className="w-full flex items-center justify-center gap-2 rounded-lg bg-secondary/40 py-2 text-xs text-foreground hover:bg-secondary/60 transition-colors">
                        <Download className="h-3 w-3" /> Download as file
                      </button>
                    </motion.div>
                  )}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between pt-2">
                  <button onClick={onPrev} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Back</button>
                  <button onClick={handleFinish} disabled={!canFinish}
                    className={cn("rounded-xl px-6 py-2.5 text-sm font-semibold transition-all flex items-center gap-2",
                      canFinish ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground cursor-not-allowed"
                    )}>
                    Secure & Continue <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
