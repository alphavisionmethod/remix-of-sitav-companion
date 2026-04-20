// ═══════════════════════════════════════════════════════════════
// loadArtifact — fetches an individual mirrored artifact from
// /generated/artifacts/<path>. Returns text for .md/.yaml/.yml,
// parsed JSON for .json files.
// ═══════════════════════════════════════════════════════════════

const ARTIFACT_ROOT = "/generated/artifacts";

export interface LoadedArtifact {
  path: string;
  contentType: "json" | "markdown" | "yaml" | "text";
  raw: string;
  /** Parsed JSON, only present for .json files. */
  json?: unknown;
}

function classify(p: string): LoadedArtifact["contentType"] {
  const lower = p.toLowerCase();
  if (lower.endsWith(".json")) return "json";
  if (lower.endsWith(".md")) return "markdown";
  if (lower.endsWith(".yaml") || lower.endsWith(".yml")) return "yaml";
  return "text";
}

export async function loadArtifact(relPath: string): Promise<LoadedArtifact> {
  const safe = relPath.replace(/^\/+/, "");
  const url = `${ARTIFACT_ROOT}/${safe}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to load artifact ${safe} (${res.status} ${res.statusText})`);
  }
  const raw = await res.text();
  const contentType = classify(safe);
  const out: LoadedArtifact = { path: safe, contentType, raw };
  if (contentType === "json") {
    try {
      out.json = JSON.parse(raw);
    } catch {
      // leave undefined; caller can inspect raw
    }
  }
  return out;
}
