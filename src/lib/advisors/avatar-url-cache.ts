// ═══════════════════════════════════════════════════════════════
// SITA OS — Shared Avatar URL Cache
// Two-tier cache: in-memory Map + localStorage persistence.
// Prevents repeated HEAD fetches and Supabase queries across
// page navigations and component remounts.
// ═══════════════════════════════════════════════════════════════

const STORAGE_KEY = "sita:avatar-url-cache";
const TTL_MS = 30 * 60 * 1000; // 30 minutes

interface CacheEntry {
  url: string;
  /** 'hit' = confirmed loadable, 'miss' = confirmed 404/error */
  status: "hit" | "miss";
  ts: number;
}

// ── In-memory tier ────────────────────────────────────────────
const mem = new Map<string, CacheEntry>();

// ── Hydrate from localStorage on module load ─────────────────
function hydrate() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const entries: Record<string, CacheEntry> = JSON.parse(raw);
    const now = Date.now();
    for (const [key, entry] of Object.entries(entries)) {
      if (entry && now - entry.ts < TTL_MS) {
        mem.set(key, entry);
      }
    }
  } catch {
    // Corrupted storage — ignore
  }
}
hydrate();

// ── Persist to localStorage (debounced) ──────────────────────
let persistTimer: ReturnType<typeof setTimeout> | null = null;

function schedulePersist() {
  if (persistTimer) return;
  persistTimer = setTimeout(() => {
    persistTimer = null;
    try {
      const obj: Record<string, CacheEntry> = {};
      const now = Date.now();
      for (const [k, v] of mem) {
        if (now - v.ts < TTL_MS) obj[k] = v;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
    } catch {
      // Storage full — silent fail
    }
  }, 500);
}

// ── Public API ───────────────────────────────────────────────

/** Build a cache key from userId + domain/advisorId */
export function avatarCacheKey(userId: string, identifier: string): string {
  return `${userId}:${identifier}`;
}

/** Get a cached avatar URL. Returns null if not cached or expired. */
export function getAvatarCache(key: string): CacheEntry | null {
  const entry = mem.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > TTL_MS) {
    mem.delete(key);
    return null;
  }
  return entry;
}

/** Store a resolved avatar URL (or miss). */
export function setAvatarCache(key: string, url: string, status: "hit" | "miss" = "hit") {
  const entry: CacheEntry = { url, status, ts: Date.now() };
  mem.set(key, entry);
  schedulePersist();
}

/** Remove a single entry (e.g. after upload or delete). */
export function invalidateAvatarCache(key: string) {
  mem.delete(key);
  schedulePersist();
}

/** Clear all entries for a given userId prefix. */
export function invalidateUserAvatars(userId: string) {
  for (const k of [...mem.keys()]) {
    if (k.startsWith(`${userId}:`)) mem.delete(k);
  }
  schedulePersist();
}