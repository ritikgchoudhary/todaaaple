#!/bin/bash
cd /www/wwwroot/rushpay.online

# Check if there are any changes
if [ -n "$(git status --porcelain)" ]; then
    echo "Changes detected at $(date). Committing and pushing..."
    git add .
    git commit -m "auto-update: sync changes $(date +'%Y-%m-%d %H:%M:%S')"
    git push origin main
else
    echo "No changes to commit at $(date)."
fi
