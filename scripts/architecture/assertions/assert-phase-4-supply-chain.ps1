Write-Host "Phase 4 trusted supply chain check..."
$ok = $true
$paths = @(
  "os/scripts/seal-verity-to-tpm.sh",
  "os/scripts/verify-tpm-seal.sh",
  "os/scripts/enroll-secureboot-mok.sh",
  "os/scripts/generate-sbom.sh",
  "os/scripts/verify-sbom.sh",
  "os/scripts/reproducible-build-env.sh",
  "os/scripts/verify-reproducibility.sh",
  "docs/os/PHASE_4_TRUSTED_SUPPLY_CHAIN.md"
)
foreach ($p in $paths) {
  if (Test-Path $p) { Write-Host "PASS: $p" }
  else { Write-Host "FAIL: $p missing"; $ok = $false }
}

# Wiring assertions
$release = Get-Content "os/scripts/release.sh" -Raw
foreach ($needle in @("seal-verity-to-tpm.sh","enroll-secureboot-mok.sh","generate-sbom.sh","verify-tpm-seal.sh","verify-sbom.sh","reproducible-build-env.sh")) {
  if ($release -match [regex]::Escape($needle)) { Write-Host "PASS: release.sh wires $needle" }
  else { Write-Host "FAIL: release.sh missing $needle"; $ok = $false }
}

$pkg = Get-Content "package.json" -Raw
foreach ($needle in @("os:tpm:seal","os:tpm:verify","os:secureboot:enroll","os:sbom:generate","os:sbom:verify","os:reproducible:verify")) {
  if ($pkg -match [regex]::Escape($needle)) { Write-Host "PASS: package.json wires $needle" }
  else { Write-Host "FAIL: package.json missing $needle"; $ok = $false }
}

$ci = Get-Content ".github/workflows/os-build-iso.yml" -Raw
foreach ($needle in @("seal-verity-to-tpm.sh","enroll-secureboot-mok.sh","generate-sbom.sh","verify-tpm-seal.sh","verify-sbom.sh","tpm-seal.manifest.json","sbom.manifest.json","mok-enroll.json")) {
  if ($ci -match [regex]::Escape($needle)) { Write-Host "PASS: CI wires $needle" }
  else { Write-Host "FAIL: CI missing $needle"; $ok = $false }
}

if (-not $ok) { exit 1 }
Write-Host "PASS: phase-4 trusted supply chain operability verified"
