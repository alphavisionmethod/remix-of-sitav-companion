$checks = @("generated/validation-summary.json","generated/architecture-compliance-report.json","generated/service-manifest.json")
$passed = 0
foreach ($c in $checks) { if (Test-Path $c) { $passed++ } else { Write-Host "MISSING: $c" } }
Write-Host "Pre-flight: $passed/$($checks.Count) passed"
if ($passed -lt $checks.Count) { exit 1 }
