// ═══════════════════════════════════════════════════════════════
// SITA OS — useWorldModel hook (Phase G)
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  hydrateWorldModel,
  readWorldModel,
  subscribeWorldModel,
  updateWorldModel,
  type WorldModelSnapshot,
} from "./world-model";

let hydratedFor: string | null = null;

export function useWorldModel() {
  const { user } = useAuth();
  const [snap, setSnap] = useState<WorldModelSnapshot>(() => readWorldModel());

  useEffect(() => subscribeWorldModel(setSnap), []);

  useEffect(() => {
    if (!user?.id || hydratedFor === user.id) return;
    hydratedFor = user.id;
    void hydrateWorldModel(user.id);
  }, [user?.id]);

  return { snapshot: snap, update: updateWorldModel };
}