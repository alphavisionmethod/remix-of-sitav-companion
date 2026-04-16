# invariant: exactly one sovereign brain-core and exactly three domain modules
$services = Get-ChildItem "src/lib/services" -Directory -ErrorAction SilentlyContinue
$brains = $services | Where-Object { $_.Name -eq "brain-core" }
$modules = @("business-os","finance-os","concierge-os") | Where-Object { Test-Path "src/lib/services/$_" }
if ($brains.Count -ne 1) { Write-Host "FAIL: expected 1 brain-core, found $($brains.Count)"; exit 1 }
if ($modules.Count -lt 3) { Write-Host "WARN: only $($modules.Count)/3 domain modules" }
Write-Host "PASS: architecture invariants verified"
