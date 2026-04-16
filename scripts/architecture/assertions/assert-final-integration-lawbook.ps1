$checks = @("generated/service-manifest.json","generated/capability-index.json","generated/route-manifest.json","generated/contract-manifest.json","generated/launch-tier-index.json")
$passed = 0
foreach ($c in $checks) { if (Test-Path $c) { $passed++ } }
Write-Host "Final integration: $passed/$($checks.Count) checks passed"
