if (-not (Test-Path "generated/maturity-thresholds.json")) { Write-Host "FAIL: maturity-thresholds.json missing"; exit 1 }
$data = Get-Content "generated/maturity-thresholds.json" | ConvertFrom-Json
Write-Host "PASS: maturity thresholds present"
