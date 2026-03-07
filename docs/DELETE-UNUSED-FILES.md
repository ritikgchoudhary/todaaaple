# Kaunsi files/folders delete kar sakte ho

Ab site **Vue** se chal rahi hai (backend `frontend-vue/dist` serve karta hai). Neeche list: **safe delete**, **optional**, **mat delete**.

---

## Safe delete (kam ki nahi, delete kar sakte ho)

| Item | Size (approx) | Reason |
|------|----------------|--------|
| **todaaapple.zip** | ~230 MB | Purana backup zip; koi use nahi |
| **frontend-react/** | ~1.2 GB | React ka copy backup; ab Vue use ho raha hai. Delete se space free. Agar rollback chahiye to pehle zip bana ke rakh lo |

---

## Optional (situation ke hisaab se delete)

| Item | Reason |
|------|--------|
| **frontend/** | Original React app (~1.2 GB). Agar **permanently** sirf Vue use karoge to delete kar sakte ho. Rollback ke liye rakhna ho to mat hatao. |
| **backend/debug-*.js, check-*.js, db-*.js, import-data*.js, inspect-*.js, list-collections-simple.js, restore-ids-robust.js, test-mongo-connection.js, verify-import-counts.js, final-test.js** | Dev/debug/migration scripts; app run karne ke liye zaroori nahi. Kaam nahi ho to delete. |
| **create-admin-user.js, create-test-user.js, create-working-user.js, reset-password.js, test-ssl-fix.js, test.js, simulate_network.php** (project root) | One-off utility scripts. Use nahi karte to delete. |
| **app.yaml, cloudbuild.yaml** | Google Cloud / Cloud Build use nahi karte to delete. |
| **apache-rushpay-dev.conf** | Sirf Nginx use karte ho to delete. |
| **nginx-dev-server.conf.example** | Sirf example; asli config use ho to delete. |
| **.cursor/** | Editor/IDE folder; delete karo to bhi chalega. |
| **projects/** (agar hai) | Purane scraped/saved HTML files; kaam nahi to delete. |

---

## Mat delete (zaroori)

| Item | Reason |
|------|--------|
| **backend/** (core) | app.js, router/, controller/, model/, db/, middleware/ – sab zaroori. Sirf upar wale optional scripts delete karo. |
| **frontend-vue/** | Live Vue app; delete mat karo. |
| **docs/** | Migration/deploy notes – rakhna better. |
| **.git/** | Git history. |
| **deploy-live.sh, ecosystem.config.cjs, nginx-rushpay-online.conf** | Deploy/run ke liye. |
| **.well-known/** | SSL/domain verification ke liye. |

---

## Delete commands (sirf jab sure ho)

```bash
cd /www/wwwroot/rushpay.online

# Safe delete (recommended)
rm -f todaaapple.zip
rm -rf frontend-react

# Optional – React hataana (permanent Vue)
# rm -rf frontend

# Optional – backend ke one-off scripts
# rm -f backend/debug-*.js backend/check-*.js backend/db-*.js backend/import-data*.js backend/inspect-*.js backend/list-collections-simple.js backend/restore-ids-robust.js backend/test-mongo-connection.js backend/verify-import-counts.js backend/final-test.js

# Optional – root one-off scripts
# rm -f create-admin-user.js create-test-user.js create-working-user.js reset-password.js test-ssl-fix.js test.js simulate_network.php
```

**Note:** `frontend-react` aur `frontend` delete karne se ~2.4 GB free ho sakta hai. Pehle confirm karo ki Vue app sahi chal rahi hai aur React wapas nahi lana.
