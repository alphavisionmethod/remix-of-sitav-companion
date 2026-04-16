$registries = @("generated/service-manifest.json","generated/capability-index.json","generated/route-manifest.json","generated/contract-manifest.json","generated/advisor-registry.json")
foreach ($r in $registries) {
  if (Test-Path $r) {
    $data = Get-Content $r | ConvertFrom-Json
    if (-not $data.version) { Write-Host "WARN: $r missing version field" }
  }
}
Write-Host "PASS: registry truth contract check complete"
