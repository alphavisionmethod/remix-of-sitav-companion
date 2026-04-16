$advanced = @("generated/capability-family-index.json","generated/capability-quality-metric.json","generated/operational-scorecards.json","generated/ownership-manifest.json")
$present = ($advanced | Where-Object { Test-Path $_ }).Count
Write-Host "Advanced platform expansion: $present/$($advanced.Count) artifacts"
