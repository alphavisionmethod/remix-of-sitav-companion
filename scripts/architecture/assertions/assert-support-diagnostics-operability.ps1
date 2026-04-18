Write-Host "Support diagnostics operability check..."
$ok = $true
$diag = Test-Path "src/lib/services/support-diagnostics"
if ($diag) { Write-Host "PASS: support-diagnostics service present" }
else { Write-Host "WARN: support-diagnostics service not found"; $ok = $false }

# Phase 3 native diagnostics surface
$paths = @(
  "os/scripts/generate-support-bundle.sh",
  "os/recovery/recovery-entry.sh",
  "os/recovery/recovery-status.sh",
  "os/recovery/recovery-collect.sh",
  "os/diagnostics/collect-boot-health.sh",
  "os/diagnostics/collect-runtime-health.sh",
  "os/diagnostics/collect-update-health.sh",
  "os/diagnostics/collect-service-failures.sh",
  "os/diagnostics/emit-runtime-status.sh",
  "os/runtime/shell-watchdog.sh",
  "os/runtime/check-shell-health.sh",
  "os/vm/validate-vm-profile.sh",
  "docs/os/RECOVERY_MODE.md",
  "docs/os/OBSERVABILITY_AND_DIAGNOSTICS.md",
  "docs/os/VM_VALIDATION_MATRIX.md",
  "docs/os/HARDWARE_SUPPORT_MATRIX.md",
  "docs/os/FIRST_BOOT_AND_PROVISIONING.md"
)
foreach ($p in $paths) {
  if (Test-Path $p) { Write-Host "PASS: $p" }
  else { Write-Host "FAIL: $p missing"; $ok = $false }
}

if ($ok) { exit 0 } else { exit 1 }
