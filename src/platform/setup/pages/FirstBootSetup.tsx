// ═══════════════════════════════════════════════════════════════
// SITA OS — First Boot Setup Experience
// Premium 11-screen onboarding with hardware detection,
// policy-aware defaults, resume support, and completion gating
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useOnboardingDaemon } from "@/platform/setup/hooks/useOnboardingDaemon";
import { useUpdateDaemon } from "@/platform/runtime/hooks/useUpdateDaemon";
import {
  Globe, MapPin, Accessibility, Wifi, WifiOff, User, Lock, Shield, Eye,
  Download, Upload, HardDrive, Battery, Moon, Zap, CheckCircle, ChevronRight,
  ChevronLeft, Loader2, Keyboard, Monitor, Fingerprint, Key, RefreshCw,
  Sun, Volume2, Type, MousePointer, ArrowRight, AlertTriangle, Radio,
  Cloud, FolderOpen, Sparkles, Bell, BellOff, Laptop
} from "lucide-react";

// ── Animations ──
const pageVariants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};

// ── Selection Card ──
function SelectionCard({ selected, onClick, icon: Icon, label, description, disabled }: {
  selected: boolean; onClick: () => void; icon: typeof Globe; label: string; description?: string; disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full rounded-2xl border p-4 text-left transition-all",
        selected ? "border-primary/40 bg-primary/8 ring-1 ring-primary/20" : "border-border hover:border-primary/20",
        disabled && "opacity-40 cursor-not-allowed"
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
          selected ? "bg-primary/15" : "bg-muted/50"
        )}>
          <Icon className={cn("h-5 w-5", selected ? "text-primary" : "text-muted-foreground")} />
        </div>
        <div className="min-w-0">
          <p className={cn("text-sm font-semibold", selected ? "text-primary" : "text-foreground")}>{label}</p>
          {description && <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>}
        </div>
        {selected && <CheckCircle className="h-4 w-4 text-primary ml-auto shrink-0" />}
      </div>
    </button>
  );
}

// ── Toggle Row ──
function ToggleRow({ label, description, enabled, onChange, icon: Icon }: {
  label: string; description: string; enabled: boolean; onChange: () => void; icon: typeof Shield;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
      <div className="flex items-center gap-3">
        <Icon className={cn("h-4 w-4", enabled ? "text-primary" : "text-muted-foreground")} />
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-[11px] text-muted-foreground">{description}</p>
        </div>
      </div>
      <button onClick={onChange} className={cn("relative h-6 w-11 rounded-full transition-colors", enabled ? "bg-primary" : "bg-muted")}>
        <span className="absolute top-0.5 h-5 w-5 rounded-full bg-card shadow transition-transform left-0.5"
          style={{ transform: enabled ? "translateX(20px)" : "translateX(0)" }} />
      </button>
    </div>
  );
}

// ── Main Component ──
export default function FirstBootSetupExperience() {
  const ob = useOnboardingDaemon();
  const ud = useUpdateDaemon();

  // Local state for each screen's form
  const [language, setLanguage] = useState("en");
  const [region, setRegion] = useState("us");
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [keyboard, setKeyboard] = useState("qwerty");
  const [a11y, setA11y] = useState({ screenReader: false, highContrast: false, reducedMotion: false, largeText: false, keyboardNav: false });
  const [networkConnected, setNetworkConnected] = useState(false);
  const [connectingWifi, setConnectingWifi] = useState(false);
  const [accountName, setAccountName] = useState("");
  const [accountPassword, setAccountPassword] = useState("");
  const [accountPin, setAccountPin] = useState("");
  const [biometricEnrolled, setBiometricEnrolled] = useState(false);
  const [privacy, setPrivacy] = useState({ telemetry: false, cloudSync: true, shieldDefaults: true, notifPrivacy: true });
  const [protection, setProtection] = useState({ firewall: true, vpnPublicWifi: true, smartBlocking: true, quietSchedule: false });
  const [optimization, setOptimization] = useState({ batteryOpt: true, calmMode: true });
  const [checkingUpdates, setCheckingUpdates] = useState(false);
  const [updatesChecked, setUpdatesChecked] = useState(false);

  // Auto-start onboarding
  useEffect(() => {
    if (ob.session.state === "not_started") {
      ob.startOnboarding();
    }
  }, []);

  const handleNext = async () => {
    const step = ob.currentStep;
    if (!step) return;

    const choiceMap: Record<string, Record<string, unknown>> = {
      welcome: { language },
      region: { region, timezone, keyboard },
      accessibility: { ...a11y },
      network: { networkConnected },
      account: { accountName, accountPassword, accountPin, biometricEnrolled, accountCreated: !!accountName && !!accountPassword },
      privacy: { ...privacy },
      restore: {},
      update_check: { updatesChecked: true },
      optimization: { ...optimization },
      protection: { ...protection },
      finish: {},
    };

    await ob.completeStep(step.id, choiceMap[step.id] || {});
  };

  const handleSkip = async () => {
    if (ob.currentStep) await ob.skipStep(ob.currentStep.id);
  };

  const handleFinish = async () => {
    await ob.completeOnboarding();
  };

  const canProceed = (): boolean => {
    const step = ob.currentStep;
    if (!step) return false;
    switch (step.id) {
      case "account": return !!accountName && accountPassword.length >= 6;
      case "network": return true; // Can proceed without network
      default: return true;
    }
  };

  // ── Render current step screen ──
  const renderStep = () => {
    const step = ob.currentStep;
    if (!step) return null;

    switch (step.id) {
      // ═══ 1. WELCOME ═══
      case "welcome":
        return (
          <div className="space-y-8 text-center">
            <div className="space-y-4">
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }}
                className="h-24 w-24 rounded-3xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mx-auto shadow-xl shadow-primary/20">
                <Sparkles className="h-12 w-12 text-primary-foreground" />
              </motion.div>
              <h1 className="text-3xl font-display font-bold text-foreground">Welcome to SITA OS</h1>
              <p className="text-muted-foreground max-w-md mx-auto">Your sovereign operating system. Let's set up your environment — it only takes a few minutes.</p>
            </div>

            <div className="max-w-sm mx-auto space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Choose Language</p>
              {[
                { code: "en", label: "English", flag: "🇺🇸" },
                { code: "es", label: "Español", flag: "🇪🇸" },
                { code: "fr", label: "Français", flag: "🇫🇷" },
                { code: "de", label: "Deutsch", flag: "🇩🇪" },
              ].map(l => (
                <button key={l.code} onClick={() => setLanguage(l.code)}
                  className={cn("w-full flex items-center gap-3 rounded-xl border p-3 transition-all",
                    language === l.code ? "border-primary/40 bg-primary/8" : "border-border hover:border-primary/20"
                  )}>
                  <span className="text-xl">{l.flag}</span>
                  <span className={cn("text-sm font-medium", language === l.code ? "text-primary" : "text-foreground")}>{l.label}</span>
                  {language === l.code && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
                </button>
              ))}
            </div>

            <button className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 mx-auto">
              <Accessibility className="h-3 w-3" /> Accessibility options
            </button>
          </div>
        );

      // ═══ 2. REGION ═══
      case "region":
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                <MapPin className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-2xl font-display font-bold">Region & Time Zone</h2>
              <p className="text-sm text-muted-foreground">Configure regional settings for your device</p>
            </div>

            <div className="max-w-md mx-auto space-y-5">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Region</label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {[
                    { code: "us", label: "United States" }, { code: "uk", label: "United Kingdom" },
                    { code: "eu", label: "European Union" }, { code: "other", label: "Other" },
                  ].map(r => (
                    <button key={r.code} onClick={() => setRegion(r.code)}
                      className={cn("rounded-xl border p-3 text-sm transition-all",
                        region === r.code ? "border-primary/40 bg-primary/8 text-primary font-semibold" : "border-border text-foreground hover:border-primary/20"
                      )}>{r.label}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Time Zone</label>
                <div className="mt-2 rounded-xl border border-border bg-card p-3">
                  <p className="text-sm font-mono text-foreground">{timezone}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Auto-detected from your device</p>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Keyboard Layout</label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {["qwerty", "azerty", "dvorak"].map(k => (
                    <button key={k} onClick={() => setKeyboard(k)}
                      className={cn("rounded-xl border p-2.5 text-xs font-mono uppercase transition-all",
                        keyboard === k ? "border-primary/40 bg-primary/8 text-primary font-bold" : "border-border text-foreground hover:border-primary/20"
                      )}>{k}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      // ═══ 3. ACCESSIBILITY ═══
      case "accessibility":
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                <Accessibility className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-2xl font-display font-bold">Accessibility</h2>
              <p className="text-sm text-muted-foreground">Make SITA OS work the way you need</p>
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <ToggleRow icon={Volume2} label="Screen Reader" description="Enable spoken feedback for all UI elements" enabled={a11y.screenReader} onChange={() => setA11y(p => ({ ...p, screenReader: !p.screenReader }))} />
              <ToggleRow icon={Sun} label="High Contrast" description="Increase color contrast for better visibility" enabled={a11y.highContrast} onChange={() => setA11y(p => ({ ...p, highContrast: !p.highContrast }))} />
              <ToggleRow icon={MousePointer} label="Reduced Motion" description="Minimize animations and transitions" enabled={a11y.reducedMotion} onChange={() => setA11y(p => ({ ...p, reducedMotion: !p.reducedMotion }))} />
              <ToggleRow icon={Type} label="Large Text" description="Increase default font sizes throughout" enabled={a11y.largeText} onChange={() => setA11y(p => ({ ...p, largeText: !p.largeText }))} />
              <ToggleRow icon={Keyboard} label="Keyboard Navigation" description="Enhanced keyboard shortcuts and tab navigation" enabled={a11y.keyboardNav} onChange={() => setA11y(p => ({ ...p, keyboardNav: !p.keyboardNav }))} />
            </div>
          </div>
        );

      // ═══ 4. NETWORK ═══
      case "network":
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                <Wifi className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-2xl font-display font-bold">Network Setup</h2>
              <p className="text-sm text-muted-foreground">Connect to the internet for updates and sync</p>
            </div>
            <div className="max-w-md mx-auto space-y-3">
              {networkConnected ? (
                <div className="rounded-2xl border border-[hsl(var(--trust-safe))]/30 bg-[hsl(var(--trust-safe))]/5 p-5 text-center space-y-2">
                  <CheckCircle className="h-8 w-8 text-[hsl(var(--trust-safe))] mx-auto" />
                  <p className="text-sm font-semibold text-foreground">Connected</p>
                  <p className="text-xs text-muted-foreground">SITA-Home · Excellent signal</p>
                </div>
              ) : (
                <>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Available Networks</p>
                  {[
                    { name: "SITA-Home", strength: 92, secured: true },
                    { name: "Neighbor-5G", strength: 64, secured: true },
                    { name: "CoffeeShop-Free", strength: 45, secured: false },
                  ].map(net => (
                    <button key={net.name} onClick={async () => {
                      setConnectingWifi(true);
                      await new Promise(r => setTimeout(r, 1500));
                      setNetworkConnected(true);
                      setConnectingWifi(false);
                    }} disabled={connectingWifi}
                      className="w-full flex items-center justify-between rounded-xl border border-border p-4 hover:border-primary/20 transition-all">
                      <div className="flex items-center gap-3">
                        <Wifi className={cn("h-4 w-4", net.strength > 70 ? "text-[hsl(var(--trust-safe))]" : net.strength > 40 ? "text-accent" : "text-muted-foreground")} />
                        <div className="text-left">
                          <p className="text-sm font-medium text-foreground">{net.name}</p>
                          <p className="text-[10px] text-muted-foreground">{net.secured ? "Secured" : "Open"} · {net.strength}%</p>
                        </div>
                      </div>
                      {connectingWifi ? <Loader2 className="h-4 w-4 text-primary animate-spin" /> : <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
                    </button>
                  ))}
                  <button className="w-full text-xs text-muted-foreground hover:text-foreground text-center py-2 flex items-center gap-1 justify-center">
                    <WifiOff className="h-3 w-3" /> Join hidden network…
                  </button>
                </>
              )}
              {ob.session.hardware.ethernetPresent && (
                <div className="rounded-xl border border-border bg-muted/30 p-3 flex items-center gap-3">
                  <Monitor className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Ethernet detected — auto-connected</p>
                </div>
              )}
            </div>
          </div>
        );

      // ═══ 5. ACCOUNT ═══
      case "account":
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                <User className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-2xl font-display font-bold">Create Your Account</h2>
              <p className="text-sm text-muted-foreground">This will be the primary administrator account</p>
            </div>
            <div className="max-w-md mx-auto space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Full Name</label>
                <input value={accountName} onChange={e => setAccountName(e.target.value)} placeholder="Your name"
                  className="mt-2 w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Password</label>
                <input type="password" value={accountPassword} onChange={e => setAccountPassword(e.target.value)} placeholder="Min 6 characters"
                  className="mt-2 w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30" />
                {accountPassword.length > 0 && accountPassword.length < 6 && (
                  <p className="text-xs text-destructive mt-1">Password must be at least 6 characters</p>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">PIN (Optional)</label>
                <input type="password" value={accountPin} onChange={e => setAccountPin(e.target.value)} placeholder="4-6 digit PIN" maxLength={6}
                  className="mt-2 w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30" />
              </div>
              {ob.session.hardware.biometricPresent && (
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <ToggleRow icon={Fingerprint} label="Biometric Login" description="Use fingerprint or face recognition to sign in" enabled={biometricEnrolled} onChange={() => setBiometricEnrolled(!biometricEnrolled)} />
                </div>
              )}
              {ob.session.hardware.tpmPresent && (
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground px-2">
                  <Key className="h-3 w-3" /> Device encryption secured by TPM
                </div>
              )}
            </div>
          </div>
        );

      // ═══ 6. PRIVACY ═══
      case "privacy":
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                <Eye className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-2xl font-display font-bold">Privacy & Security Defaults</h2>
              <p className="text-sm text-muted-foreground">Choose how your data is handled</p>
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <ToggleRow icon={Radio} label="Usage Analytics" description="Help improve SITA OS with anonymous usage data" enabled={privacy.telemetry} onChange={() => setPrivacy(p => ({ ...p, telemetry: !p.telemetry }))} />
              <ToggleRow icon={Cloud} label="Cloud Sync" description="Sync settings, preferences, and encrypted data across devices" enabled={privacy.cloudSync} onChange={() => setPrivacy(p => ({ ...p, cloudSync: !p.cloudSync }))} />
              <ToggleRow icon={Shield} label="Shield Defaults" description="Enable recommended security protections" enabled={privacy.shieldDefaults} onChange={() => setPrivacy(p => ({ ...p, shieldDefaults: !p.shieldDefaults }))} />
              <ToggleRow icon={Bell} label="Notification Privacy" description="Hide notification content on lock screen" enabled={privacy.notifPrivacy} onChange={() => setPrivacy(p => ({ ...p, notifPrivacy: !p.notifPrivacy }))} />
            </div>
          </div>
        );

      // ═══ 7. RESTORE ═══
      case "restore":
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                <Upload className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-2xl font-display font-bold">Restore / Import</h2>
              <p className="text-sm text-muted-foreground">Bring over your data from a previous installation</p>
            </div>
            <div className="max-w-md mx-auto space-y-3">
              {ob.session.restoreSources.map(src => (
                <SelectionCard
                  key={src.id}
                  selected={src.selected}
                  onClick={() => ob.selectRestoreSource(src.id)}
                  icon={src.sourceType === "cloud" ? Cloud : FolderOpen}
                  label={src.label}
                  description={`Status: ${src.status}`}
                />
              ))}
              <div className="text-center pt-2">
                <button className="text-xs text-muted-foreground hover:text-foreground">
                  Skip — start fresh
                </button>
              </div>
            </div>
          </div>
        );

      // ═══ 8. UPDATE CHECK ═══
      case "update_check":
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                <Download className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-2xl font-display font-bold">System Updates</h2>
              <p className="text-sm text-muted-foreground">Check for the latest updates</p>
            </div>
            <div className="max-w-md mx-auto space-y-4">
              {!updatesChecked ? (
                <div className="text-center space-y-4">
                  <button
                    onClick={async () => {
                      setCheckingUpdates(true);
                      await ud.checkForUpdates();
                      setCheckingUpdates(false);
                      setUpdatesChecked(true);
                    }}
                    disabled={checkingUpdates}
                    className="mx-auto flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {checkingUpdates ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    {checkingUpdates ? "Checking…" : "Check for Updates"}
                  </button>
                  {!networkConnected && (
                    <p className="text-xs text-accent flex items-center gap-1 justify-center">
                      <AlertTriangle className="h-3 w-3" /> No network — update check may fail
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {ud.catalog.length > 0 ? (
                    <>
                      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-center space-y-2">
                        <Download className="h-6 w-6 text-primary mx-auto" />
                        <p className="text-sm font-semibold">{ud.catalog.length} update{ud.catalog.length > 1 ? "s" : ""} available</p>
                        <p className="text-xs text-muted-foreground">You can install updates after setup completes</p>
                      </div>
                      {ud.catalog.filter(u => u.critical).map(u => (
                        <div key={u.id} className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 flex items-center gap-3">
                          <Shield className="h-4 w-4 text-destructive shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-destructive">Critical: {u.version}</p>
                            <p className="text-[10px] text-muted-foreground">{u.releaseNotes?.slice(0, 80)}</p>
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="rounded-2xl border border-[hsl(var(--trust-safe))]/20 bg-[hsl(var(--trust-safe))]/5 p-5 text-center space-y-2">
                      <CheckCircle className="h-6 w-6 text-[hsl(var(--trust-safe))] mx-auto" />
                      <p className="text-sm font-semibold">System is up to date</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      // ═══ 9. OPTIMIZATION ═══
      case "optimization":
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                <Zap className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-2xl font-display font-bold">Device Optimization</h2>
              <p className="text-sm text-muted-foreground">Fine-tune performance for your hardware</p>
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <ToggleRow icon={Battery} label="Battery Optimization" description="Extend battery life with intelligent power management" enabled={optimization.batteryOpt} onChange={() => setOptimization(p => ({ ...p, batteryOpt: !p.batteryOpt }))} />
              <ToggleRow icon={Moon} label="Calm Mode" description="Reduce notifications and visual activity during focus" enabled={optimization.calmMode} onChange={() => setOptimization(p => ({ ...p, calmMode: !p.calmMode }))} />
            </div>
            {/* Hardware summary */}
            <div className="max-w-md mx-auto rounded-2xl border border-border bg-muted/20 p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Detected Hardware</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between"><span className="text-muted-foreground">Display</span><span className="text-foreground">{ob.session.hardware.displayResolution}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Memory</span><span className="text-foreground">{Math.round(ob.session.hardware.memoryBytes / 1_000_000_000)} GB</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Storage</span><span className="text-foreground">{Math.round(ob.session.hardware.storageBytes / 1_000_000_000)} GB</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Battery</span><span className="text-foreground">{ob.session.hardware.batteryPresent ? "Yes" : "No"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Biometric</span><span className="text-foreground">{ob.session.hardware.biometricPresent ? "Yes" : "No"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">TPM</span><span className="text-foreground">{ob.session.hardware.tpmPresent ? "Yes" : "No"}</span></div>
              </div>
            </div>
          </div>
        );

      // ═══ 10. PROTECTION — THE WOW SCREEN ═══
      case "protection":
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}
                className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-[hsl(var(--trust-safe))] flex items-center justify-center mx-auto shadow-xl shadow-primary/25">
                <Shield className="h-8 w-8 text-foreground" />
              </motion.div>
              <h2 className="text-2xl font-display font-bold">Device Protection</h2>
              <p className="text-sm text-muted-foreground">Your first line of defense, configured intelligently</p>
            </div>
            <div className="max-w-md mx-auto space-y-3">
              {[
                { key: "firewall", icon: Shield, label: "Firewall Baseline", desc: "Block unauthorized incoming connections", value: protection.firewall, tag: "Required", tagColor: "bg-[hsl(var(--trust-safe))]/15 text-[hsl(var(--trust-safe))]" },
                { key: "vpnPublicWifi", icon: Lock, label: "VPN on Public Wi-Fi", desc: "Automatically route traffic through encrypted VPN on untrusted networks", value: protection.vpnPublicWifi, tag: "Recommended", tagColor: "bg-primary/15 text-primary" },
                { key: "smartBlocking", icon: Eye, label: "Smart Threat Blocking", desc: "AI-powered detection of suspicious network activity and phishing", value: protection.smartBlocking, tag: "Recommended", tagColor: "bg-primary/15 text-primary" },
                { key: "quietSchedule", icon: BellOff, label: "Quiet Mode Schedule", desc: "Suppress non-critical alerts during focus hours (10pm-7am)", value: protection.quietSchedule, tag: "Optional", tagColor: "bg-muted text-muted-foreground" },
              ].map(item => (
                <motion.div key={item.key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={cn("rounded-2xl border p-4 transition-all",
                    item.value ? "border-[hsl(var(--trust-safe))]/30 bg-[hsl(var(--trust-safe))]/5" : "border-border"
                  )}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5",
                        item.value ? "bg-[hsl(var(--trust-safe))]/15" : "bg-muted/50"
                      )}>
                        <item.icon className={cn("h-4.5 w-4.5", item.value ? "text-[hsl(var(--trust-safe))]" : "text-muted-foreground")} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-foreground">{item.label}</p>
                          <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase", item.tagColor)}>{item.tag}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                    <button onClick={() => setProtection(p => ({ ...p, [item.key]: !p[item.key as keyof typeof p] }))}
                      className={cn("relative h-6 w-11 rounded-full transition-colors shrink-0 mt-1", item.value ? "bg-[hsl(var(--trust-safe))]" : "bg-muted")}>
                      <span className="absolute top-0.5 h-5 w-5 rounded-full bg-card shadow transition-transform left-0.5"
                        style={{ transform: item.value ? "translateX(20px)" : "translateX(0)" }} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );

      // ═══ 11. FINISH ═══
      case "finish":
        return (
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 150, delay: 0.1 }}
                className="h-20 w-20 rounded-3xl bg-gradient-to-br from-[hsl(var(--trust-safe))] to-primary flex items-center justify-center mx-auto shadow-xl">
                <CheckCircle className="h-10 w-10 text-foreground" />
              </motion.div>
              <h2 className="text-2xl font-display font-bold">You're All Set</h2>
              <p className="text-sm text-muted-foreground">Your environment is configured and protected</p>
            </div>

            <div className="max-w-md mx-auto space-y-3">
              {/* Summary */}
              <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Setup Summary</p>
                {[
                  { label: "Language", value: language.toUpperCase() },
                  { label: "Region", value: region.toUpperCase() },
                  { label: "Account", value: accountName || "Not set" },
                  { label: "Network", value: networkConnected ? "Connected" : "Deferred" },
                  { label: "Firewall", value: protection.firewall ? "On" : "Off" },
                  { label: "VPN Auto", value: protection.vpnPublicWifi ? "On" : "Off" },
                  { label: "Smart Blocking", value: protection.smartBlocking ? "On" : "Off" },
                  { label: "Updates", value: updatesChecked ? (ud.catalog.length > 0 ? `${ud.catalog.length} available` : "Up to date") : "Deferred" },
                ].map(item => (
                  <div key={item.label} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium text-foreground">{item.value}</span>
                  </div>
                ))}
              </div>

              {/* Completion markers */}
              <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Completion Checklist</p>
                {ob.session.completionMarkers.map(m => (
                  <div key={m.name} className="flex items-center gap-2 text-xs">
                    {m.satisfied
                      ? <CheckCircle className="h-3.5 w-3.5 text-[hsl(var(--trust-safe))]" />
                      : <div className="h-3.5 w-3.5 rounded-full border-2 border-muted-foreground/30" />
                    }
                    <span className={m.satisfied ? "text-foreground" : "text-muted-foreground"}>{m.name.replace(/_/g, " ")}</span>
                  </div>
                ))}
              </div>

              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                onClick={handleFinish}
                className="w-full rounded-2xl bg-gradient-to-r from-primary to-[hsl(var(--trust-safe))] text-foreground font-bold py-4 text-sm shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-[1.01]"
              >
                <span className="flex items-center justify-center gap-2">
                  <Sparkles className="h-4 w-4" /> Launch SITA OS
                </span>
              </motion.button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // If completed, don't render
  if (ob.session.state === "completed") return null;
  // If not started yet and loading
  if (ob.session.state === "not_started" || ob.session.state === "initializing") {
    return (
      <div className="fixed inset-0 z-[300] bg-background flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-4">
          <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Initializing…</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[300] bg-background flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <span className="text-sm font-display font-bold text-foreground">SITA OS Setup</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-muted-foreground">
            Step {ob.stepIndex + 1} of {ob.totalSteps}
          </span>
          <Progress value={ob.progress} className="h-1.5 w-32" />
          <span className="text-xs font-mono text-primary">{ob.progress}%</span>
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex items-center justify-center gap-1 py-3 px-6 overflow-x-auto">
        {ob.session.steps.map((s, i) => (
          <div key={s.id} className="flex items-center">
            <div className={cn(
              "h-2 w-2 rounded-full transition-all",
              s.status === "complete" ? "bg-[hsl(var(--trust-safe))]" :
              s.status === "active" ? "bg-primary w-6" :
              s.status === "skipped" ? "bg-muted-foreground/30" :
              "bg-muted"
            )} />
            {i < ob.session.steps.length - 1 && <div className="w-3 h-px bg-border mx-0.5" />}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={ob.currentStep?.id}
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25 }}
            className="max-w-2xl mx-auto"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom navigation */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-border/50">
        <button
          onClick={ob.goBack}
          disabled={ob.stepIndex === 0}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>

        <div className="flex items-center gap-3">
          {ob.currentStep && !ob.currentStep.required && ob.currentStep.id !== "finish" && (
            <button onClick={handleSkip} className="px-4 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors">
              Skip
            </button>
          )}

          {ob.currentStep?.id === "finish" ? (
            <button onClick={handleFinish}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-[hsl(var(--trust-safe))] text-foreground text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
              <Sparkles className="h-4 w-4" /> Launch
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              Continue <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
