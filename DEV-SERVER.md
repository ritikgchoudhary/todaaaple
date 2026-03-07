# Development server (bina build ke frontend)

Jab aap frontend **dev server** use karte ho, har file save pe page auto-refresh ho sakta hai — **`npm run build`** nahi chalana padta.

## 1. PM2 se backend + frontend dev start karo

```bash
cd /www/wwwroot/rushpay.online

# Pehle purane processes stop karo (agar sirf app.js chal raha tha)
pm2 stop rushpay

# Naya config start karo (backend + frontend dev dono)
pm2 start ecosystem.config.cjs
```

- **rushpay-backend** → port **4001** (API)
- **rushpay-frontend-dev** → port **3000** (React dev, hot reload)

Pehli baar frontend dev start hone mein 30–60 second lag sakte hain.

## 2. Web server ko dev server pe point karo

- **API routes** (`/user/`, `/getUser/`, `/admin-api/`, `/api/`, `/game/`, `/data/`, `/health`) → **http://127.0.0.1:4001**
- **Baaki sab** (`/`, `/login`, `/static`, etc.) → **http://127.0.0.1:3000**

### aaPanel + Apache

Agar aaPanel me **Apache** use ho raha hai:

1. **`apache-rushpay-dev.conf`** kholo — isme poora VirtualHost config hai.
2. aaPanel → **Website** → **rushpay.online** → **Config** (ya **Reverse proxy**) me jao.
3. Is file ka andar wala `<VirtualHost>...</VirtualHost>` content copy karke wahan paste karo (ya file include karo).
4. Proxy modules enable ho: `proxy`, `proxy_http`, `proxy_wstunnel`, `rewrite`. aaPanel me usually pehle se on hote hain; nahi to terminal me:  
   `sudo a2enmod proxy proxy_http proxy_wstunnel rewrite && sudo systemctl reload apache2`
5. Save karke Apache reload karo.

### Nginx (agar use ho)

Example config: **`nginx-dev-server.conf.example`** — isko apne Nginx site config mein merge karo. Merge ke baad:  
`sudo nginx -t && sudo systemctl reload nginx`

## 3. Domain pe check karo

Browser mein **https://rushpay.online** kholo. Ab HTML/JS **dev server** (3000) se aana chahiye; API calls backend (4001) pe jayengi.

## Wapas build mode pe jaana

1. Nginx ko phir se **sirf backend** (4001) pe point karo (backend wala `app.js` hi `frontend/build` serve karega).
2. PM2 se dev server band karo:
   ```bash
   pm2 stop rushpay-frontend-dev
   pm2 start rushpay   # sirf backend (app.js)
   ```
3. Frontend change ke baad **build** chalao:
   ```bash
   cd frontend && npm run build
   ```

---

**Note:** Dev server **development** ke liye hai (fast refresh). **Production** ke liye `npm run build` + backend se `build/` serve karna better hai.
