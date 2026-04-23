// ═══════════════════════════════════════════════════════════════
// SITA OS — Shell Indicators Hook
// Live counts for approvals, incidents, trust state from Supabase
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";
import { useDataMode } from "@/contexts/DataModeContext";

export interface ShellIndicators {
  pendingApprovals: number;
  activeIncidents: number;
  unreadNotifications: number;
  activeWorkflows: number;
  trustPosture: "secure" | "attention" | "warning" | "critical";
  loading: boolean;
}

const INDICATORS: ShellIndicators = {
  pendingApprovals: 3,
  activeIncidents: 1,
  unreadNotifications: 5,
  activeWorkflows: 2,
  trustPosture: "secure",
  loading: false,
};

export function useShellIndicators(): ShellIndicators {
  const { user } = useAuth();
  const { isDemoMode } = useDataMode();
  const [indicators, setIndicators] = useState<ShellIndicators>({
    pendingApprovals: 0, activeIncidents: 0, unreadNotifications: 0,
    activeWorkflows: 0, trustPosture: "secure", loading: true,
  });

  useEffect(() => {
    if (isDemoMode || !user) {
      setIndicators(INDICATORS);
      return;
    }

    const fetchIndicators = async () => {
      const [approvals, incidents, notifications, workflows] = await Promise.all([
        fromTable("approval_queue").select("id", { count: "exact", head: true })
          .eq("user_id", user.id).eq("status", "pending"),
        fromTable("incidents").select("id", { count: "exact", head: true })
          .eq("user_id", user.id).in("status", ["open", "acknowledged"]),
        fromTable("notifications").select("id", { count: "exact", head: true })
          .eq("user_id", user.id).eq("read", false),
        fromTable("workflow_runs").select("id", { count: "exact", head: true })
          .eq("user_id", user.id).eq("status", "running"),
      ]);

      const incidentCount = incidents.count || 0;
      const approvalCount = approvals.count || 0;
      let trustPosture: ShellIndicators["trustPosture"] = "secure";
      if (incidentCount > 2) trustPosture = "critical";
      else if (incidentCount > 0) trustPosture = "attention";
      else if (approvalCount > 5) trustPosture = "warning";

      setIndicators({
        pendingApprovals: approvalCount,
        activeIncidents: incidentCount,
        unreadNotifications: notifications.count || 0,
        activeWorkflows: workflows.count || 0,
        trustPosture,
        loading: false,
      });
    };

    fetchIndicators();
    const interval = setInterval(fetchIndicators, 30000);
    return () => clearInterval(interval);
  }, [user, isDemoMode]);

  return indicators;
}
