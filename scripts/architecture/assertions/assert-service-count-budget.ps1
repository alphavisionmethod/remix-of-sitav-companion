$services = (Get-ChildItem "src/lib/services" -Directory -ErrorAction SilentlyContinue).Count
$budget = 90
if ($services -gt $budget) { Write-Host "FAIL: $services services exceeds budget $budget"; exit 1 }
Write-Host "PASS: $services/$budget service budget"
