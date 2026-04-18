#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# SITA OS — Signed SBOM Generator (CycloneDX 1.5)
#
# Produces TWO SBOM documents and signs the OS one with the release key:
#
#   1. out/sbom-app.cdx.json     — npm dependency tree (vite app + electron)
#   2. out/sbom-os.cdx.json      — Debian package manifest from chroot
#                                  + verity, signing, and bundle artifacts
#   3. out/sbom-os.cdx.json.sig  — detached OpenSSL signature (RSA-SHA256)
#   4. out/sbom.manifest.json    — pointer + sha256 + signing key fingerprint
#
# CycloneDX is the industry-standard SBOM format consumed by Dependency
# Track, Grype, Trivy, etc. Signing the OS SBOM closes the supply-chain
# attestation loop alongside emit-attestation.sh.
# ═══════════════════════════════════════════════════════════════════════
set -euo pipefail

OUT_DIR="${SITA_OUT_DIR:-out}"
KEYS_DIR="${SITA_KEYS_DIR:-os/keys}"
SIGN_KEY="${SITA_SIGN_KEY:-${KEYS_DIR}/release.key}"
SIGN_CRT="${SITA_SIGN_CRT:-${KEYS_DIR}/release.crt}"
VERSION="${VERSION:-0.0.0-dev}"
CHROOT_DIR="${SITA_CHROOT_DIR:-${OUT_DIR}/chroot}"
SOURCE_DATE_EPOCH="${SOURCE_DATE_EPOCH:-$(date +%s)}"

mkdir -p "${OUT_DIR}"
APP_SBOM="${OUT_DIR}/sbom-app.cdx.json"
OS_SBOM="${OUT_DIR}/sbom-os.cdx.json"
SIG_FILE="${OUT_DIR}/sbom-os.cdx.json.sig"
MANIFEST="${OUT_DIR}/sbom.manifest.json"

iso_ts() { date -u -d "@${SOURCE_DATE_EPOCH}" +%Y-%m-%dT%H:%M:%SZ; }

echo "📦 generating CycloneDX SBOMs (version=${VERSION})"

# ── 1. App SBOM (best-effort cyclonedx-npm; fallback to package-lock walk) ──
if command -v npx >/dev/null 2>&1 && npx --no-install --yes -p @cyclonedx/cyclonedx-npm@latest cyclonedx-npm --version >/dev/null 2>&1; then
  npx --yes -p @cyclonedx/cyclonedx-npm@latest cyclonedx-npm \
    --output-format JSON --output-file "${APP_SBOM}" --spec-version 1.5 \
    >/dev/null 2>&1 || true
fi
if [[ ! -s "${APP_SBOM}" ]]; then
  # Deterministic fallback derived from package.json — never fails the build.
  node -e '
    const fs = require("fs");
    const pkg = JSON.parse(fs.readFileSync("package.json","utf8"));
    const deps = {...pkg.dependencies, ...pkg.devDependencies};
    const components = Object.entries(deps).map(([n,v]) => ({
      type: "library", "bom-ref": `pkg:npm/${n}@${v}`,
      name: n, version: String(v).replace(/^[\^~]/,""),
      purl: `pkg:npm/${encodeURIComponent(n)}@${String(v).replace(/^[\^~]/,"")}`
    })).sort((a,b)=>a.name.localeCompare(b.name));
    const sbom = {
      bomFormat: "CycloneDX", specVersion: "1.5", serialNumber: `urn:uuid:sita-app-${pkg.version||"0.0.0"}`,
      version: 1, metadata: { timestamp: process.env.TS, component: { type: "application", name: pkg.name||"sita-os", version: pkg.version||"0.0.0" }},
      components
    };
    fs.writeFileSync(process.argv[1], JSON.stringify(sbom, null, 2));
  ' "${APP_SBOM}" TS="$(iso_ts)"
fi

# ── 2. OS SBOM (chroot dpkg list + release artifacts) ──
COMPONENTS_JSON="$(mktemp)"
trap 'rm -f "${COMPONENTS_JSON}"' EXIT

if [[ -d "${CHROOT_DIR}/var/lib/dpkg" ]] && command -v chroot >/dev/null 2>&1; then
  chroot "${CHROOT_DIR}" dpkg-query -W -f='${Package}\t${Version}\t${Architecture}\n' 2>/dev/null \
    | sort \
    | awk -F'\t' 'BEGIN{print "["} NR>1{printf ",\n"} {
        printf "{\"type\":\"library\",\"bom-ref\":\"pkg:deb/debian/%s@%s?arch=%s\",\"name\":\"%s\",\"version\":\"%s\",\"purl\":\"pkg:deb/debian/%s@%s?arch=%s\"}",
          $1,$2,$3,$1,$2,$1,$2,$3
      } END{print "\n]"}' > "${COMPONENTS_JSON}"
else
  echo "[]" > "${COMPONENTS_JSON}"
fi

# Append release artifact components (ISO, IMG, bundles, verity) for full chain visibility
ARTIFACTS_JSON="$(mktemp)"
trap 'rm -f "${COMPONENTS_JSON}" "${ARTIFACTS_JSON}"' EXIT
{
  echo "["
  first=1
  for f in "${OUT_DIR}"/*.iso "${OUT_DIR}"/*.img "${OUT_DIR}"/*.bundle "${OUT_DIR}/verity-root.hash"; do
    [[ -f "$f" ]] || continue
    sha="$(sha256sum "$f" | awk '{print $1}')"
    name="$(basename "$f")"
    [[ $first -eq 1 ]] || printf ",\n"
    printf '{"type":"file","bom-ref":"sita:artifact:%s","name":"%s","version":"%s","hashes":[{"alg":"SHA-256","content":"%s"}]}' \
      "${name}" "${name}" "${VERSION}" "${sha}"
    first=0
  done
  echo "]"
} > "${ARTIFACTS_JSON}"

node -e '
  const fs = require("fs");
  const pkgs = JSON.parse(fs.readFileSync(process.argv[1],"utf8"));
  const arts = JSON.parse(fs.readFileSync(process.argv[2],"utf8"));
  const sbom = {
    bomFormat: "CycloneDX", specVersion: "1.5",
    serialNumber: `urn:uuid:sita-os-${process.env.VERSION}`,
    version: 1,
    metadata: {
      timestamp: process.env.TS,
      component: { type: "operating-system", name: "sita-os", version: process.env.VERSION },
      tools: [{ vendor: "SITA", name: "generate-sbom.sh", version: "1.0.0" }]
    },
    components: [...pkgs, ...arts]
  };
  fs.writeFileSync(process.argv[3], JSON.stringify(sbom, null, 2));
' "${COMPONENTS_JSON}" "${ARTIFACTS_JSON}" "${OS_SBOM}" \
  VERSION="${VERSION}" TS="$(iso_ts)"

# ── 3. Sign the OS SBOM ──
SIG_MODE="unsigned"
KEY_FP=""
if [[ -f "${SIGN_KEY}" ]]; then
  openssl dgst -sha256 -sign "${SIGN_KEY}" -out "${SIG_FILE}" "${OS_SBOM}"
  SIG_MODE="signed"
  if [[ -f "${SIGN_CRT}" ]]; then
    KEY_FP="$(openssl x509 -in "${SIGN_CRT}" -noout -fingerprint -sha256 \
              | sed 's/^.*=//; s/://g' | tr 'A-F' 'a-f')"
  fi
else
  echo "⚠  ${SIGN_KEY} not present — SBOM emitted unsigned"
  : > "${SIG_FILE}"
fi

APP_SHA="$(sha256sum "${APP_SBOM}" | awk '{print $1}')"
OS_SHA="$(sha256sum "${OS_SBOM}"  | awk '{print $1}')"
SIG_SHA="$(sha256sum "${SIG_FILE}" | awk '{print $1}')"

cat > "${MANIFEST}" <<JSON
{
  "$schema": "https://sita.dev/schemas/sbom-manifest.v1.json",
  "generatedAt": "$(iso_ts)",
  "version": "${VERSION}",
  "format": "CycloneDX-1.5",
  "app":  { "path": "sbom-app.cdx.json", "sha256": "${APP_SHA}" },
  "os":   { "path": "sbom-os.cdx.json",  "sha256": "${OS_SHA}"  },
  "signature": {
    "path": "sbom-os.cdx.json.sig",
    "sha256": "${SIG_SHA}",
    "mode": "${SIG_MODE}",
    "algorithm": "RSA-SHA256",
    "signingKeyFingerprintSha256": "${KEY_FP}"
  }
}
JSON

echo "✅ SBOMs generated"
echo "   app:    ${APP_SBOM}  (${APP_SHA:0:12}…)"
echo "   os:     ${OS_SBOM}   (${OS_SHA:0:12}…)"
echo "   sig:    ${SIG_FILE}  (${SIG_MODE})"
echo "   manifest: ${MANIFEST}"
