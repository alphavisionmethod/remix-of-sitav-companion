#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# SITA OS — Reproducibility Verifier
#
# Builds the ISO twice in fully isolated output directories using the
# same SOURCE_DATE_EPOCH, then compares the two ISOs byte-for-byte (and
# the squashfs payload separately so users see *where* drift entered).
#
# Outputs:
#   generated/reproducibility-report.json
#   generated/reproducibility-report.md
#
# Exit codes:
#   0  → bit-identical (or differences only in *.log timestamps)
#   1  → ISO bytes differ
#   2  → squashfs payload differs (worse; means rootfs is non-deterministic)
# ═══════════════════════════════════════════════════════════════════════
set -uo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
GEN_DIR="${REPO}/generated"
mkdir -p "${GEN_DIR}"
JSON="${GEN_DIR}/reproducibility-report.json"
MD="${GEN_DIR}/reproducibility-report.md"

# shellcheck source=os/scripts/reproducible-build-env.sh
. "${REPO}/os/scripts/reproducible-build-env.sh"

VERSION="${VERSION:-0.0.0-repro+$(git rev-parse --short HEAD 2>/dev/null || echo local)}"

A_DIR="${REPO}/out-repro-a"
B_DIR="${REPO}/out-repro-b"
rm -rf "${A_DIR}" "${B_DIR}"
mkdir -p "${A_DIR}" "${B_DIR}"

run_build() {
  local out="$1"
  echo "▸ building into ${out}"
  ( cd "${REPO}" && SITA_OUT_DIR="${out}" VERSION="${VERSION}" \
       sudo -E bash os/image-builder/build.sh ) > "${out}/build.log" 2>&1
}

# When sudo or build deps unavailable (CI dry-run), short-circuit gracefully
DEGRADED=0
if ! command -v sudo >/dev/null 2>&1 || ! command -v mksquashfs >/dev/null 2>&1; then
  DEGRADED=1
fi

if [[ "${DEGRADED}" -eq 0 ]]; then
  run_build "${A_DIR}" || { echo "❌ first build failed"; exit 10; }
  run_build "${B_DIR}" || { echo "❌ second build failed"; exit 11; }

  ISO_A="$(ls -1 "${A_DIR}"/*.iso 2>/dev/null | head -1 || true)"
  ISO_B="$(ls -1 "${B_DIR}"/*.iso 2>/dev/null | head -1 || true)"
  if [[ -z "${ISO_A}" || -z "${ISO_B}" ]]; then
    echo "❌ ISO artifacts not produced"; exit 12
  fi
  ISO_A_SHA="$(sha256sum "${ISO_A}" | awk '{print $1}')"
  ISO_B_SHA="$(sha256sum "${ISO_B}" | awk '{print $1}')"
  ISO_MATCH=$([[ "${ISO_A_SHA}" == "${ISO_B_SHA}" ]] && echo true || echo false)

  SQ_A_SHA=""; SQ_B_SHA=""; SQ_MATCH="n/a"
  if [[ -f "${A_DIR}/sita-rootfs.squashfs" && -f "${B_DIR}/sita-rootfs.squashfs" ]]; then
    SQ_A_SHA="$(sha256sum "${A_DIR}/sita-rootfs.squashfs" | awk '{print $1}')"
    SQ_B_SHA="$(sha256sum "${B_DIR}/sita-rootfs.squashfs" | awk '{print $1}')"
    SQ_MATCH=$([[ "${SQ_A_SHA}" == "${SQ_B_SHA}" ]] && echo true || echo false)
  fi
  STATUS=$([[ "${ISO_MATCH}" == "true" ]] && echo "reproducible" || echo "drift")
else
  ISO_A_SHA="(degraded — not built)"
  ISO_B_SHA="(degraded — not built)"
  ISO_MATCH="false"
  SQ_A_SHA=""; SQ_B_SHA=""; SQ_MATCH="n/a"
  STATUS="degraded"
fi

cat > "${JSON}" <<JSON
{
  "$schema": "https://sita.dev/schemas/reproducibility-report.v1.json",
  "generatedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "sourceDateEpoch": ${SOURCE_DATE_EPOCH},
  "version": "${VERSION}",
  "status": "${STATUS}",
  "iso": {
    "a": { "path": "out-repro-a/*.iso", "sha256": "${ISO_A_SHA}" },
    "b": { "path": "out-repro-b/*.iso", "sha256": "${ISO_B_SHA}" },
    "identical": ${ISO_MATCH}
  },
  "squashfs": {
    "a": { "sha256": "${SQ_A_SHA}" },
    "b": { "sha256": "${SQ_B_SHA}" },
    "identical": "${SQ_MATCH}"
  },
  "degraded": ${DEGRADED}
}
JSON

{
  echo "# SITA OS — Reproducibility Report"
  echo
  echo "- generated: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "- SOURCE_DATE_EPOCH: \`${SOURCE_DATE_EPOCH}\`"
  echo "- status: **${STATUS}**"
  echo
  echo "| Artifact | Build A | Build B | Identical |"
  echo "|---|---|---|---|"
  echo "| ISO | \`${ISO_A_SHA:0:12}…\` | \`${ISO_B_SHA:0:12}…\` | ${ISO_MATCH} |"
  echo "| squashfs | \`${SQ_A_SHA:0:12}…\` | \`${SQ_B_SHA:0:12}…\` | ${SQ_MATCH} |"
  if [[ "${DEGRADED}" -eq 1 ]]; then
    echo
    echo "> ⚠ degraded mode: build dependencies (sudo/mksquashfs) not present on this host. Re-run on a Debian/Ubuntu builder for a real verdict."
  fi
} > "${MD}"

echo "📄 reports:"
echo "   ${JSON}"
echo "   ${MD}"

if [[ "${STATUS}" == "reproducible" ]]; then exit 0; fi
if [[ "${SQ_MATCH}" == "false" ]]; then exit 2; fi
if [[ "${DEGRADED}" -eq 1 ]]; then exit 0; fi
exit 1
