<template>
  <div class="api-docs-page">
    <div class="mobileContainer">
      <!-- Header -->
      <header class="header">
        <div class="headerLeft">
          <h1 class="title">API Docs</h1>
          <div class="baseUrl">Base URL: <strong>{{ baseUrl || '(not set)' }}</strong></div>
        </div>
        <button @click="router.back()" class="backBtn">Back</button>
      </header>

      <div class="body">
        <div class="card">
          <h3>Auth</h3>
          <p class="muted">
            User JWT is stored in localStorage as <b>user</b>. Most user APIs require:
            <b> Authorization: Bearer &lt;token&gt;</b>
          </p>
          <pre class="code">{{ `// Example (frontend)
const user = JSON.parse(localStorage.getItem("user") || "{}");
const token = user?.token;
const headers = token ? { Authorization: "Bearer " + token } : {};` }}</pre>
        </div>

        <div class="card">
          <h3>Games Catalog (Home UI)</h3>
          <p class="muted">
            Home page games are loaded from <b>static JSON files</b> (no API). Edit files in 
            <b>public/data/</b>: sports.json, casino.json, crash.json, slot.json, lottery.json, cards.json.
          </p>
          <div class="pillRow">
            <span class="pill">Static /data/*.json</span>
            <span class="pill">Public</span>
          </div>
          <pre class="code">{{ `# Example: public/data/sports.json
{
  "games": [
    {
      "id": "sports-1",
      "key": "9wickets",
      "name": "9WICKETS",
      "category": "sports",
      ...
    }
  ]
}` }}</pre>
        </div>

        <div class="card">
          <h3>Master Admin (Games Manager)</h3>
          <p class="muted">
            Admin APIs are protected by <b>AdminAPI</b> (from backend <b>config.env</b>).
            In the admin panel it is stored as <b>MASTER_ADMIN_API</b>.
          </p>
          <div class="pillRow">
            <span class="pill">GET /gamesCatalogAdmin/:api</span>
            <span class="pill">POST /gamesCatalogAdmin/:api</span>
            <span class="pill">PUT /gamesCatalogAdmin/:id/:api</span>
          </div>
          <pre class="code">{{ `# List all
curl "\${baseUrl}/gamesCatalogAdmin/ADMIN_API_KEY"

# Create
curl -X POST "\${baseUrl}/gamesCatalogAdmin/ADMIN_API_KEY" \\
  -d '{ "name": "Lucky Sports", "enabled": true, ... }'` }}</pre>
        </div>

        <p class="footerNotice">Note: Full backend routes are in <b>backend/router/routes.js</b>.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import * as api from '../api/auth'

const router = useRouter()
const baseUrl = ref(api.url || '')

onMounted(() => {
  baseUrl.value = api.url || ''
})
</script>

<style scoped>
.api-docs-page { min-height: 100vh; background-color: #F1F5F9; display: flex; justify-content: center; font-family: var(--font-app); }
.mobileContainer { width: 100%; max-width: 500px; min-height: 100vh; background-color: #fff; position: relative; }

.header { position: sticky; top: 0; z-index: 10; background: #fff; border-bottom: 1px solid #E5E7EB; padding: 12px 14px; display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.title { font-weight: 900; color: #0F172A; font-size: 16px; margin: 0; }
.baseUrl { color: #64748B; font-size: 11px; margin-top: 2px; }
.backBtn { padding: 6px 12px; border: 1px solid #E5E7EB; background: white; font-size: 12px; font-weight: bold; border-radius: 4px; cursor: pointer; }

.body { padding: 14px; }
.card { border: 1px solid #E5E7EB; background: #fff; padding: 12px; margin-bottom: 12px; border-radius: 6px; }
.card h3 { font-size: 14px; font-weight: 900; color: #0F172A; margin: 0 0 6px; }
.muted { color: #64748B; font-size: 12px; line-height: 1.4; margin: 0; }
.code { margin-top: 10px; background: #0B1220; color: #E5E7EB; padding: 10px; font-size: 11px; line-height: 1.4; overflow-x: auto; white-space: pre; border-radius: 4px; }

.pillRow { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
.pill { font-size: 10px; padding: 4px 8px; border: 1px solid #E5E7EB; background: #F8FAFC; color: #0F172A; font-weight: bold; border-radius: 4px; }

.footerNotice { text-align: center; color: #64748B; font-size: 12px; padding: 10px 0 20px; }
</style>
