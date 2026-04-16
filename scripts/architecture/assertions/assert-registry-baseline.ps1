$registries = @("generated/service-manifest.json","generated/capability-index.json","generated/advisor-registry.json","generated/connector-catalog.json")
$valid = 0
foreach ($r in $registries) {
  if (Test-Path $r) { try { Get-Content $r | ConvertFrom-Json | Out-Null; $valid++ } catch { Write-Host "FAIL: invalid $r"; exit 1 } }
}
Write-Host "PASS: $valid/$($registries.Count) registries valid"
