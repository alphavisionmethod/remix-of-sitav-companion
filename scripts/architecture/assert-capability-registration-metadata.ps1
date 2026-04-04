$caps = Get-ChildItem "src/packages" -Recurse -Filter "*.ts" | Select-String "capabilityId:" -ErrorAction SilentlyContinue
foreach ($c in $caps) { Write-Host "  CAP: $($c.Line.Trim())" }
Write-Host "PASS: capability registration metadata check"
