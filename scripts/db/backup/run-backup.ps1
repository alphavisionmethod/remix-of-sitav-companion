# SITA OS — Database Backup Runner (Phase 18.3, Windows companion)
$ErrorActionPreference = "Stop"
$BackupDir = if ($env:BACKUP_DIR) { $env:BACKUP_DIR } else { "backups" }
$Ts = (Get-Date).ToUniversalTime().ToString("yyyyMMddTHHmmssZ")
New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null

$OutFile = ""
$Mode = ""
$TableCount = 0
$PolicyCount = 0
$SizeBytes = 0
$PgUrl = if ($env:PGURL) { $env:PGURL } elseif ($env:SUPABASE_DB_URL) { $env:SUPABASE_DB_URL } else { "" }

if ((Get-Command pg_dump -ErrorAction SilentlyContinue) -and $PgUrl) {
  $OutFile = Join-Path $BackupDir "$Ts.sql"
  $Mode = "pg_dump"
  & pg_dump --schema=public --no-owner --no-acl $PgUrl > $OutFile 2>$null
  if (Test-Path $OutFile) {
    $TableCount = (Select-String -Path $OutFile -Pattern '^CREATE TABLE' -AllMatches | Measure-Object).Count
    $PolicyCount = (Select-String -Path $OutFile -Pattern '^CREATE POLICY' -AllMatches | Measure-Object).Count
    $SizeBytes = (Get-Item $OutFile).Length
  }
}

if (-not $Mode) {
  $OutFile = Join-Path $BackupDir "$Ts.dry.json"
  $Mode = "dry-registry-snapshot"
  if (Test-Path "src/lib/db/schema-registry.ts") {
    $TableCount = (Select-String -Path "src/lib/db/schema-registry.ts" -Pattern '^  { name:' -AllMatches | Measure-Object).Count
  }
  $payload = @{
    mode = "dry-registry-snapshot"
    generatedAt = (Get-Date).ToUniversalTime().ToString("o")
    source = "src/lib/db/schema-registry.ts"
    tableCount = $TableCount
    policyCount = $PolicyCount
    note = "No live PG available"
  } | ConvertTo-Json -Depth 4
  Set-Content -Path $OutFile -Value $payload -NoNewline
  $SizeBytes = (Get-Item $OutFile).Length
}

$ManifestPath = Join-Path $BackupDir "manifest.json"
$manifest = if (Test-Path $ManifestPath) { Get-Content $ManifestPath -Raw | ConvertFrom-Json } else { @{ runs = @() } }
$run = @{
  timestamp = $Ts
  mode = $Mode
  file = (Split-Path $OutFile -Leaf)
  tableCount = $TableCount
  policyCount = $PolicyCount
  sizeBytes = $SizeBytes
}
$manifest.runs = ,$run + @($manifest.runs) | Select-Object -First 30
$manifest.latest = $run
$manifest.updatedAt = (Get-Date).ToUniversalTime().ToString("o")
$manifest | ConvertTo-Json -Depth 6 | Set-Content -Path $ManifestPath
Write-Host "[backup] done. mode=$Mode file=$OutFile"
