$generated = Get-ChildItem "generated/*.json" -ErrorAction SilentlyContinue
$dupes = $generated | Group-Object Name | Where-Object { $_.Count -gt 1 }
if ($dupes) { Write-Host "FAIL: duplicate entries: $($dupes.Name -join ', ')"; exit 1 }
Write-Host "PASS: no duplicate generated entries"
