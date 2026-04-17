// ═══════════════════════════════════════════════════════════════
// SITA OS — Desktop Update Manifest
// Serves the canonical update descriptor consumed by the Electron
// auto-updater. Channel-aware (dev/internal/beta/production).
// Mirrors the os-update-manifest pattern but for desktop bundles.
// ═══════════════════════════════════════════════════════════════
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DesktopRelease {
  version: string;
  channel: "dev" | "internal" | "beta" | "production";
  publishedAt: string;
  notes: string;
  artifacts: {
    platform: "linux" | "darwin" | "win32";
    arch: "x64" | "arm64";
    url: string;
    sha256: string;
    bytes: number;
    signature?: string;
  }[];
  rolloutPercent: number;
  minVersion?: string;
}

// Source of truth: in production this is read from a desktop_releases table.
// For now we build it from the desktop manifest objects committed by CI.
function defaultRelease(channel: string, version: string): DesktopRelease {
  return {
    version,
    channel: (["dev","internal","beta","production"].includes(channel)
      ? channel : "internal") as DesktopRelease["channel"],
    publishedAt: new Date().toISOString(),
    notes: "See https://github.com/sita-os/releases for changelog",
    artifacts: [
      { platform: "linux",  arch: "x64",   url: `https://releases.sita-os.com/${channel}/${version}/sita-os-${version}-linux-x64.tar.gz`,  sha256: "pending", bytes: 0 },
      { platform: "darwin", arch: "x64",   url: `https://releases.sita-os.com/${channel}/${version}/sita-os-${version}-darwin-x64.zip`,    sha256: "pending", bytes: 0 },
      { platform: "darwin", arch: "arm64", url: `https://releases.sita-os.com/${channel}/${version}/sita-os-${version}-darwin-arm64.zip`,  sha256: "pending", bytes: 0 },
      { platform: "win32",  arch: "x64",   url: `https://releases.sita-os.com/${channel}/${version}/sita-os-${version}-win32-x64.zip`,     sha256: "pending", bytes: 0 },
    ],
    rolloutPercent: channel === "production" ? 25 : 100,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "GET required" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const url = new URL(req.url);
  const channel = url.searchParams.get("channel") ?? "production";
  const platform = url.searchParams.get("platform");
  const arch = url.searchParams.get("arch");
  const currentVersion = url.searchParams.get("currentVersion") ?? "0.0.0";

  const release = defaultRelease(channel, "1.0.0");

  let artifacts = release.artifacts;
  if (platform) artifacts = artifacts.filter((a) => a.platform === platform);
  if (arch) artifacts = artifacts.filter((a) => a.arch === arch);

  const updateAvailable = release.version !== currentVersion;

  return new Response(JSON.stringify({
    ...release,
    artifacts,
    updateAvailable,
    queriedAt: new Date().toISOString(),
  }), {
    status: 200,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=300",
    },
  });
});
