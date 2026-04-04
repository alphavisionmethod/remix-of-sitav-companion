Write-Host "Generating production truth dashboard..."
if (Test-Path "generated/production-truth-dashboard.md") { Write-Host "Dashboard exists" }
else { Write-Host "No dashboard — run generate-validation-summary.ts first" }
