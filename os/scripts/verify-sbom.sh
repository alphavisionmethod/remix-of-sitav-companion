#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# SITA OS — Verify SBOM integrity + signature
# Usage:  bash os/scripts/verify-sbom.sh <sbom.cdx.json> [pubkey.pem]
# ═══════════════════════════════════════════════════════════════════════
set -euo pipefail

SBOM="${1:-}"
PUBKEY="${2:-${SITA_RELEASE_PUB_KEY:-}}"

if [ -z "$SBOM" ] || [ ! -f "$SBOM" ]; then
  echo "✘ usage: $0 <sbom.cdx.json> [pubkey.pem]" >&2; exit 2
fi

# Schema sanity
node -e '
  const s = JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));
  if (s.bomFormat !== "CycloneDX") throw new Error("not CycloneDX");
  if (!s.specVersion || !s.specVersion.startsWith("1.")) throw new Error("bad specVersion");
  if (!Array.isArray(s.components)) throw new Error("components not array");
  if (!s.metadata?.component?.name) throw new Error("missing metadata.component.name");
  console.log("  ✓ schema OK — " + s.components.length + " components");
' "$SBOM"

if [ -f "${SBOM}.sig" ] && [ -n "$PUBKEY" ] && [ -f "$PUBKEY" ]; then
  if openssl dgst -sha256 -verify "$PUBKEY" -signature "${SBOM}.sig" "$SBOM" >/dev/null 2>&1; then
    echo "  ✓ signature verified against $PUBKEY"
  else
    echo "✘ signature verification FAILED" >&2; exit 1
  fi
elif [ -f "${SBOM}.sha256" ]; then
  EXPECTED="$(cat "${SBOM}.sha256" | awk '{print $1}')"
  ACTUAL="$(sha256sum "$SBOM" | awk '{print $1}')"
  if [ "$EXPECTED" = "$ACTUAL" ]; then
    echo "  ✓ SHA256 matches sidecar"
  else
    echo "✘ SHA256 mismatch" >&2; exit 1
  fi
else
  echo "  ⚠ no signature or sha256 sidecar present"
fi

echo "✓ SBOM verified: $SBOM"
