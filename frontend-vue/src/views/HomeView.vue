<template>
  <div class="home">
    <!-- Phone-width container (same as Login) -->
    <div class="mobileContainer">
    <!-- Header -->
    <header class="header">
      <router-link to="/" class="logoWrap">
        <img src="https://img.bzvm68.com/logo/gowin11/deltin7_logo_black.png" alt="DELTIN SPORT" class="headerLogo" />
      </router-link>
      <div class="headerActions">
        <template v-if="!auth.isLoggedIn">
          <router-link to="/login" class="btnRegister">
            <img src="https://img.bzvm68.com/site_common/H5_7_mobile/direction.png" alt="" class="btnIcon" />
            <span class="text">Register</span>
          </router-link>
          <router-link to="/login" class="btnLogin">
            <img src="https://img.bzvm68.com/site_common/H5_7_mobile/plus.png" alt="" class="btnIcon" />
            <span class="text">Log-in</span>
          </router-link>
        </template>
        <template v-else>
          <button class="btnLogout" @click="handleLogout" title="Logout">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </template>
      </div>
    </header>

    <!-- Logged in User Widget (Card Style like image) -->
    <div v-if="auth.isLoggedIn" class="homeUserWidget">
      <div class="huTop">
        <div class="huLeft">
          <div class="huWalletLabel">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>
            <span>Wallet balance</span>
          </div>
          <div class="huBalContainer">
             <div class="huBal">₹{{ (userBalance || 0).toFixed(2) }}</div>
             <button class="huRefreshBtn" @click="fetchBalance" title="Refresh Balance">
               <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
             </button>
          </div>
        </div>
        <div class="huRight">
          <router-link to="/withdrawal" class="huBtn huWithdraw">
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg>
             Withdraw
          </router-link>
          <router-link to="/deposit" class="huBtn huDeposit">
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
             Deposit
          </router-link>
        </div>
      </div>
    </div>

    <!-- Slider with overlay text (reference) - swipe to slide -->
    <section
      class="sliderSection"
      @touchstart="onSliderTouchStart"
      @touchend="onSliderTouchEnd"
    >
      <div class="sliderTrack" :style="{ transform: `translateX(-${sliderIndex * 100}%)` }">
        <div v-for="(img, i) in sliderImages" :key="i" class="sliderSlide">
          <div class="sliderOuter">
            <img :src="img" alt="slider" class="sliderImg" />
          </div>
        </div>
      </div>
      <div class="sliderDots">
        <button
          v-for="(_, i) in sliderImages"
          :key="i"
          :class="['sliderDot', { active: sliderIndex === i }]"
          :aria-label="`Slide ${i + 1}`"
          @click="sliderIndex = i"
        />
      </div>
    </section>

    <!-- Announcement bar (reference: label + text) -->
    <div class="announcement">
      <span class="announceLabel">
        <span class="announceIcon">&#128226;</span>
        Announcement
      </span>
      <span class="announceText">{{ noticeText }}</span>
    </div>

    <!-- Game type tabs (reference structure) -->
    <div class="game-type-wrapper">
      <div class="type-wrapper rightSideBlurMask">
        <div class="component-tab-scroll-root">
          <ul class="component-tab-scroll-list">
            <li
              v-for="cat in categories"
              :key="cat.id"
              class="component-tab-scroll-items"
              @click="activeCategory = cat.id"
            >
              <div :class="['type-item', { active: activeCategory === cat.id }]">
                <img :src="activeCategory === cat.id ? (cat.iconActive || cat.icon) : cat.icon" :alt="cat.label" />
                <span>{{ cat.label }}</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Game items: Sports / Live Casino (provider cards) -->
    <div v-if="activeCategory !== 'crash' && activeCategory !== 'slot' && activeCategory !== 'lottery'" class="game-item-box-wrapper">
      <div class="game-item-box">
        <div class="gt-wrapper" :class="{ 'gt-wrapper--live-casino': activeCategory === 'casino' }">
          <a
            v-for="(p, i) in displayProviders"
            :key="p.id"
            href="#"
            :class="['game-item', activeCategory === 'casino' ? 'card-b' : i === 0 ? 'card-b' : 'card-a']"
            :style="{ backgroundImage: `url(${p.bg})` }"
            @click.prevent="onProviderClick(p)"
          >
            <div class="character-bg" :style="{ backgroundImage: `url(${p.character})` }"></div>
            <div class="content">
              <div class="text-content">
                <div class="name">{{ p.name }}</div>
              </div>
              <div class="img-content">
                <img :src="p.logo" :alt="p.name" />
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>

    <!-- Lottery: Indian Lottery style – single column, grey bg, LOTTERY watermark, name + logo left, character right -->
    <div v-else-if="activeCategory === 'lottery'" class="game-item-box-wrapper">
      <div class="game-item-box">
        <div class="gt-wrapper gt-wrapper--lottery">
          <a
            v-for="p in lotteryProvidersList"
            :key="p.id"
            href="#"
            class="game-item game-item--lottery card-b"
            @click.prevent="onProviderClick(p)"
          >
            <div class="character-bg" :style="{ backgroundImage: p.character ? `url(${p.character})` : 'none' }"></div>
            <div class="content">
              <div class="text-content">
                <div class="name">{{ p.name }}</div>
                <div v-if="p.subtitle" class="lottery-subtitle">{{ p.subtitle }}</div>
              </div>
              <div class="img-content">
                <img :src="p.logo" :alt="p.name" />
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>

    <!-- Slot Game: left sidebar (Search, HOT, providers) + search bar + card-f grid -->
    <div v-else-if="activeCategory === 'slot'" class="game-menu-wrapper game-menu-wrapper--slot">
      <div class="type-wrapper type-wrapper--slot">
        <div class="left-type-wrapper">
          <div
            v-for="f in slotFilterItems.filter(i => i.id !== 'search')"
            :key="f.id"
            :class="['gp-type-item', { active: slotFilterActive === f.id }]"
            @click="onSlotFilterClick(f.id)"
          >
            <div class="gp-item-inner">
              <span v-if="f.label && !f.logoHide" class="gp-label">{{ f.label }}</span>
              <img v-if="f.icon" :src="f.icon" :alt="f.label" class="gp-icon" />
              <template v-else>
                <img v-if="slotFilterActive !== f.id && f.logoHide" :src="f.logoHide" alt="" class="gp-publisher-logo grayscale" />
                <img v-if="slotFilterActive === f.id && f.logoShow" :src="f.logoShow" alt="" class="gp-publisher-logo" />
              </template>
            </div>
          </div>
        </div>
        <div class="game-item-box-wrapper">
          <div class="search-bar">
            <div class="icon-container">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </div>
            <input
              ref="searchInputRef"
              v-model="slotSearchQuery"
              type="text"
              class="search-input"
              placeholder="Search game name"
            />
          </div>
            <div class="card-f-wrapper">
            <a
              v-for="g in displaySlotGames"
              :key="g.id"
              href="#"
              class="game-link card-f"
              @click.prevent="onProviderClick(g)"
            >
              <div class="img-container" :style="{ backgroundImage: g.img ? `url(${g.img})` : 'none' }">
                <div>
                  <img class="heart" :src="heartIcon" alt="heart" />
                </div>
                <div v-if="g.isNew" class="new-icon"><span class="new-text">NEW</span></div>
              </div>
              <div class="game-name-box">
                <span>{{ g.name }}</span>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Crash Game: card-f grid -->
    <div v-else class="game-item-box-wrapper">
      <div class="card-f-wrapper">
        <a
          v-for="g in crashGamesList"
          :key="g.id"
          href="#"
          class="game-link card-f"
          :title="getCrashGameName(g)"
          @click.prevent="onProviderClick(g)"
        >
          <div class="img-container" :style="g.img ? { backgroundImage: `url(${g.img})` } : {}">
            <div>
              <img class="heart" :src="heartIcon" alt="heart" />
            </div>
          </div>
          <div class="game-name-box">
            <span>{{ getCrashGameName(g) }}</span>
          </div>
        </a>
      </div>
    </div>
    
    <!-- Game Iframe Modal -->
    <div v-if="iframeUrl" class="game-iframe-modal">
      <div class="iframe-header">
        <button class="iframe-close-btn" @click="closeIframe">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          Back to Home
        </button>
      </div>
      <iframe :src="iframeUrl" frameborder="0" allowfullscreen></iframe>
    </div>

    <!-- Game Loader Overlay -->
    <div v-if="isGameLoading" class="game-loader-overlay">
      <div class="spinner"></div>
      <p>Loading Game...</p>
    </div>

  </div>
</div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import * as api from '../api/home'
import * as walletApi from '../api/wallet'

const router = useRouter()
const auth = useAuthStore()
const userBalance = ref(0)
const iframeUrl = ref(null)
const isGameLoading = ref(false)
const searchInputRef = ref(null)

function onSlotFilterClick(id) {
  slotFilterActive.value = id
  if (id === 'search' && searchInputRef.value) {
    searchInputRef.value.focus()
  }
}

const baseImg = 'https://img.bzvm68.com'
const sliderImages = [
  `${baseImg}/ark_common/arkUpload/carousel/40lKKSxzyxDYdLkC0RgwSG3359EIQIRAGQFe2Rco.jpg`,
  `${baseImg}/ark_common/arkUpload/gowin/prod/carousel/2ructZr9iy3oPmoFlRIL2Gj8vvECW5Dl0tDNChoA.jpg`,
  `${baseImg}/ark_common/arkUpload/gowin/prod/carousel/3D4X5nK36dzsKaWgiap2h2ycVLwWwi73IOnYCR6y.jpg`,
  `${baseImg}/ark_common/arkUpload/carousel/1b0hPBGcTmOOdwxU0gBr6yHtruWGkEUaXYjGC4kh.jpg`,
  `${baseImg}/ark_common/arkUpload/carousel/3BENIeUx7AZyURYyV9XqNwXUZ5NBYFHYbcTXpBRe.jpg`,
]
const sliderIndex = ref(0)
let sliderTimer = null
let sliderTouchStartX = 0
function onSliderTouchStart(e) {
  sliderTouchStartX = e.touches[0].clientX
}
function onSliderTouchEnd(e) {
  const endX = e.changedTouches[0].clientX
  const delta = sliderTouchStartX - endX
  const total = sliderImages.length
  if (delta > 40) {
    sliderIndex.value = (sliderIndex.value + 1) % total
  } else if (delta < -40) {
    sliderIndex.value = (sliderIndex.value - 1 + total) % total
  }
}

const noticeText = ref('Announcement | 13:50 (UTC+5.5) We apologize for any inconvenience.')
const activeCategory = ref(localStorage.getItem('activeCategory') || 'sports')

watch(activeCategory, (newVal) => {
  localStorage.setItem('activeCategory', newVal)
})

const gameCategories = ref({
  sports: [],
  casino: [],
  crash: [],
  slot: [],
  lottery: [],
  cards: []
})

const categories = [
  { id: 'sports', label: 'Sports', icon: `${baseImg}/site_common/H5_7_mobile/game_type_icon/gowin11/4.png`, iconActive: `${baseImg}/site_common/H5_7_mobile/game_type_icon/gowin11/4_active.png` },
  { id: 'casino', label: 'Live Casino', icon: `${baseImg}/site_common/H5_7_mobile/game_type_icon/gowin11/3.png`, iconActive: `${baseImg}/site_common/H5_7_mobile/game_type_icon/gowin11/3.png` },
  { id: 'crash', label: 'Crash Game', icon: `${baseImg}/GoWin11/crash_game_icon/crash.png`, iconActive: `${baseImg}/GoWin11/crash_game_icon/crash.png` },
  { id: 'slot', label: 'Slot Game', icon: `${baseImg}/site_common/H5_7_mobile/game_type_icon/2.png`, iconActive: `${baseImg}/site_common/H5_7_mobile/game_type_icon/2.png` },
  { id: 'lottery', label: 'Lottery', icon: `${baseImg}/site_common/H5_7_mobile/game_type_icon/gowin11/5.png`, iconActive: `${baseImg}/site_common/H5_7_mobile/game_type_icon/gowin11/5.png` },
  { id: 'cards', label: 'Card Game', icon: `${baseImg}/site_common/H5_7_mobile/game_type_icon/gowin11/6.png`, iconActive: `${baseImg}/site_common/H5_7_mobile/game_type_icon/gowin11/6.png` },
  { id: 'cockfight', label: 'Cockfight Live', icon: `${baseImg}/site_common/H5_7_mobile/game_type_icon/8.png`, iconActive: `${baseImg}/site_common/H5_7_mobile/game_type_icon/8.png` },
]

const defaultCardBg = `${baseImg}/site_common/H5_7_mobile/game_item_background/bg-4.png`
const defaultProviders = [
  { id: '9w', name: '9WICKETS', bg: defaultCardBg, character: `${baseImg}/site_common/H5_7_mobile/hall_pics/gowin11/4-GP9W.png`, logo: `${baseImg}/site_common/H5_7_mobile/game_logo/4-GP9W.png` },
  { id: 'lucky', name: 'Lucky Sports', bg: defaultCardBg, character: `${baseImg}/site_common/H5_7_mobile/hall_pics/gowin11/4-GPLS.png`, logo: `${baseImg}/site_common/H5_7_mobile/game_logo/4-GPLS.png` },
  { id: 'saba', name: 'SABA', bg: defaultCardBg, character: `${baseImg}/site_common/H5_7_mobile/hall_pics/gowin11/4-GPOW.png`, logo: `${baseImg}/site_common/H5_7_mobile/game_logo/4-GPOW-en_US.png` },
  { id: 'newbb', name: 'NewBB', bg: defaultCardBg, character: `${baseImg}/site_common/H5_7_mobile/hall_pics/gowin11/4-GPNBB.png`, logo: `${baseImg}/site_common/H5_7_mobile/game_logo/4-GPBB-new bb.png` },
  { id: 'sbo', name: 'SBO', bg: defaultCardBg, character: `${baseImg}/site_common/H5_7_mobile/hall_pics/gowin11/4-GPSB2.png`, logo: `${baseImg}/site_common/H5_7_mobile/game_logo/4-GPSB2.png` },
  { id: 'fb', name: 'FB', bg: defaultCardBg, character: `${baseImg}/site_common/H5_7_mobile/hall_pics/gowin11/4-GPFB.png`, logo: `${baseImg}/site_common/H5_7_mobile/game_logo/4-GPFB-en_US.png` },
]

const gameImgBase = `${baseImg}/game/img2/en-US`
const crashGamesList = computed(() => {
  const list = (gameCategories.value.crash && gameCategories.value.crash.length) 
    ? gameCategories.value.crash 
    : [
        { id: 'av', name: 'Aviator', img: `${gameImgBase}/GPJD/MjJfMjIwMDEjMTczNTAzMjc0OA==.png` },
        { id: 'avx', name: 'AviatorX', img: `${gameImgBase}/GPR8/NV9BdmlhdG9yWCMxNzU2Mjg1Mjg2.png` },
        { id: 'aeb', name: 'Aviator Extra Bet', img: `${gameImgBase}/GPJD/OV85MDIzIzE3NDY3Njk0ODY=.png` },
        { id: 'cd', name: 'Chicken Dash', img: `${gameImgBase}/GPJL/OF82OTAjMTc1ODA5ODc1Ng==.png` },
        { id: 'fd', name: 'Frog Dash', img: `${gameImgBase}/GPJL/OF82OTgjMTc2MjMyODYyNA==.png` },
        { id: 'cb', name: 'Cricket Burst', img: `${gameImgBase}/GPJD/OV85MDIyIzE3MzUwMjcxOTE=.png` },
        { id: 'fb', name: 'Firework Burst', img: `${gameImgBase}/GPJD/OV85MDE1IzE3MzUwMjgyNjI=.png` },
        { id: 'cp', name: 'Crash Puck', img: `${gameImgBase}/GPJL/OF81MTIjMTc1NzU2OTUwNw==.png` },
        { id: 'gr', name: 'Go Rush', img: `${gameImgBase}/GPJL/OF8yMjQjMTY4MjA2MzYzNA==.png` },
        { id: 'ct', name: 'Crash Touchdown', img: `${gameImgBase}/GPJL/OF80NTkjMTc0MDYyNDQ4Ng==.png` },
        { id: 'cc', name: 'Crash Cricket', img: `${gameImgBase}/GPJL/OF80NjkjMTcyMjgzNjE5MA==.png` },
        { id: 'cg', name: 'Crash Goal', img: `${gameImgBase}/GPJL/OF80MDcjMTcxODI2NDgzNQ==.png` },
        { id: 'flyx', name: 'FlyX', img: `${gameImgBase}/GPMG2/Q3Jhc2hfU01HX2ZseVgjMTc1Mzc3MjgxOA==.png` },
        { id: 'avi2', name: 'Aviator', img: `${gameImgBase}/GPYL2/MV84MDQjMTc1NDQ2ODQ2Mg==.png` },
        { id: 'crash', name: 'Crash', img: `${gameImgBase}/GPYL2/MV84MDEjMTcyOTY2Nzc3MQ==.png` },
      ]
  return list.map(g => ({ 
    ...g, 
    img: g.img || g.logo || g.charImageUrl || g.logoUrl || defaultCardBg 
  }))
})
const heartIcon = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#ffffff"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>')

const slotFilterActive = ref(localStorage.getItem('slotFilterActive') || 'hot')
const slotSearchQuery = ref('')

watch(slotFilterActive, (newVal) => {
  localStorage.setItem('slotFilterActive', newVal)
})
const bannerBase = `${baseImg}/game/banner`
const slotFilterItems = computed(() => {
  const dynamic = Array.isArray(gameCategories.value.slotProviders) ? gameCategories.value.slotProviders : []
  return [
    { id: 'search', label: 'Search', icon: `${baseImg}/site_common/H5_7_mobile/game_type_icon/search.png` },
    { id: 'hot', label: 'HOT', icon: `${baseImg}/site_common/H5_8_mobile/game_type_icon/popular.png` },
    ...dynamic
  ]
})
const slotGamesList = computed(() => {
  const list = (gameCategories.value.slot && gameCategories.value.slot.length) 
    ? gameCategories.value.slot 
    : [
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
        { id: "296", "name": "Pool Rummy", "img": "https://igamingapis.com/img/296.png", provider: "jili" },
        { id: "299", "name": "Penalty Kick", "img": "https://igamingapis.com/img/299.png", provider: "jili" },
        { id: "306", "name": "Go For Champion", "img": "https://igamingapis.com/img/306.png", provider: "jili" },
        { id: "315", "name": "Pirate Queen 2", "img": "https://igamingapis.com/img/315.png", provider: "jili" }
      ]
  return list.map(g => ({ 
    ...g, 
    img: g.img || g.logo || g.charImageUrl || g.logoUrl || defaultCardBg 
  }))
})
const displaySlotGames = computed(() => {
  let list = slotGamesList.value
  
  // 1. Filter by provider (Sidebar)
  const active = (slotFilterActive.value || 'hot').toLowerCase()
  if (active !== 'hot' && active !== 'search') {
    list = list.filter(g => {
      const p = (g.provider || g.publisher || g.vendor || '').toLowerCase()
      const gid = (g.id || g.game_id || '').toLowerCase()
      const img = (g.img || '').toLowerCase()
      
      // Match ONLY by the provider field assigned in Admin
      return p === active || p.includes(active)
    })
  }
  
  // 2. Filter by search query
  const q = (slotSearchQuery.value || '').trim().toLowerCase()
  if (q) {
    list = list.filter((g) => g.name.toLowerCase().includes(q))
  }
  
  return list
})

const liveCasinoBg = `${baseImg}/site_common/H5_7_mobile/game_item_background/bg-3.png`
const lotteryBase = `${baseImg}/site_common/H5_7_mobile`
const providers = ref([])

function normalizeProvider(p, index, listType) {
  if (!p) return {}
  const def = defaultProviders[index % defaultProviders.length]
  const casinoDef = liveCasinoProvidersList_Raw[index % liveCasinoProvidersList_Raw.length]
  const lotteryDef = lotteryProvidersList_Raw[index % lotteryProvidersList_Raw.length]
  
  let baseDef = def
  if (listType === 'casino') baseDef = casinoDef
  if (listType === 'lottery') baseDef = lotteryDef

  return {
    id: p.id || p.game_id || p.game_uid || index,
    name: p.name || p.title || 'Game',
    bg: p.bg || baseDef?.bg || defaultCardBg,
    character: p.character || p.img_character || baseDef?.character || '',
    logo: p.logo || p.img || p.image || baseDef?.logo || ''
  }
}

const liveCasinoProvidersList_Raw = [
    { id: 'evo', name: 'EVO', bg: liveCasinoBg, character: `${baseImg}/site_common/H5_7_mobile/hall_pics/gowin11/3-1.png`, logo: `${baseImg}/site_common/H5_7_mobile/game_logo/3-GPEV.png` },
    { id: 'pt', name: 'PT', bg: liveCasinoBg, character: `${baseImg}/site_common/H5_7_mobile/hall_pics/gowin11/3-2.png`, logo: `${baseImg}/site_common/H5_7_mobile/game_logo/3-GPPT3.png` },
    { id: 'ezugi', name: 'Ezugi', bg: liveCasinoBg, character: `${baseImg}/site_common/H5_7_mobile/hall_pics/gowin11/3-3.png`, logo: `${baseImg}/site_common/H5_7_mobile/game_logo/3-GPEZ.png` },
    { id: 'sexy', name: 'SEXY', bg: liveCasinoBg, character: `${baseImg}/site_common/H5_7_mobile/hall_pics/gowin11/3-4.png`, logo: `${baseImg}/site_common/H5_7_mobile/game_logo/3-GPSX2.png` },
    { id: 'ssg', name: 'SSG', bg: liveCasinoBg, character: `${baseImg}/site_common/H5_7_mobile/hall_pics/gowin11/3-5.png`, logo: `${baseImg}/site_common/H5_7_mobile/game_logo/3-GPSS.png` },
    { id: 'mg', name: 'MG', bg: liveCasinoBg, character: `${baseImg}/site_common/H5_7_mobile/hall_pics/gowin11/3-6.png`, logo: `${baseImg}/site_common/H5_7_mobile/game_logo/3-GPMG2.png` },
    { id: 'pa', name: 'PA', bg: liveCasinoBg, character: `${baseImg}/site_common/H5_7_mobile/hall_pics/gowin11/3-7.png`, logo: `${baseImg}/site_common/H5_7_mobile/game_logo/3-GPAG2.png` },
]

const lotteryProvidersList_Raw = [
    { id: 'india-lotto', name: 'INDIA LOTTO', subtitle: '', logo: `${lotteryBase}/game_logo/lottery/india_lotto.png`, character: `${lotteryBase}/hall_pics/lottery/india_lotto_character.png` },
    { id: 'sea-tcg', name: 'SEA', subtitle: 'TCGAMING', logo: `${lotteryBase}/game_logo/lottery/sea_tcgaming.png`, character: `${lotteryBase}/hall_pics/lottery/sea_character.png` },
    { id: 'bbin', name: 'BBIN', subtitle: 'THE GAMING BEAT', logo: `${lotteryBase}/game_logo/lottery/bbin.png`, character: `${lotteryBase}/hall_pics/lottery/bbin_character.png` },
]

const liveCasinoProvidersList = computed(() => {
  const list = (gameCategories.value.casino && gameCategories.value.casino.length) 
    ? gameCategories.value.casino 
    : liveCasinoProvidersList_Raw
  return list.map((p, i) => normalizeProvider(p, i, 'casino'))
})

const lotteryProvidersList = computed(() => {
  const list = (gameCategories.value.lottery && gameCategories.value.lottery.length) 
    ? gameCategories.value.lottery 
    : lotteryProvidersList_Raw
  return list.map((p, i) => normalizeProvider(p, i, 'lottery'))
})

const displayProviders = computed(() => {
  if (activeCategory.value === 'casino') return liveCasinoProvidersList.value
  if (activeCategory.value === 'lottery') return lotteryProvidersList.value
  
  const list = (gameCategories.value[activeCategory.value] && gameCategories.value[activeCategory.value].length)
    ? gameCategories.value[activeCategory.value]
    : (providers.value && providers.value.length ? providers.value : defaultProviders)
    
  return list.slice(0, 6).map((p, i) => normalizeProvider(p, i, activeCategory.value))
})

function getCrashGameName(g) {
  if (!g || typeof g !== 'object') return 'Game'
  const n = g.name
  if (typeof n === 'string' && n.trim()) return n.trim()
  return 'Game'
}

async function onProviderClick(p) {
  if (!auth.isLoggedIn) {
    router.push('/login')
    return
  }
  try {
    const userId = auth.user.id
    const gameId = p.game_id || p.game_uid || p.id
    if (!gameId) {
      alert('Game ID not found')
      return
    }
    
    isGameLoading.value = true // Show loader
    
    const res = await api.launchGame(userId, gameId)
    if (res.data && res.data.success && res.data.url) {
      iframeUrl.value = res.data.url
    } else {
      alert('Failed to launch game: ' + (res.data?.msg || res.data?.message || 'Unknown error'))
    }
  } catch (err) {
    console.error(err)
    alert('Error launching game: ' + (err.response?.data?.message || err.message))
  } finally {
    isGameLoading.value = false // Hide loader
  }
}

function closeIframe() {
  iframeUrl.value = null
  fetchBalance()
}

function handleLogout() {
  auth.logout()
  router.push('/login')
}

onMounted(() => {
  sliderTimer = setInterval(() => {
    sliderIndex.value = (sliderIndex.value + 1) % sliderImages.length
  }, 4000)
})

onUnmounted(() => {
  if (sliderTimer) clearInterval(sliderTimer)
})

async function fetchBalance() {
  if (auth.isLoggedIn && auth.user?.id) {
    try {
      const res = await walletApi.getUserHome(auth.user.id)
      if (res.data && res.data.length > 0) {
        userBalance.value = res.data[0].balance || 0
      }
    } catch (err) {}
  }
}

onMounted(async () => {
  fetchBalance()
  try {
    const [noticeRes, providersRes, homeGamesRes] = await Promise.all([
      api.getNotice().catch(() => ({ data: {} })),
      api.getProviders().catch(() => ({ data: [] })),
      api.getHomeCategoryGames().catch(() => ({ data: {} })),
    ])
    if (noticeRes?.data?.notice) {
      const n = noticeRes.data.notice
      noticeText.value = typeof n === 'string' ? n : `${n.heading || 'Announcement'} | ${n.body || ''}`
    }
    if (homeGamesRes?.data) {
      gameCategories.value = homeGamesRes.data
    }
    if (Array.isArray(providersRes?.data) && providersRes.data.length) {
      providers.value = providersRes.data.map((p, i) => {
        const def = defaultProviders[i % defaultProviders.length]
        return {
          id: p.id || p.name || i,
          name: p.name || p.title || 'Provider',
          bg: p.bg || def?.bg || defaultCardBg,
          character: p.character || p.image || p.img || def?.character,
          logo: p.logo || def?.logo || '',
        }
      })
    }
  } catch (_) {}
})
</script>

<style scoped>
.home {
  width: 100%;
  min-width: 100%;
  background: #f5f5f5;
  color: #1a1a1a;
}

.mobileContainer {
  width: 100%;
  max-width: min(430px, 100vw);
  margin: 0 auto;
  padding: 0 12px 90px;
  padding-left: max(12px, env(safe-area-inset-left));
  padding-right: max(12px, env(safe-area-inset-right));
  padding-bottom: max(90px, env(safe-area-inset-bottom));
  min-height: 100vh;
  box-sizing: border-box;
  background: #fff;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  margin: 0 -12px 0;
  margin-left: calc(-1 * max(12px, env(safe-area-inset-left)));
  margin-right: calc(-1 * max(12px, env(safe-area-inset-right)));
  padding-left: max(12px, env(safe-area-inset-left));
  padding-right: max(12px, env(safe-area-inset-right));
  background: #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  position: sticky;
  top: 0;
  z-index: 10;
}
.logoWrap {
  display: flex;
  align-items: center;
  text-decoration: none;
}
.headerLogo {
  height: 32px;
  width: auto;
  object-fit: contain;
}
.headerActions { display: flex; align-items: center; gap: 8px; }

.btnLogout {
  background: #f43f5e;
  color: white;
  border: none;
  border-radius: 8px;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  box-shadow: 0 2px 4px rgba(244, 63, 94, 0.2);
}
.btnLogout:active {
  transform: scale(0.95);
}

.btnRegister, .btnLogin {
  padding: 8px 16px;
  color: #fff;
  font-size: 0.85rem;
  font-weight: 700;
  text-decoration: none;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.btnRegister { background: #dc2626; }
.btnLogin { background: #2563eb; }
.btnIcon {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

/* Slider: swipe to slide */
.sliderSection {
  position: relative;
  height: 150px;
  margin: 0 0 10px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0,0,0,0.12);
  touch-action: pan-y;
  cursor: grab;
  user-select: none;
}
.sliderSection:active { cursor: grabbing; }
.sliderTrack {
  display: flex;
  height: 100%;
  transition: transform 0.4s ease-out;
}
.sliderSlide {
  flex: 0 0 100%;
  width: 100%;
  height: 100%;
}
.sliderOuter {
  width: 100%;
  height: 100%;
}
.sliderImg {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.sliderDots {
  position: absolute;
  bottom: 10px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 6px;
  z-index: 2;
}
.sliderDot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,0.6);
  cursor: pointer;
  padding: 0;
  transition: background 0.2s;
}
.sliderDot.active {
  background: #fff;
  box-shadow: 0 0 0 1px rgba(0,0,0,0.2);
}

.announcement {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: #f8fafc;
  margin: 0 0 16px;
  border-radius: 10px;
  border: 1px solid #f1f5f9;
  font-size: 0.8rem;
  color: #475569;
}
.announceLabel {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  font-weight: 600;
  color: #334155;
}
.announceIcon { font-size: 1rem; }
.announceText { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }

/* Game type tabs (reference: game-type-wrapper, type-item) */
.game-type-wrapper {
  margin-bottom: 16px;
  overflow: hidden;
}
.type-wrapper {
  overflow: hidden;
}
.type-wrapper.rightSideBlurMask {
  mask-image: linear-gradient(to right, black 0%, black 85%, transparent 100%);
  -webkit-mask-image: linear-gradient(to right, black 0%, black 85%, transparent 100%);
}
.component-tab-scroll-root {
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  scrollbar-width: none;
  padding: 0 0 8px;
}
.component-tab-scroll-root::-webkit-scrollbar { display: none; }
.component-tab-scroll-list {
  display: flex;
  gap: 6px;
  list-style: none;
  margin: 0;
  padding: 0;
  min-width: min-content;
}
.component-tab-scroll-items {
  flex-shrink: 0;
  cursor: pointer;
  scroll-snap-align: start;
  scroll-snap-stop: normal;
}
.type-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 4px 8px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.65rem;
  font-weight: 500;
  color: #666;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}
.type-item::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 3px;
  background: #3b82f6;
  border-radius: 3px 3px 0 0;
  transform: translateX(-50%);
  transition: width 0.3s ease;
}
.type-item img {
  width: 36px;
  height: 36px;
  object-fit: contain;
  margin-bottom: 2px;
  transition: transform 0.2s;
}
.type-item span { white-space: nowrap; transition: color 0.2s; }
.type-item.active {
  background: #eff6ff;
  border-color: #bfdbfe;
  color: #1d4ed8;
  transform: translateY(-2px);
}
.type-item.active::after {
  width: 60%;
}
.type-item.active img {
  transform: scale(1.1);
}

/* Sports / Live Casino game items - reference structure */
.game-item-box-wrapper {
  padding: 0 0 6px;
}
.game-item-box {
  width: 100%;
}
.gt-wrapper {
  display: grid;
  gap: 12px;
}
.gt-wrapper--live-casino {
  grid-template-columns: 1fr;
}
.gt-wrapper--lottery {
  grid-template-columns: 1fr;
  gap: 12px;
}
.game-item--lottery {
  background-color: #e5e7eb;
  background-image: none;
  min-height: 120px;
}
.game-item--lottery::after {
  content: 'LOTTERY';
  position: absolute;
  right: 8%;
  top: 50%;
  transform: translateY(-50%);
  font-size: clamp(2rem, 8vw, 3.5rem);
  font-weight: 800;
  letter-spacing: 0.05em;
  color: rgba(0, 0, 0, 0.06);
  pointer-events: none;
  z-index: 0;
}
.game-item--lottery .character-bg {
  z-index: 1;
  background-size: contain;
  background-position: right center;
}
.game-item--lottery .content {
  z-index: 2;
}
.game-item--lottery .lottery-subtitle {
  font-size: 0.8rem;
  font-weight: 600;
  color: #475569;
  margin: 0 0 6px;
}
.game-item--lottery .img-content img {
  max-width: 100px;
  max-height: 44px;
  object-fit: contain;
}
.game-item {
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  text-decoration: none;
  color: #1a1a1a;
  overflow: hidden;
  position: relative;
  display: block;
  min-height: 100px;
}
.game-item.card-b {
  grid-column: span 2;
  min-height: 120px;
}
.gt-wrapper--live-casino .game-item.card-b {
  grid-column: auto;
}
.gt-wrapper--lottery .game-item.card-b {
  grid-column: auto;
}
.game-item.card-a {
  min-height: 100px;
}
.character-bg {
  position: absolute;
  inset: 0;
  background-size: contain;
  background-position: right center;
  background-repeat: no-repeat;
  pointer-events: none;
}
.game-item .content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  padding: 12px 14px;
  height: 100%;
  min-height: 100px;
}
.game-item.card-b .content { min-height: 120px; }
.game-item .text-content {
  flex: 0 0 auto;
}
.game-item .name {
  font-size: 1rem;
  font-weight: 800;
  color: #1a1a1a;
  margin: 0 0 6px;
}
.game-item .img-content {
  flex: 0 0 auto;
  margin-top: auto; /* Push to bottom if needed, or give it space */
}
.game-item .img-content img {
  max-width: 100px;
  max-height: 48px;
  object-fit: contain;
}
.game-item.card-b .name { font-size: 1.1rem; }
.game-item.card-b .img-content img { max-width: 120px; max-height: 56px; }

/* Slot Game: left sidebar + search + card-f grid (reference game-menu-wrapper) */
.game-menu-wrapper--slot {
  padding: 0 0 20px;
}
.type-wrapper--slot {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}
.left-type-wrapper {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 70vh;
  overflow-y: auto;
  padding: 4px 0;
  scrollbar-width: none;
}
.left-type-wrapper::-webkit-scrollbar { display: none; }
.gp-type-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px 8px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 56px;
}
.gp-item-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  width: 100%;
}
.gp-label {
  font-size: 0.7rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}
.gp-publisher-logo {
  width: 34px;
  height: 34px;
  object-fit: contain;
  transition: all 0.3s ease;
}
.gp-publisher-logo.grayscale {
  filter: grayscale(1) opacity(0.5);
}
.gp-type-item .gp-icon {
  width: 32px;
  height: 32px;
  object-fit: contain;
}
.gp-type-item.active {
  background: #eff6ff;
  border-color: #3b82f6;
  color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.12);
}
.gp-type-item.active .gp-label {
  color: #2563eb;
}
.game-menu-wrapper--slot .game-item-box-wrapper {
  flex: 1;
  min-width: 0;
  padding-top: 4px;
}
.gt-wrapper--slot {
  display: block;
}
.game-menu-wrapper--slot .search-bar {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  background: #fff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  margin-bottom: 16px;
  transition: all 0.2s ease;
  height: 44px;
}
.game-menu-wrapper--slot .search-bar:focus-within {
  border-color: #3b82f6;
  background: #fff;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}
.game-menu-wrapper--slot .icon-container {
  flex-shrink: 0;
  color: #64748b;
  display: flex;
  align-items: center;
  transition: color 0.2s;
}
.game-menu-wrapper--slot .search-bar:focus-within .icon-container {
  color: #3b82f6;
}
.game-menu-wrapper--slot .icon-container svg {
  width: 18px;
  height: 18px;
  display: block;
}
.game-menu-wrapper--slot .search-input {
  flex: 1;
  min-width: 0;
  border: none;
  background: transparent;
  font-size: 0.9rem;
  font-weight: 500;
  color: #0f172a;
  outline: none;
  padding: 4px 0;
}
.game-menu-wrapper--slot .search-input::placeholder {
  color: #cbd5e1;
}
.gt-wrapper--slot .card-f-wrapper {
  margin-top: 0;
}
.game-link.card-f .new-icon {
  position: absolute;
  top: 6px;
  left: 6px;
  z-index: 2;
}
.game-link.card-f .new-text {
  display: inline-block;
  padding: 2px 6px;
  background: #f59e0b;
  color: #fff;
  font-size: 0.6rem;
  font-weight: 800;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* Crash Game: card-f grid – 4 columns, compact like reference */
.card-f-wrapper {
  margin-top: 10px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  padding: 0 0 6px;
}
.game-link.card-f {
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: #f1f5f9;
  border-radius: 8px;
  overflow: hidden;
  text-decoration: none;
  color: #1a1a1a;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.game-link.card-f:active {
  transform: scale(0.96);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
.game-link.card-f .img-container {
  width: 100%;
  aspect-ratio: 1;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  border-radius: 8px 8px 0 0;
}
.game-link.card-f .img-container > div:first-child {
  position: absolute;
  top: 4px;
  right: 4px;
  z-index: 2;
  width: 20px;
  height: 20px;
  background: rgba(239, 68, 68, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}
.game-link.card-f .heart {
  width: 12px;
  height: 12px;
  display: block;
  object-fit: contain;
  filter: none;
}
.game-link.card-f .game-name-box {
  padding: 2px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.game-link.card-f .game-name-box span {
  font-size: 0.65rem;
  font-weight: 500;
  color: #334155;
  text-align: center;
  width: 100%;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
  height: 1.6rem;
}

.navIconImg {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.homeUserWidget {
  background: transparent;
  margin: 10px 0 15px;
  padding: 0;
  color: white;
}

.huTop {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.huLeft {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.huWalletLabel {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #666;
}

.huBalContainer {
  display: flex;
  align-items: center;
  gap: 8px;
}

.huBal {
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: #1a1a1a;
}

.huRefreshBtn {
  background: none;
  border: none;
  color: #1a1a1a;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
}
.huRefreshBtn:active {
  transform: rotate(180deg);
  transition: transform 0.3s ease;
}

.huRight {
  display: flex;
  gap: 8px;
}

.huBtn {
  text-decoration: none;
  font-size: 13px;
  font-weight: 700;
  padding: 8px 12px;
  border-radius: 6px;
  text-align: center;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-width: 80px;
  transition: all 0.2s;
  box-shadow: inset 0 -3px 0 rgba(0,0,0,0.2);
}

.huWithdraw {
  background: linear-gradient(180deg, #fdba74 0%, #f97316 100%);
  color: white;
}
.huWithdraw:active {
  transform: translateY(2px);
  box-shadow: inset 0 -1px 0 rgba(0,0,0,0.2);
}

.huDeposit {
  background: linear-gradient(180deg, #fb7185 0%, #e11d48 100%);
  color: white;
}
.huDeposit:active {
  transform: translateY(2px);
  box-shadow: inset 0 -1px 0 rgba(0,0,0,0.2);
}

.game-iframe-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  background: #000;
  z-index: 999999;
  display: flex;
  flex-direction: column;
}

.iframe-header {
  height: 44px;
  background: #111;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid #333;
}

.iframe-close-btn {
  background: transparent;
  border: none;
  color: #fff;
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 0;
}

.game-iframe-modal iframe {
  flex: 1;
  width: 100%;
  border: none;
  background: #000;
}

.game-loader-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(5px);
  z-index: 9999999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.game-loader-overlay .spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.2);
  border-top-color: #05c0b8;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

.game-loader-overlay p {
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  margin: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
