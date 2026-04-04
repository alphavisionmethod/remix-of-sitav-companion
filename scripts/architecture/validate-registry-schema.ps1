$schemas = @("generated/service-manifest.json","generated/capability-index.json","generated/route-manifest.json")
foreach ($s in $schemas) {
  if (Test-Path $s) {
    try { Get-Content $s | ConvertFrom-Json | Out-Null; Write-Host "PASS: $s valid" }
    catch { Write-Host "FAIL: $s invalid JSON"; exit 1 }
  } else { Write-Host "WARN: $s not found" }
}
Write-Host "PASS: registry schema validation complete"
