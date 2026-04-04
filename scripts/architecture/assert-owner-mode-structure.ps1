$pages = Get-ChildItem "src/pages" -Recurse -Filter "*.tsx" -ErrorAction SilentlyContinue
$owners = @{}
foreach ($p in $pages) {
  $content = Get-Content $p.FullName -Raw
  if ($content -match "owner:\s*['""]([^'""]+)['""]") { $owners[$p.Name] = $matches[1] }
}
Write-Host "PASS: $($owners.Count) pages with ownership tags"
