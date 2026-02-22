# Free port 4001 (Windows). Run: .\kill-port-4001.ps1
$p = Get-NetTCPConnection -LocalPort 4001 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($p) {
  Stop-Process -Id $p -Force
  Write-Host "Stopped process on port 4001. You can now run: node app.js"
} else {
  Write-Host "No process found on port 4001."
}
