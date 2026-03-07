# React → Vue.js Migration Plan (Step-by-Step)

Backend same rahega; sirf frontend React se Vue 3 (Vite) mein migrate hoga. Ye plan phase-by-phase follow karo.

---

## Tech stack (Vue side)

| Item | Choice |
|------|--------|
| Framework | Vue 3 (Composition API) |
| Build | Vite |
| Router | Vue Router 4 |
| State | Pinia |
| HTTP | Axios (same as now) |
| UI | Vuetify 3 ya PrimeVue (Material-style) |
| Env | `VITE_*` (e.g. `VITE_API_BASE_URL`) |

---

## Phase 0: Setup (Week 1)

- [ ] **0.1** Naya Vue project banao (current `frontend/` ko rename `frontend-react/` kar do, ya repo mein `frontend-vue/` folder banao).
- [ ] **0.2** Vue 3 + Vite + Vue Router + Pinia install; basic `index.html`, `main.js`, `App.vue`.
- [ ] **0.3** API layer: `src/api/auth.js`, `src/api/admin.js`, `src/api/gameCatalog.js` – same endpoints, base URL from `import.meta.env.VITE_API_BASE_URL` (dev: `http://localhost:4001`, prod: `""`).
- [ ] **0.4** Auth store (Pinia): login state, token, user; localStorage sync.
- [ ] **0.5** Router setup: routes array ready (paths same rahenge jaise neeche list hai); `beforeEach` mein protected route check (token nahi to `/login` redirect).
- [ ] **0.6** Backend: Vue build serve karne ke liye option add karo (e.g. `frontend-vue/dist` ya env se path). Ya abhi bhi `frontend/build` use karo aur Vue build output ko `frontend/build` mein copy karo.

---

## Phase 1: Public + Auth (Week 2)

| Step | Route(s) | Description |
|------|----------|-------------|
| 1.1 | `/login`, `/login/:id` | Login page – form, OTP flow, `signin`/`signup` API, token save, redirect `/`. |
| 1.2 | `/resetPassword` | Forget password page. |
| 1.3 | `/about-us`, `/shipping-policy` | Static pages (content copy from React). |
| 1.4 | Nav / Layout | Bottom nav component; paths pe hide (e.g. `/login`, `/admin`, `/play`). |

**Done when:** Login, signup, reset password work; token in Pinia + localStorage; redirect to home after login.

---

## Phase 2: Home + Core (Week 3)

| Step | Route(s) | Description |
|------|----------|-------------|
| 2.1 | `/` | Home – carousel, categories, game list. APIs: `getProviders`, `carousel`, `site-settings`, `getNotice`, `gamesCatalog`, `getUserHome` (auth). |
| 2.2 | `/play` | Game player – iframe launch; `game/launch/:id` API, balance display. |
| 2.3 | `/sports` | Lucky Sports page (same APIs + game launch). |
| 2.4 | `/wingo/:id` | Wingo/minute game page (agar abhi use ho raha hai). |

**Done when:** Home load, carousel, categories, game cards; play opens game; balance dikhe.

---

## Phase 3: Profile + Wallet (Week 4–5)

| Step | Route(s) | Description |
|------|----------|-------------|
| 3.1 | `/profile` | Profile – user info, `getUser`; links to wallet, security, etc. |
| 3.2 | `/wallet` | My wallet – balance, short history. |
| 3.3 | `/recharge`, `/preOrder` | Recharge flow – gateways, `getCurrentGateway`, create order APIs. |
| 3.4 | `/placeOrder3/:id/:token` | Payment success/flow page. |
| 3.5 | `/withdrawal` | Withdrawal form + API. |
| 3.6 | `/rechargeHistory`, `/withdrawalHistory` | History lists. |
| 3.7 | `/bank`, `/address`, `/accountSecurity`, `/accountSecurity/name`, `/accountSecurity/password`, `/accountSecurity.../placeOrder3` (fix typo) | Account settings. |
| 3.8 | `/invite`, `/invitationBonus`, `/invitationRewardRule`, `/invitationRecord` | Invite + bonus. |
| 3.9 | `/mySalary`, `/agent-earning`, `/dailyTask`, `/offer-history` | Salary, agent, daily task, offers. |
| 3.10 | `/redenvelope`, `/redEnvelopeHistory`, `/getRedEnvelop/:id` | Red envelope. |
| 3.11 | `/discount`, `/mypromotion`, `/mypromotion/apply`, `/promotionRecord/:id`, `/promotionRecordNew/:id` | Promotions. |
| 3.12 | `/financial`, `/help`, `/contact`, `/api-docs` | Financial, help, API docs. |
| 3.13 | `/myTask`, `/applyRecord` | Tasks and apply record. |

**Done when:** Profile, wallet, recharge, withdrawal, history, account security, invite, promotions sab Vue mein work karein.

---

## Phase 4: Games + History (Week 5–6)

| Step | Route(s) | Description |
|------|----------|-------------|
| 4.1 | `/minutes/bidHistory/:id` | Minutes bid history. |
| 4.2 | `/minutes/record/:id` | Minutes record. |
| 4.3 | `/winstreak/:id` | Win streak progress. |

(Commented-out routes – mines, fastParity, bigsmall, aviator, cricket – baad mein agar enable karna ho to same pattern se add karna.)

**Done when:** Active game history/record pages Vue mein chal rahe hon.

---

## Phase 5: Admin (Week 6–7)

| Step | Route(s) | Description |
|------|----------|-------------|
| 5.1 | `/admin` → redirect `/admin/dashboard` | Admin layout + sidebar. |
| 5.2 | `/admin/dashboard` | Dashboard – stats API. |
| 5.3 | `/admin/users` | User management. |
| 5.4 | `/admin/withdrawals` | Withdrawal management. |
| 5.5 | `/admin/commissions` | Commission config. |
| 5.6 | `/admin/providers` | Provider on/off. |
| 5.7 | `/admin/games` | Game management. |
| 5.8 | `/admin/categories` | Category management. |
| 5.9 | `/admin/recharge-settings` | Recharge gateways order/settings. |
| 5.10 | `/admin/carousel` | Carousel images. |
| 5.11 | `/admin/site-settings` | Site settings, logo, APK. |
| 5.12 | `/admin/slots` | Slots JSON editor. |

**Done when:** Saari admin pages Vue mein, same APIs use karke.

---

## Phase 6: Polish + Cutover (Week 8)

- [ ] **6.1** Theme: dark theme, spacing, typography (React theme jaise).
- [ ] **6.2** Loading states, error toasts, 404 page.
- [ ] **6.3** Build: `npm run build` → output `dist/`; backend ko point karo isi `dist/` pe (ya copy to `frontend/build`).
- [ ] **6.4** Env: production mein `VITE_API_BASE_URL=""` (same origin).
- [ ] **6.5** React frontend off / Vue live; test login, home, wallet, recharge, admin.
- [ ] **6.6** (Optional) `frontend-react/` backup rakho; confident ho to hata do.

---

## Route list (copy-paste for Vue Router)

```
/login, /login/:id
/resetPassword
/about-us, /shipping-policy

/                    (Home)
/sports
/play
/wingo/:id

/minutes/bidHistory/:id
/minutes/record/:id
/winstreak/:id

/profile
/api-docs
/help
/contact
/wallet
/withdrawal
/recharge
/preOrder
/placeOrder3/:id/:token
/rechargeHistory
/withdrawalHistory
/mySalary
/agent-earning
/dailyTask
/invitationBonus
/invitationRewardRule
/invitationRecord
/offer-history

/myTask
/applyRecord
/invite
/redenvelope
/redEnvelopeHistory
/financial
/bank
/accountSecurity
/accountSecurity/name
/accountSecurity/password
/discount
/mypromotion
/mypromotion/apply
/address
/promotionRecord/:id
/promotionRecordNew/:id
/getRedEnvelop/:id

/admin → /admin/dashboard
/admin/dashboard
/admin/users
/admin/withdrawals
/admin/commissions
/admin/providers
/admin/games
/admin/categories
/admin/recharge-settings
/admin/carousel
/admin/site-settings
/admin/slots
```

---

## Backend changes (minimal)

- API routes: **koi change nahi** – same endpoints.
- Static serve: ab Vue build folder serve karna (e.g. `frontend-vue/dist` ya jo path use karo). Same SPA fallback: unknown GET → `index.html`.

---

## Tips

1. Ek phase complete karke test karo; next phase start karo.
2. React waale API calls (auth.js, admin.js, etc.) copy karo; sirf export style Vue/axios ke hisaab se adjust karo.
3. Protected route: Pinia store se token check; nahi hai to `next('/login')`.
4. Typo fix: React mein `/accountSecurityhttps://pay.toddapple.live/placeOrder3` hai – Vue mein sahi path use karna (e.g. `/accountSecurity/payment`).

Is plan ko follow karke tum step-by-step React se Vue migrate kar sakte ho; backend same rehega.
