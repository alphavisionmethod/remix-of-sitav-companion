if (-not (Test-Path "generated/release-gate-thresholds.json")) { Write-Host "FAIL: release-gate-thresholds missing"; exit 1 }
Write-Host "PASS: release trust gates present"
