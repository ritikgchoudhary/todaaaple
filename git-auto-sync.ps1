while($true) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] Checking for changes..." -ForegroundColor Cyan
    
    # Check if there are any changes
    $status = git status --porcelain
    if ($status) {
        Write-Host "[$timestamp] Changes detected. Syncing to GitHub..." -ForegroundColor Green
        git add .
        git commit -m "Auto-commit: $timestamp"
        git push origin main
        Write-Host "[$timestamp] Successfully pushed to GitHub." -ForegroundColor Blue
    } else {
        Write-Host "[$timestamp] No changes detected. Skipping commit." -ForegroundColor Yellow
    }
    
    Write-Host "[$timestamp] Next sync in 10 minutes..." -ForegroundColor Gray
    Start-Sleep -Seconds 600
}
