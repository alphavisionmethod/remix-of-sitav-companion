# ═══════════════════════════════════════════════════════════════════════
# SITA OS — Phase 4 Trusted Supply Chain assertion
#
# Fails the architecture-truth job if any Phase 4 script, doc, or
# wiring is missing. Mirrors the pattern of the other assert-*.ps1
# files used in the CI-truth pipeline.
# ═══════════════════════════════════════════════════════════════════════
$ErrorActionPreference = "Stop"
$root = (Resolve-Path "$PSScriptRoot/../../..").Path

$required = @(
  "os/scripts/seal-verity-to-tpm.sh",
  "os/scripts/verify-tpm-seal.sh",
  "os/scripts/enroll-secureboot-mok.sh",
  "os/scripts/generate-sbom.sh",
  "os/scripts/verify-sbom.sh",
  "os/scripts/reproducible-build-env.sh",
  "os/scripts/verify-reproducibility.sh",
  "docs/os/PHASE_4_TRUSTED_SUPPLY_CHAIN.md"
)

$missing = @()
foreach ($rel in $required) {
  $p = Join-Path $root $rel
  if (-not (Test-Path $p)) { $missing += $rel }
}

# Wiring spot-checks: release.sh + workflow + package.json must reference Phase 4 steps
$release   = Get-Content (Join-Path $root "os/scripts/release.sh") -Raw
$workflow  = Get-Content (Join-Path $root ".github/workflows/os-build-iso.yml") -Raw
$pkg       = Get-Content (Join-Path $root "package.json") -Raw

$wiring = @{
  "release.sh seal-verity-to-tpm"  = $release  -match "seal-verity-to-tpm"
  "release.sh generate-sbom"       = $release  -match "generate-sbom"
  "release.sh enroll-secureboot"   = $release  -match "enroll-secureboot-mok"
  "workflow phase-4 step"          = $workflow -match "Phase 4|seal-verity|generate-sbom"
  "package.json os:sbom"           = $pkg      -match "os:sbom"
  "package.json os:tpm:seal"       = $pkg      -match "os:tpm:seal"
  "package.json os:secureboot"     = $pkg      -match "os:secureboot"
}

$wireBroken = @()
foreach ($k in $wiring.Keys) { if (-not $wiring[$k]) { $wireBroken += $k } }

if ($missing.Count -gt 0 -or $wireBroken.Count -gt 0) {
  if ($missing.Count -gt 0) {
    Write-Host "✘ Phase 4 MISSING files:" -ForegroundColor Red
    $missing | ForEach-Object { Write-Host "    - $_" -ForegroundColor Red }
  }
  if ($wireBroken.Count -gt 0) {
    Write-Host "✘ Phase 4 BROKEN wiring:" -ForegroundColor Red
    $wireBroken | ForEach-Object { Write-Host "    - $_" -ForegroundColor Red }
  }
  exit 1
}

Write-Host "✓ Phase 4 trusted supply chain — all files present, wiring intact" -ForegroundColor Green
exit 0
