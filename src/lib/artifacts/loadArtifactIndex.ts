// ═══════════════════════════════════════════════════════════════
// loadArtifactIndex — fetches the public artifact index served from
// /generated/artifact-index.json (mirrored by the mirror generator).
// ═══════════════════════════════════════════════════════════════

import type { ArtifactIndex } from "./types";

const INDEX_URL = "/generated/artifact-index.json";

let cached: ArtifactIndex | null = null;
let inflight: Promise<ArtifactIndex> | null = null;

export async function loadArtifactIndex(options?: { force?: boolean }): Promise<ArtifactIndex> {
  if (!options?.force && cached) return cached;
  if (!options?.force && inflight) return inflight;

  inflight = (async () => {
    const res = await fetch(INDEX_URL, { cache: options?.force ? "no-store" : "default" });
    if (!res.ok) {
      throw new Error(`Failed to load artifact index (${res.status} ${res.statusText})`);
    }
    const data = (await res.json()) as ArtifactIndex;
    cached = data;
    return data;
  })();

  try {
    return await inflight;
  } finally {
    inflight = null;
  }
}

export function clearArtifactIndexCache(): void {
  cached = null;
}
