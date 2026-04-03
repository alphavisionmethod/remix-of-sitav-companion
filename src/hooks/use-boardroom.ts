// ============================================================
// SITA OS — Boardroom Packet Hook
// Generates and caches boardroom packets by type
// ============================================================

import { useState, useCallback, useMemo } from "react";
import { generateBoardroomPacket, type BoardroomType, type BoardroomPacket } from "@/lib/boardroom";

const packetCache = new Map<BoardroomType, { packet: BoardroomPacket; cachedAt: number }>();
const CACHE_TTL = 60 * 1000; // 1 minute

export function useBoardroomPacket(type: BoardroomType) {
  const [refreshKey, setRefreshKey] = useState(0);

  const packet = useMemo(() => {
    const cached = packetCache.get(type);
    if (cached && Date.now() - cached.cachedAt < CACHE_TTL && refreshKey >= 0) {
      return cached.packet;
    }
    const newPacket = generateBoardroomPacket(type);
    packetCache.set(type, { packet: newPacket, cachedAt: Date.now() });
    return newPacket;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, refreshKey]);

  const regenerate = useCallback(() => {
    packetCache.delete(type);
    setRefreshKey(k => k + 1);
  }, [type]);

  return { packet, regenerate };
}
