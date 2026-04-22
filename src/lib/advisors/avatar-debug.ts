// ═══════════════════════════════════════════════════════════════
// SITA OS — Avatar Debug Mode
// Toggle via localStorage or window.__SITA_BREAK_AVATARS = true
// When active, all avatar URLs are replaced with a broken URL
// so you can verify skeleton, retry backoff, and fallback icon.
// ═══════════════════════════════════════════════════════════════

const STORAGE_KEY = "sita:debug-break-avatars";

/** Check if broken-avatar debug mode is active. */
export function isAvatarDebugActive(): boolean {
  if (typeof window !== "undefined" && (window as any).__SITA_BREAK_AVATARS) return true;
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

/** Toggle broken-avatar debug mode. Returns new state. */
export function toggleAvatarDebug(): boolean {
  const next = !isAvatarDebugActive();
  try {
    if (next) {
      localStorage.setItem(STORAGE_KEY, "1");
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch { /* noop */ }
  (window as any).__SITA_BREAK_AVATARS = next;
  return next;
}

/** A URL guaranteed to 404 for image loading. */
export const BROKEN_AVATAR_URL = "/___debug_broken_avatar_404.png";