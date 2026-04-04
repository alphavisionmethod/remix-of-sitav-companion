param([string]$Tier = "production")
Write-Host "Checking deploy readiness for tier: $Tier"
$artifacts = @("generated/service-manifest.json","generated/route-manifest.json","generated/capability-index.json","generated/validation-summary.json")
$missing = $artifacts | Where-Object { -not (Test-Path $_) }
if ($missing) { Write-Host "Missing: $($missing -join ', ')"; exit 1 }
Write-Host "All deployment artifacts present"
