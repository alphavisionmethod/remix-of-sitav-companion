// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Sync Conflict Policy
// ═══════════════════════════════════════════════════════════════

import type { ConflictPolicy, OfflineMutation } from "../contracts/offline-sync-contract";

export interface ConflictResolution<T> {
  resolved: T;
  policy: ConflictPolicy;
  notes: string;
}

export function resolveConflict<T extends { updatedAt?: string }>(
  policy: ConflictPolicy,
  client: T,
  server: T,
  _mutation?: OfflineMutation,
): ConflictResolution<T> {
  switch (policy) {
    case "server-wins":
      return { resolved: server, policy, notes: "Server snapshot kept." };
    case "client-wins":
      return { resolved: client, policy, notes: "Client mutation kept." };
    case "last-write-wins": {
      const cTs = client.updatedAt ? Date.parse(client.updatedAt) : 0;
      const sTs = server.updatedAt ? Date.parse(server.updatedAt) : 0;
      return cTs >= sTs
        ? { resolved: client, policy, notes: "Client newer." }
        : { resolved: server, policy, notes: "Server newer." };
    }
    case "manual-merge":
      return { resolved: server, policy, notes: "Held for manual merge — server kept until user resolves." };
  }
}
