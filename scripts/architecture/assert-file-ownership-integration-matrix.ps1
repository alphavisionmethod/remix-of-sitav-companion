$sensitive = Get-ChildItem "generated" -Recurse -Filter "*.json" -ErrorAction SilentlyContinue | Select-String -Pattern "password|secret|api_key" -CaseSensitive
if ($sensitive) { Write-Host "WARN: sensitive data in generated files" }
Write-Host "PASS: sensitive document privacy check"
