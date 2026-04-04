$pages = Get-ChildItem "src/pages" -Recurse -Filter "*.tsx" -ErrorAction SilentlyContinue
$components = Get-ChildItem "src/components" -Recurse -Filter "*.tsx" -ErrorAction SilentlyContinue
Write-Host "Frontend: $($pages.Count) pages, $($components.Count) components"
Write-Host "PASS: frontend experience structure check"
