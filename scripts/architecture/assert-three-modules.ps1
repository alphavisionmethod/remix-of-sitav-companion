$modules = @("business-os","finance-os","concierge-os")
$found = $modules | Where-Object { Test-Path "src/lib/services/$_" -or Test-Path "src/packages/$_*" }
if ($found.Count -lt 3) { Write-Host "FAIL: only $($found.Count)/3 modules"; exit 1 }
Write-Host "PASS: 3 domain modules found"
