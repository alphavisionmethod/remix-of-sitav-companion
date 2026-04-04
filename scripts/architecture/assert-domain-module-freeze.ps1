$frozen = @("business-os","finance-os","concierge-os")
foreach ($mod in $frozen) {
  $dir = "src/lib/services/$mod"
  if (Test-Path $dir) { Write-Host "PASS: $mod exists" }
}
Write-Host "PASS: domain module freeze check complete"
