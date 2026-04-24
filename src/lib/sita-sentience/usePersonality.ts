// ═══════════════════════════════════════════════════════════════
// SITA OS — usePersonality (Phase H)
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  hydratePersonality,
  readPersonality,
  subscribePersonality,
  updatePersonality,
  type SitaPersonality,
} from "./personality";

let hydratedFor: string | null = null;

export function usePersonality() {
  const { user } = useAuth();
  const [snap, setSnap] = useState<SitaPersonality>(() => readPersonality());

  useEffect(() => subscribePersonality(setSnap), []);

  useEffect(() => {
    if (!user?.id || hydratedFor === user.id) return;
    hydratedFor = user.id;
    void hydratePersonality(user.id);
  }, [user?.id]);

  return { personality: snap, update: updatePersonality };
}