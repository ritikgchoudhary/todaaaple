# Vue bina build ke chalana

## Option 1: Sirf backend (ek process, bina build)

Backend ke andar Vite dev mode chalao – Vue bina build ke serve hoga.

```bash
cd /www/wwwroot/rushpay.online/backend
USE_VITE_DEV=1 npm run dev
# ya
npm run dev:vue
```

Phir browser mein **https://rushpay.online** ya **http://localhost:4001** kholo. Vue app (Login, Home) direct chalegi, build ki zaroorat nahi.

- **Production** (deploy): `npm run build` zaroori hai; `USE_VITE_DEV` mat use karo.
- **Windows** pe: `set USE_VITE_DEV=1 && node app.js` ya PowerShell: `$env:USE_VITE_DEV="1"; node app.js`

---

## Option 2: Backend + Vue dev server (do process)

1. Terminal 1: `cd backend && node app.js` (port 4001)
2. Terminal 2: `cd frontend-vue && npm run dev` (port 3001)

Browser: **http://localhost:3001** – Vue dev server (HMR), API 4001 pe proxy.

---

**Short:** Bina build ke chalane ke liye backend se `USE_VITE_DEV=1 npm run dev` (ya `npm run dev:vue`) use karo.
