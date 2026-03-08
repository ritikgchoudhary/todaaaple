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
        { id: "3", name: "Crazy Pusher", img: "https://igamingapis.com/img/3.png", provider: "jili" },
        { id: "4", name: "Crash Touchdown", img: "https://igamingapis.com/img/4.png", provider: "jili" },
        { id: "17", name: "Devil Fire 2", img: "https://igamingapis.com/img/17.png", provider: "jili" },
        { id: "21", name: "Caribbean Stud Poker", img: "https://igamingapis.com/img/21.png", provider: "jili" },
        { id: "26", name: "Golden Land", img: "https://igamingapis.com/img/26.png", provider: "jili" },
        { id: "33", name: "MINI FLUSH", img: "https://igamingapis.com/img/33.png", provider: "jili" },
        { id: "42", name: "Fengshen", img: "https://igamingapis.com/img/42.png", provider: "jili" },
        { id: "44", name: "Pearls of Bingo", img: "https://igamingapis.com/img/44.png", provider: "jili" },
        { id: "53", name: "Journey West M", img: "https://igamingapis.com/img/53.png", provider: "jili" },
        { id: "59", name: "Super Ace Scratch", img: "https://igamingapis.com/img/59.png", provider: "jili" },
        { id: "75", name: "JILI CAISHEN", img: "https://igamingapis.com/img/75.png", provider: "jili" },
        { id: "76", name: "Dragon Fortune", img: "https://igamingapis.com/img/76.png", provider: "jili" },
        { id: "82", name: "Legacy of Egypt", img: "https://igamingapis.com/img/82.png", provider: "jili" },
        { id: "104", name: "Keno Extra Bet", img: "https://igamingapis.com/img/104.png", provider: "jili" },
        { id: "107", name: "TeenPatti Joker", img: "https://igamingapis.com/img/107.png", provider: "jili" },
        { id: "110", name: "TeenPatti 20-20", img: "https://igamingapis.com/img/110.png", provider: "jili" },
        { id: "113", name: "Devil Fire", img: "https://igamingapis.com/img/113.png", provider: "jili" },
        { id: "119", name: "Secret Treasure", img: "https://igamingapis.com/img/119.png", provider: "jili" },
        { id: "128", name: "Happy Taxi", img: "https://igamingapis.com/img/128.png", provider: "jili" },
        { id: "142", name: "God Of Martial", img: "https://igamingapis.com/img/142.png", provider: "jili" },
        { id: "148", name: "Bingo Adventure", img: "https://igamingapis.com/img/148.png", provider: "jili" },
        { id: "155", name: "Boxing Extravaganza", img: "https://igamingapis.com/img/155.png", provider: "jili" },
        { id: "158", name: "Chin Shi Huang", img: "https://igamingapis.com/img/158.png", provider: "jili" },
        { id: "162", name: "Big Small", img: "https://igamingapis.com/img/162.png", provider: "jili" },
        { id: "163", name: "3 Coin Wild Horse", img: "https://igamingapis.com/img/163.png", provider: "jili" },
        { id: "170", name: "Tongits Go", img: "https://igamingapis.com/img/170.png", provider: "jili" },
        { id: "177", name: "World Cup", img: "https://igamingapis.com/img/177.png", provider: "jili" },
        { id: "182", name: "Charge Buffalo Ascent", img: "https://igamingapis.com/img/182.png", provider: "jili" },
        { id: "183", name: "Video Poker", img: "https://igamingapis.com/img/183.png", provider: "jili" },
        { id: "185", name: "Jogo do Bicho", img: "https://igamingapis.com/img/185.png", provider: "jili" },
        { id: "189", name: "Super Ace Joker", img: "https://igamingapis.com/img/189.png", provider: "jili" },
        { id: "192", name: "Gold Rush", img: "https://igamingapis.com/img/192.png", provider: "jili" },
        { id: "193", name: "Color Game", img: "https://igamingapis.com/img/193.png", provider: "jili" },
        { id: "195", name: "Crash Cricket", img: "https://igamingapis.com/img/195.png", provider: "jili" },
        { id: "197", name: "Medusa", img: "https://igamingapis.com/img/197.png", provider: "jili" },
        { id: "202", name: "Candy Baby", img: "https://igamingapis.com/img/202.png", provider: "jili" },
        { id: "211", name: "Wild Racer", img: "https://igamingapis.com/img/211.png", provider: "jili" },
        { id: "216", name: "Fortune Bingo", img: "https://igamingapis.com/img/216.png", provider: "jili" },
        { id: "245", name: "Number King", img: "https://igamingapis.com/img/245.png", provider: "jili" },
        { id: "257", name: "Bonus Hunter", img: "https://igamingapis.com/img/257.png", provider: "jili" },
        { id: "259", name: "Jhandi Munda", img: "https://igamingapis.com/img/259.png", provider: "jili" },
        { id: "261", name: "Money Coming Expand Bets", img: "https://igamingapis.com/img/261.png", provider: "jili" },
        { id: "262", name: "Golden Bank 2", img: "https://igamingapis.com/img/262.png", provider: "jili" },
        { id: "264", name: "7up7down", img: "https://igamingapis.com/img/264.png", provider: "jili" },
        { id: "267", name: "Blackjack", img: "https://igamingapis.com/img/267.png", provider: "jili" },
        { id: "270", name: "Jackpot Fishing", img: "https://igamingapis.com/img/270.png", provider: "jili" },
        { id: "296", name: "Pool Rummy", img: "https://igamingapis.com/img/296.png", provider: "jili" },
        { id: "299", name: "Penalty Kick", img: "https://igamingapis.com/img/299.png", provider: "jili" },
        { id: "306", name: "Go For Champion", img: "https://igamingapis.com/img/306.png", provider: "jili" },
        { id: "315", name: "Pirate Queen 2", img: "https://igamingapis.com/img/315.png", provider: "jili" },
        { id: "426", name: "Mines", img: "https://igamingapis.com/img/426.png", provider: "spribe" },
        { id: "478", name: "Plinko", img: "https://igamingapis.com/img/478.png", provider: "spribe" },
        { id: "551", name: "Keno 80", img: "https://igamingapis.com/img/551.png", provider: "spribe" },
        { id: "635", name: "Dice", img: "https://igamingapis.com/img/635.png", provider: "spribe" },
        { id: "723", name: "Mini Roulette", img: "https://igamingapis.com/img/723.png", provider: "spribe" },
        { id: "737", name: "Aviator", img: "https://igamingapis.com/img/737.png", provider: "spribe" },
        { id: "775", name: "Hi Lo", img: "https://igamingapis.com/img/775.png", provider: "spribe" },
        { id: "826", name: "Hotline", img: "https://igamingapis.com/img/826.png", provider: "spribe" },
        { id: "894", name: "Keno", img: "https://igamingapis.com/img/894.png", provider: "spribe" },
        { id: "904", name: "Goal", img: "https://igamingapis.com/img/904.png", provider: "spribe" },
        { id: "1019", name: "Balloon", img: "https://igamingapis.com/img/1019.png", provider: "spribe" },
        { id: "5808", name: "Trader", img: "https://igamingapis.com/img/5808.png", provider: "spribe" },
        { id: "307", name: "Mines", img: "https://igamingapis.com/img/307.png", provider: "jdb" },
        { id: "927", name: "Plinko", img: "https://igamingapis.com/img/927.png", provider: "jdb" },
        { id: "734", name: "Hilo", img: "https://igamingapis.com/img/734.png", provider: "jdb" },
        { id: "744", name: "Mole Crash", img: "https://igamingapis.com/img/744.png", provider: "jdb" },
        { id: "819", name: "Mines2", img: "https://igamingapis.com/img/819.png", provider: "jdb" },
        { id: "6", name: "Goal", img: "https://igamingapis.com/img/6.png", provider: "jdb" },
        { id: "283", name: "KingOfFootball", img: "https://igamingapis.com/img/283.png", provider: "jdb" },
        { id: "544", name: "Birds Party Deluxe", img: "https://igamingapis.com/img/544.png", provider: "jdb" },
        { id: "565", name: "Piggy Bank", img: "https://igamingapis.com/img/565.png", provider: "jdb" },
        { id: "981", name: "Happy Lottery", img: "https://igamingapis.com/img/981.png", provider: "jdb" },
        { id: "10040", name: "Aviator Extra Bet", img: "https://igamingapis.com/img/10040.png", provider: "jdb" },
        { id: "1163", name: "100 PokDeng", img: "https://igamingapis.com/img/1163.png", provider: "r88" },
        { id: "1164", name: "100 Teen Patti", img: "https://igamingapis.com/img/1164.png", provider: "r88" },
        { id: "1223", name: "88 Fortunes", img: "https://igamingapis.com/img/1223.png", provider: "r88" },
        { id: "1330", name: "Ancient Giant Elephant", img: "https://igamingapis.com/img/1330.png", provider: "r88" },
        { id: "1425", name: "Battle of Five Carp", img: "https://igamingapis.com/img/142.png", provider: "r88" },
        { id: "1456", name: "Big and Small", img: "https://igamingapis.com/img/1456.png", provider: "r88" },
        { id: "1457", name: "Big and Small 2", img: "https://igamingapis.com/img/1457.png", provider: "r88" },
        { id: "1480", name: "Bingo Football", img: "https://igamingapis.com/img/1480.png", provider: "r88" },
        { id: "1745", name: "Christmas Gift", img: "https://igamingapis.com/img/1745.png", provider: "r88" },
        { id: "1766", name: "Cleopatra", img: "https://igamingapis.com/img/1766.png", provider: "r88" },
        { id: "1776", name: "CockFighting", img: "https://igamingapis.com/img/1776.png", provider: "r88" },
        { id: "1788", name: "Color Dish", img: "https://igamingapis.com/img/1788.png", provider: "r88" },
        { id: "1789", name: "Color Dish 2", img: "https://igamingapis.com/img/1789.png", provider: "r88" },
        { id: "1821", name: "Crazy Rich Man", img: "https://igamingapis.com/img/1821.png", provider: "r88" },
        { id: "1977", name: "Double slot", img: "https://igamingapis.com/img/1977.png", provider: "r88" },
        { id: "74", name: "Mahjong Ways", img: "https://igamingapis.com/img/74.png", provider: "pg" },
        { id: "858", name: "Mahjong Ways 2", img: "https://igamingapis.com/img/858.png", provider: "pg" },
        { id: "649", name: "Fortune Ox", img: "https://igamingapis.com/img/649.png", provider: "pg" },
        { id: "710", name: "Fortune Tiger", img: "https://igamingapis.com/img/710.png", provider: "pg" },
        { id: "654", name: "Fortune Mouse", img: "https://igamingapis.com/img/654.png", provider: "pg" },
        { id: "1031", name: "Fortune Rabbit", img: "https://igamingapis.com/img/1031.png", provider: "pg" },
        { id: "1033", name: "Lucky Neko", img: "https://igamingapis.com/img/1033.png", provider: "pg" },
        { id: "651", name: "Ganesha Gold", img: "https://igamingapis.com/img/651.png", provider: "pg" },
        { id: "898", name: "Ganesha Fortune", img: "https://igamingapis.com/img/898.png", provider: "pg" },
        { id: "172", name: "Candy Burst", img: "https://igamingapis.com/img/172.png", provider: "pg" },
        { id: "870", name: "Candy Bonanza", img: "https://igamingapis.com/img/870.png", provider: "pg" },
        { id: "9", name: "Monster Hunter", img: "https://igamingapis.com/img/9.png", provider: "cq9" },
        { id: "23", name: "Empress Wu", img: "https://igamingapis.com/img/23.png", provider: "cq9" },
        { id: "29", name: "Pyramid Raider", img: "https://igamingapis.com/img/29.png", provider: "cq9" },
        { id: "31", name: "Ninja Raccoon", img: "https://igamingapis.com/img/31.png", provider: "cq9" },
        { id: "41", name: "Da Hong Zhong", img: "https://igamingapis.com/img/41.png", provider: "cq9" },
        { id: "55", name: "OrientalBeauty", img: "https://igamingapis.com/img/55.png", provider: "cq9" },
        { id: "60", name: "WaterWorld", img: "https://igamingapis.com/img/60.png", provider: "cq9" },
        { id: "64", name: "Zeus", img: "https://igamingapis.com/img/64.png", provider: "cq9" },
        { id: "66", name: "Mummy's Treasure", img: "https://igamingapis.com/img/66.png", provider: "cq9" },
        { id: "69", name: "Oo Ga Cha Ka", img: "https://igamingapis.com/img/69.png", provider: "cq9" }
    ],
    lottery: [
        { id: 'india-lotto', name: 'INDIA LOTTO', img: 'https://img.bzvm68.com/site_common/H5_7_mobile/game_logo/lottery/india_lotto.png' },
        { id: 'sea-tcg', name: 'SEA', img: 'https://img.bzvm68.com/site_common/H5_7_mobile/game_logo/lottery/sea_tcgaming.png' },
        { id: 'bbin', name: 'BBIN', img: 'https://img.bzvm68.com/site_common/H5_7_mobile/game_logo/lottery/bbin.png' },
        { id: "237", name: "CQ9 Lottery", img: "https://igamingapis.com/img/237.png" },
        { id: "213", name: "Gold Rooster Lottery", img: "https://igamingapis.com/img/213.png" },
        { id: "981", name: "Happy Lottery", img: "https://igamingapis.com/img/981.png" },
        { id: "2969", name: "Lottery Ticket", img: "https://igamingapis.com/img/2969.png" },
        { id: "2971", name: "Lotto Boom", img: "https://igamingapis.com/img/2971.png" },
        { id: "2972", name: "Lotto Madness", img: "https://igamingapis.com/img/2972.png" },
        { id: "3013", name: "LUCKY LOTTERY", img: "https://igamingapis.com/img/3013.png" },
        { id: "9166", name: "Mania Lotto", img: "https://igamingapis.com/img/9166.png" }
    ],
    cards: []
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
          resetAllToDefaults()
      } else {
          // Merge JILI/Other games from defaults into slots if IDs are missing
          const existingSlotIds = new Set(formatted.slot.map(g => String(g.id)))
          DEFAULTS.slot.forEach(g => {
            if (!existingSlotIds.has(String(g.id))) {
              formatted.slot.push(JSON.parse(JSON.stringify(g)))
            }
          })

          // Merge Lottery games from defaults if IDs are missing
          const existingLotteryIds = new Set(formatted.lottery.map(g => String(g.id)))
          DEFAULTS.lottery.forEach(g => {
            if (!existingLotteryIds.has(String(g.id))) {
              formatted.lottery.push(JSON.parse(JSON.stringify(g)))
            }
          })
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
