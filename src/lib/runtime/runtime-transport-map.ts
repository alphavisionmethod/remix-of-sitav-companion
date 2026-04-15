// ═══════════════════════════════════════════════════════════════
// SITA OS — Runtime Transport Map
// Maps message types to transport mechanisms
// ═══════════════════════════════════════════════════════════════

import type { RuntimeTarget } from "./runtime-detection";

export type TransportMechanism =
  | "websocket"
  | "http"
  | "ipc"
  | "local-event"
  | "service-worker"
  | "broadcast-channel";

export interface TransportBinding {
  messageType: string;
  /** Transport per runtime target */
  transports: Partial<Record<RuntimeTarget, TransportMechanism>>;
  /** Default transport when no target-specific override */
  defaultTransport: TransportMechanism;
  /** Whether the message requires encryption in transit */
  encryptInTransit: boolean;
  /** Whether to compress payloads above this size (bytes, 0 = never) */
  compressionThresholdBytes: number;
}

export const TRANSPORT_MAP: TransportBinding[] = [
  // ── Orchestration ──
  { messageType: "orchestration.intent", defaultTransport: "local-event", transports: { electron: "ipc" }, encryptInTransit: false, compressionThresholdBytes: 0 },
  { messageType: "orchestration.execute", defaultTransport: "local-event", transports: { electron: "ipc" }, encryptInTransit: true, compressionThresholdBytes: 0 },
  { messageType: "orchestration.approve", defaultTransport: "http", transports: { electron: "ipc" }, encryptInTransit: true, compressionThresholdBytes: 0 },

  // ── Events ──
  { messageType: "trust.changed", defaultTransport: "local-event", transports: {}, encryptInTransit: false, compressionThresholdBytes: 0 },
  { messageType: "session.started", defaultTransport: "local-event", transports: {}, encryptInTransit: false, compressionThresholdBytes: 0 },
  { messageType: "session.ended", defaultTransport: "local-event", transports: {}, encryptInTransit: false, compressionThresholdBytes: 0 },
  { messageType: "service.health", defaultTransport: "local-event", transports: { electron: "ipc" }, encryptInTransit: false, compressionThresholdBytes: 0 },
  { messageType: "advisor.recommendation", defaultTransport: "websocket", transports: { electron: "ipc" }, encryptInTransit: false, compressionThresholdBytes: 16_384 },

  // ── Proofs ──
  { messageType: "proof.receipt", defaultTransport: "http", transports: { electron: "ipc" }, encryptInTransit: true, compressionThresholdBytes: 0 },
  { messageType: "proof.chain", defaultTransport: "http", transports: { electron: "ipc" }, encryptInTransit: true, compressionThresholdBytes: 8_192 },

  // ── Sync ──
  { messageType: "sync.push", defaultTransport: "websocket", transports: { pwa: "service-worker" }, encryptInTransit: true, compressionThresholdBytes: 32_768 },
  { messageType: "sync.pull", defaultTransport: "websocket", transports: { pwa: "service-worker" }, encryptInTransit: false, compressionThresholdBytes: 0 },

  // ── Heartbeat ──
  { messageType: "runtime.heartbeat", defaultTransport: "websocket", transports: { electron: "ipc" }, encryptInTransit: false, compressionThresholdBytes: 0 },
];

export function getTransport(messageType: string, target: RuntimeTarget): TransportMechanism {
  const binding = TRANSPORT_MAP.find((t) => t.messageType === messageType);
  if (!binding) return "local-event";
  return binding.transports[target] ?? binding.defaultTransport;
}

export function getTransportBinding(messageType: string): TransportBinding | undefined {
  return TRANSPORT_MAP.find((t) => t.messageType === messageType);
}
