# rushpay.online — Frontend + Backend dono isi domain pe

## Concept

- **Ek hi process:** Backend (Node/Express) port **4001** pe.
- Backend **API** bhi serve karta hai aur **frontend build** bhi (`frontend/build`).
- Nginx sirf **https://rushpay.online** → `http://127.0.0.1:4001` proxy karta hai.

## Steps

### 1. Frontend build (React)

```bash
cd /www/wwwroot/rushpay.online/frontend
CI=false npm run build
```

### 2. Backend start (PM2 se ya direct)

```bash
cd /www/wwwroot/rushpay.online/backend
# PM2 se (recommended)
pm2 start app.js --name rushpay-backend
# ya
pm2 start ecosystem.config.cjs
# Sirf backend wala start karo production mein (frontend-dev mat chalao)
pm2 save && pm2 startup
```

Backend **4001** pe chalna chahiye. Check: `curl http://127.0.0.1:4001/health` → `{"ok":true}`

### 3. Nginx

- `nginx-rushpay-online.conf` use karo. Apne server pe Nginx config jahan bhi hai (e.g. `/etc/nginx/conf.d/` ya `sites-available`), wahan isko include karo.
- SSL certificate path set karo (`ssl_certificate`, `ssl_certificate_key`).
- Reload: `sudo nginx -t && sudo systemctl reload nginx`

### 4. Check

- https://rushpay.online/health → `{"ok":true}`
- https://rushpay.online/ → React app (login/home)
- https://rushpay.online/login → Login page

Agar "Loading…" message dikhe to browser DevTools → Network mein dekho: `/static/js/main.*.js` 200 aa raha hai ya 404. 404 matlab request backend tak nahi ja rahi (Nginx ya path galat).
