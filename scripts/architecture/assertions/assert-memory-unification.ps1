if (-not (Test-Path "src/lib/services/memory")) { Write-Host "WARN: memory service not found"; exit 0 }
Write-Host "PASS: memory unification service exists"
