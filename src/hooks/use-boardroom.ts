// ============================================================
// SITA OS — Boardroom Packet Hook
// Generates and caches boardroom packets by type (async)
// ============================================================

import { useState, useCallback, useEffect } from "react";
import { generateBoardroomPacket, type BoardroomType, type BoardroomPacket } from "@/lib/boardroom";

const packetCache = new Map<BoardroomType, { packet: BoardroomPacket; cachedAt: number }>();
const CACHE_TTL = 60 * 1000; // 1 minute

export function useBoardroomPacket(type: BoardroomType) {
  const [packet, setPacket] = useState<BoardroomPacket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const cached = packetCache.get(type);
      if (cached && Date.now() - cached.cachedAt < CACHE_TTL) {
        setPacket(cached.packet);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const newPacket = await generateBoardroomPacket(type);
        if (!cancelled) {
          packetCache.set(type, { packet: newPacket, cachedAt: Date.now() });
          setPacket(newPacket);
        }
      } catch (err) {
        console.error("Boardroom packet generation failed:", err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [type, refreshKey]);

  const regenerate = useCallback(() => {
    packetCache.delete(type);
    setRefreshKey(k => k + 1);
  }, [type]);

  return { packet, isLoading, regenerate };
}
