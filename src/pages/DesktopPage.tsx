// ═══════════════════════════════════════════════════════════════
// SITA OS — Desktop Page Wrapper
// Thin page wrapper wiring DesktopSurface to shell state
// ═══════════════════════════════════════════════════════════════

import { DesktopSurface } from "@/components/sita/shell/DesktopSurface";
import { useShellState } from "@/components/sita/shell/useShellState";
import { useAuth } from "@/contexts/AuthContext";
import { useDataMode } from "@/contexts/DataModeContext";
import { EnterpriseFlow } from "@/components/sita/EnterpriseFlow";

export default function DesktopPage() {
  const { isDemoMode } = useDataMode();
  const { user } = useAuth();
  const { state, openCommand } = useShellState();

  return (
    <DesktopSurface
      userName={user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User"}
      trustPosture={state.trustPosture}
      notifications={state.notifications}
      continuity={state.continuity}
      onOpenCommand={openCommand}
    />
  );
}
