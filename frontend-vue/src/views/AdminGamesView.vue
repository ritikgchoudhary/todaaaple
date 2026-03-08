<template>
  <div class="admin-games-page">
    <div class="header">
      <router-link to="/" class="back-link">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Back to Home
      </router-link>
      <h1>Manage Game IDs</h1>
      <button class="save-btn" @click="save" :disabled="loading">
        {{ loading ? 'Saving...' : 'Save Changes' }}
      </button>
    </div>

    <div v-if="fetching" class="loader">Loading data...</div>
    
    <div v-else class="categories-list">
      <!-- Slot Providers Section -->
      <div class="category-card providers-section">
        <div class="card-header">
           <h2 class="category-title">Slot Sidebar Providers</h2>
           <div class="header-actions">
             <button class="add-btn" @click="addProvider">+ Add Provider</button>
           </div>
        </div>
        <div class="table-container">
          <table class="games-table">
            <thead>
              <tr>
                <th width="50">#</th>
                <th>Provider Name (Label)</th>
                <th>Provider ID (for URL)</th>
                <th>Normal Icon / logoHide</th>
                <th>Hover Icon / logoShow</th>
                <th width="80">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(p, index) in slotProviders" :key="index">
                <td>{{ index + 1 }}</td>
                <td><input v-model="p.label" placeholder="e.g. JDB" /></td>
                <td><input v-model="p.id" placeholder="e.g. jdb" /></td>
                <td><input v-model="p.logoHide" placeholder="Normal icon URL" /></td>
                <td><input v-model="p.logoShow" placeholder="Active icon URL" /></td>
                <td class="actions">
                  <button class="remove-btn" @click="slotProviders.splice(index, 1)">×</button>
                </td>
              </tr>
              <tr v-if="!slotProviders.length">
                <td colspan="6" class="empty-row">No providers. Search & HOT are permanent.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-for="(games, key) in gameCategories" :key="key" class="category-card">
        <div class="card-header">
          <h2 class="category-title">{{ formatKey(key) }}</h2>
          <div class="header-actions">
            <button class="add-btn" @click="addGame(key)">+ Add Game</button>
          </div>
        </div>

        <div class="table-container">
          <table class="games-table">
            <thead>
              <tr>
                <th width="50">#</th>
                <th>Game Name</th>
                <th>Game ID (uid)</th>
                <th>Image URL</th>
                <th v-if="key === 'slot'" width="120">Provider</th>
                <th width="80">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(game, index) in games" :key="index">
                <td>{{ index + 1 }}</td>
                <td>
                  <input v-model="game.name" placeholder="Name" />
                </td>
                <td>
                  <input v-model="game.id" placeholder="ID" />
                </td>
                <td>
                  <input v-model="game.img" placeholder="Image URL" />
                </td>
                <td v-if="key === 'slot'">
                  <select v-model="game.provider" class="provider-select">
                    <option value="">None</option>
                    <option v-for="p in slotProviders" :key="p.id" :value="p.id">
                      {{ p.label || p.id }}
                    </option>
                  </select>
                </td>
                <td class="actions">
                  <button class="remove-btn" @click="removeGame(key, index)">×</button>
                </td>
              </tr>
              <tr v-if="!games.length">
                <td :colspan="key === 'slot' ? 6 : 5" class="empty-row">No games added. Click 'Add Game' or 'Restore Defaults'.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-if="message" :class="['message', messageType]">
      {{ message }}
      <button class="close-msg" @click="message = ''">×</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as api from '../api/home'

const gameCategories = ref({
  sports: [],
  casino: [],
  crash: [],
  slot: [],
  lottery: [],
  cards: []
})

const slotProviders = ref([])
const loading = ref(false)
const fetching = ref(true)
const message = ref('')
const messageType = ref('success')

function formatKey(key) {
  return key.charAt(0).toUpperCase() + key.slice(1)
}

function addGame(key) {
  const newGame = { id: '', name: '', img: '' }
  if (key === 'slot') newGame.provider = ''
  gameCategories.value[key].push(newGame)
}

function removeGame(key, index) {
  gameCategories.value[key].splice(index, 1)
}

function addProvider() {
  slotProviders.value.push({ id: '', label: '', logoHide: '', logoShow: '' })
}

async function fetchData() {
  fetching.value = true
  try {
    const res = await api.getHomeCategoryGames()
    if (res.data) {
      const keys = ['sports', 'casino', 'crash', 'slot', 'lottery', 'cards']
      const formatted = {}
      let isEmpty = true
      keys.forEach(k => {
        formatted[k] = Array.isArray(res.data[k]) && res.data[k].length > 0 ? res.data[k] : []
        if (formatted[k].length > 0) isEmpty = false
      })
      slotProviders.value = Array.isArray(res.data.slotProviders) ? res.data.slotProviders : []
      
      if (isEmpty) {
          // Initialize with defaults if everything is empty
          resetAllToDefaults()
      } else {
          gameCategories.value = formatted
      }
    }
  } catch (err) {
    console.error('Fetch error:', err)
    message.value = 'Failed to load games. Using defaults.'
    messageType.value = 'error'
    resetAllToDefaults()
  } finally {
    fetching.value = false
  }
}

const DEFAULTS = {
    sports: [
        { id: '9w', name: '9WICKETS', img: 'https://img.bzvm68.com/site_common/H5_7_mobile/game_logo/4-GP9W.png' },
        { id: 'lucky', name: 'Lucky Sports', img: 'https://img.bzvm68.com/site_common/H5_7_mobile/game_logo/4-GPLS.png' },
        { id: 'saba', name: 'SABA', img: 'https://img.bzvm68.com/site_common/H5_7_mobile/game_logo/4-GPOW-en_US.png' },
        { id: 'newbb', name: 'NewBB', img: 'https://img.bzvm68.com/site_common/H5_7_mobile/game_logo/4-GPBB-new bb.png' },
        { id: 'sbo', name: 'SBO', img: 'https://img.bzvm68.com/site_common/H5_7_mobile/game_logo/4-GPSB2.png' },
        { id: 'fb', name: 'FB', img: 'https://img.bzvm68.com/site_common/H5_7_mobile/game_logo/4-GPFB-en_US.png' }
    ],
    casino: [
        { id: 'evo', name: 'EVO', img: 'https://img.bzvm68.com/site_common/H5_7_mobile/game_logo/3-GPEV.png' },
        { id: 'pt', name: 'PT', img: 'https://img.bzvm68.com/site_common/H5_7_mobile/game_logo/3-GPPT3.png' },
        { id: 'ezugi', name: 'Ezugi', img: 'https://img.bzvm68.com/site_common/H5_7_mobile/game_logo/3-GPEZ.png' },
        { id: 'sexy', name: 'SEXY', img: 'https://img.bzvm68.com/site_common/H5_7_mobile/game_logo/3-GPSX2.png' },
        { id: 'ssg', name: 'SSG', img: 'https://img.bzvm68.com/site_common/H5_7_mobile/game_logo/3-GPSS.png' },
        { id: 'mg', name: 'MG', img: 'https://img.bzvm68.com/site_common/H5_7_mobile/game_logo/3-GPMG2.png' },
        { id: 'pa', name: 'PA', img: 'https://img.bzvm68.com/site_common/H5_7_mobile/game_logo/3-GPAG2.png' }
    ],
    crash: [
        { id: 'av', name: 'Aviator', img: 'https://img.bzvm68.com/game/img2/en-US/GPJD/MjJfMjIwMDEjMTczNTAzMjc0OA==.png' },
        { id: 'avx', name: 'AviatorX', img: 'https://img.bzvm68.com/game/img2/en-US/GPR8/NV9BdmlhdG9yWCMxNzU2Mjg1Mjg2.png' },
        { id: 'aeb', name: 'Aviator Extra Bet', img: 'https://img.bzvm68.com/game/img2/en-US/GPJD/OV85MDIzIzE3NDY3Njk0ODY=.png' },
        { id: 'cd', name: 'Chicken Dash', img: 'https://img.bzvm68.com/game/img2/en-US/GPJL/OF82OTAjMTc1ODA5ODc1Ng==.png' },
        { id: 'fd', name: 'Frog Dash', img: 'https://img.bzvm68.com/game/img2/en-US/GPJL/OF82OTgjMTc2MjMyODYyNA==.png' },
        { id: 'cb', name: 'Cricket Burst', img: 'https://img.bzvm68.com/game/img2/en-US/GPJD/OV85MDIyIzE3MzUwMjcxOTE=.png' },
        { id: 'fb', name: 'Firework Burst', img: 'https://img.bzvm68.com/game/img2/en-US/GPJD/OV85MDE1IzE3MzUwMjgyNjI=.png' },
        { id: 'cp', name: 'Crash Puck', img: 'https://img.bzvm68.com/game/img2/en-US/GPJL/OF81MTIjMTc1NzU2OTUwNw==.png' },
        { id: 'gr', name: 'Go Rush', img: 'https://img.bzvm68.com/game/img2/en-US/GPJL/OF8yMjQjMTY4MjA2MzYzNA==.png' },
        { id: 'ct', name: 'Crash Touchdown', img: 'https://img.bzvm68.com/game/img2/en-US/GPJL/OF80NTkjMTc0MDYyNDQ4Ng==.png' },
        { id: 'cc', name: 'Crash Cricket', img: 'https://img.bzvm68.com/game/img2/en-US/GPJL/OF80NjkjMTcyMjgzNjE5MA==.png' },
        { id: 'cg', name: 'Crash Goal', img: 'https://img.bzvm68.com/game/img2/en-US/GPJL/OF80MDcjMTcxODI2NDgzNQ==.png' },
        { id: 'flyx', name: 'FlyX', img: 'https://img.bzvm68.com/game/img2/en-US/GPMG2/Q3Jhc2hfU01HX2ZseVgjMTc1Mzc3MjgxOA==.png' }
    ],
    slot: [
        { id: 's1', name: 'Aviator', img: 'https://img.bzvm68.com/game/img2/en-US/GPJD/MjJfMjIwMDEjMTczNTAzMjc0OA==.png' },
        { id: 's2', name: 'Aviator Extra Bet', img: 'https://img.bzvm68.com/game/img2/en-US/GPJD/OV85MDIzIzE3NDY3Njk0ODY=.png' },
        { id: 's3', name: 'Chicken Dash', img: 'https://img.bzvm68.com/game/img2/en-US/GPJL/OF82OTAjMTc1ODA5ODc1Ng==.png' },
        { id: 's4', name: 'Frog Dash', img: 'https://img.bzvm68.com/game/img2/en-US/GPJL/OF82OTgjMTc2MjMyODYyNA==.png' },
        { id: 's5', name: 'Go Rush', img: 'https://img.bzvm68.com/game/img2/en-US/GPJL/OF8yMjQjMTY4MjA2MzYzNA==.png' },
        { id: 's6', name: 'Cleopatra', img: 'https://img.bzvm68.com/game/img2/en-US/GPR8/Ml9TbG90Q2xlb3BhdHJhIzE3MTI4OTg5MzI=.png' },
        { id: 's7', name: 'Super Ace', img: 'https://img.bzvm68.com/game/img2/en-US/GPJL/MV80OSMxNjQ4NDM2OTA2.png' },
        { id: 's8', name: 'Maya Gems', img: 'https://img.bzvm68.com/game/img2/en-US/GPR8/Ml9TbG90Rm9ydHVuZUdlbXMjMTc0NTU0NDMyMg==.png' },
        { id: 's9', name: 'Piggy Bank', img: 'https://img.bzvm68.com/game/img2/en-US/GPJD/MF8xNDA5MSMxNzM1MDk2Nzgw.png' },
        { id: 's10', name: 'Fortune Gems', img: 'https://img.bzvm68.com/game/img2/en-US/GPJL/MV8xMDkjMTY0ODQzNjkwNg==.png' },
        { id: 's11', name: 'Fortune Gems 2', img: 'https://img.bzvm68.com/game/img2/en-US/GPJL/MV8yMjMjMTY4ODU0MTY2NA==.png' },
        { id: 's12', name: 'Double Ace MultiXPLUS', img: 'https://img.bzvm68.com/game/img2/en-US/GPVP/U0xPVF9WUF8yMzAwMzhfMSMxNzY1NTI0MTYx.png' },
        { id: 's13', name: 'Mines', img: '' },
        { id: 's14', name: 'Fortune Gems 3', img: '' },
        { id: 's15', name: 'Golden Empire', img: '' },
        { id: 's16', name: 'Super Ace Deluxe', img: '' },
        { id: 's17', name: 'Super Ace 2', img: '' },
        { id: 's18', name: 'Money Coming', img: '' },
        { id: 's19', name: 'Money Coming 2', img: '' },
        { id: 's20', name: 'Money Coming Expanded Bets', img: '' },
        { id: 's21', name: '7 UP 7 DOWN', img: '' },
        { id: 's22', name: 'Magic Ace', img: '' },
        { id: 's23', name: 'Crazy777 2', img: '' },
        { id: 's24', name: 'Monster Hunter S', img: '' },
        { id: 's25', name: 'Monopoly', img: '' },
        { id: 's26', name: 'Mighty Zeus', img: '' },
        { id: 's27', name: 'Royal War', img: '' },
        { id: 's28', name: 'Candy Island', img: '' },
        { id: 's29', name: 'The Secret Life of Pets', img: '' },
        { id: 's30', name: 'Mahjong 3+', img: '' },
        { id: 's31', name: 'Big Bass Bonanza', img: '' },
        { id: 's32', name: '777', img: '' },
        { id: 's33', name: 'Golden kingdom', img: '' },
        { id: 's34', name: 'Pirate Treasure', img: '' }
    ],
    lottery: [
        { id: 'india-lotto', name: 'INDIA LOTTO', img: 'https://img.bzvm68.com/site_common/H5_7_mobile/game_logo/lottery/india_lotto.png' },
        { id: 'sea-tcg', name: 'SEA', img: 'https://img.bzvm68.com/site_common/H5_7_mobile/game_logo/lottery/sea_tcgaming.png' },
        { id: 'bbin', name: 'BBIN', img: 'https://img.bzvm68.com/site_common/H5_7_mobile/game_logo/lottery/bbin.png' }
    ],
    cards: []
}

function resetCategory(key) {
    gameCategories.value[key] = JSON.parse(JSON.stringify(DEFAULTS[key] || []))
}

function resetAllToDefaults() {
    gameCategories.value = JSON.parse(JSON.stringify(DEFAULTS))
}

async function save() {
  loading.value = true
  message.value = ''
  try {
    const payload = { ...gameCategories.value, slotProviders: slotProviders.value }
    await api.updateHomeCategoryGames(payload)
    message.value = 'Settings updated successfully!'
    messageType.value = 'success'
  } catch (err) {
    console.error('Save error:', err)
    message.value = 'Failed to save changes: ' + (err.response?.data?.error || err.message)
    messageType.value = 'error'
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>

<style scoped>
.admin-games-page {
  padding: 40px 20px 80px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  background: #f8fafc;
  min-height: 100vh;
  color: #1e293b;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
  background: #fff;
  padding: 20px 24px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.back-link {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: #64748b;
  font-weight: 500;
  font-size: 0.9rem;
}
.back-link:hover { color: #2563eb; }

h1 { font-size: 1.5rem; color: #1e293b; margin: 0; }

.save-btn {
  background: #2563eb;
  color: #fff;
  border: none;
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
  transition: all 0.2s;
}
.save-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3); }
.save-btn:active { transform: translateY(0); }
.save-btn:disabled { opacity: 0.6; cursor: wait; }

.loader { text-align: center; padding: 60px; font-size: 1.1rem; color: #64748b; }

.categories-list { display: flex; flex-direction: column; gap: 32px; }

.category-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border: 1px solid #e2e8f0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.category-title { margin: 0; font-size: 1.25rem; color: #0f172a; border-left: 4px solid #2563eb; padding-left: 12px; }

.add-btn {
  background: #f1f5f9;
  color: #334155;
  border: 1px dashed #cbd5e1;
  padding: 6px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}
.add-btn:hover { background: #e2e8f0; }

.header-actions { display: flex; gap: 8px; }

.reset-btn {
  background: transparent;
  color: #64748b;
  border: 1px solid #e2e8f0;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.8rem;
}
.reset-btn:hover { background: #f8fafc; color: #1e293b; border-color: #cbd5e1; }

.table-container { overflow-x: auto; margin: 0 -24px; }
.games-table { width: 100%; border-collapse: collapse; min-width: 600px; }
.games-table th { background: #f8fafc; text-align: left; padding: 12px 24px; font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; }
.games-table td { padding: 12px 24px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
.games-table input { width: 100%; padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.9rem; outline: none; transition: border-color 0.2s; background: #fff; }
.games-table input:focus { border-color: #2563eb; box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.05); }

.actions { text-align: center; }
.remove-btn { background: #fef2f2; color: #ef4444; border: 1px solid #fee2e2; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 1.2rem; transition: all 0.2s; margin: 0 auto; }
.remove-btn:hover { background: #ef4444; color: #fff; border-color: #ef4444; }
.provider-select {
  width: 100%;
  padding: 8px 6px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.85rem;
  background: #fff;
  cursor: pointer;
  outline: none;
}
.provider-select:focus { border-color: #2563eb; }

.empty-row { padding: 48px !important; text-align: center; color: #94a3b8; font-style: italic; font-size: 0.9rem; }

.message {
  position: fixed;
  bottom: 24px;
  right: 24px;
  padding: 16px 24px;
  border-radius: 12px;
  color: #fff;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
  z-index: 100;
  animation: slideIn 0.3s ease-out;
}
.message.success { background: #10b981; }
.message.error { background: #ef4444; }

.close-msg { background: none; border: none; color: #fff; font-size: 1.2rem; cursor: pointer; }

@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@media (max-width: 640px) {
  .header { flex-direction: column; gap: 16px; align-items: stretch; }
  .table-container { margin: 0 -24px; padding: 0 4px; }
  .category-card { padding: 16px; }
  .category-title { font-size: 1.1rem; }
}
</style>
