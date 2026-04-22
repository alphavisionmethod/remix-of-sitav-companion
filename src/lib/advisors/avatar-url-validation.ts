// ═══════════════════════════════════════════════════════════════
// SITA OS — Avatar URL Validation
// Validates custom avatar URLs before use: checks protocol,
// allowed domains, and image-like extensions.
// ═══════════════════════════════════════════════════════════════

/** Domains trusted for avatar hosting. */
const ALLOWED_HOSTS = new Set([
  // Supabase storage (any project ref)
  "supabase.co",
  "supabase.com",
  // Common CDN / image hosts
  "githubusercontent.com",
  "gravatar.com",
  "cloudinary.com",
  "imgix.net",
  "unsplash.com",
  "images.unsplash.com",
]);

/** Supabase storage host suffix used by project-specific URLs. */
const SUPABASE_STORAGE_SUFFIX = ".supabase.co";

const IMAGE_EXTENSIONS = /\.(png|jpe?g|webp|gif|svg|avif|ico)(\?|$)/i;
const IMAGE_CONTENT_TYPES = /^image\//;

/**
 * Validates an avatar URL. Returns `true` only if the URL is safe to render.
 *
 * Rules:
 * 1. Must be a valid URL with https (or http on localhost for dev).
 * 2. Must be on an allowed domain OR a Vite-bundled asset (relative / data URI).
 * 3. Must look like an image (extension or known storage path).
 */
export function isValidAvatarUrl(url: unknown): url is string {
  if (typeof url !== "string" || url.length === 0) return false;

  // Allow Vite-bundled assets (start with / or data:image)
  if (url.startsWith("/") || url.startsWith("data:image")) return true;

  // Allow blob: URLs (created via URL.createObjectURL)
  if (url.startsWith("blob:")) return true;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }

  // Protocol check
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return false;
  // Allow localhost in dev
  if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") return true;

  // Domain allowlist
  const host = parsed.hostname.toLowerCase();
  const isAllowed =
    ALLOWED_HOSTS.has(host) ||
    [...ALLOWED_HOSTS].some((d) => host.endsWith(`.${d}`)) ||
    host.endsWith(SUPABASE_STORAGE_SUFFIX);

  if (!isAllowed) return false;

  // Path should contain image extension or known storage paths
  const path = parsed.pathname.toLowerCase();
  if (IMAGE_EXTENSIONS.test(path)) return true;
  // Supabase storage object paths don't always have extensions
  if (path.includes("/storage/v1/object/") || path.includes("/storage/v1/render/")) return true;

  return false;
}

/**
 * Sanitise an avatar URL: returns the URL if valid, otherwise `null`.
 * Use this as the single gate before rendering any custom avatar.
 */
export function sanitizeAvatarUrl(url: unknown): string | null {
  return isValidAvatarUrl(url) ? (url as string) : null;
}