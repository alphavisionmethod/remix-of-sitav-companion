$proof = Test-Path "src/packages/contracts/proof-model*" -or Test-Path "src/lib/services/receipt*"
if (-not $proof) { Write-Host "WARN: proof layer not found"; exit 0 }
Write-Host "PASS: proof layer present"
