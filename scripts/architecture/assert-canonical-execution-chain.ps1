$chain = @("generated/capability-index.json","generated/service-manifest.json","generated/route-manifest.json")
$missing = $chain | Where-Object { -not (Test-Path $_) }
if ($missing) { Write-Host "FAIL: missing $($missing -join ', ')"; exit 1 }
Write-Host "PASS: canonical execution chain artifacts present"
