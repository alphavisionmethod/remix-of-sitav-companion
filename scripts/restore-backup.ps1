param([string]$BackupFile)
if (-not $BackupFile) { Write-Host "Usage: restore-backup.ps1 <backup-file>"; exit 1 }
if (-not (Test-Path $BackupFile)) { Write-Host "Backup file not found: $BackupFile"; exit 1 }
Write-Host "Restoring from $BackupFile..."
if (Get-Command psql -ErrorAction SilentlyContinue) {
  psql -f $BackupFile
  Write-Host "Restore complete"
} else { Write-Host "psql not found" }
