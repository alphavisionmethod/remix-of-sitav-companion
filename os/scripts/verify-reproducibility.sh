#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# SITA OS — Bit-for-bit reproducibility check
#
# Builds the ISO twice in clean directories, then compares SHA256 of
# the canonical artifacts. Aborts non-zero on any mismatch and writes
# a JSON report to generated/reproducibility-report.json.
#
# Usage:
#   sudo -E bash os/scripts/verify-reproducibility.sh
#
# Caveats: requires the same SOURCE_DATE_EPOCH (handled by
# reproducible-build-env.sh) and the same toolchain on both runs.
# ═══════════════════════════════════════════════════════════════════════
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
GEN_DIR="${REPO}/generated"
mkdir -p "$GEN_DIR"

# shellcheck disable=SC1091
. "${REPO}/os/scripts/reproducible-build-env.sh"

run_build() {
  local out="$1"
  rm -rf "$out"
  mkdir -p "$out"
  SITA_OUT_DIR="$out" sudo -E bash "${REPO}/os/image-builder/build.sh" >"${out}/build.log" 2>&1
}

echo "▸ Build #1 → out-rb-1/"
run_build "${REPO}/out-rb-1"
echo "▸ Build #2 → out-rb-2/"
run_build "${REPO}/out-rb-2"

declare -A R1 R2
ARTIFACTS=()
mismatch=0
results_json="["

shopt -s nullglob
for f in "${REPO}/out-rb-1"/*.iso "${REPO}/out-rb-1"/*.img "${REPO}/out-rb-1"/*.squashfs; do
  base="$(basename "$f")"
  ARTIFACTS+=("$base")
  R1[$base]="$(sha256sum "$f" | awk '{print $1}')"
  if [ -f "${REPO}/out-rb-2/${base}" ]; then
    R2[$base]="$(sha256sum "${REPO}/out-rb-2/${base}" | awk '{print $1}')"
  else
    R2[$base]="MISSING"
  fi
done
shopt -u nullglob

if [ "${#ARTIFACTS[@]}" -eq 0 ]; then
  echo "✘ no build artifacts produced — aborting" >&2
  exit 1
fi

first=1
for a in "${ARTIFACTS[@]}"; do
  status="match"
  [ "${R1[$a]}" != "${R2[$a]}" ] && { status="MISMATCH"; mismatch=1; }
  [ $first -eq 0 ] && results_json+=","
  first=0
  results_json+="{\"artifact\":\"$a\",\"sha1\":\"${R1[$a]}\",\"sha2\":\"${R2[$a]}\",\"status\":\"$status\"}"
  printf "  %-40s  %s\n" "$a" "$status"
done
results_json+="]"

cat > "${GEN_DIR}/reproducibility-report.json" <<JSON
{
  "checked_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "source_date_epoch": "${SOURCE_DATE_EPOCH}",
  "ok": $( [ $mismatch -eq 0 ] && echo true || echo false ),
  "artifact_count": ${#ARTIFACTS[@]},
  "results": ${results_json}
}
JSON

echo
echo "Report → ${GEN_DIR}/reproducibility-report.json"
if [ $mismatch -ne 0 ]; then
  echo "✘ reproducibility FAILED — see report" >&2
  exit 1
fi
echo "✓ reproducibility OK — all artifacts bit-identical"
