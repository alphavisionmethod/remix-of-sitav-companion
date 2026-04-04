Write-Host "Workflow verification foundations..."
$wf = Test-Path "src/lib/services/workflow*" -ErrorAction SilentlyContinue
if ($wf) { Write-Host "PASS: workflow services present" }
else { Write-Host "WARN: no workflow services found" }
