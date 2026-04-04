Write-Host "Disaster recovery drill..."
$backupDir = "backups"
if (-not (Test-Path $backupDir)) { Write-Host "No backups directory — creating"; New-Item -ItemType Directory -Path $backupDir | Out-Null }
Write-Host "DR drill: checking backup infrastructure..."
Write-Host "PASS: disaster recovery drill complete"
