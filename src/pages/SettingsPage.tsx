// ═══════════════════════════════════════════════════════════════
// SITA OS — Settings Page (Launcher + Security tiles)
// Phase 19.1.C — surfaces MFA + Passkey discovery with live status
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { Settings, ShieldCheck, KeyRound, ChevronRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MFAService } from "@/lib/services/identity-auth/mfa.service";
import { WebAuthnService } from "@/lib/services/identity-auth/webauthn.service";
import { useAuth } from "@/contexts/AuthContext";
import { AdvisorAvatarPreview } from "@/components/settings/AdvisorAvatarPreview";
import { AdvisorAvatarUpload } from "@/components/settings/AdvisorAvatarUpload";
import { AvatarDebugToggle } from "@/components/settings/AvatarDebugToggle";

interface SecurityStatus {
  mfaEnrolled: boolean;
  passkeyCount: number;
  loaded: boolean;
}

const SettingsPage = () => {
  const { user, isDemo } = useAuth();
  const [status, setStatus] = useState<SecurityStatus>({
    mfaEnrolled: false,
    passkeyCount: 0,
    loaded: false,
  });

  // Open the unified Settings window in the OS shell (existing behaviour)
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("nova-open-app", { detail: { appId: "settings" } }));
  }, []);

  // Phase 19.1.C — load real backend status for security tiles
  useEffect(() => {
    if (!user || isDemo) {
      setStatus({ mfaEnrolled: false, passkeyCount: 0, loaded: true });
      return;
    }
    let cancelled = false;
    (async () => {
      const [factors, passkeys] = await Promise.all([
        MFAService.listFactors().catch(() => []),
        WebAuthnService.listPasskeys().catch(() => []),
      ]);
      if (cancelled) return;
      const mfaEnrolled = Array.isArray(factors)
        ? factors.some((f: any) => f.status === "verified" && f.factorType === "totp")
        : false;
      setStatus({
        mfaEnrolled,
        passkeyCount: Array.isArray(passkeys) ? passkeys.length : 0,
        loaded: true,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [user, isDemo]);

  const securityTiles = [
    {
      to: "/settings/mfa",
      icon: ShieldCheck,
      label: "Two-factor authentication",
      desc: "Protect your account with a TOTP authenticator app.",
      pill: status.mfaEnrolled ? "Enrolled" : "Not set up",
      pillTone: status.mfaEnrolled ? "ok" : "warn",
    },
    {
      to: "/settings/passkey",
      icon: KeyRound,
      label: "Passkeys",
      desc: "Sign in with biometrics or hardware keys (WebAuthn).",
      pill: status.passkeyCount > 0 ? `${status.passkeyCount} active` : "Not set up",
      pillTone: status.passkeyCount > 0 ? "ok" : "warn",
    },
  ] as const;

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-4 rounded-2xl bg-muted/30 border border-border/30">
        <Settings className="h-10 w-10 text-muted-foreground" />
      </div>
      <div className="text-center space-y-1">
        <h1 className="text-lg font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Opening the Settings app…</p>
        <p className="text-xs text-muted-foreground mt-2">
          If the Settings window doesn't open automatically, click the Settings icon in the dock.
        </p>
      </div>

      {/* Phase 19.1.C — Security shortcuts */}
      <section className="w-full max-w-2xl space-y-3 mt-4">
        <h2 className="text-xs uppercase tracking-wider text-muted-foreground px-1">
          Security & access
        </h2>
        <div className="grid gap-3">
          {securityTiles.map((tile) => (
            <Link
              key={tile.to}
              to={tile.to}
              className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 hover:border-primary/40 hover:bg-accent/30 transition-colors"
            >
              <div className="rounded-xl bg-primary/10 p-2.5">
                <tile.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">{tile.label}</p>
                  {!status.loaded ? (
                    <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                  ) : (
                    <span
                      className={
                        "text-[10px] font-medium px-2 py-0.5 rounded-full border " +
                        (tile.pillTone === "ok"
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400")
                      }
                    >
                      {tile.pill}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{tile.desc}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </Link>
          ))}
        </div>
      </section>

      {/* Advisor Avatar Preview & Upload */}
      <section className="w-full max-w-2xl space-y-6 mt-6">
        <AdvisorAvatarPreview />
        <AdvisorAvatarUpload />
        <AvatarDebugToggle />
      </section>
    </motion.div>
  );
};

export default SettingsPage;
