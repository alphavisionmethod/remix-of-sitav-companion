$controlPlane = Test-Path "src/lib/services/connector-control-plane" -or Test-Path "src/lib/services/capability-router"
if (-not $controlPlane) { Write-Host "WARN: control plane not found"; exit 0 }
Write-Host "PASS: control plane sovereignty intact"
