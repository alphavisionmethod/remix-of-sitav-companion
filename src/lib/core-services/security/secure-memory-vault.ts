// ═══════════════════════════════════════════════════════════════
// SITA OS — Secure Memory Vault
// Hardened in-memory secret store with encrypted heap storage
// ═══════════════════════════════════════════════════════════════

const VAULT_VERSION = "1.0.0";

interface VaultEntry {
  encrypted: ArrayBuffer;
  iv: Uint8Array;
  ttlMs: number;
  createdAt: number;
  maxReads: number;
  readCount: number;
  destroyed: boolean;
}

let _vaultKey: CryptoKey | null = null;
let _entries: Map<string, VaultEntry> = new Map();
let _gcTimer: ReturnType<typeof setInterval> | null = null;

// ── Key Management ─────────────────────────────────────────────

async function ensureKey(): Promise<CryptoKey> {
  if (!_vaultKey) {
    _vaultKey = await crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      false, // non-extractable
      ["encrypt", "decrypt"]
    );
  }
  return _vaultKey;
}

// ── Encrypt / Decrypt ──────────────────────────────────────────

async function encrypt(plaintext: string): Promise<{ encrypted: ArrayBuffer; iv: Uint8Array }> {
  const key = await ensureKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as unknown as BufferSource },
    key,
    encoded
  );
  return { encrypted, iv };
}

async function decrypt(encrypted: ArrayBuffer, iv: Uint8Array): Promise<string> {
  const key = await ensureKey();
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv as unknown as BufferSource },
    key,
    encrypted
  );
  return new TextDecoder().decode(decrypted);
}

// ── Secure Disposal ────────────────────────────────────────────

function secureDispose(entry: VaultEntry) {
  // Overwrite encrypted buffer with random bytes
  try {
    const view = new Uint8Array(entry.encrypted);
    crypto.getRandomValues(view);
  } catch {
    // Buffer may not be writable — best effort
  }
  // Overwrite IV
  crypto.getRandomValues(entry.iv);
  entry.destroyed = true;
}

// ── GC: Clean Expired Entries ──────────────────────────────────

function runGC() {
  const now = Date.now();
  const toDelete: string[] = [];

  for (const [name, entry] of _entries) {
    if (entry.destroyed) {
      toDelete.push(name);
      continue;
    }
    if (now - entry.createdAt > entry.ttlMs) {
      secureDispose(entry);
      toDelete.push(name);
    }
  }

  for (const name of toDelete) {
    _entries.delete(name);
  }
}

// ── Public API ─────────────────────────────────────────────────

export interface VaultStoreOptions {
  /** Time-to-live in milliseconds (default: 300000 = 5 minutes) */
  ttlMs?: number;
  /** Maximum number of reads before auto-destruction (default: 10) */
  maxReads?: number;
}

/**
 * Store a secret in the encrypted vault.
 */
export async function vaultStore(
  name: string,
  value: string,
  options: VaultStoreOptions = {}
): Promise<void> {
  const { ttlMs = 300000, maxReads = 10 } = options;

  // Destroy existing entry if present
  const existing = _entries.get(name);
  if (existing && !existing.destroyed) {
    secureDispose(existing);
  }

  const { encrypted, iv } = await encrypt(value);

  const entry: VaultEntry = {
    encrypted,
    iv,
    ttlMs,
    createdAt: Date.now(),
    maxReads,
    readCount: 0,
    destroyed: false,
  };

  _entries.set(name, entry);
}

/**
 * Retrieve a secret from the vault. Returns null if expired, destroyed, or not found.
 */
export async function vaultRetrieve(name: string): Promise<string | null> {
  const entry = _entries.get(name);
  if (!entry || entry.destroyed) return null;

  // Check TTL
  if (Date.now() - entry.createdAt > entry.ttlMs) {
    secureDispose(entry);
    _entries.delete(name);
    return null;
  }

  // Check read count
  entry.readCount++;
  if (entry.readCount > entry.maxReads) {
    secureDispose(entry);
    _entries.delete(name);
    return null;
  }

  return decrypt(entry.encrypted, entry.iv);
}

/**
 * Explicitly destroy a secret.
 */
export function vaultDestroy(name: string): boolean {
  const entry = _entries.get(name);
  if (!entry) return false;
  secureDispose(entry);
  _entries.delete(name);
  return true;
}

/**
 * Destroy all secrets and rotate the vault key.
 */
export async function vaultPurge(): Promise<void> {
  for (const [, entry] of _entries) {
    if (!entry.destroyed) secureDispose(entry);
  }
  _entries.clear();
  _vaultKey = null;
  await ensureKey(); // generate fresh key
}

/**
 * Initialize the vault's GC timer.
 */
export async function initSecureVault(): Promise<void> {
  await ensureKey();
  if (!_gcTimer) {
    _gcTimer = setInterval(runGC, 30000); // GC every 30s
  }
  console.log(`[secure-vault] Vault v${VAULT_VERSION} initialized`);
}

/**
 * Get vault status (no secret values exposed).
 */
export function getVaultStatus() {
  const entries: Record<string, { readCount: number; ttlMs: number; expired: boolean }> = {};
  const now = Date.now();

  for (const [name, entry] of _entries) {
    if (!entry.destroyed) {
      entries[name] = {
        readCount: entry.readCount,
        ttlMs: entry.ttlMs,
        expired: now - entry.createdAt > entry.ttlMs,
      };
    }
  }

  return {
    version: VAULT_VERSION,
    entryCount: Object.keys(entries).length,
    entries,
    keyActive: !!_vaultKey,
  };
}

/**
 * Create a proxy-protected secret container that prevents serialization and logging.
 */
export function createSecretProxy<T extends object>(target: T): T {
  return new Proxy(Object.freeze({ ...target }), {
    get(obj, prop) {
      if (prop === "toJSON" || prop === Symbol.toPrimitive) {
        return () => "[REDACTED]";
      }
      if (prop === "toString") {
        return () => "[SecureVault:REDACTED]";
      }
      if (prop === Symbol.for("nodejs.util.inspect.custom")) {
        return () => "[SecureVault:REDACTED]";
      }
      return Reflect.get(obj, prop);
    },
  });
}
