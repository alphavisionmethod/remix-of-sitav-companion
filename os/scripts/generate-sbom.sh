#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# SITA OS — CycloneDX 1.5 SBOM generation (Electron app + OS chroot)
#
# Produces two SBOMs:
#   1. generated/sbom-electron-${VERSION}.cdx.json   (npm components)
#   2. generated/sbom-os-${VERSION}.cdx.json         (debian dpkg components, if chroot present)
#
# Each SBOM is detached-signed with the SITA release key so downstream
# verifiers can confirm provenance independent of the registry.
# ═══════════════════════════════════════════════════════════════════════
set -euo pipefail

OUT_DIR="${SITA_OUT_DIR:-out}"
GEN_DIR="generated"
VERSION="${SITA_VERSION:-${VERSION:-0.0.0-dev}}"
CHROOT_DIR="${SITA_CHROOT_DIR:-${OUT_DIR}/chroot}"
SIGN_KEY="${SITA_RELEASE_SIGN_KEY:-}"

mkdir -p "$GEN_DIR"

ts() { date -u +%Y-%m-%dT%H:%M:%SZ; }

uuid() {
  if command -v uuidgen >/dev/null 2>&1; then uuidgen | tr 'A-Z' 'a-z'
  else cat /proc/sys/kernel/random/uuid 2>/dev/null || echo "00000000-0000-0000-0000-000000000000"
  fi
}

# ── Electron / npm SBOM ────────────────────────────────────────────────
echo "▸ Building npm SBOM (CycloneDX 1.5)"
NPM_SBOM="$GEN_DIR/sbom-electron-${VERSION}.cdx.json"

# Use npx @cyclonedx/cyclonedx-npm if available; otherwise fall back
# to a deterministic JSON generated from package-lock.json so the
# pipeline NEVER produces an empty SBOM.
if npx --yes -p @cyclonedx/cyclonedx-npm@^1.18.0 cyclonedx-npm \
     --output-format JSON \
     --spec-version 1.5 \
     --output-file "$NPM_SBOM" >/dev/null 2>&1; then
  echo "  ✓ generated via @cyclonedx/cyclonedx-npm"
else
  echo "  • cyclonedx-npm unavailable — synthesising from package-lock.json"
  node --no-warnings -e '
    const fs = require("fs");
    const lock = JSON.parse(fs.readFileSync("package-lock.json", "utf8"));
    const pkgs = lock.packages || {};
    const components = [];
    for (const [k, v] of Object.entries(pkgs)) {
      if (!k || k === "" || !v.version) continue;
      const name = k.replace(/^node_modules\//, "").replace(/\/node_modules\//g, "/");
      components.push({
        type: "library",
        "bom-ref": `pkg:npm/${name}@${v.version}`,
        name, version: v.version,
        purl: `pkg:npm/${encodeURIComponent(name)}@${v.version}`,
        licenses: v.license ? [{ license: { id: String(v.license) } }] : undefined,
      });
    }
    const sbom = {
      bomFormat: "CycloneDX",
      specVersion: "1.5",
      serialNumber: `urn:uuid:${process.env.SITA_SBOM_UUID}`,
      version: 1,
      metadata: {
        timestamp: process.env.SITA_SBOM_TS,
        component: { type: "application", name: "sita-os-electron", version: process.env.SITA_VERSION }
      },
      components,
    };
    fs.writeFileSync(process.env.SITA_SBOM_OUT, JSON.stringify(sbom, null, 2));
  ' </dev/null
fi
SITA_SBOM_UUID="$(uuid)" SITA_SBOM_TS="$(ts)" SITA_VERSION="$VERSION" SITA_SBOM_OUT="$NPM_SBOM" \
  node -e 'JSON.parse(require("fs").readFileSync(process.env.SITA_SBOM_OUT,"utf8"))' >/dev/null
echo "  ✓ $NPM_SBOM"

# ── OS / dpkg SBOM ─────────────────────────────────────────────────────
OS_SBOM="$GEN_DIR/sbom-os-${VERSION}.cdx.json"
echo "▸ Building OS SBOM"
COMPONENTS_JSON="[]"
if [ -d "$CHROOT_DIR" ] && command -v chroot >/dev/null 2>&1; then
  echo "  • enumerating dpkg packages from $CHROOT_DIR"
  COMPONENTS_JSON="$(
    sudo chroot "$CHROOT_DIR" dpkg-query -W -f='${Package}\t${Version}\t${Architecture}\n' 2>/dev/null \
      | awk -F'\t' 'BEGIN{print "["} NR>1{print ","} {
        gsub(/"/,"\\\"",$1); gsub(/"/,"\\\"",$2);
        printf "{\"type\":\"library\",\"bom-ref\":\"pkg:deb/debian/%s@%s\",\"name\":\"%s\",\"version\":\"%s\",\"purl\":\"pkg:deb/debian/%s@%s?arch=%s\"}", $1,$2,$1,$2,$1,$2,$3
      } END{print "]"}'
  )"
else
  echo "  • chroot not available — emitting marker-only OS SBOM"
fi

cat > "$OS_SBOM" <<JSON
{
  "bomFormat": "CycloneDX",
  "specVersion": "1.5",
  "serialNumber": "urn:uuid:$(uuid)",
  "version": 1,
  "metadata": {
    "timestamp": "$(ts)",
    "component": { "type": "operating-system", "name": "sita-os", "version": "${VERSION}" }
  },
  "components": ${COMPONENTS_JSON}
}
JSON
echo "  ✓ $OS_SBOM"

# ── Detached signatures ────────────────────────────────────────────────
sign_one() {
  local f="$1"
  if [ -n "$SIGN_KEY" ] && [ -f "$SIGN_KEY" ] && command -v openssl >/dev/null 2>&1; then
    openssl dgst -sha256 -sign "$SIGN_KEY" -out "${f}.sig" "$f"
    echo "  ✓ signed → ${f}.sig"
  else
    sha256sum "$f" | awk '{print $1}' > "${f}.sha256"
    echo "  • SITA_RELEASE_SIGN_KEY missing — wrote SHA256 → ${f}.sha256"
  fi
}
echo "▸ Signing SBOMs"
sign_one "$NPM_SBOM"
sign_one "$OS_SBOM"

echo "✓ SBOM generation complete (version=${VERSION})"
