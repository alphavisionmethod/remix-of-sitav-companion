// ═══════════════════════════════════════════════════════════════
// SITA OS — Device Protection "Wow" Card
// Premium first-boot protection setup experience
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { Shield, Wifi, Eye, Moon, ChevronRight, Check, Lock, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProtectionItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  benefit: string;
  recommended: boolean;
  required: boolean;
  enabled: boolean;
  policySource: string;
}

interface DeviceProtectionWowProps {
  defaults: {
    firewallBaseline: boolean;
    vpnOnPublicWifi: boolean;
    threatMonitoring: boolean;
    quietModeEnabled: boolean;
  };
  onAccept: (choices: Record<string, boolean>) => void;
  onReview?: () => void;
}

export function DeviceProtectionWow({ defaults, onAccept, onReview }: DeviceProtectionWowProps) {
  const [items, setItems] = useState<ProtectionItem[]>([
    {
      id: "firewall",
      icon: <Shield className="h-5 w-5" />,
      title: "Firewall Baseline",
      description: "Always-on network protection that blocks unauthorized connections",
      benefit: "Prevents intrusions before they reach your apps",
      recommended: true,
      required: true,
      enabled: defaults.firewallBaseline,
      policySource: "Platform Security",
    },
    {
      id: "vpn",
      icon: <Wifi className="h-5 w-5" />,
      title: "VPN on Public Wi-Fi",
      description: "Automatically encrypts your connection on open networks",
      benefit: "Keeps your data private on coffee shops, airports, hotels",
      recommended: true,
      required: false,
      enabled: defaults.vpnOnPublicWifi,
      policySource: "Recommended",
    },
    {
      id: "threat",
      icon: <Eye className="h-5 w-5" />,
      title: "Smart Threat Blocking",
      description: "AI-powered detection of malicious sites, downloads, and behaviors",
      benefit: "Stops threats before they can harm your device",
      recommended: true,
      required: false,
      enabled: defaults.threatMonitoring,
      policySource: "Recommended",
    },
    {
      id: "quiet",
      icon: <Moon className="h-5 w-5" />,
      title: "Quiet Mode Schedule",
      description: "Silence notifications during focus time and presentations",
      benefit: "Stay focused without interruptions when it matters",
      recommended: false,
      required: false,
      enabled: defaults.quietModeEnabled,
      policySource: "Optional",
    },
  ]);

  const [showDetails, setShowDetails] = useState(false);

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(item =>
      item.id === id && !item.required
        ? { ...item, enabled: !item.enabled }
        : item
    ));
  };

  const handleAcceptAll = () => {
    const choices: Record<string, boolean> = {};
    for (const item of items) {
      choices[item.id] = item.required ? true : true;
    }
    onAccept(choices);
  };

  const handleAcceptCurrent = () => {
    const choices: Record<string, boolean> = {};
    for (const item of items) {
      choices[item.id] = item.enabled;
    }
    onAccept(choices);
  };

  const allEnabled = items.every(i => i.enabled);
  const enabledCount = items.filter(i => i.enabled).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full max-w-md mx-auto"
    >
      {/* Header with animated shield */}
      <div className="text-center mb-6">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[hsl(var(--trust-safe))] to-[hsl(152_55%_38%)] mb-4 shadow-lg shadow-[hsl(152_55%_48%/0.3)]"
        >
          <Lock className="h-8 w-8 text-white" />
        </motion.div>
        <h2 className="font-display text-xl font-bold text-foreground mb-1">
          Device Protection
        </h2>
        <p className="text-sm text-muted-foreground">
          Your security foundation — intelligent, always watching, never in the way
        </p>
      </div>

      {/* Protection Items */}
      <div className="space-y-2">
        <AnimatePresence>
          {items.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              onClick={() => !showDetails && toggleItem(item.id)}
              className={cn(
                "relative rounded-xl border p-3 transition-all cursor-pointer group",
                item.enabled
                  ? "border-[hsl(var(--trust-safe)/0.4)] bg-[hsl(var(--trust-safe)/0.08)]"
                  : "border-border/40 bg-card/60 hover:border-border/60"
              )}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={cn(
                  "flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
                  item.enabled
                    ? "bg-[hsl(var(--trust-safe)/0.2)] text-[hsl(var(--trust-safe))]"
                    : "bg-secondary/60 text-muted-foreground"
                )}>
                  {item.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium text-foreground">{item.title}</span>
                    {item.required && (
                      <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))]">
                        Required
                      </span>
                    )}
                    {!item.required && item.recommended && (
                      <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-[hsl(var(--sita-gold)/0.15)] text-[hsl(var(--sita-gold))]">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {showDetails ? item.description : item.benefit}
                  </p>
                  {showDetails && (
                    <p className="text-[10px] text-muted-foreground/70 mt-1">
                      Source: {item.policySource}
                    </p>
                  )}
                </div>

                {/* Toggle indicator */}
                <div className={cn(
                  "flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all",
                  item.enabled
                    ? "bg-[hsl(var(--trust-safe))] text-white"
                    : "border border-border/60"
                )}>
                  {item.enabled && <Check className="h-3 w-3" />}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-4 text-center"
      >
        <p className="text-[11px] text-muted-foreground mb-4">
          <Zap className="inline h-3 w-3 text-[hsl(var(--sita-gold))] mr-1" />
          {enabledCount} of {items.length} protections active
        </p>

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={allEnabled ? handleAcceptAll : handleAcceptCurrent}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[hsl(var(--trust-safe))] to-[hsl(152_55%_38%)] text-white text-sm font-medium transition-all hover:shadow-lg hover:shadow-[hsl(152_55%_48%/0.3)] active:scale-[0.98]"
          >
            {allEnabled ? "Accept All & Continue" : `Continue with ${enabledCount} Active`}
          </button>

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full py-2 rounded-xl text-[11px] text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1"
          >
            {showDetails ? "Hide Details" : "Review Each Setting"}
            <ChevronRight className={cn("h-3 w-3 transition-transform", showDetails && "rotate-90")} />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
