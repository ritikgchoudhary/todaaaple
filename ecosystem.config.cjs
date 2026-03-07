/**
 * PM2: Production = sirf backend (frontend build backend se serve hota hai).
 * Dev = backend + frontend dev alag chalana ho to frontend wala bhi start karo.
 *
 * Production: pm2 start ecosystem.config.cjs --only rushpay-backend
 * Ya: pm2 start ecosystem.config.cjs  (dono start; production pe frontend-dev hata do)
 */
module.exports = {
  apps: [
    {
      name: "rushpay-backend",
      cwd: "/www/wwwroot/rushpay.online/backend",
      script: "node",
      args: "app.js",
      env: { NODE_ENV: "production" },
    },
    {
      name: "rushpay-frontend-dev",
      cwd: "/www/wwwroot/rushpay.online/frontend",
      script: "npm",
      args: "start",
      env: {
        BROWSER: "none",
        PORT: "3000",
        HOST: "0.0.0.0",
        CI: "true",
      },
      // Production pe mat chalao; backend frontend/build serve karta hai
      // pm2 start ecosystem.config.cjs --only rushpay-backend
    },
  ],
};
