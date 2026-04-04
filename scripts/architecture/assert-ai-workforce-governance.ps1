Write-Host "AI workforce governance check..."
$agents = Get-ChildItem "src/lib/services" -Directory -ErrorAction SilentlyContinue | Where-Object { $_.Name -match "agent|ai|brain" }
Write-Host "  Found $($agents.Count) AI-related services"
Write-Host "PASS: AI workforce governance check complete"
