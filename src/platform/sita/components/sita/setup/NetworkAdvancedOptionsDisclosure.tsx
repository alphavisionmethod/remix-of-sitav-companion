// ═══════════════════════════════════════════════════════════════
// SITA OS — Network Advanced Options Disclosure
// Hidden SSID, enterprise auth, proxy, manual IP
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Plus, Sliders } from "lucide-react";
import { cn } from "@/lib/utils";

interface NetworkAdvancedOptionsDisclosureProps {
  /** Manual SSID entry */
  manualSSID: string;
  onManualSSIDChange: (ssid: string) => void;
  manualSecurity: "wpa2" | "wpa3" | "open";
  onManualSecurityChange: (security: "wpa2" | "wpa3" | "open") => void;
  password: string;
  onPasswordChange: (pw: string) => void;
  onAddManual: () => void;

  /** Proxy config */
  proxyType: "none" | "http" | "socks5" | "auto";
  onProxyTypeChange: (type: "none" | "http" | "socks5" | "auto") => void;
  proxyHost: string;
  onProxyHostChange: (v: string) => void;
  proxyPort: string;
  onProxyPortChange: (v: string) => void;
  proxyUser: string;
  onProxyUserChange: (v: string) => void;
  proxyPass: string;
  onProxyPassChange: (v: string) => void;
  pacUrl: string;
  onPacUrlChange: (v: string) => void;
}

export function NetworkAdvancedOptionsDisclosure({
  manualSSID, onManualSSIDChange, manualSecurity, onManualSecurityChange,
  password, onPasswordChange, onAddManual,
  proxyType, onProxyTypeChange, proxyHost, onProxyHostChange,
  proxyPort, onProxyPortChange, proxyUser, onProxyUserChange,
  proxyPass, onProxyPassChange, pacUrl, onPacUrlChange,
}: NetworkAdvancedOptionsDisclosureProps) {
  const [showManual, setShowManual] = useState(false);
  const [showProxy, setShowProxy] = useState(false);

  return (
    <div className="space-y-2">
      {/* Add Wi-Fi manually */}
      <button
        onClick={() => setShowManual(!showManual)}
        className="flex items-center gap-2 text-xs text-primary hover:underline transition-colors w-full"
      >
        <Plus className="h-3 w-3" />
        Add Wi-Fi network manually
      </button>

      <AnimatePresence>
        {showManual && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border border-border bg-secondary/20 p-4 space-y-3">
              <input
                value={manualSSID}
                onChange={e => onManualSSIDChange(e.target.value)}
                placeholder="Network name (SSID)"
                className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none"
              />
              <div>
                <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Security</label>
                <div className="mt-1 flex gap-2">
                  {(["wpa2", "wpa3", "open"] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => onManualSecurityChange(s)}
                      className={cn(
                        "rounded-lg px-3 py-1.5 text-xs font-medium border transition-all",
                        manualSecurity === s
                          ? "border-primary/40 bg-primary/10 text-primary"
                          : "border-border bg-secondary/30 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {s.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              {manualSecurity !== "open" && (
                <input
                  type="password"
                  value={password}
                  onChange={e => onPasswordChange(e.target.value)}
                  placeholder="Password"
                  className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none"
                />
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowManual(false)}
                  className="flex-1 rounded-lg border border-border py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={onAddManual}
                  disabled={!manualSSID}
                  className={cn(
                    "flex-1 rounded-lg py-2 text-xs font-semibold transition-all",
                    manualSSID
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  )}
                >
                  Add & Connect
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Proxy settings */}
      <button
        onClick={() => setShowProxy(!showProxy)}
        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
      >
        <Sliders className="h-3 w-3" />
        {showProxy ? <ChevronDown className="h-3 w-3 rotate-180" /> : <ChevronDown className="h-3 w-3" />}
        Proxy settings
      </button>

      <AnimatePresence>
        {showProxy && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border border-border bg-secondary/20 p-4 space-y-3">
              <div>
                <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Proxy type</label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {(["none", "http", "socks5", "auto"] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => onProxyTypeChange(t)}
                      className={cn(
                        "rounded-lg px-3 py-1.5 text-xs font-medium border transition-all",
                        proxyType === t
                          ? "border-primary/40 bg-primary/10 text-primary"
                          : "border-border bg-secondary/30 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {t === "none" ? "None" : t === "http" ? "HTTP/HTTPS" : t === "socks5" ? "SOCKS5" : "Auto (PAC)"}
                    </button>
                  ))}
                </div>
              </div>
              {proxyType === "auto" && (
                <input
                  value={pacUrl}
                  onChange={e => onPacUrlChange(e.target.value)}
                  placeholder="PAC URL (e.g. http://proxy.company.com/proxy.pac)"
                  className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none"
                />
              )}
              {(proxyType === "http" || proxyType === "socks5") && (
                <>
                  <div className="flex gap-2">
                    <input
                      value={proxyHost}
                      onChange={e => onProxyHostChange(e.target.value)}
                      placeholder="Proxy host"
                      className="flex-1 rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none"
                    />
                    <input
                      value={proxyPort}
                      onChange={e => onProxyPortChange(e.target.value)}
                      placeholder="Port"
                      className="w-20 rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={proxyUser}
                      onChange={e => onProxyUserChange(e.target.value)}
                      placeholder="Username (optional)"
                      className="flex-1 rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none"
                    />
                    <input
                      value={proxyPass}
                      onChange={e => onProxyPassChange(e.target.value)}
                      placeholder="Password"
                      type="password"
                      className="flex-1 rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none"
                    />
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
