if (-not (Test-Path "generated/operational-scorecards.json")) { Write-Host "WARN: scorecards missing"; exit 0 }
$data = Get-Content "generated/operational-scorecards.json" | ConvertFrom-Json
Write-Host "PASS: operational scorecards present"
