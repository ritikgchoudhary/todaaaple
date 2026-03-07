# Domain pe Vue app live dikhane ke liye

## Server pe ye steps karo

### 1. Vue build + backend restart (ek saath)

```bash
cd /www/wwwroot/rushpay.online
./deploy-live.sh
```

Ya manually:

```bash
cd /www/wwwroot/rushpay.online/frontend-vue
npm run build

cd /www/wwwroot/rushpay.online/backend
pm2 restart rushpay-backend
# agar PM2 app ka naam alag hai to: pm2 restart all
```

### 2. Nginx check

Domain **saari** traffic backend (4001) ko jani chahiye. Agar abhi bhi blank/error aaye to:

- Nginx config mein `location / { proxy_pass http://127.0.0.1:4001; ... }` hona chahiye (detail: `nginx-rushpay-online.conf`)
- Reload: `sudo nginx -t && sudo systemctl reload nginx`

### 3. Browser

- https://rushpay.online/ kholo
- Hard refresh: **Ctrl+Shift+R** (ya Cmd+Shift+R)

---

**Short:** Server pe `./deploy-live.sh` chalao, phir https://rushpay.online open karo – Vue (Login page) dikhni chahiye.
