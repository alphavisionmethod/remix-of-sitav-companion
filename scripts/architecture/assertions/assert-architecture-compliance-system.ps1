if (Test-Path "generated/architecture-compliance-report.json") {
  $data = Get-Content "generated/architecture-compliance-report.json" | ConvertFrom-Json
  Write-Host "Architecture compliance score: $($data.summary.score)%"
} else { Write-Host "WARN: compliance report not found" }
