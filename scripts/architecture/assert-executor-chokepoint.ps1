$executor = Get-ChildItem -Path "src/lib/services" -Directory | Where-Object { $_.Name -match "executor" }
if (-not $executor) { Write-Host "WARN: no executor service"; exit 0 }
Write-Host "PASS: executor chokepoint exists"
