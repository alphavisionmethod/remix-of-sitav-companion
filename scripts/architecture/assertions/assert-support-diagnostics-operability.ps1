Write-Host "Support diagnostics operability check..."
$diag = Test-Path "src/lib/services/support-diagnostics"
if ($diag) { Write-Host "PASS: support-diagnostics service present" }
else { Write-Host "WARN: support-diagnostics service not found" }
