// ═══════════════════════════════════════════════════════════════
// SITA OS — Profile Memory Service
// User profile preferences and settings memory
// ═══════════════════════════════════════════════════════════════

import type { MemoryObject, DomainId, PrivacyTier } from "@/packages/contracts";

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
  if (existing) existing.supersededBy = memory.id;
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
