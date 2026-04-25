// ═══════════════════════════════════════════════════════════════
// SITA OS — App Permission Gate
// Glassmorphic first-launch permission dialog
// ═══════════════════════════════════════════════════════════════

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Shield, ShieldAlert, ShieldCheck, X } from "lucide-react";
import { APP_TYPE, APP_COMPONENTS, APP_ACCENTS } from "@/platform/design-system/app-window-system";
import { DEPTH_LAYERS } from "@/platform/design-system/nova-os";
import type { AppPermission } from "@/domains/apps/types";

interface AppPermissionGateProps {
  appId: string;
  appName: string;
  appIcon: string;
  appIconBg: string;
  permissions: AppPermission[];
  open: boolean;
  onAllow: () => void;
  onDeny: () => void;
}

const RISK_STYLES = {
  low: {
    icon: ShieldCheck,
    badge: "bg-[hsl(140_50%_45%/0.12)] text-[hsl(140_50%_35%)] dark:text-[hsl(140_50%_60%)]",
    dot: "bg-[hsl(140_50%_45%)]",
  },
  medium: {
    icon: Shield,
    badge: "bg-[hsl(45_80%_50%/0.12)] text-[hsl(45_80%_35%)] dark:text-[hsl(45_80%_55%)]",
    dot: "bg-[hsl(45_80%_50%)]",
  },
  high: {
    icon: ShieldAlert,
    badge: "bg-[hsl(0_70%_55%/0.12)] text-[hsl(0_70%_40%)] dark:text-[hsl(0_70%_60%)]",
    dot: "bg-[hsl(0_70%_55%)]",
  },
};

function getStorageKey(appId: string) {
  return `sita-perm-grant:${appId}`;
}

export function isPermissionGranted(appId: string): boolean {
  try {
    return localStorage.getItem(getStorageKey(appId)) === "granted";
  } catch {
    return false;
  }
}

export function grantPermission(appId: string) {
  try {
    localStorage.setItem(getStorageKey(appId), "granted");
  } catch {}
}

export function AppPermissionGate({
  appId,
  appName,
  appIcon,
  appIconBg,
  permissions,
  open,
  onAllow,
  onDeny,
}: AppPermissionGateProps) {
  const accent = APP_ACCENTS[appId] || APP_ACCENTS.default;
  const requiredPerms = permissions.filter(p => p.required);
  const optionalPerms = permissions.filter(p => !p.required);

  const handleAllow = () => {
    grantPermission(appId);
    onAllow();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-[hsl(0_0%_0%/0.4)] backdrop-blur-sm"
            style={{ zIndex: DEPTH_LAYERS.overlay }}
            onClick={onDeny}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 5 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
              "w-[380px] max-w-[90vw] max-h-[85vh] overflow-y-auto rounded-2xl",
              "bg-[hsl(0_0%_100%/0.80)] dark:bg-[hsl(0_0%_8%/0.85)]",
              "backdrop-blur-2xl",
              "border border-[hsl(0_0%_100%/0.30)] dark:border-[hsl(0_0%_100%/0.10)]",
              "shadow-[0_2px_6px_hsl(0_0%_0%/0.08),0_24px_48px_hsl(0_0%_0%/0.20)]"
            )}
            style={{ zIndex: DEPTH_LAYERS.overlay + 1 }}
          >
            {/* Accent strip */}
            <div className={cn("h-[2px] w-full bg-gradient-to-r", accent)} />

            {/* Close button */}
            <button
              onClick={onDeny}
              className="absolute top-3 right-3 p-1 rounded-lg text-[hsl(0_0%_50%)] hover:text-[hsl(0_0%_30%)] dark:hover:text-[hsl(0_0%_70%)] hover:bg-[hsl(0_0%_0%/0.05)] dark:hover:bg-[hsl(0_0%_100%/0.05)] transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>

            {/* Content */}
            <div className="px-6 pt-6 pb-5 text-center">
              {/* App icon */}
              <div className="flex justify-center mb-4">
                <div className={cn("w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center text-2xl shadow-lg", appIconBg)}>
                  {appIcon}
                </div>
              </div>

              <p className={cn(APP_TYPE.heading, "text-[hsl(0_0%_12%)] dark:text-[hsl(0_0%_90%)] mb-1")}>
                "{appName}" wants access
              </p>
              <p className={cn(APP_TYPE.body, "text-[hsl(0_0%_0%/0.5)] dark:text-[hsl(0_0%_100%/0.5)] mb-5")}>
                This app needs the following permissions to work properly.
              </p>

              {/* Permissions list */}
              <div className="space-y-2 text-left mb-6">
                {requiredPerms.map(p => {
                  const style = RISK_STYLES[p.riskLevel];
                  const RiskIcon = style.icon;
                  return (
                    <div key={p.id} className="flex items-start gap-3 px-3 py-2.5 rounded-xl bg-[hsl(0_0%_0%/0.02)] dark:bg-[hsl(0_0%_100%/0.03)]">
                      <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5", style.badge)}>
                        <RiskIcon className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className={cn(APP_TYPE.body, "font-medium text-[hsl(0_0%_15%)] dark:text-[hsl(0_0%_85%)]")}>
                          {p.label}
                        </p>
                        <p className={cn(APP_TYPE.label, "text-[hsl(0_0%_0%/0.4)] dark:text-[hsl(0_0%_100%/0.4)]")}>
                          {p.description}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {optionalPerms.length > 0 && (
                  <p className={cn(APP_TYPE.label, "text-[hsl(0_0%_0%/0.35)] dark:text-[hsl(0_0%_100%/0.35)] px-1 pt-1")}>
                    Optional permissions can be configured later in Settings.
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={onDeny}
                  className={cn(APP_COMPONENTS.button.base, APP_COMPONENTS.button.secondary, "flex-1 py-2")}
                >
                  Don't Allow
                </button>
                <button
                  onClick={handleAllow}
                  className={cn(APP_COMPONENTS.button.base, APP_COMPONENTS.button.primary, "flex-1 py-2")}
                >
                  Allow
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
