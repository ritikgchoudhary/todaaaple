# Project context: RushPay / Todaaaple (for AI or new developers)

**Use this prompt to onboard another AI or developer so they can work on this codebase.**

---

## Copy-paste prompt (share this with another AI)

```
You are working on the RushPay / Todaaaple project — a mobile-first gaming/betting platform (rushpay.online). Here is the context you need:

## Tech stack
- **Frontend (primary):** Vue 3 + Vite in `frontend-vue/`. This is the main UI; the backend serves `frontend-vue/dist` for all pages.
- **Backend:** Node.js + Express in `backend/`. Port 4001. Serves API + static Vue build.
- **Other:** `frontend/` is an older React app (optional); `frontend-react/` is a backup. Focus on `frontend-vue/` for UI work.

## Repo layout
- `frontend-vue/` — Vue 3 app: `src/views/` (HomeView, LoginView), `src/api/`, `src/stores/`, `src/router/`
- `backend/` — Express app: `app.js`, `router/routes.js`, `controller/`, `model/`, `db/`
- `docs/` — Migration plans, project prompts
- Assets (images) use CDN: `https://img.bzvm68.com` (e.g. logos, game icons, carousel, banners)

## Main UI (Vue) — HomeView.vue
- **Location:** `frontend-vue/src/views/HomeView.vue` (single large file: template + script + scoped styles)
- **Sections:** Header (logo, Register/Log-in), Slider (carousel, no overlay text), Announcement bar, Category tabs (Sports, Live Casino, Crash Game, Slot Game, Lottery, Card Game, Cockfight Live), then category-specific content:
  - **Sports / Live Casino:** Provider cards (game-item, card-a/card-b, character-bg, name + logo). Data: `defaultProviders`, `liveCasinoProviders`; API: `getProviders`, `getNotice`.
  - **Crash Game:** 4-column grid of card-f items (background image, heart icon top-right, game-name-box at bottom). Data: static `crashGames` array. Use `getCrashGameName(g)` for display name; style: single-line ellipsis, no mid-word break.
  - **Slot Game:** Left sidebar (Search, HOT, provider filters JDB/R88/JILI/VP/PG) + search bar + card-f grid. Data: `slotFilterItems`, `slotGames`, `displaySlotGames` (filtered by `slotSearchQuery`).
  - **Lottery:** Single-column provider cards (Indian Lottery style): light grey bg, “LOTTERY” watermark, name + logo left, character image right. Data: `lotteryProviders` (INDIA LOTTO, SEA/TCGAMING, BBIN).
- **Bottom nav:** Fixed footer with Account and other nav icons (max-width 430px, centered).
- **Container:** All content inside `.mobileContainer` (max-width 430px, phone-first).

## Conventions
1. **After any change in `frontend-vue/src/`**, run: `cd frontend-vue && npm run build`. Backend serves `frontend-vue/dist`; without a build, UI changes won’t show in production.
2. **Assets:** Use `baseImg = 'https://img.bzvm68.com'` for images; paths like `site_common/H5_7_mobile/...`, `game/img2/en-US/...`, `game/banner/...`.
3. **API (Vue):** `frontend-vue/src/api/home.js` — getNotice, getProviders; `auth.js` for signin/signup. Base URL from `VITE_API_BASE_URL` or dev proxy to 4001.
4. **State:** Pinia store `auth` for login state; no Vuex.
5. **Routing:** Vue Router; paths like `/`, `/login`, `/account`. SPA; backend serves `index.html` for non-API routes.

## Known issues / recent work
- **Crash Game:** Names must show as single line with ellipsis; no garbled or mid-word break. Heart icon top-right. Grid always 4 columns. Use only `g.name` for display (via `getCrashGameName(g)`).
- **Slot:** Search filters by name; provider filter chips (Search, HOT, JDB, etc.) are in `slotFilterItems`; game list in `slotGames` / `displaySlotGames`.
- **Lottery:** Placeholder logo/character URLs under `lotteryBase`; replace with real asset paths when available.
- **Build:** If you edit only backend, no frontend build needed. If you edit `frontend-vue/src/**`, always run `npm run build` in `frontend-vue/` before saying “done”.

## Run locally
- Backend: `cd backend && npm run dev` (or node app.js) — port 4001.
- Vue dev: `cd frontend-vue && npm run dev` — port 3001 (or per vite.config), proxies API to 4001.
- Production: build Vue, then run backend; backend serves `frontend-vue/dist` for `/`.

## Git / deploy
- Repo: https://github.com/ritikgchoudhary/todaaaple.git
- Don’t commit: `.well-known/`, `backend/uploads/`, large binaries. After changes: `git add -u`, `git commit -m "..."`, then user runs `git push origin main`.
```

---

## Short version (minimal context)

**Project:** RushPay / Todaaaple — Vue 3 (frontend-vue) + Node/Express (backend). Mobile-first gaming UI; assets from `https://img.bzvm68.com`.  
**Main file:** `frontend-vue/src/views/HomeView.vue` — header, slider, tabs (Sports / Live Casino / Crash / Slot / Lottery / Card / Cockfight), then category-specific grids/cards.  
**Rule:** After any change in `frontend-vue/src/`, run `cd frontend-vue && npm run build`.  
**APIs:** getNotice, getProviders, carousel, site-settings; auth (signin/signup) in `src/api/auth.js`. Backend port 4001; Vue dev proxies to it.

---

*Generated for sharing with another AI or developer. Update this file when adding new features or conventions.*
