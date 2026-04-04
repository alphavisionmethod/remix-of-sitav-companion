$brain = Get-ChildItem -Path "src/lib/services" -Directory | Where-Object { $_.Name -eq "brain-core" }
if (-not $brain) { Write-Host "FAIL: brain-core not found"; exit 1 }
Write-Host "PASS: single brain-core found"
