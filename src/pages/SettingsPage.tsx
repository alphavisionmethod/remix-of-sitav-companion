// ═══════════════════════════════════════════════════════════════
// SITA OS — Settings Page (Launcher)
// Redirects to the unified Settings window app
// ═══════════════════════════════════════════════════════════════

import { useEffect } from "react";
import { Settings } from "lucide-react";
import { motion } from "framer-motion";

const SettingsPage = () => {
  // Dispatch event to open Settings window in the OS shell
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("nova-open-app", { detail: { appId: "settings" } }));
  }, []);

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-[60vh] gap-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-4 rounded-2xl bg-muted/30 border border-border/30">
        <Settings className="h-10 w-10 text-muted-foreground" />
      </div>
      <div className="text-center space-y-1">
        <h2 className="text-lg font-semibold text-foreground">Settings</h2>
        <p className="text-sm text-muted-foreground">
          Opening the Settings app…
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          If the Settings window doesn't open automatically, click the Settings icon in the dock.
        </p>
      </div>
    </motion.div>
  );
};

export default SettingsPage;
