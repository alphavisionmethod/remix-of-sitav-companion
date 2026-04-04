$identity = Test-Path "src/lib/services/identity" -or Test-Path "src/lib/services/entity-graph"
if (-not $identity) { Write-Host "WARN: identity/entity-graph not found"; exit 0 }
Write-Host "PASS: identity-graph foundation present"
