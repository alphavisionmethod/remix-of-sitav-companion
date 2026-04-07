// ═══════════════════════════════════════════════════════════════
// SITA OS — Profile Memory Service
// User profile preferences and settings memory with persistence
// ═══════════════════════════════════════════════════════════════

import type { MemoryObject, DomainId, PrivacyTier } from "@/packages/contracts";
import { persistMemoryEntry, fetchScopedMemory, supersedeMemoryEntry } from "@/lib/persistence/memory-service-persistence";


const profileStore = new Map<string, MemoryObject>();

export function storeProfileMemory(params: {
  key: string;
  value: unknown;
  domain: DomainId;
  privacyTier?: PrivacyTier;
  source?: string;
}): MemoryObject {
  const now = new Date().toISOString();
  const existing = profileStore.get(params.key);
  const memory: MemoryObject = {
    id: existing?.id || crypto.randomUUID(),
    key: params.key,
    value: params.value,
    privacyTier: params.privacyTier || "internal",
    domain: params.domain,
    source: params.source || "user-input",
    confidence: 1.0,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    supersededBy: undefined,
  };

  // Fire-and-forget persistence
  if (existing) {
    existing.supersededBy = memory.id;
    supersedeMemoryEntry(existing.id, {
      id: memory.id,
      key: memory.key,
      value: typeof memory.value === "object" ? memory.value as Record<string, unknown> : { _raw: memory.value },
      privacyTier: memory.privacyTier,
      source: memory.source,
      confidence: memory.confidence,
      tags: [],
    } as never, { scope: "private", domain: params.domain }).catch(() => {});
  } else {
    persistMemoryEntry({
      id: memory.id,
      key: memory.key,
      value: typeof memory.value === "object" ? memory.value as Record<string, unknown> : { _raw: memory.value },
      privacyTier: memory.privacyTier,
      source: memory.source,
      confidence: memory.confidence,
      tags: [],
    } as never, { scope: "private", domain: params.domain }).catch(() => {});
  }

  profileStore.set(params.key, memory);
  return memory;
}

export function getProfileMemory(key: string): MemoryObject | undefined {
  return profileStore.get(key);
}

export function listProfileMemories(domain?: DomainId): MemoryObject[] {
  const all = Array.from(profileStore.values());
  return domain ? all.filter((m) => m.domain === domain) : all;
}

export function deleteProfileMemory(key: string): boolean {
  return profileStore.delete(key);
}

export function clearExpired(): number {
  const now = new Date();
  let count = 0;
  profileStore.forEach((m, key) => {
    if (m.expiresAt && new Date(m.expiresAt) < now) {
      profileStore.delete(key);
      count++;
    }
  });
  return count;
}

/** Hydrate in-memory store from persisted memory on init */
export async function hydrateProfileMemory(): Promise<number> {
  const entries = await fetchScopedMemory({ scope: "private", limit: 500 });
  let count = 0;
  for (const entry of entries) {
    if (!profileStore.has(entry.key)) {
      profileStore.set(entry.key, {
        id: entry.id,
        key: entry.key,
        value: entry.value,
        privacyTier: entry.privacy_tier as PrivacyTier,
        domain: (entry.domain ?? "system") as DomainId,
        source: entry.source,
        confidence: Number(entry.confidence),
        createdAt: entry.created_at,
        updatedAt: entry.updated_at,
      });
      count++;
    }
  }
  return count;
}
