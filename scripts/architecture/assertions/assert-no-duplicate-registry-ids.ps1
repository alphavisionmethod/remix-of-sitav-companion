if (-not (Test-Path "generated/capability-index.json")) { Write-Host "FAIL: capability-index missing"; exit 1 }
$caps = Get-Content "generated/capability-index.json" | ConvertFrom-Json
$ids = @{}
foreach ($c in $caps.capabilities) { if ($ids[$c.id]) { Write-Host "FAIL: duplicate $($c.id)"; exit 1 }; $ids[$c.id] = $true }
Write-Host "PASS: no duplicate registry IDs"
