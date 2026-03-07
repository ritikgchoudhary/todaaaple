#!/bin/bash
# Domain pe Vue app live dikhane ke liye. Server pe run karo.
set -e
cd "$(dirname "$0")"

echo "Building Vue..."
cd frontend-vue && npm run build && cd ..

echo "Vue build done. Restarting backend..."
if command -v pm2 &>/dev/null; then
  pm2 restart rushpay-backend 2>/dev/null || pm2 restart all
  echo "Backend restarted (PM2)."
else
  echo "PM2 not found. Backend restart karo: cd backend && node app.js"
fi

echo "Done. Open https://rushpay.online (or your domain) – Vue app dikhni chahiye."
