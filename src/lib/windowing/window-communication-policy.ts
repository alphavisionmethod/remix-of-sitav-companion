// ═══════════════════════════════════════════════════════════════
// SITA OS — Window Communication Policy
// Channel-granular IPC permission enforcement.
// ═══════════════════════════════════════════════════════════════

import type { CommunicationPolicy, ChannelType } from "@/packages/window-contracts";

const windowPolicies = new Map<string, CommunicationPolicy>();

export function setWindowCommunicationPolicy(windowId: string, policy: CommunicationPolicy): void {
  windowPolicies.set(windowId, policy);
}

function getPolicy(windowId: string): CommunicationPolicy {
  return windowPolicies.get(windowId) ?? "domain-only";
}

export function canSendMessage(sourceId: string, targetId: string, channel: ChannelType): boolean {
  if (sourceId === targetId) return true;
  const srcPolicy = getPolicy(sourceId);
  const tgtPolicy = getPolicy(targetId);

  if ((srcPolicy as string) === "isolated" || (tgtPolicy as string) === "isolated") return false;
  if (channel === "system") return true;
  if (channel === "broadcast") return srcPolicy === "open" || srcPolicy === "domain-only";
  if (channel === "domain") return srcPolicy !== "system-only" && tgtPolicy !== "system-only";
  if (channel === "direct") return srcPolicy === "open" && tgtPolicy === "open";
  return false;
}

export function getAvailableChannels(windowId: string): ChannelType[] {
  const p = getPolicy(windowId);
  switch (p) {
    case "open": return ["broadcast", "direct", "system", "domain"];
    case "domain-only": return ["broadcast", "system", "domain"];
    case "system-only": return ["system"];
    case "isolated": return [];
    default: return ["system"];
  }
}

export function isIsolated(windowId: string): boolean {
  return getPolicy(windowId) === "isolated";
}