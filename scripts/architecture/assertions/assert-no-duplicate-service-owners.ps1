if (-not (Test-Path "generated/service-manifest.json")) { exit 0 }
$data = Get-Content "generated/service-manifest.json" | ConvertFrom-Json
$owners = @{}
foreach ($s in $data.services) { if ($owners[$s.id]) { Write-Host "FAIL: duplicate $($s.id)"; exit 1 }; $owners[$s.id] = $true }
Write-Host "PASS: no duplicate service owners"
