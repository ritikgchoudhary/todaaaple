# Frontend Vue (Toddapple)

Vue 3 + Vite migration – step-by-step copy from React. Backend same (Node/Express).

## Done so far

- **Phase 0:** Vue 3, Vite, Vue Router, Pinia, axios, API layer (`src/api/auth.js`), auth store (`src/stores/auth.js`)
- **Login page:** `src/views/LoginView.vue` – Sign In / Register tabs, phone, password, OTP (register), referral code, same API calls as React `AuthForm`
- **Home placeholder:** `src/views/HomeView.vue` – simple “Logged in” + Logout (next: full home with carousel, games)

## Run

```bash
# Install (already done)
npm install

# Dev (port 3001; API proxied to 4001)
npm run dev

# Build
npm run build
```

Backend `localhost:4001` pe chalna chahiye; Vue dev server API calls proxy karke 4001 pe bhejta hai.

## Env

- `.env.example` dekho. Dev mein default `http://localhost:4001`; production mein `VITE_API_BASE_URL=""` (same origin).

## Next steps (order)

1. **Reset Password** page (`/resetPassword`) – Vue copy of React `Forget`
2. **Home** – carousel, categories, game list, `getProviders`, `carousel`, `site-settings`, `getNotice`, `gamesCatalog`, `getUserHome`
3. **Play** – game launch iframe
4. Baaki pages per `docs/VUE-MIGRATION-PLAN.md`

## Folders

- `frontend/` – original React (abhi bhi use ho sakta hai)
- `frontend-react/` – backup copy of React frontend
- `frontend-vue/` – ye Vue app (yahan step-by-step pages add karo)
