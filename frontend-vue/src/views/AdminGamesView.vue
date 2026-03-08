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
      <div v-for="(games, key) in gameCategories" :key="key" class="category-card">
        <div class="card-header">
          <h2 class="category-title">{{ formatKey(key) }}</h2>
          <button class="add-btn" @click="addGame(key)">+ Add Game</button>
        </div>

        <div class="games-grid">
          <div v-for="(game, index) in games" :key="index" class="game-item">
            <div class="game-top">
              <span class="game-index">#{{ index + 1 }}</span>
              <button class="remove-btn" @click="removeGame(key, index)">×</button>
            </div>
            
            <div class="input-group">
              <label>Game Name</label>
              <input v-model="game.name" placeholder="e.g. Aviator" />
            </div>

            <div class="input-group">
              <label>Game ID (game_uid)</label>
              <input v-model="game.id" placeholder="e.g. av" />
            </div>

            <div class="input-group">
              <label>Image URL (Optional)</label>
              <input v-model="game.img" placeholder="https://..." />
            </div>
          </div>
        </div>

        <div v-if="!games.length" class="empty-state">
          No games in this category.
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

const loading = ref(false)
const fetching = ref(true)
const message = ref('')
const messageType = ref('success')

function formatKey(key) {
  return key.charAt(0).toUpperCase() + key.slice(1)
}

function addGame(key) {
  gameCategories.value[key].push({ id: '', name: '', img: '' })
}

function removeGame(key, index) {
  gameCategories.value[key].splice(index, 1)
}

async function fetchData() {
  fetching.value = true
  try {
    const res = await api.getHomeCategoryGames()
    if (res.data) {
      // Ensure all keys exist
      const keys = ['sports', 'casino', 'crash', 'slot', 'lottery', 'cards']
      const formatted = {}
      keys.forEach(k => {
        formatted[k] = Array.isArray(res.data[k]) ? res.data[k] : []
      })
      gameCategories.value = formatted
    }
  } catch (err) {
    console.error('Fetch error:', err)
    message.value = 'Failed to load games. Using defaults.'
    messageType.value = 'error'
  } finally {
    fetching.value = false
  }
}

async function save() {
  loading.value = true
  message.value = ''
  try {
    await api.updateHomeCategoryGames(gameCategories.value)
    message.value = 'Game IDs updated successfully!'
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

.games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.game-item {
  background: #f8fafc;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.game-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
.game-index { font-size: 0.75rem; color: #94a3b8; font-weight: 700; }
.remove-btn { 
  background: #fef2f2; 
  color: #ef4444; 
  border: 1px solid #fee2e2; 
  width: 24px; height: 24px; border-radius: 50%; 
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; font-size: 1.2rem;
}
.remove-btn:hover { background: #fee2e2; }

.input-group { display: flex; flex-direction: column; gap: 4px; }
.input-group label { font-size: 0.75rem; font-weight: 600; color: #64748b; text-transform: uppercase; }
.input-group input { 
  padding: 8px 12px; 
  border: 1px solid #cbd5e1; 
  border-radius: 6px; 
  font-size: 0.9rem;
  outline: none;
  background: #fff;
}
.input-group input:focus { border-color: #2563eb; ring: 2px solid rgba(37, 99, 235, 0.1); }

.empty-state { padding: 40px; text-align: center; color: #94a3b8; font-style: italic; }

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
  .games-grid { grid-template-columns: 1fr; }
}
</style>
