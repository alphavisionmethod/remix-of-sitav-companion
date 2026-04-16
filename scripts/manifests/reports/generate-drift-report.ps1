Write-Host "Generating drift report..."
if (Test-Path "generated/drift-report.md") { Write-Host "Drift report exists" }
else { Write-Host "No drift report — run generate-validation-summary.ts first" }
