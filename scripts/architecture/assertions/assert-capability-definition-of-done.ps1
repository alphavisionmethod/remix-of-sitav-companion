$caps = Get-ChildItem "src/packages" -Recurse -Filter "*.ts" -ErrorAction SilentlyContinue | Select-String "capabilityId:" 
$done = @(); $notDone = @()
foreach ($c in $caps) {
  if ($c.Line -match "status.*scaffold") { $notDone += $c.Filename } else { $done += $c.Filename }
}
Write-Host "PASS: $($done.Count) done, $($notDone.Count) scaffold"
